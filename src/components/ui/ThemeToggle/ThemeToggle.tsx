"use client";

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { SunIcon, MoonIcon } from '@/components/ui/Icon';
import { FiSun, FiMoon } from 'react-icons/fi';
import { cn } from '@/lib/utils';

export interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const ThemeToggle = React.forwardRef<HTMLButtonElement, ThemeToggleProps>(
  ({ className, size = 'md', showLabel = false, ...props }, ref) => {
    const { theme, setTheme } = useTheme();

    const handleToggle = () => {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
    };

    const sizeClasses = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
    };

    const isDark = theme === 'dark';

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleToggle}
        className={cn(
          'relative inline-flex items-center justify-center rounded-full border-2 transition-all duration-300',
          'border-[var(--coffee-cappuccino)] bg-white hover:bg-[var(--coffee-cream)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--coffee-mocha)] focus:ring-offset-2',
          sizeClasses[size],
          className
        )}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        {...props}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Sun icon for light mode */}
          <SunIcon>
            <FiSun className={cn(
              'absolute w-4 h-4 transition-all duration-300',
              isDark ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
            )} />
          </SunIcon>
          
          {/* Moon icon for dark mode */}
          <MoonIcon>
            <FiMoon className={cn(
              'absolute w-4 h-4 transition-all duration-300',
              isDark ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
            )} />
          </MoonIcon>
        </div>
        
        {showLabel && (
          <span className="sr-only">
            {isDark ? 'Dark mode' : 'Light mode'}
          </span>
        )}
      </button>
    );
  }
);

ThemeToggle.displayName = 'ThemeToggle';

export { ThemeToggle };
