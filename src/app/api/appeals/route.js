// ============================================================================
// APPEALS API ROUTE - The Conclave Realm
// Handle member appeals for bans, mutes, warns with noble grace
// Location: /src/app/api/appeals/route.js
// ============================================================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

/**
 * POST /api/appeals
 * Submit an appeal for ban/mute/warn
 * 
 * Body: {
 *   type: 'ban' | 'mute' | 'warn',
 *   discordId: string,
 *   discordUsername: string,
 *   reason: string,
 *   appealText: string,
 *   contactEmail: string (optional)
 * }
 */
export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    const { type, discordId, discordUsername, reason, appealText, contactEmail } = body;

    // Validate required fields
    if (!type || !discordId || !discordUsername || !appealText) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields',
          required: ['type', 'discordId', 'discordUsername', 'appealText']
        },
        { status: 400 }
      );
    }

    // Validate appeal type
    const validTypes = ['ban', 'mute', 'warn'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid appeal type',
          validTypes
        },
        { status: 400 }
      );
    }

    // Validate text length (minimum 50 characters for serious appeals)
    if (appealText.length < 50) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Appeal text must be at least 50 characters'
        },
        { status: 400 }
      );
    }

    // Validate text length (maximum 2000 characters)
    if (appealText.length > 2000) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Appeal text must be less than 2000 characters'
        },
        { status: 400 }
      );
    }

    // Rate limiting check - only 1 appeal per Discord ID per 24 hours
    const supabase = createClient();
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: recentAppeal } = await supabase
      .from('appeals')
      .select('id, created_at')
      .eq('discord_id', discordId)
      .gte('created_at', twentyFourHoursAgo)
      .single();

    if (recentAppeal) {
      return NextResponse.json(
        { 
          success: false,
          error: 'You can only submit one appeal per 24 hours',
          nextAvailable: new Date(new Date(recentAppeal.created_at).getTime() + 24 * 60 * 60 * 1000).toISOString()
        },
        { status: 429 }
      );
    }

    // Store appeal in database
    const { data: appeal, error: dbError } = await supabase
      .from('appeals')
      .insert({
        type,
        discord_id: discordId,
        discord_username: discordUsername,
        reason: reason || 'Not specified',
        appeal_text: appealText,
        contact_email: contactEmail || null,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to store appeal');
    }

    // Send to Discord webhook
    const webhookUrl = process.env.DISCORD_WEBHOOK_APPEALS;
    
    if (webhookUrl) {
      const embed = {
        title: `🛡️ New ${type.toUpperCase()} Appeal`,
        description: `A noble soul seeks redemption`,
        color: type === 'ban' ? 0xDC143C : type === 'mute' ? 0xFFA500 : 0xFFD700,
        fields: [
          {
            name: '👤 Discord User',
            value: `${discordUsername} (${discordId})`,
            inline: true
          },
          {
            name: '⚖️ Appeal Type',
            value: type.toUpperCase(),
            inline: true
          },
          {
            name: '📝 Original Reason',
            value: reason || 'Not specified',
            inline: false
          },
          {
            name: '✉️ Appeal Statement',
            value: appealText.length > 1000 
              ? appealText.substring(0, 1000) + '...' 
              : appealText,
            inline: false
          },
          {
            name: '📧 Contact Email',
            value: contactEmail || 'Not provided',
            inline: true
          },
          {
            name: '🆔 Appeal ID',
            value: appeal.id,
            inline: true
          }
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: 'The Conclave Realm - Appeals System'
        }
      };

      try {
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: 'Conclave Appeals',
            avatar_url: process.env.NEXT_PUBLIC_SITE_URL + '/Assets/Images/CNS_logo1.png',
            embeds: [embed]
          })
        });

        if (!webhookResponse.ok) {
          console.error('Webhook failed:', await webhookResponse.text());
        }
      } catch (webhookError) {
        console.error('Webhook error:', webhookError);
        // Don't fail the request if webhook fails
      }
    }

    // Log analytics
    await supabase
      .from('analytics')
      .insert({
        event_type: 'appeal_submitted',
        metadata: {
          appeal_id: appeal.id,
          appeal_type: type,
          discord_id: discordId
        },
        created_at: new Date().toISOString()
      });

    // Return success
    return NextResponse.json(
      {
        success: true,
        message: 'Your appeal has been submitted successfully',
        appeal: {
          id: appeal.id,
          type: appeal.type,
          status: appeal.status,
          createdAt: appeal.created_at
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Appeals API error:', error);

    // Log error
    try {
      const supabase = createClient();
      await supabase
        .from('analytics')
        .insert({
          event_type: 'appeal_error',
          metadata: {
            error: error.message,
            stack: error.stack
          },
          created_at: new Date().toISOString()
        });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit appeal. Please try again later.'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/appeals?discordId=xxx
 * Get appeal status for a Discord ID
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const discordId = searchParams.get('discordId');

    if (!discordId) {
      return NextResponse.json(
        { error: 'Discord ID required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Get user's appeals
    const { data: appeals, error } = await supabase
      .from('appeals')
      .select('id, type, status, created_at, resolved_at, admin_response')
      .eq('discord_id', discordId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      appeals: appeals || []
    });

  } catch (error) {
    console.error('Get appeals error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch appeals' 
      },
      { status: 500 }
    );
  }
}