import type { HTMLAttributes } from "react";
import { cn } from "../cn";
import { Menu } from "../pc-mac/menu";

/** Studio 工具菜单。对外不用 IntelliJ / Int UI 命名。
 *  选中行是预览里取样的石板蓝，不是设计工具自己的亮蓝。 */

export type ToolMenuProps = HTMLAttributes<HTMLUListElement>;

export function ToolMenu({ className, children, ...rest }: ToolMenuProps) {
  return (
    <Menu className={cn("de-tool-menu", className)} data-de-part="tool-menu" {...rest}>
      {children}
    </Menu>
  );
}

export { MenuItem as ToolMenuItem, MenuSeparator as ToolMenuSeparator } from "../pc-mac/menu";
