import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";

export type IconButtonSize = "s" | "m";

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: IconButtonSize;
  label: string;
  icon: ReactNode;
  pressed?: boolean;
};

export function IconButton({ size = "m", label, icon, pressed, className, type = "button", ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      className={cn("de-icon-button", `de-icon-button--${size}`, className)}
      aria-label={label}
      aria-pressed={pressed}
      data-de-part="icon-button"
      {...rest}
    >
      <span className="de-button__icon">{icon}</span>
    </button>
  );
}
