# DevEco 设计系统（v2 · Pixso 矢量 AST 全量对齐版）

本系统直接从本地 Pixso 源文件（`zstd` 压缩的 `pixso-kw` 二进制矢量节点树，共 133,622 个节点、5,135 个共享样式）提取构建。

> **关键纠偏说明**：
> 第一版因未解压 `inner.pix`（`zstd + Kiwi`），只读取了外层 ZIP 中的 `.png` 贴图附件，误将 `基础范式2.0.pix` 飞机稿里的鸿蒙系统自带「文件管理器」「备忘录」「文本编辑器」截图以及「设计稿目录树截图（`1.搜索视觉样式dark`）」当成了 DevEco IDE 组件，且将 `pc-mac` 与 `harmony` 两套系统的文件夹映射颠倒。
> 本版（v2）已通过解析 `pixso.binary` Schema 与 `inner.pix` 矢量 AST，将两套系统彻底归位并补齐全部真实 Token 与 IDE 核心组件。

总览入口：[preview/index.html](preview/index.html)。

---

## 一、两套设计系统归属（已核实 `.pix` 内部原始文件名与 AST）

| 系统 | `data-system` | 本地 Pixso 源文件（含内部原始名） | 规模 | 适用场景与视觉特征 |
| --- | --- | --- | --- | --- |
| **鸿蒙原生端（HarmonyOS NEXT 2.0）** | `harmony` | • `Deveco Code 设计稿-高保真设计/1基础范式及组件库/IDE_v1.1.0_PC端组件库.pix`（内部原名：`鸿蒙IDE_v1.1.0_PC端组件库.pix`）<br>• `👉🔥【2.0】基础范式🔥👈.pix`<br>• `DevEco Code -AI IDE.pix`（内部原名：`DevEco Studio NEXT-AI IDE.pix`）<br>• `【TUI】DevEco Code 基础UI规范.pix` | 101,399 节点<br>4,098 样式 | 鸿蒙电脑原生 IDE（HDesign 5.0/6.0 PC 规范）：<br>• 正文 `16vp`（补充 `14vp`、说明 `12vp`、标题 `20vp/24vp`）<br>• 品牌蓝：浅色 `#0A59F7`（悬停 `#236AF8`）、深色 `#317AF7`（悬停 `#2C6EDE`、文字高亮 `#5291FF`）<br>• 按钮高 `34vp` `r=8vp`（次按钮为 10% 叠加底配蓝字，告警按钮为 10% 底配红字 `#E84026`/`#D94838`）<br>• 输入框/搜索/下拉/树行/页签/菜单项高 `28vp`<br>• 弹窗 `r=16vp` + 双描边 + `Elevation 55/70` + 侧栏毛玻璃 `blur(54.37px)` |
| **PC / Mac 当代桌面端（Win/Mac）** | `pc-mac` | • `deveco studio 当代设计稿/当代设计规范/【NewUI】鸿蒙IDE-当代.pix`<br>• `icon.pix`<br>• `DevEco Studio（当代）chat.pix`<br>• 只读输入：`deveco-intui-kit/`（不修改原目录） | 52,223 节点<br>1,037 样式 | 当代桌面端 DevEco Studio（IntelliJ NewUI 体系）：<br>• 正文 `13px/16px`（小字 `12px/16px`，代码 `13px/22px`）<br>• 官方色阶 `Light Gray 1–14` 与 `Dark Gray 1–14`<br>• 主色 `#3574F0`，列表选中 `#D4E2FF`/`#CFDEFC`（浅）、`#2E436E`（深）<br>• 按钮/输入框高 `28px`（Slim `24px`）`r=4px`，树行高 `24px`，编辑器页签高 `40px`（底部 `3px` 激活蓝条） |

---

## 二、Token 体系（三层变量）

