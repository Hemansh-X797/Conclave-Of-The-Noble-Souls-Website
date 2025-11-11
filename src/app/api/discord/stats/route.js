// ============================================================================
// DISCORD SERVER STATS API
// Location: /src/app/api/discord/stats/route.js
// Fetches real-time Discord server statistics
// ============================================================================

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let cachedStats = null;
let cacheTimestamp = 0;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Fetch guild data from Discord API
 */
async function fetchGuildData() {
  const response = await fetch(
    `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}?with_counts=true`,
    {
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`
      }
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch guild: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Fetch guild channels
 */
async function fetchGuildChannels() {
  const response = await fetch(
    `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/channels`,
    {
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`
      }
    }
  );

  if (!response.ok) {
    return [];
  }

  return await response.json();
}

/**
 * Fetch guild roles
 */
async function fetchGuildRoles() {
  const response = await fetch(
    `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/roles`,
    {
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`
      }
    }
  );

  if (!response.ok) {
    return [];
  }

  return await response.json();
}

/**
 * Count channels by type
 */
function countChannelTypes(channels) {
  const counts = {
    text: 0,
    voice: 0,
    category: 0,
    announcement: 0,
    stage: 0,
    forum: 0
  };

  channels.forEach(channel => {
    switch (channel.type) {
      case 0: // GUILD_TEXT
        counts.text++;
        break;
      case 2: // GUILD_VOICE
        counts.voice++;
        break;
      case 4: // GUILD_CATEGORY
        counts.category++;
        break;
      case 5: // GUILD_ANNOUNCEMENT
        counts.announcement++;
        break;
      case 13: // GUILD_STAGE_VOICE
        counts.stage++;
        break;
      case 15: // GUILD_FORUM
        counts.forum++;
        break;
    }
  });

  return counts;
}

/**
 * Get boost tier info
 */
function getBoostTierInfo(level, boostCount) {
  const tiers = {
    0: { name: 'None', perks: 0, requiredBoosts: 0 },
    1: { name: 'Level 1', perks: 8, requiredBoosts: 2 },
    2: { name: 'Level 2', perks: 15, requiredBoosts: 7 },
    3: { name: 'Level 3', perks: 30, requiredBoosts: 14 }
  };

  const currentTier = tiers[level] || tiers[0];
  const nextTier = tiers[level + 1];

  return {
    current: currentTier,
    next: nextTier,
    progress: nextTier 
      ? Math.min(100, (boostCount / nextTier.requiredBoosts) * 100)
      : 100
  };
}

/**
 * Update stats in database
 */
async function updateStatsInDatabase(stats) {
  try {
    await supabase
      .from('server_stats')
      .upsert({
        guild_id: DISCORD_GUILD_ID,
        member_count: stats.memberCount,
        online_count: stats.onlineCount,
        boost_count: stats.boostCount,
        boost_level: stats.boostLevel,
        channel_count: stats.channels.total,
        role_count: stats.roles.total,
        updated_at: new Date().toISOString()
      }, { onConflict: 'guild_id' });
  } catch (error) {
    console.error('Failed to update stats in database:', error);
  }
}

/**
 * Build complete stats object
 */
async function buildStatsObject() {
  // Fetch data from Discord
  const [guildData, channels, roles] = await Promise.all([
    fetchGuildData(),
    fetchGuildChannels(),
    fetchGuildRoles()
  ]);

  const channelCounts = countChannelTypes(channels);
  const boostTier = getBoostTierInfo(
    guildData.premium_tier || 0,
    guildData.premium_subscription_count || 0
  );

  const stats = {
    guildId: guildData.id,
    name: guildData.name,
    description: guildData.description,
    icon: guildData.icon 
      ? `https://cdn.discordapp.com/icons/${guildData.id}/${guildData.icon}.png`
      : null,
    banner: guildData.banner
      ? `https://cdn.discordapp.com/banners/${guildData.id}/${guildData.banner}.png`
      : null,
    memberCount: guildData.approximate_member_count || 0,
    onlineCount: guildData.approximate_presence_count || 0,
    boostCount: guildData.premium_subscription_count || 0,
    boostLevel: guildData.premium_tier || 0,
    boostTier: boostTier,
    verificationLevel: guildData.verification_level,
    createdAt: new Date(
      Number(BigInt(guildData.id) >> 22n) + 1420070400000
    ).toISOString(),
    channels: {
      total: channels.length,
      text: channelCounts.text,
      voice: channelCounts.voice,
      category: channelCounts.category,
      announcement: channelCounts.announcement,
      stage: channelCounts.stage,
      forum: channelCounts.forum
    },
    roles: {
      total: roles.length,
      list: roles
        .filter(r => r.name !== '@everyone')
        .map(r => ({
          id: r.id,
          name: r.name,
          color: r.color,
          position: r.position
        }))
        .sort((a, b) => b.position - a.position)
    },
    features: guildData.features || [],
    vanityUrl: guildData.vanity_url_code 
      ? `https://discord.gg/${guildData.vanity_url_code}`
      : null
  };

  // Update database
  await updateStatsInDatabase(stats);

  return stats;
}

// ============================================================================
// GET HANDLER - Get Server Stats
// ============================================================================
export async function GET(request) {
  try {
    // Check if bot token is configured
    if (!DISCORD_BOT_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          error: 'Discord bot token not configured'
        },
        { status: 503 }
      );
    }

    // Check cache
    const now = Date.now();
    const useCache = request.url.includes('cache=false') ? false : true;

    if (useCache && cachedStats && (now - cacheTimestamp) < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        stats: cachedStats,
        cached: true,
        cachedAt: new Date(cacheTimestamp).toISOString()
      });
    }

    // Fetch fresh stats
    const stats = await buildStatsObject();

    // Update cache
    cachedStats = stats;
    cacheTimestamp = now;

    return NextResponse.json({
      success: true,
      stats: stats,
      cached: false,
      fetchedAt: new Date(now).toISOString()
    });

  } catch (error) {
    console.error('Discord stats error:', error);

    // Try to return cached data if available
    if (cachedStats) {
      return NextResponse.json({
        success: true,
        stats: cachedStats,
        cached: true,
        error: 'Failed to fetch fresh data, returning cached',
        cachedAt: new Date(cacheTimestamp).toISOString()
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Discord stats',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Service unavailable'
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST HANDLER - Force Refresh Stats
// ============================================================================
export async function POST(request) {
  try {
    // Check if bot token is configured
    if (!DISCORD_BOT_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          error: 'Discord bot token not configured'
        },
        { status: 503 }
      );
    }

    // Fetch fresh stats (bypass cache)
    const stats = await buildStatsObject();

    // Update cache
    cachedStats = stats;
    cacheTimestamp = Date.now();

    return NextResponse.json({
      success: true,
      message: 'Stats refreshed successfully',
      stats: stats,
      refreshedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Discord stats refresh error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to refresh Discord stats',
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
    },
  });
}