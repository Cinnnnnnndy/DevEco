import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";

/** 普通菜单。圆角 corner_radius_level4，阴影 defaultShadowS_PC，字号 Body_L。 */

export type MenuProps = HTMLAttributes<HTMLUListElement>;

export function Menu({ className, children, ...rest }: MenuProps) {
  return (
    <ul role="menu" className={cn("de-menu", className)} data-de-part="menu" {...rest}>
      {children}
    </ul>
  );
}

export type MenuItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  shortcut?: string;
  current?: boolean;
};

export function MenuItem({ icon, shortcut, current, className, children, type = "button", ...rest }: MenuItemProps) {
  return (
    <li role="none">
      <button
        type={type}
        role="menuitem"
        className={cn("de-menu__item", className)}
        aria-current={current ? "true" : undefined}
        {...rest}
      >
        {icon ? <span className="de-icon">{icon}</span> : null}
        <span className="de-menu__label">{children}</span>
        {shortcut ? <span className="de-menu__shortcut">{shortcut}</span> : null}
      </button>
    </li>
  );
}

export function MenuSeparator() {
  return <li role="separator" className="de-menu__sep" />;
}