- [tokens/foundation.css](tokens/foundation.css)：从 `.pix` AST 提取的原始色阶（`Light/Dark Gray 1–14`、`--hm-*`、`--ohos-*`、`--ed-*` 代码语法色、圆角与海拔阴影公式）
- [tokens/semantic.css](tokens/semantic.css)：`[data-system="harmony" | "pc-mac"]` × `[data-theme="light" | "dark" | "light-contrast"]` 语义映射
- [tokens/components.css](tokens/components.css)：`.de-*` 组件样式（零硬编码颜色）
- [tokens/ai.css](tokens/ai.css)：从 `deveco-intui-kit/` 吸收的 AI 智能色、星芒与消息操作栏样式

### 1. 鸿蒙原生端（`harmony`）核心实测 Token

| 样式 / 变量名 | 浅色 (Light) | 深色 (Dark) | 来源（`pc_lib.raw` & `base20.raw`） |
| --- | --- | --- | --- |
| `ohos_id_text_size_body1` | `16vp` (16px) | `16vp` (16px) | 印出 + `文字样式/16px(正文)` |
| `ohos_id_color_text_primary` | `rgb(0 0 0 / 90%)` (`#E5000000`) | `rgb(255 255 255 / 90%)` (`#E5FFFFFF`) | 二级 60%、三级 40%、四级置灰 20% |
| `ohos_id_color_dialog_bg` | `#FFFFFF` (弹窗面板 `#F0F2F4`) | `#202224` / `#3C3C3C` (弹窗面板 `#2B2E30`) | `d82f0c5a...png` 印出三色块 + `4.0面板背景/弹窗` |
| `4.0面板背景 / 非代码区` | `#F1F3F5` | `#202224` | IDE 工具窗口、顶栏、底栏 |
| `1.6面板 / 代码区背景` | `#FFFFFF` | `#131416` (TUI `#1A1B1D`) | 代码编辑器主画布 |
| `1.6面板 / 左侧毛玻璃` | `rgb(241 243 245 / 81%)` | `rgb(26 26 26 / 81%)` | 配 `BACKGROUND_BLUR r=54.37px` |
| `1.2主按钮 & 组件填充` | `#0A59F7` (悬停 `#236AF8`) | `#317AF7` (悬停 `#2C6EDE`, 链接字 `#5291FF`) | 选中叠加统一为 `40%` 透明度 |
| `component_regular` 叠灰阶 | `5%` 输入框 / `10%` 次按钮与悬停 / `15%` 输入悬停 / `20%` 次按钮悬停 | 同左（浅色叠 `#000`，深色叠 `#FFF`） | `1.1叠加背景色` & `1.2组件及按钮背景色` |
| `Error (告警/报错)` | 字 `#E84026` · 描边 `#CF3922` · 底 `#FBE0DC` | 字 `#D94838` · 底 `#4E3231` | `4.1按钮(3-告警)` / `4.6报错tips` / `6.5横幅/报错` |
| `Warning (警告)` | 字 `#DB8400` · 底 `#F4E2C8` | 字 `#E08C3A` · 底 `#4F4132` | `2.0文案及图标色/Warning` & `6.6横幅/Warn` |
| `Success (成功)` | 字 `#37992E` · 描边 `#64BB5C` · 底 `#D3E7D1` | 字 `#5BA854` · 底 `#354637` | `2.0文案及图标色/Success` & `6.6横幅/Success` |
| `defaultShadowS_PC` | `0 0 16px rgb(0 0 0 / 20%)` | `0 0 16px rgb(0 0 0 / 20%)` | 普通菜单与下拉面板 |
| `Elevation 55` (`FloatShadowS`) | `0 10px 55px rgb(0 0 30 / 25%)` | `0 10px 55px rgb(0 0 0 / 30%)` | `13aea9f0...png` 印出 + `FloatShadowS：弹窗失焦` |
| `Elevation 70` (`FloatShadowM`) | `0 10px 70px rgb(0 0 30 / 45%)` | `0 10px 70px rgb(0 0 0 / 50%)` | `13aea9f0...png` 印出弹窗聚焦阴影 |

