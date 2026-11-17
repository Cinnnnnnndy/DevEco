import type { ReactNode } from "react";
import { IconBug, IconFolder, IconHammer, IconPlay, IconSearch } from "../components/icons";
import { IconButton } from "../components/pc-mac/icon-button";
import { CodeEditor, CodeLine, LspPill } from "../components/pc-mac/code-editor";
import { StatusBar } from "../components/pc-mac/status-bar";
import { Tab, Tabs } from "../components/pc-mac/tabs";
import { ToolStripe } from "../components/harmony/tool-stripe";
import { Tree, TreeItem } from "../components/pc-mac/tree";
import { WindowBody, WindowFrame } from "../components/pc-mac/window-frame";

export type FileWindowProps = {
  title?: string;
  theme?: "dark" | "light";
  children?: ReactNode;
};

/**
 * 鸿蒙原生端 IDE 主工作台 (对应 👉🔥【2.0】基础范式🔥👈.pix 与 鸿蒙IDE_v1.1.0_PC端组件库.pix 2.布局组件)
 * 保留 FileWindow 导出名以兼容既有路由与调用方，同时导出 HarmonyIdeWindow。
 */
export function FileWindow({ title = "Healthy_life — EntryAbility.ets", theme = "dark", children }: FileWindowProps) {
  return (
    <WindowFrame title={title} data-system="harmony" data-theme={theme}>
      <WindowBody>
        <ToolStripe>
          <IconButton label="Project" icon={<IconFolder />} pressed />
          <IconButton label="Search" icon={<IconSearch />} />
          <IconButton label="Build" icon={<IconHammer />} />
          <IconButton label="Run" icon={<IconPlay />} />
          <IconButton label="Debug" icon={<IconBug />} />
        </ToolStripe>
        <aside className="de-nav" aria-label="Project">
          <div className="de-toolbar" style={{ padding: "0 8px", minHeight: 36, background: "transparent" }}>
            <span className="de-toolbar__title">Project</span>
          </div>
          <Tree>
            <TreeItem label="MyApplication" defaultOpen>
              <TreeItem label="cloudbuild" defaultOpen>
                <TreeItem label="003级文本" defaultOpen>
                  <TreeItem label="004级文本" />
                  <TreeItem label="build.yml" />
                  <TreeItem label="build_config.json" />
                </TreeItem>
              </TreeItem>
              <TreeItem label="AppScope" defaultOpen>
                <TreeItem label="resources" defaultOpen>
                  <TreeItem label="string.json" />
                </TreeItem>
              </TreeItem>
              <TreeItem label="module1" defaultOpen>
                <TreeItem label="EntryAbility.ets" selected />
                <TreeItem label="BadgeCardComponent.cpp" />
              </TreeItem>
            </Tree>
          </Tree>
        </aside>
        <div className="de-main">
          <Tabs>
            <Tab selected onClose={() => {}}>
              EntryAbility.ets
            </Tab>
            <Tab onClose={() => {}}>BadgeCardComponent.cpp</Tab>
            <Tab onClose={() => {}}>index.ets</Tab>
          </Tabs>
          {children ?? (
            <CodeEditor alertBadge={<span>✓ 0 告警</span>}>
              <CodeLine lineNumber={1}>
                <span className="kw">import</span> UIAbility <span className="kw">from</span>{" "}
                <span className="str">&apos;@ohos.app.ability.UIAbility&apos;</span>;
              </CodeLine>
              <CodeLine lineNumber={2} current>
                <span className="kw">export default class</span> <span className="fn">EntryAbility</span>{" "}
                <span className="kw">extends</span> UIAbility &#123;
              </CodeLine>
              <CodeLine lineNumber={3}>
                {"  "}
                <span className="kw">private static</span> <span className="ct">TAG</span>: string ={" "}
                <span className="str">&apos;EntryAbility&apos;</span>;
              </CodeLine>
              <CodeLine lineNumber={4}>
                {"  "}
                <span className="kw">async</span> <span className="fn">onCreate</span>(want: Want) &#123;
              </CodeLine>
              <CodeLine lineNumber={5}>
                {"    "}Logger.<span className="fn">info</span>(
                <span className="str">&apos;RdbHelper createTable dayInfo success&apos;</span>);
              </CodeLine>
              <CodeLine lineNumber={6}>{"  }"}</CodeLine>
              <CodeLine lineNumber={7}>&#125;</CodeLine>
            </CodeEditor>
          )}
          <StatusBar>
            <span className="de-crumb">
              Healthy_life › entry › src › main › ets › <strong>EntryAbility.ets</strong>
            </span>
            <span className="de-statusbar__group">
              <LspPill count={2}>LSP Service</LspPill>
              <span>134/2,275</span>
              <span>UTF-8</span>
              <span>ArkTS</span>
            </span>
          </StatusBar>
        </div>
      </WindowBody>
    </WindowFrame>
  );
}

export const HarmonyIdeWindow = FileWindow;
