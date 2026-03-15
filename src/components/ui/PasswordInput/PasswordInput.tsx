"use client";

import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { cn } from "@/lib/utils";

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const inputId = id || `password-${Math.random().toString(36).slice(2, 9)}`;

    const inputClasses = cn(
      "w-full border px-3 py-2 pr-10 bg-white text-[var(--coffee-charcoal)] placeholder-[var(--coffee-macchiato)] focus:outline-none focus:ring-2 focus:ring-[var(--coffee-macchiato)] focus:border-transparent border-radius input-border",
      error && "input-border-error focus:ring-[var(--error)] focus:border-[var(--error)]",
      className
    );

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm text-[var(--coffee-charcoal)] mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type={visible ? "text" : "password"}
            id={inputId}
            className={inputClasses}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-0 top-0 bottom-0 flex items-center justify-center w-10 text-[var(--coffee-macchiato)] hover:text-[var(--coffee-charcoal)] focus:outline-none focus:text-[var(--coffee-charcoal)] border-radius"
            aria-label={visible ? "Ukryj hasło" : "Pokaż hasło"}
          >
            {visible ? (
              <FiEyeOff className="w-5 h-5" aria-hidden />
            ) : (
              <FiEye className="w-5 h-5" aria-hidden />
            )}
          </button>
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-[var(--error)]">
            {error}
          </p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
