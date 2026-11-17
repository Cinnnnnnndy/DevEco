import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { cn } from "../cn";

/**
 * 选择与表单控件集 (Pixso 4.5下拉选择 / 4.8微调器 / 4.9选择项 / Switch / 页签选择器 & NewUI Toggle/Checkbox/Radio/Segmented)
 */

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: ReactNode;
};

export function Checkbox({ label, className, disabled, ...rest }: CheckboxProps) {
  return (
    <label className={cn("de-choice", className)} data-disabled={disabled ? "true" : undefined}>
      <input type="checkbox" className="de-checkbox" disabled={disabled} {...rest} />
      {label != null ? <span>{label}</span> : null}
    </label>
  );
}

export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: ReactNode;
};

export function Radio({ label, className, disabled, ...rest }: RadioProps) {
  return (
    <label className={cn("de-choice", className)} data-disabled={disabled ? "true" : undefined}>
      <input type="radio" className="de-radio" disabled={disabled} {...rest} />
      {label != null ? <span>{label}</span> : null}
    </label>
  );
}

export type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: ReactNode;
};

export function Switch({ label, className, disabled, ...rest }: SwitchProps) {
  return (
    <label className={cn("de-choice", className)} data-disabled={disabled ? "true" : undefined}>
      <input type="checkbox" role="switch" className="de-switch" disabled={disabled} {...rest} />
      {label != null ? <span>{label}</span> : null}
    </label>
  );
}

export type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: ReactNode;
};

export function SelectField({ label, className, disabled, children, ...rest }: SelectFieldProps) {
  const control = (
    <span className={cn("de-select", label == null ? className : undefined)} data-disabled={disabled ? "true" : undefined}>
      <select disabled={disabled} {...rest}>
        {children}
      </select>
    </span>
  );
  if (label == null) return control;
  return (
    <label className={cn("de-field", className)}>
      <span className="de-field__label">{label}</span>
      {control}
    </label>
  );
}

export type SegmentedOption = {
  value: string;
  label: ReactNode;
};

export type SegmentedControlProps = {
  options: SegmentedOption[];
  value: string;
  onChange?: (value: string) => void;
  className?: string;
};

export function SegmentedControl({ options, value, onChange, className }: SegmentedControlProps) {
  return (
    <div role="tablist" className={cn("de-segmented", className)} data-de-part="segmented">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            className="de-segmented__item"
            onClick={() => onChange?.(opt.value)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export type SpinnerFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  onStep?: (delta: number) => void;
};

export function SpinnerField({ onStep, className, ...rest }: SpinnerFieldProps) {
  return (
    <span className={cn("de-spinner", className)} data-de-part="spinner">
      <input type="text" {...rest} />
      <button type="button" aria-label="减少" onClick={() => onStep?.(-1)}>
        –
      </button>
      <button type="button" aria-label="增加" onClick={() => onStep?.(1)}>
        +
      </button>
    </span>
  );
}
