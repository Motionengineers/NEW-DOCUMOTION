import Navbar from "@/components/Navbar";

export const metadata = {
  title: "M&A Hub • Documotion",
  description:
    "Run verified startup acquisitions, buy-side mandates, and sell-side exits with Documotion’s secure M&A operating system.",
};

const CORE_SECTIONS = [
  {
    title: "Verified, High-Signal Listings",
    description:
      "Curated deal flow across funded startups, asset-only acquisitions, acquihires, and roll-up brands. Every listing ships with verified financials, team data, product stack, CAC/LTV trends, and IP snapshots.",
    bullets: [
      "Startup & brand acquisitions",
      "Asset and technology sales",
      "Acquihire opportunities",
      "Roll-up ready categories",
    ],
  },
  {
    title: "Buy-Side Intelligence Mandates",
    description:
      "Buyers submit their thesis — sector, geography, revenue range, valuation band, and team size — and Documotion’s system runs anonymised outreach while analysts surface pre-screened matches.",
    bullets: [
      "Automated sourcing against your thesis",
      "Anonymised outreach handled for you",
      "Analyst review before any intro",
    ],
  },
  {
    title: "Sell-Side Exit Support",
    description:
      "Launch a complete exit process in one click. Auto-generate diligence packs, unlock buyer visibility through smart ranking, and work with Documotion analysts on valuation, CIM creation, and negotiation prep.",
    bullets: [
      "Auto-built diligence data rooms",
      "Ranked visibility to active buyers",
      "Analyst partnership on valuation & CIM",
    ],
  },
];

const INFRA_SECTIONS = [
  {
    title: "Smart Deal Rooms (Bank-Grade Secure)",
    bullets: [
      "Permissioned document vault with redaction mode",
      "Audit trails, timestamps, and structured Q&A",
      "Version control for legal & financial artefacts",
    ],
  },
  {
    title: "Negotiation Workflows",
    bullets: [
      "Track offers and counter-offers in one view",
      "Automated term-sheet builder & red-flag alerts",
      "Integrated e-sign to close without leaving Documotion",
    ],
  },
];

const WORKFLOW_STEPS = [
  {
    step: "Step 1 — Tell Us Your Goal",
    detail:
      "One simple form unlocks a Documotion concierge who builds a custom acquisition or exit strategy.",
  },
  {
    step: "Step 2 — Upload Documents Once",
    detail:
      "Financials, pitch decks, compliance, ESOP, cap table — Documotion creates a clean, investor-ready data room automatically.",
  },
  {
    step: "Step 3 — Get Matches",
    detail:
      "AI + Analyst hybrid engine delivers the most relevant buyers if you’re selling, or qualified sellers if you’re buying.",
  },
  {
    step: "Step 4 — Manage the Deal",
    detail:
      "Use secure deal rooms, structured messaging, Q&A threads, and negotiation workflows to keep everyone aligned.",
  },
  {
    step: "Step 5 — Close With Confidence",
    detail:
      "Move from term sheet to diligence to definitive docs without leaving the platform. Every step is tracked and auditable.",
  },
];

export default function MAHubPage() {
  return (
    <div className="min-h-screen bg-[var(--system-background)]">
      <Navbar />
      <main className="container mx-auto max-w-6xl px-4 py-12 space-y-12">
        <header className="space-y-4 text-center sm:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-1 text-xs uppercase tracking-[0.3em]" style={{ color: "var(--tertiary-label)" }}>
            Documotion M&amp;A Hub
          </span>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight" style={{ color: "var(--label)" }}>
            The M&amp;A operating system for founders, VCs, accelerators, and strategic buyers.
          </h1>
          <p className="text-lg sm:text-xl max-w-3xl" style={{ color: "var(--secondary-label)" }}>
            Buy, sell, merge, and scale startups faster with verified listings, concierge sourcing, and bank-grade deal infrastructure— all inside Documotion.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          {CORE_SECTIONS.map(section => (
            <article key={section.title} className="glass rounded-2xl border border-white/10 p-6 space-y-3">
              <h2 className="text-xl font-semibold" style={{ color: "var(--label)" }}>
                {section.title}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--secondary-label)" }}>
                {section.description}
              </p>
              <ul className="space-y-2 text-sm" style={{ color: "var(--secondary-label)" }}>
                {section.bullets.map(point => (
                  <li key={point} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-blue-400" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          {INFRA_SECTIONS.map(item => (
            <article key={item.title} className="glass rounded-2xl border border-white/10 p-6 space-y-3">
              <h3 className="text-lg font-semibold" style={{ color: "var(--label)" }}>
                {item.title}
              </h3>
              <ul className="space-y-2 text-sm" style={{ color: "var(--secondary-label)" }}>
                {item.bullets.map(point => (
                  <li key={point} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="glass rounded-2xl border border-white/10 p-8 space-y-5">
          <h2 className="text-2xl font-semibold" style={{ color: "var(--label)" }}>
            How the M&amp;A Hub Works
          </h2>
          <ol className="space-y-4 text-sm sm:text-base" style={{ color: "var(--secondary-label)" }}>
            {WORKFLOW_STEPS.map(step => (
              <li key={step.step} className="border-l-2 border-blue-500 pl-4">
                <p className="font-semibold" style={{ color: "var(--label)" }}>
                  {step.step}
                </p>
                <p>{step.detail}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-2xl border border-white/10 bg-blue-600/10 p-8 backdrop-blur-lg space-y-4">
          <h2 className="text-2xl font-semibold" style={{ color: "var(--label)" }}>
            Concierge Access
          </h2>
          <p className="text-base" style={{ color: "var(--secondary-label)" }}>
            Request your tailored M&amp;A playbook and we’ll respond within one business day with a custom strategy, recommended shortlist, and analyst support plan.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm" style={{ color: "var(--secondary-label)" }}>
            <div>
              <span className="font-semibold" style={{ color: "var(--label)" }}>
                📩 concierge@documotion.in
              </span>
              <p>Send your mandate and current deck. We’ll handle the rest.</p>
            </div>
            <a
              href="mailto:concierge@documotion.in?subject=Documotion%20M%26A%20Hub%20Inquiry"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-500"
            >
              Request your playbook →
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}

