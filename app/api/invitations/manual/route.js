import { NextResponse } from 'next/server';
import { rateLimitFromRequest } from '@/lib/rate-limit';
import { createTeamInvitation } from '@/lib/invitations-service';

export async function POST(request) {
  try {
    if (!rateLimitFromRequest(request, 30, 60_000)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await request.json();
    const result = await createTeamInvitation({
      agencyId: body.agencyId,
      email: body.email,
      name: body.name,
      role: body.role,
      createdById: body.createdById,
      managerEmail: body.managerEmail,
      message: body.message,
      inviterName: body.inviterName,
      source: 'settings_panel',
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
    console.error('POST /api/invitations/manual failed:', error);
    return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 });
  }
}

