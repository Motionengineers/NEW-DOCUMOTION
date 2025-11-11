'use client';

import { CheckCircle2, Circle, XCircle, Clock } from 'lucide-react';

const statusSteps = {
  initiated: { label: 'Request Initiated', icon: Circle, color: 'text-blue-500' },
  name_reserved: { label: 'Name Reserved', icon: CheckCircle2, color: 'text-green-500' },
  filed: { label: 'Filed', icon: Clock, color: 'text-orange-500' },
  completed: { label: 'Completed', icon: CheckCircle2, color: 'text-green-500' },
  rejected: { label: 'Rejected', icon: XCircle, color: 'text-red-500' },
};

export default function StatusTimeline({ currentStatus, paymentStatus }) {
  const statusOrder = ['initiated', 'name_reserved', 'filed', 'completed'];
  const currentIndex = statusOrder.indexOf(currentStatus);

  return (
    <div className="relative">
      <div className="flex flex-col space-y-4">
        {statusOrder.map((status, index) => {
          const step = statusSteps[status];
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const Icon = step.icon;

          return (
            <div key={status} className="flex items-start space-x-4">
              <div className="flex flex-col items-center">
                <div
                  className={`p-2 rounded-full ${
                    isActive ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                  style={{
                    backgroundColor: isActive ? 'rgba(0, 102, 204, 0.1)' : 'var(--muted)',
                  }}
                >
                  <Icon
                    className={`h-5 w-5 ${isActive ? step.color : 'text-gray-400'}`}
                    style={{
                      color: isActive
                        ? isCurrent
                          ? 'var(--system-blue)'
                          : 'var(--system-green)'
                        : 'var(--tertiary-label)',
                    }}
                  />
                </div>
                {index < statusOrder.length - 1 && (
                  <div
                    className={`w-0.5 h-12 ${
                      isActive ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                    style={{
                      backgroundColor: isActive ? 'var(--system-blue)' : 'var(--separator)',
                    }}
                  />
                )}
              </div>
              <div className="flex-1 pt-1">
                <p
                  className={`font-medium ${isActive ? '' : 'opacity-50'}`}
                  style={{ color: 'var(--label)' }}
                >
                  {step.label}
                </p>
                {isCurrent && (
                  <p className="text-sm mt-1" style={{ color: 'var(--secondary-label)' }}>
                    Current status
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {paymentStatus === 'pending' && (
        <div
          className="mt-6 p-4 rounded-lg border"
          style={{
            backgroundColor: 'rgba(255, 149, 0, 0.1)',
            borderColor: 'var(--system-orange)',
          }}
        >
          <p className="text-sm font-medium" style={{ color: 'var(--system-orange)' }}>
            Payment Pending
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--secondary-label)' }}>
            Complete payment to proceed with registration
          </p>
        </div>
      )}
    </div>
  );
}
