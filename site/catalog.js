/* =====================================================================
   启动页目录数据 —— 新增 demo / 分析 / 材料，只改这个文件。

   顶层是「分类」（也是左侧导航栏的分组），每个分类下是一组条目（卡片）。

   分类 group 字段：
     id     锚点 id
     title  分类名（左侧导航 + 卡片左上角小字都用它）
     icon   左侧导航图标，取值见 index.html 里 <symbol id="i-cat-*">
     note   分类下方的一行说明
     items  卡片数组

   每张卡片 item 字段：
     title    标题
     subtitle 英文 / 技术向副标题，可省略
     desc     一两句话说清是什么、能看到什么
     view     'ready' 可体验（有实际界面可点）
              'doc'   文档（分析、说明、汇报材料，读的东西）
              'sketch'原型（还没做，占位卡片，草图/占位）
     date     最近更新 YYYY-MM-DD，可省略（sketch 一般没有）
     href     点卡片打开的相对路径；sketch 没有 href
     links    次要链接 [{label, href}]
     tags     小标签，可省略
     thumb    卡片缩略图，三选一：
              {type:'image', src:'site/thumbs/xxx.jpg'}      真实截图
              {type:'doc', kind:'MD'|'PPTX'|'BUNDLE'|'README'} 文档骨架预览
              {type:'sketch'}                                  留空不填也会按 view 自动兜底

   新 demo 的约定：放在 demos/<slug>/index.html，样式引用
   ../../deveco-intui-kit/src/tokens.css 与 components.css，跑一遍无头 Chromium
   截图存到 site/thumbs/<slug>.jpg，然后在这里登记一条 view:'ready'。
   ===================================================================== */
