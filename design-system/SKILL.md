# DevEco 设计系统 Skill（v2 · Pixso 矢量 AST 全量对齐版）

人和 AI 共用同一份规范。构建或重构 DevEco Studio / DevEco Code / 鸿蒙原生 IDE 界面时使用本库。

## 必读顺序

1. 本文件：两套系统归属、组件选型、工作流 A/B/C 与验证闭环。
2. [references/quick-reference.md](references/quick-reference.md)：`data-system`、`data-theme`、全部 `.de-*` class 与核心 Token 速查。
3. [DESIGN.md](DESIGN.md)：从本地 `.pix` 矢量 AST 提取的完整色板、字阶、阴影与组件规格表。
4. [preview/index.html](preview/index.html)：一页总览（两套系统 Token 表、Official Gray 1–14 与代码语法色、双系统实时工作台、21 个组件文档、Pixso 对照、HarmonyIdeWindow 与 StudioToolWindow）。
5. `tokens/foundation.css`、`tokens/semantic.css`、`tokens/components.css`、`tokens/ai.css`。

---

## 一、两套设计系统选择规则（MUST）

写任何页面前，先在根节点声明 `data-system` 与 `data-theme`：

- **`data-system="harmony"`（鸿蒙原生端 · HarmonyOS NEXT HDesign 2.0 体系）**：
  - 来源：`IDE_v1.1.0_PC端组件库.pix`（内部名 `鸿蒙IDE_v1.1.0_PC端组件库.pix`）+ `👉🔥【2.0】基础范式🔥👈.pix` + `【TUI】DevEco Code 基础UI规范.pix`。
  - 特征：16vp 正文字阶，主色 `#0A59F7`（浅）/ `#317AF7`（深），34vp 高 `r=8vp` 按钮（1-主按钮实心蓝、2-次按钮 10% 叠加底配蓝字、3-告警按钮 10% 底配红字），28vp 高 `r=4vp` 输入框/搜索/下拉/树行/菜单项，28vp 高 `r=6vp` 代码页签，16vp 圆角弹窗配 `Elevation 55/70` 阴影，侧栏毛玻璃 `blur(54.37px)`。
- **`data-system="pc-mac"`（PC / Mac 当代桌面端 · IntelliJ NewUI 体系）**：
  - 来源：`【NewUI】鸿蒙IDE-当代.pix` + `icon.pix` + `DevEco Studio（当代）chat.pix` + 只读输入 `deveco-intui-kit/`。
  - 特征：13px 正文字阶，官方 `Light/Dark Gray 1–14` 色阶，主色 `#3574F0`，28px 高（Slim 24px）`r=4px` 按钮与输入框（1px 描边 `#C9CCD6` / `#4E5157`），24px 树行，40px 高底部 3px 蓝条代码页签。支持 `data-theme="light"`、`"dark"`、`"light-contrast"`。

---

## 二、铁律（MUST & MUST NOT）

### MUST
- 引入 `tokens/index.css`，通过 `data-system="harmony"|"pc-mac"` 与 `data-theme="dark"|"light"|"light-contrast"` 驱动全部皮肤切换，禁止在业务页面硬编码颜色或阴影。
- 复用已有组件与 class：
  - 按钮：`.de-button--primary`（主按钮）、`.de-button--secondary`（次按钮）、`.de-button--danger`（告警按钮）、`.de-button--toolbar`、`.de-button--quiet`、`.de-icon-button`
  - 表单与选择：`.de-search`、`.de-input`（含 `data-state="error"` + `.de-error-tip`）、`.de-select`、`.de-spinner`、`.de-checkbox`、`.de-radio`、`.de-switch`、`.de-segmented`
  - 导航与数据：`.de-tabs` / `.de-tab`、`.de-tree` / `.de-tree__row`（含 `.de-tree__badge`）、`.de-nav`、`.de-toolbar`、`.de-stripe`、`.de-chip`、`.de-tag`
  - 浮层与反馈：`.de-dialog`、`.de-notification`、`.de-banner`（`data-tone="info|success|warning|error"`）、`.de-menu`、`.de-tool-menu`、`.de-tooltip`
  - 代码与状态：`.de-code-editor` / `.de-code-line` / `.de-code-alert-card`、`.de-statusbar` / `.de-lsp-pill`、`.de-ai-status`、`.de-ai-msgbar`
- 整窗页面优先从 `patterns/file-window.tsx`（`HarmonyIdeWindow`）或 `patterns/studio-tool-window.tsx`（`StudioToolWindow`）组合开始。

### MUST NOT
- **禁止修改 `deveco-intui-kit/` 目录下的任何文件**。
- **禁止再用鸿蒙系统自带的「文件管理器」「备忘录」「记事本」截图或设计稿目录截图充当 DevEco IDE 组件**。
- 禁止使用 Helvetica；界面字体统一走 `--font-ui`（HarmonyOS Sans SC 栈），代码字体走 `--font-mono`（JetBrains Mono）。
- 禁止把鸿蒙 `#E5000000` / `#E5FFFFFF` / `#33000000`（AARRGGBB）误写成 CSS `#RRGGBBAA`。

---

## 三、工作流与视觉还原度对标闭环（Loop）

### 工作流 A：需求拆解
1. 明确目标平台是 `harmony`（鸿蒙原生 2.0）还是 `pc-mac`（当代桌面 NewUI），以及默认主题（IDE 默认推荐先验证 `dark`，同时兼顾 `light`）。
2. 在 [preview/index.html](preview/index.html) 或 `docs/<组件>.html` 中核对所需组件与状态矩阵（Default / Hover / Active / Focused / Disabled / Error）。

### 工作流 B：既有页面迁移与重构
1. 将外层容器替换为 `.de-window` 并挂载 `data-system` 与 `data-theme`。
2. 移除页面私有的按钮、输入框、弹窗、树、页签 CSS，全部映射到 `.de-*` 标准类名。

### 工作流 C：视觉还原度对照闭环（Verify Loop）
每次新增或修改组件后，必须执行以下闭环：
1. 在 [compare/index.html](compare/index.html) 及各子页（`file-window.html`、`menu.html`、`tree.html`、`tabs.html`、`tooltip.html`、`tool-menu.html`）中将 Pixso 原稿帧与实时 DOM 并排展示。
2. 逐项核对计算样式（Computed Styles）：
   - 尺寸：鸿蒙按钮 `34px`、输入框/搜索/树行/菜单项/页签 `28px`、顶栏 `44px`、底栏 `32px`；PC/Mac 按钮/输入框 `28px`、树行 `24px`、页签 `40px`。
   - 圆角：鸿蒙窗口/弹窗 `16px`、通知 `12px`、按钮/菜单/横幅 `8px`、页签 `6px`、输入框/树行/胶囊 `4px`。
   - 色值与状态：深浅两套主题下对比度达标，无硬编码漏网色值。
