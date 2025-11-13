'use client';

import { useMemo, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Globe,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function initialsFromName(name = '') {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

const SPECIALIZATION_LABELS = {
  'api-first': 'API-first banking',
  'automation-suite': 'Automation toolkit',
  'accounting-integrations': 'Accounting ready',
  'developer-tooling': 'Developer friendly',
  'international-banking': 'Global banking',
  'fdi-compliance': 'FDI compliance',
  'global-network': 'Global network',
  'scaleup-lending': 'Scale-up capital',
  'credit-access': 'Credit partner',
  'cashflow-lending': 'Cashflow lending',
  'alternative-credit': 'Alternative credit',
  'zero-balance-launch': 'Zero-balance launch',
  'low-balance': 'Low minimum balance',
  'doorstep-onboarding': 'Doorstep onboarding',
  'relationship-led': 'Relationship-led',
  'pan-india-network': 'Pan-India coverage',
  'ecosystem-benefits': 'Ecosystem perks',
  'fintech-co-creation': 'Co-create with fintechs',
  'merchant-focus': 'Merchant-first',
  'sme-focus': 'SME focus',
  'treasury-support': 'Treasury support',
  'digital-first-branches': 'Digital branch network',
  'credit-cards': 'Corporate cards',
  'trade-finance': 'Trade finance',
  collections: 'Collection rails',
  'hardware-integration': 'POS hardware',
  rewards: 'Rewards & loyalty',
  insights: 'Spending insights',
  'mobile-first': 'Mobile-first',
};

function labelFromSpecialization(value) {
  if (!value) return null;
  if (SPECIALIZATION_LABELS[value]) return SPECIALIZATION_LABELS[value];
  return value
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function BankCard({ bank, onSelect, isActive, onToggleCompare, inCompare, rank }) {
  return (
    <article
      className={cn(
        'group flex flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur transition hover:-translate-y-1 hover:border-blue-400/40',
        isActive && 'border-blue-400/60 bg-blue-500/10'
      )}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/30 to-blue-900/30 text-lg font-semibold text-white">
            {initialsFromName(bank.name)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-white">{bank.name}</h2>
              {rank <= 3 ? (
                <span className="rounded-full bg-gradient-to-r from-blue-500/70 to-purple-500/60 px-2.5 py-[2px] text-[10px] font-semibold uppercase tracking-widest text-white">
                  Top Pick #{rank}
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-blue-100/60">
              <span>{bank.services.slice(0, 2).join(' • ')}</span>
              <span className="rounded-full border border-white/10 bg-white/10 px-2 py-[2px] text-[9px] uppercase tracking-widest text-blue-100/70">
                {bank.category === 'fintech' ? 'Fintech Partner' : 'Bank'}
              </span>
            </div>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-blue-100/80">{bank.overview}</p>
        {bank.keyOfferings?.length ? (
          <ul className="space-y-2 text-xs text-blue-100/70">
            {bank.keyOfferings.slice(0, 3).map(item => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2 className="mt-[2px] h-3.5 w-3.5 text-emerald-300" />
                <span>{item}</span>
              </li>
            ))}
            {bank.keyOfferings.length > 3 ? (
              <li className="text-[11px] text-blue-100/50">
                +{bank.keyOfferings.length - 3} more founder benefits
              </li>
            ) : null}
          </ul>
        ) : null}
        <div className="flex flex-wrap gap-2 pt-4">
          <span className="inline-flex items-center gap-1 rounded-full border border-blue-400/30 bg-blue-500/20 px-2.5 py-1 text-[10px] text-blue-100">
            Score: {bank.recommendationScore}
          </span>
          {bank.badges?.slice(0, 5).map(badge => (
            <span
              key={badge}
              className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] text-blue-100/70"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-blue-100/70">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          {bank.branches.length} dedicated startup branches
        </div>
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-300" />
          Preferred by {Math.round(120 + bank.branches.length * 12)} founders
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => onSelect(bank)}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/40 transition hover:bg-blue-500"
        >
          View branches
          <ArrowUpRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onToggleCompare(bank.slug)}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-xs font-semibold transition',
            inCompare ? 'bg-white/20 text-blue-900' : 'bg-white/10 text-blue-100 hover:bg-white/15'
          )}
        >
          {inCompare ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          {inCompare ? 'In compare' : 'Compare'}
        </button>
      </div>
    </article>
  );
}

function BranchRow({ branch, bankSlug }) {
  return (
    <tr
      id={`branch-${bankSlug}-${branch.email}`}
      className="divide-x divide-white/5 border-b border-white/5 text-sm text-blue-50"
    >
      <td className="px-4 py-4 align-top">
        <div className="font-semibold text-white">{branch.name}</div>
        <div className="mt-2 flex items-center gap-2 text-xs text-blue-100/70">
          <MapPin className="h-3.5 w-3.5" />
          {branch.city}, {branch.state}
        </div>
      </td>
      <td className="px-4 py-4 align-top text-xs text-blue-100/70">{branch.address}</td>
      <td className="px-4 py-4 align-top text-xs text-blue-100/70">
        <div className="font-medium text-white">{branch.contactPerson}</div>
        <div className="mt-1 flex flex-col gap-1 text-[11px] text-blue-100/70">
          <a
            href={`tel:${branch.contactNumber}`}
            className="inline-flex items-center gap-1 hover:text-blue-200"
          >
            <Phone className="h-3 w-3" />
            {branch.contactNumber}
          </a>
          <a
            href={`mailto:${branch.email}`}
            className="inline-flex items-center gap-1 hover:text-blue-200"
          >
            <Mail className="h-3 w-3" />
            {branch.email}
          </a>
        </div>
      </td>
      <td className="px-4 py-4 align-top text-right">
        <a
          href={`mailto:${branch.email}`}
          className="inline-flex items-center gap-2 rounded-full border border-blue-400/40 bg-blue-500/20 px-4 py-2 text-xs font-semibold text-blue-100 transition hover:bg-blue-500/30"
        >
          Contact branch
          <Mail className="h-3.5 w-3.5" />
        </a>
      </td>
    </tr>
  );
}

const GOVERNMENT_SCHEMES = [
  {
    name: 'Startup India Seed Fund Scheme (SISFS)',
    description:
      'Up to ₹70 lakh in grants and investments via incubators to cover proof-of-concept and go-to-market.',
  },
  {
    name: 'Fund of Funds for Startups (FFS)',
    description:
      'SIDBI channels capital into SEBI-registered AIFs that invest directly in high-potential startups.',
  },
  {
    name: 'Credit Guarantee Scheme for Startups (CGSS)',
    description:
      'Collateral-free working capital credit up to ₹10 crore guaranteed for eligible DPIIT-recognised startups.',
  },
  {
    name: 'Stand-Up India Scheme',
    description:
      'Term loans between ₹10 lakh and ₹1 crore for women or SC/ST founders launching greenfield ventures.',
  },
];

export default function BankDirectory({ banks }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [serviceFilters, setServiceFilters] = useState([]);
  const [selectedBankSlug, setSelectedBankSlug] = useState(banks?.[0]?.slug ?? null);
  const [compareSet, setCompareSet] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const branchSectionRef = useRef(null);

  const allCities = useMemo(() => {
    const cities = new Set();
    banks.forEach(bank => {
      bank.branches.forEach(branch => {
        if (branch.city) {
          cities.add(branch.city);
        }
      });
    });
    return Array.from(cities).sort();
  }, [banks]);

  const allServices = useMemo(() => {
    const services = new Set();
    banks.forEach(bank => bank.services.forEach(service => services.add(service)));
    return Array.from(services).sort();
  }, [banks]);

  const filteredBanks = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return banks.filter(bank => {
      const matchesTerm = term
        ? [bank.name, bank.overview, bank.services.join(' ')].some(value =>
            value.toLowerCase().includes(term)
          ) ||
          bank.branches.some(branch =>
            [branch.name, branch.address, branch.contactPerson, branch.city, branch.state]
              .filter(Boolean)
              .some(value => value.toLowerCase().includes(term))
          )
        : true;

      const matchesCity = cityFilter
        ? bank.branches.some(branch => branch.city?.toLowerCase() === cityFilter.toLowerCase())
        : true;

      const matchesServices = serviceFilters.length
        ? serviceFilters.every(service => bank.services.includes(service))
        : true;

      const matchesCategory = categoryFilter === 'all' || bank.category === categoryFilter;

      return matchesTerm && matchesCity && matchesServices && matchesCategory;
    });
  }, [banks, searchTerm, cityFilter, serviceFilters, categoryFilter]);

  const selectedBank = useMemo(() => {
    const direct = banks.find(bank => bank.slug === selectedBankSlug);
    if (direct) return direct;
    return filteredBanks[0] ?? banks[0] ?? null;
  }, [banks, filteredBanks, selectedBankSlug]);

  const visibleBranches = useMemo(() => {
    if (!selectedBank) return [];
    if (!cityFilter) return selectedBank.branches;
    return selectedBank.branches.filter(
      branch => branch.city?.toLowerCase() === cityFilter.toLowerCase()
    );
  }, [selectedBank, cityFilter]);

  const toggleCompare = slug => {
    setCompareSet(prev => {
      if (prev.includes(slug)) {
        return prev.filter(item => item !== slug);
      }
      if (prev.length >= 3) {
        const [, ...rest] = prev;
        return [...rest, slug];
      }
      return [...prev, slug];
    });
  };

  const compareBanks = banks.filter(bank => compareSet.includes(bank.slug));

  const clearFilters = () => {
    setSearchTerm('');
    setCityFilter('');
    setServiceFilters([]);
    setCategoryFilter('all');
  };

  return (
    <div className="space-y-8 text-white">
      <header className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-xl backdrop-blur">
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() =>
              branchSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
            className="self-start text-left"
          >
            <h1 className="text-4xl font-semibold tracking-tight text-white hover:text-blue-300">
              Startup Banking Directory
            </h1>
          </button>
          <p className="max-w-2xl text-sm text-blue-100/70">
            Discover bank partners that actively serve Indian startups. Filter by city, services, or
            compare offerings to connect with the right relationship manager in minutes.
          </p>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-200" />
              <input
                type="search"
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
                placeholder="Search bank, branch or contact"
                className="w-full rounded-2xl border border-white/10 bg-transparent py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-blue-200/60 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
              />
            </div>
            <div className="flex flex-1 flex-col gap-3 sm:flex-row">
              <select
                value={cityFilter}
                onChange={event => setCityFilter(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-transparent px-3 py-2.5 text-sm text-white focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
              >
                <option value="" className="bg-slate-900 text-sm text-white">
                  All cities
                </option>
                {allCities.map(city => (
                  <option key={city} value={city} className="bg-slate-900 text-sm text-white">
                    {city}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowFilters(prev => !prev)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-4 py-2.5 text-sm text-blue-100 transition hover:bg-white/10"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Services ({serviceFilters.length || 'all'})
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start rounded-2xl border border-white/15 bg-white/5 p-1 text-xs text-blue-100 md:self-center">
            {[
              { label: 'All', value: 'all' },
              { label: 'Banks', value: 'bank' },
              { label: 'Fintech', value: 'fintech' },
            ].map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => setCategoryFilter(option.value)}
                className={cn(
                  'rounded-2xl px-3 py-1 transition',
                  categoryFilter === option.value
                    ? 'bg-blue-500/40 text-white'
                    : 'text-blue-100/70 hover:bg-white/10'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-2 self-start rounded-2xl border border-white/15 px-4 py-2 text-xs font-semibold text-blue-100 transition hover:bg-white/10"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>

        {showFilters ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-100/60">
              Filter by services
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {allServices.map(service => {
                const selected = serviceFilters.includes(service);
                return (
                  <button
                    key={service}
                    type="button"
                    onClick={() =>
                      setServiceFilters(prev =>
                        selected ? prev.filter(item => item !== service) : [...prev, service]
                      )
                    }
                    className={cn(
                      'rounded-full border px-4 py-2 text-xs transition',
                      selected
                        ? 'border-blue-400 bg-blue-400/30 text-white'
                        : 'border-white/15 bg-white/10 text-blue-100 hover:bg-white/20'
                    )}
                  >
                    {service}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {compareBanks.length ? (
          <div className="rounded-2xl border border-white/10 bg-blue-500/10 p-4 shadow-inner">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Compare shortlisted banks</h3>
              <span className="text-[10px] uppercase tracking-[0.3em] text-blue-100/60">
                Up to 3 banks
              </span>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {compareBanks.map(bank => (
                <div
                  key={bank.slug}
                  className="rounded-xl border border-blue-400/30 bg-blue-500/20 p-3 text-xs text-blue-100"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-white">{bank.name}</div>
                    <button
                      type="button"
                      onClick={() => toggleCompare(bank.slug)}
                      className="text-[10px] text-blue-100/60 hover:text-white"
                    >
                      Remove
                    </button>
                  </div>
                  <ul className="mt-3 space-y-2 text-[11px]">
                    <li className="flex items-center gap-2">
                      <ShieldCheck className="h-3 w-3 text-blue-200" />
                      {bank.category === 'fintech' ? 'Fintech partner' : 'Full-service bank'}
                    </li>
                    {bank.badges?.slice(0, 2).map(badge => (
                      <li key={`${bank.slug}-badge-${badge}`} className="flex items-center gap-2">
                        <Sparkles className="h-3 w-3 text-amber-200" />
                        {badge}
                      </li>
                    ))}
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-[2px] h-3 w-3 text-emerald-300" />
                      {bank.keyOfferings?.[0]}
                    </li>
                    <li className="flex items-center gap-2">
                      <Building2 className="h-3 w-3 text-blue-200" />
                      Branches in {new Set(bank.branches.map(branch => branch.city)).size} cities
                    </li>
                    <li className="flex items-center gap-2">
                      <Globe className="h-3 w-3 text-purple-200" />
                      <a
                        href={bank.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline decoration-dotted underline-offset-2 hover:text-white"
                      >
                        Website
                      </a>
                    </li>
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)] xl:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
        <div className="grid gap-5 md:grid-cols-2">
          {filteredBanks.map((bank, index) => (
            <BankCard
              key={bank.slug}
              bank={bank}
              rank={index + 1}
              isActive={selectedBank?.slug === bank.slug}
              onSelect={nextBank => {
                setSelectedBankSlug(nextBank.slug);
                branchSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              onToggleCompare={toggleCompare}
              inCompare={compareSet.includes(bank.slug)}
            />
          ))}

          {!filteredBanks.length ? (
            <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-12 text-center text-sm text-blue-100/70">
              <Sparkles className="h-6 w-6 text-blue-300" />
              <p className="mt-4 max-w-sm">
                No banks match your filters yet. Try clearing the city or services filter to see top
                recommendations.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs text-blue-100 hover:bg-white/10"
              >
                Reset filters
              </button>
            </div>
          ) : null}
        </div>

        <aside
          ref={branchSectionRef}
          className="flex h-max flex-col gap-5 rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-xl backdrop-blur"
        >
          {selectedBank ? (
            <>
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-semibold text-white">{selectedBank.name}</h2>
                <p className="text-xs uppercase tracking-[0.3em] text-blue-100/60">
                  Filters: {cityFilter || 'All cities'} ·{' '}
                  {selectedBank.category === 'fintech' ? 'Fintech partner' : 'Bank'}
                </p>
              </div>
              <div className="space-y-3 text-xs text-blue-100/70">
                <p>{selectedBank.overview}</p>
                <div className="flex flex-wrap gap-2">
                  {selectedBank.services.map(service => (
                    <span
                      key={service}
                      className="rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-[10px] text-blue-100"
                    >
                      {service}
                    </span>
                  ))}
                </div>
                {selectedBank.keyOfferings?.length ? (
                  <ul className="space-y-2 text-left">
                    {selectedBank.keyOfferings.slice(0, 3).map(item => (
                      <li key={item} className="flex items-start gap-2 text-blue-100/75">
                        <CheckCircle2 className="mt-[2px] h-3.5 w-3.5 text-emerald-300" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {selectedBank.focusAreas?.length ? (
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-blue-100/60">
                      Specialisations
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedBank.focusAreas.map(spec => {
                        const label = labelFromSpecialization(spec);
                        return (
                          <span
                            key={spec}
                            className="inline-flex items-center gap-1 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-[10px] text-blue-100"
                          >
                            <Sparkles className="h-3 w-3 text-blue-200" />
                            {label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
                {selectedBank.platforms?.length ? (
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-blue-100/60">
                      Platforms & integrations
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedBank.platforms.map(platform => (
                        <span
                          key={platform}
                          className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] text-blue-100/70"
                        >
                          <Globe className="h-3 w-3 text-blue-200" />
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
                {selectedBank.topBranches?.length ? (
                  <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-blue-100/60">
                      Highlight branches
                    </p>
                    <div className="space-y-2 text-[11px] text-blue-100/70">
                      {selectedBank.topBranches.map(branch => (
                        <div
                          key={`${selectedBank.slug}-${branch.city}-${branch.name}`}
                          className="flex items-start justify-between gap-2"
                        >
                          <div>
                            <p className="font-semibold text-blue-50">{branch.name}</p>
                            <p className="text-blue-100/50">
                              {branch.city}, {branch.state}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const ref = document.getElementById(
                                `branch-${selectedBank.slug}-${branch.email}`
                              );
                              ref?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }}
                            className="rounded-full border border-blue-400/30 px-3 py-1 text-[10px] text-blue-100 hover:bg-blue-500/20"
                          >
                            View in table
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                {selectedBank.governmentSchemes?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedBank.governmentSchemes.map(scheme => (
                      <span
                        key={scheme}
                        className="inline-flex items-center gap-1 rounded-full border border-emerald-300/40 bg-emerald-400/15 px-3 py-1 text-[10px] text-emerald-100"
                      >
                        <ShieldCheck className="h-3 w-3" />
                        {scheme}
                      </span>
                    ))}
                  </div>
                ) : null}
                <a
                  href={selectedBank.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-blue-200 hover:text-blue-100"
                >
                  Visit website
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>

              <div className="max-h-[60vh] overflow-x-auto rounded-2xl border border-white/10 shadow-inner">
                <table className="min-w-[640px] w-full divide-y divide-white/5">
                  <thead className="bg-white/10 text-left text-[11px] uppercase tracking-wide text-blue-100/60">
                    <tr>
                      <th className="px-4 py-3">Branch</th>
                      <th className="px-4 py-3">Address</th>
                      <th className="px-4 py-3">Contact</th>
                      <th className="px-4 py-3 text-right">Connect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {visibleBranches.map(branch => (
                      <BranchRow
                        key={`${selectedBank.slug}-${branch.email}`}
                        branch={branch}
                        bankSlug={selectedBank.slug}
                      />
                    ))}
                    {!visibleBranches.length ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-xs text-blue-100/60">
                          No branches available in this city yet. Try another location to discover
                          relationship managers.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center text-blue-100/60">
              <Sparkles className="h-6 w-6 text-blue-300" />
              <p>Select a bank to preview dedicated startup branches and contact details.</p>
            </div>
          )}
        </aside>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 shadow-xl backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">Government-backed Funding Schemes</h2>
            <p className="mt-1 text-sm text-blue-100/70">
              Pair your banking stack with central initiatives to unlock non-dilutive capital
              faster. Documotion tracks eligibility windows, incubator partners, and participating
              banks for you.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs text-blue-100 hover:bg-white/10"
            onClick={() =>
              branchSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          >
            Back to banks
          </button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {GOVERNMENT_SCHEMES.map(scheme => (
            <div
              key={scheme.name}
              className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm text-blue-100/80"
            >
              <h3 className="text-base font-semibold text-white">{scheme.name}</h3>
              <p>{scheme.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
