---
name: deveco-design-system
description: 使用 DevEco 双设计系统（鸿蒙原生端 HarmonyOS NEXT HDesign 2.0 与 PC/Mac 当代桌面端 IntelliJ NewUI）构建或重构 IDE 页面与组件。当需要搭建 DevEco Studio、DevEco Code、鸿蒙原生 IDE 界面、工具窗口、代码编辑器、弹窗或使用 design-system/ 时触发此 skill。
---

# DevEco 设计系统 Skill（v2 · Pixso 矢量 AST 全量对齐版）

人和任意 AI 模型（Claude / Codex / Cursor / Gemini）共用同一份规范。构建或重构 DevEco Studio / DevEco Code / 鸿蒙原生 IDE 界面时必须遵循本 Skill，确保跨模型搭建依然保持 Pixso 原稿级高还原度。

## 必读顺序（AI 建模前必须先读）

1. **本文件 (`design-system/SKILL.md`)**：两套系统归属、铁律、标准页面脚手架与自动化门禁脚本。
2. **[scaffolds/scaffolds.json](scaffolds/scaffolds.json)**：9 套源自 Pixso 原稿的页面级脚手架（`S1` IDE 主工作台 / `S2` AI Agent 会话工作台 / `S3` 双栏设置弹窗 / `S4` 无顶栏纯工具窗 / `S5` 欢迎页 / `S6` 标准表单模态弹窗 / `S7` 危险操作告警弹窗 / `S8` 右侧滑出抽屉 / `S9` 全局命令面板）——**写任何页面或弹层前必须先选脚手架，严禁从零手拼布局**。
3. **[icons/manifest.json](icons/manifest.json)** & **[icons/sprite.svg](icons/sprite.svg)**：995 个 `icon.pix` 原生 SVG 图标（零重绘 + CSS Token 绑定）。
4. **[references/quick-reference.md](references/quick-reference.md)**：`data-system`、`data-theme`、22 个核心组件 `.de-*` class 与 Token 速查。
5. **[preview/index.html](preview/index.html)**：一页总览（含全量色卡、995 图标库 `#icons`、5 套页面脚手架 `#scaffolds`、双系统工作台 `#specimens`、组件文档 `#components` 与 6 组 Pixso 原稿对照 `#compare`）。

---

## 一、两套设计系统选择规则（MUST）

写任何页面或组件前，**必须在容器根节点显式声明 `data-system` 与 `data-theme`**：

| 系统名 | 根节点属性 | Pixso 真相源 | 几何尺寸与视觉特征（严禁混用） |
| :--- | :--- | :--- | :--- |
| **鸿蒙原生端 (HDesign 2.0)** | `data-system="harmony"`<br>`data-theme="dark" \| "light"` | `鸿蒙IDE_v1.1.0_PC端组件库.pix`<br>`👉🔥【2.0】基础范式🔥👈.pix`<br>`DevEco Studio NEXT-AI IDE.pix` | • 正文 `16vp`（行高 `22px`），补充 `14vp`，标题 `20vp`<br>• 主色浅 `#0A59F7` / 深 `#317AF7`；面板底浅 `#F1F3F5` / 深 `#202224`；代码编辑区浅 `#FFFFFF` / 深 `#131416`<br>• 顶栏高 `44px`，底栏高 `32px`，侧边图标条宽 `44px`<br>• 按钮高 `34px` `r=8px`（次按钮 `10%` 叠加底配蓝字，告警按钮 `10%` 底配红字）<br>• 输入框 / 搜索 / 下拉 / 树行 / 菜单项高 `28px` `r=4px`<br>• 代码页签高 `28px` 胶囊形 `r=6px`（选中 `10%` 叠加底）<br>• 弹窗 `r=16px` + `Elevation 55` 阴影 |
| **PC / Mac 当代桌面端 (NewUI)** | `data-system="pc-mac"`<br>`data-theme="dark" \| "light" \| "light-contrast"` | `【NewUI】鸿蒙IDE-当代.pix`<br>`icon.pix`<br>`DevEco Studio（当代）chat.pix`<br>+ 只读输入 `deveco-intui-kit/` | • 正文 `13px`（行高 `16px/18px`），小字 `12px`<br>• 官方色阶 `Light/Dark Gray 1–14`；主色 `#3574F0`；深色面板 `#2B2D30`、编辑器 `#1E1F22`、列表选中 `#2E436E`<br>• 顶栏高 `40px`，底栏高 `24px`，侧边图标条宽 `40px`<br>• 按钮 / 输入框高 `28px`（小号 `24px`）`r=4px`，次按钮带 `1px` 描边<br>• 树行高 `24px` `r=4px`；菜单项高 `26px`<br>• 代码页签高 `40px` 矩形，选中态底部 `3px` 蓝色指示条 |

