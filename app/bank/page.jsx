import Navbar from "@/components/Navbar";
import { loadBankSchemes } from "@/lib/dataSources";

export const metadata = {
  title: "Bank & Debt Products • Documotion",
  description: "Discover curated bank, NBFC, and venture debt offerings for Indian startups.",
};

export default async function BankPage() {
  const schemes = await loadBankSchemes();
  const government = schemes.filter(item => (item.type || "").toLowerCase().includes("government"));
  const privateBanks = schemes.filter(item => (item.type || "").toLowerCase().includes("private"));
  const ventureDebt = schemes.filter(item => (item.type || "").toLowerCase().includes("venture"));
  const featured = schemes.slice(0, 40);

  return (
    <div className="min-h-screen bg-[var(--system-background)]">
      <Navbar />
      <main className="container mx-auto max-w-6xl px-4 py-10 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold" style={{ color: "var(--label)" }}>
            Bank & Debt Products
          </h1>
          <p className="text-base" style={{ color: "var(--secondary-label)" }}>
            Documotion tracks {schemes.length} active products with underwriting notes, eligibility, and
            document packs. Share additional context with our concierge to shortlist the best fit.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Government-backed", count: government.length, tone: "var(--system-green)" },
            { label: "Private banks", count: privateBanks.length, tone: "var(--system-blue)" },
            { label: "Venture debt & others", count: ventureDebt.length, tone: "var(--system-purple)" },
          ].map(card => (
            <div key={card.label} className="glass rounded-2xl p-6 border border-white/10">
              <div className="text-sm uppercase tracking-wide" style={{ color: "var(--tertiary-label)" }}>
                {card.label}
              </div>
              <div className="text-3xl font-bold" style={{ color: card.tone }}>
                {card.count}
              </div>
            </div>
          ))}
        </section>

        <section className="glass rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left uppercase text-xs tracking-wide" style={{ color: "var(--tertiary-label)" }}>
                  <th className="px-4 py-3">Bank</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Loan Range</th>
                  <th className="px-4 py-3">Interest / Tenure</th>
                  <th className="px-4 py-3">Eligibility</th>
                </tr>
              </thead>
              <tbody>
                {featured.map(entry => (
                  <tr key={`${entry.bankName}-${entry.schemeName}`} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-4">
                      <div className="font-semibold" style={{ color: "var(--label)" }}>
                        {entry.bankName}
                      </div>
                      <div className="text-xs" style={{ color: "var(--tertiary-label)" }}>
                        {(entry.type || "—").toUpperCase()}
                      </div>
                    </td>
                    <td className="px-4 py-4" style={{ color: "var(--secondary-label)" }}>
                      {entry.schemeName}
                    </td>
                    <td className="px-4 py-4" style={{ color: "var(--secondary-label)" }}>
                      {entry.minLoanAmount || entry.maxLoanAmount
                        ? `₹${Number(entry.minLoanAmount || 0).toLocaleString()} - ₹${Number(entry.maxLoanAmount || 0).toLocaleString()}`
                        : "Varies"}
                    </td>
                    <td className="px-4 py-4" style={{ color: "var(--secondary-label)" }}>
                      {entry.interestRate || "—"} • {entry.tenure || "Flexible"}
                    </td>
                    <td className="px-4 py-4" style={{ color: "var(--secondary-label)" }}>
                      {entry.eligibility || "Talk to concierge for specifics"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

