import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";

/** 文件管理「预览」按钮下的说明条。文案由调用方传入。 */

export type TooltipProps = HTMLAttributes<HTMLSpanElement> & {
  content: string;
  children: ReactNode;
};

export function Tooltip({ content, className, children, ...rest }: TooltipProps) {
  return (
    <span className={cn("de-tooltip", className)} data-tooltip={content} data-de-part="tooltip" {...rest}>
      {children}
    </span>
  );
}
