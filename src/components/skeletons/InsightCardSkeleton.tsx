import React from 'react';
import { Skeleton } from './Skeleton';

export const InsightCardSkeleton: React.FC = () => {
  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-sm">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton variant="avatar" className="h-8 w-8" />
          <Skeleton variant="title" className="flex-1" />
        </div>
        <Skeleton variant="text" className="w-full" />
        <Skeleton variant="text" className="w-3/4" />
      </div>
    </div>
  );
};
