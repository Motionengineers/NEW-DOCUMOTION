import React from 'react';
import GlassMotionChart from './GlassMotionChart';

const buyerSegments = [
  { segment: 'Strategic buyers', growth: '+18%', deals: 14 },
  { segment: 'Financial sponsors', growth: '+11%', deals: 21 },
  { segment: 'PE add-ons', growth: '+9%', deals: 8 },
  { segment: 'Cross-border', growth: '+6%', deals: 5 },
];

export default function MotionDashboard() {
  return (
    <div className="space-y-6">
      <GlassMotionChart />

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
        <h3 className="text-lg font-semibold text-white">Buyer segment pulse</h3>
        <p className="text-sm text-blue-100/70">
          Understand who’s driving momentum—strategics vs financial sponsors.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {buyerSegments.map(segment => (
            <div
              key={segment.segment}
              className="rounded-2xl border border-white/10 bg-white/8 p-4 text-sm text-blue-100"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-blue-100/60">
                {segment.segment}
              </p>
              <p className="mt-3 text-2xl font-semibold text-white">{segment.growth}</p>
              <p className="mt-1 text-xs text-blue-100/60">
                Deals quarter-to-date: {segment.deals}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
