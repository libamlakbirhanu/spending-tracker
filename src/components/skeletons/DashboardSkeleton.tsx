import React from 'react';
import { ExpenseCardSkeleton } from './ExpenseCardSkeleton';
import { InsightCardSkeleton } from './InsightCardSkeleton';
import { ChartSkeleton } from './ChartSkeleton';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <ExpenseCardSkeleton key={i} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
          <ChartSkeleton />
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
          <ChartSkeleton />
        </div>
      </div>

      {/* Recent Expenses & Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Expenses</h2>
          {Array.from({ length: 5 }).map((_, i) => (
            <ExpenseCardSkeleton key={i} />
          ))}
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Insights</h2>
          {Array.from({ length: 3 }).map((_, i) => (
            <InsightCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};
