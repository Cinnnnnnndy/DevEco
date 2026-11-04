# 官方界面配图视觉核查

说明：只描述实际看见的界面。图片均为官方文档配图，不代表已验证当前版本的触屏行为。

## Android Studio · android-approval.png

- 场景：Agent 提议修改后等待人工接受或拒绝。
- 布局：纵向工具面板，文件及 diff 在上方；Accept Change、Reject Change、Auto-Approve 排列在代码框下；等待条与 Stop 再下一层；输入框在底部。
- 色彩：深色底，新增代码绿色，接受按钮蓝色；等待条使用强调描边。
- 组件：diff、折叠箭头、并排动作按钮、上下文入口。
- 交互信号：明确显示正在等待决定，停止执行与接受修改是不同动作。
- 独特决策：将改动、决定与会话输入串在一条纵向流中。
- 待验证：按钮的实际逻辑尺寸、手指命中率、软键盘弹出后 Stop 的可见性。图片像素不能直接换算实际触控尺寸。

## Xcode · xcode-preview.png

- 场景：源码与 UI 预览并排。
- 布局：代码在左、画布在右；画布下有预览模式、尺寸、缩放等工具。
- 色彩：浅色 IDE，蓝色表示活动状态；画布承载完整应用 UI。
- 组件：分隔栏、预览工具条、设备尺寸与缩放菜单。
- 交互信号：多种画布工具共处，需要区分操作应用与选择组件的模式。
- 独特决策：预览和源码同窗，空间目标可以与源码对应。
- 待验证：触屏点按的模式行为、手势由画布还是被测应用消费、触控分栏调整。图片本身不证明这些行为。

## Xcode · xcode-devicehub.png

- 场景：集中选设备并查看运行界面与配置。
- 布局：左设备列表、中间设备画面、右侧设置；画面周围有工具条。
- 色彩：浅色面板，设备选中高亮，设置使用开关与滑杆。
- 组件：设备树、搜索框、画布、环境设置、设备操作条。
- 交互信号：选中设备与其设置、画面关联，设备身份持续可见。
- 独特决策：把设备管理、画面与环境调整组织到同一工作区。
- 待验证：设备正在被 Agent 操作时的人工接管、触屏多指与焦点行为。


## v2 新增图像视觉核查

### Codex · 会话与独立应用调试并置 · codex-workspace-20260729.png

- 类型：第三方截图 · 2026-07-29 · Wikideas1 · CC0。
- 可见布局与交互信号：左侧是 Codex，会话内容与右侧独立 Wiki Reader / DOM 检查器并置；右侧不是 Codex 内置浏览器。
- 来源：[S22](https://commons.wikimedia.org/wiki/File:Screenshot_of_OpenAI_Codex.png)。
- 边界：不推断触控命中、响应速度、权限或未显示的状态；未实测。

### Claude Code · diff 与 Review code · claude-diff.png

- 类型：官方文章配图 · 2026-02-20。
- 可见布局与交互信号：文件级改动和 Review code 同处审阅区；观察反馈入口的位置和代码密度。
- 来源：[S21](https://claude.com/resources/articles/preview-review-and-merge-with-claude-code)。
- 边界：不推断触控命中、响应速度、权限或未显示的状态；未实测。

### Claude Code · CI 与自动化开关 · claude-pr.png

- 类型：官方文章配图 · 2026-02-20。
- 可见布局与交互信号：CI 进度可展开；Auto fix 和 Auto merge 分别设置，不能合并为一个“全部自动”。
- 来源：[S21](https://claude.com/resources/articles/preview-review-and-merge-with-claude-code)。
- 边界：不推断触控命中、响应速度、权限或未显示的状态；未实测。

### Cursor · Design 模式的元素选择 · cursor-annotate-1-t4.jpg

- 类型：官方演示静帧 · 00:04。
- 可见布局与交互信号：可见 Design 状态、标题轮廓和 SemanticHeading / h1 元素标签；不据单帧判断完整操作序列。
- 来源：[S10](https://cursor.com/docs/agent/design-mode)。
- 边界：不推断触控命中、响应速度、权限或未显示的状态；未实测。

### Cursor · 对象旁的反馈浮层 · cursor-annotate-2-t4.jpg

- 类型：官方演示静帧 · 00:04。
- 可见布局与交互信号：选中的页面内容附近出现带对象名、文本输入和发送动作的浮层；需核查手指遮挡与软键盘。
- 来源：[S10](https://cursor.com/docs/agent/design-mode)。
- 边界：不推断触控命中、响应速度、权限或未显示的状态；未实测。

### Cursor · 选择对象后用语音说明 · cursor-annotate-3-t4.jpg

- 类型：官方演示静帧 · 00:04。
- 可见布局与交互信号：标题高亮与录音波形、取消和确认同屏；仅观察该帧，不推测识别准确度。
- 来源：[S10](https://cursor.com/docs/agent/design-mode)。
- 边界：不推断触控命中、响应速度、权限或未显示的状态；未实测。

### DevEco 鸿蒙预览版 · 工程模块视图 · deveco-ai.png

- 类型：官方预览版配图 · 版本以原页为准。
- 可见布局与交互信号：左侧工程模块列表、中央模块拓扑对应；支持分析复杂对象的选择层级，不代表已经提供触控委派。
- 来源：[S19](https://developer.huawei.com/consumer/cn/deveco-studio/preview/)。
- 边界：不推断触控命中、响应速度、权限或未显示的状态；未实测。

### DevEco 鸿蒙预览版 · 多设备画面 · deveco-devices.webp

- 类型：官方预览版配图 · 版本以原页为准。
- 可见布局与交互信号：可见源码、三台已选择设备与多设备运行画面；设备身份、窗口和代码竞争同一工作区。
- 来源：[S19](https://developer.huawei.com/consumer/cn/deveco-studio/preview/)。
- 边界：不推断触控命中、响应速度、权限或未显示的状态；未实测。

### Android Studio · 并行会话与 Recent Chats · android-parallel.png

- 类型：官方文档配图。
- 可见布局与交互信号：Recent Chats 显示多个会话及 Active 状态；切任务时需要保留对象和设备上下文。
- 来源：[S13](https://developer.android.com/studio/gemini/agent-mode)。
- 边界：不推断触控命中、响应速度、权限或未显示的状态；未实测。
