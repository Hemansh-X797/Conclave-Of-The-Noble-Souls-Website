/**
 * ============================================================================
 * ADMIN CONTENT ACTIONS API
 * @route GET /api/admin/content/[id] (Get single content)
 * @route PATCH /api/admin/content/[id] (Update/Approve/Reject content)
 * @route DELETE /api/admin/content/[id] (Delete content)
 * @description Admin actions on specific content (approve, reject, edit, delete)
 * @access Staff only (Admin & above)
 * ============================================================================
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * ============================================================================
 * HELPER FUNCTIONS
 * ============================================================================
 */

/**
 * Parse session token
 * @param {string} token - Base64url encoded session token
 * @returns {Object|null} Parsed session data or null
 */
function parseSessionToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
}

/**
 * Check if user is staff
 * @param {Array} roles - User's role IDs
 * @returns {boolean} True if staff
 */
function isStaff(roles) {
  const staffRoleIds = [
    '1369566988128751750', '1369197369161154560', '1396459118025375784',
    '1370702703616856074', '1409148504026120293', '1408079849377107989'
  ];
  return roles.some(roleId => staffRoleIds.includes(roleId));
}

/**
 * Get content by ID
 * @param {number} contentId - Content ID
 * @returns {Promise<Object|null>} Content data
 */
async function getContentById(contentId) {
  const { data, error } = await supabase
    .from('content')
    .select(`
      *,
      creator:created_by (username, discriminator, avatar_url),
      approver:approved_by (username, discriminator)
    `)
    .eq('id', contentId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

/**
 * ============================================================================
 * GET HANDLER - Get Content by ID
 * @route GET /api/admin/content/[id]
 * ============================================================================
 */
export async function GET(request, { params }) {
  try {
    const contentId = parseInt(params.id);

    if (!contentId || isNaN(contentId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid content ID' },
        { status: 400 }
      );
    }

    // Get session token
    const sessionToken = request.cookies.get('conclave_session')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse session
    const sessionData = parseSessionToken(sessionToken);

    if (!sessionData || !isStaff(sessionData.roles || [])) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions. Staff only.' },
        { status: 403 }
      );
    }

    // Get content
    const content = await getContentById(contentId);

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      content: content
    });

  } catch (error) {
    console.error('Get content by ID error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch content',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

/**
 * ============================================================================
 * PATCH HANDLER - Update/Approve/Reject Content
 * @route PATCH /api/admin/content/[id]
 * ============================================================================
 */
export async function PATCH(request, { params }) {
  try {
    const contentId = parseInt(params.id);

    if (!contentId || isNaN(contentId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid content ID' },
        { status: 400 }
      );
    }

    // Get session token
    const sessionToken = request.cookies.get('conclave_session')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse session
    const sessionData = parseSessionToken(sessionToken);

    if (!sessionData || !isStaff(sessionData.roles || [])) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions. Staff only.' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { action, ...updates } = body;

    // Handle specific actions
    if (action === 'approve') {
      const { data, error } = await supabase
        .from('content')
        .update({
          status: 'approved',
          approved_by: sessionData.userId,
          approved_at: new Date().toISOString()
        })
        .eq('id', contentId)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: 'Content approved successfully',
        content: data
      });
    }

    if (action === 'reject') {
      const { data, error } = await supabase
        .from('content')
        .update({
          status: 'rejected',
          approved_by: sessionData.userId,
          approved_at: new Date().toISOString(),
          rejection_reason: body.reason || null
        })
        .eq('id', contentId)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: 'Content rejected',
        content: data
      });
    }

    // General update
    const { data, error } = await supabase
      .from('content')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', contentId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Content updated successfully',
      content: data
    });

  } catch (error) {
    console.error('Update content error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update content',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

/**
 * ============================================================================
 * DELETE HANDLER - Delete Content
 * @route DELETE /api/admin/content/[id]
 * ============================================================================
 */
export async function DELETE(request, { params }) {
  try {
    const contentId = parseInt(params.id);

    if (!contentId || isNaN(contentId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid content ID' },
        { status: 400 }
      );
    }

    // Get session token
    const sessionToken = request.cookies.get('conclave_session')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse session
    const sessionData = parseSessionToken(sessionToken);

    if (!sessionData || !isStaff(sessionData.roles || [])) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions. Staff only.' },
        { status: 403 }
      );
    }

    // Delete content
    const { error } = await supabase
      .from('content')
      .delete()
      .eq('id', contentId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Content deleted successfully',
      contentId: contentId
    });

  } catch (error) {
    console.error('Delete content error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete content',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

/**
 * ============================================================================
 * OPTIONS HANDLER (CORS)
 * @route OPTIONS /api/admin/content/[id]
 * ============================================================================
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_SITE_URL || '*',
      'Access-Control-Allow-Methods': 'GET, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}