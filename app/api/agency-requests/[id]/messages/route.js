import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { appendJson, readJson } from '@/lib/fileStore';

const STORE_FILE = 'agencyMessages.json';

export async function GET(_request, { params }) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ success: false, error: 'Missing request id' }, { status: 400 });
  }

  const messages = await readJson(STORE_FILE, []);
  const list = messages.filter(message => message.requestId === id);
  return NextResponse.json({ success: true, list });
}

export async function POST(request, { params }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing request id' }, { status: 400 });
    }

    const body = await request.json();
    const { senderId, senderType, message } = body;
    if (!senderId || !senderType || !message) {
      return NextResponse.json(
        { success: false, error: 'senderId, senderType and message are required' },
        { status: 400 }
      );
    }

    const newMessage = {
      id: randomUUID(),
      requestId: id,
      senderId,
      senderType,
      message,
      createdAt: new Date().toISOString(),
    };

    await appendJson(STORE_FILE, newMessage, []);
    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    console.error('POST /api/agency-requests/[id]/messages failed:', error);
    return NextResponse.json({ success: false, error: 'Failed to send message' }, { status: 500 });
  }
}
