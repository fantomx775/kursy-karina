import React from 'react';
import { cn } from '@/lib/utils';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'vertical' | 'horizontal';
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  wrap?: boolean;
  responsive?: boolean;
}

const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ 
    className, 
    direction = 'vertical',
    spacing = 'md',
    align = 'start',
    justify = 'start',
    wrap = false,
    responsive = false,
    children,
    ...props 
  }, ref) => {
    const directionClasses = {
      vertical: responsive ? 'flex flex-col lg:flex-col' : 'flex flex-col',
      horizontal: responsive ? 'flex flex-row lg:flex-row' : 'flex flex-row',
    };

    const spacingClasses = {
      xs: direction === 'vertical' ? 'space-y-[var(--stack-xs)]' : 'space-x-[var(--stack-xs)]',
      sm: direction === 'vertical' ? 'space-y-[var(--stack-sm)]' : 'space-x-[var(--stack-sm)]',
      md: direction === 'vertical' ? 'space-y-[var(--stack-md)]' : 'space-x-[var(--stack-md)]',
      lg: direction === 'vertical' ? 'space-y-[var(--stack-lg)]' : 'space-x-[var(--stack-lg)]',
      xl: direction === 'vertical' ? 'space-y-[var(--stack-xl)]' : 'space-x-[var(--stack-xl)]',
    };

    const alignClasses = {
      start: direction === 'vertical' ? 'items-start' : 'items-start',
      center: 'items-center',
      end: direction === 'vertical' ? 'items-end' : 'items-end',
      stretch: 'items-stretch',
    };

    const justifyClasses = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
    };

    const wrapClasses = wrap ? 'flex-wrap' : '';

    const responsiveClasses = responsive 
      ? direction === 'vertical' 
        ? 'flex-col sm:flex-row sm:space-y-0 sm:space-x-[var(--stack-md)]' 
        : 'flex-row sm:flex-col sm:space-x-0 sm:space-y-[var(--stack-md)]'
      : '';

    return (
      <div
        ref={ref}
        className={cn(
          directionClasses[direction],
          responsive ? responsiveClasses : spacingClasses[spacing],
          alignClasses[align],
          justifyClasses[justify],
          wrapClasses,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Stack.displayName = 'Stack';

export { Stack };
