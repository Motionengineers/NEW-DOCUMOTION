import { NextResponse } from 'next/server';
import { getSchemeRecommendations } from '@/lib/recommendationEngine';

export async function POST(request) {
  try {
    const payload = await request.json();
    const recommendations = await getSchemeRecommendations(payload);
    return NextResponse.json({ success: true, ...recommendations });
  } catch (error) {
    console.error('POST /api/schemes/recommend failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to generate recommendations' },
      { status: 500 }
    );
  }
}
