import { HTMLAttributes } from "react";

export function Container({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`mx-auto w-full max-w-[1120px] px-5 sm:px-8 ${className}`}
      {...props}
    />
  );
}
