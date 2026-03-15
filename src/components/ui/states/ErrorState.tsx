import React from 'react';
import { cn } from '@/lib/utils';

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  message?: string;
  error?: Error | string;
  onRetry?: () => void;
  retryText?: string;
  variant?: 'default' | 'network' | 'not-found';
}

const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  ({ 
    className, 
    title,
    message,
    error,
    onRetry,
    retryText = 'Spróbuj ponownie',
    variant = 'default',
    ...props 
  }, ref) => {
    const getErrorContent = () => {
      switch (variant) {
        case 'network':
          return {
            icon: '🌐',
            title: title || 'Problem z połączeniem',
            message: message || 'Sprawdź połączenie z internetem i spróbuj ponownie.'
          };
        case 'not-found':
          return {
            icon: '🔍',
            title: title || 'Nie znaleziono',
            message: message || 'Nie znaleziono szukanej treści.'
          };
        default:
          return {
            icon: '⚠️',
            title: title || 'Wystąpił błąd',
            message: message || (typeof error === 'string' ? error : error?.message) || 'Coś poszło nie tak.'
          };
      }
    };

    const { icon, title: errorTitle, message: errorMessage } = getErrorContent();

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center text-center py-12 px-6',
          className
        )}
        {...props}
      >
        <div className="text-4xl mb-4">
          {icon}
        </div>
        
        <h3 className="text-lg font-semibold text-[var(--error)] mb-2">
          {errorTitle}
        </h3>
        
        <p className="text-[var(--coffee-macchiato)] mb-6 max-w-md">
          {errorMessage}
        </p>
        
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 border-radius bg-[var(--coffee-espresso)] text-white hover:bg-[var(--coffee-dark)] transition-colors duration-200"
          >
            {retryText}
          </button>
        )}
      </div>
    );
  }
);

ErrorState.displayName = 'ErrorState';

export { ErrorState };
