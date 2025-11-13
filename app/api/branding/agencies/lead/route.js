import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getAgencyBySlug } from '@/lib/brandingHub';

export const dynamic = 'force-dynamic';

const leadSchema = z
  .object({
    agencyId: z.number().int().positive().optional(),
    agencySlug: z.string().min(1, 'Agency slug is required if agencyId is missing').optional(),
    projectType: z.string().min(1, 'Project type is required'),
    projectScope: z.string().max(2000).optional(),
    budgetMin: z.number().int().nonnegative().optional(),
    budgetMax: z.number().int().nonnegative().optional(),
    currency: z.string().length(3).optional(),
    timeline: z.string().max(255).optional(),
    startDate: z.string().optional(),
    description: z.string().max(4000).optional(),
    contactName: z.string().min(1, 'Contact name is required'),
    contactEmail: z.string().email('Valid contact email is required'),
    contactPhone: z.string().max(50).optional(),
    companyName: z.string().max(255).optional(),
    designation: z.string().max(255).optional(),
    source: z.string().max(255).optional(),
  })
  .refine(
    payload => payload.agencyId || payload.agencySlug,
    'Either agencyId or agencySlug must be provided'
  )
  .refine(
    payload => {
      if (payload.budgetMin && payload.budgetMax) {
        return payload.budgetMin <= payload.budgetMax;
      }
      return true;
    },
    { message: 'budgetMin cannot be greater than budgetMax', path: ['budgetMin'] }
  );

export async function POST(request) {
  try {
    const body = await request.json();
    const parsed = leadSchema.parse({
      ...body,
      budgetMin: body.budgetMin !== undefined ? Number.parseInt(body.budgetMin, 10) : undefined,
      budgetMax: body.budgetMax !== undefined ? Number.parseInt(body.budgetMax, 10) : undefined,
    });

    let agencyId = parsed.agencyId ?? null;

    if (!agencyId && parsed.agencySlug) {
      const agency = await getAgencyBySlug(parsed.agencySlug, {
        includeServices: false,
        includePortfolio: false,
        includeReviews: false,
      });
      if (!agency) {
        return NextResponse.json({ success: false, error: 'Agency not found' }, { status: 404 });
      }
      agencyId = agency.id;
    }

    if (!agencyId) {
      return NextResponse.json(
        { success: false, error: 'Agency identifier missing' },
        { status: 400 }
      );
    }

    let startDate = null;
    if (parsed.startDate) {
      const parsedDate = new Date(parsed.startDate);
      if (!Number.isNaN(parsedDate.getTime())) {
        startDate = parsedDate;
      }
    }

    const lead = await prisma.agencyLead.create({
      data: {
        agencyId,
        projectType: parsed.projectType,
        projectScope: parsed.projectScope ?? null,
        budgetMin: parsed.budgetMin ?? null,
        budgetMax: parsed.budgetMax ?? null,
        currency: parsed.currency ?? 'INR',
        timeline: parsed.timeline ?? null,
        startDate,
        description: parsed.description ?? null,
        contactName: parsed.contactName,
        contactEmail: parsed.contactEmail,
        contactPhone: parsed.contactPhone ?? null,
        companyName: parsed.companyName ?? null,
        designation: parsed.designation ?? null,
        source: parsed.source ?? 'portal',
      },
    });

    console.info('Agency lead captured', {
      agencyId,
      leadId: lead.id,
      contactEmail: parsed.contactEmail,
      projectType: parsed.projectType,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: lead.id,
          status: lead.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid lead payload',
          details: error.flatten(),
        },
        { status: 422 }
      );
    }

    console.error('POST /api/branding/agencies/lead failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to submit lead',
      },
      { status: 500 }
    );
  }
}
