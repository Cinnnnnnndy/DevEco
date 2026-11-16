import type { ButtonHTMLAttributes } from "react";
import { cn } from "../cn";

export type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  pressed?: boolean;
};

export function Chip({ pressed, className, children, type = "button", ...rest }: ChipProps) {
  return (
    <button
      type={type}
      className={cn("de-chip", className)}
      aria-pressed={pressed ? "true" : "false"}
      data-de-part="chip"
      {...rest}
    >
      {children}
    </button>
  );
}
