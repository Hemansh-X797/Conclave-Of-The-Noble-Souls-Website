
// ============================================================================
// /api/admin/upload/route.js - File Upload
// ============================================================================

export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!hasPermission(session.user.roles, PERMISSIONS.MANAGE_CONTENT)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const type = formData.get('type');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Upload to Supabase Storage
    const fileName = `${type}/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('content-media')
      .upload(fileName, file);

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('content-media')
      .getPublicUrl(fileName);

    return NextResponse.json({
      url: publicUrl,
      type: file.type.startsWith('image/') ? 'image' : 'video',
      name: file.name,
      size: file.size
    });

  } catch (error) {
    console.error('Upload failed:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

// ============================================================================
// END OF API ROUTE
// ============================================================================