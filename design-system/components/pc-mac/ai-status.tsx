import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";

/** 智能状态胶囊。来自 intui-kit 的 AI 视觉规范，Pixso 预览未覆盖。 */

export type AiStatusState = "idle" | "thinking" | "generating" | "waiting" | "done" | "error";

export type AiStatusProps = HTMLAttributes<HTMLSpanElement> & {
  state?: AiStatusState;
  children: ReactNode;
};

export function AiStatus({ state = "idle", className, children, ...rest }: AiStatusProps) {
  return (
    <span className={cn("de-ai-status", className)} data-state={state} data-de-source="intui-kit" {...rest}>
      <span className="de-ai-spark" aria-hidden="true" />
      <span>{children}</span>
    </span>
  );
}
