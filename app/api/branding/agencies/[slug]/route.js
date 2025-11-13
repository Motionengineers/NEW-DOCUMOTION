import { NextResponse } from 'next/server';
import { getAgencyBySlug } from '@/lib/brandingHub';

export const dynamic = 'force-dynamic';

export async function GET(_request, { params }) {
  try {
    const { slug } = params;
    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Agency slug is required' },
        { status: 400 }
      );
    }

    const agency = await getAgencyBySlug(slug, {
      includeServices: true,
      includePortfolio: true,
      includeReviews: true,
    });

    if (!agency) {
      return NextResponse.json({ success: false, error: 'Agency not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: agency });
  } catch (error) {
    console.error(`GET /api/branding/agencies/${params?.slug} failed:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to load agency profile',
      },
      { status: 500 }
    );
  }
}
