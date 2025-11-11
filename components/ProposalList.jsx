'use client';

import { useEffect, useState } from 'react';
import ProposalCard from './ProposalCard';

export default function ProposalList({ requestId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/agency-requests/${requestId}`);
        const data = await res.json();
        const proposals = data?.request?.proposals || [];
        setItems(proposals);
      } catch {}
      setLoading(false);
    })();
  }, [requestId]);

  if (loading) return <div className="glass p-4 rounded-xl">Loading proposals...</div>;
  if (!items.length) return <div className="glass p-4 rounded-xl">No proposals yet.</div>;
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {items.map(p => (
        <ProposalCard key={p.id} proposal={p} />
      ))}
    </div>
  );
}
