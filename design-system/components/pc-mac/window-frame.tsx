import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";
import { IconClose, IconMinus, IconSquare } from "../icons";

export type WindowFrameProps = HTMLAttributes<HTMLElement> & {
  title: ReactNode;
  mark?: ReactNode;
  controls?: ReactNode;
};

export function WindowFrame({ title, mark, controls, className, children, ...rest }: WindowFrameProps) {
  return (
    <section className={cn("de-window", className)} data-de-part="window" {...rest}>
      <header className="de-titlebar">
        {mark ?? <span className="de-titlebar__mark" aria-hidden="true" />}
        <span className="de-titlebar__title">{title}</span>
        <span className="de-titlebar__spacer" />
        {controls ?? <WindowControls />}
      </header>
      {children}
    </section>
  );
}

export function WindowControls() {
  return (
    <div className="de-window__controls" aria-hidden="true">
      <button type="button" tabIndex={-1}>
        <IconSquare />
      </button>
      <button type="button" tabIndex={-1}>
        <IconMinus />
      </button>
      <button type="button" tabIndex={-1}>
        <IconClose />
      </button>
    </div>
  );
}

export function WindowBody({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("de-window__body", className)} {...rest}>
      {children}
    </div>
  );
}
