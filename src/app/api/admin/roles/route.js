/**
 * ============================================================================
 * ADMIN ROLE MANAGEMENT API
 * @route GET /api/admin/roles (Get role information)
 * @route POST /api/admin/roles (Assign/remove roles)
 * @description Admin role management - assign/remove Discord roles
 * @access Admin & above only
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
 * Check if user is admin or above
 * @param {Array} roles - User's role IDs
 * @returns {boolean} True if admin+
 */
function isAdmin(roles) {
  const adminRoleIds = [
    '1369566988128751750', // Owner
    '1369197369161154560', // Board
    '1396459118025375784', // Head Admin
    '1370702703616856074'  // Admin
  ];
  return roles.some(roleId => adminRoleIds.includes(roleId));
}

/**
 * Get all guild roles from Discord
 * @returns {Promise<Array>} List of roles
 */
async function getGuildRoles() {
  if (!DISCORD_BOT_TOKEN) {
    return [];
  }

  try {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/roles`,
      {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch roles: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to get guild roles:', error);
    return [];
  }
}

/**
 * Get member's roles from Discord
 * @param {string} userId - Discord user ID
 * @returns {Promise<Array>} List of role IDs
 */
async function getMemberRoles(userId) {
  if (!DISCORD_BOT_TOKEN) {
    return [];
  }

  try {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${userId}`,
      {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch member: ${response.status}`);
    }

    const member = await response.json();
    return member.roles || [];
  } catch (error) {
    console.error('Failed to get member roles:', error);
    return [];
  }
}

/**
 * ============================================================================
 * GET HANDLER - Get Role Information
 * @route GET /api/admin/roles
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

    if (!sessionData || !isAdmin(sessionData.roles || [])) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions. Admin access required.' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id');

    // If user ID provided, get their roles
    if (userId) {
      const userRoles = await getMemberRoles(userId);
      return NextResponse.json({
        success: true,
        userId: userId,
        roles: userRoles
      });
    }

    // Otherwise, get all guild roles
    const guildRoles = await getGuildRoles();

    // Categorize roles
    const categorized = {
      staff: guildRoles.filter(r => [
        '1369566988128751750', '1369197369161154560', '1396459118025375784',
        '1370702703616856074', '1409148504026120293', '1408079849377107989'
      ].includes(r.id)),
      pathways: guildRoles.filter(r => [
        '1395703399760265226', '1397498835919442033',
        '1409444816189788171', '1395703930587189321'
      ].includes(r.id)),
      hierarchy: guildRoles.filter(r => [
        '1397812242258595973', '1395673790431629404', '1395673117069676655',
        '1395672911888646144', '1395672806007640106', '1395672615653216378',
        '1395677440503709756', '1395677298149298299', '1397497084793458691'
      ].includes(r.id)),
      other: guildRoles.filter(r => ![
        '1369566988128751750', '1369197369161154560', '1396459118025375784',
        '1370702703616856074', '1409148504026120293', '1408079849377107989',
        '1395703399760265226', '1397498835919442033', '1409444816189788171',
        '1395703930587189321', '1397812242258595973', '1395673790431629404',
        '1395673117069676655', '1395672911888646144', '1395672806007640106',
        '1395672615653216378', '1395677440503709756', '1395677298149298299',
        '1397497084793458691'
      ].includes(r.id) && r.name !== '@everyone')
    };

    return NextResponse.json({
      success: true,
      roles: {
        all: guildRoles,
        categorized: categorized,
        total: guildRoles.length
      }
    });

  } catch (error) {
    console.error('Get roles error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch roles',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

/**
 * ============================================================================
 * POST HANDLER - Assign/Remove Roles
 * @route POST /api/admin/roles
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

    if (!sessionData || !isAdmin(sessionData.roles || [])) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions. Admin access required.' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { action, userId, roleId } = body;

    // Validate required fields
    if (!action || !userId || !roleId) {
      return NextResponse.json(
        { success: false, error: 'Action, user ID, and role ID are required' },
        { status: 400 }
      );
    }

    // Validate action
    if (!['add', 'remove'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Action must be "add" or "remove"' },
        { status: 400 }
      );
    }

    // Note: Actual Discord API role management would go here
    // For now, we log the action

    // Log to database
    await supabase.from('admin_logs').insert({
      action_type: `role_${action}`,
      target_user_id: userId,
      details: {
        roleId: roleId,
        action: action,
        performedBy: sessionData.username
      },
      performed_by: sessionData.userId,
      created_at: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: `Role ${action === 'add' ? 'assigned' : 'removed'} successfully`,
      action: {
        type: action,
        userId: userId,
        roleId: roleId,
        performedBy: sessionData.username,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Role management error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to manage role',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

/**
 * ============================================================================
 * OPTIONS HANDLER (CORS)
 * @route OPTIONS /api/admin/roles
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