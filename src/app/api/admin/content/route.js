/**
 * ============================================================================
 * ADMIN CONTENT MANAGEMENT API
 * @route GET /api/admin/content (List content)
 * @route POST /api/admin/content (Create content)
 * @description Admin content management - list, create, approve/reject submissions
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
 * Check if user is staff (Admin or above)
 * @param {Array} roles - User's role IDs
 * @returns {boolean} True if staff
 */
function isStaff(roles) {
  const staffRoleIds = [
    '1369566988128751750', // Owner
    '1369197369161154560', // Board
    '1396459118025375784', // Head Admin
    '1370702703616856074', // Admin
    '1409148504026120293', // Head Mod
    '1408079849377107989'  // Moderator
  ];

  return roles.some(roleId => staffRoleIds.includes(roleId));
}

/**
 * Get content list with filters
 * @param {Object} filters - Query filters
 * @returns {Promise<Array>} Content list
 */
async function getContentList(filters = {}) {
  let query = supabase
    .from('content')
    .select(`
      *,
      users:created_by (
        username,
        discriminator,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.pathway) {
    query = query.eq('pathway', filters.pathway);
  }

  if (filters.contentType) {
    query = query.eq('content_type', filters.contentType);
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

/**
 * Create new content (staff-created, auto-approved)
 * @param {Object} contentData - Content data
 * @param {number} creatorId - Creator user ID
 * @returns {Promise<Object>} Created content
 */
async function createContent(contentData, creatorId) {
  const { data, error } = await supabase
    .from('content')
    .insert({
      title: contentData.title,
      description: contentData.description,
      content: contentData.content,
      content_type: contentData.contentType,
      pathway: contentData.pathway,
      tags: contentData.tags || [],
      external_links: contentData.links,
      thumbnail_url: contentData.thumbnailUrl,
      author: contentData.author,
      author_discord: contentData.authorDiscord,
      publish_date: contentData.publishDate || new Date().toISOString(),
      created_by: creatorId,
      status: 'approved', // Staff content is auto-approved
      approved_by: creatorId,
      approved_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * ============================================================================
 * GET HANDLER - List Content
 * @route GET /api/admin/content
 * ============================================================================
 */
export async function GET(request) {
  try {
    // Get session token
    const sessionToken = request.cookies.get('conclave_session')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required'
        },
        { status: 401 }
      );
    }

    // Parse session
    const sessionData = parseSessionToken(sessionToken);

    if (!sessionData || !isStaff(sessionData.roles || [])) {
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient permissions. Staff only.'
        },
        { status: 403 }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const filters = {
      status: url.searchParams.get('status'),
      pathway: url.searchParams.get('pathway'),
      contentType: url.searchParams.get('type'),
      limit: parseInt(url.searchParams.get('limit') || '50')
    };

    // Get content list
    const content = await getContentList(filters);

    // Get statistics
    const { data: stats } = await supabase
      .from('content')
      .select('status')
      .then(res => {
        if (res.error) throw res.error;
        const grouped = {
          pending: 0,
          approved: 0,
          rejected: 0,
          total: res.data.length
        };
        res.data.forEach(item => {
          if (item.status === 'pending_approval') grouped.pending++;
          else if (item.status === 'approved') grouped.approved++;
          else if (item.status === 'rejected') grouped.rejected++;
        });
        return { data: grouped };
      });

    return NextResponse.json({
      success: true,
      content: content,
      stats: stats || { pending: 0, approved: 0, rejected: 0, total: 0 },
      filters: filters
    });

  } catch (error) {
    console.error('Get content error:', error);

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
 * POST HANDLER - Create Content (Staff)
 * @route POST /api/admin/content
 * ============================================================================
 */
export async function POST(request) {
  try {
    // Get session token
    const sessionToken = request.cookies.get('conclave_session')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required'
        },
        { status: 401 }
      );
    }

    // Parse session
    const sessionData = parseSessionToken(sessionToken);

    if (!sessionData || !isStaff(sessionData.roles || [])) {
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient permissions. Staff only.'
        },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.content || !body.pathway) {
      return NextResponse.json(
        {
          success: false,
          error: 'Title, content, and pathway are required'
        },
        { status: 400 }
      );
    }

    // Create content
    const newContent = await createContent(body, sessionData.userId);

    return NextResponse.json({
      success: true,
      message: 'Content created successfully',
      content: newContent
    });

  } catch (error) {
    console.error('Create content error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create content',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

/**
 * ============================================================================
 * OPTIONS HANDLER (CORS)
 * @route OPTIONS /api/admin/content
 * ============================================================================
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_SITE_URL || '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}