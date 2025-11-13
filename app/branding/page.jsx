import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { ArrowRight, Sparkles, Star } from 'lucide-react';

const CATEGORY_CARDS = [
  {
    title: 'Ad Agencies (India)',
    description: 'Full-service campaign partners for launch and growth across TV, digital, and OOH.',
    href: '/branding/agencies?category=Ad%20Agencies%20(India)',
  },
  {
    title: 'Branding Studios',
    description: 'Identity, storytelling, and design systems tailored for Indian consumer brands.',
    href: '/branding/agencies?category=Branding%20Studios',
  },
  {
    title: 'Video Production Houses',
    description: 'Film-grade production partners for product launches, TVCs, and investor films.',
    href: '/branding/agencies?category=Video%20Production%20Houses',
  },
  {
    title: 'Freelance Designers',
    description: 'UI/UX specialists, deck designers, and no-code builders for agile teams.',
    href: '/branding/agencies?category=Freelance%20Designers',
  },
  {
    title: 'Photographers',
    description: 'Product, lifestyle, and founder portrait photographers across Indian metros.',
    href: '/branding/agencies?category=Photographers',
  },
  {
    title: 'Social Media Agencies',
    description: 'Always-on content and community management with creator-led playbooks.',
    href: '/branding/agencies?category=Social%20Media%20Agencies',
  },
  {
    title: 'Media Buying Agencies',
    description: 'Performance specialists for Meta, Google, OTT, and outdoor planning.',
    href: '/branding/agencies?category=Media%20Buying%20Agencies',
  },
  {
    title: 'Influencer Marketing Agencies',
    description: 'Creator matchmaking, campaign orchestration, and measurable outcomes.',
    href: '/branding/agencies?category=Influencer%20Marketing%20Agencies',
  },
  {
    title: 'Creative Directors',
    description: 'Fractional leaders to craft brand worlds, campaign narratives, and launch IP.',
    href: '/branding/agencies?category=Creative%20Directors',
  },
  {
    title: 'Motion Graphics Artists',
    description: 'Motion-first storytellers for product demos, explainers, and pitch videos.',
    href: '/branding/agencies?category=Motion%20Graphics%20Artists',
  },
];

export const metadata = {
  title: 'Branding Hub • Discover Indian Ad Agencies and Creators',
  description:
    'Marketplace for founders to hire Indian ad agencies, branding studios, video production houses, and freelance talent with verified profiles and pricing.',
};

export default function BrandingHubLandingPage() {
  return (
    <div className="min-h-screen bg-[var(--system-background)]">
      <Navbar />

      <main className="container mx-auto max-w-6xl px-4 py-16 space-y-16">
        <header className="text-center space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium tracking-wide uppercase" style={{ color: 'var(--secondary-label)' }}>
            <Sparkles className="h-4 w-4 text-blue-400" />
            Branding Hub
          </span>
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight" style={{ color: 'var(--label)' }}>
            Discover, Compare, and Hire India’s Best Creative Partners
          </h1>
          <p className="mx-auto max-w-3xl text-lg" style={{ color: 'var(--secondary-label)' }}>
            A curated marketplace for founders to find ad agencies, branding studios, filmmakers, designers, and creators who understand Indian markets. Every profile is verified, scored, and mapped by budget, expertise, and category.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <Link
              href="/branding/agencies"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-blue-500"
            >
              Browse Agencies
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/branding/agencies?verified=true"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-base font-semibold transition hover:bg-white/10"
              style={{ color: 'var(--label)' }}
            >
              View Verified Partners
              <Star className="h-4 w-4 text-amber-400" />
            </Link>
          </div>
        </header>

        <section className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-2xl font-semibold" style={{ color: 'var(--label)' }}>
                Categories You Can Hire
              </h2>
              <p className="text-sm" style={{ color: 'var(--secondary-label)' }}>
                Each category opens up a curated directory with filters for city, budget, services, and verification status.
              </p>
            </div>
            <Link
              href="/branding/agencies?withFilters=true"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
              style={{ color: 'var(--label)' }}
            >
              Explore full directory
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORY_CARDS.map(category => (
              <Link
                key={category.title}
                href={category.href}
                className="glass group relative overflow-hidden rounded-2xl border border-white/10 p-6 transition hover:border-blue-400/40 hover:shadow-2xl hover:shadow-blue-500/20"
              >
                <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(255,255,255,0))' }} />
                <div className="relative space-y-3">
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--label)' }}>
                    {category.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--secondary-label)' }}>
                    {category.description}
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium" style={{ color: 'var(--system-blue)' }}>
                    View specialists <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="glass relative overflow-hidden rounded-3xl border border-white/10 p-10 md:p-12">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-transparent to-transparent pointer-events-none" />
          <div className="relative grid gap-8 md:grid-cols-2 md:items-center">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold" style={{ color: 'var(--label)' }}>
                How the Branding Hub Works
              </h2>
              <ul className="space-y-3 text-sm leading-relaxed" style={{ color: 'var(--secondary-label)' }}>
                <li>🧭 Tell us your project, budget, and timeline. We match agencies instantly.</li>
                <li>🔍 Every partner is verified through campaigns, portfolios, and founder references.</li>
                <li>📈 Compare pricing packages, services, and case studies side-by-side.</li>
                <li>🤝 Submit a hire brief once and share with shortlisted partners securely.</li>
                <li>📬 Agencies respond inside Documotion with proposals, timelines, and deliverables.</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--label)' }}>
                Need help choosing?
              </h3>
              <p className="text-sm" style={{ color: 'var(--secondary-label)' }}>
                Documotion concierge can shortlist agencies, schedule interviews, and negotiate commercials on your behalf.
              </p>
              <Link
                href="/branding/agencies?withFilters=true"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Start with a tailored short-list
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

