import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const updateSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  type: z.enum(['AGENCY', 'PHOTOGRAPHER', 'MEDIA']).optional(),
  portfolioUrl: z
    .string()
    .url()
    .optional()
    .or(z.literal(''))
    .transform(val => (val === undefined ? undefined : val || null)),
  website: z
    .string()
    .url()
    .optional()
    .or(z.literal(''))
    .transform(val => (val === undefined ? undefined : val || null)),
  contactEmail: z.string().email().optional().or(z.literal('')).transform(val => (val === undefined ? undefined : val || null)),
  phone: z.string().max(32).optional().or(z.literal('')).transform(val => (val === undefined ? undefined : val || null)),
  city: z.string().max(120).optional().or(z.literal('')).transform(val => (val === undefined ? undefined : val || null)),
  rating: z.number().min(0).max(5).optional(),
  ratingCount: z.number().int().nonnegative().optional(),
});

function authorize(token) {
  if (!token) return false;
  const role = token.role || token.user?.role;
  return role === 'admin' || role === 'branding_manager';
}

export async function GET(_request, { params }) {
  try {
    const id = Number(params.id);
    if (!Number.isInteger(id)) {
      return NextResponse.json({ success: false, error: 'Invalid partner id' }, { status: 400 });
    }

    const partner = await prisma.brandingPartner.findUnique({
      where: { id },
    });

    if (!partner) {
      return NextResponse.json({ success: false, error: 'Partner not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: partner });
  } catch (error) {
    console.error(`GET /api/branding/partners/${params.id} failed:`, error);
    return NextResponse.json(
      { success: false, error: 'Unable to load branding partner' },
      { status: 500 }
    );
  }
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
    const payload = updateSchema.parse(json);

    const updated = await prisma.brandingPartner.update({
      where: { id },
      data: {
        ...payload,
        ...(payload.portfolioUrl !== undefined ? { portfolioUrl: payload.portfolioUrl || null } : {}),
        ...(payload.website !== undefined ? { website: payload.website || null } : {}),
        ...(payload.contactEmail !== undefined ? { contactEmail: payload.contactEmail || null } : {}),
        ...(payload.phone !== undefined ? { phone: payload.phone || null } : {}),
        ...(payload.city !== undefined ? { city: payload.city || null } : {}),
      },
    });

    return NextResponse.json({ success: true, data: { id: updated.id } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload', details: error.flatten() },
        { status: 422 }
      );
    }
    console.error(`PATCH /api/branding/partners/${params.id} failed:`, error);
    return NextResponse.json(
      { success: false, error: 'Unable to update branding partner' },
      { status: 500 }
    );
  }
}

