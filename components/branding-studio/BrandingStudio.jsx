'use client';

import { useMemo, useState } from 'react';
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
} from 'lucide-react';
import { useBrandingStudioStore } from '@/lib/stores/brandingStudioStore';

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
    resetBrand,
    pushVersion,
  } = useBrandingStudioStore();

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
    const snapshot = {
      brandName,
      tagline,
      primaryColor,
      secondaryColor,
      fonts,
      logos,
      productImages,
    };

    pushVersion(snapshot);
    setSaveStatus({
      type: 'success',
      message: 'Checkpoint saved locally (connect backend to persist).',
    });
    setTimeout(() => setSaveStatus(null), 3000);
    setSaving(false);
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
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-400 hover:to-violet-400"
                >
                  <Sparkles className="h-4 w-4" />
                  Auto-generate logos & visuals
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
                {placeholderLogos.map(symbol => (
                  <div
                    key={symbol}
                    className="flex h-32 flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] text-white transition hover:border-blue-500/30 hover:bg-blue-500/10"
                  >
                    <span className="text-4xl font-semibold" style={{ color: primaryColor }}>
                      {symbol}
                    </span>
                    <p className="mt-2 text-xs text-slate-400">Click to promote</p>
                  </div>
                ))}
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
                    {placeholderTaglines.map(line => (
                      <button
                        key={line}
                        type="button"
                        className="w-full rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 text-left text-sm text-slate-200 transition hover:border-blue-500/30 hover:bg-blue-500/10"
                      >
                        {line}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Font pairings</p>
                  <div className="space-y-3">
                    {placeholderFonts.map(pair => (
                      <div
                        key={`${pair.heading}-${pair.body}`}
                        className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-sm text-slate-200"
                      >
                        <p className="text-base font-semibold text-white">{pair.heading}</p>
                        <p className="text-xs text-slate-400">Body: {pair.body}</p>
                      </div>
                    ))}
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
