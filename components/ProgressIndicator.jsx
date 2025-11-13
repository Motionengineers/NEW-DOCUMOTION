'use client';

/**
 * Progress Indicator Component - Applying Parkinson's Law
 *
 * Applied Laws:
 * - Parkinson's Law: Show progress to encourage completion
 * - Zeigarnik Effect: Remind users of incomplete tasks
 * - Von Restorff Effect: Make progress visible
 */

export default function ProgressIndicator({ current, total, label, showPercentage = true }) {
  const percentage = Math.round((current / total) * 100);
  const steps = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-sm font-medium" style={{ color: 'var(--label)' }}>
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm font-medium" style={{ color: 'var(--secondary-label)' }}>
              {current} of {total} ({percentage}%)
            </span>
          )}
        </div>

        {/* Progress Bar Track */}
        <div
          className="w-full rounded-full overflow-hidden"
          style={{
            backgroundColor: 'var(--system-secondary-background)',
            height: '8px',
          }}
        >
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${percentage}%`,
              backgroundColor: 'var(--system-blue)',
            }}
          />
        </div>
      </div>

      {/* Step Indicators (Optional - for multi-step forms) */}
      {total <= 7 && ( // Apply Miller's Law: Show max 7 steps
        <div className="flex items-center justify-between mt-3">
          {steps.map(step => (
            <div key={step} className="flex flex-col items-center flex-1">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                  ${
                    step <= current
                      ? 'bg-blue-600 text-white'
                      : step === current + 1
                        ? 'border-2 border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-900/20'
                        : 'border-2 border-gray-300 text-gray-400 dark:border-gray-600'
                  }
                `}
                style={{
                  ...(step <= current && {
                    backgroundColor: 'var(--system-blue)',
                    color: '#ffffff',
                  }),
                }}
              >
                {step <= current ? '✓' : step}
              </div>
              {step < total && (
                <div
                  className={`
                    h-0.5 mt-2 flex-1 mx-2
                    ${step < current ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}
                  `}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
