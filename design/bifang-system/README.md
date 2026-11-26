# 毕方设计系统

OpenBitFun 设计系统的两件交付物，给启动页「毕方设计系统」分类用。

| 目录 | 内容 | 怎么打开 |
|---|---|---|
| `lab/` | Design Lab 静态站：组件目录（Web / 移动端）、移动端 demo 对照、图标库、色卡、Token、Skill 页 | 经启动页或 GitHub Pages 打开 `lab/index.html`。直接双击不能加载（模块脚本受 `file://` 限制）。 |
| `skill/SKILL.md` | 让 AI 只按本组件库生成界面的 Skill | 复制到项目的 `.openbitfun/skills/openbitfun-design-system/`、`.agents/skills/…`、`.claude/skills/…` 或 `.codex/skills/…`，或粘贴进工具的规则文件 |

## 来源

- 源码在 OpenBitFun 仓库 `design-system/apps/design-lab`（组件与 token 来自 `@openbitfun/ui` 与 `@openbitfun/design-tokens`）。
- `lab/` 是用相对 base 构建的产物，构建命令：

  ```bash
  cd design-system/apps/design-lab
  corepack pnpm exec vite build --base ./ --outDir <输出目录>
  ```

- `skill/SKILL.md` 由组件注册表和 token 目录生成，源码仓库的测试会在过期时失败。

## 更新

每次改动组件或 token 后，在 OpenBitFun 仓库重新构建 `lab/`、重新生成 `SKILL.md`，再把两者覆盖到本目录并提交。
