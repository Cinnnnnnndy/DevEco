# 速查表（Quick Reference）

主题与系统直接声明在祖先容器的 HTML 属性上，无需额外包裹 JS Provider：

```html
<!-- PC / Mac 当代桌面端（支持 light | dark | light-contrast） -->
<div data-system="pc-mac" data-theme="dark">...</div>

<!-- 鸿蒙原生端 HarmonyOS NEXT HDesign 2.0（支持 light | dark） -->
<div data-system="harmony" data-theme="dark">...</div>
```

样式唯一入口：`design-system/tokens/index.css`（自动按顺序引入 `foundation.css` → `semantic.css` → `components.css`）。

---

## 1. 整窗骨架选择

| 目标场景 | 推荐 Pattern / 外壳 | 禁止事项 |
| --- | --- | --- |
| **鸿蒙原生 IDE 整窗**（DevEco Code / DevEco Studio NEXT） | `patterns/file-window.tsx`（`HarmonyIdeWindow` / `FileWindow`）或 [examples/file-window.html](file:///Users/cindy/Desktop/01_DevEco/DevEco-ds/design-system/examples/file-window.html) | 禁止使用操作系统的文件管理器/备忘录外壳；禁止混用 PC/Mac 的 40px 侧边图标条 |
| **PC / Mac 当代 IDE 工具窗口**（IntelliJ NewUI 风格） | `patterns/studio-tool-window.tsx`（`StudioToolWindow`）或 [examples/studio-tool-window.html](file:///Users/cindy/Desktop/01_DevEco/DevEco-ds/design-system/examples/studio-tool-window.html) | 禁止使用 Pixso 设计工具自身的属性检查器颜色 |

---

## 2. 21 个核心组件 CSS Class 速查

| 组件 | 核心 Class | 常用状态属性 / 修饰符 |
| --- | --- | --- |
| **WindowFrame** | `.de-window`, `.de-window__body`, `.de-sidebar`, `.de-main` | `data-system="harmony" \| "pc-mac"` |
| **Titlebar** | `.de-titlebar`, `.de-titlebar__group`, `.de-titlebar__title`, `.de-window-controls` | `harmony` 下高 `56px`；`pc-mac` 下高 `38px` |
| **Toolbar & Run Widget** | `.de-toolbar`, `.de-toolbar__divider` | 内含 `.de-select`、`.de-icon-button` |
| **Button** | `.de-button` | `--primary` / `--secondary` / `--danger` / `--toolbar` / `--quiet` / `--solid`；尺寸 `--sm` (24px) / `--lg` (32px) |
| **IconButton** | `.de-icon-button` | `--lg` (`32×32px`, 圆角 `6px`)；激活态 `[aria-pressed="true"]` |
| **SearchField** | `.de-search`, `.de-search__input`, `.de-search__count`, `.de-search__toggles` | 错误态 `[data-invalid="true"]` |
| **TextInput & ErrorTip** | `.de-input-wrap`, `.de-input`, `.de-error-tip` | 错误态 `.de-input[data-invalid="true"]` + 下方挂载 `.de-error-tip`（`4.6报错tips`） |
| **Select & Segmented & Spinner** | `.de-select`, `.de-segmented`, `.de-spinner` | `.de-segmented__item[aria-selected="true"]` |
| **Checkbox / Radio / Switch** | `.de-check`, `.de-checkbox`, `.de-radio`, `.de-switch` | `[data-checked="true"]`、`[data-indeterminate="true"]`、`[aria-checked="true"]` |
| **Tabs** | `.de-tabs`, `.de-tab`, `.de-tab__button`, `.de-tab__dot`, `.de-tab__close` | `.de-tab[data-selected="true"]`、`[data-dirty="true"]` |
| **Tree** | `.de-tree`, `.de-tree__row`, `.de-tree__chev`, `.de-tree__badge` | `.de-tree__row[data-selected="true"]`；紧凑模式 `.de-tree--compact` (`24px` 行高) |
| **NavList** | `.de-nav`, `.de-nav__item`, `.de-nav__heading` | `.de-nav__item[aria-current="page"]` |
| **Menu** | `.de-menu`, `.de-menu__item`, `.de-menu__sep`, `.de-menu__shortcut` | `.de-menu__item[aria-current="true"]`、`--danger` |
| **ToolMenu & ToolStripe** | `.de-menu.de-tool-menu`, `.de-stripe`, `.de-stripe__group`, `.de-stripe__sep` | `.de-stripe .de-icon-button[aria-pressed="true"]` |
| **Dialog** | `.de-dialog`, `.de-dialog__header`, `.de-dialog__body`, `.de-dialog__footer` | 底部按钮组右对齐，间距 `12px` |
| **Notification & Banner** | `.de-notification`, `.de-banner` | `.de-banner--warning`、`.de-banner--error` |
| **Tooltip & GotIt** | `.de-tooltip`, `.de-code-alert-card` | 代码行内异常卡 `.de-code-alert-card` |
| **Chip & Tag** | `.de-chip-row`, `.de-chip`, `.de-tag` | `.de-chip[aria-pressed="true"]`；`.de-tag--brand` / `--success` / `--warning` / `--danger` |
| **CodeEditor** | `.de-code-editor`, `.de-code-line`, `.de-code-gutter`, `.de-code-content` | 语法高亮 `.syn-kw` / `.syn-fn` / `.syn-ty` / `.syn-st` / `.syn-nu` / `.syn-cm` / `.syn-an` |
| **StatusBar & LSP Pill** | `.de-statusbar`, `.de-statusbar__group`, `.de-lsp-pill`, `.de-lsp-pill__dot` | 底部状态栏高 `24px`，右侧放置 `.de-lsp-pill` |
| **AI & MessageBar** | `.de-ai-badge`, `.de-msg-bar` | 仅在 `pc-mac` 下复刻 `deveco-intui-kit` 智能规范 |
