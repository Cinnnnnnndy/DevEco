# DevEco Studio（Windows）· Int UI Kit

DevEco Studio 基于 IntelliJ Platform 243（2024.3）构建，界面用的是 JetBrains 的 **Int UI**（New UI）。
这个仓库把它拆成了可以直接改、直接跑的三件东西：

| 目录 | 是什么 |
|---|---|
| `src/` | 组件库本体：token、组件样式、图标雪碧图、交互脚本 |
| `demo/` | 主编辑窗口高保真界面稿（整页即软件，深/浅色可切） |
| `docs/` | 设计规范页：调色板、语义 token、字号、尺寸、组件示例、语法色 |

---

## 快速开始

不需要任何依赖、不需要构建，**双击打开就行**：

```
demo/index.html    ← 界面稿
docs/index.html    ← 规范与组件库
```

两个页面都直接引用 `src/` 下的文件，改完 CSS 刷新即可看到效果。

---

## 目录结构

```
deveco-intui-kit/
├─ src/
│  ├─ tokens.css        设计 token（颜色 / 字号 / 尺寸），改配色只改这个文件
│  ├─ components.css    组件样式（标题栏、工具窗、树、标签页、编辑器、AI 面板、终端、状态栏…）
│  ├─ icons.svg         图标雪碧图（真源文件，改图标改这里）
│  ├─ icons.js          由 icons.svg 生成，把雪碧图注入页面，file:// 下也能用
│  └─ app.js            交互：主题切换、面板开合、树、标签页、弹层、AI 问答脚本
├─ demo/index.html      界面稿的结构（只有 HTML，样式全在 src/）
├─ docs/
│  ├─ index.html        规范页（由 tools/gen_docs_page.py 生成，不要手改）
│  ├─ docs.css          规范页自己的排版样式
│  └─ docs.js           规范页交互：目录高亮、点色块复制色值、主题切换
├─ tokens/
│  ├─ tokens.json       机器可读的调色板 / 字阶 / 语法色，给别的工具用
│  └─ SOURCES.md        每个 token 来自 DevEco 安装包里的哪个 key
├─ tools/
│  ├─ data.py           规范页的数据源（调色板、语义表、字阶、尺寸、语法色）
│  ├─ gen_docs.py       生成各段落的函数
│  └─ gen_docs_page.py  入口：拼出 docs/index.html
├─ dist/                单文件产物（见下）
└─ build.py             构建脚本
```

---

## 怎么改

**改配色** → `src/tokens.css`。所有颜色都走 `--ui-*` 语义变量，组件样式里不写死色值。
深色值在 `.ide[data-ide-theme="dark"]`，浅色值在 `:root, .ide[data-ide-theme="light"]`。

**改组件 / 加组件** → `src/components.css` + `demo/index.html`。命名沿用 Int UI 的说法
（`.tw-*` 工具窗、`.tab` 编辑器标签、`.stripe` 侧边条…）。

**改图标** → 改 `src/icons.svg`，然后：

```bash
python3 build.py sync-icons
```

**改规范页内容** → 改 `tools/data.py`，然后：

```bash
python3 build.py docs
```

**打包成可以发给别人的单文件**：

```bash
python3 build.py
# → dist/deveco-main-window.html
# → dist/intui-tokens-docs.html
```

单文件版把 CSS / JS / 图标全部内联，没有外链（字体的 Google Fonts 链接保留），
可以直接发微信、丢进飞书，或者发布成 Artifact。

---

## 三个主题

界面稿右上角的主题按钮循环切换：**深色 → 浅色 → 浅色高对比**。
选择记在 `localStorage`，刷新保留。

---

## 数据从哪来

| 内容 | 来源 | 可信度 |
|---|---|---|
| 颜色 token | DevEco Studio 6.0.2.670 安装包 `lib/app.jar!/themes/expUI/expUI_dark.theme.json`、`expUI_light.theme.json` | 高，逐 key 提取 |
| 字号 / 行高 / 字重 | JetBrains 官方 Figma「Int UI Kit (Community)」Typography 页 | 高，逐条核对 |
| 间距 / 控件高度 | 同上 Spacing 页 + 真机截图量取 | 中高 |
| 图标 | 安装包 expui 目录下的 svg | 高 |
| Windows 平台差异 | IntelliJ Platform UI Guidelines + 真机截图 | 中 |
| 编辑器语法色 | 推断值 | **低，见下** |

详见 `tokens/SOURCES.md`。

### 已知局限

1. **编辑器语法配色是推断的**。安装包里的 `colorSchemes/*.xml` 当时没取到，
   代码高亮用的是按 Darcula / IntelliJ Light 习惯配的近似值。要做到像素级一致，
   需要再从安装包里补 `colorSchemes` 并覆盖 `tokens.css` 里的 `--ed-*` 系列。
2. **字体**用 Inter + JetBrains Mono 近似。DevEco 在 Windows 上默认 Segoe UI，
   本机有 Segoe UI 时字形会更准（`tokens.css` 的 font stack 已经把它排在前面）。
3. **Figma 的 "Medium" 字重在实现里等于 Regular(400)**，这是 Int UI Kit 的一个坑。
   整套只用 400 / 600 两个字重，不要出现 500。
4. 界面稿是**静态高保真**，不是真的 IDE：树、标签页、AI 问答都是脚本演的，
   目的是让交互和布局能被点、能被截图评审。

---

## 一点约定

- 最小宽度 1100px，低于这个值出横向滚动条 —— IDE 本来也不是窄屏产品。
- 页面高度用 `body` 作 flex 容器、`.ide` 撑满，不用 `100vh`
  （发布成 Artifact 时宿主 iframe 可能比视口高，`100vh` 会在状态栏下面留白）。
- `docs/index.html` 是生成的，手改会在下次 `build.py docs` 时被覆盖。
