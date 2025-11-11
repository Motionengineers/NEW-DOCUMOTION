'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const faqItems = [
  {
    question: 'What makes Documotion different from other documentation tools?',
    answer:
      'Documotion is an AI operating system for business clarity. It unifies registrations, compliance, funding, and knowledge into a single workspace that stays structured automatically.',
  },
  {
    question: 'How quickly can we get up and running?',
    answer:
      'Most teams launch within 48 hours using the guided Registration Studio. Our concierge onboarding packages fast-track data import, branding, and compliance workflows.',
  },
  {
    question: 'Does Documotion work with our existing data and documents?',
    answer:
      'Yes. Upload PDFs, spreadsheets, and existing decks—Documotion automatically organises them into searchable repositories, links them to structured records, and keeps them synced.',
  },
  {
    question: 'Can the platform handle compliance and government schemes?',
    answer:
      'Documotion includes curated scheme databases, rules-based eligibility scoring, and pending Insight Engine risk alerts. Track filings, auto-apply, and collaborate with experts in one place.',
  },
  {
    question: 'How does the Insight Engine help my team?',
    answer:
      'The Insight Engine (currently in rollout) evaluates every submission, highlights missing evidence, and suggests optimisation steps so your applications and documents are approval-ready.',
  },
  {
    question: 'What kind of support is available?',
    answer:
      'Choose self-serve with in-app guidance or upgrade to Documotion Concierge for dedicated specialists, priority channels, and a customised operating manual for your team.',
  },
];

export default function FaqSection() {
  const [openItem, setOpenItem] = useState(null);

  const toggleItem = index => {
    setOpenItem(current => (current === index ? null : index));
  };

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-medium uppercase tracking-[0.2em]" style={{ color: 'var(--tertiary-label)' }}>
            FAQ
          </span>
          <h2
            className="text-4xl md:text-5xl font-semibold tracking-tight mt-4 mb-4"
            style={{ color: 'var(--label)' }}
          >
            Frequently Asked Questions
          </h2>
          <p className="text-base md:text-lg max-w-2xl mx-auto" style={{ color: 'var(--secondary-label)' }}>
            Answers for founders, operators, and teams considering Documotion as their AI operating system for business clarity.
          </p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, index) => {
            const isOpen = openItem === index;
            return (
              <div
                key={item.question}
                className="rounded-3xl border border-white/10 backdrop-blur-xl bg-white/[0.04] transition-all"
              >
                <button
                  type="button"
                  className="w-full px-6 md:px-8 py-5 md:py-6 flex items-center justify-between text-left gap-6"
                  onClick={() => toggleItem(index)}
                  aria-expanded={isOpen}
                  style={{ color: 'var(--label)' }}
                >
                  <span className="text-base md:text-lg font-medium">{item.question}</span>
                  <span
                    className="flex items-center justify-center rounded-full border border-white/10 w-9 h-9 shrink-0 transition-colors"
                    style={{
                      color: 'var(--system-blue)',
                      backgroundColor: isOpen ? 'rgba(0,102,204,0.12)' : 'transparent',
                    }}
                    aria-hidden="true"
                  >
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-6 md:px-8 pb-6 md:pb-8" style={{ color: 'var(--secondary-label)' }}>
                    <p className="text-sm md:text-base leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


