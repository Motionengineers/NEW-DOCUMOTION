import React, { useEffect } from 'react';
import clsx from 'clsx';
import { track } from '@/lib/telemetry';

export default function StateFundingCard({ scheme, onSelect, highlighted }) {
  const [saved, setSaved] = React.useState(false);
  
  // Track scheme view when card is rendered
  useEffect(() => {
    if (scheme) {
      track('scheme.view', {
        schemeId: scheme.id,
        state: scheme.state?.name,
        stateId: scheme.stateId,
        sector: scheme.sector,
      });
    }
  }, [scheme]);

  if (!scheme) return null;

  const badgeColor =
    scheme.status === 'Active'
      ? 'bg-green-500/15 text-green-300 border border-green-400/30'
      : 'bg-amber-500/15 text-amber-200 border border-amber-400/30';

  return (
    <div
      className={clsx(
        'rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur transition hover:border-white/30',
        highlighted && 'ring-2 ring-blue-400/60'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-white/60">
            {scheme.state?.abbreviation || scheme.state?.name || 'State Scheme'}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-white">{scheme.title}</h3>
        </div>
        <span className={clsx('rounded-full px-3 py-1 text-xs', badgeColor)}>{scheme.status}</span>
      </div>

      <p className="mt-3 text-sm text-white/70">{scheme.description}</p>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm text-white/80">
        <div>
          <dt className="text-xs uppercase tracking-wide text-white/50">Funding Amount</dt>
          <dd className="font-medium">{scheme.fundingAmount || '—'}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-white/50">Interest Subsidy</dt>
          <dd className="font-medium">
            {scheme.interestRate !== null && scheme.interestRate !== undefined
              ? `${scheme.interestRate}%`
              : '—'}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-white/50">Sector Focus</dt>
          <dd className="font-medium">{scheme.sector || 'General'}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-white/50">Eligibility</dt>
          <dd className="font-medium text-sm text-white/70">
            {scheme.eligibility ? scheme.eligibility.slice(0, 120) + (scheme.eligibility.length > 120 ? '…' : '') : 'See policy'}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-3">
        {scheme.applyLink && (
          <a
            href={scheme.applyLink}
            target="_blank"
            rel="noreferrer"
            onClick={() => {
              track('scheme.apply_click', {
                schemeId: scheme.id,
                url: scheme.applyLink,
                state: scheme.state?.name,
                sector: scheme.sector,
              });
            }}
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white hover:border-white/60"
          >
            Apply
          </a>
        )}
        {scheme.officialLink && (
          <a
            href={scheme.officialLink}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/80 hover:text-white"
          >
            Policy PDF
          </a>
        )}
        <button
          type="button"
          onClick={() => {
            track('scheme.save', { schemeId: scheme.id, stateId: scheme.stateId });
            setSaved(true);
          }}
          className={clsx(
            'rounded-full border border-white/15 px-4 py-2 text-sm',
            saved ? 'text-emerald-300 border-emerald-400/40' : 'text-white/80'
          )}
        >
          {saved ? 'Saved' : 'Save'}
        </button>
        {onSelect && (
          <button
            type="button"
            onClick={() => onSelect(scheme)}
            className="rounded-full border border-blue-400/60 px-4 py-2 text-sm text-blue-200 hover:bg-blue-500/10"
          >
            Compare
          </button>
        )}
      </div>
    </div>
  );
}


