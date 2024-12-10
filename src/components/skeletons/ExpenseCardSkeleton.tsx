import React from 'react';
import { Skeleton } from './Skeleton';

export const ExpenseCardSkeleton: React.FC = () => {
  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Skeleton variant="avatar" className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton variant="title" className="w-32" />
            <Skeleton variant="text" className="w-24" />
          </div>
        </div>
        <Skeleton variant="text" className="w-20" />
      </div>
    </div>
  );
};
