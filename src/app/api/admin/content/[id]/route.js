
// ============================================================================
// /api/admin/content/[id]/route.js - Update/Delete Content
// ============================================================================

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession();
    if (!hasPermission(session.user.roles, PERMISSIONS.MANAGE_CONTENT)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();

    const { data: content, error } = await supabase
      .from('content')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(content);

  } catch (error) {
    console.error('Failed to update content:', error);
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession();
    if (!hasPermission(session.user.roles, PERMISSIONS.MANAGE_CONTENT)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { error } = await supabase
      .from('content')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Failed to delete content:', error);
    return NextResponse.json({ error: 'Failed to delete content' }, { status: 500 });
  }
}

