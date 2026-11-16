# DevEco 设计系统

视觉来源是本次 Pixso 预览，不是 `deveco-intui-kit`，也不是 1025 汇报稿。下面凡是写「推断」的，都还没和 Pixso 变量对过。

总览（一页含 token、组件文档、Pixso 对照、FileWindow、StudioToolWindow）：`design-system/preview/index.html`。`docs/`、`compare/`、`examples/` 仍是深链。启动页只留一张卡片指向这一页。

## 两套系统（工作假设，未最终确认）

| 系统 | `data-system` | 预览里实际用来做组件的帧 | 不纳入的内容 |
| --- | --- | --- | --- |
| PC / Mac | `pc-mac` | 基础范式 2.0 里的鸿蒙电脑文件管理、备忘录、文本编辑器、文件树、普通菜单标注 | 墙纸、应用图标、访谈照片、Fleet / MarsCode |
| 鸿蒙端 | `harmony` | NewUI / icon 里的 Studio 工具菜单和图标条 | 设计工具自己的检查器、Controls IntelliJ 这个名字 |

基础范式 2.0 混有五层：HarmonyOS PC 窗口、DevEco Studio、DevEco Code、TUI、竞品图。本库只做了能对上产品界面或印出标注的那部分。竞品图只作划界，没有变成 token。

文件夹还有一处可能要矫正：鸿蒙 / Studio 材料曾打进名为 DevEco Code Win/Mac 低保真的包。所以「文件树算 Code，工具菜单算 Studio」仍是假设。

## Token

三层：

- `tokens/foundation.css`：印出的原始值和灰阶名称
- `tokens/semantic.css`：两套系统、浅色 / 深色
- `tokens/components.css`：组件用到的表面、菜单、树、窗口

换主题只改变量。组件不读死颜色。

### 预览图印出、已经落地

| 名称 | 预览写法 | CSS |
| --- | --- | --- |
| `ohos_id_text_size_body1` | 16vp | `--ohos-id-text-size-body1` |
| `ohos_id_color_text_primary` | `#E5000000` | `rgb(0 0 0 / 90%)`。AARRGGBB 已确认 |
| `corner_radius_level4` | 8vp | `--corner-radius-level4` |
| `defaultShadowS_PC` | x0, y0, 16vp, `#33000000` | `0 0 16px rgb(0 0 0 / 20%)`，用在普通菜单 |
| 未具名阴影 | x0, y10, 16vp, `#000000` 20% | `--shadow-unspecified-y10`，暂用于提示等浮层 |
| 双描边 Light | 内描边 1px `#FFFFFF` 20%，外描边 1px `#000000` 10% | 菜单 |
| 双描边 Dark | 内描边 1px `#FFFFFF` 20%，外描边 1px `#000000` 40% | 深色菜单 |
| `component_regular` | 名称，写的是「叠灰阶」 | 表面变量，具体材质配方未见 |
| `font_primary` | 名称 | 推断为与 `text_primary` 同一角色 |
| `Body_L` (Medium) | 名称 | 推断为 16vp、字重 500 |
| `padding_level1` | 名称 | 推断为 4px，用作菜单项间距 |

规范页用 vp，Code 设置页用 px。预览按 1vp = 1px。

### 官方色阶、阴影和字体（名称已确认，精确色板仍在提取）

官方灰阶是 **Light Gray 1–14** 与 **Dark Gray 1–14**，不是 `gray-0` … `gray-100`。`gray-0` … `gray-100` 只是预览里见过的临时名称。foundation 里的十六进制仍是从文件管理、备忘录、工具菜单取样的阶梯，临时保留。不要用臆造的 Gray 1–14 色值替换它们。

NewUI 里已经读到的角色：

| 官方名 | 角色 |
| --- | --- |
| Light Gray 1 | 主要文字 |
| Light Gray 6 | 描边 |
| Light Gray 7 | 次要文字 |
| Light Gray 8 | 禁用文字与占位 |
| Light Gray 11 | 非活动选区 |
| Light Gray 12 | 填充 |
| Light Gray 13 | 次级背景 / 工具窗口 |
| Light Gray 14 | 白 = 主背景 |
| Dark Gray 1 | 主要 = 主编辑器背景 |
| Dark Gray 2 | 次级背景、工具窗口、对话框、工具提示 |
| Dark Gray 3 | 线条与分隔、树悬停 |
| Dark Gray 7 | 次要文字与图标 |
| Dark Gray 8 | 较浅背景上的文字 |
| Dark Gray 9 | 当前行号 |
| Dark Gray 12 | 主要文字 |
| Dark Gray 14 | 白 |

