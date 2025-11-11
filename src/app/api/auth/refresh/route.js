// ============================================================================
// REFRESH SESSION API
// Location: /src/app/api/auth/refresh/route.js
// Refreshes Discord access token and user session
// ============================================================================

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;

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
 * Refresh Discord access token using refresh token
 */
async function refreshDiscordToken(refreshToken) {
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    client_secret: DISCORD_CLIENT_SECRET,
    grant_type: 'refresh_token',
    refresh_token: refreshToken
  });

  const response = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token refresh failed: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Get fresh Discord user data
 */
async function getDiscordUser(accessToken) {
  const response = await fetch('https://discord.com/api/users/@me', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to get user: ${response.status}`);
  }

  return await response.json();
}

/**
 * Update user tokens in database
 */
async function updateUserTokens(userId, tokenData, discordUser) {
  const { error } = await supabase
    .from('users')
    .update({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
      username: discordUser.username,
      discriminator: discordUser.discriminator,
      avatar_url: discordUser.avatar
        ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
        : null,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) throw error;
}

/**
 * Create new session token
 */
function createSessionToken(user) {
  const payload = {
    userId: user.id,
    discordId: user.discord_id,
    username: user.username,
    email: user.email,
    isServerMember: user.is_server_member,
    roles: user.roles,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
  };

  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

// ============================================================================
// POST HANDLER - Refresh Session
// ============================================================================
export async function POST(request) {
  try {
    // Get session token from cookie
    const sessionToken = request.cookies.get('conclave_session')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'No session to refresh'
        },
        { status: 401 }
      );
    }

    // Parse session token
    const sessionData = parseSessionToken(sessionToken);

    if (!sessionData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid session token'
        },
        { status: 401 }
      );
    }

    // Get user from database (includes refresh token)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', sessionData.userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found'
        },
        { status: 404 }
      );
    }

    // Check if refresh token exists
    if (!user.refresh_token) {
      return NextResponse.json(
        {
          success: false,
          error: 'No refresh token available. Please login again.'
        },
        { status: 401 }
      );
    }

    // Refresh Discord access token
    let tokenData;
    try {
      tokenData = await refreshDiscordToken(user.refresh_token);
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError);
      
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to refresh Discord token. Please login again.',
          requiresReauth: true
        },
        { status: 401 }
      );
    }

    // Get fresh user data from Discord
    const discordUser = await getDiscordUser(tokenData.access_token);

    // Update tokens in database
    await updateUserTokens(user.id, tokenData, discordUser);

    // Get updated user data
    const { data: updatedUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    // Create new session token
    const newSessionToken = createSessionToken(updatedUser);

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Session refreshed successfully',
      user: {
        id: updatedUser.id,
        discordId: updatedUser.discord_id,
        username: updatedUser.username,
        email: updatedUser.email,
        avatarUrl: updatedUser.avatar_url
      },
      token: {
        expiresIn: tokenData.expires_in,
        expiresAt: new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      }
    });

    // Update session cookie
    response.cookies.set('conclave_session', newSessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/'
    });

    // Log refresh activity
    await supabase.from('discord_sync_log').insert({
      event_type: 'token_refresh',
      status: 'success',
      details: {
        userId: user.id,
        discordId: user.discord_id,
        username: user.username
      },
      synced_at: new Date().toISOString()
    });

    return response;

  } catch (error) {
    console.error('Session refresh error:', error);

    // Log failed refresh
    try {
      await supabase.from('discord_sync_log').insert({
        event_type: 'token_refresh',
        status: 'failed',
        error_message: error.message,
        synced_at: new Date().toISOString()
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to refresh session',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET HANDLER - Check if refresh is needed
// ============================================================================
export async function GET(request) {
  try {
    // Get session token from cookie
    const sessionToken = request.cookies.get('conclave_session')?.value;

    if (!sessionToken) {
      return NextResponse.json({
        needsRefresh: false,
        authenticated: false
      });
    }

    // Parse session token
    const sessionData = parseSessionToken(sessionToken);

    if (!sessionData) {
      return NextResponse.json({
        needsRefresh: false,
        authenticated: false
      });
    }

    // Check token expiry
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = sessionData.exp - now;

    // Recommend refresh if expiring within 7 days
    const needsRefresh = expiresIn < (7 * 24 * 60 * 60);

    return NextResponse.json({
      needsRefresh: needsRefresh,
      authenticated: true,
      expiresIn: expiresIn,
      expiresAt: new Date(sessionData.exp * 1000).toISOString()
    });

  } catch (error) {
    console.error('Refresh check error:', error);

    return NextResponse.json({
      needsRefresh: false,
      authenticated: false,
      error: 'check_failed'
    });
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}