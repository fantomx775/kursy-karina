"use client";

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
  description?: string;
}

export interface RadioGroupProps {
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  name?: string;
  direction?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  error?: string;
  helperText?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'onChange'> {
  checked?: boolean;
  defaultChecked?: boolean;
  label?: React.ReactNode;
  description?: string;
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({
    checked,
    defaultChecked = false,
    label,
    description,
    error,
    helperText,
    size = 'md',
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

    return (
      <div className="flex items-start gap-3">
        <div className="relative">
          <input
            ref={ref}
            type="radio"
            checked={currentChecked}
            disabled={disabled}
            onChange={handleChange}
            className={cn(
              'sr-only peer',
              className
            )}
            {...props}
          />
          
          <div
            className={cn(
              'flex items-center justify-center border-2 rounded-full transition-all duration-200',
              'peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--coffee-mocha)] peer-focus:ring-offset-2',
              sizeClasses[size],
              disabled && 'opacity-50 cursor-not-allowed',
              error && 'border-red-500 peer-focus:ring-red-500',
              !error && 'border-[var(--coffee-cappuccino)] peer-checked:border-[var(--coffee-mocha)]',
              !disabled && 'hover:border-[var(--coffee-mocha)]',
              currentChecked && 'border-[var(--coffee-mocha)]'
            )}
          >
            {currentChecked && (
              <div className={cn(
                'bg-[var(--coffee-mocha)] rounded-full transition-all duration-200',
                size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-2.5 h-2.5'
              )} />
            )}
          </div>
        </div>
        
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

Radio.displayName = 'Radio';

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({
    options = [],
    value,
    defaultValue,
    name,
    direction = 'vertical',
    size = 'md',
    disabled = false,
    error,
    helperText,
    onChange,
    className
  }, ref) => {
    const [selectedValue, setSelectedValue] = useState(value ?? defaultValue ?? '');
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : selectedValue;

    const handleRadioChange = useCallback((optionValue: string) => {
      if (!isControlled) {
        setSelectedValue(optionValue);
      }
      
      onChange?.(optionValue);
    }, [isControlled, onChange]);

    const directionClasses = {
      horizontal: 'flex-row gap-6',
      vertical: 'flex-col gap-3',
    };

    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    };

    return (
      <div ref={ref} className={cn('space-y-1', className)}>
        <div className={cn('flex', directionClasses[direction])}>
          {options.map((option) => (
            <Radio
              key={option.value}
              name={name}
              checked={currentValue === option.value}
              disabled={disabled || option.disabled}
              size={size}
              label={option.label}
              description={option.description}
              onChange={() => handleRadioChange(option.value)}
            />
          ))}
        </div>
        
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

RadioGroup.displayName = 'RadioGroup';

export { Radio, RadioGroup };