---

## 二、保证高还原度的五条铁律（MUST & MUST NOT）

### 1. 严禁手写私有组件 CSS，100% 走 `tokens/index.css` 与 `.de-*` 类名
- 页面头部必须引入 `design-system/tokens/index.css`。
- 若页面是分析报告或规范卡片页，外框统一引入 `deveco-intui-kit/src/tokens.css` + `site/launcher.css`（复用 `.page`、`.mast`、`.sidebar .cat`、`.card` 岛屿卡片），内部样张舞台挂载 `<div data-system="..." data-theme="...">`。
- **禁止**在页面的 `<style>` 或内联 `style` 中硬编码 `#xxx` 十六进制颜色、私有圆角或私有阴影。所有表面色走 `var(--surface-*)`，文字走 `var(--text-*)`，描边走 `var(--line)` / `var(--border-control)`。

### 2. 直接复制标准 DOM 骨架（Copy-Paste Skeletons）
其他模型在搭建新页面时，**不要自己发明 DOM 层级**，直接从以下标准骨架复制并填充业务文案：

#### 骨架 A：鸿蒙原生 IDE 整窗 (`HarmonyIdeWindow`)
```html
<section class="de-window" data-system="harmony" data-theme="dark" style="min-height:480px">
  <!-- 1. 44px 顶栏 -->
  <header class="de-titlebar">
    <span class="de-titlebar__mark">A</span>
    <div class="de-titlebar__group">
      <button type="button" class="de-titlebar__pill">Healthy_life ▾</button>
      <button type="button" class="de-titlebar__pill">⑂ Master ▾</button>
    </div>
    <span class="de-titlebar__spacer"></span>
    <div class="de-titlebar__group">
      <button type="button" class="de-titlebar__pill">💻 MyPC (Designed for phone) ▾</button>
      <button type="button" class="de-titlebar__pill">⊞ Entry ▾</button>
    </div>
    <span class="de-titlebar__spacer"></span>
    <div class="de-window__controls" aria-hidden="true">
      <button type="button" tabindex="-1">🔨</button>
      <button type="button" tabindex="-1" style="color:var(--color-success)">▶</button>
      <button type="button" tabindex="-1" style="color:var(--color-success)">🐞</button>
      <button type="button" tabindex="-1">–</button>
      <button type="button" tabindex="-1" data-close>×</button>
    </div>
  </header>

  <!-- 2. 主体区：左侧图标条 + Project 树 + 右侧代码主区 -->
  <div class="de-window__body">
    <nav class="de-stripe" aria-label="侧边工具条">
      <button type="button" class="de-icon-button de-icon-button--m" aria-label="Project" aria-pressed="true">
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M1.8 3.5A1.3 1.3 0 0 1 3.1 2.2h3.1c.4 0 .78.18 1.02.5l.86 1.1h4.82A1.3 1.3 0 0 1 14.2 5.1v7.4a1.3 1.3 0 0 1-1.3 1.3H3.1a1.3 1.3 0 0 1-1.3-1.3V3.5Z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
      </button>
      <button type="button" class="de-icon-button de-icon-button--m" aria-label="Search">
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><circle cx="7" cy="7" r="4.2" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M10.2 10.2 13.5 13.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
      </button>
    </nav>

    <!-- 目录节点自动渲染矢量文件夹图标；文件节点使用 .de-tree__badge -->
    <aside class="de-nav" aria-label="Project" style="width:220px">
      <div class="de-toolbar" style="padding:0 6px;min-height:36px;background:transparent">
        <span class="de-toolbar__title">Project ▾</span>
      </div>
      <ul class="de-tree">
        <li>
          <details class="de-tree__node" open>
            <summary class="de-tree__row">
              <span class="de-tree__chevron">›</span>
              <span class="de-tree__name"><strong>MyApplication</strong></span>
            </summary>
            <ul class="de-tree__children">
              <li><div class="de-tree__row" data-selected="true"><span class="de-tree__badge">A</span><span class="de-tree__name">EntryAbility.ets</span></div></li>
              <li><div class="de-tree__row"><span class="de-tree__badge" data-ext="cpp">C</span><span class="de-tree__name">BadgeCardComponent.cpp</span></div></li>
              <li><div class="de-tree__row"><span class="de-tree__badge" data-ext="json">&#123;&#125;</span><span class="de-tree__name">module.json5</span></div></li>
            </ul>
          </details>
        </li>
      </ul>
    </aside>

    <div class="de-main">
      <div class="de-tabs" role="tablist" data-tabs>
        <div class="de-tab" data-selected="true">
          <button type="button" role="tab" class="de-tab__main" aria-selected="true"><span class="de-tree__badge">A</span> EntryAbility.ets</button>
          <button type="button" class="de-tab__close" aria-label="关闭">×</button>
        </div>
      </div>
      <div class="de-code-editor">
        <div class="de-code-alert-card"><span style="color:var(--color-success)">✓</span> 0 告警 · ArkTS Linter</div>
        <div class="de-code-line"><span class="de-code-gutter">1</span><span class="de-code-content"><span class="kw">import</span> UIAbility <span class="kw">from</span> <span class="str">'@ohos.app.ability.UIAbility'</span>;</span></div>
        <div class="de-code-line" data-current="true"><span class="de-code-gutter">2</span><span class="de-code-content"><span class="kw">export default class</span> <span class="fn">EntryAbility</span> <span class="kw">extends</span> UIAbility &#123;&#125;</span></div>
      </div>
      <footer class="de-statusbar">
        <span class="de-crumb">Healthy_life › entry › src › main › ets › <strong>EntryAbility.ets</strong></span>
        <span class="de-statusbar__group">
          <span class="de-lsp-pill"><span class="de-lsp-pill__dot">2</span> LSP Service</span>
          <span>134/2,275</span>
          <span>UTF-8</span>
        </span>
      </footer>
    </div>
  </div>
</section>
```

