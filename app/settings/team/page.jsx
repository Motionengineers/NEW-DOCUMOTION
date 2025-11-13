'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import {
  ArrowUpRight,
  CheckCircle2,
  Crown,
  Loader2,
  Mail,
  MoreVertical,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';

const ROLE_BADGE = {
  OWNER: 'bg-red-500/10 text-red-300 border-red-500/30',
  ADMIN: 'bg-blue-500/10 text-blue-200 border-blue-500/30',
  EDITOR: 'bg-emerald-500/10 text-emerald-200 border-emerald-500/30',
  VIEWER: 'bg-slate-500/10 text-slate-200 border-slate-500/30',
};

const ROLE_LABEL = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  EDITOR: 'Editor',
  VIEWER: 'Viewer',
};

const ROLE_OPTIONS = Object.keys(ROLE_LABEL);

const initialInviteForm = {
  name: '',
  email: '',
  role: 'VIEWER',
  managerEmail: '',
  message: '',
};

function formatRelative(date) {
  if (!date) return '—';
  const target = typeof date === 'string' ? new Date(date) : date;
  const diff = Date.now() - target.getTime();
  if (Number.isNaN(diff)) return '—';
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return target.toLocaleDateString();
}

function RoleBadge({ role }) {
  const classes = ROLE_BADGE[role] ?? ROLE_BADGE.VIEWER;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs ${classes}`}
    >
      {role === 'OWNER' ? (
        <Crown className="h-3.5 w-3.5" />
      ) : role === 'ADMIN' ? (
        <ShieldCheck className="h-3.5 w-3.5" />
      ) : null}
      {ROLE_LABEL[role] ?? role}
    </span>
  );
}

function Avatar({ name, email, image, size = 40 }) {
  const initials = useMemo(() => {
    if (name) {
      const parts = name.split(' ');
      return parts.length > 1
        ? `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
        : (name[0] ?? '').toUpperCase();
    }
    return (email?.[0] ?? 'U').toUpperCase();
  }, [name, email]);

  if (image) {
    return (
      <Image
        src={image}
        alt={name ?? email ?? 'Member avatar'}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
        sizes={`${size}px`}
      />
    );
  }

  return (
    <div
      className="flex items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-sm font-semibold text-slate-100"
      style={{ width: size, height: size }}
    >
      {initials || '?'}
    </div>
  );
}

