import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'avatar' | 'button' | 'card';
  width?: string | number;
  height?: string | number;
  lines?: number;
  animated?: boolean;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ 
    className, 
    variant = 'rectangular',
    width,
    height,
    lines,
    animated = true,
    ...props 
  }, ref) => {
    const baseClasses = 'bg-gray-200';
    const animationClasses = animated ? 'animate-pulse' : '';
    
    const getVariantClasses = () => {
      switch (variant) {
        case 'text':
          return 'h-4 rounded';
        case 'circular':
          return 'rounded-full';
        case 'rectangular':
          return 'rounded-md';
        case 'avatar':
          return 'rounded-full';
        case 'button':
          return 'rounded-md';
        case 'card':
          return 'rounded-lg';
        default:
          return 'rounded-md';
      }
    };

    const renderContent = () => {
      switch (variant) {
        case 'text':
          if (lines && lines > 1) {
            return (
              <div className="space-y-2">
                {Array.from({ length: lines }).map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      baseClasses,
                      getVariantClasses(),
                      animationClasses
                    )}
                    style={{
                      width: index === lines - 1 ? '80%' : '100%',
                    }}
                  />
                ))}
              </div>
            );
          }
          return (
            <div
              className={cn(
                baseClasses,
                getVariantClasses(),
                animationClasses
              )}
              style={{
                width: width || '100%',
              }}
            />
          );

        case 'avatar':
          return (
            <div
              className={cn(
                baseClasses,
                getVariantClasses(),
                animationClasses
              )}
              style={{
                width: width || '40px',
                height: height || '40px',
              }}
            />
          );

        case 'button':
          return (
            <div
              className={cn(
                baseClasses,
                getVariantClasses(),
                animationClasses,
                'h-10'
              )}
              style={{
                width: width || '120px',
              }}
            />
          );

        case 'card':
          return (
            <div className="space-y-3">
              <div
                className={cn(
                  baseClasses,
                  getVariantClasses(),
                  animationClasses,
                  'h-4 w-3/4'
                )}
              />
              <div
                className={cn(
                  baseClasses,
                  getVariantClasses(),
                  animationClasses,
                  'h-3 w-1/2'
                )}
              />
              <div
                className={cn(
                  baseClasses,
                  getVariantClasses(),
                  animationClasses,
                  'h-3 w-2/3'
                )}
              />
            </div>
          );

        default:
          return (
            <div
              className={cn(
                baseClasses,
                getVariantClasses(),
                animationClasses
              )}
              style={{
                width: width || '100%',
                height: height || '20px',
              }}
            />
          );
      }
    };

    return (
      <div
        ref={ref}
        className={cn('inline-block', className)}
        {...props}
      >
        {renderContent()}
      </div>
    );
  }
);

Skeleton.displayName = 'Skeleton';

export { Skeleton };
