// ============================================================================
// GET PATHWAY PROGRESS API
// Fetch user's progress in specific pathway
// Location: /src/app/api/pathways/[pathwayId]/progress/[userId]/route.js
// ============================================================================

import { NextResponse } from 'next/server';
import { getPathwayById } from '@/data';
import { initializePathwayProgress } from '@/types/pathway';

export async function GET(request, { params }) {
  try {
    const { pathwayId, userId } = params;

    // Validate pathway
    const pathway = getPathwayById(pathwayId);
    if (!pathway) {
      return NextResponse.json(
        { error: 'Invalid pathway ID' },
        { status: 400 }
      );
    }

    // TODO: Fetch from database (Supabase)
    // For now, return initialized progress
    const progress = initializePathwayProgress(userId, pathwayId);

    // TODO: When database is connected, replace with:
    /*
    const { data, error } = await supabase
      .from('pathway_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('pathway_id', pathwayId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    const progress = data || initializePathwayProgress(userId, pathwayId);
    */

    return NextResponse.json(progress);

  } catch (error) {
    console.error('Get progress error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}/**
 * ============================================================================
 * USER PATHWAY PROGRESS API
 * @route GET /api/pathways/[pathwayId]/progress/[userId]
 * @description Get pathway progress for a specific user (public view)
 * @access Public (for viewing other users' progress)
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
 * Validate pathway ID
 * @param {string} pathwayId - Pathway identifier
 * @returns {boolean} True if valid pathway
 */
function isValidPathway(pathwayId) {
  const validPathways = ['gaming', 'lorebound', 'productive', 'news'];
  return validPathways.includes(pathwayId?.toLowerCase());
}

/**
 * Get user information
 * @param {number} userId - User database ID
 * @returns {Promise<Object|null>} User data or null
 */
async function getUserInfo(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, discord_id, username, discriminator, avatar_url')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to get user info:', error);
    return null;
  }
}

/**
 * Get pathway progress for specific user
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
 * Get pathway leaderboard
 * @param {string} pathwayId - Pathway identifier
 * @param {number} limit - Number of top users to return
 * @returns {Promise<Array>} Top users in pathway
 */
async function getLeaderboard(pathwayId, limit = 10) {
  try {
    const { data, error } = await supabase
      .from('pathway_progress')
      .select(`
        user_id,
        progress,
        completed_modules,
        users (
          username,
          discriminator,
          avatar_url
        )
      `)
      .eq('pathway_id', pathwayId)
      .order('progress', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data.map((item, index) => ({
      rank: index + 1,
      userId: item.user_id,
      username: item.users.username,
      discriminator: item.users.discriminator,
      avatarUrl: item.users.avatar_url,
      progress: item.progress,
      completedModules: item.completed_modules?.length || 0
    }));
  } catch (error) {
    console.error('Failed to get leaderboard:', error);
    return [];
  }
}

/**
 * Calculate user rank in pathway
 * @param {number} userId - User database ID
 * @param {string} pathwayId - Pathway identifier
 * @returns {Promise<Object>} Rank information
 */
async function calculateRank(userId, pathwayId) {
  try {
    const { data, error } = await supabase
      .from('pathway_progress')
      .select('user_id, progress')
      .eq('pathway_id', pathwayId)
      .order('progress', { ascending: false });

    if (error) throw error;

    const totalUsers = data.length;
    const userIndex = data.findIndex(item => item.user_id === userId);
    const rank = userIndex >= 0 ? userIndex + 1 : null;

    // Calculate percentile
    const percentile = rank ? Math.round(((totalUsers - rank + 1) / totalUsers) * 100) : null;

    return {
      rank: rank,
      totalUsers: totalUsers,
      percentile: percentile
    };
  } catch (error) {
    console.error('Failed to calculate rank:', error);
    return {
      rank: null,
      totalUsers: 0,
      percentile: null
    };
  }
}

/**
 * Calculate statistics
 * @param {Object} progressData - Progress data
 * @returns {Object} Calculated stats
 */
function calculateStats(progressData) {
  const joinedDate = new Date(progressData.joined_at);
  const now = new Date();
  const daysActive = Math.floor((now - joinedDate) / (1000 * 60 * 60 * 24));
  
  const lastActivity = new Date(progressData.last_activity);
  const daysSinceActivity = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));

  // Calculate completion rate (assuming 100% is full completion)
  const completionRate = progressData.progress || 0;

  return {
    progress: progressData.progress || 0,
    completedModules: progressData.completed_modules?.length || 0,
    daysActive: daysActive,
    daysSinceLastActivity: daysSinceActivity,
    isActive: daysSinceActivity < 7,
    completionRate: completionRate,
    joinedAt: progressData.joined_at,
    lastActivity: progressData.last_activity
  };
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
 * GET HANDLER - Get User Pathway Progress
 * @route GET /api/pathways/[pathwayId]/progress/[userId]
 * ============================================================================
 */
export async function GET(request, { params }) {
  try {
    const pathwayId = params.pathwayId;
    const userId = parseInt(params.userId);

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

    // Validate user ID
    if (!userId || isNaN(userId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid user ID'
        },
        { status: 400 }
      );
    }

    // Get user information
    const userInfo = await getUserInfo(userId);

    if (!userInfo) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found'
        },
        { status: 404 }
      );
    }

    // Get progress
    const progressData = await getProgress(userId, pathwayId);

    if (!progressData) {
      return NextResponse.json(
        {
          success: false,
          error: 'User is not a member of this pathway',
          user: {
            id: userInfo.id,
            username: userInfo.username,
            discriminator: userInfo.discriminator
          },
          pathway: pathwayId
        },
        { status: 404 }
      );
    }

    // Calculate stats
    const stats = calculateStats(progressData);

    // Calculate rank
    const rankInfo = await calculateRank(userId, pathwayId);

    // Parse query params for additional data
    const url = new URL(request.url);
    const includeLeaderboard = url.searchParams.get('leaderboard') === 'true';

    const response = {
      success: true,
      pathway: {
        id: pathwayId,
        name: getPathwayName(pathwayId)
      },
      user: {
        id: userInfo.id,
        discordId: userInfo.discord_id,
        username: userInfo.username,
        discriminator: userInfo.discriminator,
        avatarUrl: userInfo.avatar_url
      },
      progress: {
        progress: progressData.progress,
        completedModules: progressData.completed_modules || [],
        joinedAt: progressData.joined_at,
        lastActivity: progressData.last_activity
      },
      stats: stats,
      rank: rankInfo
    };

    // Include leaderboard if requested
    if (includeLeaderboard) {
      const leaderboard = await getLeaderboard(pathwayId, 10);
      response.leaderboard = leaderboard;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Get user pathway progress error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get user pathway progress',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

/**
 * ============================================================================
 * OPTIONS HANDLER (CORS)
 * @route OPTIONS /api/pathways/[pathwayId]/progress/[userId]
 * ============================================================================
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_SITE_URL || '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}