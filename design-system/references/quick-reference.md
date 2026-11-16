# 速查

主题写在祖先节点上，不包 Provider。

```html
<div data-system="pc-mac" data-theme="light">
<div data-system="harmony" data-theme="dark">
```

样式入口：`tokens/index.css`（foundation → semantic → components）。

## 该用哪个外壳

| 页面 | 外壳 | 不要用 |
| --- | --- | --- |
| 鸿蒙电脑文件、备忘录、文本编辑 | `patterns/file-window.tsx` 或同样的 `.de-window` | 另一套 IDE 外框、渐变底、播放条 |
| Studio 工具菜单、图标条 | `patterns/studio-tool-window.tsx` | IntelliJ / Int UI 这个名字、设计工具的亮蓝菜单 |

## Class

| 零件 | class |
| --- | --- |
| 工具栏按钮 | `.de-button.de-button--toolbar` |
| 实心 Search | `.de-button.de-button--solid` |
| 图标按钮 | `.de-icon-button` |
| 搜索 | `.de-search` |
| 菜单 | `.de-menu` / 当前项 `aria-current="true"` |
| Studio 菜单 | `.de-menu.de-tool-menu` |
| 树选中 | `.de-tree__row[data-selected="true"]` |
| 侧栏当前 | `.de-nav__item[aria-current="page"]` |
| 胶囊 | `.de-chip[aria-pressed="true"]` |
| 页签 | `.de-tab[data-selected="true"]` |
| 缺口 | `.de-gap` |

## 印出、可以当已确认的

- 字体：`--font-ui` = HarmonyOS Sans SC 2025 / 2024 / SC / HarmonyOS Sans / HarmonyHeiTi，PingFang SC 只作回退。禁止 Helvetica 与 Inter。
- 正文 16vp：`--ohos-id-text-size-body1`（`ohos_id_text_size_body1`）
- 正文色 `#E5000000`：AARRGGBB 已确认，`rgb(0 0 0 / 90%)`
- 同文件里的 `#E5FFFFFF`、`#33000000` 也按 AARRGGBB：`rgb(255 255 255 / 90%)`、`rgb(0 0 0 / 20%)`
- 圆角 8vp：`--corner-radius-level4`，用于菜单底板
- 菜单阴影：`defaultShadowS_PC` = `0 0 16px rgb(0 0 0 / 20%)`
- 双描边：内白 20%；外黑浅色 10%、深色 40%

官方灰阶叫 Light Gray 1–14、Dark Gray 1–14。名称和角色见 `DESIGN.md` 与 `foundation.css` 注释。精确色块还在提取。`gray-0` … `gray-100` 是临时取样，不要编 Gray 1–14 的十六进制去替换。

官方阴影名还有 `defaultShadowXS`、`defaultShadowS`、`defaultShadowM`、`defaultShadowL`、`FloatShadowS`、`FloatShadowM`。除已经印出的 `defaultShadowS_PC` 外，不要写公式。

其余表面色是取样，注释里带「从预览图推断，待用 Pixso 变量核对」。PC 深色色阶在 NewUI 里存在，当前 CSS 色值仍是取样。
