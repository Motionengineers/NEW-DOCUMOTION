import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { createRequestId, jsonError } from '@/lib/http';
import { requireAuth, requireRoleOrOwner } from '@/lib/authz';

export const dynamic = 'force-dynamic';

const updateBookingSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
  scheduledAt: z.string().datetime().optional(),
  notes: z.string().max(2000).optional(),
  meetingLink: z.string().url().optional(),
});

/**
 * PATCH /api/branding/partners/[id]/bookings/[bookingId]
 * Update booking status (for partners and admins)
 */
export async function PATCH(request, { params }) {
  try {
    const rid = createRequestId();
    const auth = await requireAuth(request, rid);
    if ('errorResponse' in auth) return auth.errorResponse;
    const { token } = auth;

    const bookingId = parseInt(params.bookingId);
    const partnerId = parseInt(params.id);

    if (Number.isNaN(bookingId) || Number.isNaN(partnerId)) {
      return jsonError('invalid_params', 'Invalid booking or partner ID', 400, rid);
    }

    const body = await request.json();
    const payload = updateBookingSchema.parse(body);

    // Get booking
    const booking = await prisma.brandingPartnerBooking.findFirst({
      where: {
        id: bookingId,
        partnerId,
      },
      include: {
        partner: true,
      },
    });

    if (!booking) {
      return jsonError('not_found', 'Booking not found', 404, rid);
    }

    // Check permissions: requester, partner owner, or admin
    const allowed = requireRoleOrOwner(token, booking.requesterId, ['admin']);
    if (!allowed) {
      return jsonError('forbidden', 'Unauthorized to update this booking', 403, rid);
    }

    // Update booking
    const updated = await prisma.brandingPartnerBooking.update({
      where: { id: bookingId },
      data: {
        status: payload.status || booking.status,
        scheduledAt: payload.scheduledAt ? new Date(payload.scheduledAt) : booking.scheduledAt,
        requestNotes: payload.notes !== undefined ? payload.notes : booking.requestNotes,
        meetingLink: payload.meetingLink !== undefined ? payload.meetingLink : booking.meetingLink,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        status: updated.status,
        scheduledAt: updated.scheduledAt,
        meetingLink: updated.meetingLink,
        notes: updated.requestNotes,
        requesterName: updated.requesterName,
        requesterEmail: updated.requesterEmail,
        createdAt: updated.createdAt,
      },
    }, { headers: { 'x-request-id': rid } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'invalid_body', message: 'Invalid payload' }, details: error.flatten() },
        { status: 422 }
      );
    }
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to update booking' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/branding/partners/[id]/bookings/[bookingId]
 * Get specific booking details
 */
export async function GET(request, { params }) {
  try {
    const token = await getToken({ req: request });
    if (!token || !token.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(token.userId);
    const bookingId = parseInt(params.bookingId);

    const booking = await prisma.brandingPartnerBooking.findFirst({
      where: {
        id: bookingId,
        OR: [
          { requesterId: userId },
          // Add partner ownership check if needed
        ],
      },
      include: {
        partner: {
          select: {
            id: true,
            name: true,
            type: true,
            verified: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: booking.id,
        status: booking.status,
        scheduledAt: booking.scheduledAt,
        meetingLink: booking.meetingLink,
        requesterName: booking.requesterName,
        requesterEmail: booking.requesterEmail,
        requestNotes: booking.requestNotes,
        partner: booking.partner,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to fetch booking' },
      { status: 500 }
    );
  }
}


