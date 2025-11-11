// ============================================================================
// COMPLAINTS WEBHOOK - Send to Discord
// Location: /src/app/api/webhooks/complaints/route.js
// Sends member reports/complaints to Discord moderation channel
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
  const maxRequests = 5; // 5 complaints per 30 minutes per IP

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

function createComplaintEmbed(data) {
  const severityColors = {
    low: 0xFFFF00, // Yellow
    medium: 0xFFA500, // Orange
    high: 0xFF0000, // Red
    critical: 0x8B0000 // Dark Red
  };

  const color = severityColors[data.severity?.toLowerCase()] || severityColors.medium;

  const severityEmojis = {
    low: '⚠️',
    medium: '🔶',
    high: '🔴',
    critical: '🚨'
  };

  const emoji = severityEmojis[data.severity?.toLowerCase()] || severityEmojis.medium;

  return {
    embeds: [{
      title: `${emoji} New Member Complaint`,
      color: color,
      fields: [
        {
          name: '👤 Reporter',
          value: data.reporter || 'Anonymous',
          inline: true
        },
        {
          name: '📧 Reporter Email',
          value: data.reporterEmail || 'Not provided',
          inline: true
        },
        {
          name: '🎯 Reported User',
          value: data.reportedUser || 'Not specified',
          inline: true
        },
        {
          name: '⚖️ Severity',
          value: data.severity?.toUpperCase() || 'MEDIUM',
          inline: true
        },
        {
          name: '📋 Category',
          value: data.category || 'General',
          inline: true
        },
        {
          name: '📅 Incident Date',
          value: data.incidentDate || 'Not provided',
          inline: true
        },
        {
          name: '📍 Where Did This Happen?',
          value: data.location || 'Not specified',
          inline: false
        },
        {
          name: '📝 Description',
          value: data.description?.substring(0, 800) || 'Not provided',
          inline: false
        },
        {
          name: '🔗 Evidence/Links',
          value: data.evidence?.substring(0, 500) || 'No evidence provided',
          inline: false
        },
        {
          name: '👥 Witnesses',
          value: data.witnesses || 'None mentioned',
          inline: false
        },
        {
          name: '🔄 Previous Reports?',
          value: data.previousReports ? 'Yes' : 'No',
          inline: true
        },
        {
          name: '⚡ Immediate Action Needed?',
          value: data.urgent ? 'YES - URGENT' : 'No',
          inline: true
        },
        {
          name: '📊 Complaint ID',
          value: `\`${data.complaintId || 'N/A'}\``,
          inline: true
        },
        {
          name: '🕐 Submitted',
          value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
          inline: true
        }
      ],
      footer: {
        text: 'Complaint System | The Conclave Realm',
        icon_url: 'https://your-domain.com/Assets/Images/CNS_logo1.png'
      },
      timestamp: new Date().toISOString()
    }],
    content: data.urgent 
      ? `@here **🚨 URGENT COMPLAINT - Immediate Attention Required!**` 
      : `**New ${data.severity?.toUpperCase() || 'MEDIUM'} Severity Complaint Received**`
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
      event_type: 'complaint',
      status: status,
      details: {
        reporter: data.reporter,
        reportedUser: data.reportedUser,
        severity: data.severity,
        urgent: data.urgent
      },
      error_message: error,
      synced_at: new Date().toISOString()
    });
  } catch (dbError) {
    console.error('Database logging failed:', dbError);
  }
}

function validateComplaintData(data) {
  const errors = [];

  if (!data.reportedUser || data.reportedUser.trim().length < 2) {
    errors.push('Reported user must be specified');
  }

  if (!data.description || data.description.trim().length < 50) {
    errors.push('Description must be at least 50 characters');
  }

  if (!data.severity || !['low', 'medium', 'high', 'critical'].includes(data.severity.toLowerCase())) {
    errors.push('Valid severity level is required');
  }

  if (!data.category || data.category.trim().length < 3) {
    errors.push('Category is required');
  }

  if (data.reporterEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.reporterEmail)) {
    errors.push('Valid email format required if provided');
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

function generateComplaintId() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `CPL-${timestamp}-${randomStr}`.toUpperCase();
}

// ============================================================================
// POST HANDLER
// ============================================================================
export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'You can only submit 5 complaints per 30 minutes. Please try again later.',
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

    const complaintId = generateComplaintId();

    const sanitizedData = {
      complaintId,
      reporter: sanitizeInput(data.reporter) || 'Anonymous',
      reporterEmail: sanitizeInput(data.reporterEmail),
      reportedUser: sanitizeInput(data.reportedUser),
      severity: sanitizeInput(data.severity),
      category: sanitizeInput(data.category),
      incidentDate: sanitizeInput(data.incidentDate),
      location: sanitizeInput(data.location),
      description: sanitizeInput(data.description),
      evidence: sanitizeInput(data.evidence),
      witnesses: sanitizeInput(data.witnesses),
      previousReports: data.previousReports === true,
      urgent: data.urgent === true
    };

    const validationErrors = validateComplaintData(sanitizedData);
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

    const webhookUrl = process.env.DISCORD_WEBHOOK_COMPLAINTS;

    if (!webhookUrl) {
      console.error('DISCORD_WEBHOOK_COMPLAINTS not configured');
      await logToDatabase(sanitizedData, 'failed', 'Webhook URL not configured');
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Complaint system is temporarily unavailable. Please try again later.'
        },
        { status: 503 }
      );
    }

    const embed = createComplaintEmbed(sanitizedData);

    const webhookResult = await sendToDiscord(webhookUrl, embed);

    await logToDatabase(sanitizedData, 'success');

    try {
      await supabase.from('complaints').insert({
        complaint_id: complaintId,
        reporter: sanitizedData.reporter,
        reporter_email: sanitizedData.reporterEmail,
        reported_user: sanitizedData.reportedUser,
        severity: sanitizedData.severity,
        category: sanitizedData.category,
        incident_date: sanitizedData.incidentDate,
        location: sanitizedData.location,
        description: sanitizedData.description,
        evidence: sanitizedData.evidence,
        witnesses: sanitizedData.witnesses,
        previous_reports: sanitizedData.previousReports,
        urgent: sanitizedData.urgent,
        ip_address: ip,
        status: 'pending',
        submitted_at: new Date().toISOString()
      });
    } catch (dbError) {
      console.error('Failed to store complaint:', dbError);
    }

    return NextResponse.json({
      success: true,
      message: 'Your complaint has been submitted successfully! Our moderation team will investigate within 24 hours.',
      complaintId: complaintId,
      urgent: sanitizedData.urgent,
      attempt: webhookResult.attempt
    });

  } catch (error) {
    console.error('Complaint webhook error:', error);

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
    service: 'Complaints Webhook',
    timestamp: new Date().toISOString(),
    configured: !!process.env.DISCORD_WEBHOOK_COMPLAINTS
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