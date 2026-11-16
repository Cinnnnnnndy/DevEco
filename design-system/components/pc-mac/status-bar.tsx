import type { HTMLAttributes } from "react";
import { cn } from "../cn";

export type StatusBarProps = HTMLAttributes<HTMLElement>;

export function StatusBar({ className, children, ...rest }: StatusBarProps) {
  return (
    <footer className={cn("de-statusbar", className)} data-de-part="status-bar" {...rest}>
      {children}
    </footer>
  );
}
