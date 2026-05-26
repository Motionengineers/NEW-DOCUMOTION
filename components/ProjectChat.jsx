'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { AlertCircle } from 'lucide-react';

export default function ProjectChat({ requestId, currentUserId, currentUserType }) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null); // New state for error messages
  const sendControllerRef = useRef(null); // Ref to store AbortController for send request

  const load = useCallback(
    async signal => {
      if (!requestId) return;
      try {
        const res = await fetch(`/api/agency-requests/${requestId}/messages`, {
          signal,
          headers: {
            Authorization: `Bearer ${session?.accessToken || ''}`,
          },
        });
        if (!res.ok) {
          throw new Error(`Failed to load messages (${res.status})`);
        }
        const data = await res.json();
        setMessages(data.list || []);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Failed to load messages', error);
        }
      }
    },
    [requestId, session?.accessToken]
  );

  async function send() {
    if (!input.trim() || sending) return;

    const messageToSend = input.trim();
    setSending(true);
    setError(null);
    setInput('');

    sendControllerRef.current = new AbortController();

    try {
      const response = await fetch(`/api/agency-requests/${requestId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken || ''}`,
        },
        body: JSON.stringify({
          senderId: currentUserId,
          senderType: currentUserType,
          message: messageToSend,
        }),
        signal: sendControllerRef.current.signal,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send message');
      }

      load();
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('Failed to send message', err);
      setError(err.message || 'Failed to send message. Please try again.');
      setInput(messageToSend);
    } finally {
      setSending(false);
      sendControllerRef.current = null; // Clear controller reference
    }
  }

  useEffect(() => {
    if (!requestId) return;

    const controller = new AbortController();
    load(controller.signal);

    const t = setInterval(() => load(controller.signal), 5000);

    return () => {
      clearInterval(t);
      controller.abort();
      // Abort any pending send request if component unmounts
      if (sendControllerRef.current) {
        sendControllerRef.current.abort();
      }
    };
  }, [load, requestId]);

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
      {error && (
        <div className="mb-3 p-3 rounded-lg flex items-center gap-2 text-sm bg-red-500/10 text-red-500 border border-red-500/20">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
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
          disabled={sending || !input.trim()}
          className="px-4 py-2 rounded-lg font-medium disabled:opacity-50"
          style={{ backgroundColor: 'var(--system-blue)', color: '#fff' }}
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
