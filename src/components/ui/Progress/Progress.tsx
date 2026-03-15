"use client";

import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  label?: string;
  striped?: boolean;
  animated?: boolean;
  color?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({
    value = 0,
    max = 100,
    size = 'md',
    variant = 'default',
    showLabel = false,
    label,
    striped = false,
    animated = false,
    color,
    className,
    ...props
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    
    const sizeClasses = {
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4',
    };

    const variantClasses = {
      default: 'bg-[var(--coffee-mocha)]',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500',
    };

    const getProgressColor = () => {
      if (color) return color;
      return variantClasses[variant];
    };

    const getLabelColor = () => {
      if (color) return color;
      switch (variant) {
        case 'success':
          return 'text-green-600';
        case 'warning':
          return 'text-yellow-600';
        case 'error':
          return 'text-red-600';
        default:
          return 'text-[var(--coffee-mocha)]';
      }
    };

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {showLabel && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-[var(--coffee-charcoal)]">
              {label || 'Progress'}
            </span>
            <span className={cn('text-sm font-medium', getLabelColor())}>
              {percentage.toFixed(1)}%
            </span>
          </div>
        )}
        
        <div
          className={cn(
            'w-full bg-gray-200 rounded-full overflow-hidden',
            sizeClasses[size]
          )}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemax={max}
          aria-valuemin={0}
        >
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300 ease-out',
              getProgressColor(),
              striped && 'bg-gradient-to-r',
              animated && 'animate-pulse'
            )}
            style={{
              width: `${percentage}%`,
              ...(striped && {
                backgroundImage: `linear-gradient(
                  45deg,
                  transparent 25%,
                  rgba(255, 255, 255, 0.1) 25%,
                  rgba(255, 255, 255, 0.1) 50%,
                  transparent 50%,
                  transparent 75%,
                  rgba(255, 255, 255, 0.1) 75%,
                  rgba(255, 255, 255, 0.1) 100%
                )`,
                backgroundSize: '1rem 1rem',
              }),
              ...(animated && {
                animation: 'progress-bar-stripes 1s linear infinite',
              })
            }}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export { Progress };
