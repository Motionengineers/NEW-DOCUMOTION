import Navbar from '@/components/Navbar';
import TalentGrid from '@/components/TalentGrid';
import { loadTalentProfilesSlice } from '@/lib/dataSources';

export const metadata = {
  title: 'Talent Network • Documotion',
  description:
    'Discover founders, operators, and advisors available through Documotion’s curated network.',
};

export default async function TalentPage() {
  const PAGE_SIZE = 36;
  const {
    profiles: initialProfiles,
    total,
    facets,
    query,
    filters,
    sort,
  } = await loadTalentProfilesSlice({
    page: 1,
    limit: PAGE_SIZE,
    includeFacets: true,
    sort: 'relevance',
  });

  return (
    <div className="min-h-screen bg-[var(--system-background)]">
      <Navbar />
      <main className="container mx-auto max-w-6xl px-4 py-10 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold" style={{ color: 'var(--label)' }}>
            Talent Network
          </h1>
          <p className="text-base" style={{ color: 'var(--secondary-label)' }}>
            Filter warm intros to founders, growth leaders, and specialists aligned to Indian
            startup needs. The concierge team can share full profiles and availability on request.
          </p>
        </header>

        <TalentGrid
          initialProfiles={initialProfiles}
          total={total}
          pageSize={PAGE_SIZE}
          initialFacets={facets}
          initialFilters={filters}
          initialSort={sort}
          initialQuery={query}
        />
      </main>
    </div>
  );
}
