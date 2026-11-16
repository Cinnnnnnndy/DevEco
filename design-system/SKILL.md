# DevEco 设计系统 Skill

人和 AI 用同一份。做 DevEco Code、鸿蒙电脑窗口，或 Studio 工具区时用本库。

PC / Mac 可以把 `deveco-intui-kit/` 当输入：token、组件、图标、可切换的深色 / 浅色 / 浅色高对比，以及 AI 视觉规范和消息操作栏。只读，不改 kit 本身。和 Pixso 预览冲突时，以预览为准。kit 有而预览没有的（浅色高对比、智能状态、消息操作栏）可以收进来，但必须标明来自 intui-kit。公共名字用 DevEco 语义，不出现 IntelliJ / Int UI。不要抄别的设计系统的外壳、渐变、光标点阵或播放条。

## 怎么把整包交出去

把整个 `design-system/` 目录交给同事或 AI。交接清单在 [references/handoff.md](references/handoff.md)。只丢一个 CSS 文件不够。

## 必读顺序

1. 本文件：能不能做、走哪条工作流、最后回复要写什么。
2. [references/preview-gate.md](references/preview-gate.md)：什么必须停。
3. [references/quick-reference.md](references/quick-reference.md)：`data-system`、class、印出 token、官方名称。
4. [DESIGN.md](DESIGN.md)：两套系统的假设、取样色、官方色阶名称、每个组件的对照结论。
5. [preview/index.html](preview/index.html)：一页里有印出的 token 与样张、全部组件文档（实时示例、用法、API）、Pixso 对照、FileWindow、StudioToolWindow。先在这一页看组件，再写页面。
6. `tokens/foundation.css`、`tokens/semantic.css`、`tokens/components.css`。官方名已经写在 foundation 的注释里。精确色板还在提取时，继续用已有取样，不要编色值。
7. 要拼整页时再读 `patterns/file-window.tsx` 或 `patterns/studio-tool-window.tsx`。静态页在总览里，深链是 [examples/file-window.html](examples/file-window.html) 和 [examples/studio-tool-window.html](examples/studio-tool-window.html)。

`docs/`、`compare/`、`examples/` 仍是深链。启动页只留一张卡片，指向 `preview/index.html`。

## MUST

- 引入 `tokens/index.css`。祖先节点设置 `data-system="pc-mac"|"harmony"` 和 `data-theme="light"|"dark"`。
- 按钮、菜单、输入、树、工具栏、页签、侧栏、胶囊只用已有组件或对应 class。
- 整页先选外壳：鸿蒙电脑文件 / 备忘录 / 文本走 FileWindow；Studio 工具菜单和图标条走 StudioToolWindow。
- 只用三层 token 里已有的变量。推断值保持「从预览图推断，待用 Pixso 变量核对」。
- 字体用 `--font-ui`：HarmonyOS Sans SC 2025、HarmonyOS Sans SC 2024、HarmonyOS Sans SC、HarmonyOS Sans、HarmonyHeiTi，PingFang SC 只作回退。有官方名时用官方名：`ohos_*`、`defaultShadowS_PC`、Light Gray / Dark Gray 1–14 的名称。token 里还没有 Gray 1–14 的色值，不要编。
- 缺控件时走 preview-gate：停、放 `.de-gap`、写进 DESIGN.md、等确认。
- 鸿蒙稿里的 IntelliJ / Int UI 只作视觉参考。公共名字用 ToolMenu、ToolStripe。
- 侧栏当前项可以是浅蓝。文件树和浅色菜单的当前项是中性灰。不要混用。
- 收进来的 kit 零件要带 `data-de-source="intui-kit"`，或在文档里写明来源。浅色高对比是 `data-theme="light-contrast"`。
- 对照时先按工作流 A、C 用本库拼出设计稿页，再拿组件库去对那些稿页和 Pixso 预览。只改对不上的地方。稿页在总览的「Pixso 对照」，深链在 `compare/`。
- 最终回复按文末清单写。

## MUST NOT

- 不要新造主色、危险色、渐变、光标点阵、播放条，或稿上没有的圆角和按钮 variant。
- 不要用 Helvetica，也不要用 Inter。不要把 PingFang SC 写成正文字体，它只是回退。
- 不要把 `#E5000000`、`#E5FFFFFF`、`#33000000` 当成 CSS `#RRGGBBAA`。按鸿蒙 AARRGGBB，这一条已经确认。
- 不要自造 Light Gray / Dark Gray 1–14 的十六进制。名称可以写，色值只使用 token 里已经写出的取样阶梯，并标明临时。
- 不要实现对话框，直到 `ohos_id_color_dialog_bg` 三个色值被读出。
- 不要用 Elevation 55 / 70 编阴影。菜单阴影只用印出的 `defaultShadowS_PC`。`defaultShadowXS`、`defaultShadowM`、`defaultShadowL`、`FloatShadowS`、`FloatShadowM` 只有名称，不要编公式。
- 不要把 Fleet、MarsCode，或设计工具自己的菜单（亮蓝 Publish Styles、属性开关）当成 DevEco 控件。
- 不要改 `deveco-intui-kit/`。不要把启动页上的 Pixso 设计系统再拆成多张卡片。
- 不要把竞品截图里的蓝色主按钮加进 Button。
- 不要把侧栏图标统一染成同一种蓝。稿上主页图标是深色，其他入口各有颜色。
- 不要用别的系统的 ide-frame 代替 FileWindow / StudioToolWindow。

