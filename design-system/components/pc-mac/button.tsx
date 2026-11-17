import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";

/**
 * DevEco 按钮组件 (Pixso AST 对齐版)
 * - pc-mac (IntelliJ NewUI): Default 28px / Slim 24px, r=4px, Primary #3574F0, Secondary 1px 描边, Danger #DB3B4B/#DB5C5C
 * - harmony (鸿蒙IDE_v1.1.0_PC端组件库 4.1按钮): 高 34vp (紧凑 28vp), r=8vp:
 *   1-主按钮 (primary): #0A59F7 (Light) / #317AF7 (Dark), 悬停 #236AF8 / #2C6EDE, 置灰 40%
 *   2-次按钮 (secondary): 10% 叠加底, 品牌蓝文字 #0A59F7 / #5291FF, 悬停 20% 叠加
 *   3-告警按钮 (danger): 10% 叠加底, 告警红文字 #E84026 / #D94838, 悬停 20% 叠加
 *   4-图标文字按钮 (toolbar / quiet / icon-text): 透明底, 悬停 10% 叠加
 */

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "toolbar"
  | "quiet"
  | "solid"
  | "icon-text";
export type ButtonSize = "s" | "m";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
};

export function Button({
  variant = "secondary",
  size = "m",
  icon,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn("de-button", `de-button--${variant}`, `de-button--${size}`, className)}
      data-de-part="button"
      {...rest}
    >
      {icon ? <span className="de-button__icon">{icon}</span> : null}
      {children != null && children !== "" ? <span className="de-button__label">{children}</span> : null}
    </button>
  );
}
