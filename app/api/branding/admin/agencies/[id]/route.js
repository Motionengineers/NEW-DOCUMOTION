import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const updateSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  city: z.string().max(120).nullable().optional(),
  state: z.string().max(120).nullable().optional(),
  minBudget: z.number().int().nonnegative().nullable().optional(),
  maxBudget: z.number().int().nonnegative().nullable().optional(),
  rating: z.number().min(0).max(5).nullable().optional(),
  serviceBadges: z.string().max(512).nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  verified: z.boolean().optional(),
  featured: z.boolean().optional(),
  responseTime: z.string().max(120).nullable().optional(),
});

function authorize(token) {
  if (!token) return false;
  const role = token.role || token.user?.role;
  if (role === 'admin' || role === 'branding_manager') {
    return true;
  }
  return false;
}

export async function PATCH(request, { params }) {
  try {
    const id = Number(params.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ success: false, error: 'Invalid agency id' }, { status: 400 });
    }

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!authorize(token)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const json = await request.json();
    const payload = updateSchema.parse(json);

    const data = {
      ...payload,
    };

    if (payload.serviceBadges !== undefined && payload.serviceBadges !== null) {
      data.serviceBadges = payload.serviceBadges;
      data.services = JSON.stringify(
        payload.serviceBadges
          .split(',')
          .map(item => item.trim())
          .filter(Boolean)
      );
    }

    const updated = await prisma.agency.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: { id: updated.id } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload', details: error.flatten() },
        { status: 422 }
      );
    }
    console.error(`PATCH /api/branding/admin/agencies/${params.id} failed:`, error);
    return NextResponse.json({ success: false, error: 'Unable to update agency' }, { status: 500 });
  }
}

