import React from 'react';
import { cn } from '@/lib/utils';

export interface IconProps extends React.HTMLAttributes<SVGElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  color?: string;
  children: React.ReactNode;
  className?: string;
}

const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ 
    size = 'md', 
    color = 'currentColor',
    className,
    children,
    ...props 
  }, ref) => {
    const sizeClasses = {
      xs: 'w-[var(--icon-xs)] h-[var(--icon-xs)]',
      sm: 'w-[var(--icon-sm)] h-[var(--icon-sm)]',
      md: 'w-[var(--icon-md)] h-[var(--icon-md)]',
      lg: 'w-[var(--icon-lg)] h-[var(--icon-lg)]',
      xl: 'w-[var(--icon-xl)] h-[var(--icon-xl)]',
    };

    const customSize = typeof size === 'number' 
      ? `w-[${size}px] h-[${size}px]` 
      : sizeClasses[size];

    return (
      <svg
        ref={ref}
        className={cn(
          'inline-block flex-shrink-0',
          customSize,
          className
        )}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        {...props}
      >
        {children}
      </svg>
    );
  }
);

Icon.displayName = 'Icon';

export { Icon };
