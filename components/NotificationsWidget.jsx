'use client';

import { useEffect, useState } from 'react';

export default function NotificationsWidget({ userId = null }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchNotes = async signal => {
      try {
        const res = await fetch(`/api/notifications?userId=${userId || ''}`, { signal });
        if (!res.ok) {
          throw new Error(`Failed to load notifications (${res.status})`);
        }
        const data = await res.json();
        setNotes(data.notes || []);
      } catch (error) {
        if (error.name !== 'AbortError') console.error('Failed to load notifications', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId === null) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchNotes(controller.signal);
    const iv = setInterval(() => fetchNotes(controller.signal), 30000);

    return () => {
      controller.abort();
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

      {loading ? (
        <div className="flex items-center justify-center py-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      ) : (
        notes.length === 0 && <p className="text-sm opacity-60">No new notifications.</p>
      )}

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
