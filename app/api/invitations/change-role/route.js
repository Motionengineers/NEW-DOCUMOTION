import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { normalizeRole, recordActivity } from '@/lib/invitations';
import { rateLimitFromRequest } from '@/lib/rate-limit';

export async function POST(request) {
  try {
    if (!rateLimitFromRequest(request, 60, 60_000)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await request.json();
    const userId = Number(body.userId);
    const agencyId = Number(body.agencyId);
    const role = normalizeRole(body.role);

    if (!userId || Number.isNaN(userId) || !agencyId || Number.isNaN(agencyId)) {
      return NextResponse.json({ error: 'userId and agencyId are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.agencyId !== agencyId) {
      return NextResponse.json({ error: 'User not found within agency' }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { teamRole: role },
    });

    await recordActivity({
      agencyId,
      message: `${user.email} is now ${role}`,
    });

    return NextResponse.json({ status: 'updated' });
  } catch (error) {
    console.error('POST /api/invitations/change-role failed:', error);
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
  }
}

