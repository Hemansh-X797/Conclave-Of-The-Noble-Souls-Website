// ============================================================================
// CONTENT SUBMISSIONS WEBHOOK - Send to Discord
// Location: /src/app/api/webhooks/submissions/route.js
// Sends content submissions to Discord for staff approval
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
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 10; // 10 submissions per 15 minutes per IP

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

function createSubmissionEmbed(data) {
  const contentTypeColors = {
    article: 0x00BFFF, // Blue
    tutorial: 0x50C878, // Green
    event: 0xFFD700, // Gold
    announcement: 0xFF1493, // Pink
    media: 0x9966CC, // Purple
    other: 0xE0115F // Red
  };

  const color = contentTypeColors[data.contentType?.toLowerCase()] || contentTypeColors.other;

  const contentTypeEmojis = {
    article: '📰',
    tutorial: '📚',
    event: '🎉',
    announcement: '📢',
    media: '🎨',
    other: '📝'
  };

  const emoji = contentTypeEmojis[data.contentType?.toLowerCase()] || contentTypeEmojis.other;

  const pathwayEmojis = {
    gaming: '🎮',
    lorebound: '🌙',
    productive: '💼',
    news: '📰',
    general: '⚜️'
  };

  const pathwayEmoji = pathwayEmojis[data.pathway?.toLowerCase()] || pathwayEmojis.general;

  return {
    embeds: [{
      title: `${emoji} New Content Submission`,
      color: color,
      thumbnail: data.thumbnailUrl ? {
        url: data.thumbnailUrl
      } : undefined,
      fields: [
        {
          name: '👤 Submitted By',
          value: data.author || 'Anonymous',
          inline: true
        },
        {
          name: '💬 Discord',
          value: data.authorDiscord || 'Not provided',
          inline: true
        },
        {
          name: `${pathwayEmoji} Pathway`,
          value: data.pathway?.toUpperCase() || 'GENERAL',
          inline: true
        },
        {
          name: '📋 Content Type',
          value: data.contentType?.toUpperCase() || 'OTHER',
          inline: true
        },
        {
          name: '🏷️ Tags',
          value: data.tags?.join(', ') || 'None',
          inline: true
        },
        {
          name: '📅 Publish Date (if approved)',
          value: data.publishDate || 'Immediate',
          inline: true
        },
        {
          name: '📰 Title',
          value: data.title?.substring(0, 250) || 'Untitled',
          inline: false
        },
        {
          name: '📝 Description',
          value: data.description?.substring(0, 500) || 'No description',
          inline: false
        },
        {
          name: '📄 Content Preview',
          value: data.content?.substring(0, 800) || 'No content',
          inline: false
        },
        {
          name: '🔗 External Links',
          value: data.links?.substring(0, 300) || 'None',
          inline: false
        },
        {
          name: '📊 Submission ID',
          value: `\`${data.submissionId || 'N/A'}\``,
          inline: true
        },
        {
          name: '🕐 Submitted',
          value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
          inline: true
        }
      ],
      footer: {
        text: 'Content Submission System | The Conclave Realm',
        icon_url: 'https://your-domain.com/Assets/Images/CNS_logo1.png'
      },
      timestamp: new Date().toISOString()
    }],
    content: `**New ${data.contentType?.toUpperCase() || 'CONTENT'} submission for ${data.pathway?.toUpperCase() || 'GENERAL'} pathway!**`
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
      event_type: 'content_submission',
      status: status,
      details: {
        author: data.author,
        contentType: data.contentType,
        pathway: data.pathway,
        title: data.title
      },
      error_message: error,
      synced_at: new Date().toISOString()
    });
  } catch (dbError) {
    console.error('Database logging failed:', dbError);
  }
}

function validateSubmissionData(data) {
  const errors = [];

  if (!data.author || data.author.trim().length < 2) {
    errors.push('Author name must be at least 2 characters');
  }

  if (!data.title || data.title.trim().length < 5) {
    errors.push('Title must be at least 5 characters');
  }

  if (data.title && data.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }

  if (!data.description || data.description.trim().length < 20) {
    errors.push('Description must be at least 20 characters');
  }

  if (!data.content || data.content.trim().length < 50) {
    errors.push('Content must be at least 50 characters');
  }

  if (!data.contentType || !['article', 'tutorial', 'event', 'announcement', 'media', 'other'].includes(data.contentType.toLowerCase())) {
    errors.push('Valid content type is required');
  }

  if (!data.pathway || !['gaming', 'lorebound', 'productive', 'news', 'general'].includes(data.pathway.toLowerCase())) {
    errors.push('Valid pathway is required');
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

function generateSubmissionId() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `SUB-${timestamp}-${randomStr}`.toUpperCase();
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
          error: 'You can only submit 10 pieces of content per 15 minutes. Please try again later.',
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

    const submissionId = generateSubmissionId();

    const sanitizedData = {
      submissionId,
      author: sanitizeInput(data.author),
      authorDiscord: sanitizeInput(data.authorDiscord),
      title: sanitizeInput(data.title),
      description: sanitizeInput(data.description),
      content: sanitizeInput(data.content),
      contentType: sanitizeInput(data.contentType),
      pathway: sanitizeInput(data.pathway),
      tags: Array.isArray(data.tags) ? data.tags.map(tag => sanitizeInput(tag)) : [],
      links: sanitizeInput(data.links),
      thumbnailUrl: data.thumbnailUrl,
      publishDate: sanitizeInput(data.publishDate)
    };

    const validationErrors = validateSubmissionData(sanitizedData);
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

    const webhookUrl = process.env.DISCORD_WEBHOOK_SUBMISSIONS;

    if (!webhookUrl) {
      console.error('DISCORD_WEBHOOK_SUBMISSIONS not configured');
      await logToDatabase(sanitizedData, 'failed', 'Webhook URL not configured');
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Submission system is temporarily unavailable. Please try again later.'
        },
        { status: 503 }
      );
    }

    const embed = createSubmissionEmbed(sanitizedData);

    const webhookResult = await sendToDiscord(webhookUrl, embed);

    await logToDatabase(sanitizedData, 'success');

    try {
      const { data: contentData, error: contentError } = await supabase.from('content').insert({
        submission_id: submissionId,
        author: sanitizedData.author,
        author_discord: sanitizedData.authorDiscord,
        title: sanitizedData.title,
        description: sanitizedData.description,
        content: sanitizedData.content,
        content_type: sanitizedData.contentType,
        pathway: sanitizedData.pathway,
        tags: sanitizedData.tags,
        external_links: sanitizedData.links,
        thumbnail_url: sanitizedData.thumbnailUrl,
        publish_date: sanitizedData.publishDate,
        status: 'pending_approval',
        submitted_at: new Date().toISOString()
      }).select();

      if (contentError) {
        console.error('Failed to store content submission:', contentError);
      }

      return NextResponse.json({
        success: true,
        message: 'Your content has been submitted successfully! Staff will review it within 24-48 hours.',
        submissionId: submissionId,
        contentId: contentData?.[0]?.id,
        attempt: webhookResult.attempt
      });

    } catch (dbError) {
      console.error('Failed to store content:', dbError);
      
      return NextResponse.json({
        success: true,
        message: 'Your content has been submitted to Discord successfully!',
        submissionId: submissionId,
        attempt: webhookResult.attempt
      });
    }

  } catch (error) {
    console.error('Submission webhook error:', error);

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
    service: 'Content Submissions Webhook',
    timestamp: new Date().toISOString(),
    configured: !!process.env.DISCORD_WEBHOOK_SUBMISSIONS
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