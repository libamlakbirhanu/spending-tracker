import React from 'react';
import { useInsights } from '../contexts/InsightsContext';
import { FaLightbulb, FaChartLine, FaTrophy, FaExclamationTriangle } from 'react-icons/fa';
import { motion } from 'framer-motion';

const SmartInsights: React.FC = () => {
  const { insights, loading } = useInsights();

  if (loading) {
    return (
      <div className="animate-pulse bg-white rounded-xl shadow-sm p-6">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <FaExclamationTriangle className="text-yellow-500" />;
      case 'trend':
        return <FaChartLine className="text-blue-500" />;
      case 'achievement':
        return <FaTrophy className="text-green-500" />;
      default:
        return <FaLightbulb className="text-purple-500" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-100';
      case 'trend':
        return 'bg-blue-50 border-blue-100';
      case 'achievement':
        return 'bg-green-50 border-green-100';
      default:
        return 'bg-purple-50 border-purple-100';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center space-x-2 mb-6">
        <FaLightbulb className="text-purple-500 text-xl" />
        <h2 className="text-lg font-semibold text-gray-900">Smart Insights</h2>
      </div>

      <div className="space-y-4">
        {insights.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No insights available yet. Keep tracking your expenses!
          </p>
        ) : (
          insights
            .sort((a, b) => b.priority - a.priority)
            .map((insight) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border ${getInsightColor(
                  insight.type
                )} transition-all hover:shadow-md`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getInsightIcon(insight.type)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      {insight.title}
                    </h3>
                    <p className="text-sm text-gray-600">{insight.description}</p>
                    {insight.metadata?.percentageChange && (
                      <div className="mt-2 text-sm font-medium">
                        {insight.metadata.percentageChange > 0 ? (
                          <span className="text-red-500">
                            ↑ {insight.metadata.percentageChange.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-green-500">
                            ↓ {Math.abs(insight.metadata.percentageChange).toFixed(1)}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
        )}
      </div>
    </div>
  );
};

export default SmartInsights;
