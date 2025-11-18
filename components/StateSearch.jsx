/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import StateFundingCard from './StateFundingCard';
import StateCompareModal from './StateCompareModal';
import StateMatchScore from './StateMatchScore';
import { track } from '@/lib/telemetry';
import FilterDrawer from './FilterDrawer';
import SavingsCalculator from './SavingsCalculator';

const SECTOR_OPTIONS = [
  'AI',
  'Fintech',
  'EV & Mobility',
  'Climate',
  'Agritech',
  'Manufacturing',
  'SaaS',
  'Women-led',
];

const SORT_OPTIONS = [
  { label: 'Most recent', value: 'recent' },
  { label: 'Interest: low to high', value: 'interest-low' },
  { label: 'Interest: high to low', value: 'interest-high' },
  { label: 'Highest funding', value: 'funding-high' },
  { label: 'Most popular', value: 'popularity' },
];

export default function StateSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [states, setStates] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedState, setSelectedState] = useState(null);
  const [schemes, setSchemes] = useState([]);
  const [loadingSchemes, setLoadingSchemes] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    sector: '',
    sort: 'recent',
    fundingType: '',
    verifiedOnly: false,
    fundingMin: '',
    fundingMax: '',
  });
  const [compareList, setCompareList] = useState([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lastMatchProfile, setLastMatchProfile] = useState(null);

  useEffect(() => {
    fetch('/api/states')
      .then(res => res.json())
      .then(json => {
        if (json?.success) {
          setStates(json.data);
        }
      })
      .catch(err => console.error('Failed to load states', err));
  }, []);

  useEffect(() => {
    if (!searchParams) return;
    const params = Object.fromEntries(searchParams.entries());
    setQuery(params.state || '');
    setSelectedState(params.state || null);
    const syncedFilters = {
      sector: params.sector || '',
      sort: params.sort || 'recent',
      fundingType: params.fundingType || '',
      verifiedOnly: params.verified === 'true',
      fundingMin: params.fundingMin || '',
      fundingMax: params.fundingMax || '',
    };
    setFilters(prev => ({ ...prev, ...syncedFilters }));
    if (params.state) {
      loadSchemes(params.state, syncedFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const quickStates = useMemo(() => states.slice(0, 8), [states]);

  function syncUrl(nextState, nextFilters = filters) {
    const params = new URLSearchParams();
    if (nextState) params.set('state', nextState);
    if (nextFilters.sector) params.set('sector', nextFilters.sector);
    if (nextFilters.sort && nextFilters.sort !== 'recent') params.set('sort', nextFilters.sort);
    if (nextFilters.fundingType) params.set('fundingType', nextFilters.fundingType);
    if (nextFilters.verifiedOnly) params.set('verified', 'true');
    if (nextFilters.fundingMin) params.set('fundingMin', nextFilters.fundingMin);
    if (nextFilters.fundingMax) params.set('fundingMax', nextFilters.fundingMax);
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  async function loadSchemes(stateName, overrides) {
    if (!stateName) return;
    setLoadingSchemes(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('state', stateName);
      const activeFilters = overrides || filters;
      if (activeFilters.sector) params.set('sector', activeFilters.sector);
      if (activeFilters.sort) params.set('sort', activeFilters.sort);
      if (activeFilters.fundingType) params.set('fundingType', activeFilters.fundingType);
      if (activeFilters.verifiedOnly) params.set('verified', 'true');
      if (activeFilters.fundingMin) params.set('fundingMin', activeFilters.fundingMin);
      if (activeFilters.fundingMax) params.set('fundingMax', activeFilters.fundingMax);
      const res = await fetch(`/api/funding/state?${params.toString()}`);
      const json = await res.json();
      if (json?.success) {
        setSchemes(json.data.schemes);
      } else {
        setSchemes([]);
        setError(json?.error ?? 'Unable to load data');
      }
    } catch (err) {
      console.error(err);
      setError('Unable to load schemes. Please try again.');
    } finally {
      setLoadingSchemes(false);
    }
  }

  // Normalize state name to match database format (title case)
  function normalizeStateName(name) {
    if (!name) return name;
    return name
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  function handleSearch() {
    if (!query) return;
    const normalizedQuery = normalizeStateName(query);
    track('search.query', {
      query: normalizedQuery,
      filters: filters,
      source: 'state-explorer',
    });
    setSelectedState(normalizedQuery);
    syncUrl(normalizedQuery);
    loadSchemes(normalizedQuery);
  }

  function handleChipClick(stateName) {
    const normalizedName = normalizeStateName(stateName);
    track('search.query', {
      query: normalizedName,
      filters: filters,
      source: 'quick-chip',
    });
    setQuery(normalizedName);
    setSelectedState(normalizedName);
    syncUrl(normalizedName);
    loadSchemes(normalizedName);
  }

  function handleFilterChange(key, value) {
    setFilters(prev => {
      const next = { ...prev, [key]: value };
      track('filter.apply', {
        filters: next,
        changedKey: key,
        changedValue: value,
      });
      if (selectedState) {
        syncUrl(selectedState, next);
        loadSchemes(selectedState, next);
      }
      return next;
    });
  }

  function handleDrawerApply(nextFilters) {
    setFilters(prev => {
      const merged = {
        ...prev,
        ...nextFilters,
        fundingMin: nextFilters.fundingMin ?? '',
        fundingMax: nextFilters.fundingMax ?? '',
      };
      if (selectedState) {
        syncUrl(selectedState, merged);
        loadSchemes(selectedState, merged);
      }
      return merged;
    });
    setDrawerOpen(false);
  }

  function exportCsv() {
    if (!schemes.length) return;
    const header = [
      'State',
      'Title',
      'FundingType',
      'FundingAmount',
      'FundingMin',
      'FundingMax',
      'Sector',
      'InterestRate',
      'SubsidyPercent',
      'Verified',
      'ApplyLink',
    ];
    const rows = schemes.map(scheme => [
      scheme.state?.name ?? '',
      scheme.title ?? '',
      scheme.fundingType ?? '',
      scheme.fundingAmount ?? '',
      scheme.fundingMin ?? '',
      scheme.fundingMax ?? '',
      scheme.sector ?? '',
      scheme.interestRate ?? '',
      scheme.subsidyPercent ?? '',
      scheme.verified ? 'Yes' : 'No',
      scheme.applyLink ?? '',
    ]);
    const csv = [header, ...rows].map(row => row.map(value => `"${value}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'state-funding-schemes.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function toggleCompare(scheme) {
    const stateName = scheme.state?.name;
    if (!stateName) return;
    setCompareList(prev => {
      const exists = prev.find(item => item.state?.id === scheme.state?.id);
      if (exists) {
        return prev.filter(item => item.state?.id !== scheme.state?.id);
      }
      const updated = [...prev, scheme].slice(-3);
      return updated;
    });
  }

  async function handleMatchSubmit(profile) {
    setMatchLoading(true);
    setMatchResult(null);
    setLastMatchProfile(profile);
    try {
      const res = await fetch('/api/funding/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      const json = await res.json();
      if (json?.success) {
        setMatchResult(json.data);
      } else {
        setMatchResult({ error: json?.error ?? 'Unable to compute match score' });
      }
    } catch (err) {
      console.error(err);
      setMatchResult({ error: 'Unable to compute match score' });
    } finally {
      setMatchLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex-1 space-y-2">
            <p className="text-sm uppercase tracking-[0.4em] text-white/60">
              State-Wise Explorer
            </p>
            <h2 className="text-3xl font-semibold text-white">
              Find state incentives tailored to your startup.
            </h2>
            <p className="text-sm text-white/70">
              Search by state, filter by sector, and compare benefits side-by-side.
            </p>
          </div>
          <div className="flex w-full gap-3 md:w-1/2">
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Search by state name…"
              className="flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
              onKeyDown={event => {
                if (event.key === 'Enter') handleSearch();
              }}
            />
            <button
              type="button"
              onClick={handleSearch}
              className="rounded-2xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-400"
            >
              Search
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {quickStates.map(state => (
            <button
              key={state.id}
              type="button"
              onClick={() => handleChipClick(state.name)}
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/80 hover:border-white/60"
            >
              {state.name}
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-4 border-t border-white/5 pt-6 md:flex-row">
          <select
            value={filters.sector}
            onChange={event => handleFilterChange('sector', event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white focus:border-white/40 focus:outline-none md:w-1/3"
          >
            <option value="">All sectors</option>
            {SECTOR_OPTIONS.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            value={filters.sort}
            onChange={event => handleFilterChange('sort', event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white focus:border-white/40 focus:outline-none md:w-1/3"
          >
            {SORT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="w-full rounded-2xl border border-white/20 px-4 py-3 text-sm text-white md:w-1/3"
          >
            Advanced filters
          </button>
          {compareList.length > 0 ? (
            <button
              type="button"
              onClick={() => setCompareOpen(true)}
              className="w-full rounded-2xl border border-blue-400/40 px-4 py-3 text-sm font-semibold text-blue-200 hover:bg-blue-500/10 md:w-1/3"
            >
              Compare {compareList.length} state{compareList.length > 1 ? 's' : ''}
            </button>
          ) : (
            <button
              type="button"
              onClick={exportCsv}
              className="w-full rounded-2xl border border-white/20 px-4 py-3 text-sm text-white md:w-1/3"
            >
              Export CSV
            </button>
          )}
        </div>
      </div>

      <StateMatchScore data={matchResult} loading={matchLoading} onSubmit={handleMatchSubmit} />

      <div>
        {selectedState ? (
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Selected state</p>
              <h3 className="text-2xl font-semibold text-white">{selectedState}</h3>
            </div>
            <span className="text-sm text-white/60">
              {schemes.length} scheme{schemes.length === 1 ? '' : 's'} found
            </span>
          </div>
        ) : (
          <p className="text-sm text-white/60">
            Start by picking a state or run the AI match score.
          </p>
        )}

        {loadingSchemes && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
            Loading state incentives…
          </div>
        )}

        {error && !loadingSchemes && (
          <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {!loadingSchemes && !error && (
          <div className="grid gap-4 md:grid-cols-2">
            {schemes.map(scheme => (
              <StateFundingCard
                key={scheme.id}
                scheme={scheme}
                onSelect={toggleCompare}
                highlighted={compareList.some(item => item.state?.id === scheme.state?.id)}
              />
            ))}
          </div>
        )}

        <SavingsCalculator
          schemes={schemes}
          requiredFunding={lastMatchProfile?.requiredFunding}
        />
      </div>

      <StateCompareModal
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        selections={compareList}
      />
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onApply={handleDrawerApply}
        sectors={SECTOR_OPTIONS}
        defaults={filters}
      />
    </div>
  );
}