### 2. PC / Mac 当代桌面端（`pc-mac`）官方色阶与代码语法色

- **Light Gray 1–14**：`#000000`、`#27282E`、`#383A42`、`#494B57`、`#5A5D6B`、`#6C707E`、`#818594`、`#A8ADBD`、`#C9CCD6`、`#D3D5DB`、`#DFE1E5`、`#EBECF0`、`#F7F8FA`、`#FFFFFF`
- **Dark Gray 1–14**：`#1E1F22`、`#2B2D30`、`#383A42`、`#43454A`、`#4E5157`、`#5A5D63`、`#6F737A`、`#868A91`、`#9DA0A8`、`#B4B8BF`、`#CED0D6`、`#DFE1E5`、`#F0F1F2`、`#FFFFFF`
- **主色与状态色**：`Blue 4/6 Primary #3574F0`、浅色选中 `Blue 11 #D4E2FF`（Tree `#CFDEFC`）、深色选中 `Blue 2 #2E436E`、危险 `Red 4 #DB3B4B` / `Dark Red 6 #DB5C5C`、成功 `#208A3C` / `#57965C`、警告 `#FFAF0F` / `#F2C55C`
- **Editor 语法高亮（`Editor/Light/*` & `Editor/Dark/*`）**：
  - Light：Default `#080808`、Keyword `#0033B3`、Method `#00627A`、Constant `#871094`、Number `#1750EB`、String `#067D17`、Comment `#8C8C8C`、Metadata `#9E880D`
  - Dark：Default `#BDC0C9`、Keyword `#D69A6B`、Method `#70AEFF`、Constant `#CF84CF`、Number `#51C0CF`、String `#6AAB73`、Comment `#6E798A`、Doc comment `#648769`、Metadata `#B8B167`

---

## 三、组件清单（21 个组件文档页 + 2 个整窗 Pattern）

