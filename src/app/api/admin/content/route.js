
// ============================================================================
// /api/admin/content/route.js - Content Management
// ============================================================================

export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!hasPermission(session.user.roles, PERMISSIONS.MANAGE_CONTENT)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('includeStats') === 'true';

    // Fetch content from database
    let query = supabase
      .from('content')
      .select('*')
      .order('created_at', { ascending: false });

    if (includeStats) {
      query = query.select(`
        *,
        views:content_views(count),
        likes:content_likes(count),
        comments:content_comments(count)
      `);
    }

    const { data: contents, error } = await query;

    if (error) throw error;

    return NextResponse.json({ contents });

  } catch (error) {
    console.error('Failed to fetch content:', error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!hasPermission(session.user.roles, PERMISSIONS.MANAGE_CONTENT)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();

    // Insert content
    const { data: content, error } = await supabase
      .from('content')
      .insert({
        ...body,
        author: session.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // If published, send webhook notification
    if (body.status === 'published') {
      await fetch(process.env.DISCORD_WEBHOOK_GENERAL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: `📢 New ${body.type}: ${body.title}`,
            description: body.description,
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/${body.type}/${content.id}`,
            color: 0xD4AF37,
            thumbnail: body.thumbnail ? { url: body.thumbnail } : undefined
          }]
        })
      });
    }

    return NextResponse.json(content);

  } catch (error) {
    console.error('Failed to create content:', error);
    return NextResponse.json({ error: 'Failed to create content' }, { status: 500 });
  }
}

