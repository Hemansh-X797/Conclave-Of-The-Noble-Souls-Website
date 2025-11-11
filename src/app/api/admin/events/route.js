/**
 * ============================================================================
 * ADMIN EVENTS MANAGEMENT API
 * @route GET /api/admin/events (List events)
 * @route POST /api/admin/events (Create event)
 * @route PATCH /api/admin/events (Update event)
 * @route DELETE /api/admin/events (Delete event)
 * @description Admin event management for The Conclave
 * @access Staff only
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
 * ============================================================================
 * GET HANDLER - List Events
 * @route GET /api/admin/events
 * ============================================================================
 */
export async function GET(request) {
  try {
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

    // Parse query parameters
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const pathway = url.searchParams.get('pathway');
    const limit = parseInt(url.searchParams.get('limit') || '50');

    // Build query
    let query = supabase
      .from('events')
      .select(`
        *,
        creator:created_by (username, discriminator, avatar_url)
      `)
      .order('start_time', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    if (pathway) {
      query = query.eq('pathway', pathway);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      events: data || [],
      total: data?.length || 0
    });

  } catch (error) {
    console.error('Get events error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch events',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

/**
 * ============================================================================
 * POST HANDLER - Create Event
 * @route POST /api/admin/events
 * ============================================================================
 */
export async function POST(request) {
  try {
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

    // Validate required fields
    if (!body.title || !body.start_time) {
      return NextResponse.json(
        { success: false, error: 'Title and start time are required' },
        { status: 400 }
      );
    }

    // Create event
    const { data, error } = await supabase
      .from('events')
      .insert({
        title: body.title,
        description: body.description,
        event_type: body.event_type || 'general',
        pathway: body.pathway || 'general',
        start_time: body.start_time,
        end_time: body.end_time,
        location: body.location,
        channel_id: body.channel_id,
        image_url: body.image_url,
        max_participants: body.max_participants,
        created_by: sessionData.userId,
        status: 'scheduled',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Event created successfully',
      event: data
    });

  } catch (error) {
    console.error('Create event error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create event',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

/**
 * ============================================================================
 * PATCH HANDLER - Update Event
 * @route PATCH /api/admin/events
 * ============================================================================
 */
export async function PATCH(request) {
  try {
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
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Update event
    const { data, error } = await supabase
      .from('events')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Event updated successfully',
      event: data
    });

  } catch (error) {
    console.error('Update event error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update event',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

/**
 * ============================================================================
 * DELETE HANDLER - Delete Event
 * @route DELETE /api/admin/events
 * ============================================================================
 */
export async function DELETE(request) {
  try {
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

    // Get event ID from query params
    const url = new URL(request.url);
    const eventId = parseInt(url.searchParams.get('id'));

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Delete event
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully',
      eventId: eventId
    });

  } catch (error) {
    console.error('Delete event error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete event',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

/**
 * ============================================================================
 * OPTIONS HANDLER (CORS)
 * @route OPTIONS /api/admin/events
 * ============================================================================
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_SITE_URL || '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}