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
2. 截一张缩略图：无头 Chromium 跑起来，宽屏截图后裁成 16:10，存到 `site/thumbs/<slug>.jpg`。
   ```bash
   CH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
   $CH --headless=new --no-sandbox --window-size=1600,1000 \
       --screenshot=/tmp/shot.png "file://$PWD/demos/<slug>/index.html"
   python3 -c "from PIL import Image; Image.open('/tmp/shot.png').resize((640,400)).save('site/thumbs/<slug>.jpg','JPEG',quality=82)"
   ```
3. 在 `site/catalog.js` 对应分类里加一条（字段说明写在文件头部）：`view:'ready'`、`href` 指向 demo、`thumb:{type:'image',src:'site/thumbs/<slug>.jpg'}`。刷新启动页即可看到。
4. 要发给别人看的，参考 `deveco-intui-kit/build.py` 的 `inline()` 打成单文件，产物放 `dist/`。

分析页、材料同理：文件放进仓库，再到 `site/catalog.js` 登记，`view` 填 `'doc'`（文档 / 报告 / 汇报材料，缩略图自动画成骨架预览，不用截图）。规划中但还没做的条目，`view:'sketch'`、不写 `href`，启动页会显示成虚线线框占位卡片。

## 启动页的约定

- 左侧分类导航直接来自 `site/catalog.js` 里的分组（`groups`），新增一个分组会自动出现在导航里，不用改代码。
- 卡片右上角的状态徽标只有三种，来自图例：`ready` 可体验（真的能点）、`doc` 文档（分析 / 说明 / 汇报材料）、`sketch` 原型（草图 / 占位，还没做）。左下角图例本身也是筛选器，可以点。
- 颜色与字号来自 `deveco-intui-kit/src/tokens.css`，和界面稿同一套 token；深 / 浅色跟随系统，右上角按钮可以固定，选择记在 `localStorage`。
- 顶部的一年节奏条来自思维导图里的版本节点（9/30 · 十月汇报 · 12/30 · HDC 2027），到期会自动变灰，改日期在 `site/catalog.js` 的 `milestones`。
- 页面不依赖任何库，也没有外链（Google Fonts 除外，加载失败会退到系统字体）。

## 发布

开启 GitHub Pages（Settings → Pages → 分支 `main`、目录 `/`）后，仓库根目录的 `index.html` 就是站点首页，所有相对链接照常可用。
