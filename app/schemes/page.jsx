import Navbar from "@/components/Navbar";
import { loadGovtSchemes } from "@/lib/dataSources";

export const metadata = {
  title: "Government Schemes • Documotion",
  description: "Browse curated government programmes with eligibility, benefits, and official links.",
};

export default async function SchemesPage() {
  const schemes = await loadGovtSchemes();
  const featured = schemes.slice(0, 50);

  return (
    <div className="min-h-screen bg-[var(--system-background)]">
      <Navbar />
      <main className="container mx-auto max-w-6xl px-4 py-10 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold" style={{ color: "var(--label)" }}>
            Government Schemes
          </h1>
            <p className="text-base" style={{ color: "var(--secondary-label)" }}>
              We actively monitor {schemes.length} Indian government programmes for startups and MSMEs.
              Filter highlights below or use the dashboard&apos;s Eligibility Checker for a personalised shortlist.
            </p>
        </header>

        <section className="glass rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left uppercase text-xs tracking-wide" style={{ color: "var(--tertiary-label)" }}>
                  <th className="px-4 py-3">Scheme</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Eligibility</th>
                  <th className="px-4 py-3">Benefits</th>
                  <th className="px-4 py-3">Link</th>
                </tr>
              </thead>
              <tbody>
                {featured.map(scheme => (
                  <tr key={scheme.scheme_name} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-4">
                      <div className="font-semibold" style={{ color: "var(--label)" }}>
                        {scheme.scheme_name}
                      </div>
                      <div className="text-xs" style={{ color: "var(--tertiary-label)" }}>
                        {scheme.ministry_or_department}
                      </div>
                    </td>
                    <td className="px-4 py-4" style={{ color: "var(--secondary-label)" }}>
                      {scheme.category || "—"}
                    </td>
                    <td className="px-4 py-4" style={{ color: "var(--secondary-label)" }}>
                      {scheme.eligibility || "Details available in portal"}
                    </td>
                    <td className="px-4 py-4" style={{ color: "var(--secondary-label)" }}>
                      {scheme.max_assistance || scheme.benefits || "—"}
                    </td>
                    <td className="px-4 py-4">
                      {scheme.official_link ? (
                        <a
                          href={scheme.official_link.startsWith("http") ? scheme.official_link : `https://${scheme.official_link}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm"
                          style={{ color: "var(--system-blue)" }}
                        >
                          Open →
                        </a>
                      ) : (
                        <span style={{ color: "var(--tertiary-label)" }}>N/A</span>
                      )}
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

