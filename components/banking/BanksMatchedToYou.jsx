'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bookmark, BookmarkCheck, Filter, Loader2, Send, Sparkles } from 'lucide-react';

const STAGE_OPTIONS = ['idea', 'pre-seed', 'seed', 'series a', 'growth'];
const SERVICE_OPTIONS = [
  { value: 'loan', label: 'Loans & Credit' },
  { value: 'current-account', label: 'Current Account' },
  { value: 'api', label: 'Banking APIs' },
  { value: 'payroll', label: 'Payroll' },
  { value: 'automation', label: 'Automation & Payouts' },
  { value: 'treasury', label: 'Treasury & Forex' },
  { value: 'credit-card', label: 'Corporate Cards' },
];
const SPECIAL_CRITERIA_OPTIONS = [
  { value: 'government-backed', label: 'Government-backed' },
  { value: 'women-founder', label: 'Women founder' },
  { value: 'minority-owned', label: 'Minority-owned' },
  { value: 'export-focused', label: 'Export focused' },
];
const BANK_TYPE_OPTIONS = [
  { value: 'public', label: 'Public Sector' },
  { value: 'private', label: 'Private Bank' },
  { value: 'fintech', label: 'Fintech / Neobank' },
];
const PROGRAM_TYPE_FILTERS = [
  { value: '', label: 'All programs' },
  { value: 'loan', label: 'Loans' },
  { value: 'current-account', label: 'Accounts' },
  { value: 'api', label: 'APIs & Automation' },
  { value: 'credit-line', label: 'Credit lines' },
];
const BANK_TYPE_FILTERS = [
  { value: '', label: 'All bank types' },
  { value: 'public', label: 'Public sector' },
  { value: 'private', label: 'Private bank' },
  { value: 'fintech', label: 'Fintech' },
];

const DEFAULT_PROFILE = {
  stage: 'seed',
  sector: '',
  revenue: '',
  revenueBand: '',
  location: '',
  servicesNeeded: ['loan'],
  specialCriteria: [],
  preferredBankTypes: [],
  preferredLoanMin: '',
  preferredLoanMax: '',
};

function parseNumber(value) {
  if (value === '' || value === null || value === undefined) return null;
  const next = Number(value);
  return Number.isFinite(next) ? next : null;
}

function normaliseForApi(profile) {
  return {
    stage: profile.stage || null,
    sector: profile.sector || null,
    revenue: parseNumber(profile.revenue),
    revenueBand: profile.revenueBand || null,
    location: profile.location || null,
    servicesNeeded: profile.servicesNeeded,
    specialCriteria: profile.specialCriteria,
    preferredBankTypes: profile.preferredBankTypes,
    preferredLoanMin: parseNumber(profile.preferredLoanMin),
    preferredLoanMax: parseNumber(profile.preferredLoanMax),
  };
}

function normaliseResponseProfile(data) {
  if (!data) return DEFAULT_PROFILE;
  return {
    stage: data.stage || DEFAULT_PROFILE.stage,
    sector: data.sector || '',
    revenue: data.revenue ?? '',
    revenueBand: data.revenueBand || '',
    location: data.location || '',
    servicesNeeded: data.servicesNeeded?.length ? data.servicesNeeded : [],
    specialCriteria: data.specialCriteria?.length ? data.specialCriteria : [],
    preferredBankTypes: data.preferredBankTypes?.length ? data.preferredBankTypes : [],
    preferredLoanMin: data.preferredLoanMin ?? '',
    preferredLoanMax: data.preferredLoanMax ?? '',
  };
}

function formatLoanRange(min, max) {
  if (min == null && max == null) return 'Custom';
  const fmt = value => (value == null ? 'N/A' : `${value}L`);
  return `${fmt(min)} – ${fmt(max)}`;
}

