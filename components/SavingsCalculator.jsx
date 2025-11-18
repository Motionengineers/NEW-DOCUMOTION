'use client';

import React, { useMemo } from 'react';

export default function SavingsCalculator({ schemes = [], requiredFunding = 0 }) {
  const summary = useMemo(() => {
    if (!schemes.length) return null;
    const bestSubsidy = schemes.reduce(
      (best, scheme) => Math.max(best, scheme.subsidyPercent || 0),
      0
    );
    const bestInterest = schemes.reduce((best, scheme) => {
      if (scheme.interestRate == null) return best;
      return Math.min(best, scheme.interestRate);
    }, Number.POSITIVE_INFINITY);

    const estFunding = requiredFunding || schemes[0]?.fundingMax || 0;
    const saved =
      bestSubsidy > 0 ? Math.round((bestSubsidy / 100) * estFunding) : Math.round(estFunding * 0.05);

    return {
      bestSubsidy,
      bestInterest: Number.isFinite(bestInterest) ? bestInterest : null,
      estimatedSavings: saved,
    };
  }, [schemes, requiredFunding]);

  if (!summary) return null;

  return (
    <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-white">
      <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Savings estimator</p>
      <h4 className="mt-2 text-lg font-semibold text-white">
        Potential savings ≈ ₹{summary.estimatedSavings.toLocaleString()}
      </h4>
      <p className="text-white/70">
        Based on the highest subsidy ({summary.bestSubsidy}%)
        {summary.bestInterest != null ? ` and ${summary.bestInterest}% interest options.` : '.'}
      </p>
    </div>
  );
}


