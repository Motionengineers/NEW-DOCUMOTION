import { NextResponse } from 'next/server';
import {
  loadGovtSchemes,
  loadBankSchemes,
  loadTalentProfiles,
  loadPitchDecks,
  loadLiveUpdates,
} from '@/lib/dataSources';

export async function GET() {
  try {
    const [govtSchemes, bankSchemes, talent, decks, updates] = await Promise.all([
      loadGovtSchemes(),
      loadBankSchemes(),
      loadTalentProfiles(),
      loadPitchDecks(),
      loadLiveUpdates(),
    ]);

    const now = Date.now();
    const updatedToday = (updates.feed || updates || []).filter(update => {
      if (!update?.time) return false;
      const updateTime = new Date(update.time).getTime();
      if (Number.isNaN(updateTime)) return false;
      return now - updateTime <= 24 * 60 * 60 * 1000;
    }).length;

    const bankSchemesNormalized = bankSchemes.map(item => ({
      ...item,
      type: (item.type || '').toLowerCase(),
    }));

    const response = {
      success: true,
      schemes: govtSchemes.length,
      banks: bankSchemes.length,
      talent: talent.length,
      pitchdecks: decks.length,
      registrations: 6, // number of ready-made registration flows in ServiceRequestForm
      govtLoans: bankSchemesNormalized.filter(item => item.type.includes('government')).length,
      privateBanks: bankSchemesNormalized.filter(item => item.type.includes('private')).length,
      ventureDebt: bankSchemesNormalized.filter(item => item.type.includes('venture')).length,
      updatedToday,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('GET /api/dashboard failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load dashboard metrics',
      },
      { status: 500 }
    );
  }
}
