'use client';

import { useCallback, useEffect, useState } from 'react';

export default function ProjectChat({ requestId, currentUserId, currentUserType }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const load = useCallback(async () => {
    if (!requestId) return;
    try {
      const res = await fetch(`/api/agency-requests/${requestId}/messages`);
      if (!res.ok) {
        throw new Error(`Failed to load messages (${res.status})`);
      }
      const data = await res.json();
      setMessages(data.list || []);
    } catch (error) {
      console.error('Failed to load messages', error);
    }
  }, [requestId]);

  async function send() {
    if (!input) return;
    await fetch(`/api/agency-requests/${requestId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId: currentUserId,
        senderType: currentUserType,
        message: input,
      }),
    });
    setInput('');
    load();
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [load]);

  return (
    <div className="glass p-4 rounded-xl">
      <div className="space-y-2 max-h-80 overflow-auto">
        {messages.map(m => (
          <div
            key={m.id}
            className={`p-2 rounded-lg w-fit ${m.senderId === currentUserId ? 'ml-auto' : ''}`}
            style={{ backgroundColor: 'var(--system-secondary-background)', color: 'var(--label)' }}
          >
            <div className="text-xs" style={{ color: 'var(--secondary-label)' }}>
              {m.senderType}
            </div>
            <div className="text-sm">{m.message}</div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-sm" style={{ color: 'var(--secondary-label)' }}>
            No messages yet.
          </div>
        )}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg"
          style={{
            backgroundColor: 'var(--system-secondary-background)',
            color: 'var(--label)',
            border: '1px solid var(--separator)',
          }}
          placeholder="Type a message..."
        />
        <button
          onClick={send}
          className="px-4 py-2 rounded-lg font-medium"
          style={{ backgroundColor: 'var(--system-blue)', color: '#fff' }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
