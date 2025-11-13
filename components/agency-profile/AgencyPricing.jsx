import { CheckCircle2, Sparkles } from 'lucide-react';

function formatCurrency(amount, currency = 'INR') {
  if (!amount && amount !== 0) return null;
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (error) {
    return `${currency} ${amount.toLocaleString?.('en-IN') ?? amount}`;
  }
}

export default function AgencyPricing({ services = [], minBudget, maxBudget, currency = 'INR' }) {
  if (!services.length && !minBudget && !maxBudget) {
    return null;
  }

  const spotlightPackages = services.length ? services.slice(0, 3) : [];

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--label)' }}>
          Pricing & Engagement Models
        </h2>
        <p className="text-sm" style={{ color: 'var(--secondary-label)' }}>
          Transparent retainers and project packages built for early-stage to growth-stage
          companies. Custom quotes available for hybrid scopes.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {spotlightPackages.map((service, index) => (
          <article
            key={service.id}
            className="glass relative flex h-full flex-col rounded-2xl border border-white/10 p-6"
          >
            {service.isPrimary && (
              <span className="absolute -top-3 right-4 inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-100">
                <Sparkles className="h-3 w-3" />
                Most booked
              </span>
            )}
            <div className="space-y-1">
              <p
                className="text-xs uppercase tracking-wide"
                style={{ color: 'var(--tertiary-label)' }}
              >
                Package {index + 1}
              </p>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--label)' }}>
                {service.name}
              </h3>
            </div>
            <div className="space-y-2 py-3">
              <p className="text-2xl font-semibold" style={{ color: 'var(--system-blue)' }}>
                {service.startingPrice
                  ? formatCurrency(service.startingPrice, service.currency ?? currency)
                  : 'Custom quoted'}
              </p>
              {service.deliveryType ? (
                <p
                  className="text-xs uppercase tracking-wide"
                  style={{ color: 'var(--secondary-label)' }}
                >
                  {service.deliveryType}
                </p>
              ) : null}
              {service.minTimeline || service.maxTimeline ? (
                <p className="text-xs" style={{ color: 'var(--secondary-label)' }}>
                  Timeline {service.minTimeline ?? 'Flexible'}
                  {service.maxTimeline ? ` – ${service.maxTimeline}` : ''}
                </p>
              ) : null}
            </div>
            {service.description ? (
              <ul className="space-y-2 text-sm" style={{ color: 'var(--secondary-label)' }}>
                {service.description
                  .split('. ')
                  .slice(0, 3)
                  .map(point => (
                    <li key={point} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-400" />
                      <span>{point}</span>
                    </li>
                  ))}
              </ul>
            ) : null}
            <div className="mt-auto pt-4 text-xs" style={{ color: 'var(--tertiary-label)' }}>
              Includes: discovery, onboarding, and weekly reviews.
            </div>
          </article>
        ))}

        <article
          className="glass flex flex-col justify-center rounded-2xl border border-dashed border-blue-500/40 bg-blue-500/5 p-6 text-sm leading-relaxed"
          style={{ color: 'var(--secondary-label)' }}
        >
          <h3 className="text-lg font-semibold" style={{ color: 'var(--label)' }}>
            Typical Engagement Range
          </h3>
          <p>
            {minBudget ? formatCurrency(minBudget, currency) : 'Starts at founder-friendly pricing'}
            {maxBudget ? ` – ${formatCurrency(maxBudget, currency)}` : ''}.
          </p>
          <p className="pt-3">
            Looking for ongoing support or multi-market rollout? Use the hire form below for a
            tailored scope and rate card.
          </p>
        </article>
      </div>
    </section>
  );
}
