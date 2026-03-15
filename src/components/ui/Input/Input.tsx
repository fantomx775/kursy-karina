import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = 'text',
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    id,
    ...props 
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    const baseClasses = 'w-full px-3 py-2 text-base border bg-white text-[var(--coffee-charcoal)] placeholder-[var(--coffee-macchiato)] focus:outline-none focus:ring-2 focus:ring-[var(--coffee-macchiato)] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 border-radius input-border';
    
    const errorClasses = error ? 'input-border-error focus:ring-[var(--error)] focus:border-[var(--error)]' : '';
    
    const withLeftIcon = leftIcon ? 'pl-10' : '';
    const withRightIcon = rightIcon ? 'pr-10' : '';
    
    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--coffee-charcoal)]"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--coffee-macchiato)]">
              {leftIcon}
            </div>
          )}
          
          <input
            type={type}
            id={inputId}
            className={cn(
              baseClasses,
              errorClasses,
              withLeftIcon,
              withRightIcon,
              className
            )}
            ref={ref}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error || helperText ? `${inputId}-description` : undefined}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[var(--coffee-macchiato)]">
              {rightIcon}
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <p 
            id={`${inputId}-description`}
            className={cn(
              'text-sm',
              error ? 'text-[var(--error)]' : 'text-[var(--coffee-macchiato)]'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
