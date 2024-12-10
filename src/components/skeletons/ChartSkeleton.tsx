import React from 'react';
import { Skeleton } from './Skeleton';

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      <Skeleton variant="title" />
      <div className="h-64 flex items-end gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1"
            style={{
              height: `${Math.max(20, Math.random() * 100)}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
