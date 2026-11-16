# DevEco 设计系统 Skill

给人和 AI 共用。改界面时先读本文件，再读 [DESIGN.md](DESIGN.md) 和 [llms.txt](llms.txt)。

## 何时使用

做 DevEco Code、鸿蒙电脑窗口，或 DevEco Studio 工具区的界面时使用本库。不要从 `deveco-intui-kit/` 或 PR #15 抄颜色和组件。

## MUST

- 引入 `tokens/index.css`，在祖先节点设置 `data-system="pc-mac"|"harmony"` 和 `data-theme="light"|"dark"`。
- 按钮、菜单、输入、树、工具栏、页签只用本库已有组件或对应 class。
- 新屏幕优先用 `patterns/` 里的窗口外壳，再往里填内容。
- 只使用 foundation / semantic / components 三层里已有的 CSS 变量。
- 推断值保持注释里的「从预览图推断，待用 Pixso 变量核对」，不要改成已确认。
- 系统里没有的控件：停下来，在预览里加一张缺口卡，写进 DESIGN.md 的缺口列表。
- 鸿蒙稿里的 IntelliJ / Int UI 视觉可以参考，公共 props 和组件名用 DevEco 语义（`ToolMenu`、`ToolStripe`）。

## MUST NOT

- 不要新造主色、危险色、渐变按钮，或稿上没出现的圆角。
- 不要用 Helvetica，也不要写成某套未印出的品牌字体。
- 不要把 `#E5000000`、`#33000000` 当成 CSS 的 `#RRGGBBAA`。鸿蒙印出的是 AARRGGBB。
- 不要实现对话框，直到 `ohos_id_color_dialog_bg` 的三个色值被读出。
- 不要用 Elevation 55 / 70 编一套阴影。菜单阴影只用印出的 `defaultShadowS_PC`。
- 不要把 Fleet、MarsCode、设计工具自己的菜单（亮蓝选中、Publish Styles）当成 DevEco 控件。
- 不要改启动页、demo 和已有 kit，来迁就这套新库。
- 不要把竞品截图里的蓝色主按钮抄进 `Button` 的 variant。

## 工作流

1. 确认这屏属于 PC / Mac 还是鸿蒙端。不确定就停，并写进待确认项。
2. 在 [preview/index.html](preview/index.html) 里找到已有组件。对得上就组合。
3. 对不上就加缺口卡，不要先写新 CSS。
4. 组件 API 保持「原生元素 + 少量 variant」。内部用 children 组合，不要锁死成只能传数据数组。
5. 改完在预览里点一遍：菜单开合、树展开、筛选胶囊、页签、主题切换。

## 尺寸、动效、表面、字体

- 尺寸阶梯是 4 / 8 / 12 / 16 / 20 / 24 / 32。控件高 24 或 32。菜单圆角只用 `corner_radius_level4`（8vp）。
- 动效只有 `--motion-fast`（120ms，推断）。`prefers-reduced-motion: reduce` 时为 0。
- 表面层级：窗口 < 标题栏 / 侧栏 < 选中与悬停 < 菜单浮层。浮层用印出的阴影和双描边，不另加投影。
- 正文字号用 `ohos_id_text_size_body1`（16vp）。字体家族未印出，用系统 UI 字体栈。
