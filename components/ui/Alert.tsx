import { HTMLAttributes } from "react";

type AlertVariant = "info" | "warning" | "success" | "error";

const variantStyles: Record<AlertVariant, string> = {
  info: "bg-info-bg border-info/20 text-foreground",
  warning: "bg-warning-bg border-warning/20 text-foreground",
  success: "bg-success/10 border-success/20 text-foreground",
  error: "bg-error-bg border-error/20 text-foreground",
};

const variantLabel: Record<AlertVariant, string> = {
  info: "Note",
  warning: "Warning",
  success: "Success",
  error: "Error",
};

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  /** Overrides the default variant label (e.g. "Assumption" for a calculator). */
  label?: string;
}

export function Alert({
  variant = "info",
  label,
  className = "",
  children,
  ...props
}: AlertProps) {
  return (
    <div
      role={variant === "error" ? "alert" : undefined}
      className={`rounded-[var(--radius-card)] border px-4 py-3 text-sm leading-relaxed ${variantStyles[variant]} ${className}`}
      {...props}
    >
      <p className="mb-1 font-medium">{label ?? variantLabel[variant]}</p>
      <div className="text-muted-foreground">{children}</div>
    </div>
  );
}
