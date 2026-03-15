import React from 'react';
import { cn } from '@/lib/utils';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'accent' | 'white';
  variant?: 'default' | 'dots' | 'pulse';
}

/**
 * App-wide loading spinner. Use this component for all loading states (buttons, tables, pages).
 * Do not use inline SVGs or other ad-hoc spinners – keep loading UX consistent.
 */
const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({
    className,
    size = 'md',
    color = 'primary',
    variant = 'default',
    ...props
  }, ref) => {
    const sizeClasses = {
      xs: 'w-4 h-4',
      sm: 'w-5 h-5',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
      xl: 'w-12 h-12',
    };

    const colorClasses = {
      primary: 'text-[var(--coffee-mocha)]',
      secondary: 'text-[var(--coffee-macchiato)]',
      accent: 'text-[var(--coffee-cinnamon)]',
      white: 'text-white',
    };

    if (variant === 'dots') {
      return (
        <div
          ref={ref}
          className={cn('flex gap-1', className)}
          role="status"
          aria-label="Ładowanie"
          {...props}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              role="img"
              aria-hidden
              className={cn(
                'rounded-full animate-bounce bg-current',
                sizeClasses[size].split(' ')[0],
                colorClasses[color]
              )}
              style={{
                animationDelay: `${i * 0.1}s`,
                width: size === 'xs' ? '4px' : size === 'sm' ? '5px' : size === 'md' ? '6px' : size === 'lg' ? '8px' : '12px',
                height: size === 'xs' ? '4px' : size === 'sm' ? '5px' : size === 'md' ? '6px' : size === 'lg' ? '8px' : '12px',
              }}
            />
          ))}
        </div>
      );
    }

    if (variant === 'pulse') {
      return (
        <div
          ref={ref}
          role="img"
          aria-label="Ładowanie"
          className={cn(
            'animate-pulse rounded-full bg-current',
            sizeClasses[size],
            colorClasses[color],
            'opacity-75',
            className
          )}
          {...props}
        />
      );
    }

    return (
      <div
        ref={ref}
        role="img"
        aria-label="Ładowanie"
        className={cn(
          'animate-spin',
          sizeClasses[size],
          colorClasses[color],
          className
        )}
        {...props}
      >
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <circle
            className="opacity-20"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            className="opacity-100"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';

export { Spinner };
