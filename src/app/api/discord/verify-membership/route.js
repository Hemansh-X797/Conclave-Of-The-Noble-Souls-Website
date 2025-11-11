// ============================================================================
// VERIFY DISCORD MEMBERSHIP API
// Location: /src/app/api/discord/verify-membership/route.js
// Verifies if user is a member of The Conclave Discord server
// ============================================================================

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;

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
 * Check if user is guild member using bot token
 */
async function checkGuildMembership(discordId) {
  try {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${discordId}`,
      {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`
        }
      }
    );

    if (response.status === 404) {
      return { isMember: false, memberData: null };
    }

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status}`);
    }

    const memberData = await response.json();
    return { isMember: true, memberData: memberData };

  } catch (error) {
    console.error('Failed to check guild membership:', error);
    throw error;
  }
}

/**
 * Update user membership status in database
 */
async function updateMembershipStatus(userId, isMember, roles = []) {
  try {
    await supabase
      .from('users')
      .update({
        is_server_member: isMember,
        roles: roles,
        membership_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
  } catch (error) {
    console.error('Failed to update membership status:', error);
  }
}

/**
 * Get user's pathway roles
 */
function getPathwayRoles(roles) {
  const pathwayRoleIds = {
    '1395703399760265226': 'gaming',
    '1397498835919442033': 'lorebound',
    '1409444816189788171': 'productive',
    '1395703930587189321': 'news'
  };

  const pathways = [];
  roles.forEach(roleId => {
    if (pathwayRoleIds[roleId]) {
      pathways.push(pathwayRoleIds[roleId]);
    }
  });

  return pathways;
}

/**
 * Check if user is staff
 */
function isStaffMember(roles) {
  const staffRoleIds = [
    '1369566988128751750', // Owner
    '1369197369161154560', // Board
    '1396459118025375784', // Head Admin
    '1370702703616856074', // Admin
    '1409148504026120293', // Head Mod
    '1408079849377107989'  // Moderator
  ];

  return roles.some(roleId => staffRoleIds.includes(roleId));
}

/**
 * Check if user is VIP
 */
function isVIPMember(roles) {
  return roles.includes('1404790723751968883'); // VIP role
}

/**
 * Get member tier based on roles
 */
function getMemberTier(roles) {
  const hierarchyRoles = {
    '1397812242258595973': 'Grand Duke',
    '1395673790431629404': 'Duke',
    '1395673117069676655': 'Margrave',
    '1395672911888646144': 'Count',
    '1395672806007640106': 'Viscount',
    '1395672615653216378': 'Baron',
    '1395677440503709756': 'Knight',
    '1395677298149298299': 'Citizen',
    '1397497084793458691': 'Noble Soul'
  };

  for (const [roleId, tierName] of Object.entries(hierarchyRoles)) {
    if (roles.includes(roleId)) {
      return tierName;
    }
  }

  return null;
}

// ============================================================================
// POST HANDLER - Verify Membership
// ============================================================================
export async function POST(request) {
  try {
    // Check if bot token is configured
    if (!DISCORD_BOT_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          error: 'Discord bot not configured'
        },
        { status: 503 }
      );
    }

    // Get session token
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

    // Check membership
    const { isMember, memberData } = await checkGuildMembership(sessionData.discordId);

    // Update database
    await updateMembershipStatus(
      sessionData.userId,
      isMember,
      memberData?.roles || []
    );

    // Build response
    const response = {
      success: true,
      isMember: isMember,
      discordId: sessionData.discordId,
      username: sessionData.username
    };

    if (isMember && memberData) {
      const pathways = getPathwayRoles(memberData.roles);
      const isStaff = isStaffMember(memberData.roles);
      const isVIP = isVIPMember(memberData.roles);
      const tier = getMemberTier(memberData.roles);

      response.memberInfo = {
        nickname: memberData.nick || null,
        joinedAt: memberData.joined_at,
        roles: memberData.roles,
        pathways: pathways,
        tier: tier,
        isStaff: isStaff,
        isVIP: isVIP,
        isPremium: memberData.premium_since !== null
      };
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Membership verification error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to verify membership',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Service unavailable'
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET HANDLER - Check Membership (without auth)
// ============================================================================
export async function GET(request) {
  try {
    // Get Discord ID from query params
    const url = new URL(request.url);
    const discordId = url.searchParams.get('discord_id');

    if (!discordId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Discord ID is required'
        },
        { status: 400 }
      );
    }

    // Check if bot token is configured
    if (!DISCORD_BOT_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          error: 'Discord bot not configured'
        },
        { status: 503 }
      );
    }

    // Check membership
    const { isMember, memberData } = await checkGuildMembership(discordId);

    const response = {
      success: true,
      isMember: isMember,
      discordId: discordId
    };

    if (isMember && memberData) {
      response.memberInfo = {
        joinedAt: memberData.joined_at,
        roleCount: memberData.roles.length,
        isPremium: memberData.premium_since !== null
      };
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Membership check error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check membership',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Service unavailable'
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