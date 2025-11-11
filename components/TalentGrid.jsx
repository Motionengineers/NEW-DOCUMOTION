'use client';

import { useCallback, useMemo, useState } from 'react';
import { Loader2, Search, UsersRound } from 'lucide-react';
import { cn } from '@/lib/utils';

const DEFAULT_PAGE_SIZE = 36;

function TalentCard({ profile }) {
  return (
    <article className="glass rounded-2xl p-6 border border-white/10 space-y-3 hover:translate-y-[-4px] transition-transform">
      <header>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--label)' }}>
          {profile.fullName || 'Talent profile'}
        </h2>
        <p className="text-sm" style={{ color: 'var(--secondary-label)' }}>
          {profile.designation || 'Operator'}
        </p>
      </header>

      {profile.company && (
        <p className="text-sm" style={{ color: 'var(--secondary-label)' }}>
          {profile.company}
        </p>
      )}

      {profile.location && (
        <p className="text-sm" style={{ color: 'var(--secondary-label)' }}>
          📍 {profile.location}
        </p>
      )}

      {profile.skills && (
        <div className="flex flex-wrap gap-2 pt-2">
          {profile.skills
            .split(',')
            .slice(0, 6)
            .map(skill => (
              <span key={skill} className="px-3 py-1 text-xs rounded-full bg-white/10" style={{ color: 'var(--secondary-label)' }}>
                {skill.trim()}
              </span>
            ))}
        </div>
      )}

      <footer className="flex items-center justify-between pt-4">
        {profile.link && (
          <a
            href={profile.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium hover:underline"
            style={{ color: 'var(--system-blue)' }}
          >
            LinkedIn →
          </a>
        )}
        {profile.email && (
          <a
            href={`mailto:${profile.email}`}
            className="text-sm hover:underline"
            style={{ color: 'var(--secondary-label)' }}
          >
            Email
          </a>
        )}
      </footer>
    </article>
  );
}

export default function TalentGrid({ initialProfiles, total, pageSize = DEFAULT_PAGE_SIZE, initialQuery = '' }) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState(initialQuery);
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [totalMatches, setTotalMatches] = useState(total);
  const [hasMore, setHasMore] = useState(initialProfiles.length < total);
  const [error, setError] = useState(null);

  const fetchPage = useCallback(
    async (nextPage, nextQuery) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: String(nextPage),
          limit: String(pageSize),
        });
        if (nextQuery) {
          params.set('q', nextQuery);
        }
        const res = await fetch(`/api/talent?${params.toString()}`, { cache: 'no-store' });
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || 'Unknown error');
        }

        setPage(data.page);
        setTotalMatches(data.total);
        setHasMore(data.hasMore);

        if (data.page === 1) {
          setProfiles(data.profiles);
        } else {
          setProfiles(prev => [...prev, ...data.profiles]);
        }
      } catch (err) {
        console.error('Talent fetch failed:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  const handleSearch = async event => {
    event.preventDefault();
    const nextQuery = searchInput.trim();
    setQuery(nextQuery);
    await fetchPage(1, nextQuery);
  };

  const handleLoadMore = async () => {
    if (loading || !hasMore) return;
    await fetchPage(page + 1, query);
  };

  const resultsLabel = useMemo(() => {
    if (query) {
      return `Showing ${profiles.length} of ${totalMatches} results for "${query}"`;
    }
    return `Showing ${profiles.length} of ${totalMatches} profiles`;
  }, [profiles.length, totalMatches, query]);

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSearch}
        className="glass flex flex-col gap-3 md:flex-row md:items-center md:justify-between rounded-2xl border border-white/10 p-4"
      >
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--secondary-label)' }}>
          <UsersRound className="h-5 w-5 text-blue-400" />
          <span>{resultsLabel}</span>
        </div>
        <div className="flex w-full items-center gap-2 md:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-300" />
            <input
              type="text"
              value={searchInput}
              onChange={event => setSearchInput(event.target.value)}
              placeholder="Search name, role, company, location..."
              className={cn(
                'w-full rounded-xl border bg-transparent py-2 pl-9 pr-3 text-sm outline-none transition border-white/10',
                'focus:border-blue-400 focus:ring-2 focus:ring-blue-400/40'
              )}
              style={{ color: 'var(--label)' }}
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
            disabled={loading}
          >
            {loading && page === 1 ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Searching...
              </span>
            ) : (
              'Search'
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm" style={{ color: 'var(--label)' }}>
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {profiles.map(profile => {
          const identifier = profile.email || profile.link || `${profile.fullName}-${profile.designation}`;
          return (
            <TalentCard
              key={identifier}
              profile={profile}
            />
          );
        })}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold transition hover:bg-white/5"
            style={{ color: 'var(--label)' }}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load more'
            )}
          </button>
        </div>
      )}

      {!hasMore && profiles.length > 0 && (
        <p className="text-center text-sm" style={{ color: 'var(--tertiary-label)' }}>
          You have reached the end of the list.
        </p>
      )}
    </div>
  );
}

