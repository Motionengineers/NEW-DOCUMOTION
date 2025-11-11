'use client';

import Link from 'next/link';

export default function AgencyCard({ agency }) {
  return (
    <div className="glass p-4 rounded-xl hover:scale-[1.02] transition-transform h-full flex flex-col">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-lg" style={{ color: 'var(--label)' }}>
          {agency.name}
        </h3>
        {agency.rating && (
          <span
            className="text-sm px-2 py-1 rounded"
            style={{ backgroundColor: 'var(--system-green)', color: 'white' }}
          >
            ⭐ {agency.rating.toFixed(1)}
          </span>
        )}
      </div>
      {agency.location && (
        <p className="text-sm" style={{ color: 'var(--secondary-label)' }}>
          📍 {agency.location}
        </p>
      )}
      {agency.services && (
        <div className="mt-2 space-x-1">
          {(Array.isArray(agency.services)
            ? agency.services
            : String(agency.services || '').split(',')
          )
            .slice(0, 3)
            .map((s, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 rounded"
                style={{ backgroundColor: 'var(--muted)', color: 'var(--secondary-label)' }}
              >
                {String(s).trim()}
              </span>
            ))}
        </div>
      )}
      <div className="mt-auto pt-4 flex items-center gap-3">
        <Link
          href={`/agency/${agency.slug || agency.id}`}
          className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{ backgroundColor: 'var(--system-blue)', color: '#fff' }}
        >
          View Profile
        </Link>
        {agency.website && (
          <a
            href={agency.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm"
            style={{ color: 'var(--system-blue)' }}
          >
            Website →
          </a>
        )}
      </div>
    </div>
  );
}
