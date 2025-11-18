import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/branding/partners/[id]/availability
 * Check partner availability for a date range
 */
export async function GET(request, { params }) {
  try {
    const partnerId = parseInt(params.id);
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (Number.isNaN(partnerId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid partner ID' },
        { status: 400 }
      );
    }

    const partner = await prisma.brandingPartner.findUnique({
      where: { id: partnerId },
    });

    if (!partner) {
      return NextResponse.json(
        { success: false, error: 'Partner not found' },
        { status: 404 }
      );
    }

    // Get existing bookings in the date range
    const where = {
      partnerId,
      status: {
        in: ['PENDING', 'CONFIRMED'],
      },
    };

    if (startDate && endDate) {
      where.scheduledAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const bookings = await prisma.brandingPartnerBooking.findMany({
      where,
      select: {
        id: true,
        scheduledAt: true,
        status: true,
      },
    });

    // Calculate availability
    const availability = {
      partnerId,
      partnerName: partner.name,
      available: true,
      bookedSlots: bookings.map(b => ({
        id: b.id,
        scheduledAt: b.scheduledAt,
        status: b.status,
      })),
      message: bookings.length > 0
        ? `${bookings.length} booking(s) in this period`
        : 'Available for booking',
    };

    return NextResponse.json({
      success: true,
      data: availability,
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to check availability' },
      { status: 500 }
    );
  }
}


