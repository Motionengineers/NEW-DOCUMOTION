'use client';

import React, { useEffect, useState } from 'react';

export default function FilterDrawer({ open, onClose, onApply, sectors = [], defaults = {} }) {
  const [sector, setSector] = useState(defaults.sector || '');
  const [fundingMin, setFundingMin] = useState(defaults.fundingMin || '');
  const [fundingMax, setFundingMax] = useState(defaults.fundingMax || '');
  const [verifiedOnly, setVerifiedOnly] = useState(Boolean(defaults.verifiedOnly));
  const [fundingType, setFundingType] = useState(defaults.fundingType || '');

  useEffect(() => {
    setSector(defaults.sector || '');
    setFundingMin(defaults.fundingMin || '');
    setFundingMax(defaults.fundingMax || '');
    setVerifiedOnly(Boolean(defaults.verifiedOnly));
    setFundingType(defaults.fundingType || '');
  }, [defaults]);

  function apply() {
    onApply?.({
      sector,
      fundingMin: fundingMin ? Number(fundingMin) : null,
      fundingMax: fundingMax ? Number(fundingMax) : null,
      verifiedOnly,
      fundingType,
    });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="w-full max-w-xs border-r border-white/10 bg-slate-900/95 px-4 py-6 text-white shadow-2xl backdrop-blur">
        <h3 className="text-lg font-semibold">Filters</h3>

        <label className="mt-5 block text-xs uppercase tracking-wide text-white/50">Sector</label>
        <select
          value={sector}
          onChange={event => setSector(event.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm focus:border-white/40 focus:outline-none"
        >
          <option value="">Any</option>
          {sectors.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <label className="mt-4 block text-xs uppercase tracking-wide text-white/50">
          Funding type
        </label>
        <select
          value={fundingType}
          onChange={event => setFundingType(event.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm focus:border-white/40 focus:outline-none"
        >
          <option value="">Any</option>
          <option value="Grant">Grant</option>
          <option value="Loan">Loan</option>
          <option value="Subsidy">Subsidy</option>
        </select>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs uppercase tracking-wide text-white/50">
              Funding min (₹)
            </label>
            <input
              value={fundingMin}
              onChange={event => setFundingMin(event.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm focus:border-white/40 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-white/50">
              Funding max (₹)
            </label>
            <input
              value={fundingMax}
              onChange={event => setFundingMax(event.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm focus:border-white/40 focus:outline-none"
            />
          </div>
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm text-white/80">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={event => setVerifiedOnly(event.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-transparent"
          />
          Verified only
        </label>

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={apply}
            className="flex-1 rounded-xl bg-blue-500 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-400"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-white/20 px-3 py-2 text-sm text-white/80 hover:border-white/40"
          >
            Close
          </button>
        </div>
      </div>
      <div className="flex-1 bg-black/40 backdrop-blur" onClick={onClose} />
    </div>
  );
}

