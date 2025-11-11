'use client';

export default function ProposalCard({ proposal, onAction }) {
  return (
    <div className="glass p-4 rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm" style={{ color: 'var(--secondary-label)' }}>
          Timeline:{' '}
          <span className="font-medium" style={{ color: 'var(--label)' }}>
            {proposal.timeline}
          </span>
        </div>
        <div className="text-sm font-semibold" style={{ color: 'var(--system-green)' }}>
          ₹{proposal.price?.toLocaleString?.() || proposal.price}
        </div>
      </div>
      {proposal.message && (
        <p className="text-sm mb-3" style={{ color: 'var(--secondary-label)' }}>
          {proposal.message}
        </p>
      )}
      <div className="flex gap-3 mt-2">
        <button
          onClick={() => onAction?.('accept', proposal)}
          className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ backgroundColor: 'var(--system-blue)', color: '#fff' }}
        >
          Accept
        </button>
        <button
          onClick={() => onAction?.('reject', proposal)}
          className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ backgroundColor: 'var(--secondary)', color: 'var(--label)' }}
        >
          Reject
        </button>
      </div>
    </div>
  );
}
