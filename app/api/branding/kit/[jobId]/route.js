import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(_request, { params }) {
  try {
    const id = Number(params.jobId);
    const job = await prisma.brandExportJob.findUnique({ where: { id } });
    if (!job) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    let files = null;
    try {
      files = job.filesJson ? JSON.parse(job.filesJson) : null;
    } catch {
      files = null;
    }
    return NextResponse.json({ success: true, job: { ...job, files } });
  } catch (error) {
    console.error('GET /api/branding/kit/[jobId] error:', error);
    return NextResponse.json({ success: false, error: 'Unable to load export job' }, { status: 500 });
  }
}


