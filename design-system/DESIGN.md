# DevEco 设计系统

视觉来源是本次 Pixso 预览，不是 `deveco-intui-kit`，也不是 1025 汇报稿。下面凡是写「推断」的，都还没和 Pixso 变量对过。

预览：`design-system/preview/index.html`。

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
| `ohos_id_color_text_primary` | `#E5000000` | `rgb(0 0 0 / 90%)`，按 AARRGGBB |
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

### 名称见过、色值没有逐级印出

`gray-0` … `gray-100` 只确认了名称。foundation 里的色值是从文件管理、备忘录、工具菜单取样的推断阶梯。

`ohos_id_color_dialog_bg` 有三个色值，没有读出，变量保持 `unset`。

`Elevation 55` 和 `Elevation 70` 只见到名称，没有和 `defaultShadowS_PC` 的换算，所以没有阴影公式。

字体家族没有印出。禁止使用 1025 汇报稿的 Helvetica。当前是系统 UI 字体栈。

PC 深色：文件树条目里有「搜索视觉样式 dark」这个名字，暗色色板没有读出。`data-theme="dark"` 在 PC 上整组都是推断。

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
- `gray-*` 的逐级印出色值，`component_regular` 的材质配方
- `padding_level1`、`Body_L`、`font_primary` 的印出数值
- UI 字体家族；vp 与 px 在 Code 设置页是否 1:1
- PC 深色搜索的实际色板
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

编辑器语法色仍是 kit 里的推断，没有当成已确认。字体仍是近似。

## 并排对照

用 SKILL 工作流 A、C 拼出设计稿，再和 Pixso 帧并排。上一轮把对照底改成浅色后，树的灰选中已经对上。这一轮重新取样备忘录「打印」行，当前项从偏深的 `#E2E2E2` 改成 `#F3F3F3`，菜单项高度调到 40px、圆角用印出的 8vp。工具菜单不再套普通菜单的 Body_L，改为帧上的 13px、字重 400。图标字体仍缺，文件窗口没有补未命名图标。

| 页 | 路径 |
| --- | --- |
| 索引 | `design-system/compare/index.html` |
| 文件窗口 | `design-system/compare/file-window.html` |
| 菜单 | `design-system/compare/menu.html` |
| 树 | `design-system/compare/tree.html` |
| 页签 | `design-system/compare/tabs.html` |
| 提示 | `design-system/compare/tooltip.html` |
| 工具菜单 | `design-system/compare/tool-menu.html` |

## 对照结论

对照轮次：先按帧量窗口、菜单、树、页签和工具菜单，改了确认对不上的地方，再在浏览器里核对计算样式。对话框、主色按钮、开关、Logo、TUI、图标字体、字体家族、vp/px、Elevation、`#E5000000` / `#33000000` 的解释没有补色。

| 组件 | 结论 |
| --- | --- |
| Button | 匹配。工具栏浅灰底 `#F0F0F0`（取样，推断）。实心 Search 仍是中性深灰。没有主色 / 危险，待确认。 |
| IconButton | 匹配。纯图标默认无底。图标字体本身仍缺，待确认。 |
| SearchField | 部分匹配。文件管理帧是白底细线，已按此改。备忘录搜索取样是 `#E7E8EA`，两帧不一致，待核对。 |
| TextInput | 与搜索框同一表面。错误态未见，待确认，未做红框。 |
| Menu | 匹配标注：8vp、`defaultShadowS_PC`、双描边、Body_L。当前项按「打印」行重新取样为 `#F3F3F3`。项高 40px 是推断。字重仍按标注 Medium；截图观感偏常规，待核对。 |
| Tooltip | 文案匹配。y10 阴影用在提示上仍是推断，归属待确认。 |
| Tabs | 已改。页签条 `#F1F5F8`，选中页白底，去掉黑下划线。上沿圆角是推断。 |
| Tree | 已改。选中 `#E6E6E6`、悬停 `#ECECEC`，都是取样。之前误用侧栏浅蓝。 |
| Toolbar | 匹配。带字按钮走浅灰底，不再在展开时铺侧栏蓝。 |
| NavList | 匹配。当前项浅蓝 `#E7EFFC`–`#E8EEFA`。去掉了把所有图标染成 `#4890F0`。 |
| Chip | 匹配到「最近」筛选：未选灰底，当前项用侧栏同款浅蓝。胶囊圆角是推断。 |
| Tag | 取样 `#D8B840`，不是印出 token。待核对。 |
| WindowFrame | 标题栏 `#E5E5E5` 匹配。外圆角 16px 按帧上弧度推断。控件顺序改为还原、最小化、关闭。左上色块不是 Logo。 |
| StatusBar | 能对上「共 N 个文件」这行。没有单独色板，12px 是推断。 |
| ToolMenu | 匹配。底 `#2C2C30`，当前项 `#2E436E`。字号改为 13px、字重 400，因为帧上比普通菜单的 Body_L 小。数值是推断。 |
| ToolStripe | 匹配深色条和线框图标。当前项用菜单同款石板蓝。 |
| FileWindow / StudioToolWindow | 只组合以上零件。对话框和编辑器语法色留了缺口卡。 |

## 待确认

1. 文件夹映射：鸿蒙 NewUI 是否应全部算 Studio，而不是 Code。
2. 基础范式 2.0 的划界：文件树算 Code 还是 Studio。
3. vp 与 px。
4. 字体家族。
5. dialog-bg 三个色值。
6. Elevation 55 / 70 与 `defaultShadowS_PC` 是否是同一套高度，只是命名不同。
7. `#E5000000` / `#33000000` 是否一律按 AARRGGBB 解释。