| 组件 | 源码路径 | 鸿蒙原生端 (`harmony`) 规格 | PC / Mac 端 (`pc-mac`) 规格 |
| --- | --- | --- | --- |
| `Button` | `components/pc-mac/button.tsx` | 高 `34vp`（S `28vp`）`r=8vp`：`primary` `#0A59F7`/`#317AF7`、`secondary` 10% 底配蓝字、`danger` 10% 底配红字、`toolbar` | 高 `28px`（S `24px`）`r=4px`：`primary` `#3574F0`、`secondary` 1px 描边、`danger` `#DB3B4B`/`#DB5C5C` |
| `IconButton` | `components/pc-mac/icon-button.tsx` | M `32×32` `r=6vp`（侧边栏），S `24×24` `r=4vp`（图标组），激活 `40%` 品牌蓝 | M `32×32` `r=6px`，S `24×24` `r=4px` |
| `SearchField` | `components/pc-mac/search-field.tsx` | `28vp` 高 `r=4vp`，默认 `5%` 叠加底，悬停 `15%`，激活 `1px #0A59F7`/`#317AF7` | `28px` 高 `r=4px`，`1px` 描边 `#C9CCD6`/`#4E5157` |
| `TextInput` | `components/pc-mac/text-input.tsx` | `28vp` 高 `r=4vp`，支持报错态 `1px #CF3922`/`#D94838` + `4.6报错tips` (`#FBE0DC`/`#4E3231`) | `28px` 高 `r=4px`，支持 `state="error"` 校验反馈 |
| `Selection` (`SelectField` / `Checkbox` / `Radio` / `Switch` / `SegmentedControl` / `SpinnerField`) | `components/pc-mac/selection.tsx` | 下拉 `28vp` `r=4vp`；复选/单选 `20×20`；Switch `28×18` `r=25`（滑块 `14×14`）；分段控制器 `28vp` `r=6vp` | 下拉 `28px` `r=4px`；复选/单选 `16×16`；Toggle Switch |
| `Dialog` / `Notification` / `Banner` | `components/pc-mac/dialog.tsx` | Dialog `402px/510px` `r=16vp` + 双描边 + `Elevation 55`；Notification `344×118` `r=12vp`；Banner `40vp` `r=8vp` 四色 | Dialog `r=8px` + `0 12px 40px` 阴影；Notification 卡片；Banner 横幅 |
| `Menu` | `components/pc-mac/menu.tsx` | 面板 `r=8vp` + 双描边 + `defaultShadowS_PC`，项高 `28vp` `r=4vp`，选中 `40%` 品牌蓝 | 面板 `r=8px` 单描边，项高 `26px`，选中 `#D4E2FF`/`#2E436E` |
| `Tooltip` | `components/pc-mac/tooltip.tsx` | 高 `28vp` `r=4vp`，浅色 `#FFFFFF` / 深色 `#4D4D4D` + 双描边 + `y10` 阴影 | 高 `28px` `r=4px`，浅色 `#27282E` / 深色 `#383A42` |
| `Tabs` | `components/pc-mac/tabs.tsx` | 代码页签高 `28vp` `r=6vp`，选中 `10%` 叠加底，悬停 `15%` | 编辑器页签高 `40px`，底部 `3px` `#3574F0` 蓝条 |
| `CodeEditor` / `LspPill` | `components/pc-mac/code-editor.tsx` | 深色 `#131416` / 浅色 `#FFFFFF`，行号排水沟 + 右上角 `告警卡片icon` + 底部 `3.5 LSP进度条` | 深色 `#1E1F22` / 浅色 `#FFFFFF` + 官方 `Editor/*` 语法色 |
| `Tree` | `components/pc-mac/tree.tsx` | 行高 `28vp` `r=4vp`，箭头/图标 `20×20`，支持彩色文件徽标与行尾描述 | 行高 `24px` `r=4px`，选中 `#CFDEFC`/`#2E436E` |
| `Toolbar` / `WindowFrame` / `StatusBar` | `components/pc-mac/` | 窗口 `r=16vp`，顶栏 `44vp`，工具栏 `40vp`，底栏 `32vp` | 窗口 `r=8px`，顶栏 `40px`，工具栏 `40px`，底栏 `24px` |
| `Chip` / `Tag` | `components/pc-mac/` | `4.7筛选标签` 高 `28vp` `r=4vp`（`5%` 底 / `40%` 蓝选中）；`4.11标签` `15%` 底 | Chip 高 `28px` `r=8px` 描边胶囊；Tag `#EBECF0`/`#383A42` |
| `AiStatus` / `MessageBar` | `components/pc-mac/` | 继承 `deveco-intui-kit` 智能色与消息操作栏 | 同左 |
| `ToolMenu` / `ToolStripe` | `components/harmony/` | 侧边条宽 `44vp`（按钮 `32×32` `r=6vp`） | 侧边条宽 `40px`，工具菜单宽 `280px` |

---

## 四、并排对照页（`compare/`）

- [compare/index.html](compare/index.html)：对照总索引
- [compare/file-window.html](compare/file-window.html)：鸿蒙原生 IDE 主工作台整窗对照（`08387c18...png` 1728×1152）
- [compare/menu.html](compare/menu.html)：Customize Main Toolbar 弹层菜单与鸿蒙 `6.4/6.5 Menu` 对照
- [compare/tree.html](compare/tree.html)：鸿蒙 IDE `My Application` Project 工程树对照
- [compare/tabs.html](compare/tabs.html)：代码编辑器页签（`BadgeCardComponent.cpp / EntryAbility.ets`）与语法高亮对照
- [compare/tooltip.html](compare/tooltip.html)：`Preferences` 弹窗、主/次/告警按钮、`4.6报错tips` 与 Tooltip 对照
- [compare/tool-menu.html](compare/tool-menu.html)：Studio 工具菜单对照
