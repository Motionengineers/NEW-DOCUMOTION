'use client';

import { useEffect, useState } from 'react';

export default function FreeModeBadge() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isFreeMode =
      process.env.NEXT_PUBLIC_FREE_MODE === 'true' ||
      localStorage.getItem('free-mode') === 'true';
    const hidden = localStorage.getItem('free-mode-badge-hidden') === '1';
    setVisible(isFreeMode && !hidden);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="flex items-center gap-3 rounded-full bg-emerald-600 px-4 py-2 text-white shadow-lg">
        <span className="text-sm font-semibold">Free Mode</span>
        <button
          type="button"
          aria-label="Hide free mode badge"
          className="text-white/80 hover:text-white"
          onClick={() => {
            localStorage.setItem('free-mode-badge-hidden', '1');
            setVisible(false);
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
