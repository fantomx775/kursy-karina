"use client";

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { FiMenu, FiX } from 'react-icons/fi';

export interface SidebarItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  badge?: string | number;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children?: SidebarItem[];
}

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  items: SidebarItem[];
  collapsed?: boolean;
  collapsible?: boolean;
  width?: string;
  collapsedWidth?: string;
  variant?: 'default' | 'minimal' | 'padded';
  position?: 'left' | 'right';
  onCollapse?: (collapsed: boolean) => void;
  logo?: React.ReactNode;
  footer?: React.ReactNode;
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({
    items = [],
    collapsed = false,
    collapsible = true,
    width = 'w-64',
    collapsedWidth = 'w-16',
    variant = 'default',
    position = 'left',
    onCollapse,
    logo,
    footer,
    className,
    children,
    ...props
  }, ref) => {
    const [isCollapsed, setIsCollapsed] = useState(collapsed);
    const isControlled = collapsed !== undefined;
    const currentCollapsed = isControlled ? collapsed : isCollapsed;

    const handleToggle = useCallback(() => {
      if (!collapsible) return;
      
      const newCollapsed = !currentCollapsed;
      if (!isControlled) {
        setIsCollapsed(newCollapsed);
      }
      onCollapse?.(newCollapsed);
    }, [collapsible, currentCollapsed, isControlled, onCollapse]);

    const renderSidebarItem = (item: SidebarItem, level = 0) => (
      <div key={item.id}>
        <button
          type="button"
          onClick={item.onClick}
          disabled={item.disabled}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 text-left border-radius transition-colors duration-200',
            'hover:bg-[var(--coffee-cream)] focus:outline-none focus:ring-2 focus:ring-[var(--coffee-mocha)] focus:ring-offset-2',
            item.disabled && 'opacity-50 cursor-not-allowed',
            item.active && 'bg-[var(--coffee-cream)] text-[var(--coffee-mocha)]',
            !item.active && !item.disabled && 'text-[var(--coffee-macchiato)] hover:text-[var(--coffee-charcoal)]',
            variant === 'minimal' && 'px-2 py-1',
            level > 0 && 'ml-4'
          )}
        >
          {item.icon && (
            <span className={cn(
              'flex-shrink-0',
              currentCollapsed && variant !== 'minimal' && 'w-5 h-5'
            )}>
              {item.icon}
            </span>
          )}
          
          {!currentCollapsed || variant === 'minimal' ? (
            <span className={cn(
              'flex-1 truncate',
              currentCollapsed && 'hidden'
            )}>
              {item.label}
            </span>
          ) : null}
          
          {item.badge && (
            <span className={cn(
              'inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium border-radius',
              'bg-[var(--coffee-mocha)] text-white',
              currentCollapsed && 'hidden'
            )}>
              {item.badge}
            </span>
          )}
        </button>
        
        {/* Render children if they exist */}
        {item.children && item.children.length > 0 && !currentCollapsed && (
          <div className="mt-1 space-y-1">
            {item.children.map(child => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    );

    const getVariantClasses = () => {
      switch (variant) {
        case 'minimal':
          return 'bg-white border-r border-gray-200';
        case 'padded':
          return 'bg-[var(--coffee-cream)] p-4';
        default:
          return 'bg-white';
      }
    };

    const getPositionClasses = () => {
      switch (position) {
        case 'right':
          return 'right-0 top-0 h-full border-l';
        default:
          return 'left-0 top-0 h-full border-r';
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          'fixed z-40 flex flex-col transition-all duration-300 ease-in-out',
          getVariantClasses(),
          getPositionClasses(),
          currentCollapsed ? collapsedWidth : width,
          className
        )}
        {...props}
      >
        {/* Header */}
        <div className={cn(
          'flex items-center justify-between p-4 border-b border-gray-200',
          variant === 'minimal' && 'p-2',
          variant === 'padded' && 'p-6'
        )}>
          {logo && (
            <div className={cn(
              'flex items-center gap-3',
              currentCollapsed && 'justify-center'
            )}>
              {logo}
            </div>
          )}
          
          {collapsible && (
            <button
              type="button"
              onClick={handleToggle}
              className="p-2 text-gray-500 hover:text-gray-700 border-radius hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--coffee-mocha)]"
              aria-label={currentCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {currentCollapsed ? (
                <FiMenu className="w-5 h-5" />
              ) : (
                <FiX className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1">
            {items.map(item => renderSidebarItem(item))}
          </div>
          
          {children}
        </nav>

        {/* Footer */}
        {footer && (
          <div className={cn(
            'p-4 border-t border-gray-200',
            variant === 'minimal' && 'p-2',
            variant === 'padded' && 'p-6'
          )}>
            {!currentCollapsed && footer}
          </div>
        )}
      </div>
    );
  }
);

Sidebar.displayName = 'Sidebar';

export { Sidebar };
