'use client';

import { cn } from '@/lib/utils';

const baseStyles = {
  glass: 'glass border border-white/10 backdrop-blur-md',
  solid: 'bg-[var(--system-secondary-background)] border border-[var(--separator)]',
};

export default function InfographicWidget({
  variant = 'glass',
  title,
  subtitle,
  metric,
  metricSuffix,
  change,
  changeTone = 'positive',
  footer,
  children,
  className,
}) {
  const toneStyles =
    changeTone === 'negative'
      ? 'text-red-400'
      : changeTone === 'neutral'
        ? 'text-[var(--tertiary-label)]'
        : 'text-emerald-400';

  return (
    <article
      className={cn(
        'rounded-2xl p-6 transition-all duration-300 shadow-lg',
        baseStyles[variant] ?? baseStyles.glass,
        className
      )}
    >
      <header className="space-y-1">
        {title && (
          <h3
            className="text-sm uppercase tracking-wide"
            style={{ color: 'var(--tertiary-label)' }}
          >
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-lg font-semibold" style={{ color: 'var(--label)' }}>
            {subtitle}
          </p>
        )}
      </header>

      {metric !== undefined && (
        <div className="mt-5 flex items-baseline gap-2">
          <span className="text-3xl font-semibold" style={{ color: 'var(--label)' }}>
            {metric}
            {metricSuffix && (
              <span
                className="ml-1 text-base font-medium"
                style={{ color: 'var(--secondary-label)' }}
              >
                {metricSuffix}
              </span>
            )}
          </span>
          {change && <span className={cn('text-sm font-medium', toneStyles)}>{change}</span>}
        </div>
      )}

      {children && <div className="mt-6 space-y-3">{children}</div>}

      {footer && (
        <footer
          className="mt-6 pt-4 border-t border-white/10 text-sm"
          style={{ color: 'var(--secondary-label)' }}
        >
          {footer}
        </footer>
      )}
    </article>
  );
}
