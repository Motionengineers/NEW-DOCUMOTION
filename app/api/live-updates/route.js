import { NextResponse } from 'next/server';
import { loadLiveUpdates } from '@/lib/dataSources';

export async function GET() {
  try {
    const data = await loadLiveUpdates();
    const feed = Array.isArray(data) ? data : data.feed || [];
    return NextResponse.json({ success: true, feed });
  } catch (error) {
    console.error('GET /api/live-updates failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to fetch live updates' },
      { status: 500 }
    );
  }
}
