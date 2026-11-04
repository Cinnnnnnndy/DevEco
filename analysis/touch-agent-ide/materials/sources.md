# 触屏与触控笔 × Agent / IDE：来源与图像索引

核查日期：2026-11-03 · v3。26 项官方来源 + 1 项第三方图像来源；12 幅界面图 + 6 张当前设计示意。未做手指或笔实测。

| 编号 | 来源 | 证据口径 | 核查内容 |
|---|---|---|---|
| S01 | [Apple · 触屏 MacBook Pro 发布](https://images.apple.com/newsroom/2026/10/apple-unveils-groundbreaking-macbook-pro-with-proled-xdr-display/) | 官方 A | 2026-10-28 发布；11 月 6 日开始供货。触屏与键鼠配合；官方提到可在屏幕上测试 iOS / iPadOS 应用触控。尚未进行实机验证。 |
| S02 | [华为 · MateBook Fold 产品页](https://consumer.huawei.com/cn/harmonyos-computer/matebook-fold-ultimate-design/) | 官方 A | 当前产品页展示手写、悬停和多姿态；小艺任务标注需升级至 HarmonyOS 7，不能直接视作所有在售机器已有。 |
| S03 | [华为 · Fold 展开态使用](https://consumer.huawei.com/cn/support/content/zh-cn16048766/) | 官方 A | 适用机型及系统版本见页面。150° 及以上进入展开态，支持旋转；展开态使用物理键盘或小键盘，不支持折叠态的全尺寸虚拟键盘。 |
| S04 | [华为 · Fold 虚拟键盘](https://consumer.huawei.com/cn/support/content/zh-cn16050601/) | 官方 A | 折叠态可点状态栏图标，或八指及以上轻触唤起虚拟键盘。包含虚拟触控板及快捷键辅助，需注意机型和系统适用范围。 |
| S05 | [Microsoft · Touch interactions](https://learn.microsoft.com/en-us/windows/apps/develop/input/touch-interactions) | 官方 A | Windows 触控规范区分可触与触控优化；后者建议 44×44 epx，目标间至少 4 epx。此数值是 Windows 参考，不能直接充当鸿蒙规范。 |
| S06 | [OpenAI · Code review](https://learn.chatgpt.com/docs/code-review?surface=app) | 官方 A | 本地 review pane 支持查看 diff、行级反馈及暂存/回退。文档中的行级评论路径含悬停出现加号；不能据此认定已完成触屏优化。 |
| S07 | [OpenAI · Codex on mobile](https://learn.chatgpt.com/docs/mobile) | 官方 A | 手机可发起、跟进、审批与审阅运行于云端或已连接电脑的任务。可用性取决于逐步开放和工作区设置。移动入口不等于鸿蒙原生客户端。 |
| S08 | [Anthropic · Claude Code Desktop](https://code.claude.com/docs/en/desktop) | 官方 A | 桌面端支持文件/图片上下文、权限模式、浏览器预览与 diff。浏览器可选元素（文档列出快捷键）；本地预览自动验证能力与 SSH 会话不同。 |
| S09 | [Anthropic · Remote Control](https://code.claude.com/docs/en/remote-control) | 官方 A | 可由手机、平板或浏览器接续本地会话；代码执行仍在原机器。支持跨入口消息、进度及附件同步，断连后的状态需要区分。 |
| S10 | [Cursor · Design Mode](https://cursor.com/docs/agent/design-mode) | 官方 A | 当前文档描述元素选择、多选、圈画、原位改文案、语音批注和批量发送。Annotate 标注 3.24.18 及以上；多选及若干动作依赖修饰键。 |
| S11 | [Cursor · Visual editor 发布说明](https://cursor.com/blog/browser-visual-editor) | 官方 A | 2025-12-11 的历史能力基线：拖动布局、调整样式、点选并描述后由 Agent 更新代码。与现行 Annotate 文档分开记录，避免混用界面。 |
| S12 | [Cursor · Browser](https://cursor.com/docs/agent/tools/browser) | 官方 A | Agent 可通过浏览器查看、交互、截图及验证 Web 界面。浏览器自动操作能力不能证明人类直接触控、多指或笔输入的适配情况。 |
| S13 | [Google · Android Studio Agent Mode](https://developer.android.com/studio/gemini/agent-mode) | 官方 A | 支持多阶段任务、多文件修改、人工审阅以及并行会话。可部署应用、检查设备画面、截图、查看 Logcat，并通过 adb shell input 与运行应用交互。 |
| S14 | [Google · Attach an image](https://developer.android.com/studio/gemini/attach-image) | 官方 A | 可把界面或设计图片加入问题，作为 UI 开发上下文；图片输入与结构化组件选取是不同能力。 |
| S15 | [Google · Android Emulator](https://developer.android.com/studio/run/emulator) | 官方 A | 文档提供点击、拖动及通过 Control / Command 模拟捏合的鼠标操作路径。桌面模拟路径不等于宿主触屏的原生多指透传。 |
| S16 | [Google · Emulator known issues](https://developer.android.com/studio/run/emulator-troubleshooting) | 官方 A | 官方列出：模拟器在 IDE 工具窗口中运行时，多指手势（含双指平移）不能工作，建议独立窗口。须结合实际版本复核，不扩展为所有触屏都不可用。 |
| S17 | [Apple · Xcode](https://developer.apple.com/xcode/) | 官方 A | 官网当前为 Xcode 27：Agent、交互预览、选择预览控件定位源码，以及集中管理真机/模拟器的 Device Hub。不同预览模式的行为需分别观察。 |
| S18 | [华为 · DevEco Studio](https://developer.huawei.com/consumer/cn/deveco-studio) | 官方 A | 官网列出鸿蒙电脑公测版的编辑、构建、调试、调优、多设备预览与 AI Agent；DevEco Code 覆盖代码生成、修复、构建和验证。官网未在本次材料中证明触屏专门适配。 |
| S19 | [华为 · DevEco Studio Preview](https://developer.huawei.com/consumer/cn/deveco-studio/preview/) | 官方 A | 预览版页面展示 AI 辅助理解工程等能力。与当前公测主页分别标识，不能把预览页表现泛化为各系统、各发行版都一致。 |
| S20 | [OpenAI · Browser / Annotation](https://learn.chatgpt.com/docs/browser?surface=app) | 官方 A | 官方文档提供 Annotate：选元素或拖选区域，保存评论，再在会话中要求处理；还有 Adjust 样式反馈。说明 Codex 也有视觉对象反馈入口，不能仅以 diff 审阅概括。 |
| S21 | [Anthropic · Preview, review and merge](https://claude.com/resources/articles/preview-review-and-merge-with-claude-code) | 官方 A | 2026-02-20 官方文章的实际界面配图：Review code、diff、CI 状态，以及分别控制的 Auto fix / Auto merge。用于历史界面结构参考，非本次触屏实测。 |
| S22 | [Wikideas1 · Codex 公开截图（CC0）](https://commons.wikimedia.org/wiki/File:Screenshot_of_OpenAI_Codex.png) | 第三方图像 C · CC0 | 作者自述为 2026-07-29 自行截取，按 CC0 发布；左侧为 Codex 会话，右侧为独立 Wiki Reader 应用和 DOM 检查器。只作界面位置观察，不能证明内置浏览器、触控行为或当前版本。 |
| S23 | [华为 · 手写笔与平板 / 电脑兼容表](https://consumer.huawei.com/cn/support/content/zh-cn00737675/) | 官方 A | M-Pen 3 按机型列出 MateBook Fold 麒麟 X90 Plus、Pro S、14 鸿蒙版等支持范围；MateBook Pro 有系统版本条件。不能将支持书写等同于所有笔特性或所有机型都支持。 |
| S24 | [Microsoft · Input primer](https://learn.microsoft.com/en-us/windows/apps/develop/input/input-primer) | 官方 A | 区分键鼠、手指、主动笔和被动笔。被动笔近似手指；主动笔在硬件支持时可提供接近 / 悬停等数据。笔迹输入与直接操作并不等同。 |
| S25 | [Google · 大屏输入兼容与 Stylus](https://developer.android.com/develop/ui/views/touch-and-input/input-compatibility-on-large-screens) | 官方 A | 说明手指、笔与橡皮擦工具类型，压感和倾斜以设备支持为前提；手掌触点可能先到达应用，再被系统取消。取消事件必须撤销相应手势。这是 Android 平台语义，不是鸿蒙 API 约定。 |
| S26 | [Microsoft · Pen interactions / Windows Ink](https://learn.microsoft.com/en-us/windows/uwp/ui-input/pen-and-stylus-interactions) | 官方 A | 笔迹、擦除与套索选择需区分处理；笔尾或按键可能提供擦除，缺少硬件控制时需 UI 替代。示例也能接收鼠标输入，故圈选和画线本身不是笔独占能力。 |
| S27 | [Microsoft · 同时使用笔和触控的验证](https://learn.microsoft.com/en-us/windows-hardware/design/component-guidelines/simultaneous-pen-and-touch-validation) | 官方 A | 笔与手指同时输入需要单独验证；防误触可能抑制附近手指触点。用于证明混合输入不能只测一支笔或一根手指，不将 Windows 测试规则套成鸿蒙规则。 |

## 界面图

仅证明通用能力或界面结构，不证明手指 / 主动笔交互质量。

| 文件 | 类型 | 来源 | 图中可见 |
|---|---|---|---|
| [查看 codex-workspace-20260729.png](screenshots/codex-workspace-20260729.png) | 第三方截图 · 2026-07-29 · Wikideas1 · CC0 | [S22](https://commons.wikimedia.org/wiki/File:Screenshot_of_OpenAI_Codex.png) | 左侧是 Codex，会话内容与右侧独立 Wiki Reader / DOM 检查器并置；右侧不是 Codex 内置浏览器。 |
| [查看 claude-diff.png](screenshots/claude-diff.png) | 官方文章配图 · 2026-02-20 | [S21](https://claude.com/resources/articles/preview-review-and-merge-with-claude-code) | 文件级改动和 Review code 同处审阅区；观察反馈入口的位置和代码密度。 |
| [查看 claude-pr.png](screenshots/claude-pr.png) | 官方文章配图 · 2026-02-20 | [S21](https://claude.com/resources/articles/preview-review-and-merge-with-claude-code) | CI 进度可展开；Auto fix 和 Auto merge 分别设置，不能合并为一个“全部自动”。 |
| [查看 cursor-annotate-1-t4.jpg](screenshots/cursor-annotate-1-t4.jpg) | 官方演示静帧 · 00:04 | [S10](https://cursor.com/docs/agent/design-mode) | 可见 Design 状态、标题轮廓和 SemanticHeading / h1 元素标签；不据单帧判断完整操作序列。 |
| [查看 cursor-annotate-2-t4.jpg](screenshots/cursor-annotate-2-t4.jpg) | 官方演示静帧 · 00:04 | [S10](https://cursor.com/docs/agent/design-mode) | 选中的页面内容附近出现带对象名、文本输入和发送动作的浮层；需核查手指遮挡与软键盘。 |
| [查看 cursor-annotate-3-t4.jpg](screenshots/cursor-annotate-3-t4.jpg) | 官方演示静帧 · 00:04 | [S10](https://cursor.com/docs/agent/design-mode) | 标题高亮与录音波形、取消和确认同屏；仅观察该帧，不推测识别准确度。 |
| [查看 deveco-ai.png](screenshots/deveco-ai.png) | 官方预览版配图 · 版本以原页为准 | [S19](https://developer.huawei.com/consumer/cn/deveco-studio/preview/) | 左侧工程模块列表、中央模块拓扑对应；支持分析复杂对象的选择层级，不代表已经提供触控委派。 |
| [查看 deveco-devices.webp](screenshots/deveco-devices.webp) | 官方预览版配图 · 版本以原页为准 | [S19](https://developer.huawei.com/consumer/cn/deveco-studio/preview/) | 可见源码、三台已选择设备与多设备运行画面；设备身份、窗口和代码竞争同一工作区。 |
| [查看 android-parallel.png](screenshots/android-parallel.png) | 官方文档配图 | [S13](https://developer.android.com/studio/gemini/agent-mode) | Recent Chats 显示多个会话及 Active 状态；切任务时需要保留对象和设备上下文。 |
| [查看 android-approval.png](screenshots/android-approval.png) | 官方文档配图 | [S13](https://developer.android.com/studio/gemini/agent-mode) | diff、接受、拒绝、自动批准、等待条和 Stop 分层展示。 |
| [查看 xcode-preview.png](screenshots/xcode-preview.png) | 官方页面配图 | [S17](https://developer.apple.com/xcode/) | 代码与画布并排，预览模式、尺寸与缩放工具位于画布下方。 |
| [查看 xcode-devicehub.png](screenshots/xcode-devicehub.png) | 官方页面配图 | [S17](https://developer.apple.com/xcode/) | 设备列表、运行画面及环境设置同屏，便于保持操作对象身份。 |

## 当前设计示意（v3）

- [手指命中与接触区消歧](diagrams/v3/T1-finger-target.svg) · P0-T1 · 手指适配 · 自绘方案，非现有产品截图。
- [多触点与应用输入路由](diagrams/v3/T2-multitouch-routing.svg) · P0-T2 · 手指输入链路 · 自绘方案，非现有产品截图。
- [笔迹、手掌与取消](diagrams/v3/P1-pen-palm-cancel.svg) · P0-P1 · 笔输入正确性 · 自绘方案，非现有产品截图。
- [笔迹到可核对的修改意图](diagrams/v3/P2-ink-intent.svg) · P1-P2 · 需与鼠标比较的候选 · 自绘方案，非现有产品截图。
- [悬停、笔键与等效入口](diagrams/v3/P3-pen-capabilities.svg) · P1-P3 · 按硬件支持条件增强 · 自绘方案，非现有产品截图。
- [跨姿态延续与笔迹坐标](diagrams/v3/F1-posture-factor.svg) · P2-F1 · 独立形态因素 · 自绘方案，非现有产品截图。

旧版示意保留在 diagrams 根目录，仅供对照 v1 / v2，当前报告不再将通用 Agent 能力计作触控创新。
