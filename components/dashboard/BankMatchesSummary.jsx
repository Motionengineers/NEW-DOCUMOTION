'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Sparkles, TrendingUp } from 'lucide-react';
import GlassCard from '@/components/GlassCard';

export default function BankMatchesSummary() {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const fetchMatches = async () => {
      try {
        const res = await fetch('/api/banks/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ limit: 3 }),
        });
        if (!res.ok) throw new Error('Request failed');
        const data = await res.json();
        if (!cancelled && data.success) {
          setMatches(data.topPicks || []);
        }
      } catch (error) {
        if (!cancelled) {
          setMatches([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchMatches();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-300" />
          <h3 className="text-lg font-semibold text-white">Bank programmes for you</h3>
        </div>
        <Link href="/bank" className="text-xs font-semibold text-blue-300 hover:text-blue-200">
          View all
        </Link>
      </div>

      {loading ? (
        <div className="mt-6 flex items-center gap-2 text-sm text-blue-100/70">
          <Loader2 className="h-4 w-4 animate-spin text-blue-300" /> Gathering personalised
          matches...
        </div>
      ) : null}

      {!loading && matches.length === 0 ? (
        <p className="mt-4 text-sm text-blue-100/70">
          Complete your bank preferences to unlock matched offers tailored to your startup.
        </p>
      ) : null}

      <ul className="mt-4 space-y-3 text-sm">
        {matches.map(match => (
          <li
            key={match.id}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-blue-100/80"
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-white">{match.bankName}</p>
                <p className="text-xs text-blue-100/60">{match.programName}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-300">
                <TrendingUp className="h-3.5 w-3.5" />
                {match.score}%
              </div>
            </div>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
