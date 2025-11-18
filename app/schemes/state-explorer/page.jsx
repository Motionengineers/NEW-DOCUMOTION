import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import StateSearch from '@/components/StateSearch';

export const metadata = {
  title: 'State-Wise Funding Explorer • Documotion',
  description:
    'Compare state incentives, grants, and subsidies to decide where to build and scale your startup.',
};

function StateSearchFallback() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center text-white/60">Loading state funding explorer...</div>
    </div>
  );
}

export default function StateFundingExplorerPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.2),_transparent_55%),#03040a] text-white">
      <Navbar />
      <main className="mx-auto max-w-6xl space-y-10 px-4 py-10 md:px-6">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/40 bg-blue-500/10 px-3 py-1 text-xs uppercase tracking-[0.4em] text-blue-200">
            Funding Intelligence
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold md:text-5xl">State-Wise Funding Explorer</h1>
            <p className="max-w-2xl text-base text-white/70 md:text-lg">
              Every Indian state offers unique incentives. Compare grants, tax breaks, and interest
              subsidies to choose where to register, expand, or raise your next manufacturing line.
            </p>
          </div>
        </header>

        <Suspense fallback={<StateSearchFallback />}>
          <StateSearch />
        </Suspense>
      </main>
    </div>
  );
}