#### 骨架 B：模态弹窗与表单控件 (`Dialog` + `Select` + `Switch` + `Button`)
```html
<div class="de-dialog">
  <header class="de-dialog__header">
    <h3 class="de-dialog__title">新建鸿蒙模块</h3>
  </header>
  <div class="de-dialog__body">
    <div class="de-field">
      <span class="de-field__label">Module Name</span>
      <label class="de-input" data-state="error">
        <input type="text" value="entry_invalid!" aria-label="Module Name">
      </label>
      <div class="de-error-tip">模块名称仅支持字母、数字与下划线（4.6报错tips）</div>
    </div>
    <div class="de-field">
      <span class="de-field__label">Device Type</span>
      <span class="de-select">
        <select aria-label="Device Type"><option>Phone / Tablet / 2in1</option></select>
      </span>
    </div>
    <div class="de-row">
      <label class="de-choice"><input type="checkbox" class="de-checkbox" checked> <span>启用 Stage 模型</span></label>
      <label class="de-choice"><input type="checkbox" role="switch" class="de-switch" checked> <span>自动生成 Native C++</span></label>
    </div>
  </div>
  <footer class="de-dialog__footer">
    <button type="button" class="de-button de-button--secondary de-button--m">Cancel</button>
    <button type="button" class="de-button de-button--primary de-button--m">Confirm</button>
  </footer>
</div>
```

### 3. 图标库规范（MUST USE Pixso SVG + Token，严禁重新绘制）
- 所有 IDE 图标已从本地 `icon.pix` 矢量 AST 无损提取为 995 个官方 SVG（354 个鸿蒙 NEXT + 641 个 PC/Mac NewUI），并自动将单色/语义色绑定至 `currentColor`（`var(--icon)`）与 `var(--color-info / success / warning / error)`：
  - 雪碧图：`design-system/icons/sprite.svg`
  - 检索清单：`design-system/icons/manifest.json`
- **禁止模型手写或重绘 `<svg><path .../></svg>`**；必须通过 `<svg class="de-svg-icon"><use href="../icons/sprite.svg#<id>"/></svg>` 引用，或直接拷贝 `manifest.json` 中对应图标的 Token 化 `<svg>`。

