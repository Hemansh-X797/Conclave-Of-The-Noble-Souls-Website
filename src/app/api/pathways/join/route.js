/**
 * ============================================================================
 * JOIN PATHWAY API
 * @route POST api/pathways/join
 * @description Allows authenticated users to join a pathway (instant, no restrictions)
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
 * Check if user already joined pathway
 * @param {number} userId - User database ID
 * @param {string} pathwayId - Pathway identifier
 * @returns {Promise<boolean>} True if already joined
 */
async function hasJoinedPathway(userId, pathwayId) {
  try {
    const { data, error } = await supabase
      .from('pathway_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('pathway_id', pathwayId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error('Failed to check pathway membership:', error);
    return false;
  }
}

/**
 * Add user to pathway
 * @param {number} userId - User database ID
 * @param {string} pathwayId - Pathway identifier
 * @returns {Promise<Object>} Created pathway progress record
 */
async function joinPathway(userId, pathwayId) {
  const { data, error } = await supabase
    .from('pathway_progress')
    .insert({
      user_id: userId,
      pathway_id: pathwayId,
      joined_at: new Date().toISOString(),
      progress: 0,
      completed_modules: [],
      last_activity: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Log pathway join activity
 * @param {number} userId - User database ID
 * @param {string} username - Discord username
 * @param {string} pathwayId - Pathway identifier
 */
async function logPathwayJoin(userId, username, pathwayId) {
  try {
    await supabase.from('discord_sync_log').insert({
      event_type: 'pathway_joined',
      status: 'success',
      details: {
        userId: userId,
        username: username,
        pathway: pathwayId
      },
      synced_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log pathway join:', error);
  }
}

/**
 * Get pathway information
 * @param {string} pathwayId - Pathway identifier
 * @returns {Object} Pathway details
 */
function getPathwayInfo(pathwayId) {
  const pathways = {
    gaming: {
      name: 'Gaming Realm',
      description: 'Compete in epic tournaments, dominate leaderboards, and join elite gaming guilds.',
      color: '#00BFFF',
      icon: '🎮',
      benefits: [
        'Access to exclusive gaming channels',
        'Tournament registration',
        'Gaming bot features',
        'Leaderboard tracking'
      ]
    },
    lorebound: {
      name: 'Lorebound Sanctuary',
      description: 'Immerse yourself in anime, manga, manhwa, and light novels.',
      color: '#6a0dad',
      icon: '🌙',
      benefits: [
        'Exclusive lorebound channels',
        'Anime/manga discussions',
        'Novel recommendations',
        'Library access'
      ]
    },
    productive: {
      name: 'Productive Palace',
      description: 'Master productivity, develop valuable skills, and achieve your goals.',
      color: '#50C878',
      icon: '💼',
      benefits: [
        'Productivity resources',
        'Skill development challenges',
        'Project showcases',
        'Accountability partners'
      ]
    },
    news: {
      name: 'News Nexus',
      description: 'Stay informed with breaking news, tech updates, and in-depth analysis.',
      color: '#E0115F',
      icon: '📰',
      benefits: [
        'Breaking news alerts',
        'Tech and science updates',
        'Discussion channels',
        'Analysis and debates'
      ]
    }
  };

  return pathways[pathwayId] || null;
}

/**
 * ============================================================================
 * POST HANDLER - Join Pathway
 * @route POST /api/pathways/join
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
    const { pathwayId } = body;

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

    // Check if already joined
    const alreadyJoined = await hasJoinedPathway(sessionData.userId, pathwayId);

    if (alreadyJoined) {
      return NextResponse.json(
        {
          success: false,
          error: 'You have already joined this pathway',
          pathway: pathwayId
        },
        { status: 409 }
      );
    }

    // Join pathway (instant, no restrictions as per requirements)
    const pathwayProgress = await joinPathway(sessionData.userId, pathwayId);

    // Get pathway information
    const pathwayInfo = getPathwayInfo(pathwayId);

    // Log pathway join
    await logPathwayJoin(sessionData.userId, sessionData.username, pathwayId);

    return NextResponse.json({
      success: true,
      message: `Successfully joined ${pathwayInfo.name}!`,
      pathway: {
        id: pathwayId,
        name: pathwayInfo.name,
        description: pathwayInfo.description,
        color: pathwayInfo.color,
        icon: pathwayInfo.icon,
        benefits: pathwayInfo.benefits,
        joinedAt: pathwayProgress.joined_at
      },
      progress: {
        id: pathwayProgress.id,
        progress: pathwayProgress.progress,
        completedModules: pathwayProgress.completed_modules,
        lastActivity: pathwayProgress.last_activity
      }
    });

  } catch (error) {
    console.error('Join pathway error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to join pathway',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

/**
 * ============================================================================
 * OPTIONS HANDLER (CORS)
 * @route OPTIONS /api/pathways/join
 * ============================================================================
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_SITE_URL || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}