/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DISCORD AUTO-INVITE API - THE CONCLAVE REALM
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Automatically adds users to The Conclave Discord server using bot token.
 * Requires guilds.join OAuth scope from user.
 * 
 * @route POST /api/discord/auto-invite
 */

import { NextResponse } from 'next/server';

const DISCORD_CONFIG = {
  botToken: process.env.DISCORD_BOT_TOKEN,
  guildId: process.env.DISCORD_GUILD_ID,
};

const DISCORD_API = {
  addGuildMemberUrl: (guildId, userId) =>
    `https://discord.com/api/v10/guilds/${guildId}/members/${userId}`,
};

/**
 * Get session from cookies
 */
function getSessionFromCookies(request) {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  const cookies = Object.fromEntries(
    cookieHeader.split('; ').map(c => {
      const [key, ...v] = c.split('=');
      return [key, v.join('=')];
    })
  );
}

/**
 * Get session from cookies
 */
function getSessionFromCookies(request) {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  const cookies = Object.fromEntries(
    cookieHeader.split('; ').map(c => {
      const [key, ...v] = c.split('=');
      return [key, v.join('=')];
    })
  );

  try {
    return JSON.parse(decodeURIComponent(cookies.conclave_session || 'null'));
  } catch {
    return null;
  }
}

export async function POST(request) {
  try {
    const { userId, guildId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    const targetGuildId = guildId || DISCORD_CONFIG.guildId;

    if (!DISCORD_CONFIG.botToken) {
      return NextResponse.json(
        { error: 'Bot token not configured' },
        { status: 500 }
      );
    }

    // Get user's access token from session
    const session = getSessionFromCookies(request);
    
    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: 'No valid session found' },
        { status: 401 }
      );
    }

    // Add member to guild using bot
    const response = await fetch(
      DISCORD_API.addGuildMemberUrl(targetGuildId, userId),
      {
        method: 'PUT',
        headers: {
          Authorization: `Bot ${DISCORD_CONFIG.botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: session.accessToken,
        }),
      }
    );

    if (response.ok || response.status === 204) {
      return NextResponse.json({
        success: true,
        message: 'Successfully added to server',
      });
    }

    // User might already be a member
    if (response.status === 204) {
      return NextResponse.json({
        success: true,
        alreadyMember: true,
        message: 'User is already a member',
      });
    }

    const error = await response.json().catch(() => ({}));
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to add member',
        code: error.code,
      },
      { status: response.status }
    );

  } catch (error) {
    console.error('Auto-invite error:', error);
    return NextResponse.json(
      { error: error.message || 'Auto-invite failed' },
      { status: 500 }
    );
  }
}
