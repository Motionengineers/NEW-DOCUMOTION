import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { ApiError } from '@/lib/api-error';
import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { cache, CACHE_KEYS } from '@/lib/cache/redis';
import { isFeatureEnabled } from '@/lib/features/flags';
import { auditLog, AUDIT_ACTIONS } from '@/lib/audit/logger';
import { captureException } from '@/lib/monitoring/sentry';
import {
  loadGovtSchemes,
  loadBankSchemes,
  loadTalentProfiles,
  loadPitchDecks,
  loadLiveUpdates,
} from '@/lib/dataSources';

function requireAuth(token) {
  if (!token?.sub) {
    return null;
  }
  return Number(token.sub);
}

/**
 * Fetch dashboard data (uncached)
 */
async function fetchDashboardData(userId) {
  // Load external data and user's data in parallel
  const [govtSchemes, bankSchemes, talent, decks, updates, userData] = await Promise.all([
    loadGovtSchemes(),
    loadBankSchemes(),
    loadTalentProfiles(),
    loadPitchDecks(),
    loadLiveUpdates(),
    // Get user's startup and application stats
    Promise.all([
      prisma.startup.findFirst({
        where: { userId },
        select: { id: true, name: true },
      }),
      prisma.fundingApplication.count({
        where: { userId },
      }),
      prisma.document.count({
        where: { startup: { userId } },
      }),
    ]),
  ]);

  const [startup, applicationsCount, documentsCount] = userData;

  const now = Date.now();
  const updatedToday = (updates.feed || updates || []).filter(update => {
    if (!update?.time) return false;
    const updateTime = new Date(update.time).getTime();
    if (Number.isNaN(updateTime)) return false;
    return now - updateTime <= 24 * 60 * 60 * 1000;
  }).length;

  const bankSchemesNormalized = bankSchemes.map(item => ({
    ...item,
    type: (item.type || '').toLowerCase(),
  }));

  return {
    schemes: govtSchemes.length,
    banks: bankSchemes.length,
    talent: talent.length,
    pitchdecks: decks.length,
    registrations: 6, // number of ready-made registration flows in ServiceRequestForm
    govtLoans: bankSchemesNormalized.filter(item => item.type.includes('government')).length,
    privateBanks: bankSchemesNormalized.filter(item => item.type.includes('private')).length,
    ventureDebt: bankSchemesNormalized.filter(item => item.type.includes('venture')).length,
    updatedToday,
    user: {
      startup: startup,
      applicationsCount,
      documentsCount,
    },
  };
}

export async function GET(request) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const userId = requireAuth(token);
    if (!userId) {
      throw new ApiError(401, 'Unauthorized');
    }

    // Check feature flag for new dashboard
    const newDashboardEnabled = await isFeatureEnabled('new-dashboard-enabled', userId);

    // Cache entire dashboard object for 5 minutes (300 seconds)
    const cacheKey = CACHE_KEYS.user.dashboard(userId);
    const dashboardData = await cache(
      cacheKey,
      async () => {
        return await fetchDashboardData(userId);
      },
      300 // 5 minutes TTL
    );

    // Audit log dashboard access
    await auditLog({
      userId,
      action: AUDIT_ACTIONS.API_ACCESS,
      resourceType: 'Dashboard',
      ipAddress: request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || null,
      userAgent: request.headers.get('user-agent') || null,
      metadata: {
        endpoint: '/api/dashboard',
        featureFlag: newDashboardEnabled ? 'new-dashboard' : 'legacy-dashboard',
        cached: true,
      },
      success: true,
    });

    logger.info({
      event: 'dashboard_viewed',
      userId,
      cached: true,
      featureFlag: newDashboardEnabled,
    });

    // Standardized response format: success: true
    return NextResponse.json({
      success: true,
      data: {
        ...dashboardData,
        featureFlags: {
          newDashboardEnabled,
        },
      },
    });
  } catch (err) {
    captureException(err, {
      context: 'dashboard_api',
      userId: request.user?.id,
    });

    logger.error({
      event: 'dashboard_get_error',
      error: err.message,
      userId: request.user?.id,
    });

    // Audit log failed access
    try {
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
      const userId = token?.sub ? Number(token.sub) : null;
      await auditLog({
        userId,
        action: AUDIT_ACTIONS.API_ERROR,
        resourceType: 'Dashboard',
        ipAddress: request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || null,
        userAgent: request.headers.get('user-agent') || null,
        metadata: {
          endpoint: '/api/dashboard',
          error: err.message,
        },
        success: false,
        errorMessage: err.message,
      });
    } catch (auditError) {
      // Don't fail if audit logging fails
      console.error('[Audit] Failed to log dashboard error:', auditError);
    }

    if (err instanceof ApiError) {
      return NextResponse.json(
        {
          success: false,
          error: err.message,
        },
        { status: err.status }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
