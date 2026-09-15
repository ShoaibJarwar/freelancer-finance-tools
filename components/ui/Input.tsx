import { InputHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ invalid = false, className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={`h-11 w-full rounded-[var(--radius-control)] border bg-surface px-3
          text-[0.9375rem] text-foreground placeholder:text-muted-foreground
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
          disabled:opacity-50 disabled:pointer-events-none
          ${invalid ? "border-error" : "border-border"} ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
