import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { CreateFundingApplicationSchema } from '@/lib/schemas/funding-schema';
import { validateBody } from '@/lib/api-validation';
import { ApiError } from '@/lib/api-error';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';
import sanitizeHtml from 'sanitize-html';
import { serializeFundingApplication } from '@/lib/serializers/funding';

function parseNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function normaliseSocialLinks(value) {
  if (!value) return null;
  if (Array.isArray(value)) {
    const cleaned = value.map(link => link?.toString().trim()).filter(Boolean);
    if (!cleaned.length) return null;
    try {
      return JSON.stringify(cleaned);
    } catch (error) {
      return cleaned.join(',');
    }
  }
  const cleaned = value
    .toString()
    .split(/\n|,/)
    .map(link => link.trim())
    .filter(Boolean);
  if (!cleaned.length) return null;
  try {
    return JSON.stringify(cleaned);
  } catch (error) {
    return cleaned.join(',');
  }
}

function buildApplicationData(payload = {}) {
  return {
    fullName: payload.fullName?.toString().trim() || '',
    email: payload.email?.toString().trim() || '',
    phone: payload.phone?.toString().trim() || null,
    city: payload.city?.toString().trim() || null,
    state: payload.state?.toString().trim() || null,
    startupName: payload.startupName?.toString().trim() || null,
    website: payload.website?.toString().trim() || null,
    socialLinks: normaliseSocialLinks(payload.socialLinks),
    industry: payload.industry?.toString().trim() || null,
    stage: payload.stage?.toString().trim() || null,
    problem: payload.problem?.toString().trim() || null,
    solution: payload.solution?.toString().trim() || null,
    targetAudience: payload.targetAudience?.toString().trim() || null,
    revenue: payload.revenue?.toString().trim() || null,
    profit: payload.profit?.toString().trim() || null,
    customers: payload.customers?.toString().trim() || null,
    fundingRaised: payload.fundingRaised?.toString().trim() || null,
    growthMetrics: payload.growthMetrics?.toString().trim() || null,
    amountRequested: parseNumber(payload.amountRequested),
    equityOffered: parseNumber(payload.equityOffered),
    useOfFunds: payload.useOfFunds?.toString().trim() || null,
    pitchVideoUrl: payload.pitchVideoUrl?.toString().trim() || null,
    pitchDeckUrl: payload.pitchDeckUrl?.toString().trim() || null,
  };
}

function validateSubmission(data = {}) {
  const missing = [];
  if (!data.fullName) missing.push('Full Name');
  if (!data.email) missing.push('Email');
  if (!data.phone) missing.push('Contact Number');
  if (!data.city) missing.push('City');
  if (!data.state) missing.push('State');
  if (!data.startupName) missing.push('Startup Name');
  if (!data.industry) missing.push('Industry');
  if (!data.stage) missing.push('Stage');
  if (!data.problem) missing.push('Problem solved');
  if (!data.solution) missing.push('Your solution');
  if (!data.targetAudience) missing.push('Target audience');
  if (!data.useOfFunds) missing.push('Use of funds');
  if (!data.amountRequested) missing.push('Amount requested');
  if (!data.equityOffered && data.equityOffered !== 0) missing.push('Equity offered');
  if (!data.pitchDeckUrl && !data.pitchVideoUrl) missing.push('Pitch deck or video');
  return missing;
}

