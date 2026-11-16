import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";
import { IconClose } from "../icons";

export type TabsProps = HTMLAttributes<HTMLDivElement>;

export function Tabs({ className, children, ...rest }: TabsProps) {
  return (
    <div role="tablist" className={cn("de-tabs", className)} data-de-part="tabs" {...rest}>
      {children}
    </div>
  );
}

export type TabProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  selected?: boolean;
  onClose?: () => void;
  closeLabel?: string;
  children: ReactNode;
};

export function Tab({ selected, onClose, closeLabel = "关闭", className, children, type = "button", ...rest }: TabProps) {
  return (
    <div className={cn("de-tab", className)} data-selected={selected ? "true" : undefined} data-de-part="tab">
      <button type={type} role="tab" aria-selected={selected ? "true" : "false"} className="de-tab__main" {...rest}>
        <span className="de-tree__name">{children}</span>
      </button>
      {onClose ? (
        <button type="button" className="de-tab__close" aria-label={closeLabel} onClick={onClose}>
          <IconClose />
        </button>
      ) : null}
    </div>
  );
}
