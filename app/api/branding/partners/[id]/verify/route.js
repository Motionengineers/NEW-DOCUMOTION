import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const schema = z.object({
  verified: z.boolean(),
});

function authorize(token) {
  if (!token) return false;
  const role = token.role || token.user?.role;
  return role === 'admin' || role === 'branding_manager';
}

export async function PATCH(request, { params }) {
  try {
    const id = Number(params.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ success: false, error: 'Invalid partner id' }, { status: 400 });
    }

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!authorize(token)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const json = await request.json();
    const payload = schema.parse(json);

    const partner = await prisma.brandingPartner.update({
      where: { id },
      data: { verified: payload.verified },
    });

    return NextResponse.json({ success: true, data: { id: partner.id, verified: partner.verified } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload', details: error.flatten() },
        { status: 422 }
      );
    }
    console.error(`PATCH /api/branding/partners/${params.id}/verify failed:`, error);
    return NextResponse.json(
      { success: false, error: 'Unable to update verification status' },
      { status: 500 }
    );
  }
}

