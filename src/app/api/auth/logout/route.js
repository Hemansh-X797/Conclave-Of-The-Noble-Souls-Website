// ============================================================================
// LOGOUT API
// Location: /src/app/api/auth/logout/route.js
// Handles user logout, clears session, logs activity
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
 * Log logout activity
 */
async function logLogout(userId, discordId, username) {
  try {
    await supabase.from('discord_sync_log').insert({
      event_type: 'user_logout',
      status: 'success',
      details: {
        userId: userId,
        discordId: discordId,
        username: username
      },
      synced_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log logout:', error);
  }
}

/**
 * Update user last activity
 */
async function updateUserActivity(userId) {
  try {
    await supabase
      .from('users')
      .update({
        last_logout: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
  } catch (error) {
    console.error('Failed to update user activity:', error);
  }
}

// ============================================================================
// POST HANDLER - Logout
// ============================================================================
export async function POST(request) {
  try {
    // Get session token from cookie
    const sessionToken = request.cookies.get('conclave_session')?.value;

    let userData = null;

    // If session exists, parse it and log the logout
    if (sessionToken) {
      userData = parseSessionToken(sessionToken);
      
      if (userData) {
        // Log logout activity
        await logLogout(userData.userId, userData.discordId, userData.username);
        
        // Update user activity
        await updateUserActivity(userData.userId);
      }
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

    // Clear session cookie
    response.cookies.delete('conclave_session');

    // Clear any other auth-related cookies
    response.cookies.delete('discord_oauth_state');
    response.cookies.delete('discord_oauth_return');

    return response;

  } catch (error) {
    console.error('Logout error:', error);

    // Even if there's an error, still clear cookies
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

    response.cookies.delete('conclave_session');
    response.cookies.delete('discord_oauth_state');
    response.cookies.delete('discord_oauth_return');

    return response;
  }
}

// ============================================================================
// GET HANDLER - Logout (for direct browser navigation)
// ============================================================================
export async function GET(request) {
  try {
    // Get session token from cookie
    const sessionToken = request.cookies.get('conclave_session')?.value;

    let userData = null;

    // If session exists, parse it and log the logout
    if (sessionToken) {
      userData = parseSessionToken(sessionToken);
      
      if (userData) {
        // Log logout activity
        await logLogout(userData.userId, userData.discordId, userData.username);
        
        // Update user activity
        await updateUserActivity(userData.userId);
      }
    }

    // Get redirect URL from query params
    const url = new URL(request.url);
    const redirectTo = url.searchParams.get('redirect') || '/';

    // Create redirect response
    const redirectUrl = new URL(redirectTo, process.env.NEXT_PUBLIC_SITE_URL);
    const response = NextResponse.redirect(redirectUrl);

    // Clear session cookie
    response.cookies.delete('conclave_session');

    // Clear any other auth-related cookies
    response.cookies.delete('discord_oauth_state');
    response.cookies.delete('discord_oauth_return');

    return response;

  } catch (error) {
    console.error('Logout error:', error);

    // Even if there's an error, still clear cookies and redirect
    const response = NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL));

    response.cookies.delete('conclave_session');
    response.cookies.delete('discord_oauth_state');
    response.cookies.delete('discord_oauth_return');

    return response;
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