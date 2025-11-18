import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const token = await getToken({ req: request });
    if (!token || !token.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(token.userId);
    const body = await request.json();
    const { title, sections, progress } = body;

    const workspace = await prisma.brandingWorkspace.create({
      data: {
        userId,
        title: title || 'Untitled Brand Workspace',
        sections: typeof sections === 'string' ? sections : JSON.stringify(sections),
        progress: progress || 0,
        status: 'draft',
      },
    });

    return NextResponse.json({
      success: true,
      workspace: {
        id: workspace.id,
        title: workspace.title,
        progress: workspace.progress,
      },
    });
  } catch (error) {
    console.error('Error creating branding workspace:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

