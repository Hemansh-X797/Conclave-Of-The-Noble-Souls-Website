// ============================================================================
// VALIDATE TOKEN API
// Validate user's access token
// Location: /src/app/api/auth/validate/route.js
// ============================================================================

import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // TODO: Validate token with Discord API
    const response = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const discordUser = await response.json();

    // TODO: Fetch user roles from your database or Discord guild
    const userData = {
      id: discordUser.id,
      username: discordUser.username,
      discriminator: discordUser.discriminator,
      avatar: discordUser.avatar,
      email: discordUser.email,
      roles: [], // TODO: Fetch from database or Discord
      inServer: false // TODO: Verify membership
    };

    return NextResponse.json(userData);

  } catch (error) {
    console.error('Validate token error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}