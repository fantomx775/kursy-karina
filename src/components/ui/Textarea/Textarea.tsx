import React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  resize?: "none" | "both" | "horizontal" | "vertical";
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { className, label, error, helperText, resize = "vertical", id, ...props },
    ref,
  ) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;
    const descriptionId =
      error || helperText ? `${textareaId}-description` : undefined;

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
            "w-full px-3 py-2 border bg-white text-[var(--coffee-charcoal)] placeholder-[var(--coffee-macchiato)] border-radius input-border shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--coffee-macchiato)] focus:border-transparent",
            {
              "resize-none": resize === "none",
              "resize-x": resize === "horizontal",
              "resize-y": resize === "vertical",
              resize: resize === "both",
            },
            error &&
              "input-border-error focus:ring-[var(--error)] focus:border-[var(--error)]",
            className,
          )}
          aria-describedby={descriptionId}
          aria-invalid={error ? "true" : "false"}
          {...props}
        />
        {(error || helperText) && (
          <p
            id={descriptionId}
            className={cn(
              "text-sm mt-1",
              error ? "text-[var(--error)]" : "text-[var(--coffee-macchiato)]",
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export { Textarea };
