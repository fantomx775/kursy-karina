import React from 'react';
import { cn } from '@/lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  fallback?: string;
  variant?: 'circular' | 'rounded' | 'square';
  status?: 'online' | 'offline' | 'away' | 'busy';
  showStatus?: boolean;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ 
    className, 
    src,
    alt = '',
    size = 'md',
    fallback,
    variant = 'circular',
    status,
    showStatus = false,
    children,
    ...props 
  }, ref) => {
    const sizeClasses = {
      xs: 'w-6 h-6 text-xs',
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-base',
      lg: 'w-12 h-12 text-lg',
      xl: 'w-16 h-16 text-xl',
      '2xl': 'w-20 h-20 text-2xl',
    };

    const variantClasses = {
      circular: 'rounded-full',
      rounded: 'rounded-lg',
      square: 'rounded-none',
    };

    const statusColors = {
      online: 'bg-green-500',
      offline: 'bg-gray-400',
      away: 'bg-yellow-500',
      busy: 'bg-red-500',
    };

    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
    };

    const renderAvatar = () => {
      if (src) {
        return (
          <img
            src={src}
            alt={alt}
            className={cn(
              'w-full h-full object-cover',
              variantClasses[variant]
            )}
            onError={(e) => {
              // Hide broken image and show fallback
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        );
      }

      if (children) {
        return (
          <div className="w-full h-full flex items-center justify-center">
            {children}
          </div>
        );
      }

      if (fallback) {
        const initials = getInitials(fallback);
        return (
          <div className="w-full h-full flex items-center justify-center bg-[var(--coffee-cream)] text-[var(--coffee-charcoal)] font-medium">
            {initials}
          </div>
        );
      }

      // Default fallback icon
      return (
        <div className="w-full h-full flex items-center justify-center bg-[var(--coffee-macchiato)] text-white">
          <svg
            className="w-1/2 h-1/2"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
      );
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex shrink-0',
          sizeClasses[size],
          variantClasses[variant],
          'bg-gray-100',
          className
        )}
        {...props}
      >
        {renderAvatar()}
        
        {showStatus && status && (
          <div
            className={cn(
              'absolute -bottom-0 -right-0 w-3 h-3 rounded-full border-2 border-white',
              statusColors[status]
            )}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export { Avatar };
