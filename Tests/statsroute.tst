
// ============================================================================
// /api/discord/stats/route.js - Analytics Dashboard Stats
// ============================================================================

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { hasPermission, PERMISSIONS } from '@/constants/permissions';

export async function GET(request) {
  try {
    // Authentication check
    const session = await getServerSession();
    if (!session || !hasPermission(session.user.roles, PERMISSIONS.VIEW_ANALYTICS)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get time range from query params
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d';

    // Calculate date range
    const now = new Date();
    const ranges = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
      'all': Number.MAX_SAFE_INTEGER
    };
    const since = new Date(now - (ranges[timeRange] || ranges['7d']));

    // Fetch from Discord API
    const guild = await fetch(
      `https://discord.com/api/v10/guilds/${process.env.DISCORD_GUILD_ID}`,
      {
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`
        }
      }
    ).then(res => res.json());

    // Fetch members with presence
    const members = await fetch(
      `https://discord.com/api/v10/guilds/${process.env.DISCORD_GUILD_ID}/members?limit=1000`,
      {
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`
        }
      }
    ).then(res => res.json());

    // Calculate stats
    const onlineMembers = members.filter(m => 
      m.presence?.status === 'online' || 
      m.presence?.status === 'idle' || 
      m.presence?.status === 'dnd'
    ).length;

    const newMembers = members.filter(m => 
      new Date(m.joined_at) >= since
    ).length;

    // Mock pathway stats (replace with real data from your database)
    const pathways = {
      gaming: { members: 245, activity: 78, trend: 12 },
      lorebound: { members: 189, activity: 65, trend: 8 },
      productive: { members: 156, activity: 82, trend: 15 },
      news: { members: 203, activity: 71, trend: -3 }
    };

    // Mock moderation stats (fetch from your database)
    const moderation = {
      totalActions: 47,
      bans: 12,
      kicks: 8,
      warnings: 23,
      timeouts: 4
    };

    // Mock engagement stats (fetch from your database/bot)
    const engagement = {
      messageRate: 342,
      voiceMinutes: 15680,
      eventsAttended: 89,
      reactionsGiven: 2456
    };

    // Mock growth data (last 24 hours)
    const growth = {
      members: Array.from({ length: 24 }, (_, i) => Math.floor(Math.random() * 50) + 100),
      messages: Array.from({ length: 24 }, (_, i) => Math.floor(Math.random() * 200) + 300),
      events: Array.from({ length: 24 }, (_, i) => Math.floor(Math.random() * 10))
    };

    // Mock recent activity (fetch from your database)
    const recentActivity = [
      { icon: '👥', message: 'New member joined', timestamp: '2 minutes ago', pathway: 'gaming' },
      { icon: '🎮', message: 'Tournament started', timestamp: '15 minutes ago', pathway: 'gaming' },
      { icon: '📢', message: 'Announcement posted', timestamp: '1 hour ago', pathway: 'default' },
      { icon: '⚠️', message: 'Warning issued', timestamp: '2 hours ago', pathway: 'news' },
      { icon: '✨', message: 'Level up: Member reached Level 50', timestamp: '3 hours ago', pathway: 'productive' }
    ];

    return NextResponse.json({
      memberCount: guild.approximate_member_count || members.length,
      activeMemberCount: Math.floor(members.length * 0.65),
      newMemberCount: newMembers,
      onlineCount: onlineMembers,
      messageCount: 45823, // Fetch from bot database
      eventCount: 23, // Fetch from events table
      growth,
      pathways,
      moderation,
      engagement,
      recentActivity
    });

  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}

