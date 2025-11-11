/**
 * ============================================================================
 * LEAVE PATHWAY API
 * @route POST /api/pathways/leave
 * @description Allows users to leave a pathway they've joined
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
 * Get user's pathway progress record
 * @param {number} userId - User database ID
 * @param {string} pathwayId - Pathway identifier
 * @returns {Promise<Object|null>} Pathway progress record or null
 */
async function getPathwayProgress(userId, pathwayId) {
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
    console.error('Failed to get pathway progress:', error);
    return null;
  }
}

/**
 * Remove user from pathway
 * @param {number} userId - User database ID
 * @param {string} pathwayId - Pathway identifier
 * @returns {Promise<boolean>} True if successfully removed
 */
async function leavePathway(userId, pathwayId) {
  const { error } = await supabase
    .from('pathway_progress')
    .delete()
    .eq('user_id', userId)
    .eq('pathway_id', pathwayId);

  if (error) throw error;
  return true;
}

/**
 * Archive pathway progress (optional - keep history)
 * @param {Object} progressData - Pathway progress data to archive
 */
async function archivePathwayProgress(progressData) {
  try {
    await supabase.from('pathway_progress_archive').insert({
      user_id: progressData.user_id,
      pathway_id: progressData.pathway_id,
      progress: progressData.progress,
      completed_modules: progressData.completed_modules,
      joined_at: progressData.joined_at,
      left_at: new Date().toISOString(),
      total_days: Math.floor(
        (new Date() - new Date(progressData.joined_at)) / (1000 * 60 * 60 * 24)
      )
    });
  } catch (error) {
    console.error('Failed to archive pathway progress:', error);
    // Non-critical, don't throw
  }
}

/**
 * Log pathway leave activity
 * @param {number} userId - User database ID
 * @param {string} username - Discord username
 * @param {string} pathwayId - Pathway identifier
 * @param {Object} progressData - Progress data before leaving
 */
async function logPathwayLeave(userId, username, pathwayId, progressData) {
  try {
    await supabase.from('discord_sync_log').insert({
      event_type: 'pathway_left',
      status: 'success',
      details: {
        userId: userId,
        username: username,
        pathway: pathwayId,
        progress: progressData.progress,
        daysActive: Math.floor(
          (new Date() - new Date(progressData.joined_at)) / (1000 * 60 * 60 * 24)
        )
      },
      synced_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log pathway leave:', error);
  }
}

/**
 * Get pathway name
 * @param {string} pathwayId - Pathway identifier
 * @returns {string} Pathway display name
 */
function getPathwayName(pathwayId) {
  const pathwayNames = {
    gaming: 'Gaming Realm',
    lorebound: 'Lorebound Sanctuary',
    productive: 'Productive Palace',
    news: 'News Nexus'
  };

  return pathwayNames[pathwayId] || pathwayId;
}

/**
 * ============================================================================
 * POST HANDLER - Leave Pathway
 * @route POST /api/pathways/leave
 * ============================================================================
 */
export async function POST(request) {
  try {
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
    const { pathwayId, archive = true } = body;

    // Validate pathway ID
    if (!pathwayId || !isValidPathway(pathwayId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid pathway ID',
          validPathways: ['gaming', 'lorebound', 'productive', 'news']
        },
        { status: 400 }
      );
    }

    // Get current pathway progress
    const progressData = await getPathwayProgress(sessionData.userId, pathwayId);

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

    // Archive progress if requested (default true)
    if (archive) {
      await archivePathwayProgress(progressData);
    }

    // Leave pathway
    await leavePathway(sessionData.userId, pathwayId);

    // Log pathway leave
    await logPathwayLeave(
      sessionData.userId,
      sessionData.username,
      pathwayId,
      progressData
    );

    return NextResponse.json({
      success: true,
      message: `Successfully left ${getPathwayName(pathwayId)}`,
      pathway: {
        id: pathwayId,
        name: getPathwayName(pathwayId),
        leftAt: new Date().toISOString()
      },
      stats: {
        finalProgress: progressData.progress,
        completedModules: progressData.completed_modules?.length || 0,
        daysActive: Math.floor(
          (new Date() - new Date(progressData.joined_at)) / (1000 * 60 * 60 * 24)
        ),
        archived: archive
      }
    });

  } catch (error) {
    console.error('Leave pathway error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to leave pathway',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

/**
 * ============================================================================
 * DELETE HANDLER - Leave Pathway (Alternative method)
 * @route DELETE /api/pathways/leave?pathway={pathwayId}
 * ============================================================================
 */
export async function DELETE(request) {
  try {
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

    // Get pathway ID from query params
    const url = new URL(request.url);
    const pathwayId = url.searchParams.get('pathway');

    // Validate pathway ID
    if (!pathwayId || !isValidPathway(pathwayId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid pathway ID',
          validPathways: ['gaming', 'lorebound', 'productive', 'news']
        },
        { status: 400 }
      );
    }

    // Get current pathway progress
    const progressData = await getPathwayProgress(sessionData.userId, pathwayId);

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

    // Archive progress
    await archivePathwayProgress(progressData);

    // Leave pathway
    await leavePathway(sessionData.userId, pathwayId);

    // Log pathway leave
    await logPathwayLeave(
      sessionData.userId,
      sessionData.username,
      pathwayId,
      progressData
    );

    return NextResponse.json({
      success: true,
      message: `Successfully left ${getPathwayName(pathwayId)}`,
      pathway: {
        id: pathwayId,
        name: getPathwayName(pathwayId),
        leftAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Leave pathway error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to leave pathway',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

/**
 * ============================================================================
 * OPTIONS HANDLER (CORS)
 * @route OPTIONS /api/pathways/leave
 * ============================================================================
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_SITE_URL || '*',
      'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}