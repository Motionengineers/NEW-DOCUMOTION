import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { rateLimitFromRequest } from '@/lib/rate-limit';
import { createTeamInvitation } from '@/lib/invitations-service';

const WEBHOOK_SECRET = process.env.INTAKE_WEBHOOK_SECRET;

function verifySignature(rawBody, signature) {
  if (!WEBHOOK_SECRET) {
    throw new Error('INTAKE_WEBHOOK_SECRET is not configured');
  }
  if (!signature) return false;

  const computed = crypto.createHmac('sha256', WEBHOOK_SECRET).update(rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature));
}

export async function POST(request) {
  try {
    if (!rateLimitFromRequest(request, 120, 60_000)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const rawBody = await request.text();
    let payload;

    try {
      payload = rawBody ? JSON.parse(rawBody) : {};
    } catch (error) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    if (!verifySignature(rawBody, request.headers.get('x-intake-signature'))) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const result = await createTeamInvitation({
      agencyId: payload.agencyId,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      createdById: payload.createdById,
      managerEmail: payload.managerEmail,
      message: payload.message,
      inviterName: payload.inviterName,
      agencyName: payload.agencyName,
      source: 'intake_webhook',
      attachExistingUser: true,
    });

    if (result.outcome === 'error') {
      return NextResponse.json({ error: result.message }, { status: result.status || 400 });
    }

    return NextResponse.json({
      status: result.outcome,
      ...(result.payload || {}),
    });
  } catch (error) {
    console.error('POST /api/invitations/create failed:', error);
    return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 });
  }
}

