'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Loader2,
  Search,
  UsersRound,
  SlidersHorizontal,
  X,
  LucideCheck,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const DEFAULT_PAGE_SIZE = 36;

const DEFAULT_FILTERS = {
  skills: { logic: 'AND', values: [] },
  experienceYears: { min: 0, max: 20 },
  experienceLevels: [],
  education: [],
  locations: [],
  languages: [],
  availability: [],
  industries: [],
  salary: { min: 0, max: 80 },
  lastActive: { withinDays: null },
  tags: [],
};

function formatLastActive(days) {
  if (days === null || days === undefined) return 'Recently active';
  if (days === 0) return 'Active today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

function TalentCard({ profile }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur transition hover:-translate-y-1">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-white">{profile.fullName || 'Talent profile'}</h2>
        <p className="text-sm text-blue-100/70">{profile.designation || 'Operator'}</p>
        {profile.company ? <p className="text-xs text-blue-100/60">{profile.company}</p> : null}
      </header>

      <div className="mt-3 grid gap-2 text-xs text-blue-100/70 lg:grid-cols-2">
        {profile.location ? <p>📍 {profile.location}</p> : null}
        <p>
          ⭐ {profile.experienceYears} yrs • {profile.experienceLevel}
        </p>
        <p>🕒 {formatLastActive(profile.lastActiveDaysAgo)}</p>
        <p>💼 {profile.availability}</p>
      </div>

      {profile.skillsArray?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {profile.skillsArray.slice(0, 6).map(skill => (
            <span
              key={skill}
              className="rounded-full border border-blue-300/20 bg-blue-300/10 px-3 py-1 text-xs text-blue-100/80"
            >
              {skill}
            </span>
          ))}
        </div>
      ) : null}

      {profile.languages?.length ? (
        <p className="mt-3 text-xs text-blue-100/60">Languages: {profile.languages.join(', ')}</p>
      ) : null}

      {profile.salaryLabel ? (
        <p className="mt-1 text-xs text-blue-100/60">Salary: {profile.salaryLabel}</p>
      ) : null}

      <footer className="mt-4 flex items-center justify-between text-sm">
        {profile.link ? (
          <a
            href={profile.link}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-300 hover:text-blue-200"
          >
            LinkedIn →
          </a>
        ) : (
          <span />
        )}
        {profile.email ? (
          <a href={`mailto:${profile.email}`} className="text-blue-100/70 hover:text-blue-100">
            Email
          </a>
        ) : null}
      </footer>
    </article>
  );
}

function FilterSection({ title, children }) {
  return (
    <section className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-100/60">{title}</h3>
      {children}
    </section>
  );
}

const SORT_OPTIONS = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Experience (high → low)', value: 'experience_desc' },
  { label: 'Experience (low → high)', value: 'experience_asc' },
  { label: 'Recently active', value: 'last_active' },
  { label: 'Top rated', value: 'rating' },
];

const EXPERIENCE_PRESETS = [
  { label: 'Any', value: null },
  { label: 'Junior', value: { min: 0, max: 2, level: 'Junior' } },
  { label: 'Mid', value: { min: 2, max: 5, level: 'Mid' } },
  { label: 'Senior', value: { min: 5, max: 10, level: 'Senior' } },
  { label: 'Executive', value: { min: 10, max: 40, level: 'Executive' } },
];

const LAST_ACTIVE_PRESETS = [
  { label: 'Any time', value: null },
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 60 days', value: 60 },
  { label: 'Last 90 days', value: 90 },
];

function sanitizeFilters(rawFilters) {
  if (!rawFilters) return DEFAULT_FILTERS;
  const merged = {
    ...DEFAULT_FILTERS,
    ...rawFilters,
    skills: {
      logic: rawFilters?.skills?.logic || 'AND',
      values: rawFilters?.skills?.values || [],
    },
    salary: {
      min: rawFilters?.salary?.min ?? DEFAULT_FILTERS.salary.min,
      max: rawFilters?.salary?.max ?? DEFAULT_FILTERS.salary.max,
    },
    experienceYears: {
      min: rawFilters?.experienceYears?.min ?? DEFAULT_FILTERS.experienceYears.min,
      max: rawFilters?.experienceYears?.max ?? DEFAULT_FILTERS.experienceYears.max,
    },
    lastActive: {
      withinDays: rawFilters?.lastActive?.withinDays ?? null,
    },
  };
  return merged;
}

