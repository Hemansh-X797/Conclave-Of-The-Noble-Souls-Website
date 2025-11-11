// ============================================================================
// DISCORD OAUTH URL GENERATOR API
// Location: /src/app/api/auth/discord/url/route.js
// Generates Discord OAuth authorization URL for user login
// ============================================================================

import { NextResponse } from 'next/server';

// ============================================================================
// CONFIGURATION
// ============================================================================

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;
const DISCORD_OAUTH_SCOPES = ['identify', 'email', 'guilds', 'guilds.members.read'];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate cryptographically secure state parameter
 */
function generateState() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Build Discord OAuth URL
 */
function buildDiscordAuthUrl(state) {
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: DISCORD_REDIRECT_URI,
    response_type: 'code',
    scope: DISCORD_OAUTH_SCOPES.join(' '),
    state: state,
    prompt: 'consent' // Always show consent screen
  });

  return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
}

/**
 * Validate environment configuration
 */
function validateConfig() {
  const errors = [];

  if (!DISCORD_CLIENT_ID) {
    errors.push('DISCORD_CLIENT_ID is not configured');
  }

  if (!DISCORD_REDIRECT_URI) {
    errors.push('DISCORD_REDIRECT_URI is not configured');
  }

  // Validate redirect URI format
  if (DISCORD_REDIRECT_URI && !DISCORD_REDIRECT_URI.startsWith('http')) {
    errors.push('DISCORD_REDIRECT_URI must be a valid URL');
  }

  return errors;
}

// ============================================================================
// GET HANDLER - Generate OAuth URL
// ============================================================================
export async function GET(request) {
  try {
    // Validate configuration
    const configErrors = validateConfig();
    if (configErrors.length > 0) {
      console.error('Discord OAuth configuration errors:', configErrors);
      
      return NextResponse.json(
        {
          success: false,
          error: 'Discord OAuth is not properly configured',
          details: process.env.NODE_ENV === 'development' ? configErrors : undefined
        },
        { status: 503 }
      );
    }

    // Generate secure state parameter for CSRF protection
    const state = generateState();

    // Build OAuth URL
    const authUrl = buildDiscordAuthUrl(state);

    // Get return URL from query params (optional)
    const url = new URL(request.url);
    const returnUrl = url.searchParams.get('return_url') || '/chambers/dashboard';

    // Create response with state cookie for verification
    const response = NextResponse.json({
      success: true,
      authUrl: authUrl,
      state: state,
      expiresIn: 600 // 10 minutes
    });

    // Set secure state cookie (httpOnly, sameSite, secure in production)
    response.cookies.set('discord_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/'
    });

    // Store return URL in cookie
    response.cookies.set('discord_oauth_return', returnUrl, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Discord OAuth URL generation error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate Discord OAuth URL',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST HANDLER - Generate OAuth URL with custom parameters
// ============================================================================
export async function POST(request) {
  try {
    // Validate configuration
    const configErrors = validateConfig();
    if (configErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Discord OAuth is not properly configured',
          details: process.env.NODE_ENV === 'development' ? configErrors : undefined
        },
        { status: 503 }
      );
    }

    // Parse request body
    const body = await request.json().catch(() => ({}));
    const { returnUrl = '/chambers/dashboard', additionalScopes = [] } = body;

    // Validate returnUrl
    if (returnUrl && typeof returnUrl !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid return URL format'
        },
        { status: 400 }
      );
    }

    // Merge scopes (if additional scopes provided)
    const scopes = [...DISCORD_OAUTH_SCOPES];
    if (Array.isArray(additionalScopes)) {
      additionalScopes.forEach(scope => {
        if (!scopes.includes(scope)) {
          scopes.push(scope);
        }
      });
    }

    // Generate state
    const state = generateState();

    // Build OAuth URL with merged scopes
    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      redirect_uri: DISCORD_REDIRECT_URI,
      response_type: 'code',
      scope: scopes.join(' '),
      state: state,
      prompt: 'consent'
    });

    const authUrl = `https://discord.com/api/oauth2/authorize?${params.toString()}`;

    // Create response
    const response = NextResponse.json({
      success: true,
      authUrl: authUrl,
      state: state,
      scopes: scopes,
      expiresIn: 600
    });

    // Set cookies
    response.cookies.set('discord_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/'
    });

    response.cookies.set('discord_oauth_return', returnUrl, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Discord OAuth URL generation error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate Discord OAuth URL',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
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