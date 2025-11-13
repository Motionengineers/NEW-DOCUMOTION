'use client';

import { useState, useTransition } from 'react';
import { Loader2, Send } from 'lucide-react';

const INITIAL_STATE = {
  projectType: '',
  projectScope: '',
  budgetMin: '',
  budgetMax: '',
  timeline: '',
  startDate: '',
  description: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  companyName: '',
  designation: '',
};

function validate(state) {
  const errors = {};
  if (!state.projectType) errors.projectType = 'Please describe the project.';
  if (!state.contactName) errors.contactName = 'Contact name is required.';
  if (!state.contactEmail) errors.contactEmail = 'Contact email is required.';
  if (state.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.contactEmail)) {
    errors.contactEmail = 'Enter a valid email.';
  }
  if (state.budgetMin && state.budgetMax && Number(state.budgetMin) > Number(state.budgetMax)) {
    errors.budgetMax = 'Max budget should be greater than min budget.';
  }
  return errors;
}

export default function AgencyHireForm({ agencyId, agencySlug }) {
  const [formState, setFormState] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ success: false, message: '' });
  const [isPending, startTransition] = useTransition();

  const updateField = (field, value) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = event => {
    event.preventDefault();
    const validation = validate(formState);
    setErrors(validation);
    if (Object.keys(validation).length) {
      return;
    }

    startTransition(async () => {
      try {
        setStatus({ success: false, message: '' });
        const response = await fetch('/api/branding/agencies/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agencyId,
            agencySlug,
            projectType: formState.projectType,
            projectScope: formState.projectScope || undefined,
            budgetMin: formState.budgetMin ? Number(formState.budgetMin) : undefined,
            budgetMax: formState.budgetMax ? Number(formState.budgetMax) : undefined,
            timeline: formState.timeline || undefined,
            startDate: formState.startDate || undefined,
            description: formState.description || undefined,
            contactName: formState.contactName,
            contactEmail: formState.contactEmail,
            contactPhone: formState.contactPhone || undefined,
            companyName: formState.companyName || undefined,
            designation: formState.designation || undefined,
            source: 'branding-hub',
          }),
        });

        const payload = await response.json();
        if (!response.ok || !payload.success) {
          throw new Error(payload.error || 'Unable to submit lead');
        }

        setStatus({ success: true, message: 'Thanks! The agency will reach out within 24 hours.' });
        setFormState(INITIAL_STATE);
      } catch (error) {
        console.error('Hire form submission failed:', error);
        setStatus({
          success: false,
          message: error.message || 'Something went wrong. Try again soon.',
        });
      }
    });
  };

  return (
    <section id="hire" className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--label)' }}>
          Hire this Agency
        </h2>
        <p className="text-sm" style={{ color: 'var(--secondary-label)' }}>
          Share your brief and requirements. Documotion routes the details instantly and keeps your
          information secure.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="glass space-y-6 rounded-3xl border border-white/10 p-6"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm" style={{ color: 'var(--label)' }}>
            Project Type
            <input
              type="text"
              value={formState.projectType}
              onChange={event => updateField('projectType', event.target.value)}
              placeholder="Brand identity, launch campaign, growth retainer..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
              style={{ color: 'var(--label)' }}
              required
            />
            {errors.projectType ? (
              <p className="text-xs text-red-400">{errors.projectType}</p>
            ) : null}
          </label>

          <label className="space-y-1 text-sm" style={{ color: 'var(--label)' }}>
            Company / Startup Name
            <input
              type="text"
              value={formState.companyName}
              onChange={event => updateField('companyName', event.target.value)}
              placeholder="Your startup"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
              style={{ color: 'var(--label)' }}
            />
          </label>

          <label className="space-y-1 text-sm" style={{ color: 'var(--label)' }}>
            Minimum Budget (₹)
            <input
              type="number"
              min="0"
              value={formState.budgetMin}
              onChange={event => updateField('budgetMin', event.target.value)}
              placeholder="₹2,00,000"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
              style={{ color: 'var(--label)' }}
            />
          </label>

          <label className="space-y-1 text-sm" style={{ color: 'var(--label)' }}>
            Maximum Budget (₹)
            <input
              type="number"
              min="0"
              value={formState.budgetMax}
              onChange={event => updateField('budgetMax', event.target.value)}
              placeholder="₹10,00,000"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
              style={{ color: 'var(--label)' }}
            />
            {errors.budgetMax ? <p className="text-xs text-red-400">{errors.budgetMax}</p> : null}
          </label>

          <label className="space-y-1 text-sm" style={{ color: 'var(--label)' }}>
            Ideal Timeline
            <input
              type="text"
              value={formState.timeline}
              onChange={event => updateField('timeline', event.target.value)}
              placeholder="Launch in 6 weeks"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
              style={{ color: 'var(--label)' }}
            />
          </label>

          <label className="space-y-1 text-sm" style={{ color: 'var(--label)' }}>
            Preferred Start Date
            <input
              type="date"
              value={formState.startDate}
              onChange={event => updateField('startDate', event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
              style={{ color: 'var(--label)' }}
            />
          </label>
        </div>

        <label className="space-y-1 text-sm" style={{ color: 'var(--label)' }}>
          Scope & Goals
          <textarea
            value={formState.projectScope}
            onChange={event => updateField('projectScope', event.target.value)}
            placeholder="e.g. Brand identity refresh, launch film, social playbook, performance creatives..."
            className="min-h-[120px] w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
            style={{ color: 'var(--label)' }}
          />
        </label>

        <label className="space-y-1 text-sm" style={{ color: 'var(--label)' }}>
          Additional Context (optional)
          <textarea
            value={formState.description}
            onChange={event => updateField('description', event.target.value)}
            placeholder="Share target metrics, previous work, platforms to prioritise, or references you like."
            className="min-h-[120px] w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
            style={{ color: 'var(--label)' }}
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm" style={{ color: 'var(--label)' }}>
            Contact Name
            <input
              type="text"
              value={formState.contactName}
              onChange={event => updateField('contactName', event.target.value)}
              placeholder="Your name"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
              style={{ color: 'var(--label)' }}
              required
            />
            {errors.contactName ? (
              <p className="text-xs text-red-400">{errors.contactName}</p>
            ) : null}
          </label>

          <label className="space-y-1 text-sm" style={{ color: 'var(--label)' }}>
            Contact Email
            <input
              type="email"
              value={formState.contactEmail}
              onChange={event => updateField('contactEmail', event.target.value)}
              placeholder="you@startup.in"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
              style={{ color: 'var(--label)' }}
              required
            />
            {errors.contactEmail ? (
              <p className="text-xs text-red-400">{errors.contactEmail}</p>
            ) : null}
          </label>

          <label className="space-y-1 text-sm" style={{ color: 'var(--label)' }}>
            Contact Phone / WhatsApp
            <input
              type="tel"
              value={formState.contactPhone}
              onChange={event => updateField('contactPhone', event.target.value)}
              placeholder="+91-98xxxxxxx"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
              style={{ color: 'var(--label)' }}
            />
          </label>

          <label className="space-y-1 text-sm" style={{ color: 'var(--label)' }}>
            Role / Designation
            <input
              type="text"
              value={formState.designation}
              onChange={event => updateField('designation', event.target.value)}
              placeholder="Founder, CMO, Growth Lead..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30"
              style={{ color: 'var(--label)' }}
            />
          </label>
        </div>

        {status.message ? (
          <div
            className="rounded-xl border px-4 py-3 text-sm"
            style={{
              color: status.success ? 'var(--label)' : '#fecdd3',
              borderColor: status.success ? 'rgba(34,197,94,0.4)' : 'rgba(248,113,113,0.4)',
              backgroundColor: status.success ? 'rgba(34,197,94,0.1)' : 'rgba(248,113,113,0.1)',
            }}
          >
            {status.message}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs" style={{ color: 'var(--tertiary-label)' }}>
            We never share your data without consent. NDA-backed submissions available for stealth
            projects.
          </p>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Sending…
              </>
            ) : (
              <>
                Send brief <Send className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
