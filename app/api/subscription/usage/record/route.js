import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { recordUsage, canPerformAction } from '@/lib/subscription';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * POST /api/subscription/usage/record
 * Record usage for a specific action (internal API)
 * Used by other endpoints to track usage
 */
export async function POST(request) {
  try {
    const token = await getToken({ req: request });
    if (!token || !token.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(token.userId);
    const body = await request.json();
    const { actionType, quantity = 1 } = body;

    if (!actionType) {
      return NextResponse.json(
        { success: false, error: 'actionType is required' },
        { status: 400 }
      );
    }

    // Check if action is allowed before recording
    const check = await canPerformAction(userId, actionType, quantity);
    if (!check.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Usage limit exceeded',
          details: {
            actionType,
            current: check.current,
            limit: check.limit,
            remaining: check.remaining,
          },
        },
        { status: 403 }
      );
    }

    // Record the usage
    const usageRecord = await recordUsage(userId, actionType, quantity);

    return NextResponse.json({
      success: true,
      data: {
        actionType,
        quantity,
        usage: {
          current: usageRecord.currentUsage,
          limit: usageRecord.limit,
          remaining: usageRecord.limit
            ? usageRecord.limit - usageRecord.currentUsage
            : null,
        },
      },
    });
  } catch (error) {
    console.error('Error recording usage:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


