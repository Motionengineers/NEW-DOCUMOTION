'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Globe, Instagram, MapPin, Star } from 'lucide-react';

function formatCurrency(amount, currency = 'INR') {
  if (!amount && amount !== 0) return null;
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (error) {
    return `${currency} ${amount.toLocaleString?.('en-IN') ?? amount}`;
  }
}

export default function AgencyCard({ agency }) {
  const serviceBadges = Array.isArray(agency.serviceBadges)
    ? agency.serviceBadges
    : Array.isArray(agency.services)
      ? agency.services
      : typeof agency.services === 'string'
        ? agency.services
            .split(',')
            .map(item => item.trim())
            .filter(Boolean)
        : [];
  const minProjectLabel = formatCurrency(agency.minBudget, agency.currency);

  return (
    <article className="glass group flex h-full flex-col overflow-hidden rounded-2xl border border-separator transition hover:-translate-y-1 hover:border-blue-400/40 hover:shadow-2xl hover:shadow-blue-500/20 dark:hover:shadow-blue-500/10">
      <div className="flex flex-col gap-5 p-6">
        <header className="flex items-start gap-4">
          <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-separator bg-gray-100 dark:bg-gray-800">
            {agency.logoUrl ? (
              <Image
                src={agency.logoUrl}
                alt={`${agency.name} logo`}
                fill
                className="object-contain p-1.5"
                sizes="56px"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center text-xl font-semibold"
                style={{ color: 'var(--label)' }}
              >
                {agency.name?.[0] ?? 'A'}
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold leading-tight" style={{ color: 'var(--label)' }}>
                {agency.name}
              </h3>
              {agency.verified && (
                <span className="rounded-full bg-green-500/15 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-green-400">
                  Verified
                </span>
              )}
              {agency.featured && (
                <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-blue-300">
                  Featured
                </span>
              )}
            </div>
            <div
              className="flex flex-wrap items-center gap-3 text-sm"
              style={{ color: 'var(--secondary-label)' }}
            >
              {agency.city && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-blue-300" />
                  {agency.city}
                </span>
              )}
              {agency.rating ? (
                <span
                  className="inline-flex items-center gap-1 rounded-full bg-gray-200 dark:bg-gray-800 px-2 py-0.5 text-sm font-medium"
                  style={{ color: 'var(--label)' }}
                >
                  <Star className="h-4 w-4 text-amber-400" />
                  {agency.rating.toFixed(1)}
                  <span className="text-xs text-amber-300 dark:text-amber-200">
                    ({agency.reviewCount ?? agency.ratingCount ?? 0})
                  </span>
                </span>
              ) : null}
              {agency.teamSize ? (
                <span className="inline-flex items-center gap-1 text-sm">
                  Team {agency.teamSize}+ members
                </span>
              ) : null}
            </div>
          </div>
        </header>

        {agency.description ? (
          <p className="text-sm leading-relaxed" style={{ color: 'var(--secondary-label)' }}>
            {agency.description.length > 180
              ? `${agency.description.slice(0, 180)}…`
              : agency.description}
          </p>
        ) : null}

        {serviceBadges?.length ? (
          <div className="flex flex-wrap gap-2">
            {serviceBadges.slice(0, 5).map(service => (
              <span
                key={service}
                className="rounded-full border border-separator bg-gray-50 dark:bg-gray-800/50 px-3 py-1 text-xs font-medium uppercase tracking-wide"
                style={{ color: 'var(--secondary-label)' }}
              >
                {service}
              </span>
            ))}
          </div>
        ) : null}

        <div className="rounded-xl border border-separator bg-gray-50 dark:bg-gray-800/30 p-4 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-medium" style={{ color: 'var(--label)' }}>
              Starting from
            </span>
            <span className="text-base font-semibold" style={{ color: 'var(--system-blue)' }}>
              {minProjectLabel ?? 'On request'}
            </span>
          </div>
          {agency.maxBudget ? (
            <p className="text-xs pt-1" style={{ color: 'var(--secondary-label)' }}>
              Typical engagement range{' '}
              {formatCurrency(agency.minBudget ?? agency.maxBudget / 2, agency.currency)} –{' '}
              {formatCurrency(agency.maxBudget, agency.currency)}
            </p>
          ) : null}
        </div>
      </div>

      <footer className="flex items-center justify-between border-t border-separator bg-gray-50 dark:bg-gray-800/30 px-6 py-4">
        <div className="flex items-center gap-3">
          {agency.website ? (
            <a
              href={agency.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium transition hover:underline"
              style={{ color: 'var(--system-blue)' }}
            >
              <Globe className="h-4 w-4" />
              Website
            </a>
          ) : null}
          {agency.instagram ? (
            <a
              href={agency.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm transition hover:underline"
              style={{ color: 'var(--secondary-label)' }}
            >
              <Instagram className="h-4 w-4 text-pink-400" />
              Instagram
            </a>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/branding/agencies/${agency.slug}`}
            className="inline-flex items-center gap-2 rounded-xl border border-separator bg-transparent px-4 py-2 text-sm font-semibold transition hover:bg-gray-100 dark:hover:bg-gray-800"
            style={{ color: 'var(--label)' }}
          >
            View Profile
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={`/branding/agencies/${agency.slug}#hire`}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 dark:bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 dark:hover:bg-blue-500"
          >
            Hire Now
          </Link>
        </div>
      </footer>
    </article>
  );
}
