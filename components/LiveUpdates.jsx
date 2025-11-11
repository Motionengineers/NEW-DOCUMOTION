'use client';

import { useEffect, useState } from 'react';

export default function LiveUpdates() {
  const [items, setItems] = useState([]);

  async function load() {
    try {
      const res = await fetch('/api/live-updates');
      const data = await res.json();
      setItems(data.feed || []);
    } catch (e) {
      console.error('live updates failed', e);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="glass p-4 rounded-xl" role="region" aria-label="Live updates">
      <h4 className="font-semibold mb-2">Latest Updates</h4>
      <ul className="space-y-2" aria-live="polite">
        {items.map(i => (
          <li key={i.id} className="text-sm">
            <a href={i.link} className="text-blue-300" aria-label={`Open update: ${i.title}`}>
              {i.title}
            </a>
            <div className="text-xs opacity-70">{new Date(i.time).toLocaleString()}</div>
          </li>
        ))}
        {items.length === 0 && <li className="text-sm opacity-70">No updates</li>}
      </ul>
    </div>
  );
}
