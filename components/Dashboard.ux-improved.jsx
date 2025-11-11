'use client';

/**
 * Improved Dashboard Component - Applying UX Laws
 * 
 * Applied Laws:
 * - Miller's Law: Limit visible cards to 5-7
 * - Pareto Principle: Prioritize most-used features
 * - Von Restorff Effect: Make primary CTAs stand out
 * - Law of Common Region: Group related sections
 * - Law of Proximity: Group related quick actions
 * - Serial Position Effect: Important items at start/end
 * - Law of Prägnanz: Simplified, clean layout
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import GlassCard from '@/components/GlassCard';
import SummaryCards from '@/components/SummaryCards';
import EligibilityChecker from '@/components/EligibilityChecker';
import Recommendations from '@/components/Recommendations';
import SkeletonLoader from '@/components/SkeletonLoader';
import Button from './Button';
import { FileText, Shield, Palette, TrendingUp, Trophy } from 'lucide-react';
import BusinessCustomerInfographic from '@/components/BusinessCustomerInfographic';

export default function DashboardUX() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 500);
  }, []);

  // Apply Pareto Principle: Identify most-used features (80/20 rule)
  // In real app, this would come from analytics
  const featureUsage = {
    registration: 85, // 85% of users
    schemes: 80,
    compliance: 65,
    branding: 45,
    challenges: 35,
    matches: 40,
  };

  // Apply Serial Position Effect: Most important at start and end
  // Apply Von Restorff Effect: Make primary actions stand out
  const quickActions = [
    {
      id: 'registration',
      href: '/services/registration',
      label: 'Register Business',
      description: 'Register your business and upload documents in minutes',
      icon: FileText,
      priority: 'high',
      usage: featureUsage.registration,
      color: '#0066cc',
      highlight: true, // Stand out
    },
    {
      id: 'schemes',
      href: '/schemes',
      label: 'Browse Schemes',
      description: 'Find government schemes you\'re eligible for',
      icon: TrendingUp,
      priority: 'high',
      usage: featureUsage.schemes,
      color: '#28a745',
    },
    {
      id: 'compliance',
      href: '/services/compliance',
      label: 'Compliance Services',
      description: 'ISO certifications, GST filings, ROC compliances & more',
      icon: Shield,
      priority: 'medium',
      usage: featureUsage.compliance,
      color: '#5856d6',
    },
    {
      id: 'branding',
      href: '/dashboard/branding',
      label: 'Branding Settings',
      description: 'Customize logo, colors, and company name',
      icon: Palette,
      priority: 'medium',
      usage: featureUsage.branding,
      color: '#ff9500',
    },
    {
      id: 'challenges',
      href: '/challenges',
      label: 'Startup Challenges',
      description: 'Compete in challenges and win prizes',
      icon: Trophy,
      priority: 'low',
      usage: featureUsage.challenges,
      color: '#a855f7',
    },
  ];

  // Apply Miller's Law: Show only 5-6 primary actions at once
  // Sort by priority and usage
  const primaryActions = quickActions
    .sort((a, b) => {
      // Priority first, then usage
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (a.priority !== 'high' && b.priority === 'high') return 1;
      return b.usage - a.usage;
    })
    .slice(0, 6); // Max 6 items (Miller's Law)

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--system-background)]">
        <Navbar />
        <div className="container mx-auto px-6 py-12 max-w-7xl">
          <SkeletonLoader type="card" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--system-background)]">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1
            className="text-4xl sm:text-5xl font-semibold mb-2 tracking-tight"
            style={{ color: 'var(--label)' }}
          >
            Dashboard
          </h1>
          <p className="text-base sm:text-lg" style={{ color: 'var(--secondary-label)' }}>
            Welcome back! Here&apos;s your startup overview.
          </p>
        </div>

        {/* Summary Cards - Apply Law of Common Region: Grouped stats */}
        <div className="mb-8">
          <SummaryCards />
        </div>

        {/* Business Customer Infographic widgets */}
        <div
          className="mb-10 rounded-3xl border p-6 sm:p-8"
          style={{
            backgroundColor: 'var(--system-secondary-background)',
            borderColor: 'var(--separator)',
          }}
        >
          <BusinessCustomerInfographic />
        </div>

        {/* Apply Law of Common Region: Group main content */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Main Content - Apply Miller's Law: Limit visible sections */}
          <div className="lg:col-span-2 space-y-6">
            {/* Apply Law of Common Region: Group recommendations */}
            <div
              className="p-6 rounded-xl border"
              style={{
                backgroundColor: 'var(--system-secondary-background)',
                borderColor: 'var(--separator)',
              }}
            >
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--label)' }}>
                Recommendations
              </h2>
              <Recommendations startupId={null} />
            </div>

            <div
              className="p-6 rounded-xl border"
              style={{
                backgroundColor: 'var(--system-secondary-background)',
                borderColor: 'var(--separator)',
              }}
            >
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--label)' }}>
                Eligibility Check
              </h2>
              <EligibilityChecker startupId={null} />
            </div>
          </div>

          {/* Sidebar - Apply Law of Proximity: Group related widgets */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              <div
                className="p-6 rounded-xl border"
                style={{
                  backgroundColor: 'var(--system-secondary-background)',
                  borderColor: 'var(--separator)',
                }}
              >
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--label)' }}>
                  Quick Stats
                </h3>
                {/* Stats widget */}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Apply Law of Common Region: Grouped actions */}
        <div
          className="p-6 rounded-xl border mb-8"
          style={{
            backgroundColor: 'var(--system-secondary-background)',
            borderColor: 'var(--separator)',
          }}
        >
          <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--label)' }}>
            Quick Actions
          </h2>

          {/* Apply Law of Proximity: Group related actions */}
          {/* Apply Miller's Law: Show max 6 items */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {primaryActions.map((action, idx) => {
              const Icon = action.icon;
              const isHighlighted = action.highlight || idx === 0;

              return (
                <Link key={action.id} href={action.href}>
                  <GlassCard
                    className={`
                      hover:scale-[1.02] transition-all cursor-pointer h-full
                      ${isHighlighted ? 'ring-2 ring-blue-500 shadow-xl' : ''}
                    `}
                    style={{
                      ...(isHighlighted && {
                        borderColor: 'var(--system-blue)',
                        backgroundColor: 'rgba(0, 102, 204, 0.05)',
                      }),
                    }}
                  >
                    {/* Apply Von Restorff Effect: Make highlighted items stand out */}
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="p-3 rounded-lg"
                        style={{
                          backgroundColor: `${action.color}15`,
                          color: action.color,
                        }}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      {isHighlighted && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-600 text-white">
                          Popular
                        </span>
                      )}
                    </div>

                    <h3
                      className={`text-lg font-semibold mb-2 ${isHighlighted ? 'text-blue-600' : ''}`}
                      style={{
                        color: isHighlighted ? 'var(--system-blue)' : 'var(--label)',
                      }}
                    >
                      {action.label}
                    </h3>
                    <p className="text-sm mb-4" style={{ color: 'var(--secondary-label)' }}>
                      {action.description}
                    </p>

                    {/* Apply Fitt's Law: Large button */}
                    <Button
                      variant={isHighlighted ? 'primary' : 'outline'}
                      size="sm"
                      className="w-full"
                    >
                      {action.label.includes('Register') ? '🚀 Get Started' : 'View'}
                    </Button>

                    {/* Usage indicator (optional) */}
                    {action.usage > 70 && (
                      <p className="text-xs mt-2 text-center" style={{ color: 'var(--tertiary-label)' }}>
                        Used by {action.usage}% of users
                      </p>
                    )}
                  </GlassCard>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Additional Actions - Apply Hick's Law: Progressive disclosure */}
        {quickActions.length > 6 && (
          <div className="text-center">
            <Button variant="outline" size="md">
              View All Actions ({quickActions.length})
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

