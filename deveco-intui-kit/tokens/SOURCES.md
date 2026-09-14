# Token 来源对照

每一个 `--ui-*` 语义 token 对应 DevEco Studio 安装包里的哪个 key，方便以后版本升级时重新核对。

## 提取方法

DevEco Studio 6.0.2.670 的主题定义在：

```
DevEco-Studio.app/Contents/lib/app.jar
  └─ themes/expUI/expUI_dark.theme.json
  └─ themes/expUI/expUI_light.theme.json
```

解开的办法（macOS 上）：

```bash
cd /tmp && mkdir -p expui && cd expui
unzip -o "/Applications/DevEco-Studio.app/Contents/lib/app.jar" "themes/expUI/*" >/dev/null
python3 -c "import json;d=json.load(open('themes/expUI/expUI_dark.theme.json'));print(json.dumps(d.get('colors',{}),indent=1,ensure_ascii=False))"
```

`colors` 段是调色板本身（Gray1–14 / Blue1–13 / Green / Yellow / Red / Orange / Purple / Teal），
`ui` 段是具体控件的取色，形如 `"Button.default.startBackground": "Blue4"`。

> **坑**：深色和浅色两套调色板的编号方向是相反的。
> 深色里 Gray1 最深、Gray14 最浅；浅色里 Gray1 是黑、Gray14 是白。
> 主蓝 `#3574F0` 在深色里叫 Blue6，在浅色里叫 Blue4 —— 认色值不要认编号。

## 语义 token → theme.json key

`src/tokens.css` 里的变量分三层：

- `--Gray1..14` / `--Blue1..13` / `--Green*` / `--Yellow*` / `--Red*` … —— **调色板层**，直接抄自 theme.json 的 `colors` 段
- `--ui-*` —— **语义层**，组件样式只用这一层
- `--hdr-*` / `--ed-*` / `--term-*` —— 标题栏、编辑器、终端三块的专用变量（它们在浅色主题下也保持深色，所以单列）

| 变量 | 含义 | 深色取值 | 浅色取值 | theme.json key |
|---|---|---|---|---|
| `--ui-bg` | 面板 / 工具窗 / 状态栏底 | Gray2 `#2B2D30` | Gray13 `#F7F8FA` | `*.background` |
| `--ui-editor-bg` | 编辑器与编辑器标签底 | Gray1 `#1E1F22` | Gray14 `#FFFFFF` | `EditorTabs.background` |
| `--ui-field-bg` | 输入框底 | Gray2 | Gray14 | `TextField.background` |
| `--ui-popup-bg` | 弹层底 | Gray2 | Gray14 | `Popup.background` |
| `--ui-tag-bg` / `--ui-tag-fg` | 标签 / Tag | Gray3 / Gray8 | Gray12 / Gray4 | `Tag.background` |
| `--hdr-bg` | 主工具栏 Header 底 | Gray2 `#2B2D30` | Gray2 `#27282E`（浅色主题下 Header 默认仍是深的） | `MainToolbar.background` |
| `--ui-fg` | 正文 | Gray12 `#DFE1E5` | Gray1 `#000000` | `*.foreground` |
| `--ui-fg-info` | 次要文字 | Gray7 `#6F737A` | Gray7 `#818594` | `*.infoForeground` |
| `--ui-fg-disabled` | 禁用 | Gray6 | Gray8 | `*.disabledForeground` |
| `--ui-link` | 链接 | Blue9 `#6B9BFA` | Blue2 `#315FBD` | `Link.activeForeground` |
| `--ui-file-modified` | 已修改文件名 | Blue9 | Blue3 | `*.modifiedItemForeground` |
| `--ui-hover` | 悬停（按钮 / 标签） | Gray3 | Gray12 | `ToolWindow.Button.hoverBackground` |
| `--ui-hover-list` | 悬停（树 / 列表行） | Gray3 | Blue12 `#EDF3FF` | `*.hoverBackground` |
| `--ui-selection` | 选中行 | Blue2 `#2E436E` | Blue11 `#D4E2FF` | `*.selectionBackground` |
| `--ui-selection-inactive` | 失焦选中 | Gray4 | Gray11 | `*.selectionInactiveBackground` |
| `--ui-action-hover` / `--ui-action-pressed` | 图标按钮悬停 / 按下 | `#FFFFFF16` / `#FFFFFF26` | `#00000012` / `#0000001D` | `ActionButton.hoverBackground` / `.pressedBackground` |
| `--hdr-hover` | Header 悬停 | `#FFFFFF1A` | `#FFFFFF1A` | `MainToolbar.Dropdown.transparentHoverBackground` |
| `--ui-border` | 边框 / 分隔线 | Gray1 | Gray12 `#EBECF0` | `*.borderColor` · `OnePixelDivider.background` |
| `--ui-component-border` | 输入框 / 控件描边 | Gray5 `#4E5157` | Gray9 `#C9CCD6` | `Component.borderColor` |
| `--ui-popup-border` | 弹层描边 | Gray4 | `--windowsPopupBorder` `#B9BDC9` | `Popup.borderColor` |
| `--hdr-separator` | Header 分隔 | Gray4 | Gray4 | `MainToolbar.separatorColor` |
| `--ui-accent` | 强调 / 焦点 / 主按钮 / 选中侧栏图标 | **`#3574F0`**（Blue6） | **`#3574F0`**（Blue4） | `*.focusColor` · `Button.default.*` |
| `--ui-underline-inactive` | 编辑器标签下划线（编辑器失焦） | Gray6 | Gray8 | `*.inactiveUnderlineColor` |
| `--ui-progress` / `--ui-progress-track` | 进度条 / 轨道 | Blue7 / Gray4 | Blue4 / Gray11 | `ProgressBar.progressColor` / `.trackColor` |
| `--ui-success` | 成功 | `#57965C` | `#208A3C` | `status/success.svg` |
| `--ui-warning` | 警告 | `#F2C55C` | `#FFAF0F` | `status/warning.svg` |
| `--ui-error` | 错误 | `#DB5C5C` | `#DB3B4B` | `status/error.svg` |
| `--ui-info` | 信息 | `#548AF7` | `#3574F0` | `status/info.svg` |
| `--ui-icon` | 图标描边 | `#CED0D6`（Gray11） | `#6C707E`（Gray6） | expui 目录下 svg 的默认描边 |
| `--ui-tooltip-bg` / `--ui-tooltip-fg` | Tooltip 底 / 字 | Gray3 / Gray13 | Gray2 / Gray14 | `ToolTip.background` / `.foreground` |
| `--nf` / `--nf-src` / `--nf-test` / `--bulb-f` | 文件树节点底色（普通 / 源码 / 测试 / 提示） | `#43454A` / `#25324D` / `#253627` / `#3D3223` | `#EBECF0` / `#D4E2FF` / `#E3F7E7` / `#FFF1D1` | `FileColor.*` |
| `--run-f` / `--run-s` / `--stop-f` / `--stop-s` | 运行 / 停止按钮的底与描边 | `#253627` `#57965C` / `#5E3838` `#DB5C5C` | 同左（Header 深色时） | `Run.*` |
| 项目头像渐变（写在 components.css） | | `#24A394 → #279CCD` | 同左 | `RecentProject.Color8.Avatar` |

