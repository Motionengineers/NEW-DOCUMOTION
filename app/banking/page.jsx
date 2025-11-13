import Navbar from '@/components/Navbar';
import BankDirectory from '@/components/banking/BankDirectory';
import { loadStartupBanks } from '@/lib/dataSources';

export const metadata = {
  title: 'Startup Banking Directory • Documotion',
  description:
    'Explore startup-friendly banking partners across India, compare offerings, and contact the right branch instantly.',
};

export default async function StartupBankingDirectoryPage() {
  const banks = await loadStartupBanks();

  return (
    <div className="min-h-screen bg-[var(--system-background)]">
      <Navbar />
      <main className="container mx-auto max-w-6xl px-4 py-10">
        <BankDirectory banks={banks} />
      </main>
    </div>
  );
}
