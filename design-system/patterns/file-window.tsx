import type { ReactNode } from "react";
import { Chip } from "../components/pc-mac/chip";
import { IconButton } from "../components/pc-mac/icon-button";
import { IconFolder, IconHome, IconMore, IconPlus, IconPreview } from "../components/icons";
import { NavItem, NavLabel, NavList } from "../components/pc-mac/nav-list";
import { SearchField } from "../components/pc-mac/search-field";
import { StatusBar } from "../components/pc-mac/status-bar";
import { Toolbar, ToolbarSeparator, ToolbarSpacer } from "../components/pc-mac/toolbar";
import { Button } from "../components/pc-mac/button";
import { Tooltip } from "../components/pc-mac/tooltip";
import { WindowBody, WindowFrame } from "../components/pc-mac/window-frame";

export type FileWindowProps = {
  title?: string;
  children?: ReactNode;
};

/** 鸿蒙电脑文件管理窗口。外壳是 pattern，页内不要再造工具栏按钮。 */

export function FileWindow({ title = "主页", children }: FileWindowProps) {
  return (
    <WindowFrame title={title} data-system="pc-mac" data-theme="light">
      <Toolbar label="文件管理">
        <Button icon={<IconPlus />}>新建</Button>
        <ToolbarSeparator />
        <Button>
          查看
        </Button>
        <IconButton label="更多" icon={<IconMore />} />
        <ToolbarSpacer />
        <Tooltip content="显示或隐藏预览窗格。">
          <Button icon={<IconPreview />}>预览</Button>
        </Tooltip>
      </Toolbar>
      <div className="de-toolbar">
        <span className="de-crumb">
          <IconHome /> <strong>主页</strong>
        </span>
        <ToolbarSpacer />
        <SearchField />
      </div>
      <WindowBody>
        <NavList>
          <NavItem icon={<IconHome />} current>
            主页
          </NavItem>
          <NavLabel>快速访问</NavLabel>
          <NavItem icon={<IconFolder />}>桌面</NavItem>
          <NavItem icon={<IconFolder />}>文档</NavItem>
          <NavItem icon={<IconFolder />}>下载</NavItem>
        </NavList>
        <div className="de-main">
          <div className="de-pad">
            <div className="de-section-label">快速访问</div>
            <div className="de-chip-row">
              <Chip pressed>全部</Chip>
              <Chip>图片</Chip>
              <Chip>视频</Chip>
              <Chip>文档</Chip>
              <Chip>音频</Chip>
            </div>
          </div>
          <div className="de-grow">{children ?? <div className="de-empty">在打开或创建某些文件后，将会在此处显示最近文件</div>}</div>
          <StatusBar>
            <span>共 0 个文件</span>
          </StatusBar>
        </div>
      </WindowBody>
    </WindowFrame>
  );
}
