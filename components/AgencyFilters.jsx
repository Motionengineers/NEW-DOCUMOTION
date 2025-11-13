'use client';

import { useMemo } from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils.js';

const TEAM_SIZE_BANDS = [
  { value: '1-10', label: '1-10' },
  { value: '10-50', label: '10-50' },
  { value: '50+', label: '50+' },
];

const RATING_OPTIONS = [
  { value: '', label: 'Any rating' },
  { value: '3', label: '3.0+' },
  { value: '3.5', label: '3.5+' },
  { value: '4', label: '4.0+' },
  { value: '4.5', label: '4.5+' },
];

export default function AgencyFilters({ filters, options, onChange, onReset }) {
  const serviceOptions = useMemo(
    () => options?.services?.slice?.(0, 10) ?? [],
    [options?.services]
  );
  const categoryOptions = useMemo(() => options?.categories ?? [], [options?.categories]);
  const cityOptions = useMemo(() => options?.cities ?? [], [options?.cities]);
  const stateOptions = useMemo(() => options?.states ?? [], [options?.states]);

  const handleInputChange = (key, value) => {
    if (key === 'verified') {
      onChange({
        ...filters,
        verified: value ? true : undefined,
      });
      return;
    }
    onChange({
      ...filters,
      [key]: value,
    });
  };

  const handleArrayToggle = (key, value) => {
    const current = new Set(filters[key] ?? []);
    if (current.has(value)) {
      current.delete(value);
    } else {
      current.add(value);
    }
    onChange({
      ...filters,
      [key]: Array.from(current),
    });
  };

  return (
    <section className="glass space-y-4 rounded-2xl border border-white/10 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide"
          style={{ color: 'var(--secondary-label)' }}
        >
          <Filter className="h-4 w-4 text-blue-300" />
          Filters
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition hover:bg-white/10"
          style={{ color: 'var(--secondary-label)' }}
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label
          className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide"
          style={{ color: 'var(--secondary-label)' }}
        >
          City
          <select
            value={filters.city?.[0] ?? ''}
            onChange={event =>
              handleInputChange('city', event.target.value ? [event.target.value] : [])
            }
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
            style={{ color: 'var(--label)' }}
          >
            <option value="">All cities</option>
            {cityOptions.map(city => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>

        <label
          className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide"
          style={{ color: 'var(--secondary-label)' }}
        >
          State
          <select
            value={filters.state?.[0] ?? ''}
            onChange={event =>
              handleInputChange('state', event.target.value ? [event.target.value] : [])
            }
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
            style={{ color: 'var(--label)' }}
          >
            <option value="">All states</option>
            {stateOptions.map(state => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </label>

        <label
          className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide"
          style={{ color: 'var(--secondary-label)' }}
        >
          Minimum Budget (₹)
          <input
            type="number"
            min="0"
            value={filters.minBudget ?? ''}
            onChange={event =>
              handleInputChange(
                'minBudget',
                event.target.value ? Number(event.target.value) : undefined
              )
            }
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
            style={{ color: 'var(--label)' }}
            placeholder="50,000"
          />
        </label>

        <label
          className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide"
          style={{ color: 'var(--secondary-label)' }}
        >
          Maximum Budget (₹)
          <input
            type="number"
            min="0"
            value={filters.maxBudget ?? ''}
            onChange={event =>
              handleInputChange(
                'maxBudget',
                event.target.value ? Number(event.target.value) : undefined
              )
            }
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
            style={{ color: 'var(--label)' }}
            placeholder="5,00,000"
          />
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-3">
          <p
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: 'var(--secondary-label)' }}
          >
            Services
          </p>
          <div className="flex flex-wrap gap-2">
            {serviceOptions.map(service => {
              const active = filters.services?.includes(service);
              return (
                <button
                  key={service}
                  type="button"
                  onClick={() => handleArrayToggle('services', service)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs font-medium transition',
                    active
                      ? 'border-blue-400 bg-blue-500/20 text-blue-100'
                      : 'border-white/10 bg-white/5 text-[var(--secondary-label)] hover:border-blue-400/40 hover:text-[var(--label)]'
                  )}
                >
                  {service}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <p
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: 'var(--secondary-label)' }}
          >
            Minimum Rating
          </p>
          <select
            value={filters.minRating ?? ''}
            onChange={event =>
              handleInputChange(
                'minRating',
                event.target.value ? Number(event.target.value) : undefined
              )
            }
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
            style={{ color: 'var(--label)' }}
          >
            {RATING_OPTIONS.map(option => (
              <option key={option.value || 'any'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="space-y-2">
            <p
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: 'var(--secondary-label)' }}
            >
              Agency Size
            </p>
            <div className="flex flex-wrap gap-2">
              {TEAM_SIZE_BANDS.map(band => {
                const active = filters.teamSizeBands?.includes(band.value);
                return (
                  <button
                    key={band.value}
                    type="button"
                    onClick={() => handleArrayToggle('teamSizeBands', band.value)}
                    className={cn(
                      'rounded-xl border px-3 py-2 text-xs font-semibold transition',
                      active
                        ? 'border-blue-400 bg-blue-500/20 text-blue-100'
                        : 'border-white/10 bg-white/5 text-[var(--secondary-label)] hover:border-blue-400/40 hover:text-[var(--label)]'
                    )}
                  >
                    {band.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <span
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: 'var(--secondary-label)' }}
            >
              Verified only
            </span>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={Boolean(filters.verified)}
                onChange={event => handleInputChange('verified', event.target.checked)}
              />
              <div className="h-5 w-10 rounded-full bg-white/10 transition peer-checked:bg-blue-500/60">
                <div className="absolute top-1/2 left-1 h-4 w-4 -translate-y-1/2 transform rounded-full bg-white shadow transition peer-checked:translate-x-5" />
              </div>
            </label>
          </div>
        </div>
      </div>

      {categoryOptions.length ? (
        <div className="space-y-3">
          <p
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: 'var(--secondary-label)' }}
          >
            Categories
          </p>
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map(category => {
              const active = filters.categories?.includes(category);
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleArrayToggle('categories', category)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs font-medium transition',
                    active
                      ? 'border-blue-400 bg-blue-500/20 text-blue-100'
                      : 'border-white/10 bg-white/5 text-[var(--secondary-label)] hover:border-blue-400/40 hover:text-[var(--label)]'
                  )}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
