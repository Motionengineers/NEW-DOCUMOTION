import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const token = await getToken({ req: request });
    if (!token || !token.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { brandName, primaryColor, secondaryColor } = body;

    // In production, this would call OpenAI or another AI service
    // For now, return placeholder generated assets
    const generatedLogos = [
      {
        id: `logo-${Date.now()}-1`,
        symbol: brandName?.charAt(0)?.toUpperCase() || 'A',
        color: primaryColor || '#3A7DFF',
        style: 'minimal',
      },
      {
        id: `logo-${Date.now()}-2`,
        symbol: 'Δ',
        color: primaryColor || '#3A7DFF',
        style: 'geometric',
      },
      {
        id: `logo-${Date.now()}-3`,
        symbol: '∞',
        color: primaryColor || '#3A7DFF',
        style: 'abstract',
      },
    ];

    const generatedVisuals = [
      {
        id: `visual-${Date.now()}-1`,
        type: 'hero',
        url: `data:image/svg+xml,${encodeURIComponent(
          `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:${primaryColor || '#3A7DFF'};stop-opacity:1" />
                <stop offset="100%" style="stop-color:${secondaryColor || '#111827'};stop-opacity:1" />
              </linearGradient>
            </defs>
            <rect width="400" height="300" fill="url(#grad)"/>
            <text x="200" y="150" font-family="Arial" font-size="32" fill="white" text-anchor="middle">${brandName || 'Brand'}</text>
          </svg>`
        )}`,
      },
    ];

    return NextResponse.json({
      success: true,
      logos: generatedLogos,
      visuals: generatedVisuals,
      message: 'Generated assets successfully',
    });
  } catch (error) {
    console.error('Error generating branding assets:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

