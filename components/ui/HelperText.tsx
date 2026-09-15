import { HTMLAttributes } from "react";

export function HelperText({
  error = false,
  className = "",
  ...props
}: HTMLAttributes<HTMLParagraphElement> & { error?: boolean }) {
  return (
    <p
      role={error ? "alert" : undefined}
      className={`mt-1.5 text-[0.8125rem] ${
        error ? "text-error" : "text-muted-foreground"
      } ${className}`}
      {...props}
    />
  );
}