window.DEVECO_CATALOG = {
  updated: '2026-09-14',
  title: '鸿蒙开发工具体验 · 工作台',
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
      icon: 'i-cat-window',
      note: '能点、能截图评审的高保真界面稿。原型是下一步要做的 demo，排期后补链接。',
      items: [
        {
          title: 'DevEco Studio Windows 主窗口',
          subtitle: 'DevEco Studio · Windows Main Window',
          desc: '基于 IntelliJ Int UI 的整页界面稿：Header、工具窗、编辑器、CodeGenie 面板、构建 / 终端、状态栏。深色 / 浅色 / 浅色高对比三主题可切，树、标签页、弹层、AI 问答都能点。',
          view: 'ready', date: '2026-09-09',
          href: 'deveco-intui-kit/demo/index.html',
          links: [
            { label: '单文件版', href: 'deveco-intui-kit/dist/deveco-main-window.html' },
            { label: '源码', href: 'deveco-intui-kit/' },
          ],
          tags: ['Int UI', 'IntelliJ 243', '三主题'],
          thumb: { type: 'image', src: 'site/thumbs/studio.jpg' },
        },
        {
          title: 'Agent 执行过程可见与可干预',
          subtitle: 'Agent Execution Visibility & Interrupt',
          desc: 'Agent 在终端 / IDE 内跑任务时，步骤、工具调用、成本与阻塞怎么让人看见，错误方向上怎么及时打断与接管。对应创新点 ①。',
          view: 'sketch',
          tags: ['创新点 ①', '阶段二'],
        },
        {
          title: '多文件改动审阅与回退',
          subtitle: 'Multi-file Diff Review & Rollback',
          desc: '一次 Agent 改动跨多个文件时的 diff 呈现、逐块接受 / 拒绝、按时间轴回退。对应创新点 ①，窗口以周计。',
          view: 'sketch',
          tags: ['创新点 ①', '阶段二'],
        },
        {
          title: '嵌入式工作流：DevEco Code 融进 IDE',
          subtitle: 'DevEco Code Embedded in Studio',
          desc: '7.1 融合方案的入口与模式切换：CLI Agent 以插件形态进入 Studio 之后，会话、上下文、Skill 在 IDE 里长什么样。',
          view: 'sketch',
          tags: ['融合方案', '7.1'],
        },
        {
          title: '平台知识以 Agent 可消费的形态交付',
          subtitle: 'Agent-readable Platform Knowledge',
          desc: '官网与文档面向 Agent 的检索入口（llms.txt、MCP），以及 IDE 内文档面板与之联动的方式。对应创新点 ②。',
          view: 'sketch',
          tags: ['创新点 ②', '官网'],
        },
      ],
    },
    {
      id: 'system',
      title: '设计系统与规范',
      icon: 'i-cat-chip',
      note: '界面稿背后的 token 与组件，色值逐 key 取自 DevEco Studio 6.0.2 安装包的主题文件。',
      items: [
        {
          title: 'Int UI 组件库与 Token 规范页',
          subtitle: 'Int UI Components & Design Tokens',
          desc: '调色板、语义 token、字号阶梯、尺寸与间距、组件画廊、编辑器语法色、CSS 变量清单，以及每个 token 的来源与已知局限。',
          view: 'ready', date: '2026-09-09',
          href: 'deveco-intui-kit/docs/index.html',
          links: [
            { label: '单文件版', href: 'deveco-intui-kit/dist/intui-tokens-docs.html' },
            { label: 'tokens.json', href: 'deveco-intui-kit/tokens/tokens.json' },
            { label: '来源对照', href: 'deveco-intui-kit/tokens/SOURCES.md' },
          ],
          tags: ['token', '组件画廊'],
          thumb: { type: 'image', src: 'site/thumbs/int-ui-docs.jpg' },
        },
        {
          title: 'Kit 使用说明',
          subtitle: 'deveco-intui-kit · README',
          desc: '目录结构、怎么改配色 / 组件 / 图标、怎么打包成单文件、数据从哪来、还有哪些没取到。',
          view: 'doc', date: '2026-09-09',
          href: 'deveco-intui-kit/README.md',
          tags: ['README'],
          thumb: { type: 'doc', kind: 'README' },
        },
      ],
    },
    {
      id: 'analysis',
      title: '分析与研究',
      icon: 'i-cat-chart',
      note: '对内汇报与对外协同共用的事实基础：以开发者证据推动方案，不以设计观点推动方案。',
      items: [
        {
          title: 'DevEco 生态位与体验舆情',
          subtitle: 'DevEco Ecosystem Position & Sentiment',
          desc: '外部事实、DevEco 家族的版本节奏、开发者原声（IDE 内 / IDE 外）、同行 2026 年把 IDE 做成了什么、从舆情到动作的三个同心圆、1100 万注册开发者里的七类人群与漏斗。',
          view: 'doc', date: '2026-09-03',
          href: 'deveco-ecosystem-sentiment.html',
          tags: ['舆情', '开发者原声', '同行对照'],
          thumb: { type: 'image', src: 'site/thumbs/sentiment.jpg' },
        },
        {
          title: '鸿蒙开发者生态与开发工具态势分析（2026-09）',
          subtitle: 'HarmonyOS Developer Ecosystem Report',
          desc: 'HDC 2026 生态基本盘、HarmonyOS 7 的 Agent 方向、开发工具矩阵（Studio / CodeGenie / Code / CLI / 官网）、五条判断与第一版计划骨架、需要内部核实的问题。',
          view: 'doc', date: '2026-09-03',
          href: '鸿蒙开发者生态分析_2026-09_1.md',
          tags: ['HDC 2026', '工具矩阵'],
          thumb: { type: 'doc', kind: 'MD' },
        },
      ],
    },
    {
      id: 'materials',
      title: '汇报材料与结构',
      icon: 'i-cat-book',
      note: '总体材料的骨架与胶片。思维导图三个大块：现状 · 创新 · 业务发展想法。',
      items: [
        {
          title: '总体材料结构 · 思维导图',
          subtitle: 'Master Narrative · Mind Map',
          desc: '四条业务线、今年三个变化、融合方案（KIT + TUI + IDE）、体验设计七项、创新机会点七条、风险四条与团队组成。',
          view: 'doc', date: '2026-09-09',
          href: '思维导图_总体材料结构.svg',
          links: [
            { label: '大纲 (md)', href: '思维导图_总体材料结构.md' },
            { label: 'OPML', href: '思维导图_总体材料结构.opml' },
          ],
          tags: ['思维导图'],
          thumb: { type: 'image', src: 'site/thumbs/mindmap.png' },
        },
        {
          title: '鸿蒙开发工具体验 · 总体材料（框架版 202609）',
          subtitle: 'Master Deck · Framework Draft',
          desc: '汇报胶片的框架版。下载后用 PowerPoint / WPS 打开。',
          view: 'doc', date: '2026-09-09',
          href: '鸿蒙开发工具体验_总体材料_框架版_202609_1.pptx',
          tags: ['PPTX', '4.6 MB'],
          thumb: { type: 'doc', kind: 'PPTX' },
        },
        {
          title: '鸿蒙开发工具接手思路',
          subtitle: 'Transition Notes',
          desc: '判断、可直接迁移的存量资产（TUI 设计系统、设计直出代码、交付流水线、体验治理）、接手后的主攻方向、期望与建议。',
          view: 'doc', date: '2026-09-03',
          href: '鸿蒙开发工具接手思路.md',
          tags: ['接手思路'],
          thumb: { type: 'doc', kind: 'MD' },
        },
      ],
    },
  ],
};
