# DevEco · 鸿蒙开发工具体验

围绕 DevEco Studio / DevEco Code / DevEco CLI 的体验设计工作仓：界面稿、设计系统、分析与汇报材料。

**从 [`index.html`](index.html) 进。** 这是仓库的启动页，列出所有 demo、分析与材料，双击打开即可，不需要构建、不需要服务器。

## 里面有什么

| 目录 / 文件 | 是什么 |
|---|---|
| `index.html` + `site/` | 启动页。条目登记在 `site/catalog.js`，样式 `site/launcher.css`，交互 `site/launcher.js` |
| `deveco-intui-kit/` | DevEco Studio（Windows · IntelliJ Int UI）组件库：token、组件样式、图标、主窗口界面稿、规范页。详见 [它的 README](deveco-intui-kit/README.md) |
| `deveco-ecosystem-sentiment.html` | 《DevEco 生态位与体验舆情》单文件分析页 |
| `鸿蒙开发者生态分析_2026-09_1.md` | 鸿蒙开发者生态与开发工具态势分析 |
| `鸿蒙开发工具接手思路.md` | 接手判断、可迁移资产、主攻方向 |
| `思维导图_总体材料结构.{svg,md,opml}` | 总体材料的结构（思维导图、大纲、OPML） |
| `鸿蒙开发工具体验_总体材料_框架版_202609_1.pptx` | 汇报胶片框架版 |

## 新增一个 demo

1. 新建 `demos/<slug>/index.html`。样式直接引用组件库，不要复制一份：
   ```html
   <link rel="stylesheet" href="../../deveco-intui-kit/src/tokens.css">
   <link rel="stylesheet" href="../../deveco-intui-kit/src/components.css">
   <script src="../../deveco-intui-kit/src/icons.js"></script>
   ```
   颜色只用 `--ui-*` 语义变量，字号用 `--fs-*` / `--lh-*`，规范见 [`deveco-intui-kit/docs/index.html`](deveco-intui-kit/docs/index.html)。
2. 在 `site/catalog.js` 对应分组里加一条（字段说明写在文件头部），刷新启动页即可看到。
3. 要发给别人看的，参考 `deveco-intui-kit/build.py` 的 `inline()` 打成单文件，产物放 `dist/`。

分析页、材料同理：文件放进仓库，再到 `site/catalog.js` 登记。规划中但还没做的条目，`status: 'planned'`、不写 `href`，启动页会显示成虚线卡片占位。

## 启动页的约定

- 颜色与字号来自 `deveco-intui-kit/src/tokens.css`，和界面稿同一套 token；深 / 浅色跟随系统，右上角按钮可以固定，选择记在 `localStorage`。
- 顶部的一年节奏条来自思维导图里的版本节点（9/30 · 十月汇报 · 12/30 · HDC 2027），到期会自动变灰，改日期在 `site/catalog.js` 的 `milestones`。
- 类型筛选按 `kind` 自动生成，不用手动维护。
- 页面不依赖任何库，也没有外链（Google Fonts 除外，加载失败会退到系统字体）。

## 发布

开启 GitHub Pages（Settings → Pages → 分支 `main`、目录 `/`）后，仓库根目录的 `index.html` 就是站点首页，所有相对链接照常可用。
