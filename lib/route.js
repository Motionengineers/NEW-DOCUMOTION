import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { getStartupWithDocuments } from './readinessUtils';
import { calculateOverallReadiness } from './scoreCalculator';

export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const startupId = searchParams.get('startupId');
    const type = searchParams.get('type') || 'FUNDING'; 
    
    let targetStartupId = startupId;
    if (!targetStartupId) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { startup: true }
      });
      targetStartupId = user?.startup?.id;
    }
    
    if (!targetStartupId) {
      return NextResponse.json({ error: 'No startup profile found' }, { status: 404 });
    }
    
    const startup = await getStartupWithDocuments(targetStartupId);
    if (!startup) return NextResponse.json({ error: 'Startup not found' }, { status: 404 });
    
    const results = {
      FUNDING: calculateOverallReadiness(startup, startup.documents, 'FUNDING'),
      COMPLIANCE: calculateOverallReadiness(startup, startup.documents, 'COMPLIANCE'),
      SCHEME: calculateOverallReadiness(startup, startup.documents, 'SCHEME')
    };
    
    const data = type === 'all' ? results : results[type];
    
    return NextResponse.json({
      success: true,
      data,
      startup: { name: startup.name, sector: startup.sector }
    });
    
  } catch (error) {
    console.error('[READINESS_API_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}