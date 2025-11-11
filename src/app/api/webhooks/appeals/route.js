// ============================================================================
// APPEALS WEBHOOK - Send to Discord
// Location: /src/app/api/webhooks/appeals/route.js
// Sends unban/unmute/unwarn appeals to Discord channel
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
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxRequests = 3; // 3 appeals per hour per IP

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

function createAppealEmbed(data) {
  const appealTypeColors = {
    ban: 0xFF0000, // Red
    mute: 0xFFA500, // Orange
    warn: 0xFFFF00, // Yellow
    timeout: 0xFF8C00, // Dark Orange
    other: 0x808080 // Gray
  };

  const color = appealTypeColors[data.appealType?.toLowerCase()] || appealTypeColors.other;

  const appealTypeEmojis = {
    ban: '🔨',
    mute: '🔇',
    warn: '⚠️',
    timeout: '⏰',
    other: '📋'
  };

  const emoji = appealTypeEmojis[data.appealType?.toLowerCase()] || appealTypeEmojis.other;

  return {
    embeds: [{
      title: `${emoji} New ${data.appealType?.toUpperCase() || 'PUNISHMENT'} Appeal`,
      color: color,
      fields: [
        {
          name: '👤 Username',
          value: data.username || 'Not provided',
          inline: true
        },
        {
          name: '💬 Discord',
          value: data.discord || 'Not provided',
          inline: true
        },
        {
          name: '📧 Email',
          value: data.email || 'Not provided',
          inline: true
        },
        {
          name: '⚖️ Appeal Type',
          value: data.appealType?.toUpperCase() || 'Not specified',
          inline: true
        },
        {
          name: '📅 Punishment Date',
          value: data.punishmentDate || 'Not provided',
          inline: true
        },
        {
          name: '👮 Moderator',
          value: data.moderator || 'Unknown',
          inline: true
        },
        {
          name: '📝 Original Reason',
          value: data.originalReason?.substring(0, 500) || 'Not provided',
          inline: false
        },
        {
          name: '🗣️ Your Statement',
          value: data.statement?.substring(0, 800) || 'Not provided',
          inline: false
        },
        {
          name: '💭 Why Should We Reconsider?',
          value: data.reason?.substring(0, 800) || 'Not provided',
          inline: false
        },
        {
          name: '🔄 Will This Happen Again?',
          value: data.preventionPlan?.substring(0, 500) || 'Not provided',
          inline: false
        },
        {
          name: '📊 Appeal ID',
          value: `\`${data.appealId || 'N/A'}\``,
          inline: true
        },
        {
          name: '🕐 Submitted',
          value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
          inline: true
        }
      ],
      footer: {
        text: 'Appeal System | The Conclave Realm',
        icon_url: 'https://your-domain.com/Assets/Images/CNS_logo1.png'
      },
      timestamp: new Date().toISOString()
    }],
    content: `@here **New ${data.appealType?.toUpperCase() || 'PUNISHMENT'} Appeal Submitted!**`
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
      event_type: 'appeal',
      status: status,
      details: {
        username: data.username,
        appealType: data.appealType,
        discord: data.discord
      },
      error_message: error,
      synced_at: new Date().toISOString()
    });
  } catch (dbError) {
    console.error('Database logging failed:', dbError);
  }
}

function validateAppealData(data) {
  const errors = [];

  if (!data.username || data.username.trim().length < 2) {
    errors.push('Username must be at least 2 characters');
  }

  if (!data.discord || data.discord.trim().length < 3) {
    errors.push('Discord username is required');
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Valid email is required');
  }

  if (!data.appealType || !['ban', 'mute', 'warn', 'timeout', 'other'].includes(data.appealType.toLowerCase())) {
    errors.push('Valid appeal type is required');
  }

  if (!data.statement || data.statement.trim().length < 50) {
    errors.push('Statement must be at least 50 characters');
  }

  if (!data.reason || data.reason.trim().length < 50) {
    errors.push('Reason must be at least 50 characters');
  }

  if (!data.preventionPlan || data.preventionPlan.trim().length < 30) {
    errors.push('Prevention plan must be at least 30 characters');
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

function generateAppealId() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `APL-${timestamp}-${randomStr}`.toUpperCase();
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
          error: 'You can only submit 3 appeals per hour. Please try again later.',
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

    const appealId = generateAppealId();

    const sanitizedData = {
      appealId,
      username: sanitizeInput(data.username),
      discord: sanitizeInput(data.discord),
      email: sanitizeInput(data.email),
      appealType: sanitizeInput(data.appealType),
      punishmentDate: sanitizeInput(data.punishmentDate),
      moderator: sanitizeInput(data.moderator),
      originalReason: sanitizeInput(data.originalReason),
      statement: sanitizeInput(data.statement),
      reason: sanitizeInput(data.reason),
      preventionPlan: sanitizeInput(data.preventionPlan)
    };

    const validationErrors = validateAppealData(sanitizedData);
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

    const webhookUrl = process.env.DISCORD_WEBHOOK_APPEALS;

    if (!webhookUrl) {
      console.error('DISCORD_WEBHOOK_APPEALS not configured');
      await logToDatabase(sanitizedData, 'failed', 'Webhook URL not configured');
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Appeal system is temporarily unavailable. Please try again later.'
        },
        { status: 503 }
      );
    }

    const embed = createAppealEmbed(sanitizedData);

    const webhookResult = await sendToDiscord(webhookUrl, embed);

    await logToDatabase(sanitizedData, 'success');

    try {
      await supabase.from('appeals').insert({
        appeal_id: appealId,
        username: sanitizedData.username,
        discord_username: sanitizedData.discord,
        email: sanitizedData.email,
        appeal_type: sanitizedData.appealType,
        punishment_date: sanitizedData.punishmentDate,
        moderator: sanitizedData.moderator,
        original_reason: sanitizedData.originalReason,
        statement: sanitizedData.statement,
        reason: sanitizedData.reason,
        prevention_plan: sanitizedData.preventionPlan,
        ip_address: ip,
        status: 'pending',
        submitted_at: new Date().toISOString()
      });
    } catch (dbError) {
      console.error('Failed to store appeal:', dbError);
    }

    return NextResponse.json({
      success: true,
      message: 'Your appeal has been submitted successfully! Our moderation team will review it within 48 hours.',
      appealId: appealId,
      attempt: webhookResult.attempt
    });

  } catch (error) {
    console.error('Appeal webhook error:', error);

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
    service: 'Appeals Webhook',
    timestamp: new Date().toISOString(),
    configured: !!process.env.DISCORD_WEBHOOK_APPEALS
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