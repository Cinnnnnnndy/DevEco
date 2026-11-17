import {
  IconBookmark,
  IconBug,
  IconCommit,
  IconFile,
  IconHammer,
  IconPlay,
  IconSearch,
  IconTerminal,
} from "../components/icons";
import { Button } from "../components/pc-mac/button";
import { Dialog } from "../components/pc-mac/dialog";
import { IconButton } from "../components/pc-mac/icon-button";
import { SearchField } from "../components/pc-mac/search-field";
import { SelectField } from "../components/pc-mac/selection";
import { ToolMenu, ToolMenuItem } from "../components/harmony/tool-menu";
import { ToolStripe } from "../components/harmony/tool-stripe";

/**
 * 当代桌面端 Studio 工具窗口与设置弹窗 (对应 【NewUI】鸿蒙IDE-当代.pix + icon.pix)
 */
export function StudioToolWindow() {
  return (
    <div data-system="pc-mac" data-theme="dark" className="de-window de-studio">
      <ToolStripe>
        <IconButton label="构建" icon={<IconHammer />} />
        <IconButton label="运行" icon={<IconPlay />} pressed />
        <IconButton label="调试" icon={<IconBug />} />
        <IconButton label="终端" icon={<IconTerminal />} />
      </ToolStripe>
      <div className="de-pad" style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", gap: 20 }}>
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

        <Dialog
          title="Customize Main Toolbar"
          footer={
            <>
              <Button variant="secondary">Cancel</Button>
              <Button variant="primary">OK</Button>
            </>
          }
        >
          <SearchField placeholder="Search actions..." />
          <SelectField label="Icon" defaultValue="default">
            <option value="default">Default icon (OpenRemoteDevelopment)</option>
            <option value="custom">Custom SVG / PNG...</option>
          </SelectField>
        </Dialog>
      </div>
    </div>
  );
}
