// ============================================================================
// DISCORD GUILD MEMBERS API
// Location: /src/app/api/discord/members/route.js
// Fetches guild member list (staff only)
// ============================================================================

import { NextResponse } from 'next/server';

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;

// Cache configuration
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
let cachedMembers = null;
let cacheTimestamp = 0;

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
 * Fetch guild members from Discord API
 */
async function fetchGuildMembers(limit = 1000, after = null) {
  const url = new URL(`https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members`);
  url.searchParams.set('limit', limit.toString());
  if (after) {
    url.searchParams.set('after', after);
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bot ${DISCORD_BOT_TOKEN}`
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch members: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Fetch all guild members (with pagination)
 */
async function fetchAllGuildMembers() {
  let allMembers = [];
  let after = null;
  let hasMore = true;

  while (hasMore) {
    const members = await fetchGuildMembers(1000, after);
    
    if (members.length === 0) {
      hasMore = false;
    } else {
      allMembers = allMembers.concat(members);
      
      if (members.length < 1000) {
        hasMore = false;
      } else {
        after = members[members.length - 1].user.id;
      }
    }
  }

  return allMembers;
}

/**
 * Format member data
 */
function formatMember(member) {
  return {
    id: member.user.id,
    username: member.user.username,
    discriminator: member.user.discriminator,
    displayName: member.nick || member.user.username,
    avatar: member.user.avatar
      ? `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png`
      : null,
    roles: member.roles,
    status: m.presence?.status || 'offline',
    vip: m.roles.includes('1404790723751968883'),
    joinedAt: member.joined_at,
    premiumSince: member.premium_since,
    isBot: member.user.bot || false
  };
}

/**
 * Filter members by role
 */
function filterByRole(members, roleId) {
  return members.filter(member => member.roles.includes(roleId));
}

/**
 * Get staff members only
 */
function getStaffMembers(members) {
  const staffRoleIds = [
    '1369566988128751750', // Owner
    '1369197369161154560', // Board
    '1396459118025375784', // Head Admin
    '1370702703616856074', // Admin
    '1409148504026120293', // Head Mod
    '1408079849377107989'  // Moderator
  ];

  return members.filter(member =>
    member.roles.some(roleId => staffRoleIds.includes(roleId))
  );
}

/**
 * Sort members by role hierarchy
 */
function sortByRoleHierarchy(members) {
  const roleHierarchy = {
    '1369566988128751750': 100, // Owner
    '1369197369161154560': 90,  // Board
    '1396459118025375784': 80,  // Head Admin
    '1370702703616856074': 70,  // Admin
    '1409148504026120293': 60,  // Head Mod
    '1408079849377107989': 50   // Moderator
  };

  return members.sort((a, b) => {
    const aHighest = Math.max(...a.roles.map(r => roleHierarchy[r] || 0));
    const bHighest = Math.max(...b.roles.map(r => roleHierarchy[r] || 0));
    return bHighest - aHighest;
  });
}

// ============================================================================
// GET HANDLER - Get Guild Members
// ============================================================================
export async function GET(request) {
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

    // Check if user is staff (required to view member list)
    if (!isStaffMember(sessionData.roles || [])) {
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient permissions. Staff only.'
        },
        { status: 403 }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const roleFilter = url.searchParams.get('role');
    const staffOnly = url.searchParams.get('staff_only') === 'true';
    const excludeBots = url.searchParams.get('exclude_bots') !== 'false'; // Default true
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const useCache = url.searchParams.get('cache') !== 'false'; // Default true

    // Check cache
    const now = Date.now();
    if (useCache && cachedMembers && (now - cacheTimestamp) < CACHE_DURATION) {
      let members = cachedMembers;

      // Apply filters
      if (excludeBots) {
        members = members.filter(m => !m.isBot);
      }
      if (staffOnly) {
        members = getStaffMembers(members);
      }
      if (roleFilter) {
        members = filterByRole(members, roleFilter);
      }

      // Apply limit
      members = members.slice(0, limit);

      return NextResponse.json({
        success: true,
        members: members,
        total: members.length,
        cached: true,
        cachedAt: new Date(cacheTimestamp).toISOString()
      });
    }

    // Fetch fresh members
    const rawMembers = await fetchAllGuildMembers();
    let members = rawMembers.map(formatMember);

    // Update cache
    cachedMembers = members;
    cacheTimestamp = now;

    // Apply filters
    if (excludeBots) {
      members = members.filter(m => !m.isBot);
    }
    if (staffOnly) {
      members = getStaffMembers(members);
      members = sortByRoleHierarchy(members);
    }
    if (roleFilter) {
      members = filterByRole(members, roleFilter);
    }

    // Apply limit
    members = members.slice(0, limit);

    return NextResponse.json({
      success: true,
      members: members,
      total: members.length,
      cached: false,
      fetchedAt: new Date(now).toISOString()
    });

  } catch (error) {
    console.error('Discord members error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch guild members',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Service unavailable'
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST HANDLER - Search Members
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
          error: 'Authentication required'
        },
        { status: 401 }
      );
    }

    // Parse session
    const sessionData = parseSessionToken(sessionToken);

    if (!sessionData || !isStaffMember(sessionData.roles || [])) {
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient permissions'
        },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { query, roles, excludeBots = true } = body;

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: 'Search query must be at least 2 characters'
        },
        { status: 400 }
      );
    }

    // Use cached members or fetch fresh
    let members = cachedMembers;
    if (!members || (Date.now() - cacheTimestamp) > CACHE_DURATION) {
      const rawMembers = await fetchAllGuildMembers();
      members = rawMembers.map(formatMember);
      cachedMembers = members;
      cacheTimestamp = Date.now();
    }

    // Filter by query (username or display name)
    const searchQuery = query.toLowerCase();
    let results = members.filter(member =>
      member.username.toLowerCase().includes(searchQuery) ||
      member.displayName.toLowerCase().includes(searchQuery)
    );

    // Apply filters
    if (excludeBots) {
      results = results.filter(m => !m.isBot);
    }
    if (roles && Array.isArray(roles) && roles.length > 0) {
      results = results.filter(member =>
        roles.some(roleId => member.roles.includes(roleId))
      );
    }

    // Limit to 50 results
    results = results.slice(0, 50);

    return NextResponse.json({
      success: true,
      members: results,
      total: results.length,
      query: query
    });

  } catch (error) {
    console.error('Member search error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search members',
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