PC 深色：NewUI 含完整的 Dark Gray 1–14。色阶存在。精确色块仍待从源文件提取，所以 `data-theme="dark"` 上现在的十六进制仍是取样，不是官方 Gray 色值。

官方阴影名：`defaultShadowXS`、`defaultShadowS`、`defaultShadowM`、`defaultShadowL`、`FloatShadowS`、`FloatShadowM`。已印出并在用的只有 `defaultShadowS_PC`。其余不写公式。

源文件里出现、且 AARRGGBB 解释已确认：`#E5000000` → `rgb(0 0 0 / 90%)`，`#E5FFFFFF` → `rgb(255 255 255 / 90%)`，`#33000000` → `rgb(0 0 0 / 20%)`。`#E5FFFFFF` 只记录解释，不新造角色变量。

源文件里的字体样式名：`Font/Body_L/Medium`、`Font/Body_M/Medium`、`Font/Body_M/Regular`、`Light/font_primary`、`font_emphasize`、`font_on_primary`、`font_secondary`、`font_tertiary`。已确认字号只有 `ohos_id_text_size_body1` = 16vp。其余字号不补。

字体家族是 HarmonyOS Sans SC，来自 Pixso 源文件。`--font-ui` 为 `"HarmonyOS Sans SC 2025", "HarmonyOS Sans SC 2024", "HarmonyOS Sans SC", "HarmonyOS Sans", "HarmonyHeiTi", "PingFang SC", sans-serif`。PingFang SC 只作回退。禁止 Helvetica，也禁止 Inter。

字体和 token 的源文件（版式和目视仍以 Pixso 预览为准）：`👉🔥【2.0】基础范式🔥👈.pix`、`IDE_v1.1.0_PC端组件库.pix`、`【NewUI】鸿蒙IDE-当代.pix`、`icon.pix`、`【TUI】DevEco Code 基础UI规范.pix`。

`ohos_id_color_dialog_bg` 有三个色值，没有读出，变量保持 `unset`。

`Elevation 55` 和 `Elevation 70` 只见到名称，没有和 `defaultShadowS_PC` 的换算，所以没有阴影公式。

### 从预览取样、角色是推断

| 用途 | 取样 | 来自 |
| --- | --- | --- |
| 选中导航 | `#E7EFFC` | 文件管理侧栏 |
| 标题栏 | `#E5E5E5` | 文件管理 |
| 导航图标 | `#4890F0` | 文件管理侧栏饱和色 |
| 备忘录标签 | `#D8B840` | 备忘录 |
| 文件夹黄 | `#F0C050` | 文件管理 |
| 工具菜单底 | `#2C2C30` | Studio 工具菜单 |
| 工具菜单选中 | `#2C406C` | 同一菜单第一项 |
| 工具菜单字 | `#DCDCE0` | 同一菜单 |

## 组件

安装方式都一样：复制对应 tsx，页面引入 `tokens/index.css`，祖先节点设置 `data-system` 和 `data-theme`。下面的 class 与 React 组件是同一套。

### Button

`components/pc-mac/button.tsx`

用法：工具栏上的「新建 / 查看 / 预览」，以及文件树角落的实心 Search。

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| variant | `toolbar` \| `quiet` \| `solid` | `toolbar` | 没有 primary、danger |
| size | `s` \| `m` | `m` | 高 24 / 32 |
| icon | ReactNode | — | 可选图标 |
| …button | button 属性 | — | `type` 默认 `button` |

### IconButton

`components/pc-mac/icon-button.tsx`

| Prop | 类型 | 说明 |
| --- | --- | --- |
| label | string | 必填，作为 `aria-label` |
| icon | ReactNode | 必填 |
| size | `s` \| `m` | 默认 `m` |
| pressed | boolean | 图标条当前项 |

### SearchField

`components/pc-mac/search-field.tsx`

占位文案按稿为「搜索...」。`label` 默认「搜索」。其余属性传给 `<input type="search">`。

### TextInput

`components/pc-mac/text-input.tsx`

和搜索框同一表面。可选 `label`。错误、禁用说明、必填没有印出，不要加红框。

