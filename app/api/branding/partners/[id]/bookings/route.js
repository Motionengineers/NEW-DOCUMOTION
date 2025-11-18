import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const querySchema = z.object({
  status: z.enum(['PENDING', 'ACCEPTED', 'DECLINED']).optional(),
});

function authorize(token) {
  if (!token) return false;
  const role = token.role || token.user?.role;
  return role === 'admin' || role === 'branding_manager';
}

export async function GET(request, { params }) {
  try {
    const id = Number(params.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ success: false, error: 'Invalid partner id' }, { status: 400 });
    }

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!authorize(token)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse(Object.fromEntries(searchParams.entries()));
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid query params', details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const bookings = await prisma.brandingPartnerBooking.findMany({
      where: {
        partnerId: id,
        ...(parsed.data.status ? { status: parsed.data.status } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: bookings });
  } catch (error) {
    console.error(`GET /api/branding/partners/${params.id}/bookings failed:`, error);
    return NextResponse.json(
      { success: false, error: 'Unable to load bookings' },
      { status: 500 }
    );
  }
}

