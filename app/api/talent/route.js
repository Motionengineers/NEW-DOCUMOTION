import { NextResponse } from 'next/server';
import { loadTalentProfilesSlice } from '@/lib/dataSources';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const query = searchParams.get('q') ?? undefined;

    const page = pageParam ? Number.parseInt(pageParam, 10) : 1;
    const limit = limitParam ? Number.parseInt(limitParam, 10) : 36;

    const result = await loadTalentProfilesSlice({ page, limit, query });

    return NextResponse.json({
      success: true,
      ...result,
      query: query ?? '',
    });
  } catch (error) {
    console.error('GET /api/talent failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to load talent profiles',
      },
      { status: 500 }
    );
  }
}