### Menu / MenuItem / MenuSeparator

`components/pc-mac/menu.tsx`

普通菜单。children 组合，不强制数据数组。

MenuItem：`icon`、`shortcut`、`current`，其余是 button 属性。

### Tooltip

`components/pc-mac/tooltip.tsx`

`content` 是说明文字。文件管理里见过「显示或隐藏预览窗格。」

### Tabs / Tab

`components/pc-mac/tabs.tsx`

文本编辑器页签。Tab：`selected`、`onClose`、`closeLabel`。

### Tree / TreeItem

`components/pc-mac/tree.tsx`

文件夹可展开（`<details>`），文件是一行。TreeItem：`label`、`icon`、`count`、`selected`、`defaultOpen`、`onMore`、`children`。

### Toolbar

`components/pc-mac/toolbar.tsx`

`Toolbar`、`ToolbarSeparator`、`ToolbarSpacer`。`label` 写入 `aria-label`。

### NavList / NavItem / NavLabel

`components/pc-mac/nav-list.tsx`

文件管理侧栏。NavItem：`icon`、`current`。

### Chip

`components/pc-mac/chip.tsx`

最近文件的筛选胶囊。`pressed` 对应 `aria-pressed`。

### Tag

`components/pc-mac/tag.tsx`

备忘录色块。颜色是取样，不是印出 token。

### WindowFrame / StatusBar

窗口标题栏和底栏。标题栏按钮是装饰，`tabIndex={-1}`，避免假装能最小化。

### ToolMenu / ToolStripe

`components/harmony/tool-menu.tsx`、`tool-stripe.tsx`

Studio 工具菜单：图标 + 文案 + 快捷键，选中为石板蓝。不要把 IntelliJ 套件名写进 props。

## Patterns

业务页不要自己重做窗口、工具栏和菜单。

- `patterns/file-window.tsx`：鸿蒙电脑文件管理
- `patterns/studio-tool-window.tsx`：图标条 + 工具菜单

## 复用了哪些组件

预览页用了：Button、SearchField、Chip、Tag、Menu、Tooltip、Tabs、Tree、NavList、WindowFrame、StatusBar、Toolbar、ToolMenu、ToolStripe。

## 稿上有、系统尚未覆盖

- 对话框，以及 `ohos_id_color_dialog_bg` 的三个色值
- Elevation 55 / 70
- Light / Dark Gray 1–14 的精确色块。`gray-*` 取样阶梯是临时的，`component_regular` 的材质配方也未见
- `padding_level1`、`Body_L` 以外的字号、`font_primary` 的印出数值
- vp 与 px 在 Code 设置页是否 1:1
- PC 深色的精确色块（Dark Gray 1–14 的色阶已经在 NewUI，数值还在提取）
- 未具名 y10 阴影属于哪一个组件
- 主色按钮、危险按钮、开关、表单校验
- Logo 矢量与锁版色值
- TUI 控件尺寸（总览缩略图看得到，单帧读不出）
- PC 端组件库 pix 的单帧大多是图标、墙纸和封面，不是控件标注
- 图标字体。预览是截图，本库只有一组功能用的线框图标
- 输入框的禁用、只读、错误；选择器的完整状态矩阵
- 设计工具属性面板里的树节点变体（Chevron、Hint、Checkbox）没有单独的渲染帧

## intui-kit 输入

PC / Mac 只读 `deveco-intui-kit/`，不改它。和 Pixso 冲突的地方保持预览：菜单当前项灰、树选中灰、侧栏浅蓝、工具栏浅灰、页签白底。kit 的列表选中蓝 `#D4E2FF` 和主蓝 `#3574F0` 不覆盖这些。

收进来、并标明来自 intui-kit 的：

- `data-theme="light-contrast"`：浅色高对比。侧栏选中用 kit 的 Blue11 `#D4E2FF`。树和菜单仍是 Pixso 的灰。
- `AiStatus`、`tokens/ai.css`：智能色、星芒、状态胶囊。Pixso 没有这套色。
- `MessageBar`：消息下的复制 / 重新回答 / 时间。成功绿来自 kit。

编辑器语法色仍是 kit 里的推断，没有当成已确认。界面字体用 HarmonyOS Sans SC，PingFang SC 只作回退。

## 并排对照

