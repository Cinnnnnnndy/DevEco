# DevEco 设计系统

可直接引用的前端组件库。视觉对齐这次 Pixso 预览，不把 `deveco-intui-kit/` 或草稿 PR #15 当来源。

两套系统还是工作假设，写在 [DESIGN.md](DESIGN.md)：

- **PC / Mac**：鸿蒙电脑窗口（文件管理、备忘录、文本编辑器）和 Code 形态的文件树、搜索
- **鸿蒙端**：Studio 工具菜单和图标条。稿里的 Controls IntelliJ / Int UI 只作视觉参考，公共组件名用 DevEco 语义

## 打开就看

- 组件索引，每组件一页（实时示例、用法、API、对照）：[docs/index.html](docs/index.html)
- 整页示例：[examples/file-window.html](examples/file-window.html)、[examples/studio-tool-window.html](examples/studio-tool-window.html)
- 总预览：[preview/index.html](preview/index.html)

这些都是静态 HTML，不用构建。没有接进仓库启动页。

## 交给人和 AI

- 规则与工作流：[SKILL.md](SKILL.md)
- 怎么把整包交出去：[references/handoff.md](references/handoff.md)
- 缺控件时怎么停：[references/preview-gate.md](references/preview-gate.md)
- 速查：[references/quick-reference.md](references/quick-reference.md)
- 索引：[llms.txt](llms.txt)

## 接入

```html
<link rel="stylesheet" href="design-system/tokens/index.css">
<div data-system="pc-mac" data-theme="light"></div>
```

React 19 组件在 `components/`。复制进业务仓库即可，peer 依赖只有 `react`。换主题只改变量，不包一层 Provider。
