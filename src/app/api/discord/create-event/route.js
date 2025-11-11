// ============================================================================
// CREATE DISCORD EVENT API
// Location: /src/app/api/discord/create-event/route.js
// Creates scheduled events in Discord server (staff only)
// ============================================================================

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse session token
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
 */
function isStaffMember(roles) {
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
 * Validate event data
 */
function validateEventData(data) {
  const errors = [];

  if (!data.name || data.name.trim().length < 3) {
    errors.push('Event name must be at least 3 characters');
  }

  if (data.name && data.name.length > 100) {
    errors.push('Event name must be less than 100 characters');
  }

  if (!data.scheduled_start_time) {
    errors.push('Start time is required');
  }

  const startTime = new Date(data.scheduled_start_time);
  if (isNaN(startTime.getTime())) {
    errors.push('Invalid start time format');
  }

  if (startTime < new Date()) {
    errors.push('Start time must be in the future');
  }

  if (data.scheduled_end_time) {
    const endTime = new Date(data.scheduled_end_time);
    if (isNaN(endTime.getTime())) {
      errors.push('Invalid end time format');
    }
    if (endTime <= startTime) {
      errors.push('End time must be after start time');
    }
  }

  if (!data.entity_type || ![1, 2, 3].includes(data.entity_type)) {
    errors.push('Valid entity type is required (1=stage, 2=voice, 3=external)');
  }

  if (data.entity_type === 3 && !data.entity_metadata?.location) {
    errors.push('External location is required for external events');
  }

  if (data.entity_type !== 3 && !data.channel_id) {
    errors.push('Channel ID is required for voice/stage events');
  }

  if (data.description && data.description.length > 1000) {
    errors.push('Description must be less than 1000 characters');
  }

  return errors;
}

/**
 * Create Discord scheduled event
 */
async function createDiscordEvent(eventData) {
  const response = await fetch(
    `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/scheduled-events`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventData)
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create Discord event: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Store event in database
 */
async function storeEventInDatabase(discordEvent, creatorId, pathway) {
  try {
    const { data, error } = await supabase
      .from('events')
      .insert({
        discord_event_id: discordEvent.id,
        title: discordEvent.name,
        description: discordEvent.description,
        event_type: getEventTypeString(discordEvent.entity_type),
        pathway: pathway || 'general',
        start_time: discordEvent.scheduled_start_time,
        end_time: discordEvent.scheduled_end_time,
        location: discordEvent.entity_metadata?.location || null,
        channel_id: discordEvent.channel_id || null,
        image_url: discordEvent.image || null,
        created_by: creatorId,
        status: 'scheduled',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to store event in database:', error);
    return null;
  }
}

/**
 * Get event type string
 */
function getEventTypeString(entityType) {
  switch (entityType) {
    case 1: return 'stage';
    case 2: return 'voice';
    case 3: return 'external';
    default: return 'other';
  }
}

// ============================================================================
// POST HANDLER - Create Event
// ============================================================================
export async function POST(request) {
  try {
    // Check if bot token is configured
    if (!DISCORD_BOT_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          error: 'Discord bot not configured'
        },
        { status: 503 }
      );
    }

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

    if (!sessionData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid session'
        },
        { status: 401 }
      );
    }

    // Check if user is staff
    if (!isStaffMember(sessionData.roles || [])) {
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

    // Validate event data
    const validationErrors = validateEventData(body);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationErrors
        },
        { status: 400 }
      );
    }

    // Prepare Discord event data
    const discordEventData = {
      name: body.name.trim(),
      description: body.description?.trim() || null,
      scheduled_start_time: new Date(body.scheduled_start_time).toISOString(),
      scheduled_end_time: body.scheduled_end_time 
        ? new Date(body.scheduled_end_time).toISOString()
        : null,
      privacy_level: 2, // GUILD_ONLY
      entity_type: body.entity_type
    };

    // Add channel ID for voice/stage events
    if (body.entity_type !== 3 && body.channel_id) {
      discordEventData.channel_id = body.channel_id;
    }

    // Add external location for external events
    if (body.entity_type === 3 && body.entity_metadata?.location) {
      discordEventData.entity_metadata = {
        location: body.entity_metadata.location.trim()
      };
    }

    // Add image if provided
    if (body.image) {
      discordEventData.image = body.image;
    }

    // Create event in Discord
    const discordEvent = await createDiscordEvent(discordEventData);

    // Store in database
    const dbEvent = await storeEventInDatabase(
      discordEvent,
      sessionData.userId,
      body.pathway
    );

    // Log event creation
    await supabase.from('discord_sync_log').insert({
      event_type: 'event_created',
      status: 'success',
      details: {
        eventId: discordEvent.id,
        eventName: discordEvent.name,
        createdBy: sessionData.username,
        pathway: body.pathway
      },
      synced_at: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Event created successfully',
      event: {
        id: discordEvent.id,
        name: discordEvent.name,
        description: discordEvent.description,
        startTime: discordEvent.scheduled_start_time,
        endTime: discordEvent.scheduled_end_time,
        type: getEventTypeString(discordEvent.entity_type),
        url: `https://discord.com/events/${DISCORD_GUILD_ID}/${discordEvent.id}`,
        databaseId: dbEvent?.id
      }
    });

  } catch (error) {
    console.error('Create Discord event error:', error);

    // Log failed event creation
    try {
      await supabase.from('discord_sync_log').insert({
        event_type: 'event_created',
        status: 'failed',
        error_message: error.message,
        synced_at: new Date().toISOString()
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create Discord event',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Service unavailable'
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET HANDLER - Get Upcoming Events
// ============================================================================
export async function GET(request) {
  try {
    // Check if bot token is configured
    if (!DISCORD_BOT_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          error: 'Discord bot not configured'
        },
        { status: 503 }
      );
    }

    // Fetch scheduled events from Discord
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/scheduled-events?with_user_count=true`,
      {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.status}`);
    }

    const events = await response.json();

    // Format events
    const formattedEvents = events.map(event => ({
      id: event.id,
      name: event.name,
      description: event.description,
      startTime: event.scheduled_start_time,
      endTime: event.scheduled_end_time,
      type: getEventTypeString(event.entity_type),
      location: event.entity_metadata?.location || null,
      channelId: event.channel_id || null,
      status: event.status,
      userCount: event.user_count || 0,
      imageUrl: event.image 
        ? `https://cdn.discordapp.com/guild-events/${event.id}/${event.image}.png`
        : null,
      url: `https://discord.com/events/${DISCORD_GUILD_ID}/${event.id}`
    }));

    return NextResponse.json({
      success: true,
      events: formattedEvents,
      total: formattedEvents.length
    });

  } catch (error) {
    console.error('Get Discord events error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Discord events',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Service unavailable'
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// OPTIONS HANDLER (CORS)
// ============================================================================
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