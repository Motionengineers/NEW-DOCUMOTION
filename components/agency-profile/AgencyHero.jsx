import Image from 'next/image';
import Link from 'next/link';
import { Globe, Instagram, Linkedin, MapPin, Phone, Star } from 'lucide-react';

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

export default function AgencyHero({ agency }) {
  const primaryServices = Array.isArray(agency.serviceBadges)
    ? agency.serviceBadges.slice(0, 5)
    : [];
  const minProjectLabel = formatCurrency(agency.minBudget, agency.currency);

  return (
    <section className="glass relative overflow-hidden rounded-3xl border border-white/10 p-10">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 via-transparent to-transparent pointer-events-none" />
      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="relative h-24 w-24 flex-none overflow-hidden rounded-2xl border border-white/15 bg-white/10 backdrop-blur">
          {agency.bannerUrl ? (
            <Image
              src={agency.bannerUrl}
              alt={`${agency.name} banner`}
              fill
              className="object-cover opacity-60"
              priority
              sizes="96px"
            />
          ) : null}
          {agency.logoUrl ? (
            <Image
              src={agency.logoUrl}
              alt={`${agency.name} logo`}
              fill
              className="object-contain p-3"
              priority
              sizes="96px"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center text-2xl font-semibold"
              style={{ color: 'var(--label)' }}
            >
              {agency.name?.[0] ?? 'A'}
            </div>
          )}
        </div>

        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold" style={{ color: 'var(--label)' }}>
                {agency.name}
              </h1>
              {agency.verified ? (
                <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-green-300">
                  Verified
                </span>
              ) : null}
              {agency.featured ? (
                <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-200">
                  Featured
                </span>
              ) : null}
            </div>
            <div
              className="flex flex-wrap items-center gap-4 text-sm"
              style={{ color: 'var(--secondary-label)' }}
            >
              {agency.city ? (
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-300" />
                  {agency.location ?? `${agency.city}${agency.state ? `, ${agency.state}` : ''}`}
                </span>
              ) : null}
              {agency.rating ? (
                <span
                  className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 font-medium"
                  style={{ color: 'var(--label)' }}
                >
                  <Star className="h-4 w-4 text-amber-400" />
                  {agency.rating.toFixed(1)}
                  <span className="text-xs text-amber-200/70">
                    ({agency.reviewCount ?? agency.ratingCount ?? 0} reviews)
                  </span>
                </span>
              ) : null}
              {agency.teamSize ? <span>Team size: {agency.teamSize}+ specialists</span> : null}
              {agency.yearsExperience ? <span>{agency.yearsExperience}+ years</span> : null}
            </div>
          </div>

          {agency.description ? (
            <p
              className="max-w-2xl text-sm leading-relaxed"
              style={{ color: 'var(--secondary-label)' }}
            >
              {agency.description}
            </p>
          ) : null}

          {primaryServices.length ? (
            <div className="flex flex-wrap gap-2">
              {primaryServices.map(service => (
                <span
                  key={service}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide"
                  style={{ color: 'var(--secondary-label)' }}
                >
                  {service}
                </span>
              ))}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: 'var(--secondary-label)' }}
              >
                Starting engagement
              </p>
              <p className="text-lg font-semibold" style={{ color: 'var(--system-blue)' }}>
                {minProjectLabel ?? 'On request'}
              </p>
              {agency.maxBudget ? (
                <p className="text-xs" style={{ color: 'var(--tertiary-label)' }}>
                  Typical range up to {formatCurrency(agency.maxBudget, agency.currency)}
                </p>
              ) : null}
            </div>
            <div
              className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2 text-sm"
              style={{ color: 'var(--secondary-label)' }}
            >
              {agency.contactEmail ? <p>📧 {agency.contactEmail}</p> : null}
              {agency.contactPhone ? (
                <p className="inline-flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-300" /> {agency.contactPhone}
                </p>
              ) : null}
              {agency.foundedYear ? <p>Founded in {agency.foundedYear}</p> : null}
              {agency.responseTime ? <p>Responds {agency.responseTime.toLowerCase()}</p> : null}
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2 text-sm">
              {agency.website ? (
                <Link
                  href={agency.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-semibold transition hover:underline"
                  style={{ color: 'var(--system-blue)' }}
                >
                  <Globe className="h-4 w-4" />
                  Website
                </Link>
              ) : null}
              {agency.instagram ? (
                <Link
                  href={agency.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm transition hover:underline"
                  style={{ color: 'var(--secondary-label)' }}
                >
                  <Instagram className="h-4 w-4 text-pink-400" />
                  Instagram
                </Link>
              ) : null}
              {agency.linkedin ? (
                <Link
                  href={agency.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm transition hover:underline"
                  style={{ color: 'var(--secondary-label)' }}
                >
                  <Linkedin className="h-4 w-4 text-blue-400" />
                  LinkedIn
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
