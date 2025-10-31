// ============================================================================
// DISCORD OAUTH URL API
// Get Discord OAuth authorization URL
// Location: /src/app/api/auth/discord/url/route.js
// ============================================================================

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const clientId = process.env.DISCORD_CLIENT_ID;
    const redirectUri = process.env.DISCORD_REDIRECT_URI;

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'identify guilds guilds.members.read email'
    });

    const authUrl = `https://discord.com/api/oauth2/authorize?${params.toString()}`;

    return NextResponse.json({ url: authUrl });

  } catch (error) {
    console.error('Get OAuth URL error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}