'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Sparkles, TrendingUp, AlertCircle, RefreshCw, Inbox } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import Button from '@/components/Button';

export default function BankMatchesSummary() {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/banks/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 3 }),
      });
      if (!res.ok) throw new Error('Request failed');
      const data = await res.json();
      if (data.success) {
        setMatches(data.topPicks || []);
        setRetryCount(0); // Reset retry count on success
      } else {
        throw new Error(data.error || 'Failed to load matches');
      }
    } catch (error) {
      setError(error.message || 'Failed to load bank matches');
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    fetchMatches();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchMatches();
  };

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

      {/* Error State */}
      {error && (
        <div
          className="mt-6 p-4 rounded-xl border flex items-center justify-between"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: 'rgba(239, 68, 68, 0.3)',
          }}
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm font-semibold text-red-600">Failed to load matches</p>
              <p className="text-xs text-red-500/80">{error}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleRetry}>
            <RefreshCw className={`h-4 w-4 mr-2 ${retryCount > 0 ? 'animate-spin' : ''}`} />
            Retry
          </Button>
        </div>
      )}

      {/* Loading State */}
      {loading && !error && (
        <div className="mt-6 flex items-center gap-2 text-sm text-blue-100/70">
          <Loader2 className="h-4 w-4 animate-spin text-blue-300" /> Gathering personalised
          matches...
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && matches.length === 0 && (
        <div className="mt-6 p-8 rounded-xl border text-center" style={{
          backgroundColor: 'rgba(99, 102, 241, 0.05)',
          borderColor: 'rgba(99, 102, 241, 0.2)',
        }}>
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
              <Inbox className="h-8 w-8 text-purple-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-1">No matches yet</p>
              <p className="text-xs text-blue-100/70 mb-4">
                Complete your bank preferences to unlock matched offers tailored to your startup.
              </p>
              <Button variant="outline" size="sm" onClick={handleRetry}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Matches List */}
      {!loading && !error && matches.length > 0 && (
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
      )}
    </GlassCard>
  );
}
