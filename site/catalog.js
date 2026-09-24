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
     mark     deck 里的标记：投 | 半投 | 补齐 | 搭车 | 顺手做（可省略；只进搜索，卡片上不显示）
     view     'ready' 可体验（有实际界面可点） · 'doc' 文档（读的东西） · 'sketch' 原型（还没做，占位）
     date     最近更新 YYYY-MM-DD，可省略
     href     点卡片打开的相对路径；sketch 没有 href
     links    次要链接 [{label, href}]
     tags     小标签（这里放主要改善的指标）
     note     一行补充（放在卡片底部灰字），例如排期批次
     key      规划重点：写上它承接的是哪一个规划点（字符串）。卡片会打「重点」角标、描边，
              左侧导航多一个「规划重点」筛选；在所属分类里自动排到最前
     thumb    {type:'image', src:'site/thumbs/xxx.jpg'} 真实截图
              {type:'doc', kind:'MD'|'PPTX'|'BUNDLE'|'README'} 文档骨架预览
              {type:'sketch'} 或省略 → 按 view 自动兜底

   新 demo 的约定：放在 demos/<slug>/index.html，复用 demos/_shared/ 的 IDE 骨架；
   `python3 site/tools/thumb.py <slug>` 出缩略图；然后在这里把对应条目的 view 改成 'ready'、补 href 与 thumb。
   ===================================================================== */
