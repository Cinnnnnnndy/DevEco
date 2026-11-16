import type { HTMLAttributes } from "react";
import { cn } from "../cn";

/** 备忘录条目上的色块标签。色值从预览取样，不是印出的 token。 */

export type TagProps = HTMLAttributes<HTMLSpanElement>;

export function Tag({ className, children, ...rest }: TagProps) {
  return (
    <span className={cn("de-tag", className)} data-de-part="tag" {...rest}>
      {children}
    </span>
  );
}
