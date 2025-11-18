'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Palette,
  Sparkles,
  Image as ImageIcon,
  Type,
  FileText,
  Workflow,
  Wand2,
  BarChart2,
  Save,
  History,
  Users,
  MonitorSmartphone,
  Moon,
  Sun,
  Zap,
  BadgeCheck,
  MapPin,
  Star,
} from 'lucide-react';
import { useBrandingStudioStore } from '@/lib/stores/brandingStudioStore';
import { useBranding } from '@/components/BrandingProvider';

const placeholderLogos = ['A', 'Δ', '☆', '∞', '◎'];
const placeholderTaglines = [
  'Empowering innovation at speed.',
  'Concierge-grade growth for founders.',
  'Build faster. Launch smarter.',
];
const placeholderFonts = [
  { heading: 'Sora', body: 'Inter' },
  { heading: 'Cabinet Grotesk', body: 'Manrope' },
  { heading: 'Clash Display', body: 'General Sans' },
];

function SectionCard({ icon: Icon, title, description, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-3xl border border-white/5 bg-white/[0.03] p-6 shadow-lg backdrop-blur"
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            {description ? <p className="text-sm text-slate-400">{description}</p> : null}
          </div>
        </div>
      </div>
      {children}
    </motion.div>
  );
}

function PreviewCard({ brandName, tagline, primaryColor, secondaryColor }) {
  return (
    <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 text-white shadow-lg">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.3em] text-slate-400">Live preview</span>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <MonitorSmartphone className="h-4 w-4" />
          <Sun className="h-4 w-4" />
          <Moon className="h-4 w-4" />
        </div>
      </div>
      <div
        className="mt-6 rounded-2xl p-6 text-white shadow-inner"
        style={{
          background: `linear-gradient(130deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        }}
      >
        <div className="flex items-center gap-3 text-lg font-semibold">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
            <Zap className="h-5 w-5" />
          </div>
          {brandName}
        </div>
        <p className="mt-4 text-sm text-white/80">{tagline}</p>
        <button
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-slate-900 transition hover:opacity-90"
          style={{ color: secondaryColor }}
        >
          Preview landing page
          <Sparkles className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function BrandingStudio() {
  const { updateBranding } = useBranding();
  const {
    brandName,
    tagline,
    primaryColor,
    secondaryColor,
    fonts,
    logos,
    productImages,
    versions,
    setBrandName,
    setTagline,
    setPrimaryColor,
    setSecondaryColor,
    setFonts,
    addLogo,
    removeLogo,
    addProductImage,
    resetBrand,
    pushVersion,
  } = useBrandingStudioStore();

  const [partnerFilter, setPartnerFilter] = useState('ALL');
  const [partners, setPartners] = useState([]);
  const [partnerLoading, setPartnerLoading] = useState(false);
  const [partnerError, setPartnerError] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setPartnerLoading(true);
        setPartnerError(null);
        const params = new URLSearchParams({ verified: 'true', limit: '12' });
        if (partnerFilter !== 'ALL') {
          params.set('type', partnerFilter);
        }
        const response = await fetch(`/api/branding/partners?${params.toString()}`, {
          cache: 'no-store',
        });
        const json = await response.json();
        if (!active) return;
        if (!response.ok || !json?.success) {
          throw new Error(json?.error || 'Unable to load partners');
        }
        setPartners(json.data || []);
      } catch (error) {
        if (!active) return;
        console.error('Failed to load verified partners', error);
        setPartnerError(error.message || 'Unable to load partners');
        setPartners([]);
      } finally {
        if (active) {
          setPartnerLoading(false);
        }
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [partnerFilter]);

  const completeness = useMemo(() => {
    const fields = [
      Boolean(brandName),
      Boolean(tagline),
      Boolean(primaryColor),
      logos.length > 0,
      productImages.length > 0,
    ];
    const score = Math.round((fields.filter(Boolean).length / fields.length) * 100);
    return Number.isNaN(score) ? 0 : score;
  }, [brandName, tagline, primaryColor, logos.length, productImages.length]);

  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const handleGeneratePdf = () => {
    const url = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenTemplateLibrary = () => {
    window.open(
      'https://www.figma.com/files/search/brand%20kit%20template',
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleLaunchPreview = () => {
    const previewWindow = window.open('', '_blank');
    if (!previewWindow) return;

    const html = `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${brandName} — preview</title>
        <style>
          body {
            margin: 0;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            color: #0f172a;
            background: #f1f5f9;
          }
          .hero {
            padding: 72px;
            background: linear-gradient(130deg, ${primaryColor} 0%, ${secondaryColor} 100%);
            color: #fff;
          }
          .hero h1 {
            margin: 0 0 16px;
            font-size: 48px;
          }
          .hero p {
            margin: 0 0 32px;
            font-size: 18px;
            line-height: 1.6;
          }
          .cta {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            padding: 14px 28px;
            background: #fff;
            color: ${primaryColor};
            border-radius: 999px;
            font-weight: 600;
            text-decoration: none;
            box-shadow: 0 18px 32px rgba(15, 23, 42, 0.18);
          }
          .section {
            padding: 64px;
          }
          .palette {
            display: grid;
            gap: 18px;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            margin-top: 36px;
          }
          .swatch {
            border-radius: 18px;
            overflow: hidden;
            box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);
            background: #fff;
          }
          .swatch-color {
            height: 110px;
          }
          .swatch-info {
            padding: 16px;
            font-family: monospace;
            font-size: 14px;
            letter-spacing: 1px;
          }
        </style>
      </head>
      <body>
        <section class="hero">
          <h1>${brandName}</h1>
          <p>${tagline}</p>
          <a class="cta" href="#">Get started</a>
        </section>
        <section class="section">
          <h2>Color palette</h2>
          <div class="palette">
            <div class="swatch">
              <div class="swatch-color" style="background:${primaryColor}"></div>
              <div class="swatch-info">${primaryColor}</div>
            </div>
            <div class="swatch">
              <div class="swatch-color" style="background:${secondaryColor}"></div>
              <div class="swatch-info">${secondaryColor}</div>
            </div>
            <div class="swatch">
              <div class="swatch-color" style="background:#ffffff"></div>
              <div class="swatch-info">#FFFFFF</div>
            </div>
          </div>
        </section>
      </body>
    </html>`;

    previewWindow.document.write(html);
    previewWindow.document.close();
  };

  const handleSaveCheckpoint = async () => {
    setSaving(true);
    setSaveStatus(null);
    
    try {
      const snapshot = {
        brandName,
        tagline,
        primaryColor,
        secondaryColor,
        fonts,
        logos,
        productImages,
      };

      // Apply branding globally across the app
      const selectedLogo = logos.length > 0 ? logos[0] : null;
      const logoUrl = selectedLogo?.url || selectedLogo?.symbol 
        ? `data:image/svg+xml,${encodeURIComponent(
            `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
              <text x="50" y="50" font-size="60" fill="${primaryColor}" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-weight="bold">${selectedLogo?.symbol || brandName?.charAt(0)?.toUpperCase() || 'A'}</text>
            </svg>`
          )}`
        : '';

      // Prepare branding settings to save
      const brandingSettings = {
        companyName: brandName || 'Documotion',
        tagline: tagline || '',
        primaryColor: primaryColor || '#0066cc',
        secondaryColor: secondaryColor || '#64748b',
        logoUrl: logoUrl,
        fontHeading: fonts?.heading || 'Inter',
        fontBody: fonts?.body || 'Inter',
      };

      // Save to database first - wait for all saves to complete
      const savePromises = Object.entries(brandingSettings).map(([key, value]) =>
        fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key,
            value: typeof value === 'string' ? value : JSON.stringify(value),
            category: 'branding',
            type:
              typeof value === 'object'
                ? 'json'
                : key.includes('Color')
                  ? 'color'
                  : typeof value === 'number'
                    ? 'number'
                    : 'string',
            description: `Branding ${key}`,
          }),
        })
      );

      // Wait for all settings to be saved and verify
      const saveResults = await Promise.all(savePromises);
      const failedSaves = saveResults.filter(res => !res.ok);
      
      if (failedSaves.length > 0) {
        const errorDetails = await Promise.all(
          failedSaves.map(async res => {
            try {
              const json = await res.json();
              return json.error || 'Unknown error';
            } catch {
              return `HTTP ${res.status}`;
            }
          })
        );
        throw new Error(`Failed to save: ${errorDetails.join(', ')}`);
      }

      // Verify saves by checking response
      for (const res of saveResults) {
        const json = await res.json();
        if (!json.success) {
          throw new Error('Save verification failed');
        }
      }

      // Now apply branding globally (this will also save, but we've already saved above)
      // This ensures the UI updates immediately
      await updateBranding(brandingSettings);

      // Save to branding workspace for version history (optional)
      try {
        await fetch('/api/branding/workspace', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `${brandName} - ${new Date().toLocaleDateString()}`,
            sections: JSON.stringify({
              brandName,
              tagline,
              primaryColor,
              secondaryColor,
              fonts,
            }),
            progress: completeness,
          }),
        });
      } catch (workspaceError) {
        console.warn('Workspace save failed (non-critical):', workspaceError);
      }

      // Save locally for version history
      pushVersion(snapshot);
      
      setSaveStatus({
        type: 'success',
        message: 'Branding saved permanently! Your colors, logo, and company name are now live across the app.',
      });
      
      // Reload after a delay to show the success message and ensure all components refresh
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error saving checkpoint:', error);
      
      setSaveStatus({
        type: 'error',
        message: 'Failed to save branding. Please try again or check your connection.',
      });
      
      // Still save locally for version history
      pushVersion({
        brandName,
        tagline,
        primaryColor,
        secondaryColor,
        fonts,
        logos,
        productImages,
      });
    } finally {
      setTimeout(() => setSaveStatus(null), 5000);
      setSaving(false);
    }
  };

  const handleAutoGenerate = async () => {
    setSaving(true);
    setSaveStatus(null);
    
    try {
      // Generate logos and visuals using AI
      const response = await fetch('/api/branding/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName,
          tagline,
          primaryColor,
          secondaryColor,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Generation failed');
      }
      
      // Update store with generated assets
      let logosAdded = 0;
      let visualsAdded = 0;
      
      if (data.logos && Array.isArray(data.logos) && data.logos.length > 0) {
        data.logos.forEach(logo => {
          addLogo(logo);
          logosAdded++;
        });
      }
      
      if (data.visuals && Array.isArray(data.visuals) && data.visuals.length > 0) {
        data.visuals.forEach(visual => {
          addProductImage(visual);
          visualsAdded++;
        });
      }

      setSaveStatus({
        type: 'success',
        message: `Generated ${logosAdded} logos and ${visualsAdded} visuals! They're now available in your brand kit.`,
      });
    } catch (error) {
      console.error('Error generating assets:', error);
      
      // Fallback: generate smart placeholder logos based on brand name
      const firstLetter = brandName?.charAt(0)?.toUpperCase() || 'A';
      const generatedLogos = [
        {
          id: `logo-${Date.now()}-1`,
          symbol: firstLetter,
          color: primaryColor,
          style: 'minimal',
        },
        {
          id: `logo-${Date.now()}-2`,
          symbol: 'Δ',
          color: primaryColor,
          style: 'geometric',
        },
        {
          id: `logo-${Date.now()}-3`,
          symbol: '∞',
          color: primaryColor,
          style: 'abstract',
        },
      ];
      
      generatedLogos.forEach(logo => addLogo(logo));
      
      // Generate a simple visual
      const generatedVisual = {
        id: `visual-${Date.now()}-1`,
        type: 'hero',
        url: `data:image/svg+xml,${encodeURIComponent(
          `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:${primaryColor};stop-opacity:1" />
                <stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:1" />
              </linearGradient>
            </defs>
            <rect width="400" height="300" fill="url(#grad)"/>
            <text x="200" y="150" font-family="Arial" font-size="32" fill="white" text-anchor="middle">${brandName || 'Brand'}</text>
          </svg>`
        )}`,
      };
      addProductImage(generatedVisual);
      
      setSaveStatus({
        type: 'success',
        message: `Generated 3 logos and 1 visual using your brand colors! (AI service unavailable, using smart placeholders)`,
      });
    } finally {
      setTimeout(() => setSaveStatus(null), 5000);
      setSaving(false);
    }
  };

  const formatPartnerType = type => {
    switch (type) {
      case 'AGENCY':
        return 'Ad Agency';
      case 'PHOTOGRAPHER':
        return 'Photographer';
      case 'MEDIA':
        return 'Media Specialist';
      default:
        return type;
    }
  };

  const handlePartnerRequest = async partner => {
    try {
      const name = window.prompt('Your name');
      if (!name) return;
      const email = window.prompt('Work email');
      if (!email) return;
      const notes = window.prompt('Describe what you need (optional)') || '';

      const response = await fetch(`/api/branding/partners/${partner.id}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, notes }),
      });
      const json = await response.json();
      if (!response.ok || !json?.success) {
        throw new Error(json?.error || 'Unable to send request');
      }
      window.alert('Request submitted! Our concierge team will follow up shortly.');
    } catch (error) {
      console.error('Failed to submit partner request', error);
      window.alert(error.message || 'Unable to send request. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--system-background)] text-white">
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl border border-white/5 bg-white/[0.04] p-8 shadow-2xl backdrop-blur"
        >
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="flex-1 space-y-6">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-blue-200">
                  Branding studio
                </span>
                <div className="space-y-2">
                  <h1 className="text-4xl font-semibold text-white">
                    Create a signature brand system
                  </h1>
                  <p className="text-sm text-slate-300">
                    Generate logos, narratives, launch visuals, and shareable brand kits that match
                    your concierge workflows.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  Brand name
                  <input
                    value={brandName}
                    onChange={event => setBrandName(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    placeholder="Acme Labs"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  Tagline
                  <input
                    value={tagline}
                    onChange={event => setTagline(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    placeholder="Innovate the future"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-[1fr_auto_auto]">
                <label className="space-y-2 text-sm text-slate-300">
                  Primary color
                  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={event => setPrimaryColor(event.target.value)}
                      className="h-10 w-14 rounded-md border border-white/10 bg-transparent"
                    />
                    <span className="text-sm text-slate-300">{primaryColor}</span>
                  </div>
                </label>
                <label className="space-y-2 text-sm text-slate-300">
                  Accent color
                  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={event => setSecondaryColor(event.target.value)}
                      className="h-10 w-14 rounded-md border border-white/10 bg-transparent"
                    />
                    <span className="text-sm text-slate-300">{secondaryColor}</span>
                  </div>
                </label>
                <div className="mt-6 space-y-2">
                  <button
                    type="button"
                    onClick={handleSaveCheckpoint}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-60"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                    }}
                  >
                    <Save className="h-4 w-4" />
                    {saving ? 'Saving…' : 'Save checkpoint'}
                  </button>
                  {saveStatus ? (
                    <p
                      className={`text-xs ${
                        saveStatus.type === 'error' ? 'text-amber-300' : 'text-emerald-300'
                      }`}
                    >
                      {saveStatus.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleAutoGenerate}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-400 hover:to-violet-400 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Sparkles className="h-4 w-4" />
                  {saving ? 'Generating…' : 'Auto-generate logos & visuals'}
                </button>
                <button
                  type="button"
                  onClick={resetBrand}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-white/25 hover:bg-white/5"
                >
                  Reset brand
                </button>
              </div>
            </div>

            <div className="hidden w-full max-w-sm flex-none lg:block">
              <PreviewCard
                brandName={brandName}
                tagline={tagline}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
              />
            </div>
          </div>
        </motion.section>

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <SectionCard
              icon={Palette}
              title="AI Logo Generator"
              description="Preview multiple logo styles tuned to your color palette."
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {placeholderLogos.map(symbol => {
                  const isSelected = logos.some(logo => logo.symbol === symbol);
                  return (
                    <button
                      key={symbol}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          // Remove if already selected
                          const index = logos.findIndex(logo => logo.symbol === symbol);
                          if (index >= 0) {
                            removeLogo(index);
                          }
                        } else {
                          // Add new logo
                          addLogo({
                            id: `logo-${Date.now()}-${symbol}`,
                            symbol,
                            color: primaryColor,
                            style: 'minimal',
                          });
                        }
                      }}
                      className={`flex h-32 flex-col items-center justify-center rounded-2xl border transition ${
                        isSelected
                          ? 'border-blue-500/50 bg-blue-500/20'
                          : 'border-white/5 bg-white/[0.02] hover:border-blue-500/30 hover:bg-blue-500/10'
                      }`}
                    >
                      <span className="text-4xl font-semibold" style={{ color: primaryColor }}>
                        {symbol}
                      </span>
                      <p className="mt-2 text-xs text-slate-400">
                        {isSelected ? 'Selected' : 'Click to select'}
                      </p>
                    </button>
                  );
                })}
              </div>
            </SectionCard>

            <SectionCard
              icon={ImageIcon}
              title="Product & marketing visuals"
              description="Auto-generate hero shots, social banners, and mockups."
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map(idx => (
                  <div
                    key={idx}
                    className="flex h-40 flex-col justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition hover:border-blue-500/30 hover:bg-blue-500/10"
                  >
                    <div className="text-sm font-semibold text-white">Visual #{idx}</div>
                    <div className="text-xs text-slate-400">
                      Placeholder for AI-generated asset. Drop your product image to style-match.
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              icon={Type}
              title="Tagline & font pairings"
              description="Explore tone variations and typefaces that fit your brand."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">AI Taglines</p>
                  <div className="space-y-3">
                    {placeholderTaglines.map(line => {
                      const isSelected = tagline === line;
                      return (
                        <button
                          key={line}
                          type="button"
                          onClick={() => setTagline(line)}
                          className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${
                            isSelected
                              ? 'border-blue-500/50 bg-blue-500/20 text-white'
                              : 'border-white/5 bg-white/[0.02] text-slate-200 hover:border-blue-500/30 hover:bg-blue-500/10'
                          }`}
                        >
                          {line}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Font pairings</p>
                  <div className="space-y-3">
                    {placeholderFonts.map(pair => {
                      const isSelected =
                        fonts.heading === pair.heading && fonts.body === pair.body;
                      return (
                        <button
                          key={`${pair.heading}-${pair.body}`}
                          type="button"
                          onClick={() => setFonts({ heading: pair.heading, body: pair.body })}
                          className={`w-full rounded-2xl border p-4 text-left text-sm transition ${
                            isSelected
                              ? 'border-blue-500/50 bg-blue-500/20'
                              : 'border-white/5 bg-white/[0.02] hover:border-blue-500/30 hover:bg-blue-500/10'
                          }`}
                        >
                          <p className={`text-base font-semibold ${isSelected ? 'text-white' : 'text-white'}`}>
                            {pair.heading}
                          </p>
                          <p className={`text-xs ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                            Body: {pair.body}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              icon={FileText}
              title="Templates & brand kits"
              description="Export social templates, landing mockups, and PDF brand kits."
            >
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-sm text-slate-200">
                  <h4 className="text-white">PDF Brand Kit</h4>
                  <p className="mt-2 text-xs text-slate-400">
                    Logos, palettes, typography, and hero images packaged automatically.
                  </p>
                  <button
                    onClick={handleGeneratePdf}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-xs text-slate-200 transition hover:border-white/20 hover:bg-white/5"
                  >
                    Generate PDF
                  </button>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-sm text-slate-200">
                  <h4 className="text-white">Social templates</h4>
                  <p className="mt-2 text-xs text-slate-400">
                    Editable export for LinkedIn, Instagram, and newsletter banners.
                  </p>
                  <button
                    onClick={handleOpenTemplateLibrary}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-xs text-slate-200 transition hover:border-white/20 hover:bg-white/5"
                  >
                    Open template library
                  </button>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-sm text-slate-200">
                  <h4 className="text-white">Landing preview</h4>
                  <p className="mt-2 text-xs text-slate-400">
                    Instantly preview a mini landing page with your branding and CTAs.
                  </p>
                  <button
                    onClick={handleLaunchPreview}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-xs text-slate-200 transition hover:border-white/20 hover:bg-white/5"
                  >
                    Launch preview
                  </button>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              icon={BadgeCheck}
              title="Verified partners"
              description="Book trusted branding experts vetted by Documotion."
            >
              <div className="mb-4 flex flex-wrap gap-2">
                {[
                  { label: 'All', value: 'ALL' },
                  { label: 'Ad Agencies', value: 'AGENCY' },
                  { label: 'Photographers', value: 'PHOTOGRAPHER' },
                  { label: 'Media', value: 'MEDIA' },
                ].map(filter => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setPartnerFilter(filter.value)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                      partnerFilter === filter.value
                        ? 'bg-blue-500/20 text-blue-200 border border-blue-400/40'
                        : 'bg-white/5 text-slate-300 border border-white/10 hover:border-blue-400/30'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {partnerLoading ? (
                <div className="flex items-center justify-center rounded-2xl border border-white/5 bg-white/5 py-10 text-sm text-slate-300">
                  Loading partners…
                </div>
              ) : partnerError ? (
                <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                  {partnerError}
                </div>
              ) : partners.length === 0 ? (
                <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-6 text-sm text-slate-300">
                  No verified partners found yet. Our concierge team is adding new agencies this week.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {partners.map(partner => (
                    <div
                      key={partner.id}
                      className="flex flex-col justify-between rounded-2xl border border-white/5 bg-white/[0.03] p-4 text-sm text-slate-200 shadow-sm"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <BadgeCheck className="h-4 w-4 text-emerald-300" />
                          <span className="text-xs uppercase tracking-[0.3em] text-slate-400">Verified</span>
                        </div>
                        <h4 className="text-lg font-semibold text-white">{partner.name}</h4>
                        <p className="text-xs text-slate-400">{formatPartnerType(partner.type)}</p>
                        {partner.city ? (
                          <p className="flex items-center gap-2 text-xs text-slate-400">
                            <MapPin className="h-3.5 w-3.5" />
                            {partner.city}
                          </p>
                        ) : null}
                        {partner.rating ? (
                          <p className="flex items-center gap-1 text-xs text-amber-200">
                            <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                            {partner.rating.toFixed(1)} ({partner.ratingCount} reviews)
                          </p>
                        ) : null}
                        {partner.portfolioUrl ? (
                          <a
                            href={partner.portfolioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex text-xs text-blue-200 hover:text-blue-100"
                          >
                            View portfolio →
                          </a>
                        ) : null}
                      </div>
                      <div className="mt-4 flex flex-col gap-2">
                        {partner.contactEmail ? (
                          <a
                            href={`mailto:${partner.contactEmail}`}
                            className="inline-flex items-center justify-center rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-blue-400/40 hover:bg-blue-500/10"
                          >
                            Email contact
                          </a>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => handlePartnerRequest(partner)}
                          className="inline-flex items-center justify-center rounded-xl bg-blue-500/20 px-3 py-2 text-xs font-semibold text-blue-100 transition hover:bg-blue-500/30"
                        >
                          Request collaboration
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard
              icon={Workflow}
              title="Workflow tools"
              description="Keep your team aligned with checkpoints & version history."
            >
              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-3">
                  <Save className="h-4 w-4 text-blue-300" />
                  <div>
                    <p className="font-semibold text-white">Save & continue later</p>
                    <p className="text-xs text-slate-400">
                      Draft auto-saves to your workspace vault.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-3">
                  <History className="h-4 w-4 text-purple-300" />
                  <div>
                    <p className="font-semibold text-white">Version history</p>
                    <p className="text-xs text-slate-400">
                      View {versions.length} saved versions. Roll back with one click.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-3">
                  <Users className="h-4 w-4 text-emerald-300" />
                  <div>
                    <p className="font-semibold text-white">Manage multiple brands</p>
                    <p className="text-xs text-slate-400">
                      Switch between client workspaces without losing your place.
                    </p>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              icon={Wand2}
              title="AI branding assistant"
              description="Inline guidance for legibility, color harmony, and storytelling."
            >
              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-3">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  <div>
                    <p className="font-semibold text-white">Logo simplification</p>
                    <p className="text-xs text-slate-400">
                      Get suggestions to improve clarity at small sizes.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-3">
                  <Palette className="h-4 w-4 text-blue-300" />
                  <div>
                    <p className="font-semibold text-white">Palette improvements</p>
                    <p className="text-xs text-slate-400">
                      AI recommends accent colors and contrast ratios automatically.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-3">
                  <Type className="h-4 w-4 text-emerald-300" />
                  <div>
                    <p className="font-semibold text-white">Tagline refinement</p>
                    <p className="text-xs text-slate-400">
                      Tone, length, and clarity guidance for headlines.
                    </p>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              icon={BarChart2}
              title="Brand completeness"
              description="Fill in key elements to reach 100% and unlock export shortcuts."
            >
              <div className="space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Progress</span>
                    <span>{completeness}% complete</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-white/10">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all"
                      style={{ width: `${completeness}%` }}
                    />
                  </div>
                </div>
                <ul className="list-disc space-y-1 pl-4 text-xs text-slate-400">
                  <li>Add a logo to reach 60%.</li>
                  <li>Generate a product visual to reach 80%.</li>
                  <li>Export a PDF brand kit to unlock sharing.</li>
                </ul>
              </div>
            </SectionCard>
          </div>
        </section>
      </main>
    </div>
  );
}
