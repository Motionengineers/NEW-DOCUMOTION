import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { appendJson, readJson, writeJson } from '@/lib/fileStore';

const STORE_FILE = 'agencyRequests.json';

function buildRequest(payload) {
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    agencyId: payload.agencyId,
    startupId: payload.startupId,
    serviceType: payload.serviceType,
    budget: payload.budget ?? null,
    timeline: payload.timeline ?? null,
    message: payload.message ?? '',
    status: 'pending',
    brandingCompleted: false,
    documents: [],
    createdAt: now,
    updatedAt: now,
  };
}

export async function GET() {
  const requests = await readJson(STORE_FILE, []);
  return NextResponse.json({ success: true, requests });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { agencyId, startupId, serviceType } = body;
    if (!agencyId || !startupId || !serviceType) {
      return NextResponse.json(
        { success: false, error: 'agencyId, startupId and serviceType are required' },
        { status: 400 }
      );
    }

    const newRequest = buildRequest({
      agencyId,
      startupId,
      serviceType,
      budget: body.budget,
      timeline: body.timeline,
      message: body.message,
    });

    await appendJson(STORE_FILE, newRequest, []);
    return NextResponse.json({ success: true, request: newRequest });
  } catch (error) {
    console.error('POST /api/agency-requests failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to create agency request' },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Request id is required' },
        { status: 400 }
      );
    }

    const requests = await readJson(STORE_FILE, []);
    const updatedRequests = requests.map(item =>
      item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
    );

    await writeJson(STORE_FILE, updatedRequests);
    const updated = updatedRequests.find(item => item.id === id);

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, request: updated });
  } catch (error) {
    console.error('PATCH /api/agency-requests failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to update agency request' },
      { status: 500 }
    );
  }
}
