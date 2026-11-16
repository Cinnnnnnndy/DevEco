import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";

/** 工具栏按钮、安静按钮，以及文件树里见过的实心「Search」。
 *  没在产品帧里见过主色填充或危险按钮，不要加 variant。 */

export type ButtonVariant = "toolbar" | "quiet" | "solid";
export type ButtonSize = "s" | "m";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
};

export function Button({
  variant = "toolbar",
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
