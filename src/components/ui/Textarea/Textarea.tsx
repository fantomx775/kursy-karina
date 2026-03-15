import React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    className,
    label,
    error,
    helperText,
    resize = 'vertical',
    ...props
  }, ref) => {
    const textareaId = React.useId();
    const errorId = React.useId();
    const helperId = React.useId();

    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            'w-full px-3 py-2 border border-gray-300 border-radius shadow-sm focus:ring-blue-500 focus:border-blue-500',
            {
              'resize-none': resize === 'none',
              'resize-x': resize === 'horizontal',
              'resize-y': resize === 'vertical',
              'resize': resize === 'both',
            },
            error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
            className
          )}
          aria-describedby={error ? errorId : helperId ? helperId : undefined}
          aria-invalid={!!error}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-sm text-red-600 mt-1">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="text-sm text-gray-500 mt-1">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