### 三个主题怎么落在选择器上

```
:root, .ide[data-ide-theme="light"]          浅色值
.ide[data-ide-theme="dark"], :root[data-theme="dark"]   深色值
@media (prefers-color-scheme: dark) :root:not([data-theme="light"])   同一份深色值（给"跟随系统"的文档页）
.ide[data-ide-theme="light"][data-light-header="1"]      浅色高对比：把 Header 也改成浅的
```

**深色值改了，上面第二、第三处都要同步改**，它们是同一份内容写了两遍
（这样写是为了让 demo 的主题和文档页的整页换肤互不干扰）。

## 字号 / 行高

来自 JetBrains 官方 Figma「Int UI Kit (Community)」→ Typography 页，逐条核对过：

| 角色 | 字重 | 字号 / 行高 | 用在哪 |
|---|---|---|---|
| H1 | Semibold 600 | 20 / 24 | 面板欢迎标题 |
| H2 | Semibold 600 | 16 / 20 | 回答里的小标题 |
| Default | Regular 400 | 13 / 16 | 绝大多数 UI 文字：树、标签、菜单、按钮 |
| Default semibold | Semibold 600 | 13 / 16 | 加粗的项目名、任务名 |
| Paragraph | Regular 400 | 13 / 18 | 成段正文：AI 回答、说明文字、输入框 |
| Medium | Regular 400 | 12 / 16 | 小字：行号、次要说明、状态栏 |
| Medium semibold | Semibold 600 | 12 / 16 | 小字加粗 |
| Editor Default | Regular 400 | 13 / 22 | 编辑器代码（JetBrains Mono） |
| Editor Small | Regular 400 | 12 / 22 | 代码块、diff、终端 |

**注意**：Figma 里标 "Medium" 的那一档，在实现里字重是 Regular(400)，不是 500。
整套只出现 400 和 600 两个字重。

## 尚未取到的

`colorSchemes/*.xml`（编辑器语法配色）。当时设备挂载中断，没有拿到。
现在 `tokens.css` 里的 `--ed-*` 是按 Darcula / IntelliJ Light 的习惯推断的近似值。
补的办法：

```bash
unzip -l "/Applications/DevEco-Studio.app/Contents/lib/app.jar" | grep colorSchemes
```

取到之后，把 keyword / string / number / comment / function / type / annotation 等
几档的 `FOREGROUND` 值填回 `src/tokens.css` 的 `--ed-keyword` / `--ed-string` / `--ed-number` /
`--ed-comment` / `--ed-func` / `--ed-field` / `--ed-meta` / `--ed-type` 即可。
