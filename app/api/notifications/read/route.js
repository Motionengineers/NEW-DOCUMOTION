import { NextResponse } from 'next/server';
import { readJson, writeJson } from '@/lib/fileStore';

const STORE_FILE = 'notifications.json';

export async function POST(request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, error: 'Notification id required' }, { status: 400 });
    }

    const notifications = await readJson(STORE_FILE, []);
    const updated = notifications.map(note =>
      note.id === id ? { ...note, read: true, readAt: new Date().toISOString() } : note
    );
    await writeJson(STORE_FILE, updated);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/notifications/read failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}

