/* =====================================================================
   启动页目录数据 —— 新增 demo / 分析 / 材料，只改这个文件。

   顶层是「分类」（也是左侧导航栏的分组），每个分类下是一组条目（卡片）。
   前三个分类就是《鸿蒙开发工具 · 创新方向》deck 里的三个方向，21 条创新点一条一张卡。

   分类 group 字段：
     id / title / icon（index.html 里 <symbol id="i-cat-*">）/ note（分类说明）/ items

   卡片 item 字段：
     no       创新点编号 "01"–"21"（deck 里的编号，可省略）
     title    标题
     subtitle 英文 / 技术向副标题，可省略
     desc     一两句话说清是什么、能看到什么
     mark     deck 里的标记：投 | 半投 | 补齐 | 搭车 | 顺手做（可省略）
     view     'ready' 可体验（有实际界面可点） · 'doc' 文档（读的东西） · 'sketch' 原型（还没做，占位）
     date     最近更新 YYYY-MM-DD，可省略
     href     点卡片打开的相对路径；sketch 没有 href
     links    次要链接 [{label, href}]
     tags     小标签（这里放主要改善的指标）
     note     一行补充（放在卡片底部灰字），例如排期批次
     thumb    {type:'image', src:'site/thumbs/xxx.jpg'} 真实截图
              {type:'doc', kind:'MD'|'PPTX'|'BUNDLE'|'README'} 文档骨架预览
              {type:'sketch'} 或省略 → 按 view 自动兜底

   新 demo 的约定：放在 demos/<slug>/index.html，复用 demos/_shared/ 的 IDE 骨架；
   `python3 site/tools/thumb.py <slug>` 出缩略图；然后在这里把对应条目的 view 改成 'ready'、补 href 与 thumb。
   ===================================================================== */
