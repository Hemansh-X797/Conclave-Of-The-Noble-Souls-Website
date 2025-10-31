// ============================================================================
// GET CURRENT USER API
// Get current authenticated user's data
// Location: /src/app/api/auth/user/route.js
// ============================================================================

import { NextResponse } from 'next/server';
import { transformDiscordUser } from '@/types/user';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Fetch user from Discord
    const userResponse = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!userResponse.ok) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const discordUser = await userResponse.json();

    // Check server membership
    const guildId = process.env.DISCORD_GUILD_ID;
    const botToken = process.env.DISCORD_BOT_TOKEN;
    
    const memberResponse = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members/${discordUser.id}`,
      {
        headers: {
          Authorization: `Bot ${botToken}`
        }
      }
    );

    const inServer = memberResponse.ok;
    const memberData = inServer ? await memberResponse.json() : null;
    const roles = memberData?.roles || [];

    // Transform to app user format
    const user = transformDiscordUser(discordUser, roles, inServer);

    return NextResponse.json(user);

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}