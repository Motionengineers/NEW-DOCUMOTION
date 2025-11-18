'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Loader2, RefreshCcw, ShieldAlert, BadgeCheck, UserPlus } from 'lucide-react';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [partners, setPartners] = useState([]);
  const [partnerLoading, setPartnerLoading] = useState(false);
  const [partnerError, setPartnerError] = useState(null);

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

  const fetchPartners = async () => {
    setPartnerLoading(true);
    setPartnerError(null);
    try {
      const res = await fetch('/api/branding/partners?limit=100', { cache: 'no-store' });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(payload.error || `Failed with status ${res.status}`);
      }
      setPartners(payload.data ?? []);
    } catch (err) {
      console.error('Admin partners fetch failed:', err);
      setPartnerError(err.message);
    } finally {
      setPartnerLoading(false);
    }
  };

  const handleTogglePartner = async (partnerId, verified) => {
    try {
      const res = await fetch(`/api/branding/partners/${partnerId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified }),
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(payload.error || `Failed with status ${res.status}`);
      }
      await fetchPartners();
    } catch (err) {
      console.error('Toggle partner verify failed:', err);
      window.alert(err.message || 'Unable to update verification status.');
    }
  };

  const handleAddPartner = async () => {
    const name = window.prompt('Partner or agency name');
    if (!name) return;
    const type = window.prompt('Type (AGENCY, PHOTOGRAPHER, MEDIA)', 'AGENCY');
    if (!type) return;
    const email = window.prompt('Primary contact email (optional)') || undefined;
    const city = window.prompt('City (optional)') || undefined;
    const portfolioUrl = window.prompt('Portfolio URL (optional)') || undefined;

    try {
      const res = await fetch('/api/branding/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          type: type.toUpperCase(),
          contactEmail: email || undefined,
          city: city || undefined,
          portfolioUrl: portfolioUrl || undefined,
        }),
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(payload.error || `Failed with status ${res.status}`);
      }
      await fetchPartners();
    } catch (err) {
      console.error('Create partner failed:', err);
      window.alert(err.message || 'Unable to add partner.');
    }
  };

  const handleViewBookings = async partnerId => {
    try {
      const res = await fetch(`/api/branding/partners/${partnerId}/bookings`, {
        cache: 'no-store',
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(payload.error || `Failed with status ${res.status}`);
      }
      if (!payload.data?.length) {
        window.alert('No booking requests yet.');
        return;
      }
      const summary = payload.data
        .map(
          item =>
            `${item.requesterName} • ${item.requesterEmail} • ${item.status} • ${new Date(
              item.createdAt
            ).toLocaleString()}\n${item.requestNotes ?? ''}`
        )
        .join('\n\n');
      window.alert(summary);
    } catch (err) {
      console.error('Fetch partner bookings failed:', err);
      window.alert(err.message || 'Unable to load bookings.');
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAgencies();
      fetchPartners();
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
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={fetchPartners}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
            style={{ color: 'var(--label)' }}
          >
            <BadgeCheck className={`h-4 w-4 ${partnerLoading ? 'animate-spin' : ''}`} />
            Refresh partners
          </button>
          <button
            type="button"
            onClick={handleAddPartner}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
            style={{ color: 'var(--label)' }}
          >
            <UserPlus className="h-4 w-4" />
            Add partner
          </button>
          <button
            type="button"
            onClick={fetchAgencies}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/10"
            style={{ color: 'var(--label)' }}
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh agencies
          </button>
        </div>
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

      <div className="space-y-3">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--label)' }}>
          Verified branding partners
        </h2>
        {partnerError ? (
          <div
            className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm"
            style={{ color: 'var(--label)' }}
          >
            {partnerError}
          </div>
        ) : null}
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="min-w-full divide-y divide-white/10 text-sm">
            <thead className="bg-white/5" style={{ color: 'var(--tertiary-label)' }}>
              <tr>
                <th className="px-4 py-2 text-left font-semibold uppercase tracking-wide">Partner</th>
                <th className="px-4 py-2 text-left font-semibold uppercase tracking-wide">Type</th>
                <th className="px-4 py-2 text-left font-semibold uppercase tracking-wide">City</th>
                <th className="px-4 py-2 text-left font-semibold uppercase tracking-wide">Verified</th>
                <th className="px-4 py-2 text-left font-semibold uppercase tracking-wide">Contact</th>
                <th className="px-4 py-2 text-left font-semibold uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {partners.map(partner => (
                <tr
                  key={partner.id}
                  className="border-b border-white/5"
                  style={{ color: 'var(--secondary-label)' }}
                >
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-semibold" style={{ color: 'var(--label)' }}>
                        {partner.name}
                      </span>
                      <span className="text-xs text-slate-400">
                        Added {new Date(partner.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{partner.type}</td>
                  <td className="px-4 py-3">{partner.city ?? '—'}</td>
                  <td className="px-4 py-3">{partner.verified ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3">{partner.contactEmail ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleTogglePartner(partner.id, !partner.verified)}
                        className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold transition hover:bg-white/10"
                        style={{ color: 'var(--label)' }}
                      >
                        {partner.verified ? 'Unverify' : 'Verify'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleViewBookings(partner.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold transition hover:bg-white/10"
                        style={{ color: 'var(--secondary-label)' }}
                      >
                        View bookings
                      </button>
                      {partner.portfolioUrl ? (
                        <a
                          href={partner.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold transition hover:bg-white/10"
                          style={{ color: 'var(--secondary-label)' }}
                        >
                          Portfolio
                        </a>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
