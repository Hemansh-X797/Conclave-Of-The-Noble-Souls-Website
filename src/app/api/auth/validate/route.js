// ============================================================================
// VALIDATE SESSION API
// Location: /src/app/api/auth/validate/route.js
// Validates user session token and returns validation status
// ============================================================================

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse and validate session token
 */
function parseSessionToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const payload = JSON.parse(decoded);
    
    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return { valid: false, reason: 'expired', payload: null };
    }
    
    // Check if token has required fields
    if (!payload.userId || !payload.discordId) {
      return { valid: false, reason: 'invalid_format', payload: null };
    }
    
    return { valid: true, reason: 'valid', payload: payload };
  } catch (error) {
    return { valid: false, reason: 'parse_error', payload: null };
  }
}

/**
 * Check if user exists in database
 */
async function checkUserExists(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, discord_id, username, is_server_member, roles')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return { exists: false, user: null };
    }

    return { exists: true, user: data };
  } catch (error) {
    console.error('Failed to check user existence:', error);
    return { exists: false, user: null };
  }
}

/**
 * Check if user's Discord token is still valid
 */
async function checkDiscordTokenValidity(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('token_expires_at')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return { valid: false, expiresAt: null };
    }

    const expiresAt = new Date(data.token_expires_at);
    const now = new Date();

    return {
      valid: expiresAt > now,
      expiresAt: data.token_expires_at,
      expiresIn: Math.max(0, Math.floor((expiresAt - now) / 1000))
    };
  } catch (error) {
    console.error('Failed to check token validity:', error);
    return { valid: false, expiresAt: null };
  }
}

/**
 * Get user permissions
 */
function getUserPermissions(roles) {
  // Staff role IDs
  const staffRoleIds = [
    '1369566988128751750', // Owner
    '1369197369161154560', // Board
    '1396459118025375784', // Head Admin
    '1370702703616856074', // Admin
    '1409148504026120293', // Head Mod
    '1408079849377107989'  // Moderator
  ];

  const isStaff = roles.some(roleId => staffRoleIds.includes(roleId));
  const isAdmin = roles.some(roleId => [
    '1369566988128751750',
    '1369197369161154560',
    '1396459118025375784',
    '1370702703616856074'
  ].includes(roleId));
  const isModerator = roles.some(roleId => [
    '1409148504026120293',
    '1408079849377107989'
  ].includes(roleId));

  return {
    isStaff,
    isAdmin,
    isModerator,
    canAccessDashboard: true,
    canAccessSanctum: isStaff,
    canAccessThroneRoom: isAdmin
  };
}

// ============================================================================
// POST HANDLER - Validate Session
// ============================================================================
export async function POST(request) {
  try {
    // Get session token from cookie or body
    let sessionToken = request.cookies.get('conclave_session')?.value;

    // Allow token in body for API clients
    if (!sessionToken) {
      const body = await request.json().catch(() => ({}));
      sessionToken = body.token;
    }

    if (!sessionToken) {
      return NextResponse.json({
        valid: false,
        reason: 'no_token',
        message: 'No session token provided',
        user: null
      });
    }

    // Parse and validate token format
    const tokenValidation = parseSessionToken(sessionToken);

    if (!tokenValidation.valid) {
      return NextResponse.json({
        valid: false,
        reason: tokenValidation.reason,
        message: `Token is ${tokenValidation.reason}`,
        user: null
      });
    }

    const payload = tokenValidation.payload;

    // Check if user exists in database
    const userCheck = await checkUserExists(payload.userId);

    if (!userCheck.exists) {
      return NextResponse.json({
        valid: false,
        reason: 'user_not_found',
        message: 'User no longer exists',
        user: null
      });
    }

    // Check if Discord token is still valid
    const tokenCheck = await checkDiscordTokenValidity(payload.userId);

    // Get user permissions
    const permissions = getUserPermissions(userCheck.user.roles || []);

    // Return validation result
    return NextResponse.json({
      valid: true,
      reason: 'valid',
      message: 'Session is valid',
      user: {
        id: userCheck.user.id,
        discordId: userCheck.user.discord_id,
        username: userCheck.user.username,
        isServerMember: userCheck.user.is_server_member,
        roles: userCheck.user.roles
      },
      permissions: permissions,
      token: {
        issuedAt: payload.iat,
        expiresAt: payload.exp,
        expiresIn: payload.exp - Math.floor(Date.now() / 1000)
      },
      discordToken: {
        valid: tokenCheck.valid,
        expiresAt: tokenCheck.expiresAt,
        expiresIn: tokenCheck.expiresIn
      }
    });

  } catch (error) {
    console.error('Session validation error:', error);

    return NextResponse.json(
      {
        valid: false,
        reason: 'server_error',
        message: 'Failed to validate session',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        user: null
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET HANDLER - Quick Validation Check
// ============================================================================
export async function GET(request) {
  try {
    // Get session token from cookie
    const sessionToken = request.cookies.get('conclave_session')?.value;

    if (!sessionToken) {
      return NextResponse.json({
        valid: false,
        authenticated: false
      });
    }

    // Parse token
    const tokenValidation = parseSessionToken(sessionToken);

    if (!tokenValidation.valid) {
      return NextResponse.json({
        valid: false,
        authenticated: false,
        reason: tokenValidation.reason
      });
    }

    // Quick check - just verify user exists
    const userCheck = await checkUserExists(tokenValidation.payload.userId);

    return NextResponse.json({
      valid: userCheck.exists,
      authenticated: userCheck.exists,
      userId: tokenValidation.payload.userId,
      discordId: tokenValidation.payload.discordId,
      username: tokenValidation.payload.username
    });

  } catch (error) {
    console.error('Quick validation error:', error);

    return NextResponse.json({
      valid: false,
      authenticated: false,
      error: 'validation_error'
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