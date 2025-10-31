// ============================================================================
// DISCORD OAUTH CALLBACK API
// Handle Discord OAuth callback and exchange code for tokens
// Location: /src/app/api/auth/discord/callback/route.js
// ============================================================================

import { NextResponse } from 'next/server';
import { transformDiscordUser } from '@/types/user';

export async function POST(request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code required' },
        { status: 400 }
      );
    }

    const clientId = process.env.DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;
    const redirectUri = process.env.DISCORD_REDIRECT_URI;

    // Exchange code for tokens
    const tokenResponse = await fetch('https://discord.com/api/v10/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri
      })
    });

    if (!tokenResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to exchange code' },
        { status: 401 }
      );
    }

    const tokens = await tokenResponse.json();

    // Fetch user data
    const userResponse = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`
      }
    });

    if (!userResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      );
    }

    const discordUser = await userResponse.json();

    // Check if user is in guild
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

    return NextResponse.json({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
      tokenType: tokens.token_type,
      user
    });

  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}