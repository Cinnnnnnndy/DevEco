# Pixso 矢量源码与预览帧溯源

本设计系统的所有 Token、组件几何尺寸与界面模式均直接提取自本地 Pixso 设计稿压缩包内的 **`inner.pix`（Zstandard 压缩的 `pixso-kw` Kiwi 二进制矢量 AST）**，并结合对应画布的高清预览帧完成 1:1 视觉核对。

## 1. 矢量 AST 源码包（Primary Source of Truth）

| 系统归属 | Pixso 源文件 | 内部原始文件名 | 矢量节点数 | 内部样式数 | 核心提取内容 |
| --- | --- | --- | --- | --- | --- |
| `harmony`（鸿蒙原生端） | `Deveco Code 设计稿-高保真设计/1基础范式及组件库/IDE_v1.1.0_PC端组件库.pix` | `鸿蒙IDE_v1.1.0_PC端组件库.pix` | 15,141 | 878 | HDesign 2.0 鸿蒙 PC 组件库（2,168 个组件变体 Symbol）：Titlebar、Project Tree、Code Tabs、Code Editor、Dialog（`#202224`）、Notification、Select、Button、Status Bar（LSP 胶囊） |
| `harmony`（鸿蒙原生端） | `Deveco Code 设计稿-高保真设计/1基础范式及组件库/👉🔥【2.0】基础范式🔥👈.pix` | `👉🔥【2.0】基础范式🔥👈.pix` | 81,752 | 3,123 | 鸿蒙原生 IDE 工作台全景范式：代码编辑区、底部构建/终端面板、右侧 AI Assistant 面板、`ohos_id_*` 系统级变量、悬浮菜单双描边与毛玻璃 |
| `harmony`（鸿蒙原生端） | `Deveco Code 设计稿-高保真设计/DevEco Code -AI IDE.pix` | `DevEco Studio NEXT-AI IDE.pix` | — | — | AI 辅助开发面板、行内异常驻留卡、智能生成差异审阅 |
| `harmony` / `pc-mac` | `deveco studio 当代设计稿/当代设计规范/【TUI】DevEco Code 基础UI规范.pix` | `【TUI】DevEco Code 基础UI规范.pix` | 4,506 | — | 终端 CLI / TUI ANSI 16 色与字符网格 |
| `pc-mac`（PC/Mac 当代） | `deveco studio 当代设计稿/当代设计规范/【NewUI】鸿蒙IDE-当代.pix` | `【NewUI】鸿蒙IDE-当代.pix` | 20,210 | 777 | 39 个组件规范画布：`Light Gray 1–14`、`Dark Gray 1–14`、Primary / Secondary / Danger Button、TextInput + `4.6报错tips`、Select、SegmentedControl、Spinner、Checkbox / Radio / Switch、Tree、Tabs、Menu、Dialog、Banner、Elevation 55/70、`Editor/*` 语法色 |
| `pc-mac`（PC/Mac 当代） | `deveco studio 当代设计稿/当代设计规范/icon.pix` | `icon.pix` | 32,013 | — | `16×16`、`14×14`、`12×12` 线框图标与 40px 工具栏条（Tool Stripe） |
| `pc-mac`（PC/Mac 当代） | `deveco studio 当代设计稿/DevEco Studio（当代）chat.pix` | `DevEco Studio（当代）chat.pix` | — | — | 当代 IDE 右侧 CodeGenie / Chat 面板与消息操作栏 |

---

## 2. 并排对照页（`compare/`）采用的 Pixso 原稿帧

| 对照页 | 帧文件与來源 | 对应组件与验证指标 |
| --- | --- | --- |
| `compare/file-window.html` | `08387c18e1f58f24395702daed997a5e8ab816d5.png`（深色整窗）<br>`bb275046ca7eb166a64c806c8e0f2005ec3f8bb4.png`（浅色整窗） | **鸿蒙原生 IDE 整窗 (`HarmonyIdeWindow`)**：`56px` 标题栏、`#202224` / `#F1F3F5` 工程侧栏、`36px` 页签栏（`#317AF7` / `#0A59F7` 指示线）、`#131416` / `#FFFFFF` 编辑器、底部终端与状态栏 `LSP` 胶囊 |
| `compare/menu.html` | `facf790b2a96ef9b7df3ff7c24667281e803ac96.png`（基础范式 IDE 悬浮菜单） | **鸿蒙原生悬浮菜单 (`Menu`)**：`8px` 外圆角、`4px` 内边距、`28px` 行高、`4px` 选中圆角、`defaultShadowS_PC` 阴影与内外双描边 |
| `compare/tree.html` | `9f4f773d9818f966cf02a0d3861e527496973871.png`（NewUI 工程目录树） | **工程文件树 (`Tree`)**：`24px` (Compact) / `28px` (Default) 行高、`16px` 缩进、选中态 `#D4E2FF` / `#263B66`（PC/Mac）与 `rgba(10,89,247,0.10)` / `rgba(49,122,247,0.20)`（Harmony） |
| `compare/tabs.html` | `13aea9f0d884220a0d6a782dcbf5155da21b91e6.png`（基础范式编辑器页签栏） | **编辑器页签 (`Tabs`)**：`36px` 高度、`14px` HarmonyOS Sans SC、选中态底部 `2px` 品牌蓝指示条、脏文件圆点与 `16×16` 关闭按钮 |
| `compare/tooltip.html` | `d82f0c5a5cc6f1ca0d1d050f950f4ebbaac506dd.png`（代码悬停提示与异常驻留卡） | **提示气泡与行内异常驻留卡 (`Tooltip` & `CodeAlertCard`)**：Tooltip（`#383A42` / `#F7F8FA`）、报错 Bubble（`#FFF2F3` 描边 `#FAD4D8`）、编辑器异常卡（`#4E3231` / `#FBE0DC`） |
| `compare/tool-menu.html` | `f185b9f1…` / `f0fa386b…`（`icon.pix` Studio 工具菜单与侧边工具条） | **Studio 工具菜单与工具栏条 (`ToolMenu` & `ToolStripe`)**：`40px` 宽侧边工具条、`32×32` 图标按钮（`6px` 圆角，激活态 `#D4E2FF` / `#35538F`）、`250px` 宽工具菜单 |

---

## 3. 已排除的非 DevEco 控件帧（不再混入组件库）

| 排除帧 | 排除原因 |
| --- | --- |
| 基础范式 `5a9ccf6c…`、`088f7555…`、`fab6e678…`、`b4ceb645…` | 鸿蒙 OS 系统自带的「文件管理器」「备忘录」「文本编辑器」参考截图，属于操作系统级应用参考而非 DevEco IDE 界面，已在 v2 中全部从 `compare/frames/` 与 `examples/` 移除 |
| 基础范式 `2895d432…` | JetBrains Fleet 竞品参考截图 |
| 基础范式 `16175e7c…`、`7762ab51…` | 用户访谈照片 |
| NewUI `601ef849…`、`797fe108…`、`25b80b2a…` | Pixso / Figma 设计工具自身的属性检查器与阴影编辑器界面 |
