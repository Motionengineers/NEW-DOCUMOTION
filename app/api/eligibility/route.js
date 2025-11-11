import { NextResponse } from 'next/server';
import { getEligibilitySummary } from '@/lib/recommendationEngine';

export async function POST(request) {
  try {
    const payload = await request.json();
    const summary = await getEligibilitySummary(payload);
    return NextResponse.json({ success: true, ...summary });
  } catch (error) {
    console.error('POST /api/eligibility failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to evaluate eligibility' },
      { status: 500 }
    );
  }
}

