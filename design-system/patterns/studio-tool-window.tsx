import { IconBookmark, IconBug, IconCommit, IconFile, IconHammer, IconPlay, IconSearch, IconTerminal } from "../components/icons";
import { IconButton } from "../components/pc-mac/icon-button";
import { ToolMenu, ToolMenuItem } from "../components/harmony/tool-menu";
import { ToolStripe } from "../components/harmony/tool-stripe";

/** Studio 工具条 + 工具菜单。条目来自预览里的菜单，名字按稿保留。 */

export function StudioToolWindow() {
  return (
    <div data-system="harmony" data-theme="dark" className="de-window de-studio">
      <ToolStripe>
        <IconButton label="构建" icon={<IconHammer />} />
        <IconButton label="运行" icon={<IconPlay />} pressed />
        <IconButton label="调试" icon={<IconBug />} />
        <IconButton label="终端" icon={<IconTerminal />} />
      </ToolStripe>
      <div className="de-pad">
        <ToolMenu>
          <ToolMenuItem icon={<IconCommit />} shortcut="⌘0" current>
            提交
          </ToolMenuItem>
          <ToolMenuItem icon={<IconBookmark />} shortcut="⌘2">
            Bookmarks
          </ToolMenuItem>
          <ToolMenuItem icon={<IconSearch />} shortcut="⌘3">
            查找
          </ToolMenuItem>
          <ToolMenuItem icon={<IconPlay />} shortcut="⌘4">
            运行
          </ToolMenuItem>
          <ToolMenuItem icon={<IconBug />} shortcut="⌘5">
            调试
          </ToolMenuItem>
          <ToolMenuItem icon={<IconSearch />}>API Change Assistant</ToolMenuItem>
          <ToolMenuItem icon={<IconFile />}>API参考</ToolMenuItem>
        </ToolMenu>
      </div>
    </div>
  );
}
