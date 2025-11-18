import { NextResponse } from 'next/server';
import { readJson, writeJson } from '@/lib/fileStore';

const STORE_FILE = 'settings.json';
const DEFAULT_BRANDING = {
  companyName: 'Documotion',
  logoUrl: '',
  logoDarkUrl: '',
  faviconUrl: '',
  primaryColor: '#0066cc',
  secondaryColor: '#64748b',
  accentColor: '#22c55e',
  notificationColor: '#ff9500',
  tagline: 'The New Standard for Indian Startups',
};

async function ensureDefaults() {
  const stored = await readJson(STORE_FILE, null);
  if (stored) {
    return stored;
  }
  const defaults = {
    branding: { ...DEFAULT_BRANDING },
  };
  await writeJson(STORE_FILE, defaults);
  return defaults;
}

export async function GET(request) {
  try {
    const settings = await ensureDefaults();
    const { searchParams } = request.nextUrl;
    const category = searchParams.get('category') ?? 'branding';
    const data = settings[category] || {};
    return NextResponse.json({ success: true, settings: data });
  } catch (error) {
    console.error('GET /api/settings failed:', error);
    return NextResponse.json({ success: false, error: 'Unable to load settings' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { key, value, category = 'branding' } = body;
    if (!key) {
      return NextResponse.json({ success: false, error: 'Key is required' }, { status: 400 });
    }

    const settings = await ensureDefaults();
    settings[category] = { ...(settings[category] || {}), [key]: value };
    
    try {
      await writeJson(STORE_FILE, settings);
    } catch (writeError) {
      console.error('Failed to write settings file:', writeError);
      // On Vercel/serverless, file writes might fail - return success anyway for client-side storage
      // The branding will still be applied via BrandingProvider's updateBranding
      return NextResponse.json({ 
        success: true, 
        settings: settings[category],
        warning: 'Settings saved in memory only (file system not available)'
      });
    }

    return NextResponse.json({ success: true, settings: settings[category] });
  } catch (error) {
    console.error('POST /api/settings failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to save setting' 
    }, { status: 500 });
  }
}
