/**
 * ============================================================================
 * ADMIN MODERATION API
 * @route POST /api/admin/moderation (Perform moderation action)
 * @route GET /api/admin/moderation (Get moderation logs)
 * @description Admin moderation actions - ban, kick, timeout, warn
 * @access Moderators & above
 * ============================================================================
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;

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
 * Check if user is moderator or above
 * @param {Array} roles - User's role IDs
 * @returns {boolean} True if mod+
 */
function isModerator(roles) {
  const modRoleIds = [
    '1369566988128751750', '1369197369161154560', '1396459118025375784',
    '1370702703616856074', '1409148504026120293', '1408079849377107989'
  ];
  return roles.some(roleId => modRoleIds.includes(roleId));
}

/**
 * Log moderation action to database
 * @param {Object} actionData - Moderation action data
 * @returns {Promise<void>}
 */
async function logModerationAction(actionData) {
  try {
    await supabase.from('moderation_logs').insert({
      action_type: actionData.action,
      target_user_id: actionData.targetUserId,
      target_username: actionData.targetUsername,
      moderator_id: actionData.moderatorId,
      moderator_username: actionData.moderatorUsername,
      reason: actionData.reason,
      duration: actionData.duration,
      guild_id: DISCORD_GUILD_ID,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log moderation action:', error);
  }
}

/**
 * ============================================================================
 * POST HANDLER - Perform Moderation Action
 * @route POST /api/admin/moderation
 * ============================================================================
 */
export async function POST(request) {
  try {
    // Get session token
    const sessionToken = request.cookies.get('conclave_session')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse session
    const sessionData = parseSessionToken(sessionToken);

    if (!sessionData || !isModerator(sessionData.roles || [])) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions. Moderator access required.' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { action, targetUserId, reason, duration } = body;

    // Validate required fields
    if (!action || !targetUserId) {
      return NextResponse.json(
        { success: false, error: 'Action and target user ID are required' },
        { status: 400 }
      );
    }

    // Validate action type
    const validActions = ['ban', 'kick', 'timeout', 'warn'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action type' },
        { status: 400 }
      );
    }

    // Note: Actual Discord API calls would go here
    // For now, we just log the action
    
    // Log moderation action
    await logModerationAction({
      action: action,
      targetUserId: targetUserId,
      targetUsername: body.targetUsername || 'Unknown',
      moderatorId: sessionData.userId,
      moderatorUsername: sessionData.username,
      reason: reason || 'No reason provided',
      duration: duration
    });

    // Log to Discord sync
    await supabase.from('discord_sync_log').insert({
      event_type: 'moderation_action',
      status: 'success',
      details: {
        action: action,
        targetUserId: targetUserId,
        moderator: sessionData.username,
        reason: reason
      },
      synced_at: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: `${action.charAt(0).toUpperCase() + action.slice(1)} action logged successfully`,
      action: {
        type: action,
        targetUserId: targetUserId,
        moderator: sessionData.username,
        reason: reason,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Moderation action error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to perform moderation action',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

/**
 * ============================================================================
 * GET HANDLER - Get Moderation Logs
 * @route GET /api/admin/moderation
 * ============================================================================
 */
export async function GET(request) {
  try {
    // Get session token
    const sessionToken = request.cookies.get('conclave_session')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse session
    const sessionData = parseSessionToken(sessionToken);

    if (!sessionData || !isModerator(sessionData.roles || [])) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions. Moderator access required.' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    const targetUserId = url.searchParams.get('target_user_id');
    const moderatorId = url.searchParams.get('moderator_id');
    const limit = parseInt(url.searchParams.get('limit') || '50');

    // Build query
    let query = supabase
      .from('moderation_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (action) {
      query = query.eq('action_type', action);
    }

    if (targetUserId) {
      query = query.eq('target_user_id', targetUserId);
    }

    if (moderatorId) {
      query = query.eq('moderator_id', moderatorId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      logs: data || [],
      total: data?.length || 0
    });

  } catch (error) {
    console.error('Get moderation logs error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch moderation logs',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

/**
 * ============================================================================
 * OPTIONS HANDLER (CORS)
 * @route OPTIONS /api/admin/moderation
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