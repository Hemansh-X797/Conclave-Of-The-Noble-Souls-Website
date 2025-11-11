/**
 * ============================================================================
 * PATHWAY PROGRESS API
 * @route GET /api/pathways/[pathwayId]/progress
 * @route POST /api/pathways/[pathwayId]/progress (Update progress)
 * @description Get or update pathway progress for current user
 * @access Authenticated users only
 * ============================================================================
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * ============================================================================
 * HELPER FUNCTIONS
 * ============================================================================
 */

/**
 * Parse session token
 * @param {string} token - Base64url encoded session token
 * @returns {Object|null} Parsed session data or null
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
 * Validate pathway ID
 * @param {string} pathwayId - Pathway identifier
 * @returns {boolean} True if valid pathway
 */
function isValidPathway(pathwayId) {
  const validPathways = ['gaming', 'lorebound', 'productive', 'news'];
  return validPathways.includes(pathwayId?.toLowerCase());
}

/**
 * Get pathway progress for user
 * @param {number} userId - User database ID
 * @param {string} pathwayId - Pathway identifier
 * @returns {Promise<Object|null>} Progress data or null
 */
async function getProgress(userId, pathwayId) {
  try {
    const { data, error } = await supabase
      .from('pathway_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('pathway_id', pathwayId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to get progress:', error);
    return null;
  }
}

/**
 * Update pathway progress
 * @param {number} userId - User database ID
 * @param {string} pathwayId - Pathway identifier
 * @param {Object} updates - Progress updates
 * @returns {Promise<Object>} Updated progress data
 */
async function updateProgress(userId, pathwayId, updates) {
  const { data, error } = await supabase
    .from('pathway_progress')
    .update({
      ...updates,
      last_activity: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('pathway_id', pathwayId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Calculate pathway statistics
 * @param {Object} progressData - Progress data
 * @returns {Object} Calculated stats
 */
function calculateStats(progressData) {
  const joinedDate = new Date(progressData.joined_at);
  const now = new Date();
  const daysActive = Math.floor((now - joinedDate) / (1000 * 60 * 60 * 24));
  
  const lastActivity = new Date(progressData.last_activity);
  const daysSinceActivity = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));

  return {
    progress: progressData.progress || 0,
    completedModules: progressData.completed_modules?.length || 0,
    daysActive: daysActive,
    daysSinceLastActivity: daysSinceActivity,
    isActive: daysSinceActivity < 7,
    joinedAt: progressData.joined_at,
    lastActivity: progressData.last_activity
  };
}

/**
 * Get pathway leaderboard position
 * @param {number} userId - User database ID
 * @param {string} pathwayId - Pathway identifier
 * @returns {Promise<number|null>} User's rank or null
 */
async function getLeaderboardPosition(userId, pathwayId) {
  try {
    const { data, error } = await supabase
      .from('pathway_progress')
      .select('user_id, progress')
      .eq('pathway_id', pathwayId)
      .order('progress', { ascending: false });

    if (error) throw error;

    const userIndex = data.findIndex(item => item.user_id === userId);
    return userIndex >= 0 ? userIndex + 1 : null;
  } catch (error) {
    console.error('Failed to get leaderboard position:', error);
    return null;
  }
}

/**
 * ============================================================================
 * GET HANDLER - Get Pathway Progress
 * @route GET /api/pathways/[pathwayId]/progress
 * ============================================================================
 */
export async function GET(request, { params }) {
  try {
    const pathwayId = params.pathwayId;

    // Validate pathway ID
    if (!isValidPathway(pathwayId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid pathway ID'
        },
        { status: 400 }
      );
    }

    // Get session token
    const sessionToken = request.cookies.get('conclave_session')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required'
        },
        { status: 401 }
      );
    }

    // Parse session
    const sessionData = parseSessionToken(sessionToken);

    if (!sessionData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid session'
        },
        { status: 401 }
      );
    }

    // Get progress
    const progressData = await getProgress(sessionData.userId, pathwayId);

    if (!progressData) {
      return NextResponse.json(
        {
          success: false,
          error: 'You are not a member of this pathway',
          pathway: pathwayId
        },
        { status: 404 }
      );
    }

    // Calculate stats
    const stats = calculateStats(progressData);

    // Get leaderboard position
    const rank = await getLeaderboardPosition(sessionData.userId, pathwayId);

    return NextResponse.json({
      success: true,
      pathway: pathwayId,
      progress: {
        id: progressData.id,
        progress: progressData.progress,
        completedModules: progressData.completed_modules || [],
        joinedAt: progressData.joined_at,
        lastActivity: progressData.last_activity
      },
      stats: stats,
      rank: rank
    });

  } catch (error) {
    console.error('Get pathway progress error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get pathway progress',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

/**
 * ============================================================================
 * POST HANDLER - Update Pathway Progress
 * @route POST /api/pathways/[pathwayId]/progress
 * ============================================================================
 */
export async function POST(request, { params }) {
  try {
    const pathwayId = params.pathwayId;

    // Validate pathway ID
    if (!isValidPathway(pathwayId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid pathway ID'
        },
        { status: 400 }
      );
    }

    // Get session token
    const sessionToken = request.cookies.get('conclave_session')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required'
        },
        { status: 401 }
      );
    }

    // Parse session
    const sessionData = parseSessionToken(sessionToken);

    if (!sessionData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid session'
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { progress, completedModule, completedModules } = body;

    // Validate updates
    if (progress !== undefined && (typeof progress !== 'number' || progress < 0 || progress > 100)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Progress must be a number between 0 and 100'
        },
        { status: 400 }
      );
    }

    // Check if user is member
    const currentProgress = await getProgress(sessionData.userId, pathwayId);

    if (!currentProgress) {
      return NextResponse.json(
        {
          success: false,
          error: 'You are not a member of this pathway'
        },
        { status: 404 }
      );
    }

    // Build updates object
    const updates = {};

    if (progress !== undefined) {
      updates.progress = progress;
    }

    if (completedModule) {
      const currentModules = currentProgress.completed_modules || [];
      if (!currentModules.includes(completedModule)) {
        updates.completed_modules = [...currentModules, completedModule];
      }
    }

    if (completedModules && Array.isArray(completedModules)) {
      updates.completed_modules = completedModules;
    }

    // Update progress
    const updatedProgress = await updateProgress(sessionData.userId, pathwayId, updates);

    // Calculate new stats
    const stats = calculateStats(updatedProgress);

    // Get new leaderboard position
    const rank = await getLeaderboardPosition(sessionData.userId, pathwayId);

    return NextResponse.json({
      success: true,
      message: 'Progress updated successfully',
      pathway: pathwayId,
      progress: {
        id: updatedProgress.id,
        progress: updatedProgress.progress,
        completedModules: updatedProgress.completed_modules || [],
        lastActivity: updatedProgress.last_activity
      },
      stats: stats,
      rank: rank
    });

  } catch (error) {
    console.error('Update pathway progress error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update pathway progress',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

/**
 * ============================================================================
 * OPTIONS HANDLER (CORS)
 * @route OPTIONS /api/pathways/[pathwayId]/progress
 * ============================================================================
 */
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