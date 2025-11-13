import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import AdminAgencyEditor from '@/components/agency-profile/AdminAgencyEditor';
import { getAgencyById } from '@/lib/brandingHub';

export const dynamic = 'force-dynamic';

export default async function AdminAgencyPage({ params }) {
  const agency = await getAgencyById(params.id, { includeServices: true, includePortfolio: false });

  if (!agency) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[var(--system-background)]">
      <Navbar />
      <main className="container mx-auto max-w-5xl px-4 py-12 space-y-10">
        <AdminAgencyEditor agency={agency} />
      </main>
    </div>
  );
}

