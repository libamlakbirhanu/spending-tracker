import React from 'react';
import { cn } from '../../utils/cn';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'title' | 'text' | 'avatar' | 'thumbnail' | 'button';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'text',
  ...props
}) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 dark:bg-gray-700 rounded',
        {
          'h-4 w-full': variant === 'text',
          'h-6 w-3/4': variant === 'title',
          'h-12 w-12 rounded-full': variant === 'avatar',
          'h-32 w-full': variant === 'thumbnail',
          'h-9 w-24': variant === 'button',
        },
        className
      )}
      {...props}
    />
  );
};
