import { NextResponse } from 'next/server';
import { readJson, writeJson } from '@/lib/fileStore';

const STORE_FILE = 'serviceRequests.json';

export async function GET(_request, { params }) {
  const { id } = params;
  const serviceRequests = await readJson(STORE_FILE, []);
  const serviceRequest = serviceRequests.find(item => item.id === id);
  if (!serviceRequest) {
    return NextResponse.json(
      { success: false, error: 'Service request not found' },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, serviceRequest });
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const updates = await request.json();

    const serviceRequests = await readJson(STORE_FILE, []);
    let found = false;
    const updatedRequests = serviceRequests.map(item => {
      if (item.id !== id) return item;
      found = true;
      return {
        ...item,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
    });

    if (!found) {
      return NextResponse.json(
        { success: false, error: 'Service request not found' },
        { status: 404 }
      );
    }

    await writeJson(STORE_FILE, updatedRequests);
    const serviceRequest = updatedRequests.find(item => item.id === id);
    return NextResponse.json({ success: true, serviceRequest });
  } catch (error) {
    console.error('PATCH /api/service-requests/[id] failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to update service request' },
      { status: 500 }
    );
  }
}
