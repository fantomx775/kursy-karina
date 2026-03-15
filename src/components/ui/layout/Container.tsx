import React from 'react';
import { cn } from '@/lib/utils';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  center?: boolean;
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = 'lg', center = true, children, ...props }, ref) => {
    const sizeClasses = {
      sm: 'max-w-[var(--container-sm)]',
      md: 'max-w-[var(--container-md)]',
      lg: 'max-w-[var(--container-lg)]',
      xl: 'max-w-[var(--container-xl)]',
      '2xl': 'max-w-[var(--container-2xl)]',
      full: 'max-w-full',
    };

    const centerClasses = center ? 'mx-auto' : '';
    const paddingClasses = 'page-padding-x';

    return (
      <div
        ref={ref}
        className={cn(
          'w-full',
          sizeClasses[size],
          centerClasses,
          paddingClasses,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';

export { Container };
