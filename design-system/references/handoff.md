# 交接与使用说明（Handoff）

把这套设计系统交给同事或 AI Agent 时，请交付完整的 `design-system/` 目录。

## 1. 目录结构与核心产物

- [SKILL.md](file:///Users/cindy/Desktop/01_DevEco/DevEco-ds/design-system/SKILL.md)：AI Agent 必读的系统选择、Token 约束与组件拼装工作流。
- [DESIGN.md](file:///Users/cindy/Desktop/01_DevEco/DevEco-ds/design-system/DESIGN.md)：完整的设计系统全景报告（含 Pixso 矢量源码映射表、色板、字阶、21 个组件规格与还原度核对结论）。
- [llms.txt](file:///Users/cindy/Desktop/01_DevEco/DevEco-ds/design-system/llms.txt) & [registry.json](file:///Users/cindy/Desktop/01_DevEco/DevEco-ds/design-system/registry.json)：供 AI 检索的机器可读组件注册表。
- `tokens/`：三层 CSS 变量与样式（[foundation.css](file:///Users/cindy/Desktop/01_DevEco/DevEco-ds/design-system/tokens/foundation.css) → [semantic.css](file:///Users/cindy/Desktop/01_DevEco/DevEco-ds/design-system/tokens/semantic.css) → [components.css](file:///Users/cindy/Desktop/01_DevEco/DevEco-ds/design-system/tokens/components.css)）。
- `components/` & `patterns/`：无外部运行时依赖的 React / TSX 组件源码与整窗模式（`HarmonyIdeWindow` / `StudioToolWindow`）。
- [preview/index.html](file:///Users/cindy/Desktop/01_DevEco/DevEco-ds/design-system/preview/index.html)：一站式总览页（含双系统 Token 展示、21 个组件可交互画布、Pixso 原稿并排对照、以及两套完整 IDE 窗口）。
- [docs/index.html](file:///Users/cindy/Desktop/01_DevEco/DevEco-ds/design-system/docs/index.html)：21 个独立组件的详细规格文档页（支持实时切换 `harmony` / `pc-mac` 与 `light` / `dark` / `light-contrast`）。
- [compare/index.html](file:///Users/cindy/Desktop/01_DevEco/DevEco-ds/design-system/compare/index.html)：6 组核心场景的 Pixso 原稿帧与 HTML 实测渲染并排对照页。
- [examples/file-window.html](file:///Users/cindy/Desktop/01_DevEco/DevEco-ds/design-system/examples/file-window.html) & [examples/studio-tool-window.html](file:///Users/cindy/Desktop/01_DevEco/DevEco-ds/design-system/examples/studio-tool-window.html)：可独立打开并切换主题的鸿蒙原生 IDE 整窗与 PC/Mac 当代工具窗口示例。

## 2. 核心守则

1. **零构建直接预览**：所有 HTML 页面均为原生静态页面，浏览器直接打开 `design-system/preview/index.html` 即可查看全部内容。
2. **严禁修改 `deveco-intui-kit/`**：仓库根目录下的 `deveco-intui-kit/` 保持 100% 原样只读。
3. **禁止硬编码色值**：所有组件与业务 Demo 统一通过 `--surface-*`、`--text-*`、`--control-*`、`--menu-*`、`--editor-*` 等语义 Token 取色，确保在双系统 5 套主题下自动适配。
