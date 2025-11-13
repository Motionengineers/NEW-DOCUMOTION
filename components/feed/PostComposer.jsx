'use client';

import { useState } from 'react';
import { Loader2, Sparkles, UploadCloud } from 'lucide-react';
import clsx from 'clsx';

const MAX_CHARACTERS = 1000;

export default function PostComposer({ onCreate }) {
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [professional, setProfessional] = useState(false);
  const [stage, setStage] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const remaining = MAX_CHARACTERS - body.length;
  const disabled = submitting || (!body.trim() && !mediaUrl.trim() && !linkUrl.trim());

  async function handleSubmit(event) {
    event.preventDefault();
    if (disabled) return;

    try {
      setSubmitting(true);
      setStatus(null);

      const payload = {
        body,
        tags,
        mediaUrl: mediaUrl || undefined,
        linkUrl: linkUrl || undefined,
        professional,
        stage: stage || undefined,
        industry: industry || undefined,
        location: location || undefined,
      };

      const response = await fetch('/api/feed/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Unable to publish post');
      }

      setBody('');
      setTags('');
      setMediaUrl('');
      setLinkUrl('');
      setProfessional(false);
      setStage('');
      setIndustry('');
      setLocation('');
      setStatus({ variant: 'success', message: 'Post published' });
      onCreate?.(json.data);
    } catch (error) {
      console.error('PostComposer', error);
      setStatus({ variant: 'error', message: error.message || 'Something went wrong' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-xl backdrop-blur"
    >
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Share an update</h2>
          <p className="text-xs text-slate-400">
            Celebrate milestones, launches, or insights with founders across the Documotion network.
          </p>
        </div>
        <button
          type="button"
          className={clsx(
            'inline-flex items-center gap-2 rounded-full border border-emerald-400/30 px-3 py-1 text-[11px] uppercase tracking-[0.3em] transition',
            professional
              ? 'bg-emerald-500/20 text-emerald-100'
              : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
          )}
          onClick={() => setProfessional(prev => !prev)}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Professional
        </button>
      </header>

      <div className="space-y-4">
        <textarea
          value={body}
          onChange={event => setBody(event.target.value.slice(0, MAX_CHARACTERS))}
          placeholder="Share a milestone, product launch, or insight..."
          rows={4}
          className="w-full resize-y rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-400/70 focus:outline-none"
        />
        <div className="flex flex-wrap gap-3 text-xs text-slate-400">
          <span>{remaining} characters left</span>
          {professional ? (
            <span className="text-emerald-200">Professional badge enabled</span>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Tags</label>
          <input
            value={tags}
            onChange={event => setTags(event.target.value)}
            placeholder="#funding, #productlaunch"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-400/70 focus:outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Media URL (optional)
          </label>
          <div className="relative">
            <UploadCloud className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={mediaUrl}
              onChange={event => setMediaUrl(event.target.value)}
              placeholder="https://example.com/image.png"
              className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-400/70 focus:outline-none"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Link (optional)
          </label>
          <input
            value={linkUrl}
            onChange={event => setLinkUrl(event.target.value)}
            placeholder="https://yourlaunch.com"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-400/70 focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-3 gap-3 text-xs text-white">
          <select
            value={stage}
            onChange={event => setStage(event.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 focus:border-blue-400/60 focus:outline-none"
          >
            <option value="">Stage</option>
            <option value="idea">Idea</option>
            <option value="pre-seed">Pre-seed</option>
            <option value="seed">Seed</option>
            <option value="series-a">Series A</option>
            <option value="growth">Growth</option>
          </select>
          <select
            value={industry}
            onChange={event => setIndustry(event.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 focus:border-blue-400/60 focus:outline-none"
          >
            <option value="">Industry</option>
            <option value="fintech">Fintech</option>
            <option value="saas">SaaS</option>
            <option value="healthtech">Healthtech</option>
            <option value="climatetech">Climate</option>
            <option value="ai">AI</option>
          </select>
          <input
            value={location}
            onChange={event => setLocation(event.target.value)}
            placeholder="Location"
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 placeholder:text-slate-500 focus:border-blue-400/60 focus:outline-none"
          />
        </div>
      </div>

      {status ? (
        <div
          className={clsx(
            'rounded-2xl px-4 py-2 text-xs',
            status.variant === 'success'
              ? 'border border-emerald-400/30 bg-emerald-400/10 text-emerald-100'
              : 'border border-rose-400/30 bg-rose-400/10 text-rose-100'
          )}
        >
          {status.message}
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={disabled}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/40 transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Publish update
        </button>
      </div>
    </form>
  );
}
