import { NextResponse } from 'next/server';
import { loadGovtSchemes, loadBankSchemes } from '@/lib/dataSources';

export async function POST(request) {
  try {
    const { question = '' } = await request.json();
    const prompt = question.toString().trim();
    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Ask a question so Documotion Assistant can help.' },
        { status: 400 }
      );
    }

    const [govtSchemes, bankSchemes] = await Promise.all([loadGovtSchemes(), loadBankSchemes()]);
    const lower = prompt.toLowerCase();
    let answer = '';

    if (lower.includes('loan') || lower.includes('bank')) {
      const topBanks = bankSchemes.slice(0, 3).map(s => `${s.bankName} – ${s.schemeName}`);
      answer = `Here are a few financing options that Documotion tracks right now:\n\n• ${topBanks.join(
        '\n• '
      )}\n\nWe summarise eligibility, interest rates, and documents inside the Bank Hub. Open the “Bank” page from the navigation to explore the full catalogue and walk-throughs.`;
    } else if (lower.includes('grant') || lower.includes('scheme')) {
      const topSchemes = govtSchemes.slice(0, 3).map(s => `${s.scheme_name} (${s.category})`);
      answer = `Documotion is already monitoring ${govtSchemes.length} government programmes. A few founder favourites:\n\n• ${topSchemes.join(
        '\n• '
      )}\n\nUse the “Schemes” view or the Eligibility Checker on your dashboard to get a personalised shortlist, complete with documents and deadlines.`;
    } else if (lower.includes('register') || lower.includes('incorporation')) {
      answer =
        'For incorporations we run concierge playbooks across Private Limited, LLP, OPC, partnership and MSME. Pick a track inside “Services → Registration”; once you submit details Documotion books a compliance specialist and shares a live timeline, document vault and payment link.';
    } else {
      answer = `Great question! Documotion currently manages:\n\n• ${govtSchemes.length} government schemes with daily updates\n• ${
        bankSchemes.length
      } bank and venture-debt products curated for Indian startups\n• On-demand concierge for registrations, compliance and branding\n\nOpen your dashboard to track recommendations, eligibility scores, and upload documents once to reuse everywhere.`;
    }

    return NextResponse.json({ success: true, answer });
  } catch (error) {
    console.error('POST /api/openai/chat failed:', error);
    return NextResponse.json(
      { success: false, error: 'Assistant is unavailable right now. Please try again shortly.' },
      { status: 500 }
    );
  }
}
