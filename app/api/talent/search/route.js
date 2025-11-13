import { NextResponse } from 'next/server';
import { loadTalentProfilesSlice } from '@/lib/dataSources';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { page = 1, limit = 36, query = '', filters = {}, sort = 'relevance' } = body || {};

    const result = await loadTalentProfilesSlice({
      page: Number.parseInt(page, 10) || 1,
      limit: Number.parseInt(limit, 10) || 36,
      query,
      filters,
      sort,
      includeFacets: true,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('POST /api/talent/search failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to search talent profiles',
      },
      { status: 500 }
    );
  }
}
