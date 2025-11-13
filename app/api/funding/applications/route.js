import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';

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

function parseSocialLinks(value) {
  if (!value) return '';
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.join('\n');
    }
  } catch (error) {
    // fallthrough to plain string
  }
  return value.toString();
}

function serializeFundingApplication(record) {
  if (!record) return null;
  return {
    id: record.id,
    status: record.status,
    progress: record.progress,
    fullName: record.fullName || '',
    email: record.email || '',
    phone: record.phone || '',
    city: record.city || '',
    state: record.state || '',
    startupName: record.startupName || '',
    website: record.website || '',
    socialLinks: parseSocialLinks(record.socialLinks),
    industry: record.industry || '',
    stage: record.stage || '',
    problem: record.problem || '',
    solution: record.solution || '',
    targetAudience: record.targetAudience || '',
    revenue: record.revenue || '',
    profit: record.profit || '',
    customers: record.customers || '',
    fundingRaised: record.fundingRaised || '',
    growthMetrics: record.growthMetrics || '',
    amountRequested: record.amountRequested,
    equityOffered: record.equityOffered,
    useOfFunds: record.useOfFunds || '',
    pitchVideoUrl: record.pitchVideoUrl || '',
    pitchDeckUrl: record.pitchDeckUrl || '',
    submittedAt: record.submittedAt?.toISOString?.(),
    reviewedAt: record.reviewedAt?.toISOString?.(),
    reviewNotes: record.reviewNotes || '',
    createdAt: record.createdAt?.toISOString?.(),
    updatedAt: record.updatedAt?.toISOString?.(),
  };
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

export async function GET(request) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) {
      return NextResponse.json({
        success: true,
        demo: true,
        data: {
          application: buildDemoApplication(),
          draft: null,
        },
      });
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

    return NextResponse.json({
      success: true,
      data: {
        application: serializeFundingApplication(application),
        draft: draft
          ? { ...JSON.parse(draft.data || '{}'), updatedAt: draft.updatedAt?.toISOString?.() }
          : null,
      },
    });
  } catch (error) {
    console.error('GET /api/funding/applications failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to load funding applications' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) {
      return NextResponse.json(
        { success: false, error: 'Please sign in to continue' },
        { status: 401 }
      );
    }
    const userId = Number(token.sub);

    const payload = await request.json();
    const { action, data = {}, applicationId, progress } = payload || {};
    if (!action) {
      return NextResponse.json({ success: false, error: 'Missing action' }, { status: 400 });
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

      return NextResponse.json({ success: true, message: 'Draft saved' });
    }

    if (action !== 'submit') {
      return NextResponse.json({ success: false, error: 'Unsupported action' }, { status: 400 });
    }

    const mapped = buildApplicationData(data);
    const missing = validateSubmission(mapped);
    if (missing.length) {
      return NextResponse.json(
        { success: false, error: `Please complete: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

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

    return NextResponse.json({
      success: true,
      data: serializeFundingApplication(application),
    });
  } catch (error) {
    console.error('POST /api/funding/applications failed:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to process funding application' },
      { status: 500 }
    );
  }
}
