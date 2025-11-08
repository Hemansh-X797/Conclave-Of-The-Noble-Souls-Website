// ============================================================================
// DISCORD OAUTH CALLBACK - The Conclave Realm
// Location: /src/app/api/auth/discord/callback/route.js
// ============================================================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

const DISCORD_API_BASE = 'https://discord.com/api/v10';
const DISCORD_TOKEN_URL = `${DISCORD_API_BASE}/oauth2/token`;
const DISCORD_USER_URL = `${DISCORD_API_BASE}/users/@me`;

/**
 * GET /api/auth/discord/callback
 * Handles Discord OAuth callback
 * 
 * Flow:
 * 1. Receive authorization code from Discord (URL params)
 * 2. Exchange code for access token
 * 3. Fetch user data from Discord
 * 4. Verify guild membership using Bot token (more reliable)
 * 5. Create/update user in database
 * 6. Set secure session cookie
 * 7. Redirect to dashboard
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');

    // Check for OAuth errors
    if (error) {
      console.error('Discord OAuth error:', error);
      return NextResponse.redirect(
        new URL(`/gateway?error=${encodeURIComponent('Discord authentication failed')}`, request.url)
      );
    }

    // Validate authorization code
    if (!code) {
      console.error('No authorization code provided');
      return NextResponse.redirect(
        new URL(`/gateway?error=${encodeURIComponent('No authorization code')}`, request.url)
      );
    }

    // Validate state (CSRF protection)
    const storedState = request.cookies.get('discord_oauth_state')?.value;
    if (state && storedState && state !== storedState) {
      console.error('State mismatch - possible CSRF attack');
      return NextResponse.redirect(
        new URL(`/gateway?error=${encodeURIComponent('Invalid state parameter')}`, request.url)
      );
    }

    // ========================================================================
    // STEP 1: Exchange authorization code for access token
    // ========================================================================
    console.log('Exchanging authorization code for access token...');
    
    const tokenParams = new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI
    });

    const tokenResponse = await fetch(DISCORD_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: tokenParams.toString()
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Token exchange failed:', errorData);
      throw new Error('Failed to exchange authorization code');
    }

    const tokens = await tokenResponse.json();
    const { access_token, refresh_token, expires_in, token_type } = tokens;

    // ========================================================================
    // STEP 2: Fetch user data from Discord
    // ========================================================================
    console.log('Fetching user data from Discord...');
    
    const userResponse = await fetch(DISCORD_USER_URL, {
      headers: {
        Authorization: `${token_type} ${access_token}`
      }
    });

    if (!userResponse.ok) {
      console.error('Failed to fetch user data');
      throw new Error('Failed to fetch user data');
    }

    const discordUser = await userResponse.json();
    console.log('Discord user fetched:', discordUser.username);

    // ========================================================================
    // STEP 3: Verify guild membership using Bot token (YOUR APPROACH - BETTER!)
    // ========================================================================
    console.log('Verifying guild membership...');
    
    const guildId = process.env.DISCORD_GUILD_ID;
    const botToken = process.env.DISCORD_BOT_TOKEN;
    
    const memberResponse = await fetch(
      `${DISCORD_API_BASE}/guilds/${guildId}/members/${discordUser.id}`,
      {
        headers: {
          Authorization: `Bot ${botToken}`
        }
      }
    );

    const inServer = memberResponse.ok;

    if (!inServer) {
      console.log('User is not a member of the guild');
      return NextResponse.redirect(
        new URL(`/gateway?error=${encodeURIComponent('You must be a member of The Conclave Discord server')}`, request.url)
      );
    }

    // Get member data (roles, nickname, etc.)
    const memberData = await memberResponse.json();
    const roles = memberData?.roles || [];
    const nickname = memberData?.nick || null;

    console.log('Guild membership verified. Roles:', roles);

    // ========================================================================
    // STEP 4: Create/update user in database
    // ========================================================================
    console.log('Creating/updating user in database...');
    
    const supabase = createClient();
    
    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('discord_id', discordUser.id)
      .single();

    const userData = {
      discord_id: discordUser.id,
      username: discordUser.username,
      discriminator: discordUser.discriminator || '0',
      avatar: discordUser.avatar,
      email: discordUser.email,
      verified: discordUser.verified || false,
      roles: roles,
      nickname: nickname,
      last_login: new Date().toISOString(),
      access_token: access_token,
      refresh_token: refresh_token,
      token_expires_at: new Date(Date.now() + expires_in * 1000).toISOString()
    };

    let userId;

    if (existingUser) {
      // Update existing user
      console.log('Updating existing user...');
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update(userData)
        .eq('discord_id', discordUser.id)
        .select()
        .single();

      if (updateError) {
        console.error('Failed to update user:', updateError);
        throw new Error('Database update failed');
      }

      userId = updatedUser.id;
      console.log('User updated successfully:', userId);
    } else {
      // Create new user
      console.log('Creating new user...');
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          ...userData,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('Failed to create user:', createError);
        throw new Error('Database insert failed');
      }

      userId = newUser.id;
      console.log('User created successfully:', userId);

      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          display_name: discordUser.username,
          bio: '',
          preferences: {
            theme: 'dark',
            sounds_enabled: true,
            animations_enabled: true,
            particles_enabled: true
          },
          created_at: new Date().toISOString()
        });

      if (profileError) {
        console.warn('Failed to create user profile:', profileError);
      }

      // Log user registration in analytics
      await supabase
        .from('analytics')
        .insert({
          event_type: 'user_registered',
          user_id: userId,
          metadata: {
            discord_username: discordUser.username,
            registration_method: 'discord_oauth'
          },
          created_at: new Date().toISOString()
        });
    }

    // ========================================================================
    // STEP 5: Sync Discord roles
    // ========================================================================
    console.log('Syncing Discord roles...');
    
    await supabase
      .from('discord_sync_log')
      .insert({
        user_id: userId,
        discord_id: discordUser.id,
        sync_type: 'role_sync',
        status: 'success',
        roles_synced: roles,
        synced_at: new Date().toISOString()
      });

    // ========================================================================
    // STEP 6: Create secure session
    // ========================================================================
    console.log('Creating session...');
    
    const sessionData = {
      userId,
      discordId: discordUser.id,
      username: discordUser.username,
      avatar: discordUser.avatar,
      roles: roles,
      expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
    };

    // Encode session data
    const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString('base64');

    // ========================================================================
    // STEP 7: Set cookies and redirect
    // ========================================================================
    const response = NextResponse.redirect(new URL('/chambers/dashboard', request.url));

    // Set session cookie (httpOnly for security)
    response.cookies.set('conclave_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/'
    });

    // Set user ID cookie (for client-side access)
    response.cookies.set('conclave_user_id', userId, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/'
    });

    // Clear OAuth state cookie
    response.cookies.delete('discord_oauth_state');

    console.log('Authentication successful, redirecting to dashboard...');
    return response;

  } catch (error) {
    console.error('OAuth callback error:', error);

    // Log error to database
    try {
      const supabase = createClient();
      await supabase
        .from('analytics')
        .insert({
          event_type: 'auth_error',
          metadata: {
            error: error.message,
            stack: error.stack,
            url: request.url
          },
          created_at: new Date().toISOString()
        });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return NextResponse.redirect(
      new URL(`/gateway?error=${encodeURIComponent('Authentication failed. Please try again.')}`, request.url)
    );
  }
}

/**
 * POST /api/auth/discord/callback
 * Alternative endpoint for frontend-initiated auth
 * (Kept for backward compatibility with your existing flow)
 */
