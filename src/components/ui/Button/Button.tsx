import React from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    fullWidth = false,
    disabled,
    children,
    ...props 
  }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed border-radius';
    
    const variantClasses = {
      primary: 'bg-[var(--coffee-espresso)] text-white hover:bg-[var(--coffee-dark)] focus:ring-[var(--coffee-macchiato)] border border-[var(--coffee-espresso)]',
      secondary: 'bg-[var(--coffee-cream)] text-[var(--coffee-charcoal)] hover:bg-[var(--coffee-cappuccino)] focus:ring-[var(--coffee-macchiato)] border border-[var(--coffee-cappuccino)]',
      outline: 'bg-transparent text-[var(--coffee-charcoal)] hover:bg-[var(--coffee-cream)] focus:ring-[var(--coffee-macchiato)] border border-[var(--coffee-cappuccino)]',
      ghost: 'bg-transparent text-[var(--coffee-charcoal)] hover:bg-[var(--coffee-cream)] focus:ring-[var(--coffee-macchiato)] border border-transparent',
      danger: 'bg-[var(--error)] text-white hover:bg-[var(--error-dark)] focus:ring-[var(--error-light)] border border-[var(--error)]',
    };
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm min-h-[2rem]',
      md: 'px-4 py-2 text-base min-h-[2.5rem]',
      lg: 'px-6 py-3 text-lg min-h-[3rem]',
    };
    
    const widthClasses = fullWidth ? 'w-full' : '';
    
    return (
      <button
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          widthClasses,
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="-ml-1 mr-2 flex shrink-0" aria-hidden>
            <Spinner size="sm" />
          </span>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
