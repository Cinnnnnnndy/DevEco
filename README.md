# DevEco · 鸿蒙开发工具体验

围绕 DevEco Studio / DevEco Code / DevEco CLI 的体验设计工作仓：26 条创新点各一个可点的界面稿 demo（其中 9 条是新一轮规划重点），加上设计系统、分析与汇报材料。

### 🚀 打开启动页

- 线上：`https://cinnnnnnndy.github.io/DevEco/`（GitHub Pages 配好、且指向 `main` 分支根目录后生效，见下面「发布」一节）
- 本地：拉到本地后直接双击根目录的 [`index.html`](index.html)，不需要构建、不需要服务器

工作台首页左侧按分类导航，右侧一条创新点一张卡。每个 demo 都在自己独立的路径下（`demos/<编号-slug>/index.html`），线上地址配好之后就是各自独立可分享的 URL，比如 `https://cinnnnnnndy.github.io/DevEco/demos/01-layout-presets/index.html`，不用先打开启动页再点进去。

## 里面有什么

| 目录 / 文件 | 是什么 |
|---|---|
| `index.html` + `site/` | 工作台首页。条目登记在 `site/catalog.js`，样式 `site/launcher.css`，交互 `site/launcher.js`，缩略图 `site/thumbs/`，出图脚本 `site/tools/thumb.py` |
| `demos/<NN-slug>/index.html` | 创新点的界面稿 demo：01–21 编号与《创新方向》deck 一致，22 是版本需求，23–27 是新一轮规划重点。整页即软件，能点 |
| `demos/_shared/` | 所有 demo 共用的 IDE 外壳：`frame.js`（Header / 侧栏 / 状态栏 / 项目树 / 示例代码 / 面板开合 / 主题 / Tooltip）、`frame.css`（demo 层组件：步骤条、胶囊、时间轴、设备外框、画布、弹层…） |
| `deveco-intui-kit/` | DevEco Studio（Windows · IntelliJ Int UI）组件库：token、组件样式、图标、主窗口界面稿、规范页。详见 [它的 README](deveco-intui-kit/README.md) |
| `鸿蒙开发工具_创新方向_20260913.pptx` | 三个方向 21 条创新点的 deck，demo 的出处 |
| `deveco-ecosystem-sentiment.html` | 《DevEco 生态位与体验舆情》单文件分析页 |

## demo 怎么分

01–21 按 deck 的三个方向，编号与 deck 一致：

- **基础易用性**（01–04）：布局预设 · 场景化体检 · 从症状进入的调优闭环 · 安卓应用转化
- **AI 辅助开发**（05–14）：三处就地对话 · 语音开发 · Agent Team 三档状态 · 结论先行 · 可视化编程 · 可视化调优 · 意图确认 · 自动化 Workflow · 预览写回源码 · AI 协作时间轴
- **鸿蒙特征 / 首发**（15–21）：跨端接续 · 真机多设备差异 · 单屏多设备画布 · 分布式调试 · 远端设备进画布 · 连接五步 · 智慧胶囊

22 是「版本需求」里的冷启动分析报告。

### 规划重点（9 个点）

新一轮规划比 deck 更靠前，9 个点归成 4 类。已有 demo 能承接的直接并进去、按新点做了优化；没有的新建 23–27，放在原有方向后面：

| 类 | 规划点 | 落在哪个 demo |
|---|---|---|
| 开放生态 | DevEco Code / Studio 开放 MCP、Skill | 新增 23 |
| 开放生态 | 插件（模拟器、调测、调优）+ 第三方工具隐性开放 | 新增 24 |
| 轻量与云端 | 手机客户端：对话直接真机调试 | 新增 25 |
| 轻量与云端 | IDE Lite / IDE Web：轻量 + 快速验证 | 新增 26 |
| 轻量与云端 | 云端模拟器：本机不耗资源，云端多开 | 新增 27 |
| AI 原生 | AI 和 IDE 的深度融合 | 并入 05，加 Build 报错 / 断点处就地 AI |
| AI 原生 | 多 Agent、Agent team | 并入 07，加团队编排、交接与冲突 |
| 模拟器与鸿蒙特征 | 模拟器多端：鸿蒙特征模拟、跨屏、手势 | 并入 17 |
| 模拟器与鸿蒙特征 | D2C、模拟器直接修改与调试 | 并入 13 |

这些卡片在首页打「重点」角标，左侧导航有「规划重点」筛选，「全部」视图顶部有一块总览，点一个规划点就滚到对应卡片。登记方式：条目上写 `key:'<规划点>'`，点与卡的对应写在 `site/catalog.js` 的 `focus`。

每张卡右上角是状态（可体验 / 文档 / 原型），类别旁边的「重点」角标表示规划重点，标签是它主要改善的指标（步数与切换次数 / 等待可见 / 审阅与回退）。

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
- demo 页面上的标注（蓝色「点这里」、绿色「这里会变」）来自 `demos/_shared/guide.js`：左下角「关闭标注 / 显示标注」按钮或图例右上角的 × 关掉，选择记在 `localStorage` 的 `deveco-guide`，所有 demo 共用，关一次处处都关；启动页右上角「demo 标注：开 / 关」是同一个总开关。Esc 只收起当前页。
- 页面不依赖任何库，也没有外链（Google Fonts 除外，加载失败会退到系统字体）。

## 发布

这批内容已经合到 `main`，根目录有 `index.html` 了。要让上面那个线上地址真的能打开，去 `https://github.com/Cinnnnnnndy/DevEco/settings/pages` 确认：

1. **Source** 是 `Deploy from a branch`。
2. **Branch** 选 `main`，目录 `/`（root）。
3. 保存后去仓库的 **Actions** 标签页看 `pages build and deployment` 有没有跑完（通常几分钟）；跑完后 Settings → Pages 页顶部会显示实际地址，正常就是 `https://cinnnnnnndy.github.io/DevEco/`。

配好之后所有相对链接（demo、分析页、pptx 等）照常可用，不用改任何路径；每个 `demos/<slug>/index.html` 也会各自变成一条可以直接分享的独立网址。

**根目录的 `.nojekyll` 不要删。** GitHub Pages 默认会跑 Jekyll 构建，Jekyll 会把名字以下划线开头的目录整个跳过不发布——`demos/_shared/`（所有 demo 共用的 `frame.js` / `frame.css`）正好是这种目录。少了 `.nojekyll`，线上每个 demo 都会因为 `DemoFrame` 未定义而白屏（本地 `file://` 打开不受影响，只有真正发布到 Pages 才会踩到，所以容易漏测）。