function MemberCard({ member, onChangeRole, onRemove }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 shadow-lg backdrop-blur"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar name={member.name} email={member.email} image={member.image} />
          <div>
            <p className="text-base font-semibold text-white">{member.name || member.email}</p>
            <p className="text-sm text-slate-400">{member.email}</p>
          </div>
        </div>
        <RoleBadge role={member.teamRole} />
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span>
          Joined {formatRelative(member.createdAt)} · Last active {formatRelative(member.updatedAt)}
        </span>
        <div className="flex items-center gap-2">
          <select
            value={member.teamRole}
            onChange={event => onChangeRole(member.id, event.target.value)}
            className="rounded-lg border border-white/10 bg-transparent px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            {ROLE_OPTIONS.map(role => (
              <option key={role} value={role} className="bg-slate-900 text-slate-100">
                {ROLE_LABEL[role]}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => onRemove(member.id)}
            className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 px-2 py-1 text-xs text-red-300 transition hover:bg-red-500/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function PendingInviteRow({ invite, onResend, onRevoke }) {
  const expiresIn = Math.max(
    0,
    Math.ceil((new Date(invite.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  return (
    <motion.tr
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="border-b border-white/5 text-sm text-slate-300 last:border-none"
    >
      <td className="py-3">
        <div className="flex flex-col">
          <span className="font-medium text-white">{invite.email}</span>
          {invite.name && <span className="text-xs text-slate-500">{invite.name}</span>}
        </div>
      </td>
      <td className="py-3">
        <RoleBadge role={invite.role} />
      </td>
      <td className="py-3 text-slate-400">{formatRelative(invite.createdAt)}</td>
      <td className="py-3 text-slate-400">{expiresIn} days</td>
      <td className="py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onResend(invite.id)}
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1 text-xs text-slate-200 transition hover:bg-white/10"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Resend
          </button>
          <button
            type="button"
            onClick={() => onRevoke(invite.id)}
            className="inline-flex items-center gap-1 rounded-lg border border-red-500/20 px-3 py-1 text-xs text-red-300 transition hover:bg-red-500/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Revoke
          </button>
        </div>
      </td>
    </motion.tr>
  );
}

function InviteMemberModal({ open, onClose, onSubmit, submitting, form, setForm }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate-900/95 p-8 shadow-2xl"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Invite a teammate</h2>
            <p className="text-sm text-slate-400">
              Send a secure invite link. Pending invites appear in the panel on the right.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <MoreVertical className="h-4 w-4 rotate-90" />
          </button>
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={event => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm text-slate-300">
              Full name
              <input
                value={form.name}
                onChange={event => setForm(current => ({ ...current, name: event.target.value }))}
                type="text"
                placeholder="Aditi Sharma"
                className="w-full rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-300">
              Work email *
              <input
                value={form.email}
                onChange={event => setForm(current => ({ ...current, email: event.target.value }))}
                type="email"
                required
                placeholder="someone@agency.in"
                className="w-full rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm text-slate-300">
              Role *
              <select
                value={form.role}
                onChange={event => setForm(current => ({ ...current, role: event.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                {ROLE_OPTIONS.map(role => (
                  <option key={role} value={role} className="bg-slate-900 text-slate-100">
                    {ROLE_LABEL[role]}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-sm text-slate-300">
              Manager email (optional)
              <input
                value={form.managerEmail}
                onChange={event =>
                  setForm(current => ({ ...current, managerEmail: event.target.value }))
                }
                type="email"
                placeholder="manager@agency.in"
                className="w-full rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </label>
          </div>

          <label className="space-y-1 text-sm text-slate-300">
            Message (optional)
            <textarea
              value={form.message}
              onChange={event => setForm(current => ({ ...current, message: event.target.value }))}
              rows={3}
              placeholder="Share context for this invite…"
              className="w-full rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </label>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="h-4 w-4 text-blue-400" />
              <span>Invites expire in 7 days. Managers must approve when toggled in settings.</span>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              {submitting ? 'Sending invite…' : 'Send invite'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function TeamSettingsContent() {
  const searchParams = useSearchParams();
  const [agencyId, setAgencyId] = useState(() => {
    const fromQuery = Number(searchParams.get('agencyId') ?? '1');
    return Number.isNaN(fromQuery) ? 1 : fromQuery;
  });

  useEffect(() => {
    const fromQuery = Number(searchParams.get('agencyId') ?? '1');
    setAgencyId(Number.isNaN(fromQuery) ? 1 : fromQuery);
  }, [searchParams]);

  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState(initialInviteForm);
  const [submitting, setSubmitting] = useState(false);
  const [activityFeed, setActivityFeed] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const loadTeam = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/invitations?agencyId=${agencyId}`);
      if (!response.ok) {
        throw new Error('Failed to load team');
      }
      const data = await response.json();
      setMembers(data.members ?? []);
      setInvites(data.invites ?? []);
    } catch (error) {
      console.error(error);
      setToast({ variant: 'error', message: 'Unable to load team members.' });
    } finally {
      setLoading(false);
    }
  }, [agencyId]);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  const handleInvite = async () => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/invitations/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agencyId,
          ...inviteForm,
          createdById: members.find(member => member.teamRole === 'OWNER')?.id,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invite');
      }

      if (data.status === 'already_member') {
        setToast({ variant: 'neutral', message: 'They are already on your workspace.' });
        return;
      }

      if (data.status === 'existing_user_attached') {
        setToast({ variant: 'success', message: 'Existing Documotion user linked to your team.' });
      } else if (data.status === 'pending_exists') {
        setToast({
          variant: 'neutral',
          message: 'Invite already pending. Resend from the invites panel.',
        });
      } else {
        setToast({ variant: 'success', message: 'Invitation sent successfully.' });
        setActivityFeed(current => [
          {
            id: Date.now(),
            text: `${inviteForm.email} invited`,
            timestamp: new Date().toISOString(),
          },
          ...current,
        ]);
      }

      setModalOpen(false);
      setInviteForm(initialInviteForm);
      await loadTeam();
    } catch (error) {
      console.error(error);
      setToast({ variant: 'error', message: error.message || 'Unable to send invite.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async inviteId => {
    await fetch('/api/invitations/resend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inviteId }),
    });
    setToast({ variant: 'success', message: 'Invite resent.' });
    await loadTeam();
  };

  const handleRevoke = async inviteId => {
    await fetch('/api/invitations/revoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inviteId }),
    });
    setToast({ variant: 'neutral', message: 'Invitation revoked.' });
    await loadTeam();
  };

  const handleRoleChange = async (userId, role) => {
    await fetch('/api/invitations/change-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role, agencyId }),
    });
    setToast({ variant: 'success', message: 'Role updated.' });
    await loadTeam();
  };

  const handleRemoveMember = async userId => {
    await fetch('/api/invitations/remove-member', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, agencyId }),
    });
    setToast({ variant: 'neutral', message: 'Member removed.' });
    await loadTeam();
  };

  const headerAvatars = members.slice(0, 3);
  const overflowCount = Math.max(0, members.length - headerAvatars.length);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(30,64,175,0.25),_transparent_55%),#07090f] px-6 py-10 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-8">
          <div className="rounded-3xl border border-white/5 bg-white/[0.04] p-8 shadow-xl backdrop-blur">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs uppercase tracking-wide text-blue-200">
                  <Users className="h-3.5 w-3.5" />
                  Settings → Team
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-white md:text-4xl">Team Management</h1>
                  <p className="max-w-xl text-sm text-slate-300">
                    Keep owners and managers in control while designers, client success, and finance
                    stay in sync.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex -space-x-3">
                    {headerAvatars.map(member => (
                      <div key={member.id} className="relative">
                        <Avatar
                          name={member.name}
                          email={member.email}
                          image={member.image}
                          size={40}
                        />
                      </div>
                    ))}
                    {overflowCount > 0 && (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-sm text-white/80">
                        +{overflowCount}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">
                    {members.length} active · {invites.length} pending
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-400 hover:to-blue-500"
                  >
                    <UserPlus className="h-4 w-4" />
                    Invite New Member
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/25 hover:bg-white/5"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                    Bulk invite (CSV soon)
                  </button>
                </div>
              </div>
              <Image
                src="/illustrations/team-empty.svg"
                alt="Team collaboration illustration"
                width={200}
                height={140}
                className="hidden md:block"
              />
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              <ShieldCheck className="h-4 w-4" />
              <span>
                Owners can manage roles and billing inside{' '}
                <a
                  href="/settings/account"
                  className="underline decoration-dotted underline-offset-2"
                >
                  Team settings
                </a>
                . Only invite colleagues you trust with client data.
              </span>
            </div>
          </div>

          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`inline-flex items-center gap-2 self-start rounded-full px-4 py-2 text-xs ${
                toast.variant === 'error'
                  ? 'bg-rose-500/15 text-rose-200'
                  : toast.variant === 'success'
                    ? 'bg-emerald-500/15 text-emerald-200'
                    : 'bg-slate-500/15 text-slate-200'
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {toast.message}
            </motion.div>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Active members</h2>
                <span className="text-xs text-slate-500">
                  Click role badge to update permissions.
                </span>
              </div>
              <div className="space-y-3">
                <AnimatePresence>
                  {loading ? (
                    <div className="flex h-40 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02]">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                    </div>
                  ) : members.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-white/5 bg-white/[0.03] p-12 text-center">
                      <Image
                        src="/illustrations/team-empty.svg"
                        alt="Empty team illustration"
                        width={220}
                        height={140}
                      />
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-white">No teammates yet</h3>
                        <p className="text-sm text-slate-400">
                          Send them an invite to start collaborating seamlessly.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setModalOpen(true)}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-400 hover:to-blue-500"
                      >
                        <UserPlus className="h-4 w-4" />
                        Invite Team Member
                      </button>
                    </div>
                  ) : (
                    members.map(member => (
                      <MemberCard
                        key={member.id}
                        member={member}
                        onChangeRole={handleRoleChange}
                        onRemove={handleRemoveMember}
                      />
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 shadow-lg backdrop-blur">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-white">Pending invites</h2>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">
                      {invites.length} Pending
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Mail className="h-3.5 w-3.5" />
                    Auto-reminders in 48h
                  </span>
                </div>
                <div className="mt-4 overflow-hidden rounded-xl border border-white/5">
                  <table className="min-w-full divide-y divide-white/5 text-left">
                    <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-slate-400">
                      <tr>
                        <th className="px-4 py-2">Email</th>
                        <th className="px-4 py-2">Role</th>
                        <th className="px-4 py-2">Sent</th>
                        <th className="px-4 py-2">Expires</th>
                        <th className="px-4 py-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {invites.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-4 py-6 text-center text-xs text-slate-500"
                            >
                              You have no pending invites — everyone is up-to-date! ✨
                            </td>
                          </tr>
                        ) : (
                          invites.map(invite => (
                            <PendingInviteRow
                              key={invite.id}
                              invite={invite}
                              onResend={handleResend}
                              onRevoke={handleRevoke}
                            />
                          ))
                        )}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-white/[0.06] to-white/[0.03] p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Recent activity</h3>
                  <button type="button" className="text-xs text-blue-300 hover:text-blue-200">
                    View all
                  </button>
                </div>
                <div className="mt-4 space-y-3 text-sm text-slate-300">
                  {activityFeed.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      Invites and approvals will appear here.
                    </p>
                  ) : (
                    activityFeed.slice(0, 5).map(item => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3"
                      >
                        <div className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-blue-500/20 text-blue-200">
                          <Sparkles className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <p className="text-sm text-white">{item.text}</p>
                          <span className="text-xs text-slate-500">
                            {formatRelative(item.timestamp)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-3 rounded-3xl border border-white/5 bg-white/[0.02] p-6 text-sm text-slate-300">
                <h3 className="text-sm font-semibold text-white">Best practices</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-3">
                    <ShieldCheck className="h-4 w-4 text-emerald-300" />
                    <p>Keep at least two owners for redundancy.</p>
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-3">
                    <Users className="h-4 w-4 text-blue-300" />
                    <p>Assign editors to client delivery pods for faster follow-through.</p>
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-3">
                    <CheckCircle2 className="h-4 w-4 text-amber-300" />
                    <p>Give viewers to finance or legal stakeholders for oversight.</p>
                  </div>
                </div>
                <a
                  href="/guides/team-access"
                  className="inline-flex items-center gap-1 text-xs text-blue-300 hover:text-blue-200"
                >
                  Team access playbook
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
              <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-5 text-xs text-slate-400">
                <p className="font-semibold text-white">Pro roadmap</p>
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  <li>Search & filter team members (coming soon)</li>
                  <li>Invite via email link & bulk CSV upload</li>
                  <li>Advanced role-based permissions</li>
                  <li>Activity timeline filters</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          <InviteMemberModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onSubmit={handleInvite}
            submitting={submitting}
            form={inviteForm}
            setForm={setInviteForm}
          />
        </AnimatePresence>
      </div>
    </>
  );
}

function TeamSettingsFallback() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(30,64,175,0.25),_transparent_55%),#07090f] px-6 py-10 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-center rounded-3xl border border-white/5 bg-white/[0.02] p-12 text-sm text-slate-400">
          Loading team settings…
        </div>
      </div>
    </>
  );
}

export default function TeamSettingsPage() {
  return (
    <Suspense fallback={<TeamSettingsFallback />}>
      <TeamSettingsContent />
    </Suspense>
  );
}
