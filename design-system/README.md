# DevEco 设计系统

可直接引用的前端组件库。视觉对齐本次 Pixso 预览，不把 `deveco-intui-kit/` 或草稿 PR #15 当来源。

两套系统还是工作假设，写在 [DESIGN.md](DESIGN.md) 里：

- **PC / Mac**：鸿蒙电脑窗口（文件管理、备忘录、文本编辑器）和 Code 形态的文件树、搜索
- **鸿蒙端**：Studio 工具菜单和图标条。稿里的 Controls IntelliJ / Int UI 只作视觉参考，公共组件名用 DevEco 语义

## 给人看

- 全景、token 出处、每个组件的安装 / 用法 / props、缺口：[DESIGN.md](DESIGN.md)
- 静态预览（不用构建）：[preview/index.html](preview/index.html)

## 给人和 AI 同一套用法

- 规则：[SKILL.md](SKILL.md)
- 索引：[llms.txt](llms.txt)
- 文件清单：[registry.json](registry.json)

## 接入

页面引入样式，并在祖先节点声明系统与主题。组件不再包一层主题 Provider。

```html
<link rel="stylesheet" href="design-system/tokens/index.css">
<div data-system="pc-mac" data-theme="light">
  <!-- 使用 components/pc-mac 里的组件，或直接写对应的 class -->
</div>
```

React 19 组件在 `components/`。复制进业务仓库即可，peer 依赖只有 `react`。

现有 GitHub Pages 启动页和 demo 没有改。预览是独立目录，合并前不会进启动页目录。
