// ============================================================================
// GET CURRENT USER API
// Location: /src/app/api/auth/user/route.js
// Returns current authenticated user information
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
    const payload = JSON.parse(decoded);
    
    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }
    
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Get full user data from database
 */
async function getUserFromDatabase(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        user_profiles(*)
      `)
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to get user from database:', error);
    return null;
  }
}

/**
 * Get user's pathway progress
 */
async function getUserPathways(userId) {
  try {
    const { data, error } = await supabase
      .from('pathway_progress')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to get user pathways:', error);
    return [];
  }
}

/**
 * Get user's achievements
 */
async function getUserAchievements(userId) {
  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievements(*)
      `)
      .eq('user_id', userId)
      .eq('unlocked', true);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to get user achievements:', error);
    return [];
  }
}

/**
 * Format user response
 */
function formatUserResponse(user, pathways, achievements) {
  return {
    id: user.id,
    discordId: user.discord_id,
    username: user.username,
    discriminator: user.discriminator,
    email: user.email,
    avatarUrl: user.avatar_url,
    isServerMember: user.is_server_member,
    roles: user.roles || [],
    profile: user.user_profiles?.[0] || null,
    pathways: pathways,
    achievements: achievements,
    stats: {
      totalPathways: pathways.length,
      totalAchievements: achievements.length,
      memberSince: user.created_at,
      lastLogin: user.last_login
    },
    createdAt: user.created_at,
    updatedAt: user.updated_at
  };
}

// ============================================================================
// GET HANDLER - Get Current User
// ============================================================================
export async function GET(request) {
  try {
    // Get session token from cookie
    const sessionToken = request.cookies.get('conclave_session')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not authenticated',
          user: null
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
          error: 'Invalid or expired session',
          user: null
        },
        { status: 401 }
      );
    }

    // Get query parameters for additional data
    const url = new URL(request.url);
    const includePathways = url.searchParams.get('pathways') === 'true';
    const includeAchievements = url.searchParams.get('achievements') === 'true';
    const fullData = url.searchParams.get('full') === 'true';

    // Get user from database
    const user = await getUserFromDatabase(sessionData.userId);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
          user: null
        },
        { status: 404 }
      );
    }

    // If full data requested, include everything
    let pathways = [];
    let achievements = [];

    if (fullData || includePathways) {
      pathways = await getUserPathways(user.id);
    }

    if (fullData || includeAchievements) {
      achievements = await getUserAchievements(user.id);
    }

    // Format response
    const formattedUser = formatUserResponse(user, pathways, achievements);

    return NextResponse.json({
      success: true,
      user: formattedUser
    });

  } catch (error) {
    console.error('Get current user error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get user information',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        user: null
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH HANDLER - Update Current User
// ============================================================================
export async function PATCH(request) {
  try {
    // Get session token from cookie
    const sessionToken = request.cookies.get('conclave_session')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not authenticated'
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
          error: 'Invalid or expired session'
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { bio, preferences, notifications } = body;

    // Update user profile
    if (bio !== undefined) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          bio: bio,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', sessionData.userId);

      if (profileError) {
        console.error('Failed to update profile:', profileError);
      }
    }

    // Update user preferences
    if (preferences !== undefined) {
      const { error: userError } = await supabase
        .from('users')
        .update({
          preferences: preferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionData.userId);

      if (userError) {
        console.error('Failed to update preferences:', userError);
      }
    }

    // Get updated user data
    const updatedUser = await getUserFromDatabase(sessionData.userId);
    const pathways = await getUserPathways(sessionData.userId);
    const achievements = await getUserAchievements(sessionData.userId);

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: formatUserResponse(updatedUser, pathways, achievements)
    });

  } catch (error) {
    console.error('Update user error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update user',
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
      'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}