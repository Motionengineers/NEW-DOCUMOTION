import Navbar from "@/components/Navbar";
import { loadPitchDecks } from "@/lib/dataSources";

export const metadata = {
  title: "Pitch Deck Library • Documotion",
  description: "Reference successful decks from Indian startups across stages and sectors.",
};

export default async function PitchDeckPage() {
  const decks = await loadPitchDecks();
  const featured = decks.slice(0, 30);

  return (
    <div className="min-h-screen bg-[var(--system-background)]">
      <Navbar />
      <main className="container mx-auto max-w-6xl px-4 py-10 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold" style={{ color: "var(--label)" }}>
            Pitch Deck Library
          </h1>
          <p className="text-base" style={{ color: "var(--secondary-label)" }}>
            Download anonymised decks used by Indian founders at seed, Series A, and beyond.
            Each deck is sourced from public accelerators or founder submissions. Use responsibly.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map(deck => (
            <article key={`${deck.title}-${deck.fileUrl}`} className="glass rounded-2xl p-6 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold" style={{ color: "var(--label)" }}>
                  {deck.title}
                </h2>
                {deck.stage && (
                  <span className="text-xs uppercase tracking-wide px-2 py-1 rounded-full bg-white/10" style={{ color: "var(--tertiary-label)" }}>
                    {deck.stage.replace("_", " ")}
                  </span>
                )}
              </div>
              {deck.companyName && (
                <div className="text-sm" style={{ color: "var(--secondary-label)" }}>
                  {deck.companyName}
                </div>
              )}
              <div className="text-xs" style={{ color: "var(--tertiary-label)" }}>
                {deck.industry || deck.category || "Multi-sector"} • {deck.year || "2024"}
              </div>
              <a
                href={deck.fileUrl.startsWith("http") ? deck.fileUrl : deck.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-medium"
                style={{ color: "var(--system-blue)" }}
              >
                View Deck →
              </a>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

