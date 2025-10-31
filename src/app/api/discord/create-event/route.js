
// ============================================================================
// /api/discord/create-event/route.js - Create Discord Scheduled Event
// ============================================================================

export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!hasPermission(session.user.roles, PERMISSIONS.CREATE_EVENTS)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { eventId } = body;

    // Fetch event from database
    const { data: event } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    // Create Discord scheduled event
    const discordEvent = await fetch(
      `https://discord.com/api/v10/guilds/${process.env.DISCORD_GUILD_ID}/scheduled-events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: event.title,
          description: event.description,
          scheduled_start_time: event.start_date,
          scheduled_end_time: event.end_date,
          privacy_level: 2, // GUILD_ONLY
          entity_type: event.location === 'external' ? 3 : 2, // EXTERNAL or VOICE
          entity_metadata: event.location === 'external' ? 
            { location: event.location_details } : 
            undefined
        })
      }
    ).then(res => res.json());

    // Update event with Discord event ID
    await supabase
      .from('events')
      .update({ discord_event_id: discordEvent.id })
      .eq('id', eventId);

    return NextResponse.json({ discordEventId: discordEvent.id });

  } catch (error) {
    console.error('Failed to create Discord event:', error);
    return NextResponse.json({ error: 'Failed to create Discord event' }, { status: 500 });
  }
}

