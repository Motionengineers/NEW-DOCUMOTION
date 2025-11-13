'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Users, Target, Rocket, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import InfographicWidget from '@/components/infographics/InfographicWidget';
import { cn } from '@/lib/utils';

const DEFAULT_VARIANT = 'glass';

const percentileColors = [
  'bg-blue-500/20 text-blue-300',
  'bg-emerald-500/20 text-emerald-300',
  'bg-purple-500/20 text-purple-300',
  'bg-amber-500/20 text-amber-300',
];

export default function BusinessCustomerInfographic({ variant: initialVariant = DEFAULT_VARIANT }) {
  const [variant, setVariant] = useState(initialVariant);

  const infographicData = useMemo(
    () => ({
      headline: {
        netRevenue: '₹4.8Cr',
        change: '+18% QoQ',
        retention: '132%',
        payback: '5.4 months',
      },
      funnel: [
        { label: 'Marketing Qualified', value: 4820, conversion: '42%' },
        { label: 'Sales Accepted', value: 2030, conversion: '65%' },
        { label: 'Closed Won', value: 1320, conversion: '64%' },
      ],
      cohorts: [
        { label: 'D2C Founders', percentage: 38 },
        { label: 'SaaS Scale-ups', percentage: 26 },
        { label: 'Healthcare Ops', percentage: 18 },
        { label: 'Fintech Growth', percentage: 12 },
        { label: 'Other', percentage: 6 },
      ],
      expansion: [
        { region: 'Bengaluru', score: 86 },
        { region: 'NCR', score: 81 },
        { region: 'Mumbai', score: 78 },
        { region: 'Hyderabad', score: 74 },
      ],
      spotlight: {
        customer: 'GrowthForge Labs',
        summary:
          'Scaling from ₹12L to ₹1.7Cr ARR in 14 months using Documotion concierge workflows, Razorpay auto-reconciliation, and compliance vault.',
        highlights: [
          'Reduced onboarding queue by 47%',
          'Auto-applied to 9 state grants in one quarter',
          'Achieved 0 SLA breaches in the last 5 months',
        ],
      },
    }),
    []
  );

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p
            className="text-sm uppercase tracking-widest"
            style={{ color: 'var(--tertiary-label)' }}
          >
            Business Customer Insights
          </p>
          <h2 className="text-2xl font-semibold" style={{ color: 'var(--label)' }}>
            Infographic Overview
          </h2>
        </div>
        <div
          className="flex items-center gap-2 rounded-full border px-2 py-1 text-xs"
          style={{ borderColor: 'var(--separator)' }}
        >
          <button
            type="button"
            onClick={() => setVariant('glass')}
            className={cn(
              'px-3 py-1 rounded-full transition-colors',
              variant === 'glass' ? 'bg-blue-500 text-white' : 'hover:bg-white/5'
            )}
          >
            Glass
          </button>
          <button
            type="button"
            onClick={() => setVariant('solid')}
            className={cn(
              'px-3 py-1 rounded-full transition-colors',
              variant === 'solid' ? 'bg-blue-500 text-white' : 'hover:bg-white/5'
            )}
          >
            Solid
          </button>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <InfographicWidget
          variant={variant}
          title="Revenue Engine"
          subtitle="Net Revenue"
          metric={infographicData.headline.netRevenue}
          change={infographicData.headline.change}
          changeTone="positive"
          footer="Net revenue includes GST-compliant invoices auto-issued via Documotion."
        >
          <div
            className="flex items-center gap-3 text-sm"
            style={{ color: 'var(--secondary-label)' }}
          >
            <Users className="h-5 w-5 text-blue-400" />
            <span>
              Net revenue retention: <strong>{infographicData.headline.retention}</strong>
            </span>
          </div>
          <div
            className="flex items-center gap-3 text-sm"
            style={{ color: 'var(--secondary-label)' }}
          >
            <Rocket className="h-5 w-5 text-emerald-400" />
            <span>
              Payback period: <strong>{infographicData.headline.payback}</strong>
            </span>
          </div>
        </InfographicWidget>

        <InfographicWidget
          variant={variant}
          title="Customer Journey"
          subtitle="Conversion Funnel"
          footer="Documotion concierge team manages handoffs from MQL → Onboarding in under 48 hours."
        >
          <div className="space-y-3">
            {infographicData.funnel.map(stage => (
              <div key={stage.label}>
                <div
                  className="flex items-center justify-between text-sm"
                  style={{ color: 'var(--secondary-label)' }}
                >
                  <span>{stage.label}</span>
                  <span>
                    {stage.value.toLocaleString()} • {stage.conversion}
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: stage.conversion }}
                  />
                </div>
              </div>
            ))}
          </div>
        </InfographicWidget>

        <InfographicWidget
          variant={variant}
          title="Customer Spotlight"
          subtitle={infographicData.spotlight.customer}
          footer={
            <Link
              href="/case-studies/growthforge-labs"
              className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
              style={{ color: 'var(--system-blue)' }}
            >
              View full case study <ArrowRight className="h-4 w-4" />
            </Link>
          }
        >
          <p className="text-sm leading-relaxed" style={{ color: 'var(--secondary-label)' }}>
            {infographicData.spotlight.summary}
          </p>
          <ul className="space-y-2 text-sm" style={{ color: 'var(--secondary-label)' }}>
            {infographicData.spotlight.highlights.map(item => (
              <li key={item} className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 mt-1 text-amber-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </InfographicWidget>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <InfographicWidget variant={variant} title="Segments" subtitle="Top Customer Cohorts">
          <div className="space-y-2">
            {infographicData.cohorts.map((cohort, idx) => (
              <div key={cohort.label} className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'var(--secondary-label)' }}>
                  {cohort.label}
                </span>
                <span
                  className={cn(
                    'text-xs px-2 py-1 rounded-full font-semibold',
                    percentileColors[idx % percentileColors.length]
                  )}
                >
                  {cohort.percentage}%
                </span>
              </div>
            ))}
          </div>
        </InfographicWidget>

        <InfographicWidget
          variant={variant}
          title="Regional Expansion"
          subtitle="Adoption Index"
          footer="Index score weighs activation speed, support satisfaction, and feature adoption."
        >
          <div className="space-y-3">
            {infographicData.expansion.map(region => (
              <div key={region.region}>
                <div
                  className="flex items-center justify-between text-sm"
                  style={{ color: 'var(--secondary-label)' }}
                >
                  <span>{region.region}</span>
                  <span>{region.score}</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-white/10">
                  <div
                    className="h-1.5 rounded-full bg-emerald-500"
                    style={{ width: `${region.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </InfographicWidget>

        <InfographicWidget variant={variant} title="Playbooks" subtitle="Next Best Actions">
          <div className="space-y-3 text-sm" style={{ color: 'var(--secondary-label)' }}>
            <div className="flex items-start gap-3">
              <Target className="mt-0.5 h-4 w-4 text-purple-400" />
              <div>
                <p className="font-medium" style={{ color: 'var(--label)' }}>
                  Relaunch FinHub automation
                </p>
                <p>
                  Auto-segment fintech founders into 3 grant tracks and mirror in Documotion
                  reminders.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <TrendingUp className="mt-0.5 h-4 w-4 text-blue-400" />
              <div>
                <p className="font-medium" style={{ color: 'var(--label)' }}>
                  30-day retention sprint
                </p>
                <p>
                  Create concierge nudges for onboarding cohorts with{' '}
                  <span className="font-semibold">below 70%</span> completion.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="mt-0.5 h-4 w-4 text-emerald-400" />
              <div>
                <p className="font-medium" style={{ color: 'var(--label)' }}>
                  Customer council beta
                </p>
                <p>Invite top 12 Documotion accounts to co-design auto-apply templates.</p>
              </div>
            </div>
          </div>
        </InfographicWidget>
      </div>
    </section>
  );
}
