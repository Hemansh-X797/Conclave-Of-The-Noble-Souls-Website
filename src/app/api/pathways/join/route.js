// ============================================================================
// JOIN PATHWAY API
// Assign pathway role to user via Discord bot
// Location: /src/app/api/pathways/join/route.js
// ============================================================================

import { NextResponse } from 'next/server';
import { getPathwayById } from '@/data';

export async function POST(request) {
  try {
    const { pathwayId } = await request.json();

    // Validate pathway ID
    const pathway = getPathwayById(pathwayId);
    if (!pathway) {
      return NextResponse.json(
        { error: 'Invalid pathway ID' },
        { status: 400 }
      );
    }

    // TODO: Get user from session/auth
    // For now, return error asking for authentication
    const userId = null; // Replace with actual auth check

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Assign role via Discord bot
    const botToken = process.env.DISCORD_BOT_TOKEN;
    const guildId = process.env.DISCORD_GUILD_ID;

    const response = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members/${userId}/roles/${pathway.roleId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bot ${botToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to assign role' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      pathway: pathway.name,
      message: `Successfully joined ${pathway.name}!`
    });

  } catch (error) {
    console.error('Join pathway error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}