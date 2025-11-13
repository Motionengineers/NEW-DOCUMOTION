export const metadata = {
  title: 'GrowthForge Labs Case Study • Documotion',
  description:
    'How GrowthForge Labs scaled from ₹12L to ₹1.7Cr ARR with Documotion concierge workflows, automated compliance, and grant intelligence.',
};

const milestones = [
  {
    label: 'Month 1',
    detail:
      'Rebuilt onboarding workflows with Documotion concierge. Queue time dropped from 18 days to 9.',
  },
  {
    label: 'Month 5',
    detail:
      'Launched Razorpay auto-reconciliation, reducing manual finance time by 12 hours per week.',
  },
  {
    label: 'Month 9',
    detail:
      'Grant intelligence playbooks auto-applied to 9 state programs. Won ₹46L in subsidies and credits.',
  },
  {
    label: 'Month 14',
    detail:
      'Scaled ARR to ₹1.7Cr with 0 SLA breaches and 132% net revenue retention.',
  },
];

const metrics = [
  { label: 'ARR growth', value: '₹1.7Cr', caption: 'Up from ₹12L in 14 months' },
  { label: 'Net revenue retention', value: '132%', caption: 'Driven by Documotion renewal nudges' },
  { label: 'Onboarding queue reduction', value: '47%', caption: 'Concierge workflows + Talent pods' },
  { label: 'State grants approved', value: '9', caption: 'Auto-applied via grant intelligence hub' },
];

const stack = [
  { name: 'Concierge Workflows', impact: 'Pod-based onboarding, ownership routing' },
  { name: 'Grant Intelligence', impact: 'Eligibility scoring + one-click applications' },
  { name: 'Compliance Vault', impact: 'Single truth for ROC/GST filings and DIPPT docs' },
  { name: 'Branding Studio', impact: 'White-labeled startup portal for GrowthForge clients' },
];

export default function GrowthForgeCaseStudyPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_60%),#05070c] pb-20 pt-24 text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-16 px-6">
        <header className="space-y-6 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-cyan-300">Case study</p>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            GrowthForge Labs scaled compliance-led revenue with Documotion
          </h1>
          <p className="text-base text-slate-200 md:text-lg">
            Boutique growth studio built for D2C and SaaS founders. Within 14 months on Documotion
            concierge, they unlocked grant capital, hit 132% NRR, and eliminated SLA breaches across
            their client success pods.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
            <span>Industry: Growth & Compliance Advisory</span>
            <span>Headcount: 42</span>
            <span>HQ: Bengaluru</span>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {metrics.map(metric => (
            <div
              key={metric.label}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-lg backdrop-blur"
            >
              <p className="text-xs uppercase tracking-widest text-cyan-200">{metric.label}</p>
              <p className="mt-2 text-3xl font-semibold text-white">{metric.value}</p>
              <p className="mt-2 text-sm text-slate-300">{metric.caption}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 md:grid-cols-[1fr_1.2fr] md:items-center">
          <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-lg backdrop-blur">
            <h2 className="text-xl font-semibold text-white">The challenge</h2>
            <p className="text-sm text-slate-300">
              GrowthForge managed compliance, grant filings, and investor readiness for 60+ founders.
              Data lived in spreadsheets, onboarding had inconsistent owners, and deadlines slipped when
              partners switched between marketing and legal workflows. Grants also required manual audits,
              which slowed down cash-flow positive deals.
            </p>
            <p className="text-sm text-slate-300">
              They needed a unified operating system that kept pods aligned, automated eligibility checks,
              and made it easy to spin up white-labeled client workspaces.
            </p>
          </div>

          <div className="space-y-6 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent p-6 shadow-lg backdrop-blur">
            <h3 className="text-sm uppercase tracking-[0.3em] text-cyan-200">Implementation timeline</h3>
            <ul className="space-y-4">
              {milestones.map(milestone => (
                <li key={milestone.label} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-400/10 text-xs text-cyan-200">
                    •
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{milestone.label}</p>
                    <p className="text-sm text-slate-300">{milestone.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-lg backdrop-blur">
            <h2 className="text-xl font-semibold text-white">Documotion stack</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              {stack.map(item => (
                <li key={item.name} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-400/10 text-xs text-emerald-200">
                    ✓
                  </span>
                  <div>
                    <p className="font-semibold text-white">{item.name}</p>
                    <p>{item.impact}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-lg backdrop-blur">
            <h2 className="text-xl font-semibold text-white">Playbooks activated</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full border border-purple-400/40 bg-purple-400/10 text-xs text-purple-200">
                  ✓
                </span>
                <div>
                  <p className="font-semibold text-white">Grant acceleration pod</p>
                  <p>Documotion auto-generated task boards for each grant with built-in compliance checks.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full border border-blue-400/40 bg-blue-400/10 text-xs text-blue-200">
                  ✓
                </span>
                <div>
                  <p className="font-semibold text-white">Founder-ready workspace</p>
                  <p>Branding Studio deployed GrowthForge’s visual system across client portals and PDFs.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10 text-xs text-amber-200">
                  ✓
                </span>
                <div>
                  <p className="font-semibold text-white">Revenue health dashboard</p>
                  <p>Live insight cards aggregated retention, cohort, and pipeline data for weekly exec reviews.</p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-transparent p-8 shadow-xl backdrop-blur">
          <h2 className="text-xl font-semibold text-white">Results</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-sm text-emerald-100">
              <p className="font-semibold text-white">Zero SLA breaches</p>
              <p className="mt-2">
                Concierge workflows surfaced risks in real-time and escalated to owners automatically,
                keeping client pods within promised response windows for five consecutive months.
              </p>
            </div>
            <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-5 text-sm text-blue-100">
              <p className="font-semibold text-white">Investor-ready data rooms in hours</p>
              <p className="mt-2">
                Compliance Vault kept all ROC, GST, and vendor files notarised and searchable. GrowthForge
                now spins up investor audit rooms in under four hours (down from 3.5 days).
              </p>
            </div>
            <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-5 text-sm text-purple-100">
              <p className="font-semibold text-white">Pod visibility for leadership</p>
              <p className="mt-2">
                Live dashboards highlighted which pods were at risk, the grants pipeline, and expansion
                opportunities by region—steering leadership into proactive planning rather than fire-fighting.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-100">
              <p className="font-semibold text-white">Higher founder satisfaction</p>
              <p className="mt-2">
                Founder NPS jumped 14 points after GrowthForge deployed white-labeled portals with automated
                updates and AI-powered policy explainers.
              </p>
            </div>
          </div>
        </section>

        <footer className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-lg backdrop-blur">
          <h2 className="text-2xl font-semibold text-white">
            Ready to ship concierge-grade experiences?
          </h2>
          <p className="mt-3 text-sm text-slate-300">
            Documotion blends compliance, grant intelligence, branding, and live analytics so your team can
            focus on shipping outcomes. Book a demo and we’ll tailor the concierge stack to your workflows.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <a
              href="/services/registration"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold shadow-lg shadow-blue-500/30 transition hover:bg-blue-500"
            >
              Book a Documotion demo
            </a>
            <a
              href="mailto:concierge@documotion.in"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white/90 transition hover:border-white/40 hover:bg-white/5"
            >
              Talk to concierge →
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}

