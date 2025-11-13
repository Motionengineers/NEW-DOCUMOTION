import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind class names safely while supporting conditional combos.
 * Mirrors the helper that many components expect from `@/lib/utils`.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
