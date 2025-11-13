'use client';

import { useState, useTransition } from 'react';
import { Loader2, Save, ShieldAlert } from 'lucide-react';

const FIELDS = [
  'name',
  'city',
  'state',
  'minBudget',
  'maxBudget',
  'rating',
  'serviceBadges',
  'description',
];

export default function AdminAgencyEditor({ agency }) {
  const [formState, setFormState] = useState(() => {
    const base = {};
    FIELDS.forEach(field => {
      base[field] = agency?.[field] ?? '';
    });
    return {
      ...base,
      verified: Boolean(agency?.verified),
      featured: Boolean(agency?.featured),
      responseTime: agency?.responseTime ?? '',
    };
  });
  const [status, setStatus] = useState({ message: '', variant: 'idle' });
  const [isPending, startTransition] = useTransition();

  const handleChange = (field, value) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = event => {
    event.preventDefault();
    startTransition(async () => {
      try {
        setStatus({ message: '', variant: 'loading' });
        const res = await fetch(`/api/branding/admin/agencies/${agency.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formState.name,
            city: formState.city,
            state: formState.state,
            minBudget: formState.minBudget ? Number(formState.minBudget) : null,
            maxBudget: formState.maxBudget ? Number(formState.maxBudget) : null,
            rating: formState.rating ? Number(formState.rating) : null,
            serviceBadges: formState.serviceBadges,
            description: formState.description,
            verified: formState.verified,
            featured: formState.featured,
            responseTime: formState.responseTime,
          }),
        });
        const payload = await res.json();
        if (!res.ok || !payload.success) {
          throw new Error(payload.error || 'Unable to save agency');
        }
        setStatus({ message: 'Agency updated successfully.', variant: 'success' });
      } catch (error) {
        console.error('Admin update failed:', error);
        setStatus({ message: error.message || 'Failed to update agency.', variant: 'error' });
      }
    });
  };

  if (!agency) {
    return (
      <div
        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm"
        style={{ color: 'var(--secondary-label)' }}
      >
        Agency not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--label)' }}>
          Edit {agency.name}
        </h1>
        {!agency.verified ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-300">
            <ShieldAlert className="h-4 w-4" />
            Not verified
          </span>
        ) : null}
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm" style={{ color: 'var(--label)' }}>
            Agency Name
            <input
              type="text"
              value={formState.name}
              onChange={event => handleChange('name', event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
              style={{ color: 'var(--label)' }}
            />
          </label>
          <label className="space-y-1 text-sm" style={{ color: 'var(--label)' }}>
            City
            <input
              type="text"
              value={formState.city}
              onChange={event => handleChange('city', event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
              style={{ color: 'var(--label)' }}
            />
          </label>
          <label className="space-y-1 text-sm" style={{ color: 'var(--label)' }}>
            State
            <input
              type="text"
              value={formState.state}
              onChange={event => handleChange('state', event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
              style={{ color: 'var(--label)' }}
            />
          </label>
          <label className="space-y-1 text-sm" style={{ color: 'var(--label)' }}>
            Response Time
            <input
              type="text"
              value={formState.responseTime}
              onChange={event => handleChange('responseTime', event.target.value)}
              placeholder="Within 24 hours"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
              style={{ color: 'var(--label)' }}
            />
          </label>

          <label className="space-y-1 text-sm" style={{ color: 'var(--label)' }}>
            Minimum Budget (₹)
            <input
              type="number"
              min="0"
              value={formState.minBudget}
              onChange={event => handleChange('minBudget', event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
              style={{ color: 'var(--label)' }}
            />
          </label>
          <label className="space-y-1 text-sm" style={{ color: 'var(--label)' }}>
            Maximum Budget (₹)
            <input
              type="number"
              min="0"
              value={formState.maxBudget}
              onChange={event => handleChange('maxBudget', event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
              style={{ color: 'var(--label)' }}
            />
          </label>

          <label className="space-y-1 text-sm" style={{ color: 'var(--label)' }}>
            Rating
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={formState.rating}
              onChange={event => handleChange('rating', event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
              style={{ color: 'var(--label)' }}
            />
          </label>
          <label className="space-y-1 text-sm" style={{ color: 'var(--label)' }}>
            Service Badges (comma separated)
            <input
              type="text"
              value={formState.serviceBadges}
              onChange={event => handleChange('serviceBadges', event.target.value)}
              placeholder="Brand Identity, Video Production, Performance Creatives"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
              style={{ color: 'var(--label)' }}
            />
          </label>
        </div>

        <label className="space-y-1 text-sm" style={{ color: 'var(--label)' }}>
          Short Description
          <textarea
            value={formState.description}
            onChange={event => handleChange('description', event.target.value)}
            className="min-h-[120px] w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
            style={{ color: 'var(--label)' }}
          />
        </label>

        <div className="flex flex-wrap items-center gap-4">
          <label
            className="inline-flex items-center gap-2 text-sm"
            style={{ color: 'var(--label)' }}
          >
            <input
              type="checkbox"
              checked={formState.verified}
              onChange={event => handleChange('verified', event.target.checked)}
              className="h-4 w-4 rounded border border-white/20 bg-white/10"
            />
            Verified partner
          </label>
          <label
            className="inline-flex items-center gap-2 text-sm"
            style={{ color: 'var(--label)' }}
          >
            <input
              type="checkbox"
              checked={formState.featured}
              onChange={event => handleChange('featured', event.target.checked)}
              className="h-4 w-4 rounded border border-white/20 bg-white/10"
            />
            Featured priority (pay-to-rank)
          </label>
        </div>

        {status.message ? (
          <div
            className="rounded-xl border px-4 py-3 text-sm"
            style={{
              color: status.variant === 'success' ? 'var(--label)' : '#fecdd3',
              borderColor:
                status.variant === 'success' ? 'rgba(34,197,94,0.4)' : 'rgba(248,113,113,0.4)',
              backgroundColor:
                status.variant === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(248,113,113,0.1)',
            }}
          >
            {status.message}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> Save changes
            </>
          )}
        </button>
      </form>

      <div
        className="space-y-3 rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-sm"
        style={{ color: 'var(--secondary-label)' }}
      >
        <p className="font-semibold" style={{ color: 'var(--label)' }}>
          Service & portfolio management (up next)
        </p>
        <ul className="list-disc pl-5">
          <li>Inline editor for services with pricing tiers.</li>
          <li>Portfolio uploader (image/video) with CDN integration.</li>
          <li>Review moderation and response workflow.</li>
          <li>Lead pipeline view and status updates.</li>
        </ul>
      </div>
    </div>
  );
}
