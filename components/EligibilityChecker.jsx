'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2, TrendingUp } from 'lucide-react';
import GlassCard from './GlassCard';

export default function EligibilityChecker({ startupId, startup }) {
  const [formData, setFormData] = useState({
    stage: startup?.stage || '',
    sector: startup?.sector || '',
    location: startup?.location || '',
    dpiitNumber: startup?.dpiitNumber || '',
    foundingYear: startup?.foundingYear || new Date().getFullYear(),
    registeredAs: startup?.registeredAs || '',
    teamSize: startup?.teamSize || 0,
    has_prototype: false,
    needs_loan: true,
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = field => e => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const checkEligibility = async () => {
    setLoading(true);
    setResults(null);

    try {
      const response = await fetch('/api/eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startup: formData, startupId }),
      });

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Eligibility check error:', error);
      setResults({ error: 'Failed to check eligibility' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div
          className="p-2 rounded-lg"
          style={{ backgroundColor: 'rgba(0, 102, 204, 0.1)', color: '#0066cc' }}
        >
          <TrendingUp className="h-5 w-5" />
        </div>
        <h3 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--label)' }}>
          Eligibility Checker
        </h3>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--label)' }}>
            Stage
          </label>
          <select
            value={formData.stage}
            onChange={handleChange('stage')}
            className="w-full rounded-lg px-4 py-2.5 text-sm transition-all border focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'var(--system-secondary-background)',
              color: 'var(--label)',
              borderColor: 'var(--separator)',
            }}
          >
            <option value="">Select stage</option>
            <option value="Idea">Idea</option>
            <option value="MVP">MVP</option>
            <option value="Prototype">Prototype</option>
            <option value="Pre-seed">Pre-seed</option>
            <option value="Seed">Seed</option>
            <option value="Series A">Series A</option>
            <option value="Growth">Growth</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--label)' }}>
            Sector
          </label>
          <input
            type="text"
            value={formData.sector}
            onChange={handleChange('sector')}
            placeholder="e.g., FinTech, EdTech, HealthTech"
            className="w-full rounded-lg px-4 py-2.5 text-sm transition-all border focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'var(--system-secondary-background)',
              color: 'var(--label)',
              borderColor: 'var(--separator)',
              placeholder: 'var(--placeholder-text)',
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--label)' }}>
            Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={handleChange('location')}
            placeholder="e.g., Bangalore, Karnataka"
            className="w-full rounded-lg px-4 py-2.5 text-sm transition-all border focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'var(--system-secondary-background)',
              color: 'var(--label)',
              borderColor: 'var(--separator)',
              placeholder: 'var(--placeholder-text)',
            }}
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="has_prototype"
            checked={formData.has_prototype}
            onChange={handleChange('has_prototype')}
            className="w-4 h-4 rounded"
          />
          <label htmlFor="has_prototype" className="text-sm text-white/70">
            I have a working prototype/MVP
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="needs_loan"
            checked={formData.needs_loan}
            onChange={handleChange('needs_loan')}
            className="w-4 h-4 rounded"
          />
          <label htmlFor="needs_loan" className="text-sm text-white/70">
            I need a loan
          </label>
        </div>
      </div>

      <button
        onClick={checkEligibility}
        disabled={loading}
        className="w-full px-5 py-2.5 rounded-lg font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        style={{
          backgroundColor: loading ? 'var(--muted)' : 'var(--system-blue)',
          color: '#ffffff',
        }}
        onMouseEnter={e => {
          if (!loading) {
            e.target.style.backgroundColor = 'var(--primary-hover)';
          }
        }}
        onMouseLeave={e => {
          if (!loading) {
            e.target.style.backgroundColor = 'var(--system-blue)';
          }
        }}
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Checking...</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="h-5 w-5" />
            <span>Check Eligibility</span>
          </>
        )}
      </button>

      {results && !results.error && (
        <div className="mt-6 space-y-4">
          <div className="glass rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/70">Eligible Schemes</span>
              <span className="text-lg font-bold text-green-400">
                {results.eligible}/{results.total}
              </span>
            </div>
          </div>

          {results.suggestions && results.suggestions.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-white/90">Top Matches</h4>
              {results.suggestions.map((match, idx) => (
                <div key={idx} className="glass rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-semibold">{match.scheme}</h5>
                    <span className="text-sm font-bold text-purple-400">{match.score}%</span>
                  </div>
                  <p className="text-sm text-white/70 mb-2">{match.message}</p>
                  <div className="flex items-center space-x-2 text-xs text-white/50">
                    <span>
                      {match.matched}/{match.total} criteria matched
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {results?.error && (
        <div className="mt-4 p-3 bg-red-600/20 border border-red-600/50 rounded-lg text-red-300 text-sm">
          {results.error}
        </div>
      )}
    </GlassCard>
  );
}
