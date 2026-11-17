import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";

/**
 * 单行文本输入与校验反馈 (Pixso 4.4单行文本输入 + 4.6报错tips + NewUI Input field)
 * - pc-mac: 28px 高, r=4px, 1px 描边 (#C9CCD6 / #4E5157), 聚焦 #3574F0, 错误 #DB3B4B / #DB5C5C
 * - harmony: 28vp 高, r=4vp, 默认 5% 叠加底, 悬停 15% 叠加底, 激活 1px #0A59F7/#317AF7,
 *   报错 1px #CF3922/#D94838 + 4.6报错tips (高 28vp, r=4vp, 底 #FBE0DC / #4E3231)
 */

export type TextInputState = "default" | "active" | "error";

export type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: ReactNode;
  state?: TextInputState;
  errorTip?: ReactNode;
  inline?: boolean;
};

export function TextInput({
  label,
  state = "default",
  errorTip,
  inline = false,
  className,
  disabled,
  id,
  ...rest
}: TextInputProps) {
  const inputBox = (
    <span
      className={cn("de-input", label == null ? className : undefined)}
      data-state={state !== "default" ? state : undefined}
      data-disabled={disabled ? "true" : undefined}
      data-de-part="text-input"
    >
      <input id={id} className="de-input__control" disabled={disabled} aria-invalid={state === "error" || undefined} {...rest} />
    </span>
  );

  if (label == null && errorTip == null) {
    return inputBox;
  }

  return (
    <div className={cn("de-field", inline && "de-field--inline", className)} data-de-part="field">
      {label != null ? (
        <label htmlFor={id} className="de-field__label">
          {label}
        </label>
      ) : null}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
        {inputBox}
        {errorTip != null ? (
          <div className="de-error-tip" role="alert">
            {errorTip}
          </div>
        ) : null}
      </div>
    </div>
  );
}
