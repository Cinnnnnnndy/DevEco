import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";

/** 单行输入沿用搜索框的表面。错误态、禁用文案和标签间距没有印出，不要自行加红框。 */

export type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: ReactNode;
};

export function TextInput({ label, className, id, ...rest }: TextInputProps) {
  const field = <input id={id} className="de-input__control" {...rest} />;
  if (label == null) {
    return (
      <div className={cn("de-input", className)} data-de-part="text-input">
        {field}
      </div>
    );
  }
  return (
    <label className={cn("de-field", className)} data-de-part="text-input">
      <span className="de-field__label">{label}</span>
      <span className="de-input">{field}</span>
    </label>
  );
}
