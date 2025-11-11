'use client';
import { useEffect, useState } from 'react';

export default function DemoBadge() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const v = localStorage.getItem('demo-badge-hidden');
    if (v === '1') setVisible(false);
  }, []);
  if (!visible) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex items-center gap-3 rounded-full bg-amber-600 text-white shadow-lg px-4 py-2">
        <span className="text-sm font-semibold">Demo Mode</span>
        <button
          aria-label="Hide demo badge"
          className="text-white/80 hover:text-white"
          onClick={() => {
            localStorage.setItem('demo-badge-hidden', '1');
            setVisible(false);
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
