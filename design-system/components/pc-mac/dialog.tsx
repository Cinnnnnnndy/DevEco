import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";

/**
 * 反馈组件集 (Pixso 6.1 dailog / 6.3 notification / 6.6 横幅 Banner & NewUI Dialog / Notification / Banner)
 * - Dialog: 鸿蒙端 r=16vp, 底 #F1F3F5 (Light) / #2B2E30 (Dark), 双描边 + Elevation 55 (0 10px 55px)
 *           PC/Mac 端 r=8px, 底 #FFFFFF (Light) / #2B2D30 (Dark), 单描边 #EBECF0 / #43454A
 * - Notification: 344x118 r=12vp 气泡卡片
 * - Banner: 单行 40vp / 多行 60vp, r=8vp, 四态 Info / Success / Warning / Error
 */

export type DialogProps = HTMLAttributes<HTMLDivElement> & {
  title?: ReactNode;
  footer?: ReactNode;
};

export function Dialog({ title, footer, className, children, ...rest }: DialogProps) {
  return (
    <div
      role="dialog"
      aria-modal="false"
      className={cn("de-dialog", className)}
      data-de-part="dialog"
      {...rest}
    >
      {title != null ? (
        <header className="de-dialog__header">
          <h3 className="de-dialog__title">{title}</h3>
        </header>
      ) : null}
      <div className="de-dialog__body">{children}</div>
      {footer != null ? <footer className="de-dialog__footer">{footer}</footer> : null}
    </div>
  );
}

export type NotificationProps = HTMLAttributes<HTMLDivElement> & {
  title: ReactNode;
  actions?: ReactNode;
};

export function Notification({ title, actions, className, children, ...rest }: NotificationProps) {
  return (
    <article className={cn("de-notification", className)} data-de-part="notification" {...rest}>
      <header className="de-notification__header">{title}</header>
      {children != null ? <div className="de-notification__body">{children}</div> : null}
      {actions != null ? <footer className="de-notification__actions">{actions}</footer> : null}
    </article>
  );
}

export type BannerTone = "info" | "success" | "warning" | "error";

export type BannerProps = HTMLAttributes<HTMLDivElement> & {
  tone?: BannerTone;
  actions?: ReactNode;
};

export function Banner({ tone = "info", actions, className, children, ...rest }: BannerProps) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("de-banner", className)}
      data-tone={tone}
      data-de-part="banner"
      {...rest}
    >
      <span>{children}</span>
      {actions != null ? <span className="de-row">{actions}</span> : null}
    </div>
  );
}
