# Preview Gate 与验证门禁

本规范用于约束 AI 与工程师在使用 `design-system/` 构建页面时的还原度门禁。

## 1. 已全部解码并确认的规范（可直接调用，无需挂起）

通过对全部 7 个 `.pix` 压缩包内 `inner.pix` 矢量 AST 的完整解析，原先在 v1 中标记为「缺口」的以下规范**均已 100% 解码并落入 Token 与组件库**：

- **完整灰阶**：`Light Gray 1–14`（`#000000` → `#FFFFFF`）与 `Dark Gray 1–14`（`#1E1F22` → `#FFFFFF`），详见 [foundation.css](file:///Users/cindy/Desktop/01_DevEco/DevEco-ds/design-system/tokens/foundation.css)。
- **对话框背景色**：`ohos_id_color_dialog_bg` 浅色 `#FFFFFF`、鸿蒙深色 `#202224`、PC/Mac 深色 `#2B2D30`（及经典 `#3C3C3C`）。
- **按钮全变体**：`primary`（主按钮）、`secondary`（次要描边按钮）、`danger`（危险实心按钮）、`toolbar`（工具栏按钮）、`quiet`（轻量按钮）、`solid`（高强调胶囊按钮）。
- **表单与选择器全集**：`TextInput` + `4.6报错tips`（浅色 `#FFF2F3` / `#FAD4D8`，深色 `#402929` / `#5E3838`）、`SelectField`、`SpinnerField`、`SegmentedControl`、`Checkbox`、`Radio`、`Switch`（`32×16px` 胶囊轨道）。
- **弹窗与通知反馈**：`Dialog`（`400px` 模态框）、`Notification`（`360px` 右下角通知卡）、`Banner`（页面顶部横幅）。
- **代码编辑器与语法色**：`Editor/Light/*` 与 `Editor/Dark/*` 完整 ArkTS 语法高亮色板、行号槽、当前行高亮、折叠箭头、以及鸿蒙原生行内异常驻留卡（`.de-code-alert-card`）。
- **官方阴影公式**：
  - `defaultShadowS_PC`：`0 0 16px rgb(0 0 0 / 20%)`
  - `Elevation 55 (Light)`：`0 1px 6px rgba(102, 104, 110, 0.14), 0 2px 16px rgba(102, 104, 110, 0.10)`
  - `Elevation 70 (Light)`：`0 2px 8px rgba(102, 104, 110, 0.12), 0 8px 24px rgba(102, 104, 110, 0.14)`
  - `Elevation 70 (Dark)`：`0 2px 8px rgba(0, 0, 0, 0.36), 0 8px 24px rgba(0, 0, 0, 0.48)`

---

## 2. 什么时候必须触发 Preview Gate（暂停并标注 `.de-gap`）

仅当遇到以下情况时，才使用 `.de-gap` 占位并向用户确认：

1. **跨系统混用冲突**：需求没有指明目标页面属于 `data-system="pc-mac"`（跨平台当代桌面版）还是 `data-system="harmony"`（鸿蒙原生版），且两者布局存在显著差异时。
2. **超出 21 个核心组件的全新定制复合控件**：例如火焰图（FlameGraph）、3D 硬件拓扑画布、可视化布局画布等尚未收入通用基础组件库的专有业务画布。
3. **品牌 Logo 矢量锁版**：`【LOGO】DevEco Studio.pix` 中包含位图锁版，若需定制新版 SVG 徽标锁版需单独确认。

---

## 3. 来源标注规则

- 来自 Pixso `.pix` 矢量 AST 的 Token 与组件：直接作为默认标准使用。
- 来自 `deveco-intui-kit/` 补充的 PC/Mac 专属能力（`data-theme="light-contrast"` 浅色高对比度主题、`AiStatus` 智能渐变视觉规范、`MessageBar` 消息操作栏）：仅在 `data-system="pc-mac"` 下启用，文档中标明「来自 `deveco-intui-kit` 输入」。
