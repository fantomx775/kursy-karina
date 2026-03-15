import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  /** Button-like shape: border-radius + px-3 py-2 (e.g. for status badges in tables) */
  appearance?: 'default' | 'button';
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ 
    className, 
    variant = 'default',
    size = 'md',
    rounded = true,
    appearance = 'default',
    children,
    ...props 
  }, ref) => {
    const variantClasses = {
      default: 'bg-[var(--coffee-cream)] text-[var(--coffee-charcoal)] border border-[var(--coffee-cappuccino)]',
      primary: 'bg-[var(--coffee-mocha)] text-white',
      secondary: 'bg-[var(--coffee-macchiato)] text-white',
      success: 'bg-green-100 text-green-800 border border-green-200',
      warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      error: 'bg-red-100 text-red-800 border border-red-200',
      outline: 'bg-transparent text-[var(--coffee-charcoal)] border border-[var(--coffee-cappuccino)]',
    };

    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs font-medium',
      md: 'px-2.5 py-0.5 text-sm font-medium',
      lg: 'px-3 py-1 text-sm font-medium',
    };

    const roundedClasses = rounded ? 'rounded-full' : 'border-radius';
    const isButtonAppearance = appearance === 'button';

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center',
          variantClasses[variant],
          isButtonAppearance ? 'border-radius px-3 py-2 text-sm font-medium' : cn(sizeClasses[size], roundedClasses),
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