## 工作流 A：把产品需求拆成一页

不直接从空白页画。先拆，再进工作流 C。

写代码前列出这页需要的零件，并在 [preview/index.html](preview/index.html) 的组件文档区，或 `docs/<组件>.html` 里点开对应页：

- 外壳：FileWindow 还是 StudioToolWindow
- 系统：`pc-mac` 还是 `harmony`。说不清就停，写进待确认
- 主题：浅色还是深色。没说时，文件窗口用浅色，Studio 工具窗用深色，并在回复里写明这是推断
- 工具栏按钮、图标按钮、搜索、菜单、树、侧栏、胶囊、页签、标签、提示、状态栏
- 缺的零件（对话框、主按钮、开关、Logo、错误色、语法色）

映射：

| 需求 | 先打开 |
| --- | --- |
| 文件、备忘录、文本窗口 | `preview/index.html#file-window`，深链 `examples/file-window.html` |
| Studio 工具菜单或图标条 | `preview/index.html#studio-tool-window`，深链 `examples/studio-tool-window.html` |
| 单个控件 | `preview/index.html#component-<名称>`，深链 `docs/<组件>.html` |
| 和 Pixso 帧并排 | `preview/index.html#compare`，深链 `compare/` |

有缺的零件就进 preview-gate，不要先写新 CSS。拆完进入工作流 C。

## 工作流 B：把已有界面改到这套系统

1. 判断原页是 PC / Mac 还是鸿蒙。不确定就停。
2. 外壳换成 FileWindow 或 StudioToolWindow。删掉页面私有的按钮色、边框、阴影、圆角。
3. 每个可见控件换成总览或 `docs/` 里已有的 class。对不上的列成缺口，用 `.de-gap` 占住，不要留一个「看起来像」的私有按钮。
4. 若原页用了 kit 的智能色或消息栏，可以留，但标成 intui-kit，并且不要用它们覆盖 Pixso 已经定下的菜单、树、侧栏颜色。不要顺手改 kit 源文件，也不要把设计系统再拆成多张启动页卡片。
5. 原页若有对话框、主色 CTA、开关、Logo，停在 preview-gate。kit 里即使有相近控件，也不能拿来填这些还在等确认的缺口。
6. 改完在总览的组件文档里用同一套 `data-system` / `data-theme` 点一遍，再看这页。

## 工作流 C：用现成外壳组合

这是拼整页的唯一步骤。从 FileWindow 或 StudioToolWindow 开始，不从空白画板开始，也不用其他系统的外壳。

1. 选外壳。
   - 文件、备忘录、文本编辑：`patterns/file-window.tsx`，静态页照总览的 FileWindow，或 `examples/file-window.html`。
   - Studio 工具区：`patterns/studio-tool-window.tsx`，静态页照总览的 StudioToolWindow，或 `examples/studio-tool-window.html`。
2. 只往外壳里放已有零件：Button、IconButton、SearchField、Menu、Tree、NavList、Chip、Tabs、Tag、Tooltip、StatusBar、ToolMenu、ToolStripe。
3. 产品页只提供文案、当前项和必要的排列。不重写 `.de-button`、`.de-menu`、`.de-window` 的颜色和圆角。
4. 缺的区域用 `.de-gap`，文字说明卡在哪一条。FileWindow 示例里的「删除确认」、Studio 示例里的「编辑器画布」就是这样留的。
5. 打开页面点：主题切换、侧栏当前项、胶囊、树展开、菜单当前项、图标条当前项。

## Preview gate

细则在 [references/preview-gate.md](references/preview-gate.md)。短句：没有的控件先停，做预览，标明缺口，等确认。不要发明颜色或按钮。

## 尺寸、动效、表面、字体

- 阶梯 4 / 8 / 12 / 16 / 20 / 24 / 32。控件高 24 或 32。菜单底板圆角只用印出的 8vp。
- 动效只有 `--motion-fast`（120ms，推断）。系统要求减少动态时为 0。
- 表面：窗口，然后标题栏，然后侧栏选中（浅蓝）与树/菜单选中（灰）分开，浮层用印出的菜单阴影和双描边。
- 菜单字号 Body_L 16vp，即已确认的 `ohos_id_text_size_body1`。窗口控件 13px 是推断。字体是 `--font-ui` 的 HarmonyOS Sans SC 栈。源文件里还有 Font/Body_M/Medium、Font/Body_M/Regular、Light/font_primary、font_emphasize、font_on_primary、font_secondary、font_tertiary 这些名字，字号未印出，不补。

## 最终回复清单

做完一页或一次改动，回复里要有：

1. 用的系统（`pc-mac` / `harmony`）和主题。主题若是推断，写明。
2. 复用了哪些组件，链到 `preview/index.html` 的对应节，或 `docs/`、`examples/` 深链。
3. 哪些地方稿上有、这页没做，以及卡在 preview-gate 的哪一条。
4. 新写上的颜色或尺寸里，哪些仍是「从预览图推断，待用 Pixso 变量核对」。没有自造 Light / Dark Gray 1–14 的十六进制。
5. 字体用了 `--font-ui` 的 HarmonyOS Sans SC 栈。PingFang SC 只是回退。没有 Helvetica，也没有 Inter。
6. 用了 token 里已有的官方名（`ohos_*`、`defaultShadow*`）。没有给尚未印出数值的阴影编公式。
7. 没有改 `deveco-intui-kit/`。启动页的 Pixso 设计系统仍是一张卡片。
