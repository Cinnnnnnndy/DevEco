# Preview gate

系统里没有的控件，先停。做一张预览卡标明缺口，等确认，再写进库。不要在产品页里悄悄补。

## 什么时候停

- 需求要用对话框、主色按钮、危险按钮、开关、Logo、表单错误色、图标字体、TUI 尺寸、Elevation 阴影。
- 需要一种 foundation / semantic / components 里没有的颜色、圆角或按钮 variant。
- 两套系统对不上：说不清这屏是 `pc-mac` 还是 `harmony`。
- 预览里只有设计工具自己的检查器（亮蓝选中、Publish Styles、属性开关），没有产品控件的渲染帧。

## 停了之后做什么

1. 在页面上放一块 `.de-gap`，写缺的是什么、卡在哪一条预览。
2. 把同一句写进 `DESIGN.md` 的缺口列表。
3. 最终回复里单独列出，不要混进「已复用组件」。
4. 等使用者确认色值或补帧之后，再改 token 和组件。确认前，推断值保持「从预览图推断，待用 Pixso 变量核对」。

## 现在已经卡住、不要补的

| 缺口 | 为什么停 |
| --- | --- |
| 对话框 | `ohos_id_color_dialog_bg` 三个色值没读出 |
| 主色 / 危险按钮 | 产品帧里没有 |
| 开关 | 只出现在设计工具属性检查器 |
| Logo | 有锁版帧，没有矢量，也没有印出色 |
| TUI 尺寸 | 总览太小，单帧读不出控件表 |
| 图标字体 | 预览是截图 |
| 字体家族 | 未见，禁止 Helvetica |
| vp 与 px | 规范页 vp，Code 设置页 px，是否 1:1 未确认 |
| Elevation 55 / 70 | 只有名称，没有和 `defaultShadowS_PC` 的换算 |
| `#E5000000` / `#33000000` | 当前按 AARRGGBB，等确认 |
| PC 深色搜索 | 只有条目名 |
| 编辑器语法色 | 没有印出的色板 |
| y10 阴影的归属 | 标注没写组件名 |

## 可以收、但要标明来源

intui-kit 里有、Pixso 没有的：浅色高对比（`data-theme="light-contrast"`）、智能状态（AiStatus）、消息操作栏（MessageBar）。收的时候写「来自 intui-kit」。它们不覆盖 Pixso 的菜单灰、树灰和侧栏浅蓝。

## 可以继续的

用已有 Button、Menu、Tree、SearchField、NavList、Chip、Tabs、WindowFrame、ToolMenu、ToolStripe 拼页面。缺的那一块用 `.de-gap` 留白。
