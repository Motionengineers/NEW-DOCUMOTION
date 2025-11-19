'use client';

/**
 * Improved Button Component - Applying UX Laws
 *
 * Applied Laws:
 * - Fitt's Law: Minimum 48px tap targets
 * - Von Restorff Effect: Primary actions stand out
 * - Law of Similarity: Consistent styling
 * - Doherty Threshold: Immediate feedback
 */

import { useState } from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
  ...props
}) {
  const [isPressed, setIsPressed] = useState(false);

  // Apply Fitt's Law: Minimum tap targets
  const sizeClasses = {
    sm: 'px-4 py-2 min-h-[40px] text-sm',
    md: 'px-6 py-3 min-h-[48px] text-base', // Minimum 48px for mobile
    lg: 'px-8 py-4 min-h-[56px] text-lg',
  };

  // Apply Von Restorff Effect: Primary actions stand out
  const variantClasses = {
    primary:
      'bg-[var(--system-blue)] text-white shadow-lg ring-2 ring-blue-300/40 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--system-blue)]',
    secondary:
      'bg-white/10 text-white border border-white/20 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60',
    outline:
      'border border-white/30 text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60',
    danger:
      'bg-[var(--system-red)] text-white hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--system-red)]',
    ghost:
      'bg-transparent text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60',
  };

  // Apply Doherty Threshold: Immediate visual feedback
  const handleClick = e => {
    if (disabled || loading) return;

    // Immediate feedback
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);

    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`
        ${sizeClasses[size]} 
        ${variantClasses[variant]} 
        rounded-lg font-semibold 
        transition-all duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${isPressed ? 'scale-95' : 'scale-100'}
        ${loading ? 'cursor-wait' : ''}
        ${className}
      `}
      style={variant === 'secondary' ? { color: 'var(--label)' } : undefined}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
