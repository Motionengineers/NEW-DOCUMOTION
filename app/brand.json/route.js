import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Prefer the latest published BrandVersion if available
    const latestVersion = await prisma.brandVersion.findFirst({
      orderBy: { publishedAt: 'desc' },
    });

    let payload = null;
    if (latestVersion?.dataJson) {
      try {
        payload = JSON.parse(latestVersion.dataJson);
      } catch {
        payload = null;
      }
    }

    // Fallback: derive minimal payload from BrandToken or BrandingSettings
    if (!payload) {
      const token = await prisma.brandToken.findFirst({
        orderBy: { updatedAt: 'desc' },
      });
      let tokens = null;
      if (token?.tokensJson) {
        try {
          tokens = JSON.parse(token.tokensJson);
        } catch {
          tokens = null;
        }
      }

      // Basic settings fallback
      const settings = await prisma.settings.findMany({
        where: { category: 'branding' },
      });
      const map = new Map(settings.map(s => [s.key, s]));
      const get = k => map.get(k)?.value;

      payload = {
        name: get('companyName') || 'Documotion',
        version: latestVersion?.version || 'unversioned',
        tokens: tokens || {
          color: {
            primary: get('primaryColor') || '#0066cc',
            accent: get('accentColor') || '#22c55e',
            surface: '#0b0b0c',
            text: '#edeff3',
          },
          typography: {
            fontPrimary: get('fontBody') || 'Inter',
            fontHindi: 'Tiro Devanagari Hindi',
            scale: 'majorThird',
          },
          spacing: { base: 4, scale: 1.25 },
        },
        assets: {
          logo: { default: get('logoUrl') || '' },
          favicon: get('faviconUrl') || '',
        },
        updatedAt: new Date().toISOString(),
      };
    }

    const res = NextResponse.json(payload);
    res.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=86400');
    return res;
  } catch (error) {
    console.error('GET /brand.json error:', error);
    return NextResponse.json(
      { error: 'Unable to load brand runtime' },
      { status: 500 }
    );
  }
}


