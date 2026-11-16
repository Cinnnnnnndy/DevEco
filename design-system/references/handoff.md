# 把这套交给同事或 AI

交整个 `design-system/` 目录，不要只丢一个 CSS 文件。

里面要有：

- `SKILL.md`：规则和工作流
- `DESIGN.md`：人读的全景和对照结论
- `llms.txt`：给模型的短索引
- `tokens/`：三层变量
- `components/`、`patterns/`：React 源码
- `docs/`：每个组件一页，可直接打开
- `examples/file-window.html`、`examples/studio-tool-window.html`
- `preview/index.html`：总预览
- `references/`：preview-gate、速查、这篇交接说明

阅读顺序写在 `SKILL.md` 开头。AI 不要从 `deveco-intui-kit/` 或 PR #15 取色。

静态页用浏览器打开 `docs/index.html` 即可，不用构建，也不进仓库启动页。
