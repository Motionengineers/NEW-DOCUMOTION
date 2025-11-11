'use client';

import { useState, useEffect } from 'react';
import { Sparkles, ExternalLink, TrendingUp, Loader2 } from 'lucide-react';
import GlassCard from './GlassCard';

export default function Recommendations({ startupId, startup }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchRecommendations = async () => {
      if (!startupId && !startup) {
        setRecommendations([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await fetch('/api/schemes/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ startupId, startup }),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch recommendations (${response.status})`);
        }

        const data = await response.json();
        if (!cancelled && data.recommendations) {
          setRecommendations(data.topMatches || data.recommendations);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error fetching recommendations:', error);
          setRecommendations([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchRecommendations();
    return () => {
      cancelled = true;
    };
  }, [startupId, startup]);

  if (loading) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
        </div>
      </GlassCard>
    );
  }

  if (recommendations.length === 0) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Sparkles className="h-6 w-6 text-purple-400" />
          <h3 className="text-xl font-bold">Recommendations</h3>
        </div>
        <p className="text-white/60 text-sm">
          Complete your startup profile to get personalized scheme recommendations.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Sparkles className="h-6 w-6 text-purple-400" />
        <h3 className="text-xl font-bold">Top Recommendations</h3>
      </div>

      <div className="space-y-4">
        {recommendations.slice(0, 5).map((rec, idx) => (
          <div
            key={idx}
            className="glass rounded-lg p-4 border border-white/5 hover:border-purple-500/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-white/90">{rec.scheme.schemeName}</h4>
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span className="text-sm font-bold text-green-400">{rec.evaluation.score}%</span>
              </div>
            </div>

            {rec.scheme.category && (
              <span className="inline-block px-2 py-1 text-xs rounded-full bg-purple-600/20 text-purple-300 mb-2">
                {rec.scheme.category}
              </span>
            )}

            {rec.scheme.maxAssistance && (
              <p className="text-sm font-semibold text-purple-300 mb-2">
                {rec.scheme.maxAssistance}
              </p>
            )}

            <p className="text-sm text-white/70 mb-3">{rec.message}</p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">
                {rec.evaluation.matched}/{rec.evaluation.total} criteria matched
              </span>
              {rec.scheme.officialLink && (
                <a
                  href={rec.scheme.officialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                  aria-label={`Apply now for ${rec.scheme.schemeName}`}
                >
                  <span>Apply</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {recommendations.length > 5 && (
        <button className="w-full mt-4 px-4 py-2 glass rounded-lg text-white/80 hover:text-white transition-colors text-sm">
          View All {recommendations.length} Recommendations
        </button>
      )}
    </GlassCard>
  );
}
