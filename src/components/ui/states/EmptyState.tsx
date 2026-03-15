import React from 'react';
import { cn } from '@/lib/utils';
import { IconProps } from '@/components/ui/Icon';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ 
    className, 
    icon, 
    title, 
    description, 
    action,
    size = 'md',
    ...props 
  }, ref) => {
    const sizeClasses = {
      sm: 'py-8 px-4',
      md: 'py-12 px-6',
      lg: 'py-16 px-8',
    };

    const iconSizes = {
      sm: 'w-12 h-12',
      md: 'w-16 h-16',
      lg: 'w-20 h-20',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center text-center',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {icon && (
          <div 
            className={cn(
              'text-[var(--coffee-macchiato)] mb-4',
              iconSizes[size]
            )}
          >
            {icon}
          </div>
        )}
        
        <h3 className="text-lg font-semibold text-[var(--coffee-charcoal)] mb-2">
          {title}
        </h3>
        
        {description && (
          <p className="text-[var(--coffee-macchiato)] mb-6 max-w-md">
            {description}
          </p>
        )}
        
        {action && (
          <div className="mt-4">
            {action}
          </div>
        )}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';

export { EmptyState };
