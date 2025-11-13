'use client';

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import AgencyCard from '@/components/AgencyCard';
import AgencyFilters from '@/components/AgencyFilters';
import { Loader2 } from 'lucide-react';

const DEFAULT_LIMIT = 12;

function normaliseFilters(filters = {}) {
  return {
    city: filters.city ?? [],
    state: filters.state ?? [],
    services: filters.services ?? [],
    categories: filters.categories ?? [],
    minBudget: filters.minBudget ?? undefined,
    maxBudget: filters.maxBudget ?? undefined,
    minRating: filters.minRating ?? undefined,
    verified: filters.verified ?? undefined,
    teamSizeBands: filters.teamSizeBands ?? [],
  };
}

function toUrlSearch(filters) {
  const params = new URLSearchParams();
  if (filters.city?.length) {
    filters.city.forEach(value => params.append('city', value));
  }
  if (filters.state?.length) {
    filters.state.forEach(value => params.append('state', value));
  }
  if (filters.services?.length) {
    filters.services.forEach(value => params.append('service', value));
  }
  if (filters.categories?.length) {
    filters.categories.forEach(value => params.append('category', value));
  }
  if (filters.teamSizeBands?.length) {
    filters.teamSizeBands.forEach(value => params.append('teamSize', value));
  }
  if (filters.minBudget !== undefined) {
    params.set('minBudget', String(filters.minBudget));
  }
  if (filters.maxBudget !== undefined) {
    params.set('maxBudget', String(filters.maxBudget));
  }
  if (filters.minRating !== undefined) {
    params.set('minRating', String(filters.minRating));
  }
  if (filters.verified) {
    params.set('verified', 'true');
  }
  params.set('limit', String(DEFAULT_LIMIT));
  params.set('includeServices', 'false');
  return params;
}

export default function AgencyDirectory({
  initialAgencies,
  initialFilters,
  initialPagination,
  filterOptions,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState(() => normaliseFilters(initialFilters));
  const [agencies, setAgencies] = useState(initialAgencies ?? []);
  const [pagination, setPagination] = useState(
    initialPagination ?? { page: 1, total: initialAgencies?.length ?? 0, hasMore: false }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  const pending = loading || isPending;

  const syncUrl = useCallback(
    nextFilters => {
      const params = toUrlSearch(nextFilters);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router]
  );

  const fetchAgencies = useCallback(async (nextFilters, nextPage = 1, append = false) => {
    setLoading(true);
    setError(null);
    try {
      const params = toUrlSearch(nextFilters);
      params.set('page', String(nextPage));
      const res = await fetch(`/api/branding/agencies?${params.toString()}`, { cache: 'no-store' });
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
      const payload = await res.json();
      if (!payload.success) {
        throw new Error(payload.error || 'Unknown error');
      }
      setPagination(payload.pagination);
      if (append) {
        setAgencies(previous => [...previous, ...(payload.data ?? [])]);
      } else {
        setAgencies(payload.data ?? []);
      }
    } catch (err) {
      console.error('Agency directory fetch failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const urlFilters = normaliseFilters({
      city: searchParams.getAll('city'),
      state: searchParams.getAll('state'),
      services: searchParams.getAll('service'),
      categories: searchParams.getAll('category'),
      teamSizeBands: searchParams.getAll('teamSize'),
      minBudget: searchParams.get('minBudget') ? Number(searchParams.get('minBudget')) : undefined,
      maxBudget: searchParams.get('maxBudget') ? Number(searchParams.get('maxBudget')) : undefined,
      minRating: searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined,
      verified: searchParams.has('verified') ? searchParams.get('verified') === 'true' : undefined,
    });
    setFilters(urlFilters);
  }, [searchParams]);

  const handleFiltersChange = nextFilters => {
    const normalised = normaliseFilters(nextFilters);
    setFilters(normalised);
    startTransition(() => {
      syncUrl(normalised);
      fetchAgencies(normalised, 1, false);
    });
  };

  const handleReset = () => {
    const resetFilters = normaliseFilters({});
    setFilters(resetFilters);
    startTransition(() => {
      syncUrl(resetFilters);
      fetchAgencies(resetFilters, 1, false);
    });
  };

  const handleLoadMore = () => {
    if (!pagination?.hasMore || pending) return;
    const nextPage = (pagination?.page ?? 1) + 1;
    fetchAgencies(filters, nextPage, true);
  };

  const summary = useMemo(() => {
    const parts = [];
    if (filters.city?.length) parts.push(filters.city.join(', '));
    if (filters.services?.length) parts.push(`${filters.services.length} services`);
    if (filters.categories?.length) parts.push(`${filters.categories.length} categories`);
    if (filters.minRating) parts.push(`Rating ${filters.minRating}+`);
    if (filters.verified) parts.push('Verified only');
    return parts.length ? parts.join(' • ') : 'Showing curated agencies across India';
  }, [filters]);

  return (
    <div className="space-y-8">
      <AgencyFilters
        filters={filters}
        options={filterOptions}
        onChange={handleFiltersChange}
        onReset={handleReset}
      />

      <div
        className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm"
        style={{ color: 'var(--secondary-label)' }}
      >
        {pending ? 'Updating results…' : summary}
        {pagination?.total ? (
          <span className="ml-2 text-xs" style={{ color: 'var(--tertiary-label)' }}>
            {pagination.total} agencies matched
          </span>
        ) : null}
      </div>

      {error ? (
        <div
          className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-6 text-sm"
          style={{ color: 'var(--label)' }}
        >
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {agencies.map(agency => (
          <AgencyCard key={agency.slug ?? agency.id} agency={agency} />
        ))}
      </div>

      {pending && agencies.length === 0 ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
        </div>
      ) : null}

      {pagination?.hasMore ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold transition hover:bg-white/10"
            style={{ color: 'var(--label)' }}
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Loading
              </>
            ) : (
              'Load more agencies'
            )}
          </button>
        </div>
      ) : null}

      {!pending && agencies.length === 0 && !error ? (
        <div
          className="rounded-2xl border border-white/10 bg-white/5 px-6 py-12 text-center text-sm"
          style={{ color: 'var(--secondary-label)' }}
        >
          No agencies match your filters yet. Try adjusting filters or contact the concierge for a
          short-list.
        </div>
      ) : null}
    </div>
  );
}
