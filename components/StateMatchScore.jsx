'use client';

import React, { useState } from 'react';
import { track } from '@/lib/telemetry';

const STAGE_OPTIONS = [
  { value: 'idea', label: 'Idea / R&D' },
  { value: 'prototype', label: 'Prototype' },
  { value: 'seed', label: 'Seed' },
  { value: 'pre-series-a', label: 'Pre-Series A' },
  { value: 'growth', label: 'Growth' },
];

const BENEFIT_TYPES = [
  { value: 'grant', label: 'Grants & subsidies' },
  { value: 'loan', label: 'Low-interest loans' },
  { value: 'tax', label: 'Tax incentives' },
];

export default function StateMatchScore({ data, loading, onSubmit }) {
  const [form, setForm] = useState({
    industry: '',
    stage: 'seed',
    registeredState: '',
    preferredBenefit: 'grant',
    requiredFunding: '',
    prefersGrant: true,
  });

  const recommendations = data?.recommendations ?? [];

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const profile = {
      ...form,
      requiredFunding: form.requiredFunding ? Number(form.requiredFunding.replace(/[,₹\s]/g, '')) : null,
    };
    track('match.run', {
      profile: {
        industry: profile.industry,
        stage: profile.stage,
        requiredFunding: profile.requiredFunding,
        registeredState: profile.registeredState,
        prefersGrant: profile.prefersGrant,
        preferredBenefit: profile.preferredBenefit,
      },
    });
    onSubmit?.(profile);
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-blue-900/40 via-indigo-900/30 to-slate-900/60 p-6 shadow-2xl backdrop-blur">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex-1 space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">AI match score</p>
          <h3 className="text-2xl font-semibold text-white">
            Not sure which state fits best? Get an instant suitability score.
          </h3>
          <p className="text-sm text-white/70">
            Tell us your industry, stage, and benefit preference. We&apos;ll crunch every state policy and
            surface the best matches for your team.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex w-full flex-col gap-3 md:w-1/2"
        >
          <input
            value={form.industry}
            onChange={event => handleChange('industry', event.target.value)}
            placeholder="Industry (e.g., EV, SaaS, Climate)"
            className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-white/50 focus:outline-none"
          />
          <div className="flex flex-col gap-3 md:flex-row">
            <select
              value={form.stage}
              onChange={event => handleChange('stage', event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-white/50 focus:outline-none"
            >
              {STAGE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={form.preferredBenefit}
              onChange={event => handleChange('preferredBenefit', event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-white/50 focus:outline-none"
            >
              {BENEFIT_TYPES.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              value={form.registeredState}
              onChange={event => handleChange('registeredState', event.target.value)}
              placeholder="Registered state (optional)"
              className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-white/50 focus:outline-none"
            />
            <input
              value={form.requiredFunding}
              onChange={event => handleChange('requiredFunding', event.target.value)}
              placeholder="Funding need (₹)"
              className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 focus:border-white/50 focus:outline-none"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-white/80">
            <input
              type="checkbox"
              checked={form.prefersGrant}
              onChange={event => handleChange('prefersGrant', event.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-transparent"
            />
            Prefer grants / subsidies
          </label>
          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-white/90 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Scoring…' : 'Get match score'}
          </button>
        </form>
      </div>

      {data?.error && (
        <div className="mt-4 rounded-2xl border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-100">
          {data.error}
        </div>
      )}

      {!data?.error && recommendations.length > 0 && (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {recommendations.map(reco => (
            <div
              key={reco.state?.id}
              className="rounded-2xl border border-white/10 bg-black/30 p-4 text-white"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                Suitability {reco.matchScore}%
              </p>
              <h4 className="mt-2 text-xl font-semibold">{reco.state?.name}</h4>
              <p className="text-sm text-white/60">{reco.state?.description}</p>
              {reco.explanation && (
                <div className="mt-4 space-y-2 text-xs text-white/70">
                  {reco.explanation.map(item => (
                    <div key={item.key} className="flex justify-between">
                      <span>{item.note}</span>
                      <span>{item.value}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