用 SKILL 工作流 A、C 拼出设计稿，再和 Pixso 帧并排。尺寸按帧上的像素量，不沿用上一轮的 40px 项高。备忘录菜单按 1x（圆角约 8px = `corner_radius_level4`）。文件树汉字墨高约 28px，相对备忘录的 18px，按 1.56 折回 CSS。图标字体仍缺；工具菜单和文件树上的线框是从帧采样的简化图形，标了「采样」，不是一套新图标字体。文件窗口工具栏仍只保留稿上能读出的文字按钮。

| 页 | 路径 |
| --- | --- |
| 总览里的对照 | `design-system/preview/index.html#compare` |
| 索引（深链） | `design-system/compare/index.html` |
| 文件窗口 | `design-system/compare/file-window.html` |
| 菜单 | `design-system/compare/menu.html` |
| 树 | `design-system/compare/tree.html` |
| 页签 | `design-system/compare/tabs.html` |
| 提示 | `design-system/compare/tooltip.html` |
| 工具菜单 | `design-system/compare/tool-menu.html` |

### 帧上量到的数

备忘录菜单 `notes-menu.jpg` 当 1x：圆角直线段约 8px，对上 `corner_radius_level4`。汉字墨高约 18px，对上 Body_L 16。

| 量 | 旧 CSS | 帧 | 新 CSS |
| --- | --- | --- | --- |
| 菜单外宽 × 高 | 拉满对照列，项高 40 | 卡片 x60–354、y67–292，约 295×226 | 宽 295，高随内容 |
| 当前项 | 满宽、min-height 40、圆角 8 | 高 48（y184–231），左右内缩约 6，填色 243 `#F3F3F3` | 高 48，菜单 padding 6，圆角 8 |
| 行距 | 项间距 4 | 文字中心距约 56，减去 48 得间隙约 8 | gap 8 |
| 字到高亮左缘 | 水平 padding 8 | 字墨 x81，高亮 x66，约 15 | 项 padding-inline 16 |
| 禁用字 | `text-tertiary` 约 40% 黑 | 最深墨约 208 `#D0D0D0` | `#D0D0D0` |
| 阴影 | `var(--shadow-float)`，目前等于 `defaultShadowS_PC` | 标注 `defaultShadowS_PC` | 直接用 `var(--default-shadow-s-pc)` |

工具菜单 `tool-menu.jpg` 与备忘录同一量级：汉字墨高约 15px，对应 13px。

| 量 | 旧 CSS | 帧 | 新 CSS |
| --- | --- | --- | --- |
| 菜单宽 | 280，且在浅色主题里 | 约 x18–415，宽约 397 | 400。对照页包在 `harmony` / `dark` |
| 选中条 | 高 32，圆角 8，易贴边 | y14–43 高约 30，左缘 x30，圆角约 4，`#2E436E` | 高 30，菜单 padding 10，圆角 4 |
| 行距 | 随 32 高的项叠上 | 文字中心距约 32 | gap 2 |
| 图标 / 快捷键 | 无图标；快捷键走 `--text-tertiary`，浅色主题会淡进深底 | 每行有前导图标；⌘0–⌘5 在 x372–395 右对齐 | 采样 SVG，快捷键右对齐，颜色写死为浅灰 / 近白 |
| 条目 | 常缺 API 两项，或另写「快速开始 / TODO」 | 提交、Bookmarks、查找、运行、调试、API Change Assistant、API参考。无分隔线 | 只保留这七项 |

文件树 `tree.jpg` 汉字墨高约 28px，按 28/18 ≈ 1.56 折回 1x。

| 量 | 旧 CSS | 帧（折算后） | 新 CSS |
| --- | --- | --- | --- |
| 行高 | 32 | 选中条约 78px → 50 | 50 |
| 缩进 | 16 | 三角间距约 61px → 40 | 40 |
| 行左内边距 | 8 | 条左缘到三角约 45px → 29 | 28 |
| 选中色 | `#E6E6E6` | Search 条 238 `#EEEEEE`，文件条 230 `#E6E6E6` | `data-selected="soft"` / `true` |
| 图标 | 叶子藏一个 › | 实心三角 + 文件夹 / 文件 | 采样线框 |

页签 `tabs.jpg`：标题带与页签条都约 32px 高，条的中位色 `#F0F4F5`，选中页是白底，没有下划线。提示帧没有气泡，只量到「预览」按钮。文件窗口标题带按页签帧的 32px 对齐后，侧栏仍约 196，搜索框约 240。

