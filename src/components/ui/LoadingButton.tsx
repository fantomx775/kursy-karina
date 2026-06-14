import React from "react";
import { Spinner } from "@/components/ui/Spinner";

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
}

export function LoadingButton({ 
  loading = false, 
  children, 
  disabled, 
  className = "", 
  ...props 
}: LoadingButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        relative inline-flex items-center justify-center border-radius
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200 active:scale-[0.98]
        ${className}
      `}
    >
      {loading && (
        <span className="-ml-1 mr-2 flex shrink-0" aria-hidden>
          <Spinner size="sm" />
        </span>
      )}
      {children}
    </button>
  );
}
