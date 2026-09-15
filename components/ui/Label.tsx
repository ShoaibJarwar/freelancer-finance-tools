import { LabelHTMLAttributes } from "react";

export function Label({
  className = "",
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={`mb-1.5 block text-[0.8125rem] font-medium text-foreground ${className}`}
      {...props}
    />
  );
}
