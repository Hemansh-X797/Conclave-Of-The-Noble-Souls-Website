/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DISCORD OAUTH CALLBACK API ROUTE - THE CONCLAVE REALM
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Handles Discord OAuth 2.0 callback, token exchange, and session creation.
 * Creates 30-day sessions and auto-invites non-members to the Discord server.
 * 
 * Features:
 * - OAuth code exchange for access token
 * - Fetch user data from Discord API
 * - Check guild membership
 * - Auto-invite non-members using guilds.join scope
 * - Create 30-day sessions
 * - Store user data and roles
 * - Redirect based on user role
 * - Error handling
 * 
 * @route POST /api/auth/discord/callback
 */

import { NextResponse } from 'next/server';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const DISCORD_CONFIG = {
  clientId: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  redirectUri: process.env.DISCORD_REDIRECT_URI,
  guildId: process.env.DISCORD_GUILD_ID,
  botToken: process.env.DISCORD_BOT_TOKEN,
};

const SESSION_CONFIG = {
  duration: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
};

const DISCORD_API = {
  tokenUrl: 'https://discord.com/api/v10/oauth2/token',
  userUrl: 'https://discord.com/api/v10/users/@me',
  guildsUrl: 'https://discord.com/api/v10/users/@me/guilds',
  guildMemberUrl: (guildId) => `https://discord.com/api/v10/guilds/${guildId}/members/@me`,
  addGuildMemberUrl: (guildId, userId) => `https://discord.com/api/v10/guilds/${guildId}/members/${userId}`,
};

// Role ID to permission mapping (from permissions.js)
const STAFF_ROLES = [
  '1369566988128751750', // Owner
  '1369197369161154560', // Board
  '1396459118025375784', // Head Admin
  '1370702703616856074', // Admin
  '1409148504026120293', // Head Mod
  '1408079849377107989', // Moderator
];

const REDIRECT_DESTINATIONS = {
  staff: '/sanctum',
  admin: '/throne-room',
  member: '/chambers/dashboard',
  guest: '/chambers/dashboard',
};

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Exchange OAuth code for access token
 */
async function exchangeCodeForToken(code) {
  const params = new URLSearchParams({
    client_id: DISCORD_CONFIG.clientId,
    client_secret: DISCORD_CONFIG.clientSecret,
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: DISCORD_CONFIG.redirectUri,
  });

  const response = await fetch(DISCORD_API.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Token exchange failed: ${error.error_description || response.statusText}`);
  }

  return await response.json();
}

/**
 * Fetch user data from Discord
 */
async function fetchUserData(accessToken) {
  const response = await fetch(DISCORD_API.userUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user data: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Check if user is member of guild
 */
async function checkGuildMembership(accessToken, guildId) {
  try {
    const response = await fetch(DISCORD_API.guildMemberUrl(guildId), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      const memberData = await response.json();
      return {
        isMember: true,
        roles: memberData.roles || [],
        joinedAt: memberData.joined_at,
        nick: memberData.nick,
      };
    }

    return {
      isMember: false,
      roles: [],
    };
  } catch (error) {
    console.error('Guild membership check error:', error);
    return {
      isMember: false,
      roles: [],
    };
  }
}

/**
 * Auto-invite user to guild using bot
 */
async function autoInviteToGuild(userId, accessToken) {
  if (!DISCORD_CONFIG.botToken) {
    console.warn('Bot token not configured, skipping auto-invite');
    return { success: false, reason: 'no_bot_token' };
  }

  try {
    const response = await fetch(
      DISCORD_API.addGuildMemberUrl(DISCORD_CONFIG.guildId, userId),
      {
        method: 'PUT',
        headers: {
          Authorization: `Bot ${DISCORD_CONFIG.botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: accessToken,
        }),
      }
    );

    if (response.ok || response.status === 204) {
      return { success: true };
    }

    // User might already be in the server
    if (response.status === 204) {
      return { success: true, alreadyMember: true };
    }

    const error = await response.json();
    console.error('Auto-invite error:', error);
    return { success: false, reason: error.message };
  } catch (error) {
    console.error('Auto-invite exception:', error);
    return { success: false, reason: error.message };
  }
}

/**
 * Determine redirect destination based on roles
 */
function getRedirectDestination(roles) {
  // Check if user is owner/board/admin
  if (
    roles.includes('1369566988128751750') || // Owner
    roles.includes('1369197369161154560') || // Board
    roles.includes('1396459118025375784') || // Head Admin
    roles.includes('1370702703616856074')    // Admin
  ) {
    return REDIRECT_DESTINATIONS.admin;
  }

  // Check if user is moderator
  if (
    roles.includes('1409148504026120293') || // Head Mod
    roles.includes('1408079849377107989')    // Moderator
  ) {
    return REDIRECT_DESTINATIONS.staff;
  }

  // Default to member dashboard
  return REDIRECT_DESTINATIONS.member;
}

