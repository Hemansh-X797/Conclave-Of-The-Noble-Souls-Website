// ============================================================================
// SUBMISSIONS API ROUTE - The Conclave Realm
// Handle content submissions with noble approval workflow
// Location: /src/app/api/submissions/route.js
// ============================================================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

/**
 * POST /api/submissions
 * Submit content for staff approval
 * 
 * Body: {
 *   userId: string,
 *   username: string,
 *   pathway: 'gaming' | 'lorebound' | 'productive' | 'news' | 'general',
 *   contentType: 'article' | 'guide' | 'review' | 'tutorial' | 'news' | 'other',
 *   title: string,
 *   description: string,
 *   content: string,
 *   tags?: string[],
 *   imageUrl?: string,
 *   externalUrl?: string
 * }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      userId,
      username,
      pathway,
      contentType,
      title,
      description,
      content,
      tags = [],
      imageUrl,
      externalUrl
    } = body;

    // Validate required fields
    if (!userId || !username || !pathway || !contentType || !title || !description || !content) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          required: ['userId', 'username', 'pathway', 'contentType', 'title', 'description', 'content']
        },
        { status: 400 }
      );
    }

    // Validate pathway
    const validPathways = ['gaming', 'lorebound', 'productive', 'news', 'general'];
    if (!validPathways.includes(pathway)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid pathway',
          validPathways
        },
        { status: 400 }
      );
    }

    // Validate content type
    const validTypes = ['article', 'guide', 'review', 'tutorial', 'news', 'other'];
    if (!validTypes.includes(contentType)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid content type',
          validTypes
        },
        { status: 400 }
      );
    }

    // Validate lengths
    if (title.length < 5 || title.length > 200) {
      return NextResponse.json(
        {
          success: false,
          error: 'Title must be between 5 and 200 characters'
        },
        { status: 400 }
      );
    }

    if (description.length < 20 || description.length > 500) {
      return NextResponse.json(
        {
          success: false,
          error: 'Description must be between 20 and 500 characters'
        },
        { status: 400 }
      );
    }

    if (content.length < 100) {
      return NextResponse.json(
        {
          success: false,
          error: 'Content must be at least 100 characters'
        },
        { status: 400 }
      );
    }

    // Rate limiting - max 5 submissions per user per day
    const supabase = createClient();
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: recentSubmissions, error: countError } = await supabase
      .from('submissions')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', twentyFourHoursAgo);

    if (!countError && recentSubmissions && recentSubmissions.length >= 5) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. Maximum 5 submissions per 24 hours.',
          nextAvailable: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        },
        { status: 429 }
      );
    }

    // Store submission in database
    const { data: submission, error: dbError } = await supabase
      .from('submissions')
      .insert({
        user_id: userId,
        username,
        pathway,
        content_type: contentType,
        title,
        description,
        content,
        tags: tags.slice(0, 10), // Max 10 tags
        image_url: imageUrl || null,
        external_url: externalUrl || null,
        status: 'pending',
        submitted_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to store submission');
    }

    // Send to Discord webhook
    const webhookUrl = process.env.DISCORD_WEBHOOK_SUBMISSIONS;

    if (webhookUrl) {
      const getPathwayColor = (path) => {
        switch (path) {
          case 'gaming': return 0x00BFFF; // Cyan
          case 'lorebound': return 0x6a0dad; // Purple
          case 'productive': return 0x50C878; // Emerald
          case 'news': return 0xE0115F; // Red
          default: return 0xFFD700; // Gold
        }
      };

      const embed = {
        title: `📝 New Content Submission`,
        description: title,
        color: getPathwayColor(pathway),
        fields: [
          {
            name: '👤 Author',
            value: username,
            inline: true
          },
          {
            name: '🎯 Pathway',
            value: pathway.charAt(0).toUpperCase() + pathway.slice(1),
            inline: true
          },
          {
            name: '📋 Type',
            value: contentType.charAt(0).toUpperCase() + contentType.slice(1),
            inline: true
          },
          {
            name: '📄 Description',
            value: description.length > 200 
              ? description.substring(0, 200) + '...'
              : description,
            inline: false
          },
          {
            name: '🏷️ Tags',
            value: tags.length > 0 ? tags.join(', ') : 'None',
            inline: false
          }
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: `Submission ID: ${submission.id}`
        }
      };

      // Add image if provided
      if (imageUrl) {
        embed.thumbnail = {
          url: imageUrl
        };
      }

      // Add external URL if provided
      if (externalUrl) {
        embed.fields.push({
          name: '🔗 External Link',
          value: externalUrl,
          inline: false
        });
      }

      // Add content preview
      embed.fields.push({
        name: '📖 Content Preview',
        value: content.length > 300 
          ? content.substring(0, 300) + '...'
          : content,
        inline: false
      });

      try {
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: 'Conclave Submissions',
            avatar_url: process.env.NEXT_PUBLIC_SITE_URL + '/Assets/Images/CNS_logo1.png',
            embeds: [embed],
            content: `🔔 <@&MODERATOR_ROLE_ID> New submission requires review!`
          })
        });

        if (!webhookResponse.ok) {
          console.error('Webhook failed:', await webhookResponse.text());
        }
      } catch (webhookError) {
        console.error('Webhook error:', webhookError);
      }
    }

    // Create notification for user
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: 'Submission Received',
        message: `Your ${contentType} "${title}" has been submitted and is pending staff approval.`,
        type: 'success',
        created_at: new Date().toISOString()
      });

    // Log analytics
    await supabase
      .from('analytics')
      .insert({
        event_type: 'content_submitted',
        user_id: userId,
        metadata: {
          submission_id: submission.id,
          pathway,
          content_type: contentType
        },
        created_at: new Date().toISOString()
      });

    return NextResponse.json(
      {
        success: true,
        message: 'Your submission has been received and will be reviewed by our staff',
        submission: {
          id: submission.id,
          title: submission.title,
          pathway: submission.pathway,
          contentType: submission.content_type,
          status: submission.status,
          submittedAt: submission.submitted_at
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Submissions API error:', error);

    try {
      const supabase = createClient();
      await supabase
        .from('analytics')
        .insert({
          event_type: 'submission_error',
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
        error: 'Failed to submit content. Please try again later.'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/submissions?userId=xxx&status=pending
 * Get user's submissions
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status') || 'all';

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    let query = supabase
      .from('submissions')
      .select('id, title, description, pathway, content_type, status, submitted_at, approved_at, rejected_at, admin_feedback')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false });

    // Filter by status if specified
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: submissions, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      submissions: submissions || []
    });

  } catch (error) {
    console.error('Get submissions error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch submissions'
      },
      { status: 500 }
    );
  }
}