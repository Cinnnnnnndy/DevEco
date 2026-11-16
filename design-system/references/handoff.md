# 把这套交给同事或 AI

交整个 `design-system/` 目录，不要只丢一个 CSS 文件。

里面要有：

- `SKILL.md`：规则和工作流
- `DESIGN.md`：人读的全景和对照结论
- `llms.txt`：给模型的短索引
- `tokens/`：三层变量
- `components/`、`patterns/`：React 源码
- `preview/index.html`：一页总览，含 token、组件文档、Pixso 对照、FileWindow、StudioToolWindow
- `docs/`：每个组件一页，仍可深链打开
- `examples/file-window.html`、`examples/studio-tool-window.html`
- `compare/`：和 Pixso 帧并排的深链
- `references/`：preview-gate、速查、这篇交接说明

阅读顺序写在 `SKILL.md` 开头。AI 不要从 `deveco-intui-kit/` 或 PR #15 取色。字体用 `--font-ui` 的 HarmonyOS Sans SC。不要编 Light / Dark Gray 1–14 的十六进制。

静态页用浏览器打开 `preview/index.html` 即可，不用构建。启动页只链这一页。
