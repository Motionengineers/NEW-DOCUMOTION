'use client';

import { useEffect, useState, useCallback } from 'react';
import { formatDate } from '@/lib/utils';

export default function LiveUpdates() {
  const [items, setItems] = useState([]);

  const load = useCallback(async signal => {
    try {
      const res = await fetch('/api/live-updates', { signal });
      const data = await res.json();
      setItems(data.feed || []);
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error('live updates failed', e);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    const id = setInterval(() => load(controller.signal), 60_000);
    return () => {
      clearInterval(id);
      controller.abort();
    };
  }, [load]);

  return (
    <div className="glass p-4 rounded-xl" role="region" aria-label="Live updates">
      <h4 className="font-semibold mb-2">Latest Updates</h4>
      <ul className="space-y-2" aria-live="polite">
        {items.map(i => (
          <li key={i.id} className="text-sm">
            <a
              href={i.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-300 hover:underline transition-all"
              aria-label={`Open update: ${i.title}`}
            >
              {i.title}
            </a>
            <div className="text-xs opacity-70">{formatDate(i.time, 'dateTime')}</div>
          </li>
        ))}
        {items.length === 0 && <li className="text-sm opacity-70">No updates</li>}
      </ul>
    </div>
  );
}
