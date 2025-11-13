import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';

const defaultData = [
  { month: 'Jan', volume: 32, valuation: 420, velocity: 12 },
  { month: 'Feb', volume: 28, valuation: 390, velocity: 11 },
  { month: 'Mar', volume: 36, valuation: 512, velocity: 15 },
  { month: 'Apr', volume: 42, valuation: 548, velocity: 18 },
  { month: 'May', volume: 39, valuation: 530, velocity: 17 },
  { month: 'Jun', volume: 45, valuation: 610, velocity: 20 },
  { month: 'Jul', volume: 52, valuation: 670, velocity: 22 },
];

const metricConfig = {
  volume: { key: 'volume', label: 'Deal volume', color: '#60a5fa' },
  valuation: { key: 'valuation', label: 'Avg valuation ($M)', color: '#34d399' },
  velocity: { key: 'velocity', label: 'Pipeline velocity (weeks)', color: '#fbbf24' },
};

export default function GlassMotionChart({ data = defaultData, metric = 'volume' }) {
  const [activeMetric, setActiveMetric] = useState(metric);
  const chartData = useMemo(() => data, [data]);
  const config = metricConfig[activeMetric];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur"
      style={{ boxShadow: '0 20px 60px rgba(15, 23, 42, 0.35)' }}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Glass Motion Chart</h3>
          <p className="text-sm text-blue-100/70">
            Market signals for founders, VCs, accelerators, and strategic buyers.
          </p>
        </div>
        <div className="flex gap-2">
          {Object.entries(metricConfig).map(([key, entry]) => (
            <button
              key={key}
              onClick={() => setActiveMetric(key)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                activeMetric === key
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-blue-100/70 hover:bg-white/10'
              }`}
            >
              {entry.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={config.color} stopOpacity={0.45} />
                <stop offset="100%" stopColor={config.color} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
            <XAxis dataKey="month" stroke="rgba(226, 232, 240, 0.7)" />
            <YAxis stroke="rgba(226, 232, 240, 0.7)" />
            <Tooltip
              contentStyle={{
                background: 'rgba(15, 23, 42, 0.85)',
                borderRadius: '12px',
                border: '1px solid rgba(148, 163, 184, 0.2)',
              }}
              labelStyle={{ color: '#e2e8f0' }}
              itemStyle={{ color: config.color }}
            />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ color: '#cbd5f5' }} />
            <Area
              type="monotone"
              dataKey={config.key}
              stroke={config.color}
              fillOpacity={1}
              fill="url(#colorMetric)"
              strokeWidth={3}
              isAnimationActive
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <StatCard title="Active deals" value="52" helper="Past 30 days" />
        <StatCard title="Average valuation" value="$670M" helper="+9% vs prior" />
        <StatCard title="Velocity" value="22 weeks" helper="Median close time" />
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, helper }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-blue-100"
    >
      <p className="text-xs uppercase tracking-[0.3em] text-blue-100/60">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-blue-100/60">{helper}</p>
    </motion.div>
  );
}
