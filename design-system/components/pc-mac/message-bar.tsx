import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";

/** 消息操作栏。来自 intui-kit 的 message-actions，Pixso 预览未覆盖。
 *  AI 回答下常显；你发的消息用 UserMessage，悬停才出现。 */

export type MessageBarProps = HTMLAttributes<HTMLDivElement> & {
  time?: string;
  edited?: boolean;
};

export function MessageBar({ time, edited, className, children, ...rest }: MessageBarProps) {
  return (
    <div className={cn("de-ai-msgbar", className)} data-de-source="intui-kit" {...rest}>
      {children}
      {time ? (
        <time className="de-ai-msgbar__time" data-edited={edited ? "" : undefined}>
          {time}
        </time>
      ) : null}
    </div>
  );
}

export type MessageBarButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  done?: boolean;
};

export function MessageBarButton({ done, className, type = "button", ...rest }: MessageBarButtonProps) {
  return <button type={type} className={cn("de-ai-msgbar__btn", className)} data-done={done ? "" : undefined} {...rest} />;
}

export type UserMessageProps = HTMLAttributes<HTMLDivElement> & {
  text: ReactNode;
  bar?: ReactNode;
};

export function UserMessage({ text, bar, className, ...rest }: UserMessageProps) {
  return (
    <div className={cn("de-ai-umsg", className)} data-de-source="intui-kit" {...rest}>
      <div className="de-ai-umsg__bubble">{text}</div>
      {bar}
    </div>
  );
}
