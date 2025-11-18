import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateSemanticTokens } from '@/lib/branding/tokens';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const latest = await prisma.brandToken.findFirst({
      orderBy: { updatedAt: 'desc' },
    });
    if (!latest) {
      return NextResponse.json({ success: true, tokens: generateSemanticTokens({}) });
    }
    let tokens = null;
    try {
      tokens = JSON.parse(latest.tokensJson);
    } catch {
      tokens = null;
    }
    return NextResponse.json({ success: true, tokens: tokens || generateSemanticTokens({}) });
  } catch (error) {
    console.error('GET /api/branding/tokens error:', error);
    return NextResponse.json({ success: false, error: 'Unable to load tokens' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const tokens = generateSemanticTokens(body || {});
    const rec = await prisma.brandToken.create({
      data: { tokensJson: JSON.stringify(tokens) },
    });
    return NextResponse.json({ success: true, id: rec.id, tokens });
  } catch (error) {
    console.error('POST /api/branding/tokens error:', error);
    return NextResponse.json({ success: false, error: 'Unable to save tokens' }, { status: 500 });
  }
}


