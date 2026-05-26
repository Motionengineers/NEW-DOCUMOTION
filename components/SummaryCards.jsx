'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import StatsCard from './StatsCard';
import { motion } from 'framer-motion';
import SkeletonLoader from './SkeletonLoader';
import { AlertCircle, RefreshCw, Inbox } from 'lucide-react';
import Button from './Button';

const PRIMARY_KEYS = ['Govt Schemes', 'Bank Schemes', 'Talent Profiles', 'Pitch Decks'];
const SECONDARY_KEYS = [
  'Registrations',
  'Govt Loans',
  'Private Banks',
  'Venture Debt',
  'Updated Today',
];

export default function SummaryCards() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const load = useCallback(async signal => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/dashboard', { signal });
      const json = await res.json();

      if (json.success && json.data) {
        const newStats = {
          'Govt Schemes': json.data.schemes || 0,
          'Bank Schemes': json.data.banks || 0,
          'Talent Profiles': json.data.talent || 0,
          'Pitch Decks': json.data.pitchdecks || 0,
          Registrations: json.data.registrations || 0,
          'Govt Loans': json.data.govtLoans || 0,
          'Private Banks': json.data.privateBanks || 0,
          'Venture Debt': json.data.ventureDebt || 0,
          'Updated Today': json.data.updatedToday || 0,
        };

        // Only update state if the data has actually changed to prevent unnecessary re-renders
        setStats(prevStats => {
          if (!prevStats) return newStats;

          const isIdentical = Object.keys(newStats).every(key => prevStats[key] === newStats[key]);

          if (isIdentical) return prevStats;
          return newStats;
        });

        setRetryCount(0); // Reset retry count on success
      } else {
        throw new Error(json.error || 'Failed to load dashboard data');
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error('Failed to fetch dashboard', e);
        setError(e.message || 'Failed to load dashboard data');
        setStats({
          'Govt Schemes': 0,
          'Bank Schemes': 0,
          'Talent Profiles': 0,
          'Pitch Decks': 0,
          Registrations: 0,
          'Govt Loans': 0,
          'Private Banks': 0,
          'Venture Debt': 0,
          'Updated Today': 0,
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRetry = () => {
    const controller = new AbortController();
    setRetryCount(prev => prev + 1);
    load(controller.signal);
    // Note: We don't store this controller because it's a one-off manual trigger,
    // but providing the signal prevents potential undefined errors.
  };

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);

    const id = setInterval(() => load(controller.signal), 60_000);

    return () => {
      controller.abort();
      clearInterval(id);
    };
  }, [load]);

  // Empty state check
  const hasData = useMemo(() => {
    return stats && Object.values(stats).some(val => val > 0);
  }, [stats]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Error Banner */}
      {error && (
        <div
          className="mb-6 p-4 rounded-xl border flex items-center justify-between"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: 'rgba(239, 68, 68, 0.3)',
          }}
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <p className="font-semibold text-red-600">Failed to load dashboard</p>
              <p className="text-sm text-red-500/80">{error}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${retryCount > 0 ? 'animate-spin' : ''}`} />
            Retry
          </Button>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonLoader key={i} type="stats" />
          ))}
        </div>
      )}

      {!loading && stats && hasData && (
        <div className="space-y-8">
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            role="list"
            aria-label="Dashboard summary cards"
          >
            {PRIMARY_KEYS.map(k => (
              <div role="listitem" key={k}>
                <StatsCard title={k} value={stats[k]} />
              </div>
            ))}
          </div>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6"
            role="list"
            aria-label="Bank scheme details"
          >
            {SECONDARY_KEYS.map(k => (
              <div role="listitem" key={k}>
                <StatsCard title={k} value={stats[k]} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && stats && !hasData && (
        <div
          className="p-12 rounded-xl border text-center"
          style={{
            backgroundColor: 'var(--system-secondary-background)',
            borderColor: 'var(--separator)',
          }}
        >
          <div className="flex flex-col items-center gap-4">
            <div
              className="p-4 rounded-full"
              style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
            >
              <Inbox className="h-12 w-12" style={{ color: 'var(--system-blue)' }} />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--label)' }}>
                No data available yet
              </h3>
              <p className="text-sm mb-4" style={{ color: 'var(--secondary-label)' }}>
                Your dashboard will populate as you use DOCUMOTION. Start by exploring schemes or
                uploading documents.
              </p>
              <Button variant="primary" size="md" onClick={() => load()} loading={loading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
