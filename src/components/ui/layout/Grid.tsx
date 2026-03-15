import React from 'react';
import { cn } from '@/lib/utils';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: number | '2' | '3' | 'sidebar' | 'auto' | {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  rows?: number;
  autoFit?: boolean;
  minColumnWidth?: string;
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ 
    className, 
    cols = 'auto', 
    gap = 'md',
    rows,
    autoFit = false,
    minColumnWidth = '250px',
    children,
    ...props 
  }, ref) => {
    const getColsClass = () => {
      if (typeof cols === 'object' && cols !== null) {
        const classes = [];
        if (cols.sm) classes.push(`grid-cols-${cols.sm}`);
        if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
        if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
        if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);
        return classes.join(' ');
      }
      
      const colsClasses = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
        sidebar: 'grid-cols-1 lg:grid-cols-[1fr_300px]',
        auto: autoFit 
          ? `grid-cols-[repeat(auto-fit,minmax(${minColumnWidth},1fr))]`
          : 'grid-cols-1',
      };
      
      return typeof cols === 'number' ? colsClasses[cols as keyof typeof colsClasses] : colsClasses[cols];
    };

    const gapClasses = {
      xs: 'gap-[var(--stack-xs)]',
      sm: 'gap-[var(--stack-sm)]',
      md: 'gap-[var(--stack-md)]',
      lg: 'gap-[var(--stack-lg)]',
      xl: 'gap-[var(--stack-xl)]',
    };

    const rowsClasses = rows ? `grid-rows-${rows}` : '';

    return (
      <div
        ref={ref}
        className={cn(
          'grid',
          getColsClass(),
          gapClasses[gap],
          rowsClasses,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Grid.displayName = 'Grid';

export { Grid };
