'use client';

import { motion } from 'framer-motion';

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`glass rounded-xl p-6 ${className}`}>
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-white/10 rounded w-3/4"></div>
        <div className="h-4 bg-white/10 rounded w-1/2"></div>
        <div className="h-20 bg-white/10 rounded"></div>
      </div>
    </div>
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
          className="h-4 bg-white/10 rounded"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}

export function SkeletonStatsCard({ className = '' }) {
  return (
    <div className={`glass rounded-xl p-6 ${className}`}>
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-white/10 rounded w-1/2"></div>
        <div className="h-8 bg-white/10 rounded w-1/3"></div>
        <div className="h-3 bg-white/10 rounded w-2/3"></div>
      </div>
    </div>
  );
}

export function SkeletonList({ items = 5, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="glass rounded-lg p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-white/10 rounded w-3/4"></div>
            <div className="h-3 bg-white/10 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SkeletonLoader({ type = 'card', ...props }) {
  switch (type) {
    case 'card':
      return <SkeletonCard {...props} />;
    case 'text':
      return <SkeletonText {...props} />;
    case 'stats':
      return <SkeletonStatsCard {...props} />;
    case 'list':
      return <SkeletonList {...props} />;
    default:
      return <SkeletonCard {...props} />;
  }
}
