# DevEco · 鸿蒙开发工具体验

围绕 DevEco Studio / DevEco Code / DevEco CLI 的体验设计工作仓：21 条创新点各一个可点的界面稿 demo，加上设计系统、分析与汇报材料。

**从 [`index.html`](index.html) 进。** 这是仓库的工作台首页：左侧按分类导航，右侧一条创新点一张卡，双击打开即可，不需要构建、不需要服务器。

## 里面有什么

| 目录 / 文件 | 是什么 |
|---|---|
| `index.html` + `site/` | 工作台首页。条目登记在 `site/catalog.js`，样式 `site/launcher.css`，交互 `site/launcher.js`，缩略图 `site/thumbs/`，出图脚本 `site/tools/thumb.py` |
| `demos/<NN-slug>/index.html` | 21 条创新点的界面稿 demo，编号与《创新方向》deck 一致。整页即软件，能点 |
| `demos/_shared/` | 所有 demo 共用的 IDE 外壳：`frame.js`（Header / 侧栏 / 状态栏 / 项目树 / 示例代码 / 面板开合 / 主题 / Tooltip）、`frame.css`（demo 层组件：步骤条、胶囊、时间轴、设备外框、画布、弹层…） |
| `deveco-intui-kit/` | DevEco Studio（Windows · IntelliJ Int UI）组件库：token、组件样式、图标、主窗口界面稿、规范页。详见 [它的 README](deveco-intui-kit/README.md) |
| `鸿蒙开发工具_创新方向_20260913.pptx` | 三个方向 21 条创新点的 deck，demo 的出处 |
| `deveco-ecosystem-sentiment.html` | 《DevEco 生态位与体验舆情》单文件分析页 |
| `鸿蒙开发者生态分析_2026-09_1.md` · `鸿蒙开发工具接手思路.md` | 生态态势分析、接手思路 |
| `思维导图_总体材料结构.{svg,md,opml}` · `鸿蒙开发工具体验_总体材料_框架版_202609_1.pptx` | 总体材料的结构与框架版胶片 |

## 21 个 demo 怎么分

按 deck 的三个方向，编号与 deck 一致：

- **基础易用性**（01–04）：布局预设 · 场景化体检 · 从症状进入的调优闭环 · 安卓应用转化
- **AI 辅助开发**（05–14）：三处就地对话 · 语音开发 · Agent Team 三档状态 · 结论先行 · 可视化编程 · 可视化调优 · 意图确认 · 自动化 Workflow · 预览写回源码 · AI 协作时间轴
- **鸿蒙特征 / 首发**（15–21）：跨端接续 · 真机多设备差异 · 单屏多设备画布 · 分布式调试 · 远端设备进画布 · 连接五步 · 智慧胶囊

每张卡右上角是状态（可体验 / 文档 / 原型），类别旁边是 deck 的标记（投 / 半投 / 补齐 / 搭车 / 顺手做），标签是它主要改善的指标（步数与切换次数 / 等待可见 / 审阅与回退）。

## 新增或改一个 demo

1. 新建 `demos/<NN-slug>/index.html`，头部照任一现有 demo 引入 kit 与共享骨架：
   ```html
   <link rel="stylesheet" href="../../deveco-intui-kit/src/tokens.css">
   <link rel="stylesheet" href="../../deveco-intui-kit/src/components.css">
   <link rel="stylesheet" href="../_shared/frame.css">
   <script src="../../deveco-intui-kit/src/icons.js"></script>
   <script src="../_shared/frame.js"></script>
   ```
   页面只写 `.body` 里自己的面板（`.tw-left` / `.editor` / `.tw-right` / `.tw-bottom`），末尾 `DemoFrame.init({...})`，外壳由 frame 注入。`DemoFrame.tree()` / `code('ListPage.ets')` / `tabs()` 给项目树、示例代码与标签页；用法见 `demos/_shared/frame.js` 文件头。
2. 颜色只用 `--ui-*` 语义变量，字号用 `--fs-*` / `--lh-*`，规范见 [`deveco-intui-kit/docs/index.html`](deveco-intui-kit/docs/index.html)。IDE 外壳保持英文，新功能面板用中文。页面里不放 IDE 之外的说明性 UI。
   要改面板宽高，写 `.ide[data-ide-theme]{--ai-w:…;--bottom-h:…}`（不能只写 `.ide{…}`，会被 `tokens.css` 里按主题声明的同名变量盖掉）。`<button>` 里不要再套按钮或链接。
3. 出缩略图：`python3 site/tools/thumb.py <slug>`（需要 Pillow 与本机 Chromium，脚本头部有说明）。
4. 在 `site/catalog.js` 对应分类里登记或更新那条：`view:'ready'`、`href`、`thumb`。刷新首页即可看到。

分析页、材料同理：文件放进仓库，到 `site/catalog.js` 登记，`view` 填 `'doc'`（缩略图自动画成骨架预览，不用截图）。还没做的条目 `view:'sketch'`、不写 `href`，首页会显示成虚线线框占位卡片。

## 工作台的约定

- 左侧分类导航直接来自 `site/catalog.js` 里的分组（`groups`），新增一个分组会自动出现在导航里。
- 卡片状态只有三种，来自图例：`ready` 可体验（真的能点）、`doc` 文档（分析 / 说明 / 汇报材料）、`sketch` 原型（草图 / 占位）。左下角图例本身也是筛选器。
- 颜色与字号来自 `deveco-intui-kit/src/tokens.css`，和界面稿同一套 token；深 / 浅色跟随系统，右上角按钮可以固定。demo 页面的主题记在 `localStorage` 的 `deveco-theme`，和主窗口界面稿共用。
- 顶部的一年节奏条来自 deck 的落地页（9/30 发布 7.0 · 11 月汇报 · 11–12 月 BP · 12/30 发布 7.1 · 2027-06 发布 8.0），到期会自动变灰。
- 页面不依赖任何库，也没有外链（Google Fonts 除外，加载失败会退到系统字体）。

## 发布

开启 GitHub Pages（Settings → Pages → 分支 `main`、目录 `/`）后，仓库根目录的 `index.html` 就是站点首页，所有相对链接照常可用。
