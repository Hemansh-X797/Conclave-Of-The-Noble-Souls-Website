// ============================================================================
// CONTACT FORM WEBHOOK - Send to Discord
// Location: /src/app/api/webhooks/contact/route.js
// Sends contact form submissions to Discord channel
// ============================================================================

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Rate limiting store (in-memory, consider Redis for production)
const rateLimitStore = new Map();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Rate limiter - 5 requests per IP per 15 minutes
 */
function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 5;

  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, []);
  }

  const requests = rateLimitStore.get(ip);
  const recentRequests = requests.filter(time => now - time < windowMs);

  if (recentRequests.length >= maxRequests) {
    return {
      allowed: false,
      retryAfter: Math.ceil((recentRequests[0] + windowMs - now) / 1000)
    };
  }

  recentRequests.push(now);
  rateLimitStore.set(ip, recentRequests);

  return { allowed: true };
}

/**
 * Create rich Discord embed
 */
function createContactEmbed(data) {
  const timestamp = new Date().toISOString();

  return {
    embeds: [{
      title: '📬 New Contact Form Submission',
      color: 0xFFD700, // Gold
      fields: [
        {
          name: '👤 Name',
          value: data.name || 'Not provided',
          inline: true
        },
        {
          name: '📧 Email',
          value: data.email || 'Not provided',
          inline: true
        },
        {
          name: '📱 Discord Username',
          value: data.discord || 'Not provided',
          inline: true
        },
        {
          name: '📋 Subject',
          value: data.subject || 'General Inquiry',
          inline: false
        },
        {
          name: '💬 Message',
          value: data.message?.substring(0, 1000) || 'No message',
          inline: false
        },
        {
          name: '🌐 Source',
          value: data.source || 'Website Contact Form',
          inline: true
        },
        {
          name: '🕐 Submitted',
          value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
          inline: true
        }
      ],
      footer: {
        text: 'Contact Form System | The Conclave Realm',
        icon_url: 'https://your-domain.com/Assets/Images/CNS_logo1.png'
      },
      timestamp: timestamp
    }]
  };
}

/**
 * Send webhook to Discord with retry logic
 */
async function sendToDiscord(webhookUrl, payload, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        return { success: true, attempt };
      }

      if (response.status === 429) {
        // Rate limited by Discord
        const retryAfter = parseInt(response.headers.get('retry-after')) || 1000;
        await new Promise(resolve => setTimeout(resolve, retryAfter));
        continue;
      }

      const errorText = await response.text();
      throw new Error(`Discord webhook failed: ${response.status} - ${errorText}`);

    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  throw new Error('Max retries exceeded');
}

/**
 * Log to database
 */
async function logToDatabase(data, status, error = null) {
  try {
    await supabase.from('discord_sync_log').insert({
      event_type: 'contact_form',
      status: status,
      details: {
        name: data.name,
        email: data.email,
        subject: data.subject,
        messageLength: data.message?.length || 0
      },
      error_message: error,
      synced_at: new Date().toISOString()
    });
  } catch (dbError) {
    console.error('Database logging failed:', dbError);
  }
}

/**
 * Validate contact form data
 */
function validateContactData(data) {
  const errors = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Valid email is required');
  }

  if (!data.message || data.message.trim().length < 10) {
    errors.push('Message must be at least 10 characters');
  }

  if (data.message && data.message.length > 2000) {
    errors.push('Message must be less than 2000 characters');
  }

  return errors;
}

/**
 * Sanitize input to prevent injection
 */
function sanitizeInput(text) {
  if (!text) return '';
  return text
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/[@everyone|@here]/gi, '') // Remove Discord mentions
    .trim();
}

// ============================================================================
// POST HANDLER
// ============================================================================
export async function POST(request) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Check rate limit
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many requests. Please try again later.',
          retryAfter: rateLimit.retryAfter
        },
        { 
          status: 429,
          headers: {
            'Retry-After': rateLimit.retryAfter.toString()
          }
        }
      );
    }

    // Parse request body
    const data = await request.json();

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeInput(data.name),
      email: sanitizeInput(data.email),
      discord: sanitizeInput(data.discord),
      subject: sanitizeInput(data.subject),
      message: sanitizeInput(data.message),
      source: 'Website Contact Form'
    };

    // Validate data
    const validationErrors = validateContactData(sanitizedData);
    if (validationErrors.length > 0) {
      await logToDatabase(sanitizedData, 'validation_failed', validationErrors.join(', '));
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: validationErrors
        },
        { status: 400 }
      );
    }

    // Get webhook URL
    const webhookUrl = process.env.DISCORD_WEBHOOK_CONTACT;

    if (!webhookUrl) {
      console.error('DISCORD_WEBHOOK_CONTACT not configured');
      await logToDatabase(sanitizedData, 'failed', 'Webhook URL not configured');
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Contact form is temporarily unavailable. Please try again later.'
        },
        { status: 503 }
      );
    }

    // Create Discord embed
    const embed = createContactEmbed(sanitizedData);

    // Send to Discord
    const webhookResult = await sendToDiscord(webhookUrl, embed);

    // Log success to database
    await logToDatabase(sanitizedData, 'success');

    // Store in database for admin review
    try {
      await supabase.from('contact_submissions').insert({
        name: sanitizedData.name,
        email: sanitizedData.email,
        discord_username: sanitizedData.discord,
        subject: sanitizedData.subject,
        message: sanitizedData.message,
        ip_address: ip,
        status: 'pending',
        submitted_at: new Date().toISOString()
      });
    } catch (dbError) {
      console.error('Failed to store contact submission:', dbError);
      // Don't fail the request if DB insert fails
    }

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully! We will respond within 24-48 hours.',
      attempt: webhookResult.attempt
    });

  } catch (error) {
    console.error('Contact webhook error:', error);

    // Log error to database
    try {
      await logToDatabase({}, 'error', error.message);
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'An unexpected error occurred. Please try again or contact us directly on Discord.'
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET HANDLER (Health Check)
// ============================================================================
export async function GET() {
  return NextResponse.json({
    status: 'operational',
    service: 'Contact Form Webhook',
    timestamp: new Date().toISOString(),
    configured: !!process.env.DISCORD_WEBHOOK_CONTACT
  });
}

// ============================================================================
// OPTIONS HANDLER (CORS)
// ============================================================================
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_SITE_URL || '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}