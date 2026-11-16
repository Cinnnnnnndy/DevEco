import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";

export type NavListProps = HTMLAttributes<HTMLElement> & {
  label?: string;
};

export function NavList({ label = "导航", className, children, ...rest }: NavListProps) {
  return (
    <nav aria-label={label} className={cn("de-nav", className)} data-de-part="nav-list" {...rest}>
      {children}
    </nav>
  );
}

export function NavLabel({ children }: { children: ReactNode }) {
  return <div className="de-nav__label">{children}</div>;
}

export type NavItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  current?: boolean;
};

export function NavItem({ icon, current, className, children, type = "button", ...rest }: NavItemProps) {
  return (
    <button
      type={type}
      className={cn("de-nav__item", className)}
      aria-current={current ? "page" : undefined}
      {...rest}
    >
      {icon ? <span className="de-icon">{icon}</span> : null}
      <span className="de-tree__name">{children}</span>
    </button>
  );
}
