import Navbar from '@/components/Navbar';
import AgencyDirectory from '@/components/AgencyDirectory';
import { listAgencies, listAgencyFilters } from '@/lib/brandingHub';

export const dynamic = 'force-dynamic';

function parseNumber(value, fallback) {
  if (value === null || value === undefined || value === '') return fallback;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function toArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return [value].filter(Boolean);
}

export default async function AgenciesDirectoryPage({ searchParams }) {
  const page = Math.max(parseNumber(searchParams.page, 1), 1);
  const limit = Math.min(Math.max(parseNumber(searchParams.limit, 12), 6), 36);
  const skip = (page - 1) * limit;

  const filters = {
    city: toArray(searchParams.city),
    state: toArray(searchParams.state),
    services: toArray(searchParams.service),
    categories: toArray(searchParams.category),
    teamSizeBands: toArray(searchParams.teamSize),
    minBudget: searchParams.minBudget ? Number(searchParams.minBudget) : undefined,
    maxBudget: searchParams.maxBudget ? Number(searchParams.maxBudget) : undefined,
    minRating: searchParams.minRating ? Number(searchParams.minRating) : undefined,
    verified: searchParams.verified === 'true' ? true : undefined,
  };

  const [{ agencies, total }, filterOptions] = await Promise.all([
    listAgencies({
      take: limit,
      skip,
      filters,
      includeServices: false,
      includePortfolio: false,
    }),
    listAgencyFilters(),
  ]);

  const totalPages = Math.max(Math.ceil(total / limit), 1);
  const pagination = {
    page,
    limit,
    total,
    totalPages,
    hasMore: page < totalPages,
  };

  return (
    <div className="min-h-screen bg-[var(--system-background)]">
      <Navbar />
      <main className="container mx-auto max-w-6xl px-4 py-12 space-y-10">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold" style={{ color: 'var(--label)' }}>
            Ad Agency & Branding Directory
          </h1>
          <p className="text-base" style={{ color: 'var(--secondary-label)' }}>
            Filter verified partners by city, services, budget, rating, and team size. Click into a
            profile to explore services, pricing, case studies, and client reviews.
          </p>
        </header>

        <AgencyDirectory
          initialAgencies={agencies}
          initialFilters={filters}
          initialPagination={pagination}
          filterOptions={filterOptions}
        />
      </main>
    </div>
  );
}
