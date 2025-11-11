'use client';

import { motion } from 'framer-motion';

export default function StatsCard({ title, value }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-6 rounded-xl hover:scale-[1.02] transition-transform"
    >
      <div className="text-sm font-medium opacity-80 mb-2">{title}</div>
      <div className="text-3xl font-bold" style={{ color: 'var(--system-blue)' }}>
        {value?.toLocaleString() || '0'}
      </div>
    </motion.div>
  );
}