window.DEVECO_CATALOG = {
  updated: '2026-09-24',
  title: '鸿蒙开发工具体验',
  lede: '围绕 DevEco Studio / DevEco Code / DevEco CLI 的体验设计：27 条创新点各一个可点的界面稿 demo，其中 9 条是新一轮规划重点；加上设计系统、分析与汇报材料。全部是本地静态文件，双击即开。',

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
          desc: '按场景跑检查（上架自检 / 首次启动 / 低端机 / 无网弱网），改完代码当场跑；每条结论给到文件和行号，点一下落到那一行。把上架会被打回的问题提前到写代码的时候。新增用户旅程：一句话拆成步骤和断言，在模拟器上逐步跑，失败给截图对比、HiLog 与代码行，可转修复任务或加进上架自检。',
          view: 'ready', date: '2026-09-24', href: 'demos/02-scene-check/index.html',
          tags: ['步数与切换次数'], note: '第二批：上架问题提前暴露', thumb: { type: 'image', src: 'site/thumbs/02-scene-check.jpg' },
        },
        {
          no: '03', title: '调优：从「症状」进入，AI 修复闭环', subtitle: 'Symptom-first Tuning Loop', mark: '投',
          desc: '从「卡了 / 耗电 / 启动慢」进入，指标画成看得懂的图；AI 出补丁可逐条审、可退回；改完自动在真机重跑同一条记录，给前后对比。差异在从症状进、AI 出补丁、真机按同一条操作路径自动复测并判显著性。新增内存泄漏：自动进出页面画出上涨曲线和泄漏链；最重调用栈落到代码行；改前改后各跑 5 次判断改善是否显著。',
          view: 'ready', date: '2026-09-24', href: 'demos/03-symptom-tuning/index.html',
          tags: ['步数与切换次数', '审阅与回退'], note: '空位是立论支点，建议实机复现一次再对外讲', thumb: { type: 'image', src: 'site/thumbs/03-symptom-tuning.jpg' },
        },
        {
          no: '04', title: '安卓应用一键转化', subtitle: 'Android → ArkTS Migration', mark: '投',
          desc: '按屏、按模块一块一块迁，产出原生 ArkTS 不做兼容层；转出来的代码在工程树上标「已转 / 待查 / 需人工」；安卓版改了需求，列出鸿蒙版还差哪些没跟上。真空位在一键之后。',
          view: 'ready', date: '2026-09-14', href: 'demos/04-android-migration/index.html',
          tags: ['步数与切换次数'], note: '连着产品线一起排', thumb: { type: 'image', src: 'site/thumbs/04-android-migration.jpg' },
        },
      ],
    },

    /* ================= 方向二 ================= */
    {
      id: 'ai',
      title: 'AI 辅助开发',
      icon: 'i-cat-ai',
      note: '这一类竞争最挤。七家都在解「让 AI 干得更多」，没人解「人对这一串过程能不能看清楚、挑着退回去」——十一条里的空位集中在这儿。',
      items: [
        {
          no: '05', title: '就地对话：从编辑器长进 Build、Debug、HiLog', subtitle: 'Inline AI · Editor / Build / Debug / HiLog', mark: '半投', key: 'AI 和 IDE 的深度融合',
          desc: '选中一段就地问、就地改，覆盖代码、界面预览和 Markdown 文档。新增 AI 与 IDE 深度融合：Build 失败时在 Build 面板里读完 hvigor 报错，一键补权限并重建成功；断点停下时在变量旁回答「为什么是 undefined」并加条件断点；HiLog 里选中崩溃栈就解释并跳到代码；回答里的按钮直接调试到设备、打开 Profiler，不用去找菜单。新增下一处编辑预测：改一处类型，文件里其余要跟着改的位置一起给出，Tab 逐处接受，可跨文件，本机模型离线也能用。',
          view: 'ready', date: '2026-09-24', href: 'demos/05-inline-chat-everywhere/index.html',
          tags: ['步数与切换次数'], note: '补齐，并进日常迭代', thumb: { type: 'image', src: 'site/thumbs/05-inline-chat-everywhere.jpg' },
        },
        {
          no: '06', title: 'Voice coding：语音开发模式', subtitle: 'Voice Coding Loop', mark: '补齐',
          desc: '先做「把需求说出来」，按编程词汇调优识别，把项目名、分支名、符号名加进识别提示；更远是语音闭环：AI 把结果读回来，用嘴确认或纠偏，全程手不离设备。',
          view: 'ready', date: '2026-09-14', href: 'demos/06-voice-coding/index.html',
          tags: ['步数与切换次数'], note: '补齐，并进日常迭代', thumb: { type: 'image', src: 'site/thumbs/06-voice-coding.jpg' },
        },
        {
          no: '07', title: 'Agent Team：多 Agent 分工、交接与冲突合并', subtitle: 'Multi-agent Team · Handoff & Merge', mark: '投', key: '多 Agent、Agent team',
          desc: '一件大活由主 Agent 拆给规划、UI、逻辑、测试、真机验证五个子 Agent：看板上看每人在干什么、谁等谁的交接连线、两个 Agent 同改一个文件的冲突与合并选择；要人拍板的点汇总进「在等你」，批准后沿连线交接到下一角色，直到真机验证通过。原有的「在干 / 在等你 / 干完了」三档与排队可见继续保留。',
          view: 'ready', date: '2026-09-23', href: 'demos/07-agent-team/index.html',
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
          desc: '把指标画成看得懂的图，点进去直接落到代码行；和 03 连成闭环：症状进入 → 看图定位 → AI 出补丁 → 自动复测前后对比。看图这一半是补齐，价值在于它是 03 的前半段。新增并发视图：主线程等 TaskPool、任务排队、锁竞争自动标出，点一段落到代码行，结论可交给 03 出补丁。',
          view: 'ready', date: '2026-09-24', href: 'demos/10-visual-profiling/index.html',
          tags: ['步数与切换次数'], thumb: { type: 'image', src: 'site/thumbs/10-visual-profiling.jpg' },
        },
        {
          no: '11', title: '互动式意图确认：问你的时候它不停', subtitle: 'Confirm Without Stopping', mark: '补齐',
          desc: '动手前把理解的意思摆出来让人确认或直接改，问题给选项也能自己写；关键是确认的时候它不停下来——边等回答边继续读文件。Cursor 是问了不停，我们现在是停了不说。新增 Build / Goal / Plan 三种工作方式；Plan 先出能拖动、增删的计划，边写边读文件，执行时逐项打勾、标出偏离。',
          view: 'ready', date: '2026-09-24', href: 'demos/11-intent-confirm/index.html',
          tags: ['审阅与回退'], note: '补齐，并进日常迭代；与 07 是同一个题', thumb: { type: 'image', src: 'site/thumbs/11-intent-confirm.jpg' },
        },
        {
          no: '12', title: '自动化 Workflow：不用你想起来要固化', subtitle: 'Proactive Workflow Capture', mark: '半投',
          desc: '工具自己看出重复，主动问「这串动作你这周跑了三次，存成一个命令？」；存的是整串编排，随代码仓库分发给团队；鸿蒙开发里的高频动作由官方先存好一批。',
          view: 'ready', date: '2026-09-14', href: 'demos/12-auto-workflow/index.html',
          tags: ['步数与切换次数'], thumb: { type: 'image', src: 'site/thumbs/12-auto-workflow.jpg' },
        },
        {
          no: '13', title: '设计稿到代码、模拟器上直接改，全部写回源码', subtitle: 'D2C · Live Emulator Edit · Round Trip', mark: '投', key: 'D2C、模拟器直接修改与调试',
          desc: '导入 Figma / 即时设计 / MasterGo 画板生成 ArkTS 页面，悬停图层时设计稿、预览、代码行一起亮，并标出复用组件、资源 token、新建组件；在运行中的模拟器上点元素直接改文字、间距、颜色，热重载后写回源码行；看运行态组件树与状态变量，在事件上加断点。原有「预览上拖、写回源码」保留。新增一句话改界面（选中组件出 diff）、一键生成多状态 @Preview、对照设计稿圈差异一键修正。',
          view: 'ready', date: '2026-09-24', href: 'demos/13-ui-code-roundtrip/index.html',
          tags: ['步数与切换次数'], thumb: { type: 'image', src: 'site/thumbs/13-ui-code-roundtrip.jpg' },
        },
        {
          no: '14', title: 'AI 协作时间轴：刻度是执行步骤，能挑着退', subtitle: 'Step-level Timeline & Rewind', mark: '补齐',
          desc: '时间轴的刻度落在 AI 自己的执行步骤上，每一步改了什么、对应计划里哪一条绑在一起；能挑着退：只退掉第三步，保留第四第五步。',
          view: 'ready', date: '2026-09-14', href: 'demos/14-ai-timeline/index.html',
          tags: ['审阅与回退'], note: '补齐，并进日常迭代；21 跟着它一起做', thumb: { type: 'image', src: 'site/thumbs/14-ai-timeline.jpg' },
        },
        {
          no: '29', title: '多语言：让 Agent 做本地化', subtitle: 'Agent-driven Localization · Review, Plurals & RTL',
          desc: '在 DevEco Code 说一句「加英文和阿拉伯语」，Agent 扫出 42 条字符串（含 3 处硬编码），抽成 $r 资源，补齐 en_US / ar 的 string.json 与 plural.json。审阅时每条都带页面截图上下文，复数按各语言规则分开；改了风格指南或术语表，只重译受影响的条目。切到阿拉伯语看 RTL 镜像，自动标出没镜像的图标和被截断的文案，一键修复后应用到工程。',
          view: 'ready', date: '2026-09-24', href: 'demos/29-agent-localization/index.html',
          tags: ['审阅与回退'], note: '对照友商 2026 年新增的 Agent 本地化能力补齐', thumb: { type: 'image', src: 'site/thumbs/29-agent-localization.jpg' },
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
          desc: '这一组 7 条都是「一次开发、多端」，但各管一段：这条管开发者自己——任务状态在 PC、平板、手表、手机之间同步，连着哪几台、断点在哪、日志看到哪、AI 执行到第几步，换一端接上就是原样；手表和手机也是能发指令的开发端。是后面几条的前提：人换设备，开发状态不丢。',
          view: 'ready', date: '2026-09-14', href: 'demos/15-cross-device-handoff/index.html',
          tags: ['步数与切换次数', '等待可见'], note: '连着产品线一起排', thumb: { type: 'image', src: 'site/thumbs/15-cross-device-handoff.jpg' },
        },
        {
          no: '16', title: '真机多设备：差异并排，替你圈出来', subtitle: 'Multi-device Diff Verdict', mark: '投',
          desc: '这条管的是被开发的 App 在真机上一不一致：一次改动自动在几种真机形态上各跑一遍，差异截图并排；核心在「判断」：哪些差异是一多适配的正常结果、哪些是缺陷，这套规则要我们自己定。并排的是不同真机，不是一台的几种状态——跟 17 的区别是这条在真机上验证结果，17 在模拟器里先发现问题。',
          view: 'ready', date: '2026-09-14', href: 'demos/16-multi-device-verify/index.html',
          tags: ['步数与切换次数', '审阅与回退'], note: '第二批：差异化最高', thumb: { type: 'image', src: 'site/thumbs/16-multi-device-verify.jpg' },
        },
        {
          no: '17', title: '模拟器多端：鸿蒙特征 · 跨屏 · 手势', subtitle: 'Multi-device Canvas · HarmonyOS Traits', mark: '投', key: '模拟器多端：鸿蒙特征、跨屏、手势',
          desc: '一块画布，手机 / 折叠屏 / 平板 / 手表 / 车机同时在，改一行代码几块屏一起刷。新增鸿蒙特征模拟：选中设备切折叠屏展开 / 悬停 / 折叠、手机分屏与悬浮窗、深色与字号；手势模拟（侧滑返回、双指捏合、三指截屏、隔空抓取）在屏上画出轨迹与结果；手机上的商品卡拖到或一键流转到平板、折叠屏，画出跨屏连线与耗时。是 16 真机判断之前的一步，也是 18、19、27 的底座。',
          view: 'ready', date: '2026-09-23', href: 'demos/17-multi-device-canvas/index.html',
          tags: ['步数与切换次数'], note: '第二批', thumb: { type: 'image', src: 'site/thumbs/17-multi-device-canvas.jpg' },
        },
        {
          no: '18', title: '模拟器 · 分布式调试', subtitle: 'Distributed Debug Timeline', mark: '投',
          desc: '接着 17 的画布往深处走一步——不只是看几块屏，还要管两端联调：两端日志按同一条时间轴对齐，交接那一下画出来；断点同时管住两端，一端停另一端也停在对应位置；给出判断：这一次是哪一端出的问题、卡在交接的第几步。',
          view: 'ready', date: '2026-09-14', href: 'demos/18-distributed-debug/index.html',
          tags: ['步数与切换次数', '审阅与回退'], note: '对齐两端时钟有技术前提，需与调试服务侧确认', thumb: { type: 'image', src: 'site/thumbs/18-distributed-debug.jpg' },
        },
        {
          no: '19', title: '模拟器 · 远端调试', subtitle: 'Remote Device into Canvas', mark: '搭车',
          desc: '还是 17 那块画布，补一种设备来源：手边没有的手表、车机也能拿过来调——远端设备直接进同屏画布，按钮是「加进画布」不是「连接」；拿过来之后能接着做 18 的分布式联调；再往后是 CI 与第三方工具可远程调用的服务。',
          view: 'ready', date: '2026-09-14', href: 'demos/19-remote-device/index.html',
          tags: ['步数与切换次数'], note: '跟着 17 一起做；对我们是追平不是首发', thumb: { type: 'image', src: 'site/thumbs/19-remote-device.jpg' },
        },
        {
          no: '20', title: '模拟器 · 连接状态体验创新', subtitle: 'Connection as Five Visible Steps', mark: '投',
          desc: '这条不管画布里连上之后的事，管「连上」这一步本身——17/19 里设备要先连上才能进画布，这条把连接拆成看得见的几步：认出设备 → 授权 → 建立通道 → 版本匹配 → 就绪，当前卡在第几步标出来；每一步失败给一个能当场做的动作，不是错误码；等待有进度，不是一个转圈。新增设备中心：五类设备一张表，连接中看五步、就绪看电量与崩溃；一键打包诊断，崩溃在同型号云端或远端真机回放复现。',
          view: 'ready', date: '2026-09-24', href: 'demos/20-connect-status/index.html',
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

    /* ================= 规划重点 · 新方向 ================= */
    {
      id: 'open',
      title: '开放生态',
      icon: 'i-cat-open',
      note: '规划重点里新增的一类。38+ 家头部公司有自己的 IDE 和 Agent，不会换工具——那就把门开出去：编译、签名、真机、上架这段通用 Agent 做不到的能力，做成 MCP、Skill 与插件，用在别人的工具里。2 条。',
      items: [
        {
          no: '23', title: '开放 MCP 与 Skill：把真机这段开给外部 Agent', subtitle: 'DevEco MCP Server & Skills', key: 'DevEco Code / Studio 开放 MCP、Skill',
          desc: '把构建、签名、装机、截图、HiLog、性能采集、上架自检做成 MCP 工具，逐项可开关，敏感项调用时在 IDE 里弹授权；Claude Code、Cursor 等外部客户端一键接入，调用过程实时可见。官方鸿蒙 Skill 包可装进项目，也能导出给其他 Agent。新增模型来源（内置 / 自带 Key / 本地离线，按场景指定）、技能按任务自动调入、MCP 一键安装市场、按工具授权与可撤销的授权记录。',
          view: 'ready', date: '2026-09-24', href: 'demos/23-mcp-skill-open/index.html',
          tags: ['步数与切换次数'], note: '对标 Xcode 27 mcpbridge；DevEco CLI 已有 serve mcp', thumb: { type: 'image', src: 'site/thumbs/23-mcp-skill-open.jpg' },
        },
        {
          no: '24', title: '插件化开放：模拟器、调测、调优拆成插件', subtitle: 'Pluggable Tools & Implicit Extension Points', key: '插件 + 第三方工具（隐性开放）',
          desc: '模拟器、HiLog 与断点调测、Profiler 调优拆成独立插件，装进 DevEco Studio，也能装进 VS Code、Cursor；第三方工具不开独立入口，挂到 IDE 已有的扩展点上（设备菜单、Profiler 页签、日志过滤），用起来像 IDE 自带，来源可追溯。',
          view: 'ready', date: '2026-09-23', href: 'demos/24-plugin-open/index.html',
          tags: ['步数与切换次数'], thumb: { type: 'image', src: 'site/thumbs/24-plugin-open.jpg' },
        },
      ],
    },
    {
      id: 'lite',
      title: '轻量与云端',
      icon: 'i-cat-cloud',
      note: '规划重点里新增的一类。IDE 大、不够轻量，模拟器吃内存——把「想验证一下」的门槛降下来：手机上说一句就调、浏览器里打开就跑、模拟器放到云端多开。3 条。',
      items: [
        {
          no: '25', title: '手机客户端：对话直接真机调试', subtitle: 'Debug on the Phone in Your Hand', key: '手机客户端：对话直接真机调试',
          desc: '手里的手机就是真机：在手机上的 DevEco Code 里说一句「登录按钮点了没反应」，AI 在这台手机上装包、自动复现、抓 HiLog、定位到代码行、出补丁，应用后重装再点一遍给前后对比。不用回到电脑前。和 15 的区别：15 接续进度，这条手机本身就是调试入口。',
          view: 'ready', date: '2026-09-23', href: 'demos/25-phone-client-debug/index.html',
          tags: ['步数与切换次数', '等待可见'], thumb: { type: 'image', src: 'site/thumbs/25-phone-client-debug.jpg' },
        },
        {
          no: '26', title: 'IDE Web：打开链接就能写、就能跑', subtitle: 'IDE Lite / Web · Quick Validation', key: 'IDE Lite / IDE Web',
          desc: '浏览器里的轻量 IDE：不装几个 GB、几秒可用；云端构建、云端模拟器出预览，改一行热更新；分享一个链接或二维码，别人在浏览器或真机上直接看；要完整能力时一键「在 DevEco Studio 中打开」，工程原样带过去。',
          view: 'ready', date: '2026-09-23', href: 'demos/26-ide-web-lite/index.html',
          tags: ['步数与切换次数', '等待可见'], thumb: { type: 'image', src: 'site/thumbs/26-ide-web-lite.jpg' },
        },
        {
          no: '27', title: '云端模拟器：本机不跑，云端多开', subtitle: 'Cloud Emulator · Multi-instance', key: '云端模拟器',
          desc: '一台本地模拟器吃掉几个 GB 内存，多开基本不可能。云端模拟器把算力放到云上，本机只收画面：手机、折叠屏、平板、手表并行启动，本机占用几乎不变；本机模拟器一键迁到云端释放内存；实例直接加进 17 的多设备画布。',
          view: 'ready', date: '2026-09-23', href: 'demos/27-cloud-emulator/index.html',
          tags: ['等待可见'], note: '17 多设备画布、19 远端设备的底座', thumb: { type: 'image', src: 'site/thumbs/27-cloud-emulator.jpg' },
        },
      ],
    },

    /* ================= 版本需求 ================= */
    {
      id: 'requirements',
      title: '版本需求',
      icon: 'i-cat-version',
      note: '不是创新方向 deck 里的假设点，是对着已有真机报告 / 已知问题提出的具体版本需求，直接对应一次迭代能排的活。',
      items: [
        {
          title: '冷启动分析报告：总览下钻，打分 + 时延瀑布 + 根因', subtitle: 'Cold Start Report · Overview to Root Cause',
          desc: '02 里「首次启动」体检项的深挖版：先总览——所有页面与操作按得分排序，默认只看「有问题」的几条，几十上百条时不用逐条翻；点进最差的一条下钻，看完整报告——总分与门槛对比、启动阶段拆成 5 段的时延瀑布、根因按影响耗时排序，每条给到方法与文件行号，点一下落到代码。原型对照的是「应用与元服务体检」真机报告：那边遇到主线程阻塞常给出「存在大量等待时间无法诊断」，这里换成能定位到具体方法的结论。',
          view: 'ready', date: '2026-09-18', href: 'demos/22-coldstart-report/index.html',
          links: [{ label: '单文件版', href: 'deveco-intui-kit/dist/coldstart-report.html' }],
          tags: ['步数与切换次数'], note: '对照真机体检报告提出的具体需求', thumb: { type: 'image', src: 'site/thumbs/22-coldstart-report.jpg' },
        },
        {
          title: '冻屏分析报告：先给判决，再给卷宗', subtitle: 'AppFreeze Report · Verdict First',
          desc: '同一份冻屏报告，结论、证据强度和时间线放到最前，证据折叠成清单。',
          view: 'ready', date: '2026-09-23', href: 'demos/28-appfreeze-report/index.html',
          links: [
            { label: '源码不可达版', href: 'demos/28-appfreeze-report/index.html#v1' },
            { label: '原始 · 源码不可达', href: 'analysis/appfreeze-report/input/v1-源码不可达-210435.html' },
            { label: '原始 · 源码可达', href: 'analysis/appfreeze-report/input/v2-源码可达-220705.html' },
            { label: '分析报告', href: 'analysis/appfreeze-report/REPORT-分析报告.html' },
          ],
          tags: ['步数与切换次数'], thumb: { type: 'image', src: 'site/thumbs/28-appfreeze-report.jpg' },
        },
      ],
    },

    /* ================= 版本走查 ================= */
    {
      id: 'walkthrough',
      title: '版本走查',
      icon: 'i-cat-check',
      note: '按版本对已上线 / 待发布的界面做体验走查：先按用户任务流把页面串起来，再逐页、逐步记问题，给出严重度与改法。',
      items: [
        {
          title: 'DevEco Code 26.0 融合版本 · 上线走查', subtitle: 'v26.0 Walkthrough · Install to First Use',
          desc: '从安装到使用：设置里从磁盘装插件 → 首次进入 → 一句话建工程写 PRD → 打开新建的工程。18 步、73 个问题，左图右文，问题直接框在截图上，悬停联动；附问题总表与待补页面。',
          view: 'doc', date: '2026-09-24', href: 'analysis/walkthrough-26.0/REPORT-走查报告.html',
          links: [{ label: '流程清单', href: 'analysis/walkthrough-26.0/flows.md' }, { label: '走查说明', href: 'analysis/walkthrough-26.0/README.md' }],
          tags: ['26.0', '走查', '从安装到使用', 'DevEco Code'], thumb: { type: 'image', src: 'site/thumbs/walkthrough-26.jpg' },
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
          title: 'DevEco Code Agent 输入框：场景与状态说明', subtitle: 'Agent Input Box · Scenarios & States',
          desc: '只管 Agent 面板输入框本身：九个场景按「触发条件 → 状态变化 → 反馈/边界」拆开——输入编辑、@ 上下文、/ 功能切换、模型与深度思考、语音输入、意图确认与计划预览、发送/生成中/终止、异常边界、快捷键。每组配一段设计依据与来源，末尾附已知局限。',
          view: 'doc', date: '2026-09-17', href: 'deveco-code-agent-input-states.html',
          tags: ['输入框', '状态详解', '9 个场景'], thumb: { type: 'image', src: 'site/thumbs/agent-input-states.jpg' },
        },
        {
          title: 'DevEco Studio 三端交互差异：鸿蒙电脑版 vs Windows / macOS', subtitle: 'HarmonyOS PC Edition vs IntelliJ-based Editions',
          desc: '自研底座的鸿蒙电脑版（毕方平台、Rust 编辑器、盘古与小艺原生）和 IntelliJ 底座的 Windows / macOS 版，在装、写、跑、调、AI、输入与多设备上逐项对照，附社区反馈；再把碰一碰、键鼠穿越、自由窗口、折叠屏与手写笔推成 14 个突破 IntelliJ 底座的机会点，每条标档位与人无我有 / 人有我优。',
          view: 'doc', date: '2026-09-24', href: 'analysis/deveco-platforms/REPORT-三端交互差异.html',
          tags: ['鸿蒙电脑', '三端对照', '机会点', '社区反馈'], thumb: { type: 'image', src: 'site/thumbs/deveco-platforms.jpg' },
        },
        {
          title: '冻屏分析报告：两版低保真的需求分析', subtitle: 'AppFreeze Report · Phase 1 Analysis',
          desc: '两份原始报告的需求分析：16 页报告 + Demo 优化提示词。',
          view: 'doc', date: '2026-09-23', href: 'analysis/appfreeze-report/REPORT-分析报告.html',
          links: [{ label: '优化提示词', href: 'analysis/appfreeze-report/PROMPT-Demo优化提示词.md' }, { label: '产品文档', href: 'analysis/appfreeze-report/product-doc.md' }],
          tags: ['冻屏', '需求分析', '优化提示词'],
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
      ],
    },
  ],
};