function buildDemoApplication() {
  return {
    id: 'demo-application',
    status: 'demo',
    progress: 80,
    fullName: 'Aarav Mehta',
    email: 'founder@aurorapay.in',
    phone: '+91-98765-43210',
    city: 'Bengaluru',
    state: 'Karnataka',
    startupName: 'AuroraPay',
    website: 'https://aurorapay.in',
    socialLinks: 'https://linkedin.com/company/aurorapay\nhttps://twitter.com/aurorapay',
    industry: 'Fintech',
    stage: 'Growth',
    problem:
      'Traditional SME payment rails are fragmented, expensive, and lack working capital insights for founder-led businesses.',
    solution:
      'AuroraPay unifies collections, payouts, and credit underwriting into one API-first dashboard. We layer GST and banking data to build instant risk scores.',
    targetAudience:
      'Digital-first wholesalers and D2C brands with ₹2–10 crore annual GMV across Tier-1 and Tier-2 cities.',
    revenue: '₹1.8 crore ARR (FY25 run-rate)',
    profit: 'EBITDA -12% (investing in onboarding automation)',
    customers: '540 active merchants · 62K monthly transactions',
    fundingRaised: '₹4.2 crore pre-seed (July 2024)',
    growthMetrics:
      '6.2x TPV growth over 9 months · 94% net revenue retention · 38% margin expansion after workflow automation.',
    amountRequested: 70000000,
    equityOffered: 10,
    useOfFunds:
      'Expand credit underwriting pod, launch co-lending rails with two NBFC partners, and extend GTM to Pune & Delhi NCR.',
    pitchVideoUrl: '/uploads/demo/aurorapay-pitch.mp4',
    pitchDeckUrl: '/uploads/demo/aurorapay-deck.pdf',
    submittedAt: null,
    reviewedAt: null,
    reviewNotes: 'Demo preview',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

async function logFundingActivity(applicationId, actorUserId, activityType, message) {
  if (!applicationId) return;
  try {
    await prisma.fundingApplicationActivity.create({
      data: {
        applicationId,
        actorUserId,
        activityType,
        message,
      },
    });
  } catch (error) {
    logger.error({
      event: 'funding_activity_log_error',
      error: error.message,
      applicationId,
    });
  }
}

async function emitFundingNotification({
  userId,
  type,
  payload = {},
}) {
  try {
    // Placeholder for email/SMS integrations (Resend, Twilio, etc.)
    logger.info({
      event: 'funding_notification_enqueued',
      userId,
      type,
      payload,
    });
  } catch (error) {
    logger.error({
      event: 'funding_notification_error',
      error: error.message,
      userId,
      type,
    });
  }
}

const TRUSTED_VIDEO_DOMAINS = ['youtube.com', 'youtu.be', 'vimeo.com', 'loom.com', 'drive.google.com'];

function isTrustedVideoUrl(url) {
  try {
    const { hostname } = new URL(url);
    const normalized = hostname.replace(/^www\./, '');
    return TRUSTED_VIDEO_DOMAINS.some(domain => normalized.endsWith(domain));
  } catch (error) {
    return false;
  }
}

async function assertUniqueApplication({ userId, startupName, excludeId }) {
  if (!startupName) return;
  const existing = await prisma.fundingApplication.findFirst({
    where: {
      userId,
      startupName: { equals: startupName, mode: 'insensitive' },
      status: { in: ['submitted', 'in-review', 'approved'] },
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true },
  });
  if (existing) {
    throw new ApiError(
      409,
      'You already have an active application for this startup. Update the existing submission instead.'
    );
  }
}

function buildReapplyGuidance(application) {
  if (!application || application.status !== 'rejected') {
    return null;
  }
  const tips = [];
  if (!application.pitchDeckUrl) {
    tips.push('Upload a detailed pitch deck so reviewers can assess your traction clearly.');
  }
  if (!application.growthMetrics) {
    tips.push('Add growth metrics (MoM revenue, user retention) to strengthen your story.');
  }
  if (application.amountRequested && application.amountRequested > 100000000) {
    tips.push('Consider lowering the funding ask or sharing a phased plan for capital deployment.');
  }
  tips.push('Re-run the state matching tool to explore states with grant-heavy programs.');
  return {
    status: application.status,
    title: 'How to strengthen your next application',
    tips,
  };
}

export async function GET(request) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) {
      throw new ApiError(401, 'Unauthorized');
    }
    const userId = Number(token.sub);

    const [application, draft] = await Promise.all([
      prisma.fundingApplication.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.fundingApplicationDraft.findUnique({
        where: { userId },
      }),
    ]);

    let activities = [];
    if (application) {
      const timeline = await prisma.fundingApplicationActivity.findMany({
        where: { applicationId: application.id },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
      activities = timeline.map(entry => ({
        id: entry.id,
        activityType: entry.activityType,
        message: entry.message,
        createdAt: entry.createdAt?.toISOString?.(),
      }));
    }

    logger.info({
      event: 'funding_application_viewed',
      userId,
      applicationId: application?.id,
    });

    return NextResponse.json({
      ok: true,
      data: {
        application: serializeFundingApplication(application),
        draft: draft
          ? { ...JSON.parse(draft.data || '{}'), updatedAt: draft.updatedAt?.toISOString?.() }
          : null,
        activities,
        guidance: buildReapplyGuidance(application),
      },
    });
  } catch (err) {
    logger.error({
      event: 'funding_application_get_error',
      error: err.message,
    });

    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) {
      throw new ApiError(401, 'Unauthorized');
    }
    const userId = Number(token.sub);

    const payload = await request.json();
    const { action, data = {}, applicationId, progress } = payload || {};
    if (!action) {
      throw new ApiError(400, 'Missing action');
    }

    if (action === 'save-draft') {
      await prisma.fundingApplicationDraft.upsert({
        where: { userId },
        update: {
          data: JSON.stringify(data || {}),
          updatedAt: new Date(),
        },
        create: {
          userId,
          data: JSON.stringify(data || {}),
        },
      });

      if (typeof progress === 'number') {
        await prisma.fundingApplication.updateMany({
          where: { userId, status: 'draft' },
          data: { progress: Math.min(Math.max(progress, 0), 100) },
        });
      }

      logger.info({
        event: 'funding_application_draft_saved',
        userId,
      });

      const draftApplication = await prisma.fundingApplication.findFirst({
        where: { userId, status: 'draft' },
        orderBy: { updatedAt: 'desc' },
      });

      if (draftApplication) {
        await logFundingActivity(draftApplication.id, userId, 'draft_saved', 'Draft updated');
      }

      await emitFundingNotification({
        userId,
        type: 'draft_saved',
        payload: { progress },
      });

      return NextResponse.json({ ok: true, message: 'Draft saved' });
    }

    if (action !== 'submit') {
      throw new ApiError(400, 'Unsupported action');
    }

    // Validate with schema
    const validated = await validateBody(CreateFundingApplicationSchema, data);

    // Sanitize text fields
    const mapped = {
      ...validated,
      problem: validated.problem ? sanitizeHtml(validated.problem) : null,
      solution: validated.solution ? sanitizeHtml(validated.solution) : null,
      targetAudience: validated.targetAudience ? sanitizeHtml(validated.targetAudience) : null,
      useOfFunds: validated.useOfFunds ? sanitizeHtml(validated.useOfFunds) : null,
    };

    if (mapped.pitchVideoUrl && !isTrustedVideoUrl(mapped.pitchVideoUrl)) {
      throw new ApiError(
        400,
        'Pitch video must be hosted on YouTube, Vimeo, Loom, or Google Drive'
      );
    }

    const missing = validateSubmission(mapped);
    if (missing.length) {
      throw new ApiError(400, `Please complete: ${missing.join(', ')}`);
    }

    await assertUniqueApplication({
      userId,
      startupName: mapped.startupName,
      excludeId: applicationId ? Number(applicationId) : undefined,
    });

    const baseData = {
      ...mapped,
      status: 'submitted',
      progress: 100,
      submittedAt: new Date(),
    };

    let application = null;

    if (applicationId) {
      application = await prisma.fundingApplication.findUnique({
        where: { id: Number(applicationId) },
      });
      if (!application || application.userId !== userId) {
        return NextResponse.json(
          { success: false, error: 'Application not found' },
          { status: 404 }
        );
      }
      application = await prisma.fundingApplication.update({
        where: { id: application.id },
        data: baseData,
      });
    } else {
      application = await prisma.fundingApplication.create({
        data: {
          userId,
          ...baseData,
        },
      });
    }

    await prisma.fundingApplicationDraft.deleteMany({ where: { userId } });

    logger.info({
      event: 'funding_application_submitted',
      userId,
      applicationId: application.id,
    });

    await logFundingActivity(application.id, userId, 'submitted', 'Application submitted');
    await emitFundingNotification({
      userId,
      type: 'submitted',
      payload: { applicationId: application.id, amount: application.amountRequested },
    });

    return NextResponse.json(
      {
        ok: true,
        data: serializeFundingApplication(application),
      },
      { status: 201 }
    );
  } catch (err) {
    logger.error({
      event: 'funding_application_submit_error',
      error: err.message,
    });

    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
