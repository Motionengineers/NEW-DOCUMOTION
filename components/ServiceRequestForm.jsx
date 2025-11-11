'use client';

import { useState } from 'react';
import { Building2, CheckCircle2, ArrowRight } from 'lucide-react';
import GlassCard from './GlassCard';

const services = [
  {
    id: 'private-limited',
    name: 'Private Limited',
    description: 'Most popular for startups. Limited liability protection.',
    price: 4999,
    features: ['Limited Liability', 'Easy Fundraising', 'Professional Status'],
  },
  {
    id: 'llp',
    name: 'LLP (Limited Liability Partnership)',
    description: 'Perfect for partnerships with limited liability.',
    price: 3999,
    features: ['Limited Liability', 'Flexible Management', 'Lower Compliance'],
  },
  {
    id: 'opc',
    name: 'OPC (One Person Company)',
    description: 'Solo entrepreneur with company benefits.',
    price: 3499,
    features: ['Single Owner', 'Limited Liability', 'Company Status'],
  },
  {
    id: 'sole-proprietorship',
    name: 'Sole Proprietorship',
    description: 'Simplest business structure for individuals.',
    price: 1999,
    features: ['Easy Setup', 'Full Control', 'Simple Compliance'],
  },
  {
    id: 'partnership',
    name: 'Partnership',
    description: 'Traditional partnership structure.',
    price: 2499,
    features: ['Shared Ownership', 'Flexible Agreement', 'Simple Setup'],
  },
  {
    id: 'msme',
    name: 'MSME Registration',
    description: 'Register as Micro, Small, or Medium Enterprise.',
    price: 999,
    features: ['Government Benefits', 'Easy Loans', 'Subsidies'],
  },
];

export default function ServiceRequestForm({ startupId, onSelect }) {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSelect = service => {
    setSelected(service);
  };

  const handleContinue = async () => {
    if (!selected || !startupId) return;

    setLoading(true);
    try {
      const response = await fetch('/api/service-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startupId: parseInt(startupId),
          serviceType: selected.name,
          amount: selected.price,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (onSelect) {
          onSelect(selected, data.serviceRequest);
        }
      } else {
        alert('Failed to create request: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2" style={{ color: 'var(--label)' }}>
          Select Registration Service
        </h2>
        <p style={{ color: 'var(--secondary-label)' }}>
          Choose the type of business registration you need
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {services.map(service => (
          <GlassCard
            key={service.id}
            className={`p-4 cursor-pointer transition-all ${
              selected?.id === service.id ? 'ring-2' : 'hover:scale-[1.02]'
            }`}
            style={{
              ringColor: selected?.id === service.id ? 'var(--system-blue)' : 'transparent',
              backgroundColor:
                selected?.id === service.id ? 'rgba(0, 102, 204, 0.05)' : 'transparent',
            }}
            onClick={() => handleSelect(service)}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: 'rgba(0, 102, 204, 0.1)', color: 'var(--system-blue)' }}
              >
                <Building2 className="h-5 w-5" />
              </div>
              {selected?.id === service.id && (
                <CheckCircle2 className="h-5 w-5" style={{ color: 'var(--system-blue)' }} />
              )}
            </div>

            <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--label)' }}>
              {service.name}
            </h3>
            <p className="text-sm mb-3" style={{ color: 'var(--secondary-label)' }}>
              {service.description}
            </p>

            <div className="mb-3">
              {service.features.map((feature, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-xs mb-1">
                  <CheckCircle2 className="h-3 w-3" style={{ color: 'var(--system-green)' }} />
                  <span style={{ color: 'var(--secondary-label)' }}>{feature}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t" style={{ borderColor: 'var(--separator)' }}>
              <p className="text-xl font-semibold" style={{ color: 'var(--system-blue)' }}>
                ₹{service.price.toLocaleString()}
              </p>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleContinue}
          disabled={!selected || loading}
          className="flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: selected ? 'var(--system-blue)' : 'var(--muted)',
            color: selected ? '#ffffff' : 'var(--tertiary-label)',
          }}
          onMouseEnter={e => {
            if (selected) {
              e.target.style.backgroundColor = 'var(--primary-hover)';
            }
          }}
          onMouseLeave={e => {
            if (selected) {
              e.target.style.backgroundColor = 'var(--system-blue)';
            }
          }}
        >
          <span>{loading ? 'Creating...' : 'Continue'}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
