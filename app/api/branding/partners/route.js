import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const createSchema = z.object({
  name: z.string().min(2).max(120),
  type: z.enum(['AGENCY', 'PHOTOGRAPHER', 'MEDIA']),
  portfolioUrl: z.string().url().optional().or(z.literal('')).transform(val => val || undefined),
  website: z.string().url().optional().or(z.literal('')).transform(val => val || undefined),
  contactEmail: z.string().email().optional(),
  phone: z.string().max(32).optional(),
  city: z.string().max(120).optional(),
});

const listSchema = z.object({
  type: z.enum(['AGENCY', 'PHOTOGRAPHER', 'MEDIA']).optional(),
  city: z.string().max(120).optional(),
  verified: z
    .enum(['true', 'false'])
    .optional()
    .transform(val => (val === undefined ? undefined : val === 'true')),
  search: z.string().max(120).optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  cursor: z.coerce.number().int().positive().optional(),
});

function authorize(token) {
  if (!token) return false;
  const role = token.role || token.user?.role;
  return role === 'admin' || role === 'branding_manager';
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = listSchema.safeParse(Object.fromEntries(searchParams.entries()));
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid query params', details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const { type, city, verified, search, limit = 20, cursor } = parsed.data;

    const where = {
      ...(type ? { type } : {}),
      ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}),
      ...(verified === undefined ? {} : { verified }),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { city: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const partners = await prisma.brandingPartner.findMany({
      where,
      orderBy: [{ verified: 'desc' }, { rating: 'desc' }, { createdAt: 'desc' }],
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });

    let nextCursor = null;
    if (partners.length > limit) {
      const nextItem = partners.pop();
      nextCursor = nextItem?.id ?? null;
    }

    return NextResponse.json({
      success: true,
      data: partners,
      nextCursor,
    });
  } catch (error) {
    console.error('GET /api/branding/partners failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to load branding partners' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!authorize(token)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const json = await request.json();
    const payload = createSchema.parse(json);

    const partner = await prisma.brandingPartner.create({
      data: {
        name: payload.name,
        type: payload.type,
        portfolioUrl: payload.portfolioUrl,
        website: payload.website,
        contactEmail: payload.contactEmail,
        phone: payload.phone,
        city: payload.city,
      },
    });

    return NextResponse.json({ success: true, data: partner });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload', details: error.flatten() },
        { status: 422 }
      );
    }
    console.error('POST /api/branding/partners failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to create branding partner' },
      { status: 500 }
    );
  }
}


