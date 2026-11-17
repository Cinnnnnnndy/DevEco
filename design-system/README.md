# DevEco 设计系统（Pixso 矢量 AST 全量对齐版）

直接从本地 Pixso 设计稿（`zstd` + `pixso-kw` 矢量节点树，共 13.3 万个节点、5,135 个共享样式）提取构建的双平台前端组件库与 Token 系统。

## 两套设计系统

- **鸿蒙原生端 (`data-system="harmony"`)**：来自 `IDE_v1.1.0_PC端组件库.pix`（内部名 `鸿蒙IDE_v1.1.0_PC端组件库.pix`）、`👉🔥【2.0】基础范式🔥👈.pix`、`DevEco Code -AI IDE.pix`（内部名 `DevEco Studio NEXT-AI IDE.pix`）与 `【TUI】DevEco Code 基础UI规范.pix`。采用 HDesign 2.0 规范（16vp 字阶、#0A59F7/#317AF7 主色、34vp 按钮、28vp 输入/树/页签/菜单、16vp 弹窗圆角、Elevation 55/70 阴影与 54.37px 毛玻璃）。
- **PC / Mac 当代桌面端 (`data-system="pc-mac"`)**：来自 `deveco studio 当代设计稿/当代设计规范/【NewUI】鸿蒙IDE-当代.pix`、`icon.pix`、`DevEco Studio（当代）chat.pix`，并只读吸收 `deveco-intui-kit/`（浅色高对比、AI 智能视觉规范、消息操作栏）。采用 IntelliJ NewUI 体系（13px 字阶、官方 Light/Dark Gray 1–14、#3574F0 主色、28px 按钮/输入框、24px 树行、40px 底部蓝条页签）。

## 快速打开

- **一页总览**：[preview/index.html](preview/index.html)（含两套系统 Token 表、Official Gray 1–14 与代码语法色、双系统实时工作台、21 个组件文档、Pixso 对照、整窗示例）
- **组件文档索引**：[docs/index.html](docs/index.html)（21 个独立组件页）
- **Pixso 设计稿并排对照**：[compare/index.html](compare/index.html)
- **整窗示例**：[examples/file-window.html](examples/file-window.html)（HarmonyIdeWindow）、[examples/studio-tool-window.html](examples/studio-tool-window.html)（StudioToolWindow）

## 接入方式

```html
<link rel="stylesheet" href="design-system/tokens/index.css">
<div data-system="harmony" data-theme="dark">...</div>
<div data-system="pc-mac" data-theme="dark">...</div>
```
