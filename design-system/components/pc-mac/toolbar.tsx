import type { HTMLAttributes } from "react";
import { cn } from "../cn";

export type ToolbarProps = HTMLAttributes<HTMLDivElement> & {
  label?: string;
};

export function Toolbar({ label = "工具栏", className, children, ...rest }: ToolbarProps) {
  return (
    <div role="toolbar" aria-label={label} className={cn("de-toolbar", className)} data-de-part="toolbar" {...rest}>
      {children}
    </div>
  );
}

export function ToolbarSeparator() {
  return <span className="de-toolbar__sep" role="separator" />;
}

export function ToolbarSpacer() {
  return <span className="de-toolbar__spacer" />;
}
