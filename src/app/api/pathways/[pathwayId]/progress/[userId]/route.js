// ============================================================================
// GET PATHWAY PROGRESS API
// Fetch user's progress in specific pathway
// Location: /src/app/api/pathways/[pathwayId]/progress/[userId]/route.js
// ============================================================================

import { NextResponse } from 'next/server';
import { getPathwayById } from '@/data';
import { initializePathwayProgress } from '@/types/pathway';

export async function GET(request, { params }) {
  try {
    const { pathwayId, userId } = params;

    // Validate pathway
    const pathway = getPathwayById(pathwayId);
    if (!pathway) {
      return NextResponse.json(
        { error: 'Invalid pathway ID' },
        { status: 400 }
      );
    }

    // TODO: Fetch from database (Supabase)
    // For now, return initialized progress
    const progress = initializePathwayProgress(userId, pathwayId);

    // TODO: When database is connected, replace with:
    /*
    const { data, error } = await supabase
      .from('pathway_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('pathway_id', pathwayId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    const progress = data || initializePathwayProgress(userId, pathwayId);
    */

    return NextResponse.json(progress);

  } catch (error) {
    console.error('Get progress error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}