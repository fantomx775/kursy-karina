"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';
import { Spinner } from '@/components/ui/Spinner';

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'absolute' | 'percentage';
  icon?: React.ReactNode;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export interface StatsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  columns?: number;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({
    title,
    value,
    change,
    changeType = 'absolute',
    icon,
    description,
    variant = 'default',
    size = 'md',
    loading = false,
    className,
    ...props
  }, ref) => {
    const sizeClasses = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    const titleSizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    };

    const valueSizeClasses = {
      sm: 'text-2xl',
      md: 'text-3xl',
      lg: 'text-4xl',
    };

    const getVariantClasses = () => {
      switch (variant) {
        case 'success':
          return {
            border: 'border-green-200',
            bg: 'bg-green-50',
            icon: 'text-green-600',
            change: 'text-green-600',
          };
        case 'warning':
          return {
            border: 'border-yellow-200',
            bg: 'bg-yellow-50',
            icon: 'text-yellow-600',
            change: 'text-yellow-600',
          };
        case 'error':
          return {
            border: 'border-red-200',
            bg: 'bg-red-50',
            icon: 'text-red-600',
            change: 'text-red-600',
          };
        default:
          return {
            border: 'border-[var(--coffee-cappuccino)]',
            bg: 'bg-white',
            icon: 'text-[var(--coffee-mocha)]',
            change: 'text-[var(--coffee-mocha)]',
          };
      }
    };

    const variantClasses = getVariantClasses();

    const renderChange = () => {
      if (change === undefined || change === 0) return null;

      const isPositive = change > 0;
      const isNegative = change < 0;
      const changeIcon = isPositive ? FiTrendingUp : isNegative ? FiTrendingDown : FiMinus;
      const changeColor = isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600';

      const changeText = changeType === 'percentage' 
        ? `${Math.abs(change).toFixed(1)}%`
        : `${Math.abs(change)}`;

      return (
        <div className="flex items-center gap-1">
          {React.createElement(changeIcon, { className: cn('w-4 h-4', changeColor) })}
          <span className={cn('text-sm font-medium', changeColor)}>
            {changeText}
          </span>
        </div>
      );
    };

    return (
      <div
        ref={ref}
        className={cn(
          'border border-radius transition-all duration-200 hover:shadow-md',
          sizeClasses[size],
          variantClasses.border,
          variantClasses.bg,
          loading && 'opacity-50',
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className={cn('font-medium text-gray-600 mb-1', titleSizeClasses[size])}>
              {title}
            </div>
            
            {loading ? (
              <div className={cn('flex items-center', valueSizeClasses[size])}>
                <Spinner size="sm" />
              </div>
            ) : (
              <div className={cn('font-bold text-[var(--coffee-charcoal)]', valueSizeClasses[size])}>
                {value}
              </div>
            )}
            
            {description && (
              <div className="text-sm text-gray-500 mt-2">
                {description}
              </div>
            )}
          </div>
          
          {icon && (
            <div className={cn('p-3 border-radius', variantClasses.bg)}>
              <div className={cn('w-6 h-6', variantClasses.icon)}>
                {icon}
              </div>
            </div>
          )}
        </div>
        
        {renderChange()}
      </div>
    );
  }
);

StatCard.displayName = 'StatCard';

const Stats = React.forwardRef<HTMLDivElement, StatsProps>(
  ({ children, columns = 3, gap = 'md', className, ...props }, ref) => {
    const gapClasses = {
      sm: 'gap-4',
      md: 'gap-6',
      lg: 'gap-8',
    };

    const gridClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'grid',
          gridClasses[columns as keyof typeof gridClasses],
          gapClasses[gap],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Stats.displayName = 'Stats';

export { Stats, StatCard };
