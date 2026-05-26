import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind class names safely while supporting conditional combos.
 * Mirrors the helper that many components expect from `@/lib/utils`.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Standard Indian date formatters using Intl.DateTimeFormat.
 * Using 'en-IN' locale ensures the standard DD/MM/YYYY format and Indian time conventions.
 */
export const DATE_FORMATS = {
  // Output: 15/08/2024
  short: new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
  // Output: 15 Aug 2024
  medium: new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
  // Output: 15 August 2024
  long: new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
  // Output: Thursday, 15 August 2024
  full: new Intl.DateTimeFormat('en-IN', { dateStyle: 'full' }),
  // Output: 15 Aug 2024, 10:30 am
  dateTime: new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }),
};

/**
 * Helper to format dates consistently across the app.
 * Handles string ISO dates, numeric timestamps, or Date objects.
 */
export function formatDate(date, variant = 'medium') {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return String(date);
  return DATE_FORMATS[variant]?.format(d) ?? d.toLocaleDateString('en-IN');
}
