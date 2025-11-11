'use client';

export default function AgencyFilters({ filters, setFilters }) {
  return (
    <div className="glass p-4 rounded-xl mb-6">
      <div className="grid md:grid-cols-4 gap-4">
        <input
          className="w-full px-4 py-2 rounded-lg"
          style={{
            backgroundColor: 'var(--system-secondary-background)',
            color: 'var(--label)',
            border: '1px solid var(--separator)',
          }}
          placeholder="Search by name or service..."
          value={filters.q}
          onChange={e => setFilters({ ...filters, q: e.target.value })}
        />
        <input
          className="w-full px-4 py-2 rounded-lg"
          style={{
            backgroundColor: 'var(--system-secondary-background)',
            color: 'var(--label)',
            border: '1px solid var(--separator)',
          }}
          placeholder="Location"
          value={filters.location}
          onChange={e => setFilters({ ...filters, location: e.target.value })}
        />
        <select
          className="w-full px-4 py-2 rounded-lg"
          style={{
            backgroundColor: 'var(--system-secondary-background)',
            color: 'var(--label)',
            border: '1px solid var(--separator)',
          }}
          value={filters.rating}
          onChange={e => setFilters({ ...filters, rating: e.target.value })}
        >
          <option value="">Min Rating</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
          <option value="4.5">4.5+</option>
        </select>
        <select
          className="w-full px-4 py-2 rounded-lg"
          style={{
            backgroundColor: 'var(--system-secondary-background)',
            color: 'var(--label)',
            border: '1px solid var(--separator)',
          }}
          value={filters.verified}
          onChange={e => setFilters({ ...filters, verified: e.target.value })}
        >
          <option value="">All</option>
          <option value="true">Verified</option>
        </select>
      </div>
    </div>
  );
}
