import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { appendJson, readJson } from '@/lib/fileStore';

const STORE_FILE = 'serviceRequests.json';

export async function GET() {
  const serviceRequests = await readJson(STORE_FILE, []);
  return NextResponse.json({ success: true, serviceRequests });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { startupId, serviceType } = body;
    if (!startupId || !serviceType) {
      return NextResponse.json(
        { success: false, error: 'startupId and serviceType are required' },
        { status: 400 }
      );
    }

    const serviceRequest = {
      id: randomUUID(),
      startupId,
      serviceType,
      amount: body.amount ?? null,
      paymentStatus: 'pending',
      registrationStatus: 'initiated',
      documents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await appendJson(STORE_FILE, serviceRequest, []);
    return NextResponse.json({ success: true, serviceRequest });
  } catch (error) {
    console.error('POST /api/service-requests failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to create service request' },
      { status: 500 }
    );
  }
}

