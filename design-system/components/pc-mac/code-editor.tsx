import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";

/**
 * 代码编辑区与 LSP 状态胶囊 (Pixso 7.代码区相关 / 1、风格化token-代码区 / 3.5Lsp进度条 & NewUI Editor)
 */

export type CodeEditorProps = HTMLAttributes<HTMLDivElement> & {
  alertBadge?: ReactNode;
};

export function CodeEditor({ alertBadge, className, children, ...rest }: CodeEditorProps) {
  return (
    <div className={cn("de-code-editor", className)} data-de-part="code-editor" {...rest}>
      {alertBadge != null ? <div className="de-code-alert-card">{alertBadge}</div> : null}
      {children}
    </div>
  );
}

export type CodeLineProps = HTMLAttributes<HTMLDivElement> & {
  lineNumber: number;
  current?: boolean;
};

export function CodeLine({ lineNumber, current = false, className, children, ...rest }: CodeLineProps) {
  return (
    <div className={cn("de-code-line", className)} data-current={current ? "true" : undefined} {...rest}>
      <span className="de-code-gutter">{lineNumber}</span>
      <span className="de-code-content">{children}</span>
    </div>
  );
}

export type LspPillProps = HTMLAttributes<HTMLSpanElement> & {
  count?: number;
};

export function LspPill({ count = 2, className, children = "LSP Service", ...rest }: LspPillProps) {
  return (
    <span className={cn("de-lsp-pill", className)} data-de-part="lsp-pill" {...rest}>
      <span className="de-lsp-pill__dot">{count}</span>
      <span>{children}</span>
    </span>
  );
}