### 4. 保护区、样式隔离与高频防坑硬规则（MUST FOLLOW）
- **严禁修改 `deveco-intui-kit/` 目录下的任何文件**。
- **严禁再用操作系统自带的「文件管理器」「备忘录」「记事本」充当 DevEco IDE 窗口**。
- **严禁使用 `Inter` 或 `Helvetica` 字体**；UI 字体必须走 `--font-ui`（HarmonyOS Sans SC），代码字体走 `--font-mono`（JetBrains Mono）。
- **严禁把鸿蒙 AARRGGBB（如 `#E5000000`）当成 CSS `#RRGGBBAA` 直接写进样式**。
- **宿主样式穿透隔离**：任何文档页/外层壳禁止写裸标签样式（如 `footer`、`p`、`code`、`hr`）去影响 `[data-system]` 内部；组件预览画布（`.stage` / `.comp-stage` / `.workbench-stage`）必须始终使用自身 `[data-theme]` 对应的 `var(--surface-window)`，绝不继承外层页面的浅/深背景，杜绝反色（白底白字或黑底黑字）。
- **小尺寸徽标与图标居中**：任何高度 ≤ 24px 的徽标/图标按钮（如 `.de-tree__badge`、`.de-titlebar__mark`、`.de-menu__icon`）必须使用 `display: inline-flex; align-items: center; justify-content: center; line-height: 1;`，严禁省略 `line-height: 1` 导致继承行高下溢贴底。
- **严禁 Emoji / Unicode 伪图标与手绘 `<svg>`**：不得使用 `🔨 ▶ 🐞 💻 ⊞ ⑂ ✦ ⚠ 🔖 ⌕ ■` 等符号替代图标，也不得手写 `<svg><path .../></svg>`；一律引用 `design-system/icons/sprite.svg#<pixso-id>`。
- **交互切换控件顺序固定**：所有双系统切换栏统一为 **左 `harmony`（鸿蒙 2.0）、右 `pc-mac`（PC/Mac NewUI）**，主题顺序统一为 **深色 → 浅色 → 高对比**，禁止随默认卡片翻转位置。
- **色卡与 Token 必须全量直出**：展示色板时直接从源 JSON（`pc_lib-styles.json`、`tokens.json`）全量生成，避免只做局部摘要导致缺失色阶。
- **`.de-window` 与 `.de-studio` 严格互斥**：只要窗口包含顶栏 `.de-titlebar`，就**只能使用 `.de-window` + `.de-window__body`**（顶栏在上，下方图标条/侧栏/主区横向排列），**严禁再叠加 `.de-studio`**；`.de-studio` 仅用于无顶栏的纯横向工具窗（`StudioToolWindow`）。
- **侧栏分组标题与会话条目严格区分**：日期/分类分组标题（如 `Today`、`2026/8/30`）用 `<div class="de-nav__label">`，可点击会话/导航条目必须用 `<button class="de-nav__item"><span class="de-nav__text">...</span></button>`（自动单行省略号截断），**严禁把 `.de-nav__label` 用在或嵌套在可点击条目里**。
- **图标颜色继承铁律**：`.de-svg-icon` 必须保持 `color: inherit`（禁止在图标类本身写死 `color: var(--icon)`），保证蓝色激活态、主按钮、深色顶栏内图标自动反白。

---

## 三、跨模型高还原度验证闭环（Automated Fidelity Gate）

任何模型完成页面编写或修改后，**必须按顺序执行以下两步验证才允许汇报完成**：

### 第一步：运行自动化门禁脚本（0.2 秒 CLI 静态与 Token 检查）
```bash
node design-system/scripts/verify-fidelity.js <你的页面路径.html>
```
该脚本会自动拦截（14 项硬门禁）：
1. 未引入 `tokens/index.css` 或缺失 `data-system` / `data-theme` 声明；
2. 误用 `Inter` 字体或引用了不存在的 `--*` CSS 变量；
3. `.de-*` 组件上硬编码了私有 HEX 颜色，或误把鸿蒙 8 位 `AARRGGBB` 当 CSS 颜色；
4. 页面存在断链或缺失图片/静态资源；
5. 手绘 `<svg>` 或使用 Emoji/Unicode 伪图标（`🔨 ▶ 🐞 💻 ⊞ ⑂ ✦ ⚠ 🔖 ⌕ ■`）；
6. 编造不存在的 `sprite.svg#<id>` 图标 ID（实时核对 `icons/manifest.json` 995 个真实 ID）；
7. 系统切换按钮顺序颠倒（必须左鸿蒙、右 PC/Mac）；
8. `<style>` 中出现未限域的裸 `footer`/`header`/`hr` 穿透规则，或 `inline-grid` 缺少 `line-height: 1` 导致小徽标下溢错位；
9. `.de-svg-icon` 写死 `color: var(--icon)` 导致反色按钮内图标变灰；
10. 带 `.de-titlebar` 的标准窗口误加 `.de-studio` 导致顶栏被挤到左侧，或将 `.de-nav__label` 错用于会话条目内。

### 第二步：浏览器实测与深浅双主题走查
1. 在浏览器中打开页面，分别切换 `data-theme="dark"` 与 `data-theme="light"`（以及 `data-system="harmony"` 与 `data-system="pc-mac"`）。
2. 对照 `design-system/preview/index.html#compare` 中的 Pixso 原稿帧，确认：
   - 顶栏、状态栏、页签栏、横幅均保持单行不折行（`white-space: nowrap`）；
   - 深色模式下弹窗标题（`.de-dialog__title`）、次级说明文字（`--text-secondary` >= 4.5:1）、菜单快捷键对比度清晰可读；
   - 工程树目录节点带有矢量文件夹图标，文件节点带有彩色扩展名徽标（`.de-tree__badge`）。
