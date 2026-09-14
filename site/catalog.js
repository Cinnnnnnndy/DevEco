/* =====================================================================
   启动页目录数据 —— 以后新增 demo / 分析 / 材料，只改这个文件。

   每个 group 是首页上的一段；每个 item 是一张卡片。字段说明：
     title   卡片标题
     desc    一两句话说清是什么、能看到什么
     kind    类型标签：界面稿 | 规范 | 分析 | 材料 | 文档（也用于顶部筛选）
     status  ready = 可演示 · wip = 进行中 · planned = 规划中（没有 href 也可以）
     date    最近更新，YYYY-MM-DD
     href    点卡片打开的相对路径（相对仓库根目录；中文路径直接写，脚本会 encodeURI）
     links   次要链接：[{label, href}]，例如单文件版、源码、大纲
     tags    小标签，可省略
     note    补充说明（放在卡片底部，灰字），可省略

   新 demo 的约定：放在 demos/<slug>/index.html，样式引用
   ../../deveco-intui-kit/src/tokens.css 与 components.css，然后在这里登记一条。
   ===================================================================== */
window.DEVECO_CATALOG = {
  updated: '2026-09-14',
  title: '鸿蒙开发工具体验 · 启动页',
  lede: '这里放我们围绕 DevEco Studio / DevEco Code / DevEco CLI 做的界面稿、设计系统、分析与汇报材料。所有页面都是本地静态文件，双击即开，不需要构建。',

  /* 一年节奏，来自「总体材料结构」思维导图。date 用于判断是否已过 */
  milestones: [
    { date: '2026-09-30', label: '9/30 · 发布 7.0' },
    { date: '2026-10-31', label: '10 月 · 产品规划节点 + 融合方案汇报' },
    { date: '2026-11-30', label: '10–11 月 · BP 规划' },
    { date: '2026-12-30', label: '12/30 · 发布 7.1（DevEco Code 的 GUI 融进 IDE）' },
    { date: '2027-06-30', label: '2027 H1 · 8.0 → HDC 2027' },
  ],

  groups: [
    {
      id: 'demos',
      title: '界面稿与 Demo',
      note: '能点、能截图评审的高保真界面稿。规划中的条目是下一步要做的 demo，排期后补链接。',
      items: [
        {
          title: 'DevEco Studio Windows 主窗口',
          desc: '基于 IntelliJ Int UI 的整页界面稿：Header、工具窗、编辑器、CodeGenie 面板、构建 / 终端、状态栏。深色 / 浅色 / 浅色高对比三主题可切，树、标签页、弹层、AI 问答都能点。',
          kind: '界面稿', status: 'ready', date: '2026-09-09',
          href: 'deveco-intui-kit/demo/index.html',
          links: [
            { label: '单文件版', href: 'deveco-intui-kit/dist/deveco-main-window.html' },
            { label: '源码', href: 'deveco-intui-kit/' },
          ],
          tags: ['Int UI', 'IntelliJ 243', '三主题'],
        },
        {
          title: 'Agent 执行过程可见与可干预',
          desc: 'Agent 在终端 / IDE 内跑任务时，步骤、工具调用、成本与阻塞怎么让人看见，错误方向上怎么及时打断与接管。对应创新点 ①。',
          kind: '界面稿', status: 'planned',
          tags: ['创新点 ①', '阶段二'],
        },
        {
          title: '多文件改动审阅与回退',
          desc: '一次 Agent 改动跨多个文件时的 diff 呈现、逐块接受 / 拒绝、按时间轴回退。对应创新点 ①，窗口以周计。',
          kind: '界面稿', status: 'planned',
          tags: ['创新点 ①', '阶段二'],
        },
        {
          title: '嵌入式工作流：DevEco Code 融进 IDE',
          desc: '7.1 融合方案的入口与模式切换：CLI Agent 以插件形态进入 Studio 之后，会话、上下文、Skill 在 IDE 里长什么样。',
          kind: '界面稿', status: 'planned',
          tags: ['融合方案', '7.1'],
        },
        {
          title: '平台知识以 Agent 可消费的形态交付',
          desc: '官网与文档面向 Agent 的检索入口（llms.txt、MCP），以及 IDE 内文档面板与之联动的方式。对应创新点 ②。',
          kind: '界面稿', status: 'planned',
          tags: ['创新点 ②', '官网'],
        },
      ],
    },
    {
      id: 'system',
      title: '设计系统与规范',
      note: '界面稿背后的 token 与组件，色值逐 key 取自 DevEco Studio 6.0.2 安装包的主题文件。',
      items: [
        {
          title: 'Int UI 组件库与 Token 规范页',
          desc: '调色板、语义 token、字号阶梯、尺寸与间距、组件画廊、编辑器语法色、CSS 变量清单，以及每个 token 的来源与已知局限。',
          kind: '规范', status: 'ready', date: '2026-09-09',
          href: 'deveco-intui-kit/docs/index.html',
          links: [
            { label: '单文件版', href: 'deveco-intui-kit/dist/intui-tokens-docs.html' },
            { label: 'tokens.json', href: 'deveco-intui-kit/tokens/tokens.json' },
            { label: '来源对照', href: 'deveco-intui-kit/tokens/SOURCES.md' },
          ],
          tags: ['token', '组件画廊'],
        },
        {
          title: 'Kit 使用说明',
          desc: '目录结构、怎么改配色 / 组件 / 图标、怎么打包成单文件、数据从哪来、还有哪些没取到。',
          kind: '文档', status: 'ready', date: '2026-09-09',
          href: 'deveco-intui-kit/README.md',
          tags: ['README'],
        },
      ],
    },
    {
      id: 'analysis',
      title: '分析与研究',
      note: '对内汇报与对外协同共用的事实基础：以开发者证据推动方案，不以设计观点推动方案。',
      items: [
        {
          title: 'DevEco 生态位与体验舆情',
          desc: '外部事实、DevEco 家族的版本节奏、开发者原声（IDE 内 / IDE 外）、同行 2026 年把 IDE 做成了什么、从舆情到动作的三个同心圆、1100 万注册开发者里的七类人群与漏斗。',
          kind: '分析', status: 'ready', date: '2026-09-03',
          href: 'deveco-ecosystem-sentiment.html',
          tags: ['舆情', '开发者原声', '同行对照'],
        },
        {
          title: '鸿蒙开发者生态与开发工具态势分析（2026-09）',
          desc: 'HDC 2026 生态基本盘、HarmonyOS 7 的 Agent 方向、开发工具矩阵（Studio / CodeGenie / Code / CLI / 官网）、五条判断与第一版计划骨架、需要内部核实的问题。',
          kind: '分析', status: 'ready', date: '2026-09-03',
          href: '鸿蒙开发者生态分析_2026-09_1.md',
          tags: ['HDC 2026', '工具矩阵'],
        },
      ],
    },
    {
      id: 'materials',
      title: '汇报材料与结构',
      note: '总体材料的骨架与胶片。思维导图三个大块：现状 · 创新 · 业务发展想法。',
      items: [
        {
          title: '总体材料结构 · 思维导图',
          desc: '四条业务线、今年三个变化、融合方案（KIT + TUI + IDE）、体验设计七项、创新机会点七条、风险四条与团队组成。',
          kind: '材料', status: 'ready', date: '2026-09-09',
          href: '思维导图_总体材料结构.svg',
          links: [
            { label: '大纲 (md)', href: '思维导图_总体材料结构.md' },
            { label: 'OPML', href: '思维导图_总体材料结构.opml' },
          ],
          tags: ['思维导图'],
        },
        {
          title: '鸿蒙开发工具体验 · 总体材料（框架版 202609）',
          desc: '汇报胶片的框架版。下载后用 PowerPoint / WPS 打开。',
          kind: '材料', status: 'wip', date: '2026-09-09',
          href: '鸿蒙开发工具体验_总体材料_框架版_202609_1.pptx',
          tags: ['PPTX', '4.6 MB'],
        },
        {
          title: '鸿蒙开发工具接手思路',
          desc: '判断、可直接迁移的存量资产（TUI 设计系统、设计直出代码、交付流水线、体验治理）、接手后的主攻方向、期望与建议。',
          kind: '材料', status: 'ready', date: '2026-09-03',
          href: '鸿蒙开发工具接手思路.md',
          tags: ['接手思路'],
        },
      ],
    },
  ],
};
