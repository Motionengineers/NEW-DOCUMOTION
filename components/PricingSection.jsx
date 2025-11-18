'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Check,
  Sparkles,
  Shield,
  TrendingUp,
  Megaphone,
  Handshake,
  Rocket,
  Link2,
  Lock,
  Zap,
  ArrowRight,
} from 'lucide-react';

const PRICING_TIERS = [
  {
    id: 'freemium',
    name: 'Explore',
    tagline: 'Start your journey',
    monthlyPrice: 0,
    annualPrice: 0,
    popular: false,
    features: [
      'Dashboard preview & scheme lookup',
      'Limited branding templates',
      'Read-only document access',
      '1 workspace',
      '3 file uploads',
      'No AI actions',
    ],
    limits: {
      workspaces: 1,
      uploads: 3,
      aiActions: 0,
      storage: 0,
      teamSeats: 1,
      autoApplyWorkflows: 0,
      aiParsingPages: 0,
    },
    cta: 'Start Free',
    ctaHref: '/dashboard',
    icon: Sparkles,
  },
  {
    id: 'growth',
    name: 'Growth',
    tagline: 'For growing teams',
    monthlyPrice: 3499,
    annualPrice: 34990, // ~2 months free
    popular: true,
    features: [
      'Full funding applications',
      'DigiLocker vault (up to 25 GB)',
      'AI-branding assistant (basic)',
      'Auto-apply workflow (3 schemes)',
      'Team of 5 members',
      'Priority email support',
    ],
    limits: {
      workspaces: 3,
      uploads: 100,
      aiActions: 50,
      storage: 25,
      teamSeats: 5,
      autoApplyWorkflows: 3,
      aiParsingPages: 500,
    },
    addOns: [
      { type: 'storage_10gb', price: 499, label: '+10 GB storage' },
      { type: 'extra_seat', price: 399, label: '+1 team seat' },
    ],
    cta: 'Upgrade to Growth',
    ctaHref: '/pricing?tier=growth',
    icon: TrendingUp,
  },
  {
    id: 'scale',
    name: 'Scale',
    tagline: 'Scale operations',
    monthlyPrice: 8999,
    annualPrice: 89990, // ~2 months free
    popular: false,
    features: [
      'Unlimited schemes & applications',
      'Advanced compliance playbooks',
      'Smart Branding Assistant Pro',
      'Verified partner marketplace',
      'Investor CRM & tracking',
      '1:1 onboarding session',
      'Priority support channel',
    ],
    limits: {
      workspaces: -1, // unlimited
      uploads: -1,
      aiActions: -1,
      storage: 100,
      teamSeats: 15,
      autoApplyWorkflows: 10,
      aiParsingPages: 500,
    },
    addOns: [
      { type: 'auto_apply_workflow', price: 299, label: '+1 auto-apply workflow' },
      { type: 'ai_parsing_pages', price: 3, label: '+1 page AI parsing' },
    ],
    cta: 'Upgrade to Scale',
    ctaHref: '/pricing?tier=scale',
    icon: Rocket,
  },
  {
    id: 'concierge',
    name: 'Concierge',
    tagline: 'Enterprise support',
    monthlyPrice: null,
    annualPrice: null,
    popular: false,
    features: [
      'Dedicated compliance pod',
      'Priority partner sourcing',
      'Managed filings & submissions',
      'Custom branding workspace',
      'SLA-backed support (24/7)',
      'Internal system integrations',
      'Outcome-based bonuses',
    ],
    limits: {
      workspaces: -1,
      uploads: -1,
      aiActions: -1,
      storage: -1,
      teamSeats: -1,
      autoApplyWorkflows: -1,
      aiParsingPages: -1,
    },
    cta: 'Contact Sales',
    ctaHref: '/contact?plan=concierge',
    icon: Shield,
  },
];

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState('monthly');

  return (
    <section className="py-20 px-4" style={{ backgroundColor: 'var(--system-background)' }}>
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2
            className="text-4xl md:text-5xl font-semibold tracking-tight mb-4"
            style={{ color: 'var(--label)' }}
          >
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg md:text-xl mb-8" style={{ color: 'var(--secondary-label)' }}>
            Start free. Scale as you grow. Built for Indian founders.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-2 p-1 rounded-xl border backdrop-blur-md" style={{ borderColor: 'var(--separator)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
              style={
                billingCycle === 'monthly'
                  ? { backgroundColor: 'var(--system-blue)' }
                  : {}
              }
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-lg font-medium transition-all relative ${
                billingCycle === 'annual'
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
              style={
                billingCycle === 'annual'
                  ? { backgroundColor: 'var(--system-blue)' }
                  : {}
              }
            >
              Annual
              <span className="absolute -top-1 -right-1 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500 text-white font-semibold">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {PRICING_TIERS.map((tier, idx) => {
            const Icon = tier.icon;
            const price = billingCycle === 'monthly' ? tier.monthlyPrice : tier.annualPrice;
            const isPopular = tier.popular;

            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className={`relative rounded-2xl p-6 border backdrop-blur-xl transition-all ${
                  isPopular
                    ? 'scale-105 border-blue-500/40 shadow-2xl'
                    : 'border-white/10 hover:border-white/20'
                }`}
                style={{
                  background: isPopular
                    ? 'linear-gradient(140deg, rgba(0,102,204,0.15), rgba(0,0,0,0.4))'
                    : 'rgba(255,255,255,0.02)',
                }}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold text-white bg-blue-500">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <div
                    className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
                    style={{
                      backgroundColor: isPopular ? 'rgba(0,102,204,0.2)' : 'rgba(255,255,255,0.05)',
                      color: isPopular ? 'var(--system-blue)' : 'var(--secondary-label)',
                    }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3
                    className="text-2xl font-semibold mb-1"
                    style={{ color: 'var(--label)' }}
                  >
                    {tier.name}
                  </h3>
                  <p className="text-sm mb-4" style={{ color: 'var(--tertiary-label)' }}>
                    {tier.tagline}
                  </p>
                  <div className="flex items-baseline gap-2">
                    {price === null ? (
                      <span className="text-3xl font-bold" style={{ color: 'var(--label)' }}>
                        Custom
                      </span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold" style={{ color: 'var(--label)' }}>
                          ₹{price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-sm" style={{ color: 'var(--tertiary-label)' }}>
                          /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                        </span>
                      </>
                    )}
                  </div>
                  {billingCycle === 'annual' && price !== null && price > 0 && (
                    <p className="text-xs mt-1" style={{ color: 'var(--system-green)' }}>
                      Save ₹{Math.round((tier.monthlyPrice * 12 - tier.annualPrice) / 12)}/mo
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3">
                      <Check
                        className="w-5 h-5 mt-0.5 flex-shrink-0"
                        style={{ color: 'var(--system-green)' }}
                      />
                      <span className="text-sm leading-relaxed" style={{ color: 'var(--secondary-label)' }}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {tier.addOns && tier.addOns.length > 0 && (
                  <div className="mb-6 pt-4 border-t" style={{ borderColor: 'var(--separator)' }}>
                    <p className="text-xs font-medium mb-2" style={{ color: 'var(--tertiary-label)' }}>
                      Add-ons:
                    </p>
                    {tier.addOns.map((addOn, aIdx) => (
                      <div
                        key={aIdx}
                        className="text-xs mb-1 flex items-center justify-between"
                        style={{ color: 'var(--secondary-label)' }}
                      >
                        <span>{addOn.label}</span>
                        <span className="font-medium">₹{addOn.price}</span>
                      </div>
                    ))}
                  </div>
                )}

                <Link
                  href={tier.ctaHref}
                  className={`block w-full text-center px-6 py-3 rounded-xl font-semibold transition-all ${
                    isPopular
                      ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg'
                      : 'border text-white hover:bg-white/5'
                  }`}
                  style={
                    !isPopular
                      ? {
                          borderColor: 'var(--separator)',
                          color: 'var(--label)',
                        }
                      : {}
                  }
                >
                  {tier.cta}
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Usage-based pricing note */}
        <div className="text-center">
          <p className="text-sm" style={{ color: 'var(--tertiary-label)' }}>
            Usage-based add-ons available. All prices in INR. Cancel anytime.
          </p>
        </div>
      </div>
    </section>
  );
}

