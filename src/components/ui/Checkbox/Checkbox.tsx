"use client";

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { FiCheck } from 'react-icons/fi';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'onChange'> {
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  label?: React.ReactNode;
  description?: string;
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'card';
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({
    checked,
    defaultChecked = false,
    indeterminate = false,
    label,
    description,
    error,
    helperText,
    size = 'md',
    variant = 'default',
    disabled = false,
    onChange,
    className,
    ...props
  }, ref) => {
    const [isChecked, setIsChecked] = useState(checked ?? defaultChecked);
    const isControlled = checked !== undefined;
    const currentChecked = isControlled ? checked : isChecked;

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = e.target.checked;
      
      if (!isControlled) {
        setIsChecked(newChecked);
      }
      
      onChange?.(newChecked);
    }, [isControlled, onChange]);

    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };

    const labelSizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    };

    const renderCheckbox = () => (
      <div className="relative">
        <input
          ref={ref}
          type="checkbox"
          checked={currentChecked}
          disabled={disabled}
          onChange={handleChange}
          className={cn(
            'sr-only',
            'peer',
            className
          )}
          {...props}
        />
        
        <div
          className={cn(
            'flex items-center justify-center border-2 border-radius transition-all duration-200',
            'peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--coffee-mocha)] peer-focus:ring-offset-2',
            sizeClasses[size],
            disabled && 'opacity-50 cursor-not-allowed',
            error && 'border-red-500 peer-focus:ring-red-500',
            !error && 'border-[var(--coffee-cappuccino)] peer-checked:border-[var(--coffee-mocha)]',
            !disabled && 'hover:border-[var(--coffee-mocha)]',
            currentChecked && 'bg-[var(--coffee-mocha)] border-[var(--coffee-mocha)]',
            !currentChecked && 'bg-white'
          )}
        >
          {currentChecked && !indeterminate && (
            <FiCheck className={cn(
              'text-white transition-all duration-200',
              size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
            )} />
          )}
          
          {indeterminate && (
            <div className={cn(
              'bg-white transition-all duration-200',
              size === 'sm' ? 'w-2 h-0.5' : size === 'lg' ? 'w-3 h-1' : 'w-2.5 h-0.75'
            )} />
          )}
        </div>
      </div>
    );

    if (variant === 'card') {
      return (
        <label className={cn(
          'block p-4 border-2 border-radius cursor-pointer transition-all duration-200',
          'hover:border-[var(--coffee-mocha)] hover:bg-[var(--coffee-cream)]',
          currentChecked && 'border-[var(--coffee-mocha)] bg-[var(--coffee-cream)]',
          disabled && 'opacity-50 cursor-not-allowed',
          error && 'border-red-500',
          !error && 'border-[var(--coffee-cappuccino)]'
        )}>
          <div className="flex items-start gap-3">
            {renderCheckbox()}
            <div className="flex-1">
              {label && (
                <div className={cn(
                  'font-medium text-[var(--coffee-charcoal)]',
                  labelSizeClasses[size]
                )}>
                  {label}
                </div>
              )}
              {description && (
                <div className="text-sm text-gray-600 mt-1">
                  {description}
                </div>
              )}
            </div>
          </div>
        </label>
      );
    }

    return (
      <div className="flex items-start gap-3">
        {renderCheckbox()}
        
        {(label || description) && (
          <div className="flex-1">
            {label && (
              <label
                className={cn(
                  'font-medium text-[var(--coffee-charcoal)] cursor-pointer select-none',
                  labelSizeClasses[size],
                  disabled && 'cursor-not-allowed opacity-50'
                )}
              >
                {label}
              </label>
            )}
            
            {description && (
              <div className="text-sm text-gray-600 mt-1">
                {description}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
