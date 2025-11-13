'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Loader2, RefreshCcw, ShieldAlert } from 'lucide-react';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAgencies = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/branding/agencies?limit=50&includeServices=true', {
        cache: 'no-store',
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(payload.error || `Failed with status ${res.status}`);
      }
      setAgencies(payload.data ?? []);
    } catch (err) {
      console.error('Admin agencies fetch failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAgencies();
    }
  }, [status]);

  if (status === 'loading') {
    return (
      <div
        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
        style={{ color: 'var(--secondary-label)' }}
      >
        <Loader2 className="h-4 w-4 animate-spin text-blue-300" />
        Checking access…
      </div>
    );
  }

  if (status !== 'authenticated') {
    return (
      <div
        className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-8 text-sm"
        style={{ color: 'var(--secondary-label)' }}
      >
        <div
          className="flex items-center gap-3 text-base font-semibold"
          style={{ color: 'var(--label)' }}
        >
          <ShieldAlert className="h-5 w-5 text-amber-400" />
          Admin access required
        </div>
        <p>
          Sign in with a Documotion admin account to manage agency profiles, update portfolios, and
          review incoming leads. This view is restricted because it exposes verified partner data
          and lead pipeline information.
        </p>
        <p>
          Once NextAuth is configured, ensure the session role is <code>admin</code> or assign{' '}
          <code>branding_manager</code> permissions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--label)' }}>
            Branding Hub Admin
          </h1>
          <p className="text-sm" style={{ color: 'var(--secondary-label)' }}>
            Manage agency data, update pricing, upload case studies, and review inbound hire leads.
          </p>
          {session?.user?.email ? (
            <p className="text-xs" style={{ color: 'var(--tertiary-label)' }}>
              Signed in as {session.user.email}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={fetchAgencies}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
          style={{ color: 'var(--label)' }}
        >
          <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error ? (
        <div
          className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm"
          style={{ color: 'var(--label)' }}
        >
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="min-w-full divide-y divide-white/10 text-sm">
          <thead className="bg-white/5" style={{ color: 'var(--tertiary-label)' }}>
            <tr>
              <th className="px-4 py-2 text-left font-semibold uppercase tracking-wide">Agency</th>
              <th className="px-4 py-2 text-left font-semibold uppercase tracking-wide">City</th>
              <th className="px-4 py-2 text-left font-semibold uppercase tracking-wide">Rating</th>
              <th className="px-4 py-2 text-left font-semibold uppercase tracking-wide">
                Verified
              </th>
              <th className="px-4 py-2 text-left font-semibold uppercase tracking-wide">
                Min Budget
              </th>
              <th className="px-4 py-2 text-left font-semibold uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {agencies.map(agency => (
              <tr
                key={agency.id}
                className="border-b border-white/5"
                style={{ color: 'var(--secondary-label)' }}
              >
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-semibold" style={{ color: 'var(--label)' }}>
                      {agency.name}
                    </span>
                    <span
                      className="text-xs uppercase tracking-wide"
                      style={{ color: 'var(--tertiary-label)' }}
                    >
                      {(agency.categories ?? []).join(', ') || '—'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">{agency.city ?? '—'}</td>
                <td className="px-4 py-3">{agency.rating ? agency.rating.toFixed(1) : '—'}</td>
                <td className="px-4 py-3">{agency.verified ? 'Yes' : 'No'}</td>
                <td className="px-4 py-3">
                  {agency.minBudget ? `₹${agency.minBudget.toLocaleString('en-IN')}` : 'On request'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/branding/admin/agencies/${agency.id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold transition hover:bg-white/10"
                      style={{ color: 'var(--label)' }}
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/branding/agencies/${agency.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold transition hover:bg-white/10"
                      style={{ color: 'var(--secondary-label)' }}
                    >
                      View
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-6 text-sm"
        style={{ color: 'var(--secondary-label)' }}
      >
        <p className="font-semibold" style={{ color: 'var(--label)' }}>
          Coming soon
        </p>
        <ul className="list-disc pl-5">
          <li>Upload brand assets (logo, banners) with automatic CDN storage.</li>
          <li>Manage pricing tiers &amp; retainers with AI-suggested adjustments.</li>
          <li>Respond to lead briefs directly and update proposal status.</li>
          <li>Promote agency to “Featured” via pay-to-rank workflow.</li>
        </ul>
      </div>
    </div>
  );
}
