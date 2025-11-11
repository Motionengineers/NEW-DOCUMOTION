import Navbar from "@/components/Navbar";

export const metadata = {
  title: "M&A Hub • Documotion",
  description: "Discover acquisition-ready startups, list buy-side mandates, and collaborate via Documotion deal rooms.",
};

const BENEFITS = [
  {
    title: "Verified listings",
    description: "Access curated startup and asset listings with financial snapshots, team details, and growth metrics.",
  },
  {
    title: "Buy-side mandates",
    description: "Submit acquisition requirements; Documotion runs targeted outreach and sends screened matches.",
  },
  {
    title: "Secure deal rooms",
    description: "Collaborate with counterparties through audit trails, document vaults, and structured messaging.",
  },
];

export default function MAHubPage() {
  return (
    <div className="min-h-screen bg-[var(--system-background)]">
      <Navbar />
      <main className="container mx-auto max-w-5xl px-4 py-10 space-y-10">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold" style={{ color: "var(--label)" }}>
            Documotion M&amp;A Hub
          </h1>
          <p className="text-base" style={{ color: "var(--secondary-label)" }}>
            Facilitate startup acquisitions, asset sales, and roll-ups with a ready vault of compliance,
            financial, and branding artefacts. Work with Documotion analysts to shortlist buyers or sellers,
            prepare diligence packs, and manage negotiation workflows.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {BENEFITS.map(item => (
            <article key={item.title} className="glass rounded-2xl p-6 border border-white/10 space-y-2">
              <h2 className="text-lg font-semibold" style={{ color: "var(--label)" }}>
                {item.title}
              </h2>
              <p className="text-sm" style={{ color: "var(--secondary-label)" }}>
                {item.description}
              </p>
            </article>
          ))}
        </section>

        <section className="glass rounded-2xl p-8 border border-white/10 space-y-4">
          <h2 className="text-xl font-semibold" style={{ color: "var(--label)" }}>
            Get Started
          </h2>
          <ol className="list-decimal list-inside space-y-3 text-sm" style={{ color: "var(--secondary-label)" }}>
            <li>Share your acquisition or exit goals with Documotion concierge.</li>
            <li>Upload financials, pitch decks, and compliance documents once to build a data room.</li>
            <li>Invite stakeholders to a secure deal room with redacted sharing controls.</li>
          </ol>
          <p className="text-sm" style={{ color: "var(--secondary-label)" }}>
            Request access via concierge@documotion.in — we respond within one business day with a tailored playbook.
          </p>
        </section>
      </main>
    </div>
  );
}

