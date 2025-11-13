export const metadata = {
  title: 'Team Access Playbook • Documotion',
  description:
    'Best practices to invite, onboard, and manage teammates inside Documotion for agencies and startups.',
};

const actions = [
  {
    title: '1. Map your roles',
    description:
      'Assign at least two owners/admins for redundancy, make delivery leads editors, and invite finance/legal as viewers. Keep permissions minimal until a teammate needs elevated access.',
    checklist: [
      'Confirm who owns billing and compliance approvals.',
      'Tag client-facing pods (delivery, design, compliance) as editors.',
      'Give finance, founders, or auditors the viewer role.',
    ],
  },
  {
    title: '2. Standardise invitations',
    description:
      'Use the invite modal inside Settings → Team. Include a short welcome note and—if needed—capture the manager email for internal approval workflows.',
    checklist: [
      'Invite new teammates from the Invite New Member button.',
      'Set the correct role before sending the invite.',
      'Resend pending invites within 48 hours using the Pending Invites panel.',
    ],
  },
  {
    title: '3. Automate approvals',
    description:
      'For larger agencies, route invites through a Google Form linked to the intake webhook. This keeps HR/People Ops looped in and records every request for audit readiness.',
    checklist: [
      'Use the shared Google Form template for gathering name, email, role, and manager.',
      'Secure the webhook with your intake secret (see Settings → Environment).',
      'Monitor the activity feed in Team settings for new joiners.',
    ],
  },
  {
    title: '4. Onboard with purpose',
    description:
      'Once a teammate accepts, drop them into your branded workspace tour. Share the “Documotion quickstart” checklist and confirm they know where to find schemes, docs, and timelines.',
    checklist: [
      'Send them the workspace tour link or Loom welcome video.',
      'Review open tasks or schemes they should own.',
      'Confirm they can access client folders and branding hub assets.',
    ],
  },
  {
    title: '5. Review monthly',
    description:
      'Audit team membership at the end of each month. Remove inactive contractors, downgrade unnecessary editors, and rotate ownership when people change pods.',
    checklist: [
      'Check for pending invites older than 7 days and revoke or resend.',
      'Downgrade roles for team members who no longer need edit access.',
      'Export membership list for HR/Compliance if required.',
    ],
  },
];

export default function TeamAccessPlaybookPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.22),_transparent_55%),#05070c] py-16 text-white">
      <div className="mx-auto max-w-5xl px-6">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center shadow-2xl backdrop-blur">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1 text-xs uppercase tracking-[0.2em] text-blue-200">
            Team playbook
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-tight md:text-5xl">
            Run secure, scalable team access in Documotion
          </h1>
          <p className="mt-4 text-base text-slate-200 md:text-lg">
            Follow this five-step framework to add teammates, keep approvals tight, and stay audit-ready
            as your agency or startup grows.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 md:flex-row md:justify-center">
            <a
              href="/settings/team"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold shadow-lg shadow-blue-500/30 transition hover:bg-blue-500"
            >
              Open Team Settings
            </a>
            <a
              href="https://docs.google.com/forms"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white/90 transition hover:border-white/40 hover:bg-white/5"
            >
              Duplicate Google Form template →
            </a>
          </div>
        </div>

        <div className="mt-12 grid gap-6">
          {actions.map(action => (
            <section
              key={action.title}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-lg backdrop-blur"
            >
              <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <h2 className="text-2xl font-semibold text-white">{action.title}</h2>
                <span className="text-sm text-blue-200">Playbook checkpoint</span>
              </header>
              <p className="mt-4 text-sm text-slate-200 md:text-base">{action.description}</p>
              <ul className="mt-6 space-y-3 text-sm text-slate-300">
                {action.checklist.map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full border border-blue-500/40 bg-blue-500/10 text-xs text-blue-200">
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-8">
          <h2 className="text-xl font-semibold text-white">Need a deeper rollout plan?</h2>
          <p className="mt-3 text-sm text-emerald-100">
            Our concierge team can help you migrate existing spreadsheets, configure the intake webhook,
            and train managers on reviewer workflows. Drop us a line at{' '}
            <a
              href="mailto:concierge@documotion.in"
              className="font-semibold text-white underline decoration-dotted underline-offset-4"
            >
              concierge@documotion.in
            </a>{' '}
            to schedule a rollout session.
          </p>
        </div>
      </div>
    </div>
  );
}