function buildPayloadFilters(filters) {
  const payload = JSON.parse(JSON.stringify(filters));

  if (!payload.skills.values.length) delete payload.skills;
  if (!payload.experienceLevels.length) delete payload.experienceLevels;
  if (!payload.education.length) delete payload.education;
  if (!payload.locations.length) delete payload.locations;
  if (!payload.languages.length) delete payload.languages;
  if (!payload.availability.length) delete payload.availability;
  if (!payload.industries.length) delete payload.industries;
  if (!payload.tags.length) delete payload.tags;

  if (
    (!payload.salary && !DEFAULT_FILTERS.salary) ||
    (payload.salary?.min === 0 && payload.salary?.max === DEFAULT_FILTERS.salary.max)
  ) {
    delete payload.salary;
  }

  if (payload.lastActive?.withinDays === null) delete payload.lastActive;

  return payload;
}

export default function TalentGrid({
  initialProfiles,
  total,
  pageSize = DEFAULT_PAGE_SIZE,
  initialQuery = '',
  initialFacets = {},
  initialFilters = DEFAULT_FILTERS,
  initialSort = 'relevance',
}) {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [facets, setFacets] = useState(initialFacets);
  const [filters, setFilters] = useState(() => sanitizeFilters(initialFilters));
  const [sort, setSort] = useState(initialSort || 'relevance');
  const [query, setQuery] = useState(initialQuery || '');
  const [searchInput, setSearchInput] = useState(initialQuery || '');
  const [suggestions, setSuggestions] = useState({ names: [], designations: [], skills: [] });
  const [totalMatches, setTotalMatches] = useState(total);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialProfiles.length < total);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [skillInput, setSkillInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initialisedRef = useRef(false);

  const activeChips = useMemo(() => {
    const chips = [];
    if (query) {
      chips.push({ key: 'query', label: `Keyword: ${query}`, onRemove: () => setQuery('') });
    }
    filters.skills.values.forEach(skill => {
      chips.push({
        key: `skill-${skill}`,
        label: `Skill: ${skill}`,
        onRemove: () =>
          setFilters(prev => ({
            ...prev,
            skills: { ...prev.skills, values: prev.skills.values.filter(item => item !== skill) },
          })),
      });
    });
    filters.locations.forEach(loc => {
      chips.push({
        key: `location-${loc}`,
        label: `Location: ${loc}`,
        onRemove: () =>
          setFilters(prev => ({ ...prev, locations: prev.locations.filter(item => item !== loc) })),
      });
    });
    filters.industries.forEach(industry => {
      chips.push({
        key: `industry-${industry}`,
        label: `Industry: ${industry}`,
        onRemove: () =>
          setFilters(prev => ({
            ...prev,
            industries: prev.industries.filter(item => item !== industry),
          })),
      });
    });
    filters.tags.forEach(tag => {
      chips.push({
        key: `tag-${tag}`,
        label: tag,
        onRemove: () =>
          setFilters(prev => ({ ...prev, tags: prev.tags.filter(item => item !== tag) })),
      });
    });
    if (filters.experienceLevels.length) {
      chips.push({
        key: 'experienceLevel',
        label: `Experience: ${filters.experienceLevels.join(', ')}`,
        onRemove: () => setFilters(prev => ({ ...prev, experienceLevels: [] })),
      });
    }
    if (filters.languages.length) {
      chips.push({
        key: 'languages',
        label: `Languages: ${filters.languages.join(', ')}`,
        onRemove: () => setFilters(prev => ({ ...prev, languages: [] })),
      });
    }
    if (filters.availability.length) {
      chips.push({
        key: 'availability',
        label: `Availability: ${filters.availability.join(', ')}`,
        onRemove: () => setFilters(prev => ({ ...prev, availability: [] })),
      });
    }
    if (filters.education.length) {
      chips.push({
        key: 'education',
        label: `Education: ${filters.education.join(', ')}`,
        onRemove: () => setFilters(prev => ({ ...prev, education: [] })),
      });
    }
    if (filters.lastActive.withinDays !== null) {
      chips.push({
        key: 'lastActive',
        label: `Active within ${filters.lastActive.withinDays} days`,
        onRemove: () => setFilters(prev => ({ ...prev, lastActive: { withinDays: null } })),
      });
    }
    if (filters.salary.min > 0 || filters.salary.max < DEFAULT_FILTERS.salary.max) {
      chips.push({
        key: 'salary',
        label: `Salary: ₹${filters.salary.min}L–₹${filters.salary.max}L`,
        onRemove: () => setFilters(prev => ({ ...prev, salary: { ...DEFAULT_FILTERS.salary } })),
      });
    }
    return chips;
  }, [filters, query]);

  const fetchSearch = useCallback(
    async (nextPage = 1, override = {}) => {
      setLoading(true);
      setError(null);
      try {
        const payload = {
          page: nextPage,
          limit: pageSize,
          query: override.query ?? query,
          filters: buildPayloadFilters(override.filters ?? filters),
          sort: override.sort ?? sort,
        };

        const res = await fetch('/api/talent/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
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
        setFacets(data.facets ?? {});

        if (data.page === 1) {
          setProfiles(data.profiles);
        } else {
          setProfiles(prev => [...prev, ...data.profiles]);
        }
      } catch (err) {
        console.error('Talent search failed:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [filters, query, sort, pageSize]
  );

  const handleSearchSubmit = async event => {
    event.preventDefault();
    const trimmed = searchInput.trim();
    setQuery(trimmed);
    await fetchSearch(1, { query: trimmed });
  };

  const handleLoadMore = async () => {
    if (loading || !hasMore) return;
    await fetchSearch(page + 1);
  };

  const handleClearAll = () => {
    setFilters(sanitizeFilters(DEFAULT_FILTERS));
    setQuery('');
    setSearchInput('');
  };

  useEffect(() => {
    if (!initialisedRef.current) {
      initialisedRef.current = true;
      return;
    }
    fetchSearch(1);
  }, [filters, sort, fetchSearch]);

  useEffect(() => {
    if (!initialisedRef.current) return;
    const handler = setTimeout(() => {
      const trimmed = searchInput.trim();
      if (trimmed !== query) {
        setQuery(trimmed);
        fetchSearch(1, { query: trimmed });
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed.length < 2) {
      setSuggestions({ names: [], designations: [], skills: [] });
      return undefined;
    }
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/talent/suggest?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.success) {
          setSuggestions({
            names: data.names || [],
            designations: data.designations || [],
            skills: data.skills || [],
          });
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.warn('suggest failed', error);
        }
      }
    }, 300);
    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [searchInput]);

  const resultsLabel = useMemo(() => {
    if (query) {
      return `Showing ${profiles.length} of ${totalMatches} results for "${query}"`;
    }
    return `Showing ${profiles.length} of ${totalMatches} profiles`;
  }, [profiles.length, totalMatches, query]);

  const appliedFiltersCount = activeChips.length;

  const renderFacetCheckboxes = (key, labelFormatter = value => value) => {
    const facetItems = facets?.[key] || [];
    if (!facetItems.length) return null;

    const selected = new Set(filters[key]);

    return (
      <div className="space-y-2">
        {facetItems.map(item => (
          <label
            key={item.value}
            className="flex cursor-pointer items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-blue-100/80 transition hover:bg-white/10"
          >
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-3.5 w-3.5 rounded border-white/20 bg-transparent text-blue-400 focus:ring-blue-500/40"
                checked={selected.has(item.value)}
                onChange={() => {
                  setFilters(prev => {
                    const next = new Set(prev[key]);
                    if (next.has(item.value)) {
                      next.delete(item.value);
                    } else {
                      next.add(item.value);
                    }
                    return { ...prev, [key]: Array.from(next) };
                  });
                }}
              />
              <span>{labelFormatter(item.value)}</span>
            </div>
            <span className="text-[10px] text-blue-100/50">
              {item.matched}/{item.total}
            </span>
          </label>
        ))}
      </div>
    );
  };

  const addSkill = () => {
    const value = skillInput.trim();
    if (!value) return;
    if (filters.skills.values.includes(value)) return;
    setFilters(prev => ({
      ...prev,
      skills: { ...prev.skills, values: [...prev.skills.values, value] },
    }));
    setSkillInput('');
  };

  const addLocation = () => {
    const value = locationInput.trim();
    if (!value || filters.locations.includes(value)) return;
    setFilters(prev => ({ ...prev, locations: [...prev.locations, value] }));
    setLocationInput('');
  };

  const addTag = () => {
    const value = tagInput.trim();
    if (!value || filters.tags.includes(value)) return;
    setFilters(prev => ({ ...prev, tags: [...prev.tags, value] }));
    setTagInput('');
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <aside
        className={cn(
          'space-y-4 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur lg:sticky lg:top-24 lg:h-fit',
          sidebarOpen ? 'block' : 'hidden lg:block'
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white">Filters</span>
          <button
            type="button"
            className="text-xs text-blue-100/70 hover:text-blue-100"
            onClick={handleClearAll}
          >
            Reset filters
          </button>
        </div>

        <FilterSection title="Skills">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={event => setSkillInput(event.target.value)}
              placeholder="Add skill"
              className="w-full rounded-xl border border-white/10 bg-transparent px-3 py-2 text-xs text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
            />
            <button
              type="button"
              onClick={addSkill}
              className="rounded-xl border border-blue-400/50 bg-blue-400/20 p-2 text-blue-100 hover:border-blue-300/70 hover:bg-blue-400/30"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.skills.values.map(skill => (
              <button
                key={skill}
                type="button"
                onClick={() =>
                  setFilters(prev => ({
                    ...prev,
                    skills: {
                      ...prev.skills,
                      values: prev.skills.values.filter(item => item !== skill),
                    },
                  }))
                }
                className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] text-blue-100 hover:bg-white/15"
              >
                {skill} <X className="h-3 w-3" />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-blue-100/70">
            <span>Logic</span>
            <div className="flex gap-1 rounded-full border border-white/10 bg-white/10 p-1">
              {['AND', 'OR'].map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() =>
                    setFilters(prev => ({ ...prev, skills: { ...prev.skills, logic: mode } }))
                  }
                  className={cn(
                    'rounded-full px-3 py-1',
                    filters.skills.logic === mode ? 'bg-blue-400/30 text-white' : 'text-blue-100/60'
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </FilterSection>

        <FilterSection title="Experience">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <label className="flex flex-col gap-1">
              <span className="text-blue-100/60">Min years</span>
              <input
                type="number"
                min={0}
                max={filters.experienceYears.max}
                value={filters.experienceYears.min}
                onChange={event =>
                  setFilters(prev => ({
                    ...prev,
                    experienceYears: {
                      ...prev.experienceYears,
                      min: Number.parseInt(event.target.value, 10) || 0,
                    },
                  }))
                }
                className="rounded-xl border border-white/10 bg-transparent px-3 py-2 text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-blue-100/60">Max years</span>
              <input
                type="number"
                min={filters.experienceYears.min}
                max={40}
                value={filters.experienceYears.max}
                onChange={event =>
                  setFilters(prev => ({
                    ...prev,
                    experienceYears: {
                      ...prev.experienceYears,
                      max: Number.parseInt(event.target.value, 10) || prev.experienceYears.max,
                    },
                  }))
                }
                className="rounded-xl border border-white/10 bg-transparent px-3 py-2 text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {EXPERIENCE_PRESETS.map(preset => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  if (!preset.value) {
                    setFilters(prev => ({
                      ...prev,
                      experienceYears: { ...DEFAULT_FILTERS.experienceYears },
                      experienceLevels: [],
                    }));
                  } else {
                    setFilters(prev => ({
                      ...prev,
                      experienceYears: { min: preset.value.min, max: preset.value.max },
                      experienceLevels: [preset.value.level],
                    }));
                  }
                }}
                className={cn(
                  'rounded-full border px-3 py-1 text-[10px]',
                  preset.value && filters.experienceLevels.includes(preset.value.level)
                    ? 'border-blue-400 bg-blue-400/30 text-white'
                    : 'border-white/15 bg-white/10 text-blue-100/60 hover:bg-white/15'
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Locations">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={locationInput}
              onChange={event => setLocationInput(event.target.value)}
              placeholder="Add city or country"
              className="w-full rounded-xl border border-white/10 bg-transparent px-3 py-2 text-xs text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
            />
            <button
              type="button"
              onClick={addLocation}
              className="rounded-xl border border-blue-400/50 bg-blue-400/20 p-2 text-blue-100 hover:border-blue-300/70 hover:bg-blue-400/30"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.locations.map(loc => (
              <button
                key={loc}
                type="button"
                onClick={() =>
                  setFilters(prev => ({
                    ...prev,
                    locations: prev.locations.filter(item => item !== loc),
                  }))
                }
                className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] text-blue-100 hover:bg-white/15"
              >
                {loc} <X className="h-3 w-3" />
              </button>
            ))}
          </div>
          {renderFacetCheckboxes('locations')}
        </FilterSection>

        <FilterSection title="Availability">{renderFacetCheckboxes('availability')}</FilterSection>

        <FilterSection title="Industries">{renderFacetCheckboxes('industries')}</FilterSection>

        <FilterSection title="Languages">{renderFacetCheckboxes('languages')}</FilterSection>

        <FilterSection title="Education">{renderFacetCheckboxes('education')}</FilterSection>

        <FilterSection title="Tags">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={event => setTagInput(event.target.value)}
              placeholder="Add tag (e.g. Open to relocation)"
              className="w-full rounded-xl border border-white/10 bg-transparent px-3 py-2 text-xs text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
            />
            <button
              type="button"
              onClick={addTag}
              className="rounded-xl border border-blue-400/50 bg-blue-400/20 p-2 text-blue-100 hover:border-blue-300/70 hover:bg-blue-400/30"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.tags.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() =>
                  setFilters(prev => ({ ...prev, tags: prev.tags.filter(item => item !== tag) }))
                }
                className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] text-blue-100 hover:bg-white/15"
              >
                {tag} <X className="h-3 w-3" />
              </button>
            ))}
          </div>
          {renderFacetCheckboxes('tags')}
        </FilterSection>

        <FilterSection title="Salary (₹L p.a.)">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <label className="flex flex-col gap-1">
              <span className="text-blue-100/60">Min</span>
              <input
                type="number"
                min={0}
                max={filters.salary.max}
                value={filters.salary.min}
                onChange={event =>
                  setFilters(prev => ({
                    ...prev,
                    salary: { ...prev.salary, min: Number.parseInt(event.target.value, 10) || 0 },
                  }))
                }
                className="rounded-xl border border-white/10 bg-transparent px-3 py-2 text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-blue-100/60">Max</span>
              <input
                type="number"
                min={filters.salary.min}
                value={filters.salary.max}
                onChange={event =>
                  setFilters(prev => ({
                    ...prev,
                    salary: {
                      ...prev.salary,
                      max: Number.parseInt(event.target.value, 10) || prev.salary.max,
                    },
                  }))
                }
                className="rounded-xl border border-white/10 bg-transparent px-3 py-2 text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
              />
            </label>
          </div>
        </FilterSection>

        <FilterSection title="Last active">
          <select
            value={filters.lastActive.withinDays ?? ''}
            onChange={event =>
              setFilters(prev => ({
                ...prev,
                lastActive: {
                  withinDays: event.target.value ? Number.parseInt(event.target.value, 10) : null,
                },
              }))
            }
            className="w-full rounded-xl border border-white/10 bg-transparent px-3 py-2 text-xs text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
          >
            {LAST_ACTIVE_PRESETS.map(option => (
              <option
                key={option.label}
                value={option.value ?? ''}
                className="bg-slate-900 text-xs text-white"
              >
                {option.label}
              </option>
            ))}
          </select>
        </FilterSection>
      </aside>

      <section className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur">
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
          >
            <div className="flex items-center gap-2 text-sm text-blue-100/70">
              <UsersRound className="h-5 w-5 text-blue-300" />
              <span>{resultsLabel}</span>
              <button
                type="button"
                className="flex items-center gap-2 text-xs text-blue-200 md:hidden"
                onClick={() => setSidebarOpen(prev => !prev)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters ({appliedFiltersCount})
              </button>
            </div>
            <div className="flex w-full items-center gap-2 md:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-300" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={event => setSearchInput(event.target.value)}
                  placeholder="Search name, role, company, location…"
                  className="w-full rounded-xl border border-white/10 bg-transparent py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/40"
                />
                {suggestions.names.length ||
                suggestions.designations.length ||
                suggestions.skills.length ? (
                  <div className="absolute top-[110%] z-10 w-full space-y-2 rounded-xl border border-white/10 bg-slate-900/95 p-3 shadow-xl">
                    {suggestions.names.slice(0, 4).map(name => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setSearchInput(name)}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left text-xs text-blue-100 hover:bg-white/10"
                      >
                        <LucideCheck className="h-3 w-3 text-blue-300" />
                        {name}
                      </button>
                    ))}
                    {suggestions.designations.slice(0, 3).map(designation => (
                      <button
                        key={designation}
                        type="button"
                        onClick={() => setSearchInput(designation)}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left text-xs text-blue-100/70 hover:bg-white/10"
                      >
                        <LucideCheck className="h-3 w-3 text-blue-300" />
                        {designation}
                      </button>
                    ))}
                    {suggestions.skills.slice(0, 6).map(skill => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => {
                          setSkillInput(skill);
                          addSkill();
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left text-xs text-blue-100/60 hover:bg-white/10"
                      >
                        <LucideCheck className="h-3 w-3 text-blue-300" />
                        Add skill “{skill}”
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <select
                value={sort}
                onChange={event => setSort(event.target.value)}
                className="rounded-xl border border-white/10 bg-transparent px-3 py-2 text-xs text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
              >
                {SORT_OPTIONS.map(option => (
                  <option
                    key={option.value}
                    value={option.value}
                    className="bg-slate-900 text-xs text-white"
                  >
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
                disabled={loading && page === 1}
              >
                {loading && page === 1 ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Searching…
                  </span>
                ) : (
                  'Search'
                )}
              </button>
            </div>
          </form>

          {activeChips.length ? (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              {activeChips.map(chip => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.onRemove}
                  className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-blue-100 hover:bg-white/15"
                >
                  {chip.label}
                  <X className="h-3 w-3" />
                </button>
              ))}
              <span className="text-[10px] text-blue-100/60">
                Clear filters to broaden results.
              </span>
            </div>
          ) : null}
        </div>

        {error ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {profiles.map(profile => (
            <TalentCard key={profile.id} profile={profile} />
          ))}
        </div>

        {hasMore ? (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading…
                </>
              ) : (
                'Load more'
              )}
            </button>
          </div>
        ) : (
          <p className="text-center text-xs text-blue-100/60">
            You’ve reached the end of the list.
          </p>
        )}

        <button
          type="button"
          className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full border border-blue-400/40 bg-blue-500/20 px-4 py-2 text-xs font-semibold text-blue-100 shadow-lg backdrop-blur transition hover:bg-blue-500/30 lg:hidden"
          onClick={() => setSidebarOpen(prev => !prev)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters ({appliedFiltersCount}){sidebarOpen ? <X className="h-3.5 w-3.5" /> : null}
        </button>

        <button
          type="button"
          className="fixed bottom-6 left-6 flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs text-blue-100/70 shadow-lg backdrop-blur transition hover:bg-white/15 lg:hidden"
          onClick={async () => {
            setFilters(sanitizeFilters(DEFAULT_FILTERS));
            setQuery('');
            setSearchInput('');
            await fetchSearch(1, { filters: DEFAULT_FILTERS, query: '' });
          }}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Reset
        </button>
      </section>
    </div>
  );
}