function ProgramCard({ program, isRecommended, isFavourite, onToggleFav }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur transition hover:-translate-y-1">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-blue-100/60">
            {program.bankType?.toUpperCase() || 'BANK'}
          </p>
          <h3 className="text-xl font-semibold text-white">{program.bankName}</h3>
          <p className="text-sm text-blue-100/70">{program.programName}</p>
        </div>
        <div className="flex items-center gap-2">
          {isRecommended ? (
            <span className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-3 py-1 text-xs font-semibold text-white">
              Recommended
            </span>
          ) : null}
          <button
            type="button"
            onClick={onToggleFav}
            className="rounded-full border border-white/10 p-2 text-blue-100/70 hover:border-blue-300/60 hover:text-blue-200"
            aria-label={isFavourite ? 'Remove from favourites' : 'Save to favourites'}
          >
            {isFavourite ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-blue-100/70">
        {program.programType?.map(type => (
          <span key={type} className="rounded-full border border-white/15 bg-white/10 px-3 py-1">
            {type.replace(/-/g, ' ')}
          </span>
        ))}
        {program.services?.slice(0, 3).map(service => (
          <span
            key={`${program.id}-${service}`}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1"
          >
            {service.replace(/-/g, ' ')}
          </span>
        ))}
      </div>

      <div className="mt-5 grid gap-4 text-sm text-blue-100/80 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-blue-100/60">Eligibility score</p>
          <p className="text-lg font-semibold text-emerald-300">{program.score}%</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-blue-100/60">Loan Range</p>
          <p>{formatLoanRange(program.minLoanAmount, program.maxLoanAmount)}</p>
        </div>
        {program.interestRate ? (
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-blue-100/60">Interest</p>
            <p>{program.interestRate}</p>
          </div>
        ) : null}
        {program.tenure ? (
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-blue-100/60">Tenure</p>
            <p>{program.tenure}</p>
          </div>
        ) : null}
      </div>

      {program.benefits?.length ? (
        <ul className="mt-5 space-y-2 text-sm text-blue-100/80">
          {program.benefits.slice(0, 3).map(item => (
            <li key={item} className="flex items-start gap-2">
              <Sparkles className="mt-1 h-4 w-4 text-blue-300" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-blue-100/70">
        <span>{program.documents?.length || 0} documents suggested</span>
        {program.applyUrl ? (
          <a
            href={program.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
          >
            Apply now
            <Send className="h-3.5 w-3.5" />
          </a>
        ) : null}
      </footer>
    </div>
  );
}

export default function BanksMatchedToYou() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [saving, setSaving] = useState(false);
  const [matches, setMatches] = useState([]);
  const [topPicks, setTopPicks] = useState([]);
  const [filters, setFilters] = useState({ programType: '', bankType: '' });
  const [totalMatches, setTotalMatches] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('documotion-bank-favourites');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setFavorites(parsed);
        }
      } catch (err) {
        console.warn('Unable to parse favourites from storage', err);
      }
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      setLoadingProfile(true);
      const res = await fetch('/api/startups/profile');
      if (!res.ok) {
        throw new Error('Unable to load startup profile');
      }
      const data = await res.json();
      if (data.success && data.data) {
        setProfile(prev => ({ ...prev, ...normaliseResponseProfile(data.data) }));
        return data.data;
      }
      return null;
    } catch (err) {
      console.error(err);
      setError('Unable to load your startup profile. Complete it below to get matches.');
      return null;
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  const fetchMatches = useCallback(
    async (profileInput = profile, nextFilters = filters) => {
      try {
        setLoadingMatches(true);
        setError(null);
        const res = await fetch('/api/banks/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile: normaliseForApi(profileInput), filters: nextFilters }),
        });
        if (!res.ok) {
          throw new Error('Failed to fetch matches');
        }
        const data = await res.json();
        if (data.success) {
          setMatches(data.matches || []);
          setTopPicks(data.topPicks || []);
          setTotalMatches(data.total || 0);
        } else {
          setError(data.error || 'Unable to generate bank matches');
        }
      } catch (err) {
        console.error(err);
        setError('Unable to generate bank matches right now. Please try again later.');
      } finally {
        setLoadingMatches(false);
      }
    },
    [filters, profile]
  );

  useEffect(() => {
    const init = async () => {
      const stored = await fetchProfile();
      await fetchMatches(normaliseResponseProfile(stored) || profile, filters);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCheckboxToggle = (field, value) => {
    setProfile(prev => {
      const current = new Set(prev[field]);
      if (current.has(value)) {
        current.delete(value);
      } else {
        current.add(value);
      }
      return { ...prev, [field]: Array.from(current) };
    });
  };

  const handleFiltersChange = async (name, value) => {
    const nextFilters = { ...filters, [name]: value };
    setFilters(nextFilters);
    await fetchMatches(profile, nextFilters);
  };

  const handleSubmit = async event => {
    event.preventDefault();
    await fetchMatches(profile, filters);
  };

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      const payload = normaliseForApi(profile);
      const res = await fetch('/api/startups/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error('Failed to save preferences');
      }
    } catch (err) {
      console.error(err);
      setError('Unable to save preferences. Changes are kept locally.');
    } finally {
      setSaving(false);
    }
  };

  const toggleFavourite = programId => {
    setFavorites(prev => {
      const next = prev.includes(programId)
        ? prev.filter(item => item !== programId)
        : [...prev, programId];
      if (typeof window !== 'undefined') {
        localStorage.setItem('documotion-bank-favourites', JSON.stringify(next));
      }
      return next;
    });
  };

  const renderedMatches = useMemo(() => {
    if (!matches.length) return [];
    return matches.map(match => ({ ...match, isFavourite: favorites.includes(match.id) }));
  }, [matches, favorites]);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl backdrop-blur">
        <header className="mb-6 space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-blue-200">
            <Sparkles className="h-3 w-3" />
            Personalised matching
          </div>
          <h2 className="text-2xl font-semibold text-white">
            Tell us about your startup banking needs
          </h2>
          <p className="text-sm text-blue-100/70">
            We only recommend bank programmes where you meet the core eligibility. Update your
            details and discover the best-fit offers instantly.
          </p>
        </header>

        <form
          className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]"
          onSubmit={handleSubmit}
        >
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-blue-100/80">
                Stage
                <select
                  value={profile.stage}
                  onChange={event => setProfile(prev => ({ ...prev, stage: event.target.value }))}
                  className="rounded-xl border border-white/10 bg-transparent px-3 py-2 text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                >
                  {STAGE_OPTIONS.map(option => (
                    <option key={option} value={option} className="bg-slate-900 text-white">
                      {option.toUpperCase()}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm text-blue-100/80">
                Primary industry / sector
                <input
                  type="text"
                  value={profile.sector}
                  onChange={event => setProfile(prev => ({ ...prev, sector: event.target.value }))}
                  placeholder="e.g. SaaS, Fintech"
                  className="rounded-xl border border-white/10 bg-transparent px-3 py-2 text-white placeholder:text-blue-200/50 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-blue-100/80">
                Annual revenue (₹ crore)
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={profile.revenue}
                  onChange={event => setProfile(prev => ({ ...prev, revenue: event.target.value }))}
                  placeholder="0.0"
                  className="rounded-xl border border-white/10 bg-transparent px-3 py-2 text-white placeholder:text-blue-200/50 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-blue-100/80">
                Registered state
                <input
                  type="text"
                  value={profile.location}
                  onChange={event =>
                    setProfile(prev => ({ ...prev, location: event.target.value }))
                  }
                  placeholder="e.g. Karnataka"
                  className="rounded-xl border border-white/10 bg-transparent px-3 py-2 text-white placeholder:text-blue-200/50 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                />
              </label>
              <div className="flex flex-col gap-2 text-sm text-blue-100/80">
                Desired loan range (₹ lakh)
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={profile.preferredLoanMin}
                    onChange={event =>
                      setProfile(prev => ({ ...prev, preferredLoanMin: event.target.value }))
                    }
                    placeholder="Min"
                    className="rounded-xl border border-white/10 bg-transparent px-3 py-2 text-white placeholder:text-blue-200/50 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                  />
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={profile.preferredLoanMax}
                    onChange={event =>
                      setProfile(prev => ({ ...prev, preferredLoanMax: event.target.value }))
                    }
                    placeholder="Max"
                    className="rounded-xl border border-white/10 bg-transparent px-3 py-2 text-white placeholder:text-blue-200/50 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <fieldset className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <legend className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-100/60">
                  Required services
                </legend>
                <div className="space-y-2">
                  {SERVICE_OPTIONS.map(option => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 text-sm text-blue-100/80"
                    >
                      <input
                        type="checkbox"
                        checked={profile.servicesNeeded.includes(option.value)}
                        onChange={() => handleCheckboxToggle('servicesNeeded', option.value)}
                        className="h-4 w-4 rounded border-white/20 bg-transparent text-blue-400 focus:ring-blue-400/40"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="space-y-4">
                <fieldset className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <legend className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-100/60">
                    Special criteria
                  </legend>
                  {SPECIAL_CRITERIA_OPTIONS.map(option => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 text-sm text-blue-100/80"
                    >
                      <input
                        type="checkbox"
                        checked={profile.specialCriteria.includes(option.value)}
                        onChange={() => handleCheckboxToggle('specialCriteria', option.value)}
                        className="h-4 w-4 rounded border-white/20 bg-transparent text-blue-400 focus:ring-blue-400/40"
                      />
                      {option.label}
                    </label>
                  ))}
                </fieldset>

                <fieldset className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <legend className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-100/60">
                    Preferred bank type
                  </legend>
                  {BANK_TYPE_OPTIONS.map(option => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 text-sm text-blue-100/80"
                    >
                      <input
                        type="checkbox"
                        checked={profile.preferredBankTypes.includes(option.value)}
                        onChange={() => handleCheckboxToggle('preferredBankTypes', option.value)}
                        className="h-4 w-4 rounded border-white/20 bg-transparent text-blue-400 focus:ring-blue-400/40"
                      />
                      {option.label}
                    </label>
                  ))}
                </fieldset>
              </div>
            </div>
          </div>

          <aside className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Filters</h3>
              <Filter className="h-4 w-4 text-blue-200" />
            </div>
            <div className="mt-4 space-y-4 text-sm text-blue-100/80">
              <label className="flex flex-col gap-2">
                Program type
                <select
                  value={filters.programType}
                  onChange={event => handleFiltersChange('programType', event.target.value)}
                  className="rounded-xl border border-white/10 bg-transparent px-3 py-2 text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                >
                  {PROGRAM_TYPE_FILTERS.map(option => (
                    <option
                      key={option.value || 'all'}
                      value={option.value}
                      className="bg-slate-900 text-white"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2">
                Bank type
                <select
                  value={filters.bankType}
                  onChange={event => handleFiltersChange('bankType', event.target.value)}
                  className="rounded-xl border border-white/10 bg-transparent px-3 py-2 text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                >
                  {BANK_TYPE_FILTERS.map(option => (
                    <option
                      key={option.value || 'all'}
                      value={option.value}
                      className="bg-slate-900 text-white"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="space-y-2">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60"
                  disabled={loadingMatches}
                >
                  {loadingMatches ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Finding matches...
                    </span>
                  ) : (
                    'Find matches'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="w-full rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-blue-100 transition hover:bg-white/10 disabled:opacity-60"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save preferences'}
                </button>
              </div>
              {error ? <p className="text-xs text-red-300">{error}</p> : null}
            </div>
          </aside>
        </form>
      </section>

      <section className="space-y-4">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Matched programmes ({totalMatches})
            </h2>
            <p className="text-sm text-blue-100/70">
              Real-time recommendations based on your profile and eligibility.
            </p>
          </div>
        </header>

        {loadingProfile || loadingMatches ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 py-16 text-blue-100/70">
            <Loader2 className="h-6 w-6 animate-spin text-blue-300" />
            <p className="mt-4 text-sm">Crunching eligibility across partner banks...</p>
          </div>
        ) : null}

        {!loadingMatches && !renderedMatches.length ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center text-sm text-blue-100/70">
            <p>
              No matching programmes yet. Adjust your stage, services, or revenue to explore more
              offers.
            </p>
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          {renderedMatches.map(program => (
            <ProgramCard
              key={program.id}
              program={program}
              isRecommended={topPicks.some(item => item.id === program.id)}
              isFavourite={program.isFavourite}
              onToggleFav={() => toggleFavourite(program.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
