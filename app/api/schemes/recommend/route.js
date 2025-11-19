import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';
import { validateBody } from '@/lib/api-validation';
import { ApiError } from '@/lib/api-error';
import { getSchemeRecommendations } from '@/lib/recommendationEngine';
import { logger } from '@/lib/logger';

const recommendSchema = z.object({
  stage: z.string().optional(),
  sector: z.string().optional(),
  location: z.string().optional(),
  revenue: z.number().optional(),
  teamSize: z.number().optional(),
});

function requireAuth(token) {
  if (!token?.sub) {
    return null;
  }
  return Number(token.sub);
}

export async function POST(request) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const userId = requireAuth(token);
    if (!userId) {
      throw new ApiError(401, 'Unauthorized');
    }

    const payload = await request.json();
    const validated = await validateBody(recommendSchema, payload);

    const recommendations = await getSchemeRecommendations(validated);

    logger.info({
      event: 'scheme_recommendations_requested',
      userId,
      filters: validated,
    });

    return NextResponse.json({ ok: true, ...recommendations });
  } catch (err) {
    logger.error({
      event: 'scheme_recommend_error',
      error: err.message,
    });

    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
