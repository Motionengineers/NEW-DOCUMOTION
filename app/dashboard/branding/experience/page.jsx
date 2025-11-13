'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Home, Palette, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useBranding } from '@/components/BrandingProvider.jsx';

export const dynamic = 'force-dynamic';

function HeroPreview() {
  const { branding } = useBranding();
  const primary = branding.primaryColor || '#0066cc';

  return (
    <section className="space-y-6 rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-white/10 to-transparent p-10">
      <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--secondary-label)' }}>
        <Palette className="h-5 w-5 text-blue-300" />
        Live branded workspace
      </div>
      <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div className="space-y-5">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--tertiary-label)' }}>
            <Star className="h-4 w-4 text-amber-400" />
            Your brand is live
          </span>
          <h1 className="text-4xl font-semibold leading-tight" style={{ color: 'var(--label)' }}>
            {branding.companyName || 'Your Company'} workspace is ready.
          </h1>
          <p className="text-base leading-relaxed" style={{ color: 'var(--secondary-label)' }}>
            Navigation, dashboards, and client touchpoints now carry your logo, colours, and messaging. Continue onboarding or invite your team to experience the branded workspace.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition"
              style={{ backgroundColor: primary }}
            >
              Enter your dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold transition hover:bg-white/10"
              style={{ color: 'var(--label)' }}
            >
              View homepage
              <Home className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.14),_transparent_55%)]" />
          <div className="relative space-y-4">
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
              {branding.logoUrl ? (
                <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-white">
                  <Image src={branding.logoUrl} alt={`${branding.companyName} logo`} fill className="object-contain p-2" sizes="48px" unoptimized />
                </div>
              ) : (
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-lg text-xl font-semibold text-white"
                  style={{ backgroundColor: primary }}
                >
                  {(branding.companyName || 'Your Company').slice(0, 1)}
                </div>
              )}
              <div>
                <p className="text-lg font-semibold" style={{ color: 'var(--label)' }}>
                  {branding.companyName || 'Your Company'}
                </p>
                <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--secondary-label)' }}>
                  {branding.tagline || 'Modern workspace for founders'}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 p-4" style={{ backgroundColor: primary, color: '#ffffff' }}>
              <p className="text-sm uppercase tracking-wide opacity-80">Primary CTA</p>
              <p className="text-2xl font-semibold leading-snug">
                Delight clients with a concierge experience that looks and feels like your studio.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {['Client portal', 'Deal rooms', 'AI insights', 'Onboarding flows'].map(item => (
                <div key={item} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium" style={{ color: 'var(--secondary-label)' }}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function BrandingExperiencePage() {
  return (
    <div className="min-h-screen bg-[var(--system-background)]">
      <Navbar />
      <main className="container mx-auto max-w-5xl px-4 py-12 space-y-12">
        <HeroPreview />
        <section className="grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 md:grid-cols-2">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--label)' }}>
              What changed?
            </h2>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--secondary-label)' }}>
              <li>• Global theme colours updated to your palette.</li>
              <li>• Logos and taglines shown across dashboards and client-facing surfaces.</li>
              <li>• Future email and PDF exports will carry your brand automatically.</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--label)' }}>
              Next steps
            </h2>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--secondary-label)' }}>
              <li>• Invite your team inside “Settings → Team”.</li>
              <li>• Upload brand assets for proposals and data rooms.</li>
              <li>• Configure payment flows and start onboarding clients.</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}

