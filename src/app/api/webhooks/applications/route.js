// ============================================================================
// STAFF APPLICATIONS WEBHOOK - Send to Discord
// Location: /src/app/api/webhooks/applications/route.js
// Sends staff application submissions to Discord channel
// ============================================================================

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const rateLimitStore = new Map();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 30 * 60 * 1000; // 30 minutes
  const maxRequests = 2; // Only 2 applications per 30 minutes per IP

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

function createApplicationEmbed(data) {
  const positionColors = {
    moderator: 0x50C878, // Green
    administrator: 0xE0115F, // Red
    'head-mod': 0x00BFFF, // Blue
    'head-admin': 0x9966CC, // Purple
    other: 0xFFD700 // Gold
  };

  const color = positionColors[data.position?.toLowerCase()] || positionColors.other;

  return {
    embeds: [{
      title: '👔 New Staff Application',
      color: color,
      thumbnail: {
        url: data.discordAvatar || 'https://your-domain.com/Assets/Images/CNS_logo1.png'
      },
      fields: [
        {
          name: '👤 Applicant Name',
          value: data.name || 'Not provided',
          inline: true
        },
        {
          name: '📧 Email',
          value: data.email || 'Not provided',
          inline: true
        },
        {
          name: '💬 Discord',
          value: data.discord || 'Not provided',
          inline: true
        },
        {
          name: '🎯 Position Applied For',
          value: data.position || 'Not specified',
          inline: false
        },
        {
          name: '📅 Age',
          value: data.age || 'Not provided',
          inline: true
        },
        {
          name: '🌍 Timezone',
          value: data.timezone || 'Not provided',
          inline: true
        },
        {
          name: '⏰ Availability (hours/week)',
          value: data.availability || 'Not provided',
          inline: true
        },
        {
          name: '🎓 Experience',
          value: data.experience?.substring(0, 500) || 'Not provided',
          inline: false
        },
        {
          name: '💡 Why Join Our Team?',
          value: data.motivation?.substring(0, 500) || 'Not provided',
          inline: false
        },
        {
          name: '🔧 Relevant Skills',
          value: data.skills?.substring(0, 300) || 'Not provided',
          inline: false
        },
        {
          name: '📊 Application ID',
          value: `\`${data.applicationId || 'N/A'}\``,
          inline: true
        },
        {
          name: '🕐 Submitted',
          value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
          inline: true
        }
      ],
      footer: {
        text: 'Staff Application System | The Conclave Realm',
        icon_url: 'https://your-domain.com/Assets/Images/CNS_logo1.png'
      },
      timestamp: new Date().toISOString()
    }],
    content: `@here **New ${data.position || 'Staff'} Application Received!**`
  };
}

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
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  throw new Error('Max retries exceeded');
}

async function logToDatabase(data, status, error = null) {
  try {
    await supabase.from('discord_sync_log').insert({
      event_type: 'staff_application',
      status: status,
      details: {
        name: data.name,
        position: data.position,
        discord: data.discord
      },
      error_message: error,
      synced_at: new Date().toISOString()
    });
  } catch (dbError) {
    console.error('Database logging failed:', dbError);
  }
}

function validateApplicationData(data) {
  const errors = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Valid email is required');
  }

  if (!data.discord || data.discord.trim().length < 3) {
    errors.push('Discord username is required');
  }

  if (!data.position || !['moderator', 'administrator', 'head-mod', 'head-admin', 'other'].includes(data.position.toLowerCase())) {
    errors.push('Valid position is required');
  }

  if (!data.age || isNaN(data.age) || parseInt(data.age) < 16) {
    errors.push('Must be at least 16 years old');
  }

  if (!data.experience || data.experience.trim().length < 50) {
    errors.push('Experience description must be at least 50 characters');
  }

  if (!data.motivation || data.motivation.trim().length < 50) {
    errors.push('Motivation description must be at least 50 characters');
  }

  return errors;
}

function sanitizeInput(text) {
  if (!text) return '';
  return text
    .replace(/[<>]/g, '')
    .replace(/[@everyone|@here]/gi, '')
    .trim();
}

function generateApplicationId() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `APP-${timestamp}-${randomStr}`.toUpperCase();
}

// ============================================================================
// POST HANDLER
// ============================================================================
export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Stricter rate limit for applications
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'You can only submit 2 applications per 30 minutes. Please try again later.',
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

    const data = await request.json();

    // Generate application ID
    const applicationId = generateApplicationId();

    // Sanitize inputs
    const sanitizedData = {
      applicationId,
      name: sanitizeInput(data.name),
      email: sanitizeInput(data.email),
      discord: sanitizeInput(data.discord),
      position: sanitizeInput(data.position),
      age: data.age,
      timezone: sanitizeInput(data.timezone),
      availability: sanitizeInput(data.availability),
      experience: sanitizeInput(data.experience),
      motivation: sanitizeInput(data.motivation),
      skills: sanitizeInput(data.skills),
      discordAvatar: data.discordAvatar
    };

    // Validate data
    const validationErrors = validateApplicationData(sanitizedData);
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
    const webhookUrl = process.env.DISCORD_WEBHOOK_APPLICATIONS;

    if (!webhookUrl) {
      console.error('DISCORD_WEBHOOK_APPLICATIONS not configured');
      await logToDatabase(sanitizedData, 'failed', 'Webhook URL not configured');
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Application system is temporarily unavailable. Please try again later.'
        },
        { status: 503 }
      );
    }

    // Create Discord embed
    const embed = createApplicationEmbed(sanitizedData);

    // Send to Discord
    const webhookResult = await sendToDiscord(webhookUrl, embed);

    // Log success to database
    await logToDatabase(sanitizedData, 'success');

    // Store in database for admin review
    try {
      await supabase.from('staff_applications').insert({
        application_id: applicationId,
        name: sanitizedData.name,
        email: sanitizedData.email,
        discord_username: sanitizedData.discord,
        position: sanitizedData.position,
        age: parseInt(sanitizedData.age),
        timezone: sanitizedData.timezone,
        availability: sanitizedData.availability,
        experience: sanitizedData.experience,
        motivation: sanitizedData.motivation,
        skills: sanitizedData.skills,
        ip_address: ip,
        status: 'pending',
        submitted_at: new Date().toISOString()
      });
    } catch (dbError) {
      console.error('Failed to store application:', dbError);
    }

    return NextResponse.json({
      success: true,
      message: 'Your application has been submitted successfully! We will review it and respond within 3-5 business days.',
      applicationId: applicationId,
      attempt: webhookResult.attempt
    });

  } catch (error) {
    console.error('Application webhook error:', error);

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
    service: 'Staff Applications Webhook',
    timestamp: new Date().toISOString(),
    configured: !!process.env.DISCORD_WEBHOOK_APPLICATIONS
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