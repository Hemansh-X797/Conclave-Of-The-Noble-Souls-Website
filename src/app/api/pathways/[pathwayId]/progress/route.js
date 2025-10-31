// ============================================================================
// UPDATE PATHWAY PROGRESS API
// Update user's progress in specific pathway
// Location: /src/app/api/pathways/[pathwayId]/progress/route.js
// ============================================================================

import { NextResponse } from 'next/server';
import { getPathwayById } from '@/data';
import { isValidPathwayProgress } from '@/types/pathway';

export async function POST(request, { params }) {
  try {
    const { pathwayId } = params;
    const progressData = await request.json();

    // Validate pathway
    const pathway = getPathwayById(pathwayId);
    if (!pathway) {
      return NextResponse.json(
        { error: 'Invalid pathway ID' },
        { status: 400 }
      );
    }

    // Validate progress data
    if (!isValidPathwayProgress(progressData)) {
      return NextResponse.json(
        { error: 'Invalid progress data' },
        { status: 400 }
      );
    }

    // TODO: Save to database (Supabase)
    // For now, return the progress data as-is
    
    // TODO: When database is connected, replace with:
    /*
    const { data, error } = await supabase
      .from('pathway_progress')
      .upsert({
        user_id: progressData.userId,
        pathway_id: progressData.pathwayId,
        level: progressData.level,
        xp: progressData.xp,
        next_level_xp: progressData.nextLevelXP,
        current_rank: progressData.currentRank,
        achievements: progressData.achievements,
        last_active: new Date().toISOString(),
        custom_data: progressData.customData || {}
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
    */

    return NextResponse.json({
      ...progressData,
      lastActive: new Date().toISOString()
    });

  } catch (error) {
    console.error('Update progress error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}