"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface DropdownItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  danger?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  position = 'bottom-left',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleItemClick = useCallback((item: DropdownItem) => {
    if (item.disabled) return;
    
    if (item.onClick) {
      item.onClick();
    }
    
    if (item.href) {
      window.location.href = item.href;
    }
    
    closeDropdown();
  }, [closeDropdown]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDropdown();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeDropdown]);

  const positionClasses = {
    'bottom-left': 'top-full left-0 mt-1',
    'bottom-right': 'top-full right-0 mt-1',
    'top-left': 'bottom-full left-0 mb-1',
    'top-right': 'bottom-full right-0 mb-1',
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <div
        onClick={toggleDropdown}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleDropdown();
          }
        }}
        className="cursor-pointer focus:outline-none"
        tabIndex={0}
        role="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            'absolute z-50 min-w-[200px] bg-white border border-[var(--coffee-cappuccino)] border-radius shadow-lg py-1',
            positionClasses[position],
            className
          )}
          role="menu"
        >
          {items.map((item) => (
            <div
              key={item.key}
              onClick={() => handleItemClick(item)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors',
                'hover:bg-[var(--coffee-cream)] focus:bg-[var(--coffee-cream)] focus:outline-none',
                item.disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent',
                item.danger && 'text-red-600 hover:bg-red-50'
              )}
              role="menuitem"
              tabIndex={-1}
            >
              {item.icon && (
                <span className="flex-shrink-0 w-4 h-4">
                  {item.icon}
                </span>
              )}
              <span className="flex-1">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export { Dropdown };
