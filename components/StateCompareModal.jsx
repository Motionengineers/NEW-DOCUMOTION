'use client';

import React, { useMemo, useEffect } from 'react';
import { track } from '@/lib/telemetry';

function summarizeState(selections) {
  const grouped = selections.reduce((acc, scheme) => {
    const stateId = scheme.state?.id;
    if (!stateId) return acc;
    if (!acc[stateId]) {
      acc[stateId] = {
        state: scheme.state,
        schemes: [],
      };
    }
    acc[stateId].schemes.push(scheme);
    return acc;
  }, {});

  return Object.values(grouped).map(entry => {
    const topFunding = entry.schemes[0]?.fundingAmount || '—';
    const bestInterest = entry.schemes.reduce((best, scheme) => {
      if (scheme.interestRate === null || scheme.interestRate === undefined) return best;
      if (best === null) return scheme.interestRate;
      return Math.min(best, scheme.interestRate);
    }, null);

    return {
      state: entry.state,
      schemeCount: entry.schemes.length,
      prominentSector: entry.schemes[0]?.sector,
      topFunding,
      interestRate: bestInterest,
      sampleScheme: entry.schemes[0],
    };
  });
}

export default function StateCompareModal({ open, onClose, selections = [] }) {
  const summary = useMemo(() => summarizeState(selections), [selections]);

  useEffect(() => {
    if (open && selections.length > 0) {
      track('compare.open', {
        stateIds: selections.map(s => s.state?.id || s.stateId).filter(Boolean),
        stateNames: selections.map(s => s.state?.name).filter(Boolean),
        origin: 'compare-modal',
      });
    }
  }, [open, selections]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur">
      <div className="w-full max-w-4xl rounded-3xl border border-white/10 bg-[#0b0f1a] p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">State comparison</p>
            <h3 className="text-2xl font-semibold text-white">Compare incentives side-by-side</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:border-white/60"
          >
            Close
          </button>
        </div>

        {summary.length === 0 ? (
          <p className="mt-6 text-sm text-white/70">Select at least one state to compare.</p>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {summary.map(item => (
              <div key={item.state?.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                  {item.state?.abbreviation}
                </p>
                <h4 className="mt-2 text-xl font-semibold text-white">{item.state?.name}</h4>
                <p className="text-sm text-white/60">{item.state?.description}</p>

                <dl className="mt-4 space-y-2 text-sm text-white/80">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-white/50">Schemes loaded</dt>
                    <dd className="font-semibold">{item.schemeCount}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-white/50">Top funding</dt>
                    <dd className="font-semibold">{item.topFunding}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-white/50">Best interest rate</dt>
                    <dd className="font-semibold">
                      {item.interestRate !== null && item.interestRate !== undefined
                        ? `${item.interestRate}%`
                        : 'Grant / Not stated'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-white/50">Prominent sector</dt>
                    <dd className="font-semibold">{item.prominentSector || 'General'}</dd>
                  </div>
                </dl>

                {item.sampleScheme && (
                  <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-white/70">
                    <p className="font-semibold text-white">{item.sampleScheme.title}</p>
                    <p className="line-clamp-3">{item.sampleScheme.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


