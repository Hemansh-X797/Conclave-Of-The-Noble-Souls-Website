
// ============================================================================
// /api/admin/events/route.js - Event Management
// ============================================================================

export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!hasPermission(session.user.roles, PERMISSIONS.CREATE_EVENTS)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('includeStats') === 'true';

    let query = supabase
      .from('events')
      .select('*')
      .order('start_date', { ascending: true });

    if (includeStats) {
      query = query.select(`
        *,
        registered:event_registrations(count),
        attended:event_attendance(count)
      `);
    }

    const { data: events, error } = await query;

    if (error) throw error;

    return NextResponse.json({ events });

  } catch (error) {
    console.error('Failed to fetch events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!hasPermission(session.user.roles, PERMISSIONS.CREATE_EVENTS)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();

    // Insert event
    const { data: event, error } = await supabase
      .from('events')
      .insert({
        ...body,
        author: session.user.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(event);

  } catch (error) {
    console.error('Failed to create event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}

