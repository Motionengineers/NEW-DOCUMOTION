import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  notes: z.string().max(2000).optional(),
});

export async function POST(request, { params }) {
  try {
    const id = Number(params.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ success: false, error: 'Invalid partner id' }, { status: 400 });
    }

    const json = await request.json();
    const payload = schema.parse(json);

    const partner = await prisma.brandingPartner.findUnique({ where: { id, verified: true } });
    if (!partner) {
      return NextResponse.json({ success: false, error: 'Partner not available' }, { status: 404 });
    }

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET }).catch(() => null);
    const requesterId = token?.sub ? Number(token.sub) : null;

    await prisma.brandingPartnerBooking.create({
      data: {
        partnerId: id,
        requesterId: requesterId || null,
        requesterName: payload.name,
        requesterEmail: payload.email,
        requestNotes: payload.notes || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload', details: error.flatten() },
        { status: 422 }
      );
    }
    console.error(`POST /api/branding/partners/${params.id}/book failed:`, error);
    return NextResponse.json(
      { success: false, error: 'Unable to submit booking request' },
      { status: 500 }
    );
  }
}

