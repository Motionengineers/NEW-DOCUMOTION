import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { loadPitchDecks } from '@/lib/dataSources';

export const metadata = {
  title: 'Pitch Deck Library • Documotion',
  description: 'Reference successful decks from Indian startups across stages and sectors.',
};

export default async function PitchDeckPage({ searchParams }) {
  const decks = await loadPitchDecks();
  const uniqueStages = Array.from(
    new Map(decks.map(deck => [deck.stageSlug, deck.stage])).entries()
  ).map(([slug, label]) => ({ slug, label }));

  const activeStage = typeof searchParams?.stage === 'string' ? searchParams.stage : undefined;
  const visibleDecks = activeStage ? decks.filter(deck => deck.stageSlug === activeStage) : decks;

  return (
    <div className="min-h-screen bg-[var(--system-background)]">
      <Navbar />
      <main className="container mx-auto max-w-6xl px-4 py-10 space-y-8">
        <header className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold" style={{ color: 'var(--label)' }}>
              Pitch Deck Library
            </h1>
            <p className="text-base" style={{ color: 'var(--secondary-label)' }}>
              Download anonymised decks used by Indian founders at seed, Series A, and beyond. Each
              deck is sourced from public accelerators or founder submissions. Use responsibly.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <StageLink href="/pitch-decks" active={!activeStage}>
              All
            </StageLink>
            {uniqueStages.map(stage => (
              <StageLink
                key={stage.slug}
                href={`/pitch-decks?stage=${stage.slug}`}
                active={activeStage === stage.slug}
              >
                {stage.label}
              </StageLink>
            ))}
          </div>
        </header>

        {visibleDecks.length === 0 ? (
          <div
            className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-sm"
            style={{ color: 'var(--secondary-label)' }}
          >
            No decks found for this filter yet. Check another stage or check back soon.
          </div>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleDecks.map(deck => (
              <article
                key={`${deck.stageSlug}-${deck.fileName}`}
                className="glass rounded-2xl p-6 border border-white/10 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <h2
                    className="text-lg font-semibold leading-tight"
                    style={{ color: 'var(--label)' }}
                  >
                    {deck.title}
                  </h2>
                  {deck.stage && (
                    <span
                      className="text-xs uppercase tracking-wide px-2 py-1 rounded-full bg-white/10 whitespace-nowrap"
                      style={{ color: 'var(--tertiary-label)' }}
                    >
                      {deck.stage}
                    </span>
                  )}
                </div>
                <div className="text-xs" style={{ color: 'var(--tertiary-label)' }}>
                  {deck.sourceFolder}
                </div>
                <a
                  href={deck.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm font-medium"
                  style={{ color: 'var(--system-blue)' }}
                >
                  View Deck →
                </a>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

function StageLink({ href, active, children }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
        active
          ? 'border-blue-500 bg-blue-600 text-white'
          : 'border-white/10 bg-white/[0.02] text-[var(--secondary-label)] hover:bg-white/[0.06]'
      }`}
    >
      {children}
    </Link>
  );
}
