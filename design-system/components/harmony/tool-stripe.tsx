import type { HTMLAttributes } from "react";
import { cn } from "../cn";

/** 编辑器右侧的深色图标条。图标由调用方传入，本库不附带整套图标字体。 */

export type ToolStripeProps = HTMLAttributes<HTMLElement> & {
  label?: string;
};

export function ToolStripe({ label = "工具", className, children, ...rest }: ToolStripeProps) {
  return (
    <nav aria-label={label} className={cn("de-stripe", className)} data-de-part="tool-stripe" {...rest}>
      {children}
    </nav>
  );
}
