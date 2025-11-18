'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Zap,
  Database,
  Users,
  Rocket,
  FileText,
  Calendar,
} from 'lucide-react';

export default function UsageDashboard() {
  const [usage, setUsage] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUsage();
  }, []);

  async function loadUsage() {
    try {
      setLoading(true);
      const res = await fetch('/api/subscription/usage');
      const json = await res.json();
      if (json.success) {
        setUsage(json.usage);
        setSubscription(json.subscription);
      } else {
        setError(json.error || 'Failed to load usage');
      }
    } catch (e) {
      setError('Unable to load usage data');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="glass rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-1/3"></div>
          <div className="h-32 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass rounded-2xl p-6 border border-red-500/20">
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      key: 'auto_apply_workflows',
      label: 'Auto-Apply Workflows',
      icon: Rocket,
      color: 'blue',
    },
    {
      key: 'ai_parsing_pages',
      label: 'AI Parsing Pages',
      icon: FileText,
      color: 'purple',
    },
    {
      key: 'storage_gb',
      label: 'Storage (GB)',
      icon: Database,
      color: 'green',
    },
    {
      key: 'partner_bookings',
      label: 'Partner Bookings',
      icon: Users,
      color: 'orange',
    },
    {
      key: 'team_seats',
      label: 'Team Seats',
      icon: Users,
      color: 'pink',
    },
    {
      key: 'ai_actions',
      label: 'AI Actions',
      icon: Zap,
      color: 'yellow',
    },
  ];

  function getUsagePercentage(metric) {
    if (!metric || metric.limit === null) return null;
    return Math.min(100, Math.round((metric.current / metric.limit) * 100));
  }

  function getStatusColor(percentage) {
    if (percentage === null) return 'text-slate-400';
    if (percentage >= 90) return 'text-red-400';
    if (percentage >= 70) return 'text-yellow-400';
    return 'text-green-400';
  }

  function getColorClasses(color) {
    const colors = {
      blue: 'from-blue-500 to-blue-600 bg-blue-500/20 text-blue-400',
      purple: 'from-purple-500 to-purple-600 bg-purple-500/20 text-purple-400',
      green: 'from-green-500 to-green-600 bg-green-500/20 text-green-400',
      orange: 'from-orange-500 to-orange-600 bg-orange-500/20 text-orange-400',
      pink: 'from-pink-500 to-pink-600 bg-pink-500/20 text-pink-400',
      yellow: 'from-yellow-500 to-yellow-600 bg-yellow-500/20 text-yellow-400',
    };
    return colors[color] || colors.blue;
  }

  return (
    <div className="space-y-6">
      {/* Subscription Info */}
      {subscription && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 border border-white/5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Current Plan: {subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)}
              </h3>
              <p className="text-sm text-slate-400">
                Billing: {subscription.billingCycle} • Status: {subscription.status}
              </p>
            </div>
            {subscription.expiresAt && (
              <div className="text-right">
                <p className="text-xs text-slate-400 mb-1">Expires</p>
                <p className="text-sm font-medium text-white">
                  {new Date(subscription.expiresAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Usage Metrics */}
      <div className="grid md:grid-cols-2 gap-6">
        {metrics.map((metric, idx) => {
          const data = usage?.[metric.key];
          const percentage = getUsagePercentage(data);
          const Icon = metric.icon;
          const colorClasses = getColorClasses(metric.color);

          if (!data) return null;

          return (
            <motion.div
              key={metric.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass rounded-2xl p-6 border border-white/5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${colorClasses.split(' ')[2]}`}>
                    <Icon className={`h-5 w-5 ${colorClasses.split(' ')[3]}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{metric.label}</h4>
                    <p className="text-xs text-slate-400">
                      {data.current} {data.limit !== null ? `of ${data.limit}` : 'used'}
                    </p>
                  </div>
                </div>
                {percentage !== null && (
                  <span className={`text-sm font-semibold ${getStatusColor(percentage)}`}>
                    {percentage}%
                  </span>
                )}
              </div>

              {percentage !== null ? (
                <div className="space-y-2">
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.1 }}
                      className={`h-full bg-gradient-to-r ${colorClasses.split(' ').slice(0, 2).join(' ')} rounded-full`}
                    />
                  </div>
                  {percentage >= 90 && (
                    <p className="text-xs text-yellow-400 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Approaching limit
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>Unlimited</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass rounded-2xl p-6 border border-white/5"
      >
        <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <a
            href="/subscription/upgrade"
            className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition text-sm font-medium"
          >
            Upgrade Plan
          </a>
          <a
            href="/subscription/addons"
            className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition text-sm font-medium"
          >
            Buy Add-ons
          </a>
          <a
            href="/subscription/invoices"
            className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition text-sm font-medium"
          >
            View Invoices
          </a>
        </div>
      </motion.div>
    </div>
  );
}
