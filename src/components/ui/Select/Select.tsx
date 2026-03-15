"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { FiChevronDown, FiCheck } from 'react-icons/fi';

export interface SelectOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
}

export interface SelectProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  options: SelectOption[];
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  searchable?: boolean;
  clearable?: boolean;
  maxHeight?: number;
  onChange?: (value: string) => void;
}

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  ({
    options = [],
    value,
    placeholder = 'Select an option',
    disabled = false,
    error,
    helperText,
    searchable = false,
    clearable = false,
    maxHeight = 240,
    onChange,
    className,
    ...props
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find(option => option.value === value);

    const filteredOptions = options.filter(option => {
      if (!searchable) return true;
      const label = typeof option.label === 'string' ? option.label : '';
      return label.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleToggle = useCallback(() => {
      if (disabled) return;
      setIsOpen(!isOpen);
      setSearchTerm('');
      setHighlightedIndex(-1);
    }, [disabled, isOpen]);

    const handleSelect = useCallback((optionValue: string) => {
      const option = options.find(opt => opt.value === optionValue);
      if (option?.disabled) return;
      
      onChange?.(optionValue);
      setIsOpen(false);
      setSearchTerm('');
      setHighlightedIndex(-1);
    }, [options, onChange]);

    const handleClear = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      onChange?.('');
      setIsOpen(false);
      setSearchTerm('');
    }, [onChange]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (disabled) return;

      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (isOpen && highlightedIndex >= 0) {
            const option = filteredOptions[highlightedIndex];
            if (option && !option.disabled) {
              handleSelect(option.value);
            }
          } else {
            handleToggle();
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setHighlightedIndex(prev => {
              const next = prev + 1;
              return next < filteredOptions.length ? next : 0;
            });
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setHighlightedIndex(prev => {
              const next = prev - 1;
              return next >= 0 ? next : filteredOptions.length - 1;
            });
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setHighlightedIndex(-1);
          setSearchTerm('');
          buttonRef.current?.focus();
          break;
        case 'Tab':
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
      }
    }, [disabled, isOpen, highlightedIndex, filteredOptions, handleSelect, handleToggle]);

    // Close on outside click
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (buttonRef.current && !buttonRef.current.contains(event.target as Node) &&
            listRef.current && !listRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setHighlightedIndex(-1);
          setSearchTerm('');
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus search input when opened
    useEffect(() => {
      if (isOpen && searchable && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [isOpen, searchable]);

    // Scroll highlighted option into view
    useEffect(() => {
      if (highlightedIndex >= 0 && listRef.current) {
        const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
        if (highlightedElement) {
          highlightedElement.scrollIntoView({ block: 'nearest' });
        }
      }
    }, [highlightedIndex]);

    return (
      <div className="relative w-full">
        <button
          ref={buttonRef}
          type="button"
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={cn(
            'w-full px-4 py-2 text-left bg-white border border-radius shadow-sm',
            'focus:outline-none focus:ring-2 focus:ring-[var(--coffee-mocha)] focus:ring-offset-2',
            'transition-colors duration-200',
            'flex items-center justify-between gap-2',
            disabled && 'opacity-50 cursor-not-allowed',
            error && 'border-red-500 focus:ring-red-500',
            !error && 'border-[var(--coffee-cappuccino)] hover:border-[var(--coffee-mocha)]',
            className
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={props.id}
          {...props}
        >
          <span className={cn(
            'truncate flex-1',
            !selectedOption && 'text-gray-500'
          )}>
            {selectedOption ? (
              <span className="flex items-center gap-2">
                {selectedOption.icon}
                {selectedOption.label}
              </span>
            ) : (
              placeholder
            )}
          </span>
          
          <div className="flex items-center gap-1">
            {clearable && selectedOption && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-gray-400 hover:text-gray-600 border-radius"
                aria-label="Clear selection"
              >
                <FiCheck className="w-3 h-3 rotate-45" />
              </button>
            )}
            <FiChevronDown 
              className={cn(
                'w-4 h-4 text-gray-400 transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
            />
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-[var(--coffee-cappuccino)] border-radius shadow-lg">
            {searchable && (
              <div className="p-2 border-b border-[var(--coffee-cappuccino)]">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-3 py-2 text-sm border border-[var(--coffee-cappuccino)] border-radius focus:outline-none focus:ring-2 focus:ring-[var(--coffee-mocha)]"
                />
              </div>
            )}
            
            <ul
              ref={listRef}
              role="listbox"
              className="overflow-y-auto"
              style={{ maxHeight }}
            >
              {filteredOptions.length === 0 ? (
                <li className="px-4 py-3 text-sm text-gray-500 text-center">
                  No options found
                </li>
              ) : (
                filteredOptions.map((option, index) => (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={option.value === value}
                    className={cn(
                      'px-4 py-2 text-sm cursor-pointer transition-colors duration-150',
                      'flex items-center gap-2',
                      option.disabled && 'opacity-50 cursor-not-allowed',
                      !option.disabled && 'hover:bg-[var(--coffee-cream)]',
                      option.value === value && 'bg-[var(--coffee-cream)] text-[var(--coffee-mocha)]',
                      highlightedIndex === index && 'bg-[var(--coffee-macchiato)]',
                    )}
                    onClick={() => handleSelect(option.value)}
                  >
                    {option.icon}
                    <div className="flex-1">
                      <div>{option.label}</div>
                      {option.description && (
                        <div className="text-xs text-gray-500">{option.description}</div>
                      )}
                    </div>
                    {option.value === value && (
                      <FiCheck className="w-4 h-4 text-[var(--coffee-mocha)]" />
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>
        )}

        {helperText && (
          <p className={cn(
            'mt-1 text-sm',
            error ? 'text-red-600' : 'text-gray-600'
          )}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
