
// ============================================================================
// /api/discord/members/route.js - Member List
// ============================================================================

export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session || !hasPermission(session.user.roles, PERMISSIONS.MANAGE_MEMBERS)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const detailed = searchParams.get('detailed') === 'true';
    const includeRoles = searchParams.get('includeRoles') === 'true';

    // Fetch members from Discord
    const members = await fetch(
      `https://discord.com/api/v10/guilds/${process.env.DISCORD_GUILD_ID}/members?limit=1000`,
      {
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`
        }
      }
    ).then(res => res.json());

    // Enhance with database info if detailed
    if (detailed) {
      // Fetch from your database (Supabase example)
      const { data: memberStats } = await supabase
        .from('member_stats')
        .select('*');

      const statsMap = new Map(memberStats?.map(m => [m.user_id, m]) || []);

      const enrichedMembers = members.map(m => ({
        id: m.user.id,
        username: m.user.username,
        discriminator: m.user.discriminator,
        avatar: m.user.avatar,
        roles: includeRoles ? m.roles : [],
        joinedAt: m.joined_at,
        status: m.presence?.status || 'offline',
        banned: false, // Check ban list
        vip: m.roles.includes('1404790723751968883'),
        level: statsMap.get(m.user.id)?.level || 1,
        xp: statsMap.get(m.user.id)?.xp || 0,
        messageCount: statsMap.get(m.user.id)?.message_count || 0,
        reputation: statsMap.get(m.user.id)?.reputation || 0
      }));

      return NextResponse.json({ members: enrichedMembers });
    }

    return NextResponse.json({ members });

  } catch (error) {
    console.error('Failed to fetch members:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}

