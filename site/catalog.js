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
  lede: '围绕 DevEco Studio / DevEco Code / DevEco CLI 的体验设计：29 条创新点各一个可点的界面稿 demo（其中 9 条是新一轮规划重点），全部按鸿蒙电脑版蓝本与 AI Coding / 多 Agent 场景重做；加上设计系统、分析与汇报材料。全部是本地静态文件，双击即开。',

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
          desc: '布局跟着 Agent 走：它干活时看 DevEco Code 和本机应用，停下等你切到审阅，上真机验证摆好应用、手机镜像与 Profiler；多个 Agent 只跟最挡路的那件切，MateBook Fold 展开、悬停各记一套。',
          view: 'ready', date: '2026-09-25', href: 'demos/01-layout-presets/index.html',
          tags: ['步数与切换次数'], thumb: { type: 'image', src: 'site/thumbs/01-layout-presets.jpg' },
        },
        {
          no: '02', title: '场景化应用体检', subtitle: 'Scenario App Check', mark: '投',
          desc: '交给 Agent 按上架规则扫全工程、每条出补丁，机械改动默认勾上、文案与隐私用途标「要你看」；接受后在本机窗口回归，和别的 Agent 撞同一行先 rebase 再问。一句话旅程可在本机加碰一碰真机并行跑。',
          view: 'ready', date: '2026-09-25', href: 'demos/02-scene-check/index.html',
          tags: ['步数与切换次数'], note: '第二批：上架问题提前暴露', thumb: { type: 'image', src: 'site/thumbs/02-scene-check.jpg' },
        },
        {
          no: '03', title: '调优：从「症状」进入，AI 修复闭环', subtitle: 'Symptom-first Tuning Loop', mark: '投',
          desc: '说一句哪里卡或碰一下同事手机，Agent 读 trace 定位到 ArkTS 行并出补丁；接受后它独占那台手机用同一手势复测、各跑 5 次判显著，别的 Agent 装包排在后面。',
          view: 'ready', date: '2026-09-25', href: 'demos/03-symptom-tuning/index.html',
          tags: ['步数与切换次数', '审阅与回退'], note: '空位是立论支点，建议实机复现一次再对外讲', thumb: { type: 'image', src: 'site/thumbs/03-symptom-tuning.jpg' },
        },
        {
          no: '04', title: '安卓应用一键转化', subtitle: 'Android → ArkTS Migration', mark: '投',
          desc: '交给 Agent 在同一台鸿蒙电脑上并排回放安卓原版与鸿蒙版，找差异、按原版改并热重载验证；撞上功能 Agent 的改动和没有对应 Kit 的项进统一「在等你」队列由你定。',
          view: 'ready', date: '2026-09-25', href: 'demos/04-android-migration/index.html',
          tags: ['步数与切换次数'], note: '连着产品线一起排', thumb: { type: 'image', src: 'site/thumbs/04-android-migration.jpg' },
        },
      ],
    },

    /* ================= 方向二 ================= */
    {
      id: 'ai',
      title: 'AI 辅助开发',
      icon: 'i-cat-ai',
      note: '这一类竞争最挤。七家都在解「让 AI 干得更多」，没人解「人对这一串过程能不能看清楚、挑着退回去」——十二条里的空位集中在这儿。',
      items: [
        {
          no: '31', title: 'Agent 工作台：AI Coding 下，你真正看的是任务、决定、结果和证据', subtitle: 'Agent Workspace · Tasks, Decisions, Results & Evidence', key: '鸿蒙电脑版默认视图',
          desc: '默认视图不再是文件树 + 编辑器：左边是任务列表（多个 Agent 并行，各有状态），中间是当前任务（可改的计划、收起的步骤、置顶的「在等你」），右边是应用在鸿蒙电脑上原生运行的 sm / md / lg 多形态，Agent 在验哪台哪台上台。改动按风险排、只看需要你看的几处，每行标是哪个 Agent 写的；证据页签放构建、ArkTS 检查、多设备验证和滑动帧率改前改后。多 Agent 共用一个按阻塞排序的「在等你」队列，真机按租约排队、两个 Agent 撞到同一行时先停下问你。点改动行或结果上的元素才「接手」打开编辑器，你改一个值，Agent 接着你的改动继续；随时可切回经典编辑视图，同一个任务。',
          view: 'ready', date: '2026-09-25', href: 'demos/31-agent-workspace/index.html',
          links: [{ label: '设计说明', href: 'analysis/agent-workspace/README.md' }],
          tags: ['多 Agent', '默认视图'], note: '鸿蒙电脑版的默认视图蓝本，待确认后推到其余 demo', thumb: { type: 'image', src: 'site/thumbs/31-agent-workspace.jpg' },
        },
        {
          no: '05', title: '就地对话：从编辑器长进 Build、Debug、HiLog', subtitle: 'Inline AI · Editor / Build / Debug / HiLog', mark: '半投', key: 'AI 和 IDE 的深度融合',
          desc: '构建失败、断点、崩溃栈上就地问，Agent 读现场给补丁并重建复测；改到别的 Agent 正在写的文件先停下问你并进哪边，写进去的行带来源、可退回；测试机碰一碰把截图和 HiLog 变成上下文。',
          view: 'ready', date: '2026-09-25', href: 'demos/05-inline-chat-everywhere/index.html',
          tags: ['步数与切换次数'], note: '补齐，并进日常迭代', thumb: { type: 'image', src: 'site/thumbs/05-inline-chat-everywhere.jpg' },
        },
        {
          no: '06', title: 'Voice coding：语音开发模式', subtitle: 'Voice Coding Loop', mark: '补齐',
          desc: '拿着测试机说一句，Agent 按工程符号识别并读回理解，一句话里的多件事先复述派给哪个 Agent，说「对」才开工；离开工位在手机、手表上接着说，回到电脑对话接回 IDE，提交前再等你一句。',
          view: 'ready', date: '2026-09-25', href: 'demos/06-voice-coding/index.html',
          tags: ['步数与切换次数'], note: '补齐，并进日常迭代', thumb: { type: 'image', src: 'site/thumbs/06-voice-coding.jpg' },
        },
        {
          no: '07', title: 'Agent Team：多 Agent 分工、交接与冲突合并', subtitle: 'Multi-agent Team · Handoff & Merge', mark: '投', key: '多 Agent、Agent team',
          desc: '主 Agent 拆给五个子 Agent 在隔离副本里并行；撞同一文件、要占真机、要你选文案的都进同一个「在等你」队列，按挡路程度排，胶囊和实况窗只推队首；规则闸门自动改写，真机和模拟器走通才合入 main。',
          view: 'ready', date: '2026-09-25', href: 'demos/07-agent-team/index.html',
          tags: ['等待可见'], note: '第一批：成本最低、证据最硬', thumb: { type: 'image', src: 'site/thumbs/07-agent-team.jpg' },
        },
        {
          no: '08', title: 'AI 输出内容压缩：结论先行', subtitle: 'Conclusion-first Replies', mark: '半投',
          desc: '回复先给结论和改动清单，过程折叠；警告与危险操作永不折叠，危险操作只在 IDE 确认；长任务交给另一个 Agent 在后台跑，结论一句话推到电脑和手机的实况窗，多个 Agent 同时等你时只推最挡路的一件，点开直接落到那处。',
          view: 'ready', date: '2026-09-25', href: 'demos/08-answer-compression/index.html',
          tags: ['审阅与回退'], thumb: { type: 'image', src: 'site/thumbs/08-answer-compression.jpg' },
        },
        {
          no: '09', title: '可视化编程：画布与代码并排', subtitle: 'Canvas ⇄ Code', mark: '投',
          desc: '拖一条线交给 Agent：它补 onCode()、防重复提交和断网分支，补的节点与代码行带来源；和 Agent·多语言 撞在同一行时并排两版让你挑，Mate 70 Pro 上验完给结论；M-Pen 连线、Fold 悬停照用。',
          view: 'ready', date: '2026-09-25', href: 'demos/09-visual-programming/index.html',
          tags: ['步数与切换次数'], thumb: { type: 'image', src: 'site/thumbs/09-visual-programming.jpg' },
        },
        {
          no: '10', title: '可视化调优：图上一处异常，直接落到代码行', subtitle: 'Visual Profiling', mark: '半投',
          desc: 'Agent 读完火焰图、内存与并发轨迹，把结论标在图上并落到 ArkTS 行；你点一下它就改并用同一手势复测，真机被 Agent·回归 占着时先让它暂停；泳道标出是谁加的任务，三台同采找只在某台掉帧。',
          view: 'ready', date: '2026-09-25', href: 'demos/10-visual-profiling/index.html',
          tags: ['步数与切换次数'], thumb: { type: 'image', src: 'site/thumbs/10-visual-profiling.jpg' },
        },
        {
          no: '11', title: '互动式意图确认：问你的时候它不停', subtitle: 'Confirm Without Stopping', mark: '补齐',
          desc: '动手前它先摆出理解与可改的计划（模块拓扑、关键流程、验证），等你时照读文件；计划写明会碰哪个 Agent 正在改的文件，执行到那步先等它提交；偏离就地说明，离开工位推到手机确认。',
          view: 'ready', date: '2026-09-25', href: 'demos/11-intent-confirm/index.html',
          tags: ['审阅与回退'], note: '补齐，并进日常迭代；与 07 是同一个题', thumb: { type: 'image', src: 'site/thumbs/11-intent-confirm.jpg' },
        },
        {
          no: '12', title: '自动化 Workflow：不用你想起来要固化', subtitle: 'Proactive Workflow Capture', mark: '半投',
          desc: '它看出你重复就提议存成一句命令；在 IDE、小艺或手机上说一句，它后台跑完整串，发给测试组前停下等你；顶栏胶囊即实况窗，和 Agent·回归 抢 hvigor 时自动排队。',
          view: 'ready', date: '2026-09-25', href: 'demos/12-auto-workflow/index.html',
          tags: ['步数与切换次数'], thumb: { type: 'image', src: 'site/thumbs/12-auto-workflow.jpg' },
        },
        {
          no: '13', title: '设计稿到代码、模拟器上直接改，全部写回源码', subtitle: 'D2C · Live Emulator Edit · Round Trip', mark: '投', key: 'D2C、模拟器直接修改与调试',
          desc: '你在预览上拖一下、圈一块或说一句，Agent 把裸值翻成 token、问改到哪与哪些断点；写回后 sm/md/lg 三档自验，生成中你一动它就停；每处改动记来源可单退，设计稿漂移三选一。',
          view: 'ready', date: '2026-09-25', href: 'demos/13-ui-code-roundtrip/index.html',
          tags: ['步数与切换次数'], thumb: { type: 'image', src: 'site/thumbs/13-ui-code-roundtrip.jpg' },
        },
        {
          no: '14', title: 'AI 协作时间轴：刻度是执行步骤，能挑着退', subtitle: 'Step-level Timeline & Rewind', mark: '补齐',
          desc: 'Agent 每一步就是时间轴上一格，悬停看进度、挑一步只退它；和多语言 Agent 撞在同一行时先问你、按行合并；MateBook Fold 悬停时下屏拖到哪步，上屏回放那步代码。',
          view: 'ready', date: '2026-09-25', href: 'demos/14-ai-timeline/index.html',
          tags: ['审阅与回退'], note: '补齐，并进日常迭代；21 跟着它一起做', thumb: { type: 'image', src: 'site/thumbs/14-ai-timeline.jpg' },
        },
        {
          no: '29', title: '多语言：让 Agent 做本地化', subtitle: 'Agent-driven Localization · Review, Plurals & RTL',
          desc: '说一句加英文和阿拉伯语：Agent 抽硬编码、翻译含复数、对照截图查 RTL 与截断，只把拿不准的留给你；撞上别的 Agent 的改动会给合并版等你定。本机窗口切语言、拖宽度复核。',
          view: 'ready', date: '2026-09-25', href: 'demos/29-agent-localization/index.html',
          tags: ['审阅与回退'], note: '对照友商 2026 年新增的 Agent 本地化能力补齐', thumb: { type: 'image', src: 'site/thumbs/29-agent-localization.jpg' },
        },
      ],
    },

    /* ================= 方向三 ================= */
    {
      id: 'harmony',
      title: '鸿蒙特征 / 首发',
      icon: 'i-cat-harmony',
      note: '没有对标，因为别人没有这个题——多形态、分布式、一次开发多端部署，只有我们手里有。做错了没人提醒，每条都要自己把判断规则定下来。8 条。',
      items: [
        {
          no: '15', title: '一多联动＋跨端开发：任务状态跟着人走', subtitle: 'Task State Follows You', mark: '投',
          desc: 'Agent 停在第 4 步等你批时离开工位：锁屏即变手机实况窗，在手机上就能批；回来碰一下鸿蒙电脑，真机、断点、HiLog 行和整个在等你队列（含另一个 Agent 借设备的请求）原位接上。',
          view: 'ready', date: '2026-09-25', href: 'demos/15-cross-device-handoff/index.html',
          tags: ['步数与切换次数', '等待可见'], note: '连着产品线一起排', thumb: { type: 'image', src: 'site/thumbs/15-cross-device-handoff.jpg' },
        },
        {
          no: '16', title: '真机多设备：差异并排，替你圈出来', subtitle: 'Multi-device Diff Verdict', mark: '投',
          desc: '说一句，Agent 在桌上几台真机并行跑这次改动，逐处预判适配还是缺陷并给补丁，判到哪台哪台上台；你只确认缺陷。真机被别的 Agent 占用时先用本机窗口验，空了再真机复核。',
          view: 'ready', date: '2026-09-25', href: 'demos/16-multi-device-verify/index.html',
          tags: ['步数与切换次数', '审阅与回退'], note: '第二批：差异化最高', thumb: { type: 'image', src: 'site/thumbs/16-multi-device-verify.jpg' },
        },
        {
          no: '17', title: '模拟器多端：鸿蒙特征 · 跨屏 · 手势', subtitle: 'Multi-device Canvas · HarmonyOS Traits', mark: '投', key: '模拟器多端：鸿蒙特征、跨屏、手势',
          desc: '说一句「弱网下全形态过一遍」，Agent 在画布 7 台上跑场景与一多检查，验哪台哪台上台、名称签写明每台归谁；补丁备好等你接受，全部热重载复验。真机被别的 Agent 占用就改用本机窗口代验；手动工具仍在。',
          view: 'ready', date: '2026-09-25', href: 'demos/17-multi-device-canvas/index.html',
          tags: ['步数与切换次数'], note: '第二批', thumb: { type: 'image', src: 'site/thumbs/17-multi-device-canvas.jpg' },
        },
        {
          no: '18', title: '模拟器 · 分布式调试', subtitle: 'Distributed Debug Timeline', mark: '投',
          desc: '说一句「流转到手表没接上」，Agent 在两端装包、抓 HiLog、对齐时钟复现，结论先行指出断在交接第 2 步并给补丁，你拍板后两端复测；别的 Agent 要装包到这两台先问你。',
          view: 'ready', date: '2026-09-25', href: 'demos/18-distributed-debug/index.html',
          tags: ['步数与切换次数', '审阅与回退'], note: '对齐两端时钟有技术前提，需与调试服务侧确认', thumb: { type: 'image', src: 'site/thumbs/18-distributed-debug.jpg' },
        },
        {
          no: '19', title: '模拟器 · 远端调试', subtitle: 'Remote Device into Canvas', mark: '搭车',
          desc: '说一句要验哪些形态，Agent 按形态借远端真机、装包、跑复现脚本，带坏的设备上台标红并给修复，你拍板后 5 台复验、租约到期自动归还；机位被别的 Agent 占着时问你等不等。',
          view: 'ready', date: '2026-09-25', href: 'demos/19-remote-device/index.html',
          tags: ['步数与切换次数'], note: '跟着 17 一起做；对我们是追平不是首发', thumb: { type: 'image', src: 'site/thumbs/19-remote-device.jpg' },
        },
        {
          no: '20', title: '模拟器 · 连接状态体验创新', subtitle: 'Connection as Five Visible Steps', mark: '投',
          desc: '连接卡住点一下交给 Agent：它诊断卡在五步里的哪一步，能修的自己修；要重启 hdc 会打断别的 Agent 时，先列出受影响的会话再问你等不等。碰一碰、手动排查保留为次路径。',
          view: 'ready', date: '2026-09-25', href: 'demos/20-connect-status/index.html',
          tags: ['等待可见'], note: '第一批：成本最低，新人第一印象在这里定', thumb: { type: 'image', src: 'site/thumbs/20-connect-status.jpg' },
        },
        {
          no: '21', title: '智慧胶囊：状态栏上常驻的一小块', subtitle: 'Status-bar Capsule', mark: '搭车',
          desc: '多个 Agent 同时在跑时，顶栏胶囊只推最挡路的一件并写「还有 N 件」，点开是统一的在等你队列；升到实况窗后电脑、Mate 70 Pro 锁屏、WATCH 5 同步，锁屏直接批准，装机后本机验证。',
          view: 'ready', date: '2026-09-25', href: 'demos/21-capsule/index.html',
          tags: ['等待可见'], note: '第一批；跟着 14 AI 协作时间轴一起做', thumb: { type: 'image', src: 'site/thumbs/21-capsule.jpg' },
        },
        {
          no: '30', title: '折叠屏鸿蒙电脑上开发：上屏写码，下屏运行与调试', subtitle: 'Develop on MateBook Fold · Code Up, Run & Debug Down',
          desc: 'MateBook Fold 折到悬停：上屏写码，下屏摆好 sm / lg 本机窗口和调试台；M-Pen 圈一处，Agent 读圈选和截图给改法，你接受后热重载比对，进度就在下屏，只列与当前文件相关的 Agent。',
          view: 'ready', date: '2026-09-25', href: 'demos/30-fold-dev/index.html',
          tags: ['鸿蒙电脑', '折叠屏'], note: '鸿蒙电脑版首发：本机就是真机，免连线免模拟器', thumb: { type: 'image', src: 'site/thumbs/30-fold-dev.jpg' },
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
          desc: '外部 Agent 按任务调构建、签名、装机、HiLog 工具，敏感步骤在调用流里就地等你授权；授权按 Agent 分开记，可只撤一个；两个 Agent 抢同一台真机时排队、不打断。',
          view: 'ready', date: '2026-09-25', href: 'demos/23-mcp-skill-open/index.html',
          tags: ['步数与切换次数'], note: '对标 Xcode 27 mcpbridge；DevEco CLI 已有 serve mcp', thumb: { type: 'image', src: 'site/thumbs/23-mcp-skill-open.jpg' },
        },
        {
          no: '24', title: '插件化开放：模拟器、调测、调优拆成插件', subtitle: 'Pluggable Tools & Implicit Extension Points', key: '插件 + 第三方工具（隐性开放）',
          desc: '插件装上即是 Agent 的工具：说一句「查掉帧」，Agent 调 Profiler、HiLog 和三方抓包，结果落回原生页签并标来源；三方插件第一次被调时等你批；两个 Agent 抢同一采集会话时排队。',
          view: 'ready', date: '2026-09-25', href: 'demos/24-plugin-open/index.html',
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
          desc: '手机上说一句，Agent 在这台手机上装包、复现、抓 HiLog、定位到行、出补丁，停下等你批；多个 Agent 在等你时只推最挡路的一件；碰一下电脑接着审，保存即在手机上复测。',
          view: 'ready', date: '2026-09-25', href: 'demos/25-phone-client-debug/index.html',
          tags: ['步数与切换次数', '等待可见'], thumb: { type: 'image', src: 'site/thumbs/25-phone-client-debug.jpg' },
        },
        {
          no: '26', title: 'IDE Web：打开链接就能写、就能跑', subtitle: 'IDE Lite / Web · Quick Validation', key: 'IDE Lite / IDE Web',
          desc: '在浏览器里说一句就建鸿蒙工程：Agent 出方案停下等你改，确认后写码、云端构建、在手机和平板上拉起；桌面端其他 Agent 的待决也排进同一个胶囊，网页里就能批。碰一碰到鸿蒙电脑接着做。',
          view: 'ready', date: '2026-09-25', href: 'demos/26-ide-web-lite/index.html',
          tags: ['步数与切换次数', '等待可见'], thumb: { type: 'image', src: 'site/thumbs/26-ide-web-lite.jpg' },
        },
        {
          no: '27', title: '云端模拟器：本机不跑，云端多开', subtitle: 'Cloud Emulator · Multi-instance', key: '云端模拟器',
          desc: '说一句「全形态过一遍」，Agent 按 deviceTypes 挑形态、云端并行跑旅程，自己修失败格、只重跑那台，看到被带坏的红点会细化，提交前等你批。每个 Agent 各占一套云端实例互不抢。',
          view: 'ready', date: '2026-09-25', href: 'demos/27-cloud-emulator/index.html',
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
          desc: '报告由 Agent 生成，结论先行，每条根因标证据或推断；点「让 Agent 修」出补丁，停下等你确认装机，在 Mate 70 Pro 上冷启动 5 次复测，分数和瀑布回填；别的 Agent 在修的项只读。',
          view: 'ready', date: '2026-09-18', href: 'demos/22-coldstart-report/index.html',
          links: [{ label: '单文件版', href: 'deveco-intui-kit/dist/coldstart-report.html' }],
          tags: ['步数与切换次数'], note: '对照真机体检报告提出的具体需求', thumb: { type: 'image', src: 'site/thumbs/22-coldstart-report.jpg' },
        },
        {
          title: '冻屏分析报告：先给判决，再给卷宗', subtitle: 'AppFreeze Report · Verdict First',
          desc: '报告由 Agent 生成，结论先行，每条标证据或推断；让 Agent 修：写入补丁、等你确认装机、Mate 70 Pro 连点复测后回填；源码不可达时先问你要读源码的许可；别的 Agent 的 trace 只引用不混放。',
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
          title: 'DevEco 智能：视觉与交互体系', subtitle: 'DevEco Intelligence · Visual & Interaction System',
          desc: '智能色独立于品牌蓝（紫罗兰 → 兰紫 → 玫瑰，小字用纯色、过 AA）；‹✦› 标识、28 个 AI 图标与「基础字形 + 星芒徽标」派生规则；AI 代码高亮、8 个进行态、输入框 / 回答卡 / 审批卡等组件；Agent 输入框九个场景（并入原「输入框场景与状态说明」）；专题：设计稿到代码之后，可视化修改 × AI Coding（作用范围 × 一多断点、人机冲突、设计稿漂移）。每条规则都从开发者任务出发，并配一张「在 IDE 里的样子」，共 70 张实时渲染配图。',
          view: 'ready', date: '2026-09-24', href: 'deveco-intui-kit/docs/ai-system.html',
          links: [{ label: 'ai.css', href: 'deveco-intui-kit/src/ai.css' }, { label: '图标', href: 'deveco-intui-kit/icons/ai-icons.svg' }],
          tags: ['智能色', '进行态', 'D2C'], thumb: { type: 'image', src: 'site/thumbs/ai-system.jpg' },
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
          title: '消融记录：每个 demo 删了什么、为什么', subtitle: 'Ablation Records · What Was Cut and Why',
          desc: '终轮每个 demo 先写三种做法——没有 Agent 时怎么做、有 Agent 时操作变成什么、多个 Agent 同时在跑会遇到什么；再逐个元素问「它帮这一页任务的哪一步」，答不上就删、重复的只留一处。31 个 demo，逐条记元素、结果（删除 / 合并 / 保留）与依据。',
          view: 'doc', date: '2026-09-25', href: 'analysis/ablation/index.html',
          links: [{ label: '生成脚本', href: 'analysis/ablation/build.py' }],
          tags: ['消融', '多 Agent'], thumb: { type: 'image', src: 'site/thumbs/ablation.jpg' },
        },
        {
          title: 'DevEco 生态位与体验舆情', subtitle: 'DevEco Ecosystem Position & Sentiment',
          desc: '外部事实、DevEco 家族的版本节奏、开发者原声（IDE 内 / IDE 外）、同行 2026 年把 IDE 做成了什么、从舆情到动作的三个同心圆、1100 万注册开发者里的七类人群与漏斗。',
          view: 'doc', date: '2026-09-03', href: 'deveco-ecosystem-sentiment.html',
          tags: ['舆情', '开发者原声', '同行对照'], thumb: { type: 'image', src: 'site/thumbs/sentiment.jpg' },
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
