import Navbar from '@/components/Navbar';
import AdminDashboard from '@/components/agency-profile/AdminDashboard';

export const dynamic = 'force-dynamic';

export default function BrandingAdminPage() {
  return (
    <div className="min-h-screen bg-[var(--system-background)]">
      <Navbar />
      <main className="container mx-auto max-w-6xl px-4 py-12 space-y-8">
        <AdminDashboard />
      </main>
    </div>
  );
}

