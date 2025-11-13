import { Quote, Star } from 'lucide-react';

export default function AgencyReviews({ reviews = [], rating }) {
  if (!reviews.length) {
    return null;
  }

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: 'var(--label)' }}>
            Reviews & Founder Feedback
          </h2>
          <p className="text-sm" style={{ color: 'var(--secondary-label)' }}>
            Signals from founders and marketing leaders who have shipped campaigns with this agency.
          </p>
        </div>
        {rating ? (
          <span
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold"
            style={{ color: 'var(--label)' }}
          >
            <Star className="h-5 w-5 text-amber-400" />
            {rating.toFixed(1)} / 5.0
          </span>
        ) : null}
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {reviews.map(review => (
          <article
            key={review.id}
            className="glass flex h-full flex-col rounded-2xl border border-white/10 p-6"
          >
            <Quote className="mb-3 h-6 w-6 text-blue-300" />
            <p
              className="flex-1 text-sm leading-relaxed"
              style={{ color: 'var(--secondary-label)' }}
            >
              “{review.comment || review.headline || 'Great collaboration experience.'}”
            </p>
            <div className="mt-4 space-y-1 text-sm" style={{ color: 'var(--label)' }}>
              <p className="font-semibold">{review.authorName}</p>
              <p
                className="text-xs uppercase tracking-wide"
                style={{ color: 'var(--tertiary-label)' }}
              >
                {review.authorRole ?? review.company ?? ''}
              </p>
            </div>
            <div
              className="mt-3 flex items-center gap-2 text-xs"
              style={{ color: 'var(--tertiary-label)' }}
            >
              <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-1">
                <Star className="h-3.5 w-3.5 text-amber-300" />
                {review.rating}/5
              </span>
              {review.projectType ? <span>{review.projectType}</span> : null}
              {review.createdAt ? (
                <span>{new Date(review.createdAt).toLocaleDateString('en-IN')}</span>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
