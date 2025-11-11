// ============================================================================
// COMPLAINTS API ROUTE - The Conclave Realm
// Handle member complaints and reports with dignity
// Location: /src/app/api/complaints/route.js
// ============================================================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

/**
 * POST /api/complaints
 * Submit a complaint about another member or issue
 * 
 * Body: {
 *   reporterDiscordId: string,
 *   reporterUsername: string,
 *   complaintType: 'member' | 'content' | 'staff' | 'other',
 *   targetDiscordId?: string (if about a member),
 *   targetUsername?: string,
 *   category: 'harassment' | 'spam' | 'inappropriate' | 'abuse' | 'other',
 *   description: string,
 *   evidence?: string (URLs, screenshots, etc.),
 *   anonymous?: boolean
 * }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      reporterDiscordId,
      reporterUsername,
      complaintType,
      targetDiscordId,
      targetUsername,
      category,
      description,
      evidence,
      anonymous = false
    } = body;

    // Validate required fields
    if (!reporterDiscordId || !reporterUsername || !complaintType || !category || !description) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          required: ['reporterDiscordId', 'reporterUsername', 'complaintType', 'category', 'description']
        },
        { status: 400 }
      );
    }

    // Validate complaint type
    const validTypes = ['member', 'content', 'staff', 'other'];
    if (!validTypes.includes(complaintType)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid complaint type',
          validTypes
        },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['harassment', 'spam', 'inappropriate', 'abuse', 'other'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid category',
          validCategories
        },
        { status: 400 }
      );
    }

    // Validate description length
    if (description.length < 20) {
      return NextResponse.json(
        {
          success: false,
          error: 'Description must be at least 20 characters'
        },
        { status: 400 }
      );
    }

    if (description.length > 2000) {
      return NextResponse.json(
        {
          success: false,
          error: 'Description must be less than 2000 characters'
        },
        { status: 400 }
      );
    }

    // If complaint type is 'member', target is required
    if (complaintType === 'member' && (!targetDiscordId || !targetUsername)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Target Discord ID and username required for member complaints'
        },
        { status: 400 }
      );
    }

    // Rate limiting - max 3 complaints per user per hour
    const supabase = createClient();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data: recentComplaints, error: countError } = await supabase
      .from('complaints')
      .select('id')
      .eq('reporter_discord_id', reporterDiscordId)
      .gte('created_at', oneHourAgo);

    if (!countError && recentComplaints && recentComplaints.length >= 3) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. Maximum 3 complaints per hour.',
          nextAvailable: new Date(Date.now() + 60 * 60 * 1000).toISOString()
        },
        { status: 429 }
      );
    }

    // Store complaint in database
    const { data: complaint, error: dbError } = await supabase
      .from('complaints')
      .insert({
        reporter_discord_id: reporterDiscordId,
        reporter_username: reporterUsername,
        complaint_type: complaintType,
        target_discord_id: targetDiscordId || null,
        target_username: targetUsername || null,
        category,
        description,
        evidence: evidence || null,
        anonymous,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to store complaint');
    }

    // Send to Discord webhook
    const webhookUrl = process.env.DISCORD_WEBHOOK_COMPLAINTS;

    if (webhookUrl) {
      const getCategoryColor = (cat) => {
        switch (cat) {
          case 'harassment': return 0xDC143C; // Crimson
          case 'spam': return 0xFFA500; // Orange
          case 'inappropriate': return 0xFF1493; // Deep Pink
          case 'abuse': return 0x8B0000; // Dark Red
          default: return 0xFFD700; // Gold
        }
      };

      const embed = {
        title: `⚠️ New Complaint - ${category.toUpperCase()}`,
        description: `A noble soul has raised concerns`,
        color: getCategoryColor(category),
        fields: [
          {
            name: '📋 Complaint Type',
            value: complaintType.charAt(0).toUpperCase() + complaintType.slice(1),
            inline: true
          },
          {
            name: '🏷️ Category',
            value: category.charAt(0).toUpperCase() + category.slice(1),
            inline: true
          },
          {
            name: '🔒 Anonymous',
            value: anonymous ? 'Yes' : 'No',
            inline: true
          },
          {
            name: '👤 Reporter',
            value: anonymous 
              ? '🔒 Anonymous' 
              : `${reporterUsername} (${reporterDiscordId})`,
            inline: false
          }
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: `Complaint ID: ${complaint.id}`
        }
      };

      // Add target if member complaint
      if (complaintType === 'member' && targetUsername) {
        embed.fields.push({
          name: '🎯 Target',
          value: `${targetUsername} (${targetDiscordId})`,
          inline: false
        });
      }

      // Add description
      embed.fields.push({
        name: '📝 Description',
        value: description.length > 1000 
          ? description.substring(0, 1000) + '...'
          : description,
        inline: false
      });

      // Add evidence if provided
      if (evidence) {
        embed.fields.push({
          name: '🔗 Evidence',
          value: evidence.length > 200 
            ? evidence.substring(0, 200) + '...'
            : evidence,
          inline: false
        });
      }

      try {
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: 'Conclave Complaints',
            avatar_url: process.env.NEXT_PUBLIC_SITE_URL + '/Assets/Images/CNS_logo1.png',
            embeds: [embed]
          })
        });

        if (!webhookResponse.ok) {
          console.error('Webhook failed:', await webhookResponse.text());
        }
      } catch (webhookError) {
        console.error('Webhook error:', webhookError);
      }
    }

    // Log analytics
    await supabase
      .from('analytics')
      .insert({
        event_type: 'complaint_submitted',
        metadata: {
          complaint_id: complaint.id,
          complaint_type: complaintType,
          category,
          anonymous
        },
        created_at: new Date().toISOString()
      });

    return NextResponse.json(
      {
        success: true,
        message: 'Your complaint has been submitted and will be reviewed by our moderation team',
        complaint: {
          id: complaint.id,
          type: complaint.complaint_type,
          category: complaint.category,
          status: complaint.status,
          createdAt: complaint.created_at
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Complaints API error:', error);

    try {
      const supabase = createClient();
      await supabase
        .from('analytics')
        .insert({
          event_type: 'complaint_error',
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
        error: 'Failed to submit complaint. Please try again later.'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/complaints?reporterId=xxx
 * Get complaints submitted by a user (staff only for all complaints)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const reporterId = searchParams.get('reporterId');

    if (!reporterId) {
      return NextResponse.json(
        { error: 'Reporter ID required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Get user's complaints (non-anonymous only)
    const { data: complaints, error } = await supabase
      .from('complaints')
      .select('id, complaint_type, category, status, created_at, resolved_at')
      .eq('reporter_discord_id', reporterId)
      .eq('anonymous', false)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      complaints: complaints || []
    });

  } catch (error) {
    console.error('Get complaints error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch complaints'
      },
      { status: 500 }
    );
  }
}