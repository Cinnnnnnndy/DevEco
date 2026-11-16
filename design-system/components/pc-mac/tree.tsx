import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";
import { IconChevron, IconFile, IconFolder, IconMore } from "../icons";

export type TreeProps = HTMLAttributes<HTMLUListElement>;

export function Tree({ className, children, ...rest }: TreeProps) {
  return (
    <ul className={cn("de-tree", className)} data-de-part="tree" {...rest}>
      {children}
    </ul>
  );
}

export type TreeItemProps = {
  label: ReactNode;
  icon?: ReactNode;
  count?: ReactNode;
  selected?: boolean;
  defaultOpen?: boolean;
  moreLabel?: string;
  onMore?: () => void;
  children?: ReactNode;
};

export function TreeItem({
  label,
  icon,
  count,
  selected,
  defaultOpen,
  moreLabel = "更多",
  onMore,
  children,
}: TreeItemProps) {
  const row = (
    <>
      <span className={cn("de-tree__chevron", !children && "de-tree__chevron--leaf")}>
        <IconChevron />
      </span>
      <span className="de-icon">{icon ?? (children ? <IconFolder /> : <IconFile />)}</span>
      <span className="de-tree__name">{label}</span>
      {count != null ? <span className="de-tree__count">{count}</span> : null}
      {onMore ? (
        <button type="button" className="de-tree__more" aria-label={moreLabel} onClick={onMore}>
          <IconMore />
        </button>
      ) : null}
    </>
  );

  if (!children) {
    return (
      <li className="de-tree__node">
        <div className="de-tree__row" role="treeitem" data-selected={selected ? "true" : undefined} aria-current={selected ? "true" : undefined}>
          {row}
        </div>
      </li>
    );
  }

  return (
    <li className="de-tree__node">
      <details className="de-tree__node" open={defaultOpen}>
        <summary className="de-tree__row" data-selected={selected ? "true" : undefined}>
          {row}
        </summary>
        <ul className="de-tree__children">{children}</ul>
      </details>
    </li>
  );
}