/**
 * Create session object
 */
function createSession(userData, membershipData, tokenData) {
  const expiresAt = new Date(Date.now() + SESSION_CONFIG.duration);

  return {
    userId: userData.id,
    username: userData.username,
    discriminator: userData.discriminator,
    avatar: userData.avatar
      ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`
      : null,
    email: userData.email,
    isMember: membershipData.isMember,
    roles: membershipData.roles || [],
    joinedAt: membershipData.joinedAt,
    nick: membershipData.nick,
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    tokenExpiresAt: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
    expiresAt: expiresAt.toISOString(),
    createdAt: new Date().toISOString(),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════════════

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(
        new URL(`/gateway?error=${error}`, request.url)
      );
    }

    // Validate code
    if (!code) {
      return NextResponse.redirect(
        new URL('/gateway?error=no_code', request.url)
      );
    }

    // Validate state (basic CSRF protection)
    // In production, verify this matches the state stored in session
    if (!state) {
      console.warn('OAuth state missing - possible CSRF attempt');
    }

    // Validate environment variables
    if (!DISCORD_CONFIG.clientId || !DISCORD_CONFIG.clientSecret) {
      console.error('Discord OAuth not configured');
      return NextResponse.redirect(
        new URL('/gateway?error=config_error', request.url)
      );
    }

    console.log('🔐 Processing Discord OAuth callback...');

    // Step 1: Exchange code for access token
    console.log('📝 Exchanging code for token...');
    const tokenData = await exchangeCodeForToken(code);

    // Step 2: Fetch user data
    console.log('👤 Fetching user data...');
    const userData = await fetchUserData(tokenData.access_token);

    console.log(`✅ User authenticated: ${userData.username}#${userData.discriminator}`);

    // Step 3: Check guild membership
    console.log('🏰 Checking guild membership...');
    let membershipData = await checkGuildMembership(
      tokenData.access_token,
      DISCORD_CONFIG.guildId
    );

    // Step 4: Auto-invite if not a member
    if (!membershipData.isMember) {
      console.log('📧 User not a member, attempting auto-invite...');
      const inviteResult = await autoInviteToGuild(
        userData.id,
        tokenData.access_token
      );

      if (inviteResult.success) {
        console.log('✅ User auto-invited successfully');
        
        // Recheck membership after invite
        membershipData = await checkGuildMembership(
          tokenData.access_token,
          DISCORD_CONFIG.guildId
        );
      } else {
        console.warn('⚠️ Auto-invite failed:', inviteResult.reason);
      }
    } else {
      console.log('✅ User is already a member');
    }

    // Step 5: Create session
    const session = createSession(userData, membershipData, tokenData);

    console.log('💾 Session created:', {
      userId: session.userId,
      username: session.username,
      isMember: session.isMember,
      roles: session.roles.length,
      expiresAt: session.expiresAt,
    });

    // Step 6: Determine redirect destination
    const redirectTo = getRedirectDestination(session.roles);

    console.log('🎯 Redirecting to:', redirectTo);

    // Step 7: Create response with session cookie
    const response = NextResponse.redirect(new URL(redirectTo, request.url));

    // Set session cookie (httpOnly for security)
    response.cookies.set('conclave_session', JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_CONFIG.duration / 1000, // Convert to seconds
      path: '/',
    });

    // Also send session in response for client-side storage
    // (Less secure but needed for React state)
    response.headers.set('X-Session-Data', JSON.stringify(session));

    return response;

  } catch (error) {
    console.error('❌ Discord OAuth error:', error);

    // Return user-friendly error
    return NextResponse.redirect(
      new URL(
        `/gateway?error=server_error&message=${encodeURIComponent(error.message)}`,
        request.url
      )
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SESSION REFRESH ENDPOINT
// ═══════════════════════════════════════════════════════════════════════════

export async function POST(request) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token required' },
        { status: 400 }
      );
    }

    // Exchange refresh token for new access token
    const params = new URLSearchParams({
      client_id: DISCORD_CONFIG.clientId,
      client_secret: DISCORD_CONFIG.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    const response = await fetch(DISCORD_API.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const tokenData = await response.json();

    // Fetch updated user data
    const userData = await fetchUserData(tokenData.access_token);
    const membershipData = await checkGuildMembership(
      tokenData.access_token,
      DISCORD_CONFIG.guildId
    );

    // Create new session
    const session = createSession(userData, membershipData, tokenData);

    return NextResponse.json({
      success: true,
      session,
    });

  } catch (error) {
    console.error('Session refresh error:', error);
    return NextResponse.json(
      { error: 'Session refresh failed' },
      { status: 500 }
    );
  }
}