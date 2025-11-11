// ============================================================================
// DISCORD AUTO-INVITE API
// Location: /src/app/api/discord/auto-invite/route.js
// Generates Discord server invite links
// @route POST
// ============================================================================

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;
const DISCORD_INVITE_LINK = process.env.DISCORD_INVITE_LINK;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse session token
 */
function parseSessionToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
}

/**
 * Get default invite channel ID
 */
async function getDefaultInviteChannel() {
  try {
    // Get all channels
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/channels`,
      {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`
        }
      }
    );

    if (!response.ok) {
      return null;
    }

    const channels = await response.json();

    // Find a suitable channel (prefer 'general' or first text channel)
    const generalChannel = channels.find(c => 
      c.type === 0 && c.name.toLowerCase().includes('general')
    );

    if (generalChannel) {
      return generalChannel.id;
    }

    // Fallback to first text channel
    const textChannel = channels.find(c => c.type === 0);
    return textChannel?.id || null;

  } catch (error) {
    console.error('Failed to get default channel:', error);
    return null;
  }
}

/**
 * Create Discord invite
 */
async function createDiscordInvite(channelId, options = {}) {
  const inviteData = {
    max_age: options.maxAge || 86400, // Default 24 hours
    max_uses: options.maxUses || 0, // 0 = unlimited
    temporary: options.temporary || false,
    unique: options.unique !== false // Default true
  };

  const response = await fetch(
    `https://discord.com/api/v10/channels/${channelId}/invites`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(inviteData)
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create invite: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Log invite creation
 */
async function logInviteCreation(invite, userId, username) {
  try {
    await supabase.from('discord_sync_log').insert({
      event_type: 'invite_created',
      status: 'success',
      details: {
        inviteCode: invite.code,
        createdBy: username,
        userId: userId,
        maxAge: invite.max_age,
        maxUses: invite.max_uses
      },
      synced_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log invite creation:', error);
  }
}

// ============================================================================
// POST HANDLER - Create New Invite
// ============================================================================
export async function POST(request) {
  try {
    // Check if bot token is configured
    if (!DISCORD_BOT_TOKEN) {
      // Return permanent invite link if available
      if (DISCORD_INVITE_LINK) {
        return NextResponse.json({
          success: true,
          invite: {
            url: DISCORD_INVITE_LINK,
            code: DISCORD_INVITE_LINK.split('/').pop(),
            permanent: true
          }
        });
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Discord bot not configured'
        },
        { status: 503 }
      );
    }

    // Get session token (optional for invite creation)
    const sessionToken = request.cookies.get('conclave_session')?.value;
    let sessionData = null;

    if (sessionToken) {
      sessionData = parseSessionToken(sessionToken);
    }

    // Parse request body
    const body = await request.json().catch(() => ({}));
    const {
      channelId,
      maxAge = 86400, // 24 hours
      maxUses = 0, // Unlimited
      temporary = false
    } = body;

    // Get channel ID
    let targetChannelId = channelId;
    if (!targetChannelId) {
      targetChannelId = await getDefaultInviteChannel();
    }

    if (!targetChannelId) {
      return NextResponse.json(
        {
          success: false,
          error: 'No suitable channel found for invite creation'
        },
        { status: 400 }
      );
    }

    // Create invite
    const invite = await createDiscordInvite(targetChannelId, {
      maxAge,
      maxUses,
      temporary
    });

    // Log invite creation
    if (sessionData) {
      await logInviteCreation(
        invite,
        sessionData.userId,
        sessionData.username
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Invite created successfully',
      invite: {
        code: invite.code,
        url: `https://discord.gg/${invite.code}`,
        channelId: invite.channel.id,
        channelName: invite.channel.name,
        expiresAt: invite.expires_at,
        maxUses: invite.max_uses,
        uses: invite.uses,
        temporary: invite.temporary,
        createdAt: invite.created_at
      }
    });

  } catch (error) {
    console.error('Create invite error:', error);

    // Fallback to permanent invite if available
    if (DISCORD_INVITE_LINK) {
      return NextResponse.json({
        success: true,
        invite: {
          url: DISCORD_INVITE_LINK,
          code: DISCORD_INVITE_LINK.split('/').pop(),
          permanent: true
        },
        fallback: true
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create invite',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Service unavailable'
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET HANDLER - Get Default Invite
// ============================================================================
export async function GET(request) {
  try {
    // Return permanent invite link if available
    if (DISCORD_INVITE_LINK) {
      return NextResponse.json({
        success: true,
        invite: {
          url: DISCORD_INVITE_LINK,
          code: DISCORD_INVITE_LINK.split('/').pop(),
          permanent: true
        }
      });
    }

    // Check if bot token is configured
    if (!DISCORD_BOT_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          error: 'No invite available. Please contact server administrators.'
        },
        { status: 503 }
      );
    }

    // Get default channel
    const channelId = await getDefaultInviteChannel();

    if (!channelId) {
      return NextResponse.json(
        {
          success: false,
          error: 'No suitable channel found'
        },
        { status: 400 }
      );
    }

    // Create temporary invite (24 hours)
    const invite = await createDiscordInvite(channelId, {
      maxAge: 86400,
      maxUses: 0,
      temporary: false
    });

    return NextResponse.json({
      success: true,
      invite: {
        code: invite.code,
        url: `https://discord.gg/${invite.code}`,
        expiresAt: invite.expires_at,
        temporary: false
      }
    });

  } catch (error) {
    console.error('Get invite error:', error);

    // Last resort fallback
    if (DISCORD_INVITE_LINK) {
      return NextResponse.json({
        success: true,
        invite: {
          url: DISCORD_INVITE_LINK,
          code: DISCORD_INVITE_LINK.split('/').pop(),
          permanent: true
        },
        fallback: true
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get invite',
        message: 'Please contact server administrators for an invite link'
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE HANDLER - Revoke Invite
// ============================================================================
export async function DELETE(request) {
  try {
    // Check if bot token is configured
    if (!DISCORD_BOT_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          error: 'Discord bot not configured'
        },
        { status: 503 }
      );
    }

    // Get session token
    const sessionToken = request.cookies.get('conclave_session')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required'
        },
        { status: 401 }
      );
    }

    // Parse session
    const sessionData = parseSessionToken(sessionToken);

    if (!sessionData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid session'
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { inviteCode } = body;

    if (!inviteCode) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invite code is required'
        },
        { status: 400 }
      );
    }

    // Revoke invite
    const response = await fetch(
      `https://discord.com/api/v10/invites/${inviteCode}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to revoke invite: ${response.status}`);
    }

    // Log invite revocation
    await supabase.from('discord_sync_log').insert({
      event_type: 'invite_revoked',
      status: 'success',
      details: {
        inviteCode: inviteCode,
        revokedBy: sessionData.username,
        userId: sessionData.userId
      },
      synced_at: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Invite revoked successfully',
      inviteCode: inviteCode
    });

  } catch (error) {
    console.error('Revoke invite error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to revoke invite',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Service unavailable'
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// OPTIONS HANDLER (CORS)
// ============================================================================
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_SITE_URL || '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}