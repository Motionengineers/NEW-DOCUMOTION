import Navbar from '@/components/Navbar';
import { loadBankPrograms } from '@/lib/dataSources';

export const metadata = {
  title: 'Startup Banking Programmes • Documotion',
  description:
    'Browse curated bank and fintech programmes for Indian startups. Compare eligibility, benefits, loan ranges, and jump straight to the application portals.',
};

function formatLoanRange(min, max) {
  if (min == null && max == null) return 'Custom / depends on assessment';
  const fmt = value => (value == null ? '—' : `₹${value}L`);
  return `${fmt(min)} – ${fmt(max)}`;
}

function summariseEligibility(eligibility = {}) {
  const items = [];
  if (eligibility.stages?.length) {
    items.push(`Stages: ${eligibility.stages.join(', ').toUpperCase()}`);
  }
  if (eligibility.sectors?.length) {
    items.push(`Sectors: ${eligibility.sectors.join(', ')}`);
  }
  if (eligibility.minRevenue != null || eligibility.maxRevenue != null) {
    const min = eligibility.minRevenue ?? 0;
    const max = eligibility.maxRevenue;
    items.push(`Revenue: ₹${min}cr${max != null ? `–₹${max}cr` : '+'}`);
  }
  if (eligibility.states?.length) {
    items.push(`States: ${eligibility.states.join(', ')}`);
  }
  if (eligibility.specialCriteria?.length) {
    items.push(`Special: ${eligibility.specialCriteria.join(', ')}`);
  }
  return items.length ? items.join(' • ') : 'Available nationally; confirm with relationship manager';
}

function summariseServices(program) {
  const list = program.services || program.programType || [];
  if (!list.length) return 'See programme details';
  return list
    .map(token => token.replace(/-/g, ' '))
    .join(', ');
}

export default async function BankProgramsPage() {
  const programmes = await loadBankPrograms();

  return (
    <div className="min-h-screen bg-[var(--system-background)]">
      <Navbar />
      <main className="container mx-auto max-w-6xl space-y-8 px-4 py-10">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold" style={{ color: 'var(--label)' }}>
            Startup Banking Programmes
          </h1>
          <p className="text-base" style={{ color: 'var(--secondary-label)' }}>
            We track {programmes.length} bank and fintech offers tailored to Indian startups. Explore their focus areas,
            eligibility, and benefits before speaking to a relationship manager. For personalised matches, continue to use the
            Startup Banking Directory.
          </p>
        </header>

        <section className="glass rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left uppercase text-xs tracking-wide" style={{ color: 'var(--tertiary-label)' }}>
                  <th className="px-4 py-3">Bank / Fintech</th>
                  <th className="px-4 py-3">Programme</th>
                  <th className="px-4 py-3">Services</th>
                  <th className="px-4 py-3">Loan Range</th>
                  <th className="px-4 py-3">Eligibility</th>
                  <th className="px-4 py-3">Benefits</th>
                  <th className="px-4 py-3">Apply</th>
                </tr>
              </thead>
              <tbody>
                {programmes.map(program => (
                  <tr key={program.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-4 align-top">
                      <div className="font-semibold" style={{ color: 'var(--label)' }}>
                        {program.bankName}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--tertiary-label)' }}>
                        {program.bankType ? program.bankType.toUpperCase() : 'BANK'}
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top" style={{ color: 'var(--secondary-label)' }}>
                      <div className="font-medium text-white/90">{program.programName}</div>
                      {program.programType?.length ? (
                        <div className="mt-1 text-xs text-blue-200/70">{program.programType.join(', ')}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 align-top" style={{ color: 'var(--secondary-label)' }}>
                      {summariseServices(program)}
                    </td>
                    <td className="px-4 py-4 align-top" style={{ color: 'var(--secondary-label)' }}>
                      {formatLoanRange(program.minLoanAmount, program.maxLoanAmount)}
                      {program.interestRate ? (
                        <div className="text-xs text-blue-200/70">Rate: {program.interestRate}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 align-top" style={{ color: 'var(--secondary-label)' }}>
                      {summariseEligibility(program.eligibility)}
                    </td>
                    <td className="px-4 py-4 align-top" style={{ color: 'var(--secondary-label)' }}>
                      <ul className="space-y-1">
                        {(program.benefits || []).slice(0, 3).map(benefit => (
                          <li key={benefit}>{benefit}</li>
                        ))}
                        {(program.benefits || []).length > 3 ? (
                          <li className="text-xs text-blue-200/70">+ more when you engage</li>
                        ) : null}
                      </ul>
                    </td>
                    <td className="px-4 py-4 align-top">
                      {program.applyUrl ? (
                        <a
                          href={program.applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm"
                          style={{ color: 'var(--system-blue)' }}
                        >
                          Apply →
                        </a>
                      ) : program.contact?.email ? (
                        <a href={`mailto:${program.contact.email}`} className="text-sm" style={{ color: 'var(--system-blue)' }}>
                          Email RM
                        </a>
                      ) : (
                        <span style={{ color: 'var(--tertiary-label)' }}>N/A</span>
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

