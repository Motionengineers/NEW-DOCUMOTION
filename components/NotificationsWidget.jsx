'use client';

import { useEffect, useState } from 'react';

export default function NotificationsWidget({ userId = null }) {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    let unsubscribed = false;
    const fetchNotes = async () => {
      try {
        const res = await fetch(`/api/notifications?userId=${userId || ''}`);
        if (!res.ok) {
          throw new Error(`Failed to load notifications (${res.status})`);
        }
        const data = await res.json();
        if (!unsubscribed) {
          setNotes(data.notes || []);
        }
      } catch (error) {
        if (!unsubscribed) {
          console.error('Failed to load notifications', error);
        }
      }
    };

    fetchNotes();
    const iv = setInterval(fetchNotes, 30000);
    return () => {
      unsubscribed = true;
      clearInterval(iv);
    };
  }, [userId]);

  async function markRead(id) {
    await fetch('/api/notifications/read', {
      method: 'POST',
      body: JSON.stringify({ id }),
      headers: { 'Content-Type': 'application/json' },
    });
    setNotes(prev => prev.filter(n => n.id !== id));
  }

  return (
    <div className="glass p-4 rounded-lg w-80 max-h-96 overflow-auto">
      <h4 className="font-semibold mb-2">Notifications</h4>

      {notes.length === 0 && <p className="text-sm opacity-60">No new notifications.</p>}

      <div className="space-y-3">
        {notes.map(n => (
          <div key={n.id} className="p-2 border-b border-white/10 text-sm">
            <div className="font-semibold">{n.title}</div>
            <div className="opacity-80">{n.body}</div>
            {n.link && (
              <a className="text-blue-300 text-xs" href={n.link}>
                Open →
              </a>
            )}

            <button onClick={() => markRead(n.id)} className="mt-1 text-xs text-green-300">
              Mark Read
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