export async function POST(request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code required' },
        { status: 400 }
      );
    }

    // Use same logic as GET but return JSON instead of redirect
    // This allows your frontend to handle the response

    const clientId = process.env.DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;
    const redirectUri = process.env.DISCORD_REDIRECT_URI;

    // Exchange code for tokens
    const tokenResponse = await fetch(`${DISCORD_API_BASE}/oauth2/token`, {
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
    const userResponse = await fetch(`${DISCORD_API_BASE}/users/@me`, {
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

    // Check guild membership using Bot token
    const guildId = process.env.DISCORD_GUILD_ID;
    const botToken = process.env.DISCORD_BOT_TOKEN;
    
    const memberResponse = await fetch(
      `${DISCORD_API_BASE}/guilds/${guildId}/members/${discordUser.id}`,
      {
        headers: {
          Authorization: `Bot ${botToken}`
        }
      }
    );

    const inServer = memberResponse.ok;
    const memberData = inServer ? await memberResponse.json() : null;
    const roles = memberData?.roles || [];

    // Return data for frontend to handle
    return NextResponse.json({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
      tokenType: tokens.token_type,
      user: {
        id: discordUser.id,
        username: discordUser.username,
        discriminator: discordUser.discriminator,
        avatar: discordUser.avatar,
        email: discordUser.email,
        verified: discordUser.verified,
        roles: roles,
        inServer: inServer
      }
    });

  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}