import React from 'react';
import { useInsights } from '../contexts/InsightsContext';
import { InsightCardSkeleton } from './skeletons/InsightCardSkeleton';

export const InsightsList: React.FC = () => {
  const { insights, loading } = useInsights();

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <InsightCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {insights.map((insight) => (
        <div
          key={insight.id}
          className={`p-4 rounded-lg shadow-sm ${
            insight.type === 'warning'
              ? 'bg-yellow-50 border-yellow-100'
              : insight.type === 'achievement'
              ? 'bg-green-50 border-green-100'
              : 'bg-white border'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {insight.type === 'warning' && (
              <span className="text-yellow-500">⚠️</span>
            )}
            {insight.type === 'achievement' && (
              <span className="text-green-500">🎉</span>
            )}
            {insight.type === 'trend' && (
              <span className="text-blue-500">📈</span>
            )}
            <h3 className="font-semibold">{insight.title}</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            {insight.description}
          </p>
        </div>
      ))}
    </div>
  );
};
