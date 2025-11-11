import { NextResponse } from 'next/server';
import { readJson, writeJson } from '@/lib/fileStore';
import { loadLiveUpdates } from '@/lib/dataSources';

const STORE_FILE = 'notifications.json';

export const dynamic = 'force-dynamic';

async function ensureSeedData() {
  const existing = await readJson(STORE_FILE, null);
  if (existing && Array.isArray(existing) && existing.length > 0) {
    return existing;
  }

  const updates = await loadLiveUpdates().catch(() => ({ feed: [] }));
  const feed = Array.isArray(updates) ? updates : updates.feed || [];

  const seeded = feed.slice(0, 5).map(item => ({
    id: `seed-${item.id ?? item.title}`,
    title: item.title ?? 'Documotion update',
    body: item.summary ?? 'Stay tuned for more updates.',
    link: item.link ?? null,
    level: 'info',
    createdAt: item.time ?? new Date().toISOString(),
    read: false,
  }));

  await writeJson(STORE_FILE, seeded);
  return seeded;
}

export async function GET(request) {
  try {
    const seeded = await ensureSeedData();
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get('userId');

    const notes = seeded.filter(note => {
      if (note.read) return false;
      if (!userId) return true;
      return !note.userId || note.userId === userId;
    });

    return NextResponse.json({ success: true, notes });
  } catch (error) {
    console.error('GET /api/notifications failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to fetch notifications' },
      { status: 500 }
    );
  }
}

