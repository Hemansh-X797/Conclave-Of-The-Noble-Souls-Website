
// ============================================================================
// /api/admin/moderation/route.js - Moderation Actions
// ============================================================================

export async function POST(request) {
  try {
    const session = await getServerSession();
    const body = await request.json();
    const { action, memberId, reason, duration, moderatorId } = body;

    // Verify permissions
    const requiredPerms = {
      ban: PERMISSIONS.BAN_MEMBERS,
      kick: PERMISSIONS.KICK_MEMBERS,
      timeout: PERMISSIONS.TIMEOUT_MEMBERS,
      warn: PERMISSIONS.CREATE_WARNINGS
    };

    if (!hasPermission(session.user.roles, requiredPerms[action])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Execute Discord action
    let discordResult;
    const baseUrl = `https://discord.com/api/v10/guilds/${process.env.DISCORD_GUILD_ID}/members/${memberId}`;

    switch (action) {
      case 'ban':
        discordResult = await fetch(`${baseUrl}/ban`, {
          method: 'PUT',
          headers: {
            Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            delete_message_days: 1,
            reason
          })
        });
        break;

      case 'kick':
        discordResult = await fetch(baseUrl, {
          method: 'DELETE',
          headers: {
            Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
            'X-Audit-Log-Reason': reason
          }
        });
        break;

      case 'timeout':
        const timeoutUntil = new Date(Date.now() + parseInt(duration) * 1000).toISOString();
        discordResult = await fetch(baseUrl, {
          method: 'PATCH',
          headers: {
            Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            communication_disabled_until: timeoutUntil
          })
        });
        break;

      case 'warn':
        // Store warning in database
        await supabase.from('warnings').insert({
          user_id: memberId,
          moderator_id: moderatorId,
          reason,
          created_at: new Date().toISOString()
        });
        break;
    }

    // Log the action
    await supabase.from('mod_logs').insert({
      action,
      user_id: memberId,
      moderator_id: moderatorId,
      reason,
      duration: action === 'timeout' ? duration : null,
      timestamp: new Date().toISOString()
    });

    // Send webhook notification
    await fetch(process.env.DISCORD_WEBHOOK_ADMIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: `🛡️ Moderation Action: ${action.toUpperCase()}`,
          description: `**Member:** <@${memberId}>\n**Reason:** ${reason}\n**Moderator:** <@${moderatorId}>`,
          color: 0xE0115F,
          timestamp: new Date().toISOString()
        }]
      })
    });

    return NextResponse.json({ 
      success: true, 
      updates: { [action]: true } 
    });

  } catch (error) {
    console.error('Moderation action failed:', error);
    return NextResponse.json({ error: 'Moderation action failed' }, { status: 500 });
  }
}

