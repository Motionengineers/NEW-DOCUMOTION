import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import AgencyHero from '@/components/agency-profile/AgencyHero';
import AgencyServices from '@/components/agency-profile/AgencyServices';
import AgencyPortfolio from '@/components/agency-profile/AgencyPortfolio';
import AgencyPricing from '@/components/agency-profile/AgencyPricing';
import AgencyReviews from '@/components/agency-profile/AgencyReviews';
import AgencyHireForm from '@/components/agency-profile/AgencyHireForm';
import { getAgencyBySlug } from '@/lib/brandingHub';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const agency = await getAgencyBySlug(params.slug, {
    includeServices: false,
    includePortfolio: false,
    includeReviews: false,
  });
  if (!agency) {
    return {
      title: 'Agency not found • Documotion Branding Hub',
    };
  }

  return {
    title: `${agency.name} • Branding Hub`,
    description:
      agency.description?.slice(0, 150) ??
      `Discover ${agency.name} on Documotion Branding Hub. Explore services, pricing, portfolio, and founder reviews.`,
  };
}

export default async function AgencyProfilePage({ params }) {
  const agency = await getAgencyBySlug(params.slug, {
    includeServices: true,
    includePortfolio: true,
    includeReviews: true,
  });

  if (!agency) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[var(--system-background)]">
      <Navbar />
      <main className="container mx-auto max-w-5xl px-4 py-12 space-y-12">
        <AgencyHero agency={agency} />

        <section className="grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 md:grid-cols-2">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--label)' }}>
              About the Agency
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--secondary-label)' }}>
              {agency.description ??
                'Specialist creative partner available through Documotion. Reach out for a tailored proposal and onboarding call.'}
            </p>
          </div>
          <div className="grid gap-2 text-sm" style={{ color: 'var(--secondary-label)' }}>
            {agency.industries?.length ? (
              <div>
                <p
                  className="text-xs uppercase tracking-wide"
                  style={{ color: 'var(--tertiary-label)' }}
                >
                  Industries
                </p>
                <p>{agency.industries.join(', ')}</p>
              </div>
            ) : null}
            {agency.categories?.length ? (
              <div>
                <p
                  className="text-xs uppercase tracking-wide"
                  style={{ color: 'var(--tertiary-label)' }}
                >
                  Categories
                </p>
                <p>{agency.categories.join(', ')}</p>
              </div>
            ) : null}
            {agency.teamSize ? (
              <div>
                <p
                  className="text-xs uppercase tracking-wide"
                  style={{ color: 'var(--tertiary-label)' }}
                >
                  Team
                </p>
                <p>{agency.teamSize}+ specialists</p>
              </div>
            ) : null}
            {agency.yearsExperience ? (
              <div>
                <p
                  className="text-xs uppercase tracking-wide"
                  style={{ color: 'var(--tertiary-label)' }}
                >
                  Years Active
                </p>
                <p>{agency.yearsExperience}+ years</p>
              </div>
            ) : null}
          </div>
        </section>

        <AgencyServices services={agency.services ?? []} />
        <AgencyPortfolio portfolio={agency.portfolio ?? []} />
        <AgencyPricing
          services={agency.services ?? []}
          minBudget={agency.minBudget}
          maxBudget={agency.maxBudget}
          currency={agency.currency}
        />
        <AgencyReviews reviews={agency.reviews ?? []} rating={agency.rating} />
        <AgencyHireForm agencyId={agency.id} agencySlug={agency.slug} />
      </main>
    </div>
  );
}
