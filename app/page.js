'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Tiro_Devanagari_Hindi } from 'next/font/google';
import Navbar from '@/components/Navbar';
import FaqSection from '@/components/FaqSection';
import PricingSection from '@/components/PricingSection';
import {
  Home,
  Shield,
  TrendingUp,
  Users,
  FileText,
  Building2,
  CreditCard,
  Zap,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  Megaphone,
  Handshake,
  Rocket,
  Link2,
  Lock,
} from 'lucide-react';

const defaultApplyForm = {
  name: '',
  email: '',
  company: '',
  focus: '',
};

const hindiDisplay = Tiro_Devanagari_Hindi({
  subsets: ['latin', 'devanagari'],
  weight: '400',
  variable: '--font-hindi-display',
});

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState(defaultApplyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resetModal = () => {
    setShowApplyModal(false);
    setSubmitting(false);
    setSubmitted(false);
    setApplyForm(defaultApplyForm);
  };

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: 'var(--system-background)',
        background: `radial-gradient(1200px 600px at -10% -20%, rgba(0,102,204,0.15), transparent),
                     radial-gradient(900px 500px at 110% -10%, rgba(255,125,0,0.12), transparent),
                     radial-gradient(1000px 700px at 50% 120%, rgba(0,122,0,0.12), transparent),
                     var(--system-background)`,
      }}
    >
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.35), transparent),
                              radial-gradient(1px 1px at 30% 40%, rgba(255,255,255,0.25), transparent),
                              radial-gradient(1px 1px at 70% 10%, rgba(255,255,255,0.25), transparent),
                              radial-gradient(2px 2px at 85% 35%, rgba(255,255,255,0.15), transparent)`,
            opacity: 0.5,
          }}
        />

        <div className="container mx-auto text-center max-w-6xl relative z-10">
          <motion.div
            initial={mounted ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.2, 0, 0.2, 1] }}
          >
            <h1
              className="text-6xl md:text-8xl font-bold mb-8 tracking-tight leading-[1.1]"
              style={{ color: 'var(--label)' }}
            >
              The New Standard for Indian Startups
            </h1>
            <p
              className="text-xl md:text-2xl mb-6 max-w-4xl mx-auto leading-relaxed"
              style={{ color: 'var(--secondary-label)' }}
            >
              Sharp design. Smart automation. Real-time intelligence.
              <br />
              Made in India, for India&apos;s next 10 million founders.
            </p>
            <p
              className={`${hindiDisplay.className} text-sm md:text-base font-semibold tracking-[0.25em] uppercase text-center text-slate-200/90`}
              style={{ fontFeatureSettings: "'ss01' on, 'liga' on", letterSpacing: '0.25em', marginBottom: '0.75rem' }}
            >
              भारतीय उद्यमियों के लिए विश्वसनीय साथी—सब कुछ एक ही प्लेटफ़ॉर्म पर।
            </p>
            <div
              className="h-1 w-40 mx-auto rounded-full mb-12"
              style={{
                background:
                  'linear-gradient(90deg, rgba(255,153,51,0.9) 0%, rgba(255,255,255,0.9) 46%, rgba(19,136,8,0.9) 100%)',
                boxShadow: '0 8px 24px rgba(19,136,8,0.35)',
              }}
            />

            <div className="flex flex-wrap justify-center gap-3 mb-12 max-w-4xl mx-auto">
              {[
                {
                  label: 'Start Your Vision',
                  icon: Sparkles,
                  gradient: 'linear-gradient(135deg, rgba(236,72,153,0.35), rgba(59,130,246,0.2))',
                  border: 'rgba(236,72,153,0.4)',
                  iconBg: 'rgba(236,72,153,0.24)',
                },
                {
                  label: 'Legal & Compliance',
                  icon: Shield,
                  gradient: 'linear-gradient(135deg, rgba(45,212,191,0.32), rgba(59,130,246,0.18))',
                  border: 'rgba(45,212,191,0.35)',
                  iconBg: 'rgba(45,212,191,0.22)',
                },
                {
                  label: 'Secure Funding',
                  icon: TrendingUp,
                  gradient: 'linear-gradient(135deg, rgba(250,204,21,0.36), rgba(202,138,4,0.22))',
                  border: 'rgba(250,204,21,0.34)',
                  iconBg: 'rgba(250,204,21,0.2)',
                },
                {
                  label: 'Build Your Brand',
                  icon: Megaphone,
                  gradient: 'linear-gradient(135deg, rgba(232,121,249,0.34), rgba(190,24,98,0.22))',
                  border: 'rgba(232,121,249,0.32)',
                  iconBg: 'rgba(232,121,249,0.22)',
                },
                {
                  label: 'Find Investors & Experts',
                  icon: Handshake,
                  gradient: 'linear-gradient(135deg, rgba(74,222,128,0.3), rgba(22,163,74,0.2))',
                  border: 'rgba(74,222,128,0.32)',
                  iconBg: 'rgba(74,222,128,0.22)',
                },
                {
                  label: 'Auto-Apply Workflows',
                  icon: Rocket,
                  gradient: 'linear-gradient(135deg, rgba(129,140,248,0.32), rgba(59,130,246,0.2))',
                  border: 'rgba(129,140,248,0.3)',
                  iconBg: 'rgba(129,140,248,0.22)',
                },
                {
                  label: 'Scale & M&A Support',
                  icon: Link2,
                  gradient: 'linear-gradient(135deg, rgba(192,132,252,0.32), rgba(99,102,241,0.24))',
                  border: 'rgba(192,132,252,0.3)',
                  iconBg: 'rgba(192,132,252,0.22)',
                },
              ].map((feature, idx) => {
                const Icon = feature.icon;

                return (
                  <motion.div
                    key={feature.label}
                    initial={mounted ? { opacity: 0, scale: 0.9 } : false}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.45, delay: 0.3 + idx * 0.05 }}
                    className="group relative overflow-hidden rounded-full border px-5 py-2.5 text-xs md:text-sm font-medium backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(15,23,42,0.3)]"
                    style={{
                      background: feature.gradient,
                      borderColor: feature.border,
                      color: '#f8fafc',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
                    }}
                  >
                    <span className="relative flex items-center gap-2.5">
                      <span
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 backdrop-blur"
                        style={{ backgroundColor: feature.iconBg }}
                      >
                        <Icon className="h-3 w-3" strokeWidth={2.2} />
                      </span>
                      <span>{feature.label}</span>
                    </span>
                  </motion.div>
                );
              })}
            </div>

            <div className="flex justify-center gap-4 flex-wrap">
              <Link
                href="/services/registration"
                className="px-10 py-5 rounded-xl font-semibold text-lg transition-all shadow-lg"
                style={{
                  backgroundColor: 'var(--system-blue)',
                  color: '#ffffff',
                }}
              >
                Make Your Startup Official →
              </Link>
              <Link
                href="/dashboard"
                className="glass px-10 py-5 rounded-xl font-semibold text-lg transition-all border"
                style={{ color: 'var(--label)' }}
              >
                Explore Indian Startup Tools →
              </Link>
              <button
                type="button"
                className="glass px-10 py-5 rounded-xl font-semibold text-lg transition-all border"
                style={{ color: 'var(--system-blue)', borderColor: 'rgba(0,102,204,0.4)' }}
                onClick={() => setShowApplyModal(true)}
              >
                Apply Now →
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Branding Promo */}
      <section className="py-6 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="glass rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-3xl">
              <h3
                className="text-2xl md:text-3xl font-semibold mb-2 tracking-tight"
                style={{ color: 'var(--label)' }}
              >
                Make it yours with Branding Studio
              </h3>
              <p className="text-base md:text-lg" style={{ color: 'var(--secondary-label)' }}>
                Upload your logo, pick brand colors, and white-label the entire portal. Your team
                and clients will see your brand across the dashboard, emails, and PDFs.
              </p>
            </div>
            <Link
              href="/dashboard/branding"
              className="px-6 py-3 rounded-xl font-semibold text-base md:text-lg transition-all shadow"
              style={{ backgroundColor: 'var(--system-blue)', color: '#ffffff' }}
            >
              Open Branding Studio →
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <h2
            className="text-4xl font-semibold text-center mb-4 tracking-tight"
            style={{ color: 'var(--label)' }}
          >
            Everything You Need to Grow
          </h2>
          <p className="text-lg text-center mb-16" style={{ color: 'var(--secondary-label)' }}>
            Made for Indian startups. Trusted by Indian founders.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => {
              const iconWrapperStyle = {
                background: feature.iconBg || 'rgba(0, 102, 204, 0.1)',
                color: feature.iconColor || 'var(--system-blue)',
                boxShadow: feature.iconShadow,
              };
              const cardStyle = {
                ...(feature.cardBackground ? { background: feature.cardBackground } : {}),
                ...(feature.cardBorder ? { borderColor: feature.cardBorder } : {}),
                ...(feature.cardShadow ? { boxShadow: feature.cardShadow } : {}),
              };

              return (
                <Link key={feature.title} href={feature.href || '#'} className="block group">
                  <motion.div
                    initial={mounted ? { opacity: 0, y: 20 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    className="glass rounded-xl p-6 hover:scale-[1.02] transition-all cursor-pointer h-full border border-transparent hover:border-blue-500/20"
                    style={cardStyle}
                  >
                    <div
                      className="mb-4 inline-block p-3 rounded-xl group-hover:scale-110 transition-transform"
                      style={iconWrapperStyle}
                    >
                      {feature.icon}
                    </div>
                    <h3
                      className="text-xl font-semibold mb-2 transition-colors"
                      style={{ color: 'var(--label)' }}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: 'var(--secondary-label)' }}
                    >
                      {feature.description}
                    </p>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why We're Different */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-5xl font-semibold tracking-tight mb-4"
              style={{ color: 'var(--label)' }}
            >
              Why Teams Switch to Documotion
            </h2>
            <p className="text-lg md:text-xl" style={{ color: 'var(--secondary-label)' }}>
              Documotion unifies startup compliance, funding, and documents into a single,
              intelligent workflow—no more juggling spreadsheets and portals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div
              className="rounded-3xl p-8 md:p-10 border border-white/10 backdrop-blur-xl shadow-xl"
              style={{
                background: 'linear-gradient(140deg, rgba(0,102,204,0.25), rgba(0,0,0,0.55))',
              }}
            >
              <h3 className="text-2xl font-semibold mb-6" style={{ color: '#ffffff' }}>
                With Documotion
              </h3>
              <ul className="space-y-4">
                {[
                  'Unified workspace covering registrations, compliance, funding, and branding.',
                  'Insight Engine (planned) scores every submission and flags risky gaps before you file.',
                  'Auto-apply workflows track every timeline—no more missing deadlines.',
                  'Document vault keeps a single verified source of truth for your entire team.',
                  'Priority support and guided onboarding so founders ship faster.',
                ].map(item => (
                  <li key={item} className="flex items-start gap-4">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 mt-1" />
                    <span className="text-base leading-relaxed text-white/95">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="rounded-3xl p-8 md:p-10 border border-white/10 backdrop-blur-xl shadow-lg"
              style={{
                background: 'linear-gradient(140deg, rgba(15,15,15,0.9), rgba(15,15,15,0.6))',
              }}
            >
              <h3
                className="text-2xl font-semibold mb-6"
                style={{ color: 'var(--secondary-label)' }}
              >
                Without Documotion
              </h3>
              <ul className="space-y-4">
                {[
                  'Multiple spreadsheets, portals, and email threads to manage every application.',
                  'No visibility into missing documents or eligibility gaps until it’s too late.',
                  'Manual status tracking that leads to missed follow-ups and lost opportunities.',
                  'Founders re-upload the same files for every scheme, with inconsistent versions.',
                  'Generic tools with zero context for Indian startup compliance or funding.',
                ].map(item => (
                  <li key={item} className="flex items-start gap-4">
                    <XCircle className="w-6 h-6 text-rose-400 mt-1" />
                    <span
                      className="text-base leading-relaxed"
                      style={{ color: 'var(--tertiary-label)' }}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <PricingSection />

      <FaqSection />

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="glass rounded-2xl p-12 text-center">
            <h2
              className="text-4xl font-semibold mb-4 tracking-tight"
              style={{ color: 'var(--label)' }}
            >
              Ready to Build India&apos;s Next Big Startup?
            </h2>
            <p className="text-xl mb-8" style={{ color: 'var(--secondary-label)' }}>
              Join thousands of Indian founders using Documotion to scale faster.
            </p>
            <Link
              href="/services/registration"
              className="inline-block px-10 py-5 rounded-xl font-semibold text-lg transition-all shadow-lg"
              style={{
                backgroundColor: 'var(--system-blue)',
                color: '#ffffff',
              }}
            >
              Make Your Startup Official →
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t py-8 px-4" style={{ borderColor: 'var(--separator)' }}>
        <div className="container mx-auto text-center" style={{ color: 'var(--tertiary-label)' }}>
          <p>&copy; {new Date().getFullYear()} Documotion. All rights reserved.</p>
        </div>
      </footer>

      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={resetModal} />
          <div className="relative w-full max-w-2xl rounded-3xl p-8 md:p-10 glass border border-white/10 shadow-2xl">
            <button
              className="absolute top-4 right-4 text-sm font-medium text-white/60 hover:text-white transition-colors"
              onClick={resetModal}
            >
              Close
            </button>
            <h3 className="text-3xl font-semibold mb-3" style={{ color: 'var(--label)' }}>
              Where business chaos ends. Where intelligent documentation begins.
            </h3>
            <p className="text-base md:text-lg mb-2" style={{ color: 'var(--secondary-label)' }}>
              The macro shift is real—data is exploding while clarity collapses. Documotion steps in
              as your AI operating system.
            </p>
            <p className="text-sm md:text-base mb-6" style={{ color: 'var(--secondary-label)' }}>
              Apply for Documotion Concierge to get a structured, AI-ready workspace with instant
              answers, automated documentation, and a team that moves as fast as your startup.
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {[
                'Dedicated registration specialists within 48 hours',
                'Insight Engine readiness audit (beta invite)',
                'Custom compliance roadmap & milestone tracker',
                'Priority support channel with Documotion experts',
              ].map(feature => (
                <div
                  key={feature}
                  className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3"
                >
                  <CheckCircle2 className="w-5 h-5 mt-1" style={{ color: 'var(--system-blue)' }} />
                  <span className="text-sm" style={{ color: 'var(--secondary-label)' }}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            <form
              className="space-y-4"
              onSubmit={async e => {
                e.preventDefault();
                if (submitting || submitted) return;
                setSubmitting(true);
                await new Promise(resolve => setTimeout(resolve, 600));
                setSubmitting(false);
                setSubmitted(true);
              }}
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2" style={{ color: 'var(--secondary-label)' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={applyForm.name}
                    onChange={e => setApplyForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-xl px-4 py-3 border bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    style={{ borderColor: 'var(--separator)', color: 'var(--label)' }}
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{ color: 'var(--secondary-label)' }}>
                    Work Email
                  </label>
                  <input
                    type="email"
                    required
                    value={applyForm.email}
                    onChange={e => setApplyForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full rounded-xl px-4 py-3 border bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    style={{ borderColor: 'var(--separator)', color: 'var(--label)' }}
                    placeholder="name@startup.in"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--secondary-label)' }}>
                  Company / Startup Name
                </label>
                <input
                  type="text"
                  required
                  value={applyForm.company}
                  onChange={e => setApplyForm(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full rounded-xl px-4 py-3 border bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  style={{ borderColor: 'var(--separator)', color: 'var(--label)' }}
                  placeholder="Documotion Labs Pvt Ltd"
                />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--secondary-label)' }}>
                  What do you need help with?
                </label>
                <textarea
                  required
                  rows={4}
                  value={applyForm.focus}
                  onChange={e => setApplyForm(prev => ({ ...prev, focus: e.target.value }))}
                  className="w-full rounded-xl px-4 py-3 border bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  style={{ borderColor: 'var(--separator)', color: 'var(--label)' }}
                  placeholder="e.g. Private limited incorporation, DPIIT recognition, hiring compliance"
                />
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4">
                <p className="text-xs md:text-sm" style={{ color: 'var(--tertiary-label)' }}>
                  By applying you agree to Documotion’s privacy policy. We respond within one
                  business day with next steps.
                </p>
                <button
                  type="submit"
                  disabled={submitting || submitted}
                  className="px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ backgroundColor: 'var(--system-blue)', color: '#ffffff' }}
                >
                  {submitted
                    ? 'Application Received'
                    : submitting
                      ? 'Submitting…'
                      : 'Submit Application'}
                  {!submitted && <ArrowRight className="h-4 w-4" />}
                </button>
              </div>
            </form>

            {submitted && (
              <div className="mt-6 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm">
                <p className="font-medium" style={{ color: 'var(--system-green)' }}>
                  Thank you! Our concierge team will reach out shortly.
                </p>
                <p style={{ color: 'var(--secondary-label)' }}>
                  Check your inbox for a confirmation email. You can continue exploring Documotion
                  while we review your application.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const features = [
  {
    icon: <Home className="h-6 w-6" style={{ color: 'var(--system-blue)' }} />,
    title: 'Smart Matching',
    description: 'AI-powered eligibility scoring to find the perfect schemes for your startup',
    href: '/schemes',
  },
  {
    icon: <Zap className="h-6 w-6" style={{ color: 'var(--system-blue)' }} />,
    title: 'Branding Studio',
    description: 'White-label your portal: logo, colors, and branded PDFs in minutes',
    href: '/dashboard/branding',
  },
  {
    icon: (
      <div className="relative flex h-10 w-10 items-center justify-center">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-200/45 via-transparent to-transparent blur-[8px]" />
        <div className="absolute inset-0 rounded-xl border border-amber-200/50" />
        <Shield className="relative h-6 w-6 text-amber-200" strokeWidth={2.1} />
        <Lock className="absolute -bottom-1 right-0 h-3.5 w-3.5 text-amber-100" strokeWidth={2.3} />
      </div>
    ),
    title: 'Document Vault',
    description: 'Secure storage and verification of all your startup documents',
    href: '/dashboard',
    iconBg: 'linear-gradient(135deg, rgba(250,204,21,0.18), rgba(217,119,6,0.22))',
    iconShadow: '0 22px 44px rgba(250,204,21,0.28)',
    iconColor: '#FACC15',
    cardBackground: 'linear-gradient(145deg, rgba(15,23,42,0.92), rgba(15,23,42,0.72))',
    cardBorder: 'rgba(250,204,21,0.3)',
    cardShadow: '0 26px 60px rgba(15,23,42,0.5)',
  },
  {
    icon: <TrendingUp className="h-6 w-6" style={{ color: 'var(--system-blue)' }} />,
    title: 'Auto-Apply',
    description: 'Automated application submissions to matched schemes and loans',
    href: '/dashboard',
  },
  {
    icon: <Users className="h-6 w-6" style={{ color: 'var(--system-blue)' }} />,
    title: 'Talent Network',
    description: 'Connect with founders and startup talent across India',
    href: '/talent',
  },
  {
    icon: <FileText className="h-6 w-6" style={{ color: 'var(--system-blue)' }} />,
    title: 'Pitch Deck Library',
    description: 'Access curated pitch decks to inspire your fundraising journey',
    href: '/pitch-decks',
  },
  {
    icon: <Building2 className="h-6 w-6" style={{ color: 'var(--system-blue)' }} />,
    title: 'Government Schemes',
    description: 'Comprehensive database of all Indian government startup schemes',
    href: '/schemes',
  },
  {
    icon: <CreditCard className="h-6 w-6" style={{ color: 'var(--system-blue)' }} />,
    title: 'Bank Hub',
    description: 'Find startup-friendly loans and banking solutions',
    href: '/bank',
  },
  {
    icon: <Zap className="h-6 w-6" style={{ color: 'var(--system-blue)' }} />,
    title: 'AI Assistant',
    description: 'Get instant answers and recommendations powered by AI',
    href: '/dashboard',
  },
  {
    icon: <FileText className="h-6 w-6" style={{ color: 'var(--system-blue)' }} />,
    title: 'Business Registration',
    description: 'Register your business in 48 hours with our streamlined process',
    href: '/services/registration',
  },
  {
    icon: <FileText className="h-6 w-6" style={{ color: 'var(--system-blue)' }} />,
    title: 'Certifications & Compliance',
    description: 'ISO, GST, ROC filings, and all compliance services your startup needs',
    href: '/services/compliance',
  },
  {
    icon: <TrendingUp className="h-6 w-6" style={{ color: 'var(--system-blue)' }} />,
    title: 'M&A Hub',
    description: "Buy, sell, or merge startups. India's first startup M&A marketplace",
    href: '/ma',
  },
];
