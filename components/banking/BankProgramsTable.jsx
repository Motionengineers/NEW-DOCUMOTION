'use client';

import { useMemo, useState } from 'react';
import { Filter } from 'lucide-react';

const PROGRAM_TYPE_FILTERS = [
  { value: '', label: 'All programme types' },
  { value: 'loan', label: 'Loans & Credit Lines' },
  { value: 'current-account', label: 'Current Accounts' },
  { value: 'api', label: 'API / Automation' },
  { value: 'treasury', label: 'Treasury & Forex' },
  { value: 'credit-card', label: 'Corporate Cards' },
];

const BANK_TYPE_FILTERS = [
  { value: '', label: 'All bank types' },
  { value: 'public', label: 'Public Sector Banks' },
  { value: 'private', label: 'Private Banks' },
  { value: 'fintech', label: 'Fintech / Neobank' },
];

function normalise(value) {
  if (!value) return '';
  return value.toString().trim().toLowerCase();
}

function programmeMatches(program, filters) {
  if (filters.programType) {
    const types = program.programType?.map(item => normalise(item)) || [];
    if (!types.includes(filters.programType)) return false;
  }
  if (filters.bankType) {
    if (normalise(program.bankType) !== filters.bankType) return false;
  }
  if (filters.search) {
    const haystack = normalise(
      [program.bankName, program.programName, program.benefits?.join(' ')].filter(Boolean).join(' ')
    );
    if (!haystack.includes(filters.search)) return false;
  }
  return true;
}

function formatRange(min, max) {
  const fmt = value => {
    if (value === null || value === undefined) return '—';
    return `${value}L`;
  };
  if (min == null && max == null) return '—';
  if (min == null) return `Up to ${fmt(max)}`;
  if (max == null) return `${fmt(min)}+`;
  return `${fmt(min)} – ${fmt(max)}`;
}

export default function BankProgramsTable({ programs }) {
  const [filters, setFilters] = useState({ programType: '', bankType: '', search: '' });

  const filtered = useMemo(() => {
    return programs.filter(program => programmeMatches(program, filters));
  }, [programs, filters]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (a.bankName === b.bankName) return a.programName.localeCompare(b.programName);
      return a.bankName.localeCompare(b.bankName);
    });
  }, [filtered]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.02] p-5 shadow-xl backdrop-blur lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3 text-sm text-blue-100/70">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-blue-100/60">
            <Filter className="h-4 w-4" /> Filters
          </div>
          <label className="flex flex-col gap-2 lg:w-60">
            Programme type
            <select
              value={filters.programType}
              onChange={event => setFilters(prev => ({ ...prev, programType: event.target.value }))}
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
        </div>

        <div className="grid gap-4 text-sm text-blue-100/70 sm:grid-cols-2 lg:flex lg:items-end lg:gap-6">
          <label className="flex flex-col gap-2">
            Bank type
            <select
              value={filters.bankType}
              onChange={event => setFilters(prev => ({ ...prev, bankType: event.target.value }))}
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
          <label className="flex flex-col gap-2">
            Search
            <input
              type="text"
              value={filters.search}
              placeholder="Search bank or programme"
              onChange={event =>
                setFilters(prev => ({ ...prev, search: normalise(event.target.value) }))
              }
              className="rounded-xl border border-white/10 bg-transparent px-3 py-2 text-white placeholder:text-blue-200/50 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
            />
          </label>
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-white/10 bg-white/[0.02] shadow-xl backdrop-blur">
        <table className="min-w-full divide-y divide-white/10 text-left text-sm text-blue-100/80">
          <thead className="bg-white/5 text-xs uppercase tracking-wide text-blue-100/60">
            <tr>
              <th className="px-5 py-4">Bank</th>
              <th className="px-5 py-4">Programme</th>
              <th className="px-5 py-4">Programme Type</th>
              <th className="px-5 py-4">Loan Range</th>
              <th className="px-5 py-4">Interest</th>
              <th className="px-5 py-4">Key Benefits</th>
              <th className="px-5 py-4">Apply</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {sorted.map(program => (
              <tr key={program.id} className="hover:bg-white/5">
                <td className="px-5 py-4 align-top text-white">
                  <div className="font-semibold">{program.bankName}</div>
                  <div className="text-xs uppercase tracking-[0.2em] text-blue-100/50">
                    {program.bankType ? program.bankType : '—'}
                  </div>
                </td>
                <td className="px-5 py-4 align-top">
                  <div className="font-medium text-white/90">{program.programName}</div>
                  {program.services?.length ? (
                    <div className="mt-1 text-xs text-blue-100/60">
                      {program.services.map(item => item.replace(/-/g, ' ')).join(', ')}
                    </div>
                  ) : null}
                </td>
                <td className="px-5 py-4 align-top">
                  {program.programType?.length
                    ? program.programType.map(type => type.replace(/-/g, ' ')).join(', ')
                    : '—'}
                </td>
                <td className="px-5 py-4 align-top">
                  {formatRange(program.minLoanAmount, program.maxLoanAmount)}
                </td>
                <td className="px-5 py-4 align-top">{program.interestRate || '—'}</td>
                <td className="px-5 py-4 align-top">
                  <ul className="space-y-1 text-xs text-blue-100/70">
                    {(program.benefits || []).slice(0, 3).map(benefit => (
                      <li key={`${program.id}-${benefit}`}>• {benefit}</li>
                    ))}
                  </ul>
                </td>
                <td className="px-5 py-4 align-top">
                  {program.applyUrl ? (
                    <a
                      href={program.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500"
                    >
                      Apply
                    </a>
                  ) : (
                    <span className="text-xs text-blue-100/50">Contact branch</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
