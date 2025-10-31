
// ============================================================================
// /api/admin/roles/route.js - Role Management
// ============================================================================

export async function POST(request) {
  try {
    const session = await getServerSession();
    const body = await request.json();
    const { memberId, roleId, action, moderatorId } = body;

    if (!hasPermission(session.user.roles, PERMISSIONS.MANAGE_ROLES)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Add or remove role
    const method = action === 'add' ? 'PUT' : 'DELETE';
    const result = await fetch(
      `https://discord.com/api/v10/guilds/${process.env.DISCORD_GUILD_ID}/members/${memberId}/roles/${roleId}`,
      {
        method,
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
          'X-Audit-Log-Reason': `Role ${action} by moderator`
        }
      }
    );

    if (!result.ok) {
      throw new Error('Failed to update role');
    }

    // Log the action
    await supabase.from('role_logs').insert({
      user_id: memberId,
      role_id: roleId,
      action,
      moderator_id: moderatorId,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Role update failed:', error);
    return NextResponse.json({ error: 'Role update failed' }, { status: 500 });
  }
}

