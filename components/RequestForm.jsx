'use client';

import { useState } from 'react';

export default function RequestForm({ agencyId, startupId, onSubmitted }) {
  const [serviceType, setServiceType] = useState('Logo Design');
  const [budget, setBudget] = useState('');
  const [timeline, setTimeline] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/agency-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agencyId,
          startupId,
          serviceType,
          budget: budget ? parseInt(budget) : null,
          timeline,
          message,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to submit');
      onSubmitted?.(json.request);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--label)' }}>
          Service Needed
        </label>
        <input
          className="w-full px-4 py-3 min-h-[48px] rounded-lg"
          style={{
            backgroundColor: 'var(--system-secondary-background)',
            color: 'var(--label)',
            border: '1px solid var(--separator)',
          }}
          value={serviceType}
          onChange={e => setServiceType(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--label)' }}>
          Budget (₹)
        </label>
        <input
          type="number"
          className="w-full px-4 py-3 min-h-[48px] rounded-lg"
          style={{
            backgroundColor: 'var(--system-secondary-background)',
            color: 'var(--label)',
            border: '1px solid var(--separator)',
          }}
          value={budget}
          onChange={e => setBudget(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--label)' }}>
          Timeline
        </label>
        <input
          className="w-full px-4 py-3 min-h-[48px] rounded-lg"
          style={{
            backgroundColor: 'var(--system-secondary-background)',
            color: 'var(--label)',
            border: '1px solid var(--separator)',
          }}
          value={timeline}
          onChange={e => setTimeline(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--label)' }}>
          Message
        </label>
        <textarea
          rows={4}
          className="w-full px-4 py-2 rounded-lg"
          style={{
            backgroundColor: 'var(--system-secondary-background)',
            color: 'var(--label)',
            border: '1px solid var(--separator)',
          }}
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
      </div>
      {error && (
        <div
          className="p-3 rounded"
          style={{ backgroundColor: 'rgba(255,59,48,.12)', color: 'var(--system-red)' }}
        >
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-3 min-h-[48px] rounded-lg font-medium transition-all"
        style={{
          backgroundColor: 'var(--system-blue)',
          color: '#fff',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? 'Submitting...' : 'Submit Request'}
      </button>
    </form>
  );
}
