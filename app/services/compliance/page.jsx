import Navbar from '@/components/Navbar';
import { complianceServices } from '@/data/compliance-catalog';

export const metadata = {
  title: 'Compliance & Certifications • Documotion',
  description:
    'Automate annual compliance, certifications, and ongoing filings with Documotion specialists.',
};

const CATEGORY_LABELS = {
  certification: 'Certifications & Registrations',
  annual_compliance: 'Annual & Monthly Filings',
  post_registration: 'Post-registration Activities',
};

export default function ComplianceServicesPage() {
  const servicesByCategory = Object.entries(
    complianceServices.reduce((acc, item) => {
      const key = item.category || 'other';
      acc[key] = acc[key] || [];
      acc[key].push(item);
      return acc;
    }, {})
  );

  return (
    <div className="min-h-screen bg-[var(--system-background)]">
      <Navbar />
      <main className="container mx-auto max-w-6xl px-4 py-10 space-y-10">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold" style={{ color: 'var(--label)' }}>
            Compliance & Certification Desk
          </h1>
          <p className="text-base" style={{ color: 'var(--secondary-label)' }}>
            Stay ahead of filings and certifications with Documotion’s managed services. Engage our
            specialists for ISO, GST, ROC, payroll, and post-incorporation compliance. Each listing
            below includes turnaround times, document checklists, and transparent pricing.
          </p>
        </header>

        {servicesByCategory.map(([category, items]) => (
          <section key={category} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold" style={{ color: 'var(--label)' }}>
                {CATEGORY_LABELS[category] || 'Additional Services'}
              </h2>
              <span className="text-sm" style={{ color: 'var(--tertiary-label)' }}>
                {items.length} services
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map(service => (
                <article
                  key={service.id}
                  className="glass rounded-2xl p-6 border border-white/10 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--label)' }}>
                      {service.name}
                    </h3>
                    {typeof service.price === 'number' ? (
                      <span className="text-sm font-medium" style={{ color: 'var(--system-blue)' }}>
                        ₹{service.price.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-sm font-medium" style={{ color: 'var(--system-blue)' }}>
                        {service.price || 'Custom'}
                      </span>
                    )}
                  </div>

                  <p className="text-sm" style={{ color: 'var(--secondary-label)' }}>
                    {service.description}
                  </p>

                  {service.duration && (
                    <div
                      className="text-xs uppercase tracking-wide"
                      style={{ color: 'var(--tertiary-label)' }}
                    >
                      Turnaround: {service.duration}
                    </div>
                  )}

                  <div className="space-y-2">
                    <div
                      className="text-xs font-semibold"
                      style={{ color: 'var(--secondary-label)' }}
                    >
                      Requirements
                    </div>
                    <ul className="space-y-1 text-xs" style={{ color: 'var(--secondary-label)' }}>
                      {service.requirements.slice(0, 4).map(req => (
                        <li key={req}>• {req}</li>
                      ))}
                      {service.requirements.length > 4 && <li>• + more as per scope</li>}
                    </ul>
                  </div>

                  {service.deadline && (
                    <div
                      className="rounded-lg px-3 py-2 text-xs"
                      style={{
                        backgroundColor: 'rgba(255, 193, 7, 0.1)',
                        color: 'var(--system-yellow)',
                      }}
                    >
                      Deadline: {service.deadline}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
