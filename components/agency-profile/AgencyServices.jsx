import { ClipboardList, Timer, Wallet } from 'lucide-react';

export default function AgencyServices({ services }) {
  if (!services?.length) {
    return null;
  }

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--label)' }}>
          Services Offered
        </h2>
        <p className="text-sm" style={{ color: 'var(--secondary-label)' }}>
          Modular offerings covering strategy, production, and growth execution. Highlighted
          services are pre-scoped for quick onboarding.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {services.map(service => (
          <article
            key={service.id}
            className="glass space-y-3 rounded-2xl border border-white/10 p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold" style={{ color: 'var(--label)' }}>
                  {service.name}
                </h3>
                {service.category ? (
                  <p
                    className="text-xs uppercase tracking-wide"
                    style={{ color: 'var(--tertiary-label)' }}
                  >
                    {service.category}
                  </p>
                ) : null}
              </div>
              {service.isPrimary ? (
                <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-200">
                  Core Package
                </span>
              ) : null}
            </div>

            {service.description ? (
              <p className="text-sm leading-relaxed" style={{ color: 'var(--secondary-label)' }}>
                {service.description}
              </p>
            ) : null}

            <div
              className="flex flex-wrap items-center gap-4 text-xs"
              style={{ color: 'var(--secondary-label)' }}
            >
              {service.deliveryType ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2.5 py-1">
                  <ClipboardList className="h-3.5 w-3.5 text-blue-300" />
                  {service.deliveryType}
                </span>
              ) : null}
              {service.minTimeline || service.maxTimeline ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2.5 py-1">
                  <Timer className="h-3.5 w-3.5 text-blue-300" />
                  {service.minTimeline ?? 'Flexible'}
                  {service.maxTimeline ? ` – ${service.maxTimeline}` : ''}
                </span>
              ) : null}
              {service.startingPrice ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2.5 py-1">
                  <Wallet className="h-3.5 w-3.5 text-blue-300" />
                  From ₹{service.startingPrice.toLocaleString('en-IN')}
                </span>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
