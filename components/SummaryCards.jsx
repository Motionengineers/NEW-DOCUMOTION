'use client';

import { useEffect, useState } from 'react';
import StatsCard from './StatsCard';
import { motion } from 'framer-motion';
import SkeletonLoader from './SkeletonLoader';

export default function SummaryCards() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard');
      const json = await res.json();
      if (json.success) {
        setStats({
          'Govt Schemes': json.schemes,
          'Bank Schemes': json.banks,
          'Talent Profiles': json.talent,
          'Pitch Decks': json.pitchdecks,
          Registrations: json.registrations || 0,
          'Govt Loans': json.govtLoans || 0,
          'Private Banks': json.privateBanks || 0,
          'Venture Debt': json.ventureDebt || 0,
          'Updated Today': json.updatedToday || 0,
        });
      } else {
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
    } catch (e) {
      console.error('Failed to fetch dashboard', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // refresh every 60s for near-live counts
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

  const primaryKeys = ['Govt Schemes', 'Bank Schemes', 'Talent Profiles', 'Pitch Decks'];
  const secondaryKeys = [
    'Registrations',
    'Govt Loans',
    'Private Banks',
    'Venture Debt',
    'Updated Today',
  ];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonLoader key={i} type="stats" />
          ))}
        </div>
      )}

      {!loading && stats && (
        <div className="space-y-8">
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            role="list"
            aria-label="Dashboard summary cards"
          >
            {primaryKeys.map(k => (
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
            {secondaryKeys.map(k => (
              <div role="listitem" key={k}>
                <StatsCard title={k} value={stats[k]} />
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
