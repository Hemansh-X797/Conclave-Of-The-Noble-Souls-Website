/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DISCORD MEMBERSHIP VERIFICATION API - THE CONCLAVE REALM
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Verifies if a user is a member of The Conclave Discord server.
 * Used by MemberVerify component.
 * 
 * @route POST /api/discord/verify-membership
 */

import { NextResponse } from 'next/server';

const DISCORD_CONFIG = {
  botToken: process.env.DISCORD_BOT_TOKEN,
  guildId: process.env.DISCORD_GUILD_ID,
};

const DISCORD_API = {
  guildMemberUrl: (guildId, userId) => 
    `https://discord.com/api/v10/guilds/${guildId}/members/${userId}`,
};

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

    // Fetch member data from Discord API
    const response = await fetch(
      DISCORD_API.guildMemberUrl(targetGuildId, userId),
      {
        headers: {
          Authorization: `Bot ${DISCORD_CONFIG.botToken}`,
        },
      }
    );

    if (response.ok) {
      const memberData = await response.json();
      
      return NextResponse.json({
        isMember: true,
        roles: memberData.roles || [],
        joinedAt: memberData.joined_at,
        nick: memberData.nick,
        avatar: memberData.avatar,
        user: memberData.user,
      });
    }

    // Not a member or error
    if (response.status === 404) {
      return NextResponse.json({
        isMember: false,
        roles: [],
      });
    }

    throw new Error(`Discord API error: ${response.statusText}`);

  } catch (error) {
    console.error('Membership verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Verification failed' },
      { status: 500 }
    );
  }
}