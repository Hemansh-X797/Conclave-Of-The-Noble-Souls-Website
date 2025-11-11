// ============================================================================
// DISCORD INCOMING WEBHOOK - Receive Events from Discord Bot
// Location: /src/app/api/webhooks/discord/route.js
// Receives Discord events (member joins, role updates, etc.) from Discord bot
// ============================================================================

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHmac, timingSafeEqual } from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ============================================================================
// SECURITY - Signature Verification
// ============================================================================

/**
 * Verify Discord webhook signature
 * Uses bot token as secret for HMAC verification
 */
function verifySignature(body, signature, timestamp) {
  try {
    const secret = process.env.DISCORD_BOT_TOKEN;
    if (!secret) {
      console.error('DISCORD_BOT_TOKEN not configured');
      return false;
    }

    // Create HMAC signature
    const hmac = createHmac('sha256', secret);
    hmac.update(`${timestamp}${body}`);
    const expectedSignature = hmac.digest('hex');

    // Timing-safe comparison
    const signatureBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (signatureBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Check if request is from Discord (IP allowlist)
 */
function isFromDiscord(ip) {
  // Discord's IP ranges (update as needed)
  const discordIpRanges = [
    '162.159.128.0/20',
    '162.159.144.0/20',
    '162.159.160.0/20',
    '162.159.176.0/20'
  ];

  // For development, allow localhost
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  // In production, implement proper IP range checking
  // This is simplified; use a proper IP range checker in production
  return true;
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Handle member join event
 */
async function handleMemberJoin(data) {
  try {
    const { user, guild_id, joined_at } = data;

    // Log to database
    await supabase.from('discord_sync_log').insert({
      event_type: 'member_join',
      status: 'success',
      details: {
        userId: user.id,
        username: user.username,
        discriminator: user.discriminator,
        guildId: guild_id
      },
      synced_at: new Date().toISOString()
    });

    // Update or create user profile
    const { error: upsertError } = await supabase
      .from('user_profiles')
      .upsert({
        discord_id: user.id,
        username: user.username,
        discriminator: user.discriminator,
        avatar_url: user.avatar 
          ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
          : null,
        joined_at: joined_at,
        updated_at: new Date().toISOString()
      }, { onConflict: 'discord_id' });

    if (upsertError) {
      console.error('Failed to upsert user profile:', upsertError);
    }

    // Update server stats
    await updateServerStats('member_join');

    return { success: true, event: 'member_join' };
  } catch (error) {
    console.error('Member join handler error:', error);
    throw error;
  }
}

/**
 * Handle member leave event
 */
async function handleMemberLeave(data) {
  try {
    const { user, guild_id } = data;

    // Log to database
    await supabase.from('discord_sync_log').insert({
      event_type: 'member_leave',
      status: 'success',
      details: {
        userId: user.id,
        username: user.username,
        guildId: guild_id
      },
      synced_at: new Date().toISOString()
    });

    // Update user profile (mark as left)
    await supabase
      .from('user_profiles')
      .update({
        left_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('discord_id', user.id);

    // Update server stats
    await updateServerStats('member_leave');

    return { success: true, event: 'member_leave' };
  } catch (error) {
    console.error('Member leave handler error:', error);
    throw error;
  }
}

/**
 * Handle role update event
 */
async function handleRoleUpdate(data) {
  try {
    const { user, guild_id, roles } = data;

    // Log to database
    await supabase.from('discord_sync_log').insert({
      event_type: 'role_update',
      status: 'success',
      details: {
        userId: user.id,
        username: user.username,
        roles: roles,
        guildId: guild_id
      },
      synced_at: new Date().toISOString()
    });

    // Update user roles
    await supabase
      .from('user_profiles')
      .update({
        roles: roles,
        updated_at: new Date().toISOString()
      })
      .eq('discord_id', user.id);

    return { success: true, event: 'role_update' };
  } catch (error) {
    console.error('Role update handler error:', error);
    throw error;
  }
}

/**
 * Handle server boost event
 */
async function handleServerBoost(data) {
  try {
    const { user, guild_id, boost_count } = data;

    // Log to database
    await supabase.from('discord_sync_log').insert({
      event_type: 'server_boost',
      status: 'success',
      details: {
        userId: user.id,
        username: user.username,
        boostCount: boost_count,
        guildId: guild_id
      },
      synced_at: new Date().toISOString()
    });

    // Update server stats
    await supabase
      .from('server_stats')
      .update({
        booster_count: boost_count,
        updated_at: new Date().toISOString()
      })
      .eq('guild_id', guild_id);

    return { success: true, event: 'server_boost' };
  } catch (error) {
    console.error('Server boost handler error:', error);
    throw error;
  }
}

/**
 * Handle moderation action event
 */
async function handleModerationAction(data) {
  try {
    const { action, user, moderator, reason, guild_id, duration } = data;

    // Log to moderation logs table
    await supabase.from('moderation_logs').insert({
      action_type: action,
      target_user_id: user.id,
      target_username: user.username,
      moderator_id: moderator.id,
      moderator_username: moderator.username,
      reason: reason,
      duration: duration,
      guild_id: guild_id,
      created_at: new Date().toISOString()
    });

    // Also log to sync log
    await supabase.from('discord_sync_log').insert({
      event_type: 'moderation_action',
      status: 'success',
      details: {
        action: action,
        targetUser: user.username,
        moderator: moderator.username,
        reason: reason
      },
      synced_at: new Date().toISOString()
    });

    return { success: true, event: 'moderation_action' };
  } catch (error) {
    console.error('Moderation action handler error:', error);
    throw error;
  }
}

/**
 * Update server statistics
 */
async function updateServerStats(eventType) {
  try {
    const guildId = process.env.DISCORD_GUILD_ID;

    // Get current stats
    const { data: currentStats } = await supabase
      .from('server_stats')
      .select('*')
      .eq('guild_id', guildId)
      .single();

    if (!currentStats) {
      // Create initial stats entry
      await supabase.from('server_stats').insert({
        guild_id: guildId,
        member_count: eventType === 'member_join' ? 1 : 0,
        online_count: 0,
        event_count: 0,
        booster_count: 0,
        updated_at: new Date().toISOString()
      });
      return;
    }

    // Update member count based on event
    let newMemberCount = currentStats.member_count;
    if (eventType === 'member_join') {
      newMemberCount += 1;
    } else if (eventType === 'member_leave') {
      newMemberCount = Math.max(0, newMemberCount - 1);
    }

    await supabase
      .from('server_stats')
      .update({
        member_count: newMemberCount,
        updated_at: new Date().toISOString()
      })
      .eq('guild_id', guildId);

  } catch (error) {
    console.error('Update server stats error:', error);
  }
}

// ============================================================================
// POST HANDLER
// ============================================================================
export async function POST(request) {
  try {
    // Get request headers
    const signature = request.headers.get('x-signature');
    const timestamp = request.headers.get('x-timestamp');
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Check if request is from Discord
    if (!isFromDiscord(ip)) {
      console.warn('Request not from Discord IP:', ip);
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get raw body for signature verification
    const body = await request.text();
    const data = JSON.parse(body);

    // Verify signature (if provided)
    if (signature && timestamp) {
      if (!verifySignature(body, signature, timestamp)) {
        console.warn('Invalid signature from:', ip);
        return NextResponse.json(
          { success: false, error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    // Check timestamp to prevent replay attacks (5 minute window)
    if (timestamp) {
      const requestTime = parseInt(timestamp);
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;

      if (Math.abs(now - requestTime) > fiveMinutes) {
        console.warn('Request timestamp too old:', timestamp);
        return NextResponse.json(
          { success: false, error: 'Request expired' },
          { status: 401 }
        );
      }
    }

    // Route to appropriate handler based on event type
    let result;
    switch (data.event_type) {
      case 'member_join':
        result = await handleMemberJoin(data);
        break;
      
      case 'member_leave':
        result = await handleMemberLeave(data);
        break;
      
      case 'role_update':
        result = await handleRoleUpdate(data);
        break;
      
      case 'server_boost':
        result = await handleServerBoost(data);
        break;
      
      case 'moderation_action':
        result = await handleModerationAction(data);
        break;
      
      default:
        console.log('Unknown event type:', data.event_type);
        
        // Log unknown events
        await supabase.from('discord_sync_log').insert({
          event_type: data.event_type || 'unknown',
          status: 'unknown_event',
          details: data,
          synced_at: new Date().toISOString()
        });

        return NextResponse.json({
          success: true,
          message: 'Event received but not handled',
          event: data.event_type
        });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Discord webhook error:', error);

    // Log error to database
    try {
      await supabase.from('discord_sync_log').insert({
        event_type: 'error',
        status: 'failed',
        details: { error: error.message },
        error_message: error.message,
        synced_at: new Date().toISOString()
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET HANDLER (Health Check)
// ============================================================================
export async function GET() {
  try {
    // Check if Discord bot token is configured
    const configured = !!process.env.DISCORD_BOT_TOKEN;

    // Get recent sync logs
    const { data: recentLogs } = await supabase
      .from('discord_sync_log')
      .select('event_type, status, synced_at')
      .order('synced_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      status: 'operational',
      service: 'Discord Incoming Webhook',
      timestamp: new Date().toISOString(),
      configured: configured,
      recentEvents: recentLogs?.length || 0,
      lastSync: recentLogs?.[0]?.synced_at || null
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      service: 'Discord Incoming Webhook',
      error: error.message
    }, { status: 500 });
  }
}

// ============================================================================
// OPTIONS HANDLER (CORS)
// ============================================================================
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*', // Discord webhooks
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Signature, X-Timestamp',
    },
  });
}