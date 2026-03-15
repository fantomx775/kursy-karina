"use client";

import React, { useState, useCallback, Children, cloneElement, isValidElement } from 'react';
import { cn } from '@/lib/utils';

export interface TabProps {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
  children?: React.ReactNode;
}

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultActiveId?: string;
  onTabChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Tab: React.FC<TabProps & { isActive: boolean; onClick: () => void }> = ({
  id,
  label,
  icon,
  disabled = false,
  badge,
  isActive,
  onClick,
  children,
}) => {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'relative flex items-center gap-2 px-4 py-2 font-medium transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-[var(--coffee-mocha)] focus:ring-offset-2',
        disabled && 'opacity-50 cursor-not-allowed',
        isActive
          ? 'text-[var(--coffee-mocha)] bg-[var(--coffee-cream)]'
          : 'text-[var(--coffee-macchiato)] hover:text-[var(--coffee-charcoal)] hover:bg-[var(--coffee-cream)]'
      )}
    >
      {icon && (
        <span className="flex-shrink-0 w-4 h-4">
          {icon}
        </span>
      )}
      
      <span className="truncate">{label}</span>
      
      {badge && (
        <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-[var(--coffee-mocha)] text-white border-radius">
          {badge}
        </span>
      )}
      
      {children}
    </button>
  );
};

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ 
    className, 
    defaultActiveId,
    onTabChange,
    variant = 'default',
    size = 'md',
    fullWidth = false,
    children,
    ...props 
  }, ref) => {
    const [activeId, setActiveId] = useState(defaultActiveId || '');

    const handleTabChange = useCallback((tabId: string) => {
      setActiveId(tabId);
      onTabChange?.(tabId);
    }, [onTabChange]);

    const getVariantClasses = () => {
      switch (variant) {
        case 'pills':
          return {
            container: 'bg-gray-100 p-1 border-radius',
            tab: 'border-radius',
            active: 'bg-white shadow-sm text-[var(--coffee-mocha)]',
          };
        case 'underline':
          return {
            container: 'border-b border-gray-200',
            tab: 'border-b-2 border-transparent text-[var(--coffee-macchiato)] hover:text-[var(--coffee-charcoal)] hover:border-[var(--coffee-cappuccino)]',
            active: 'border-[var(--coffee-mocha)] text-[var(--coffee-mocha)]',
          };
        default:
          return {
            container: 'border-b border-gray-200',
            tab: 'border-b-2 border-transparent text-[var(--coffee-macchiato)] hover:text-[var(--coffee-charcoal)] hover:border-[var(--coffee-cappuccino)]',
            active: 'border-[var(--coffee-mocha)] text-[var(--coffee-mocha)] bg-[var(--coffee-cream)]',
          };
      }
    };

    const getSizeClasses = () => {
      switch (size) {
        case 'sm':
          return 'text-sm';
        case 'lg':
          return 'text-lg';
        default:
          return 'text-base';
      }
    };

    const variantClasses = getVariantClasses();
    const sizeClasses = getSizeClasses();

    // Extract tabs from children
    const tabs = Children.toArray(children).filter((child) => {
      return isValidElement(child) && child.type === Tab;
    }) as React.ReactElement<TabProps>[];

    return (
      <div
        ref={ref}
        className={cn(
          'w-full',
          fullWidth && 'max-w-full',
          className
        )}
        {...props}
      >
        <div className={cn('flex', variantClasses.container)}>
          {tabs.map((tab) => {
            const isActive = tab.props.id === activeId;
            
            return (
              <Tab
                key={tab.props.id}
                id={tab.props.id}
                label={tab.props.label}
                icon={tab.props.icon}
                disabled={tab.props.disabled}
                badge={tab.props.badge}
                isActive={isActive}
                onClick={() => handleTabChange(tab.props.id)}
              >
                {tab.props.children}
              </Tab>
            );
          })}
        </div>
        
        {/* Tab Content */}
        <div className="mt-4">
          {tabs.map((tab) => {
            if (tab.props.id === activeId && tab.props.children) {
              return React.isValidElement(tab.props.children) 
                ? cloneElement(tab.props.children, { key: tab.props.id })
                : tab.props.children;
            }
            return null;
          })}
        </div>
      </div>
    );
  }
);

Tabs.displayName = 'Tabs';

// Export Tab component for external use
(Tabs as any).Tab = Tab;

export { Tabs };
