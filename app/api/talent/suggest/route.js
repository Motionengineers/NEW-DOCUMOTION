import { NextResponse } from 'next/server';
import { loadTalentProfiles } from '@/lib/dataSources';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim().toLowerCase();
    const limit = Number.parseInt(searchParams.get('limit') || '6', 10);

    if (!q) {
      return NextResponse.json({ success: true, names: [], designations: [], skills: [] });
    }

    const profiles = await loadTalentProfiles();

    const names = new Set();
    const designations = new Set();
    const skills = new Set();

    profiles.forEach(profile => {
      if (profile.fullName?.toLowerCase().includes(q)) {
        names.add(profile.fullName);
      }
      if (profile.designation?.toLowerCase().includes(q)) {
        designations.add(profile.designation);
      }
      profile.skillsArray?.forEach(skill => {
        if (skill.toLowerCase().includes(q)) {
          skills.add(skill);
        }
      });
    });

    const toArray = set => Array.from(set).slice(0, limit);

    return NextResponse.json({
      success: true,
      names: toArray(names),
      designations: toArray(designations),
      skills: toArray(skills),
    });
  } catch (error) {
    console.error('GET /api/talent/suggest failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to load suggestions',
      },
      { status: 500 }
    );
  }
}
