import Image from 'next/image';
import { ExternalLink, Play } from 'lucide-react';

export default function AgencyPortfolio({ portfolio }) {
  if (!portfolio?.length) {
    return null;
  }

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--label)' }}>
          Portfolio & Case Studies
        </h2>
        <p className="text-sm" style={{ color: 'var(--secondary-label)' }}>
          Recent launches, campaigns, and brand systems shipped by the agency across categories and
          formats.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {portfolio.map(item => (
          <article
            key={item.id ?? item.slug ?? item.title}
            className="glass space-y-3 overflow-hidden rounded-2xl border border-white/10"
          >
            <div className="relative h-48 w-full border-b border-white/10 bg-white/5">
              {item.mediaType === 'video' ? (
                <div
                  className="flex h-full w-full items-center justify-center text-sm"
                  style={{ color: 'var(--secondary-label)' }}
                >
                  <Play className="h-8 w-8 text-blue-300" />
                  <span className="ml-2">Video showcase</span>
                </div>
              ) : item.thumbnailUrl || item.mediaUrl ? (
                <Image
                  src={item.thumbnailUrl ?? item.mediaUrl}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center text-sm"
                  style={{ color: 'var(--tertiary-label)' }}
                >
                  Preview coming soon
                </div>
              )}
            </div>

            <div className="space-y-2 px-5 pb-5 pt-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--label)' }}>
                    {item.title}
                  </h3>
                  {item.clientName ? (
                    <p
                      className="text-xs uppercase tracking-wide"
                      style={{ color: 'var(--tertiary-label)' }}
                    >
                      {item.clientName}
                    </p>
                  ) : null}
                </div>
                {item.year ? (
                  <span
                    className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide"
                    style={{ color: 'var(--secondary-label)' }}
                  >
                    {item.year}
                  </span>
                ) : null}
              </div>

              {item.description ? (
                <p className="text-sm leading-relaxed" style={{ color: 'var(--secondary-label)' }}>
                  {item.description}
                </p>
              ) : null}

              <div
                className="flex flex-wrap items-center gap-2 text-xs"
                style={{ color: 'var(--tertiary-label)' }}
              >
                {item.industry?.map ? (
                  item.industry.map(tag => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1"
                    >
                      {tag}
                    </span>
                  ))
                ) : item.industry ? (
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                    {item.industry}
                  </span>
                ) : null}
                {item.tags?.map
                  ? item.tags.map(tag => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1"
                      >
                        {tag}
                      </span>
                    ))
                  : null}
              </div>

              {item.caseStudyUrl ? (
                <a
                  href={item.caseStudyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold transition hover:underline"
                  style={{ color: 'var(--system-blue)' }}
                >
                  View case study
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : item.mediaUrl && item.mediaType === 'video' ? (
                <a
                  href={item.mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold transition hover:underline"
                  style={{ color: 'var(--system-blue)' }}
                >
                  Watch video
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