window.DEVECO_CATALOG = {
  updated: '2026-09-14',
  title: '鸿蒙开发工具体验 · 工作台',
  lede: '围绕 DevEco Studio / DevEco Code / DevEco CLI 的体验设计工作台：21 条创新点各一个可点的界面稿 demo，加上设计系统、分析与汇报材料。全部是本地静态文件，双击即开。',

  /* 一年节奏，来自《创新方向》deck 的落地页。date 用于判断是否已过 */
  milestones: [
    { date: '2026-09-30', label: '9/30 · 发布 7.0' },
    { date: '2026-11-15', label: '11 月 · 创新方案汇报' },
    { date: '2026-12-15', label: '11–12 月 · BP 规划' },
    { date: '2026-12-30', label: '12/30 · 发布 7.1（融合方案随版本上线）' },
    { date: '2027-06-30', label: '2027-06 · 发布 8.0 · HDC 2027' },
  ],

  groups: [
    /* ================= 方向一 ================= */
    {
      id: 'basics',
      title: '基础易用性',
      icon: 'i-cat-basics',
      note: '把第一次上手、日常排查、发版前检查这几段路铺平——这一类不靠 AI，靠把界面和流程理顺。4 条。',
      items: [
        {
          no: '01', title: '工具栏自定义：界面跟着任务走', subtitle: 'Task-based Layout Presets', mark: '顺手做',
          desc: '按任务给三套预设（调试 / 审阅 / 多设备验证），切一次到位；在这套布局里挪过的面板，下次回来还在原处。不再开一个自定义面板把选择题抛回给用户。',
          view: 'ready', date: '2026-09-14', href: 'demos/01-layout-presets/index.html',
          tags: ['步数与切换次数'], thumb: { type: 'image', src: 'site/thumbs/01-layout-presets.jpg' },
        },
        {
          no: '02', title: '场景化应用体检', subtitle: 'Scenario App Check', mark: '投',
          desc: '按场景跑检查（上架自检 / 首次启动 / 低端机 / 无网弱网），改完代码当场跑；每条结论给到文件和行号，点一下落到那一行。把上架会被打回的问题提前到写代码的时候。',
          view: 'sketch',
          tags: ['步数与切换次数'], note: '第二批：上架问题提前暴露',
        },
        {
          no: '03', title: '调优：从「症状」进入，AI 修复闭环', subtitle: 'Symptom-first Tuning Loop', mark: '投',
          desc: '从「卡了 / 耗电 / 启动慢」进入，指标画成看得懂的图；AI 出补丁可逐条审、可退回；改完自动在真机重跑同一条记录，给前后对比。全行业停在「帮你找问题」，没人做「帮你确认这一下有没有用」。',
          view: 'ready', date: '2026-09-14', href: 'demos/03-symptom-tuning/index.html',
          tags: ['步数与切换次数', '审阅与回退'], note: '空位是立论支点，建议实机复现一次再对外讲', thumb: { type: 'image', src: 'site/thumbs/03-symptom-tuning.jpg' },
        },
        {
          no: '04', title: '安卓应用一键转化', subtitle: 'Android → ArkTS Migration', mark: '投',
          desc: '按屏、按模块一块一块迁，产出原生 ArkTS 不做兼容层；转出来的代码在工程树上标「已转 / 待查 / 需人工」；安卓版改了需求，列出鸿蒙版还差哪些没跟上。真空位在一键之后。',
          view: 'sketch',
          tags: ['步数与切换次数'], note: '连着产品线一起排',
        },
      ],
    },

    /* ================= 方向二 ================= */
    {
      id: 'ai',
      title: 'AI 辅助开发',
      icon: 'i-cat-ai',
      note: '这一类竞争最挤。七家都在解「让 AI 干得更多」，没人解「人对这一串过程能不能看清楚、挑着退回去」——十条里的空位集中在这儿。',
      items: [
        {
          no: '05', title: 'Inline-chat 覆盖更多场景：UI、Code、md', subtitle: 'Inline Chat · Code / Preview / Markdown', mark: '半投',
          desc: '选中一段就地问、就地改。代码里的是标配；扩到界面预览上选中元素直接说，扩到 README、接口说明、上架材料这些 Markdown 文档里就地改——文档这一格一家都没做。',
          view: 'ready', date: '2026-09-14', href: 'demos/05-inline-chat-everywhere/index.html',
          tags: ['步数与切换次数'], note: '补齐，并进日常迭代', thumb: { type: 'image', src: 'site/thumbs/05-inline-chat-everywhere.jpg' },
        },
        {
          no: '06', title: 'Voice coding：语音开发模式', subtitle: 'Voice Coding Loop', mark: '补齐',
          desc: '先做「把需求说出来」，按编程词汇调优识别，把项目名、分支名、符号名加进识别提示；更远是语音闭环：AI 把结果读回来，用嘴确认或纠偏，全程手不离设备。',
          view: 'ready', date: '2026-09-14', href: 'demos/06-voice-coding/index.html',
          tags: ['步数与切换次数'], note: '补齐，并进日常迭代', thumb: { type: 'image', src: 'site/thumbs/06-voice-coding.jpg' },
        },
        {
          no: '07', title: 'Agent Team：在干 / 在等你 / 干完了', subtitle: 'Agent Task Tiers', mark: '投',
          desc: '几件活同时交给 AI，状态分三档一眼看全；排队时说清排第几、还要等多久、能不能取消。不加新的会话列表，缺的是分档。这是全清单里唯一一处三样证据齐全的空位。',
          view: 'ready', date: '2026-09-14', href: 'demos/07-agent-team/index.html',
          tags: ['等待可见'], note: '第一批：成本最低、证据最硬', thumb: { type: 'image', src: 'site/thumbs/07-agent-team.jpg' },
        },
        {
          no: '08', title: 'AI 输出内容压缩：结论先行', subtitle: 'Conclusion-first Replies', mark: '半投',
          desc: '回复先说结论，过程收起来可展开；报错、安全警告、危险操作确认永远完整显示不压；历史侧自动摘要与手动压缩，并让人看得到是谁占了空间。',
          view: 'ready', date: '2026-09-14', href: 'demos/08-answer-compression/index.html',
          tags: ['审阅与回退'], thumb: { type: 'image', src: 'site/thumbs/08-answer-compression.jpg' },
        },
        {
          no: '09', title: '可视化编程：画布与代码并排', subtitle: 'Canvas ⇄ Code', mark: '投',
          desc: '画布上摆控件、连关系、调参数，直接出能跑的界面；画布和代码是同一份东西的两种看法，改任一边另一边跟着变；逻辑编排也能画。七家都没有「连线做业务逻辑」。',
          view: 'ready', date: '2026-09-14', href: 'demos/09-visual-programming/index.html',
          tags: ['步数与切换次数'], thumb: { type: 'image', src: 'site/thumbs/09-visual-programming.jpg' },
        },
        {
          no: '10', title: '可视化调优：图上一处异常，直接落到代码行', subtitle: 'Visual Profiling', mark: '半投',
          desc: '把指标画成看得懂的图，点进去直接落到代码行；和 03 连成闭环：症状进入 → 看图定位 → AI 出补丁 → 自动复测前后对比。看图这一半是补齐，价值在于它是 03 的前半段。',
          view: 'sketch',
          tags: ['步数与切换次数'],
        },
        {
          no: '11', title: '互动式意图确认：问你的时候它不停', subtitle: 'Confirm Without Stopping', mark: '补齐',
          desc: '动手前把理解的意思摆出来让人确认或直接改，问题给选项也能自己写；关键是确认的时候它不停下来——边等回答边继续读文件。Cursor 是问了不停，我们现在是停了不说。',
          view: 'ready', date: '2026-09-14', href: 'demos/11-intent-confirm/index.html',
          tags: ['审阅与回退'], note: '补齐，并进日常迭代；与 07 是同一个题', thumb: { type: 'image', src: 'site/thumbs/11-intent-confirm.jpg' },
        },
        {
          no: '12', title: '自动化 Workflow：不用你想起来要固化', subtitle: 'Proactive Workflow Capture', mark: '半投',
          desc: '工具自己看出重复，主动问「这串动作你这周跑了三次，存成一个命令？」；存的是整串编排，随代码仓库分发给团队；鸿蒙开发里的高频动作由官方先存好一批。',
          view: 'ready', date: '2026-09-14', href: 'demos/12-auto-workflow/index.html',
          tags: ['步数与切换次数'], thumb: { type: 'image', src: 'site/thumbs/12-auto-workflow.jpg' },
        },
        {
          no: '13', title: 'UI & Code 二次编辑：预览上改，写回源码', subtitle: 'Preview-to-Source Round Trip', mark: '投',
          desc: '在预览上直接拖、直接改，改动确定写回源码，不让 AI 去猜；改代码预览立刻跟着变这一半已有，补的是反方向；改动落到源码哪一行人能看见。声明式界面这一代全行业空着。',
          view: 'sketch',
          tags: ['步数与切换次数'],
        },
        {
          no: '14', title: 'AI 协作时间轴：刻度是执行步骤，能挑着退', subtitle: 'Step-level Timeline & Rewind', mark: '补齐',
          desc: '时间轴的刻度落在 AI 自己的执行步骤上，每一步改了什么、对应计划里哪一条绑在一起；能挑着退：只退掉第三步，保留第四第五步。',
          view: 'ready', date: '2026-09-14', href: 'demos/14-ai-timeline/index.html',
          tags: ['审阅与回退'], note: '补齐，并进日常迭代；21 跟着它一起做', thumb: { type: 'image', src: 'site/thumbs/14-ai-timeline.jpg' },
        },
      ],
    },

    /* ================= 方向三 ================= */
    {
      id: 'harmony',
      title: '鸿蒙特征 / 首发',
      icon: 'i-cat-harmony',
      note: '没有对标，因为别人没有这个题——多形态、分布式、一次开发多端部署，只有我们手里有。做错了没人提醒，每条都要自己把判断规则定下来。7 条。',
      items: [
        {
          no: '15', title: '一多联动＋跨端开发：任务状态跟着人走', subtitle: 'Task State Follows You', mark: '投',
          desc: '任务状态在 PC、平板、手表、手机之间同步：连着哪几台、断点在哪、日志看到哪、AI 执行到第几步，换一端接上就是原样；每一端只承担适合的那部分，手表和手机也是能发指令的开发端。',
          view: 'sketch',
          tags: ['步数与切换次数', '等待可见'], note: '连着产品线一起排',
        },
        {
          no: '16', title: '真机多设备：差异并排，替你圈出来', subtitle: 'Multi-device Diff Verdict', mark: '投',
          desc: '一次改动自动在几种真机形态上各跑一遍，差异截图并排；核心在「判断」：哪些差异是一多适配的正常结果、哪些是缺陷，这套规则要我们自己定。并排的是不同真机，不是一台的几种状态。',
          view: 'sketch',
          tags: ['步数与切换次数', '审阅与回退'], note: '第二批：差异化最高',
        },
        {
          no: '17', title: '模拟器 · 单屏多设备切换', subtitle: 'Multi-device Canvas', mark: '投',
          desc: '一块画布，手机 / 折叠屏 / 手表 / 车机几块屏同时在，本机与远端不分家；改一次代码，几块屏一起刷。并排的是不同形态，不是同一形态的几台机器。是 16 的支撑层。',
          view: 'ready', date: '2026-09-14', href: 'demos/17-multi-device-canvas/index.html',
          tags: ['步数与切换次数'], note: '第二批', thumb: { type: 'image', src: 'site/thumbs/17-multi-device-canvas.jpg' },
        },
        {
          no: '18', title: '模拟器 · 分布式调试', subtitle: 'Distributed Debug Timeline', mark: '投',
          desc: '两端日志按同一条时间轴对齐，交接那一下画出来；断点同时管住两端，一端停另一端也停在对应位置；给出判断：这一次是哪一端出的问题、卡在交接的第几步。',
          view: 'sketch',
          tags: ['步数与切换次数', '审阅与回退'], note: '对齐两端时钟有技术前提，需与调试服务侧确认',
        },
        {
          no: '19', title: '模拟器 · 远端调试', subtitle: 'Remote Device into Canvas', mark: '搭车',
          desc: '手边没有的手表、车机也能拿过来调：远端设备直接进同屏画布，按钮是「加进画布」不是「连接」；拿过来之后能接着做分布式联调；再往后是 CI 与第三方工具可远程调用的服务。',
          view: 'sketch',
          tags: ['步数与切换次数'], note: '跟着 17 一起做；对我们是追平不是首发',
        },
        {
          no: '20', title: '模拟器 · 连接状态体验创新', subtitle: 'Connection as Five Visible Steps', mark: '投',
          desc: '把连接拆成看得见的几步：认出设备 → 授权 → 建立通道 → 版本匹配 → 就绪，当前卡在第几步标出来；每一步失败给一个能当场做的动作，不是错误码；等待有进度，不是一个转圈。',
          view: 'ready', date: '2026-09-14', href: 'demos/20-connect-status/index.html',
          tags: ['等待可见'], note: '第一批：成本最低，新人第一印象在这里定', thumb: { type: 'image', src: 'site/thumbs/20-connect-status.jpg' },
        },
        {
          no: '21', title: '智慧胶囊：状态栏上常驻的一小块', subtitle: 'Status-bar Capsule', mark: '搭车',
          desc: '状态栏一枚胶囊，最多两枚，「在等你」的排前面带蓝点，点开才展开面板；先只让正在跑的 Agent 任务（含排队）上胶囊；准入规则先立起来：正在进行、有明确起止、人自己发起、需要持续关注。',
          view: 'ready', date: '2026-09-14', href: 'demos/21-capsule/index.html',
          tags: ['等待可见'], note: '第一批；跟着 14 AI 协作时间轴一起做', thumb: { type: 'image', src: 'site/thumbs/21-capsule.jpg' },
        },
      ],
    },

    /* ================= 支撑 ================= */
    {
      id: 'system',
      title: '设计系统与规范',
      icon: 'i-cat-chip',
      note: '所有 demo 背后的同一套 token 与组件，色值逐 key 取自 DevEco Studio 6.0.2 安装包的主题文件。',
      items: [
        {
          title: 'DevEco Studio Windows 主窗口', subtitle: 'DevEco Studio · Windows Main Window',
          desc: '基于 IntelliJ Int UI 的整页界面稿，也是 21 个 demo 共用的 IDE 外壳：Header、工具窗、编辑器、CodeGenie 面板、构建 / 终端、状态栏。三主题可切，树、标签页、弹层、AI 问答都能点。',
          view: 'ready', date: '2026-09-09', href: 'deveco-intui-kit/demo/index.html',
          links: [{ label: '单文件版', href: 'deveco-intui-kit/dist/deveco-main-window.html' }, { label: 'demo 共享骨架', href: 'demos/_shared/frame.js' }],
          tags: ['Int UI', 'IntelliJ 243', '三主题'], thumb: { type: 'image', src: 'site/thumbs/studio.jpg' },
        },
        {
          title: 'Int UI 组件库与 Token 规范页', subtitle: 'Int UI Components & Design Tokens',
          desc: '调色板、语义 token、字号阶梯、尺寸与间距、组件画廊、编辑器语法色、CSS 变量清单，以及每个 token 的来源与已知局限。',
          view: 'ready', date: '2026-09-09', href: 'deveco-intui-kit/docs/index.html',
          links: [{ label: '单文件版', href: 'deveco-intui-kit/dist/intui-tokens-docs.html' }, { label: 'tokens.json', href: 'deveco-intui-kit/tokens/tokens.json' }, { label: '来源对照', href: 'deveco-intui-kit/tokens/SOURCES.md' }],
          tags: ['token', '组件画廊'], thumb: { type: 'image', src: 'site/thumbs/int-ui-docs.jpg' },
        },
        {
          title: 'Kit 使用说明', subtitle: 'deveco-intui-kit · README',
          desc: '目录结构、怎么改配色 / 组件 / 图标、怎么打包成单文件、数据从哪来、还有哪些没取到。',
          view: 'doc', date: '2026-09-09', href: 'deveco-intui-kit/README.md',
          tags: ['README'], thumb: { type: 'doc', kind: 'README' },
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
          title: 'DevEco 生态位与体验舆情', subtitle: 'DevEco Ecosystem Position & Sentiment',
          desc: '外部事实、DevEco 家族的版本节奏、开发者原声（IDE 内 / IDE 外）、同行 2026 年把 IDE 做成了什么、从舆情到动作的三个同心圆、1100 万注册开发者里的七类人群与漏斗。',
          view: 'doc', date: '2026-09-03', href: 'deveco-ecosystem-sentiment.html',
          tags: ['舆情', '开发者原声', '同行对照'], thumb: { type: 'image', src: 'site/thumbs/sentiment.jpg' },
        },
        {
          title: '鸿蒙开发者生态与开发工具态势分析（2026-09）', subtitle: 'HarmonyOS Developer Ecosystem Report',
          desc: 'HDC 2026 生态基本盘、HarmonyOS 7 的 Agent 方向、开发工具矩阵（Studio / CodeGenie / Code / CLI / 官网）、五条判断与第一版计划骨架、需要内部核实的问题。',
          view: 'doc', date: '2026-09-03', href: '鸿蒙开发者生态分析_2026-09_1.md',
          tags: ['HDC 2026', '工具矩阵'], thumb: { type: 'doc', kind: 'MD' },
        },
      ],
    },
    {
      id: 'materials',
      title: '汇报材料与结构',
      icon: 'i-cat-book',
      note: '21 条创新点的出处是《创新方向》deck；总体材料的骨架与框架版胶片也在这里。',
      items: [
        {
          title: '鸿蒙开发工具 · 创新方向（2026-09-13）', subtitle: 'Innovation Directions Deck · 62 slides',
          desc: '三个方向 21 条创新点，一条两页：先讲场景与别人做到哪，再讲我们怎么做。附体验评估策略（四个指标各自怎么测）、落地节奏、资产与来源局限。这个工作台上所有 demo 的出处。',
          view: 'doc', date: '2026-09-13', href: '鸿蒙开发工具_创新方向_20260913.pptx',
          tags: ['PPTX', '21 条创新点', '对标七家'], thumb: { type: 'doc', kind: 'PPTX' },
        },
        {
          title: '总体材料结构 · 思维导图', subtitle: 'Master Narrative · Mind Map',
          desc: '四条业务线、今年三个变化、融合方案（KIT + TUI + IDE）、体验设计七项、创新机会点七条、风险四条与团队组成。',
          view: 'doc', date: '2026-09-09', href: '思维导图_总体材料结构.svg',
          links: [{ label: '大纲 (md)', href: '思维导图_总体材料结构.md' }, { label: 'OPML', href: '思维导图_总体材料结构.opml' }],
          tags: ['思维导图'], thumb: { type: 'image', src: 'site/thumbs/mindmap.png' },
        },
        {
          title: '鸿蒙开发工具体验 · 总体材料（框架版 202609）', subtitle: 'Master Deck · Framework Draft',
          desc: '汇报胶片的框架版。下载后用 PowerPoint / WPS 打开。',
          view: 'doc', date: '2026-09-09', href: '鸿蒙开发工具体验_总体材料_框架版_202609_1.pptx',
          tags: ['PPTX', '4.6 MB'], thumb: { type: 'doc', kind: 'PPTX' },
        },
        {
          title: '鸿蒙开发工具接手思路', subtitle: 'Transition Notes',
          desc: '判断、可直接迁移的存量资产（TUI 设计系统、设计直出代码、交付流水线、体验治理）、接手后的主攻方向、期望与建议。',
          view: 'doc', date: '2026-09-03', href: '鸿蒙开发工具接手思路.md',
          tags: ['接手思路'], thumb: { type: 'doc', kind: 'MD' },
        },
      ],
    },
  ],
};