## 对照结论

对照轮次：先按帧量窗口、菜单、树、页签和工具菜单，改了确认对不上的地方，再在浏览器里核对计算样式。对话框、主色按钮、开关、Logo、TUI、图标字体、vp/px、Elevation 没有补色。字体家族已确认为 HarmonyOS Sans SC。`#E5000000`、`#E5FFFFFF`、`#33000000` 按 AARRGGBB 的解释已经确认。

| 组件 | 结论 |
| --- | --- |
| Button | 匹配。工具栏浅灰底 `#F0F0F0`（取样，推断）。实心 Search 仍是中性深灰。没有主色 / 危险，待确认。 |
| IconButton | 匹配。纯图标默认无底。图标字体本身仍缺，待确认。 |
| SearchField | 部分匹配。文件管理帧是白底细线，已按此改。备忘录搜索取样是 `#E7E8EA`，两帧不一致，待核对。 |
| TextInput | 与搜索框同一表面。错误态未见，待确认，未做红框。 |
| Menu | 按 notes-menu.jpg：宽 295、项高 48、行距 8、内边距 6、字内边距 16、圆角 8vp、阴影直接用 `defaultShadowS_PC`。当前项 `#F3F3F3`。禁用「锁定图文布局」取样 `#D0D0D0`。卡片是白，不用 `component_regular` 的 gray-10。字重仍按标注 Medium。 |
| Tooltip | tooltip.jpg 只有「预览」按钮，没有气泡。气泡尺寸不新造；文案仍是「显示或隐藏预览窗格。」对照页把气泡常开。 |
| Tabs | tabs.jpg 页签条约 32px 高，中位色 `#F0F4F5`，选中页白底，无下划线。 |
| Tree | 按 tree.jpg 折算：行高 50、缩进 40、行左内边距 28。Search 条 `#EEEEEE`，文件条 `#E6E6E6`。三角、文件夹、文件图标是采样线框。 |
| Toolbar | 匹配。带字按钮走浅灰底，不再在展开时铺侧栏蓝。 |
| NavList | 匹配。当前项浅蓝 `#E7EFFC`–`#E8EEFA`。去掉了把所有图标染成 `#4890F0`。 |
| Chip | 匹配到「最近」筛选：未选灰底，当前项用侧栏同款浅蓝。胶囊圆角是推断。 |
| Tag | 取样 `#D8B840`，不是印出 token。待核对。 |
| WindowFrame | 标题栏高改成 32，对齐 tabs.jpg 标题带，也和 file-window.jpg 标题带按同一比例折算一致。侧栏宽仍是 196。外圆角 16px 仍是推断。 |
| StatusBar | 高 24。能对上「共 N 个文件」这行。没有单独色板。 |
| ToolMenu | 按 tool-menu.jpg：宽 400、项高 30、菜单内边距 10、选中条圆角约 4、底 `#2C2C30`、当前项 `#2E436E`。字 13px / 400。条目到 API参考 为止，含采样图标和右对齐快捷键。不写帧外的「快速开始 / TODO」。 |
| ToolStripe | 匹配深色条和线框图标。当前项用菜单同款石板蓝。 |
| FileWindow / StudioToolWindow | 只组合以上零件。对话框和编辑器语法色留了缺口卡。 |

## 已确认

- 字体家族：HarmonyOS Sans SC。PingFang SC 只作回退。禁止 Helvetica 与 Inter。
- `#E5000000`、`#E5FFFFFF`、`#33000000` 按 AARRGGBB。分别是 `rgb(0 0 0 / 90%)`、`rgb(255 255 255 / 90%)`、`rgb(0 0 0 / 20%)`。
- `ohos_id_text_size_body1` = 16vp。
- PC 深色：NewUI 有完整 Dark Gray 1–14。精确色块仍待提取。

## 待确认

1. 文件夹映射：鸿蒙 NewUI 是否应全部算 Studio，而不是 Code。
2. 基础范式 2.0 的划界：文件树算 Code 还是 Studio。
3. vp 与 px。
4. dialog-bg 三个色值。
5. Elevation 55 / 70 与 `defaultShadowS_PC` 是否是同一套高度，只是命名不同。
6. Light / Dark Gray 1–14 的精确色块，以及除 `defaultShadowS_PC` 以外的官方阴影公式。
