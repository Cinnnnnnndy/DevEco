# -*- coding: utf-8 -*-
"""生成 docs/index.html（在仓库根目录跑：python3 tools/gen_docs_page.py）。改数据(tools/data.py)或改下面的组件画廊后重新跑：python3 gen_docs_page.py"""
import os,sys
HERE=os.path.dirname(os.path.abspath(__file__))
ROOT=os.path.dirname(HERE)
sys.path.insert(0,HERE)
import gen_docs as G

SECTIONS=[('s1','用法'),('s2','调色板'),('s3','语义 token'),('s4','字体与字号'),
          ('s5','尺寸与间距'),('s6','组件库'),('s7','编辑器语法色'),('s8','CSS 变量'),('s9','来源与已知局限')]

GALLERY = r"""
<div class="gal samp-scope">

  <div class="row">
    <div class="lbl">按钮 Button<small>默认 / 主按钮 / 禁用</small></div>
    <div class="stage">
      <button class="btn">Cancel</button>
      <button class="btn primary">OK</button>
      <button class="btn" disabled style="opacity:.5">Disabled</button>
      <button class="btn sm">小号 22</button>
    </div>
    <div class="spec">高 <b>28</b>（小号 22）· 最小宽 <b>72</b><br>圆角 <b>8</b>（Button.arc）<br>
      主按钮底 <b>--ui-accent</b><br>描边 <b>--ui-component-border</b></div>
  </div>

  <div class="row">
    <div class="lbl">图标按钮 ActionButton<small>工具窗标题栏、编辑器标签右侧</small></div>
    <div class="stage">
      <button class="abtn" title="Expand All"><svg class="i"><use href="#i-expandAll"/></svg></button>
      <button class="abtn"><svg class="i"><use href="#i-collapseAll"/></svg></button>
      <button class="abtn"><svg class="i"><use href="#i-settings"/></svg></button>
      <button class="abtn"><svg class="i"><use href="#i-moreV"/></svg></button>
      <button class="abtn"><svg class="i"><use href="#i-hide"/></svg></button>
    </div>
    <div class="spec"><b>24×24</b> 圆角 4 · 图标 <b>16×16</b><br>
      悬停 <b>--ui-action-hover</b><br>按下 <b>--ui-action-pressed</b></div>
  </div>

  <div class="row">
    <div class="lbl">侧栏按钮 Tool Window Stripe<small>选中态是蓝底白图标</small></div>
    <div class="stage">
      <span class="stripe" style="background:var(--ui-bg)">
        <button class="sbtn on"><svg class="i"><use href="#i-tw-project"/></svg></button>
        <button class="sbtn"><svg class="i"><use href="#i-tw-structure"/></svg></button>
        <button class="sbtn"><svg class="i"><use href="#i-tw-build"/></svg></button>
        <button class="sbtn"><svg class="i"><use href="#i-tw-notifications"/></svg><span class="dot"></span></button>
      </span>
    </div>
    <div class="spec"><b>32×32</b> 圆角 6 · 栏宽 <b>40</b><br>
      选中底 <b>--ui-accent</b>，图标转白<br>红点 6px，2px 同底色描边</div>
  </div>

  <div class="row">
    <div class="lbl">Chip / Tag<small>功能入口、上下文标记</small></div>
    <div class="stage">
      <span class="chip"><svg class="i"><use href="#i-chat"/></svg>HarmonyOS Ask</span>
      <span class="chip"><svg class="i"><use href="#i-code"/></svg>Generate Code</span>
      <span class="ctx"><svg class="i" style="width:12px;height:12px"><use href="#i-at"/></svg>Add Context</span>
      <span class="toggle">Deep Thinking</span>
      <span class="toggle on">已开启</span>
    </div>
    <div class="spec">chip 高 <b>28</b> 圆角 8 · 12px 字<br>
      ctx/toggle 高 <b>22</b> 圆角 5 · 11px 字<br>底 <b>--ui-tag-bg</b></div>
  </div>

  <div class="row">
    <div class="lbl">树行 Tree<small>普通 / 悬停 / 选中 / FileColor</small></div>
    <div class="stage col">
      <div class="frame"><div class="tree">
        <div class="row" style="padding-left:8px"><span class="tg"><svg class="i"><use href="#i-chevD"/></svg></span><span class="ico"><svg><use href="#i-module"/></svg></span><span class="lbl"><b>MyApplication</b></span><span class="hint">~\DevEcoStudioProjects</span></div>
        <div class="row tint" style="padding-left:24px"><span class="tg"><svg class="i"><use href="#i-chevR"/></svg></span><span class="ico"><svg><use href="#i-folder"/></svg></span><span class="lbl">.hvigor</span></div>
        <div class="row sel" style="padding-left:24px"><span class="tg"></span><span class="ico"><svg><use href="#i-ets"/></svg></span><span class="lbl">Index.ets</span></div>
        <div class="row" style="padding-left:24px"><span class="tg"></span><span class="ico"><svg><use href="#i-json"/></svg></span><span class="lbl">oh-package.json5</span></div>
      </div></div>
    </div>
    <div class="spec">行高 <b>24</b> · 每层缩进 <b>16</b><br>
      选中 <b>--ui-selection</b>，失焦转 <b>--ui-selection-inactive</b><br>
      黄底行 = FileColor.Yellow</div>
  </div>

  <div class="row">
    <div class="lbl">编辑器标签 Editor Tabs<small>下划线仅在编辑器有焦点时为蓝</small></div>
    <div class="stage col">
      <div class="frame ed"><div class="tabs" style="height:40px">
        <button class="tab on"><svg class="i"><use href="#i-ets"/></svg>Index.ets<span class="x"><svg class="i"><use href="#i-closeS"/></svg></span></button>
        <button class="tab"><svg class="i"><use href="#i-ets"/></svg>EntryAbility.ets<span class="x"><svg class="i"><use href="#i-closeS"/></svg></span></button>
      </div></div>
    </div>
    <div class="spec">高 <b>40</b> · 下划线 <b>4</b>、圆角 4<br>
      有焦点 <b>--ui-accent</b> / 失焦 <b>--ui-underline-inactive</b><br>
      未选中标签 opacity .75</div>
  </div>

  <div class="row">
    <div class="lbl">工具窗标题栏<small>标题 + 右侧动作区</small></div>
    <div class="stage col">
      <div class="frame"><div class="tw-hdr" style="height:40px">
        <span class="title">Project <svg class="i"><use href="#i-chevD"/></svg></span><span class="grow"></span>
        <button class="abtn"><svg class="i"><use href="#i-locate"/></svg></button>
        <button class="abtn"><svg class="i"><use href="#i-collapseAll"/></svg></button>
        <button class="abtn"><svg class="i"><use href="#i-moreV"/></svg></button>
        <button class="abtn"><svg class="i"><use href="#i-hide"/></svg></button>
      </div></div>
    </div>
    <div class="spec">高 <b>40</b> · 左内边距 <b>12</b><br>标题 13/16 Semibold<br>动作按钮右对齐，间距 4</div>
  </div>

  <div class="row">
    <div class="lbl">弹层 Popup / Menu<small>Windows 下描边用 windowsPopupBorder</small></div>
    <div class="stage">
      <div class="popup" style="position:static;display:block">
        <div class="mhead">Recent Projects</div>
        <div class="mi"><svg class="i"><use href="#i-module"/></svg>MyApplication<span class="sc">~\DevEcoStudioProjects</span></div>
        <div class="mi"><svg class="i"><use href="#i-folder"/></svg>Open…</div>
        <div class="msep"></div>
        <div class="mi"><svg class="i"><use href="#i-add"/></svg>New Project…</div>
      </div>
    </div>
    <div class="spec">菜单项高 <b>26</b> · 内边距 6px 0<br>圆角 <b>8</b> · 1px <b>--ui-popup-border</b><br>
      快捷键右对齐，色 <b>--ui-fg-info</b></div>
  </div>

  <div class="row">
    <div class="lbl">Tooltip<small>深底浅字，右侧灰色快捷键</small></div>
    <div class="stage">
      <span class="tip" style="position:static;display:inline-block">Select Opened File<span class="sc">Alt+F1</span></span>
      <span class="tip" style="position:static;display:inline-block">Settings<span class="sc">Ctrl+Alt+S</span></span>
    </div>
    <div class="spec">底 <b>--ui-tooltip-bg</b> 字 <b>--ui-tooltip-fg</b><br>
      圆角 6 · 内边距 5/8 · 12px 字<br>延迟约 450ms 出现</div>
  </div>

  <div class="row">
    <div class="lbl">状态栏 Status Bar<small>左面包屑 / 右指示区</small></div>
    <div class="stage col">
      <div class="frame"><div class="status" style="height:24px">
        <span class="crumbs"><span class="sw"><span class="proj"></span>MyApplication</span>
        <svg class="i"><use href="#i-chevR"/></svg><span class="sw">entry</span>
        <svg class="i"><use href="#i-chevR"/></svg><span class="sw"><svg class="i"><use href="#i-ets"/></svg>Index.ets</span></span>
        <span class="grow"></span><span class="sw"><span class="green"></span></span>
        <span class="sw">23:2</span><span class="sw">LF</span><span class="sw">UTF-8</span>
        <span class="sw"><svg class="i"><use href="#i-indent"/></svg>2 spaces</span>
        <span class="sw"><svg class="i"><use href="#i-unlock"/></svg></span>
      </div></div>
    </div>
    <div class="spec">高 <b>24</b> · 12px 字<br>项目图标是蓝色空心方块<br>
      悬停 <b>--ui-hover</b>，文字转 <b>--ui-fg</b></div>
  </div>

  <div class="row">
    <div class="lbl">通知卡 Notification<small>右侧 Notifications 工具窗</small></div>
    <div class="stage col">
      <div class="ncard"><b>Indexing completed</b>MyApplication 索引已完成，代码补全与导航可用。
        <div class="ln2"><a href="#">Details</a><a href="#">Dismiss</a></div></div>
    </div>
    <div class="spec">圆角 <b>8</b> · 内边距 10/12<br>标题 13 Semibold，正文 12<br>底 <b>--ui-field-bg</b></div>
  </div>

  <div class="row">
    <div class="lbl">Agent 计划步骤<small>done / 进行中 / 待办</small></div>
    <div class="stage col">
      <div class="steps">
        <div class="stp"><span class="st done"><svg><use href="#i-checkS"/></svg></span><span class="txt">读取页面与资源定义</span><span class="file">Index.ets</span></div>
        <div class="stp"><span class="st run"></span><span class="txt">改写 onClick 切换逻辑</span><span class="file">Index.ets</span></div>
        <div class="stp"><span class="st todo"></span><span class="txt">hvigor 编译校验</span><span class="file">entry:assembleHap</span></div>
      </div>
    </div>
    <div class="spec">行高 <b>28</b> · 状态点 <b>14</b><br>
      done 实心 <b>--ui-success</b><br>进行中 2px 描边转圈</div>
  </div>

  <div class="row">
    <div class="lbl">Diff 卡<small>Agent 改动审阅</small></div>
    <div class="stage col">
      <div class="diffcard">
        <div class="dh"><svg class="i"><use href="#i-ets"/></svg><span class="fn">entry/src/main/ets/pages/Index.ets</span>
          <span class="cnt"><span class="add">+2</span> <span class="del">−1</span></span><span class="grow"></span></div>
        <pre><span class="l">  .onClick(() =&gt; {</span><span class="l del">-   this.message = 'Welcome';</span><span class="l add">+   this.isZh = !this.isZh;</span><span class="l add">+   this.message = this.isZh ? zh : en;</span><span class="l">  })</span></pre>
        <div class="actions"><button class="btn sm">Reject</button><button class="btn sm primary">Accept</button></div>
      </div>
    </div>
    <div class="spec">头部高 <b>28</b> · 代码 12/20 等宽<br>
      增 <b>--diff-add</b> / 删 <b>--diff-del</b><br>动作条底 <b>--ui-bg</b></div>
  </div>

  <div class="row">
    <div class="lbl">进度条 / 计数<small>状态栏与后台任务</small></div>
    <div class="stage">
      <span style="display:inline-flex;align-items:center;gap:8px;font-size:12px;color:var(--ui-fg-info)">
        Scanning files to index
        <span style="width:120px;height:4px;border-radius:2px;background:var(--ui-progress-track);overflow:hidden;display:inline-block">
          <i style="display:block;height:100%;width:62%;background:var(--ui-progress);border-radius:2px"></i></span>
      </span>
    </div>
    <div class="spec">轨道高 <b>4</b> 圆角 2<br>
      进度 <b>--ui-progress</b> / 轨道 <b>--ui-progress-track</b></div>
  </div>

  <div class="row">
    <div class="lbl">空状态 Empty<small>工具窗无内容时</small></div>
    <div class="stage col">
      <div class="frame" style="min-height:96px;display:flex">
        <div class="empty">This project is not under version control.<br><a href="#">Create Git Repository…</a></div>
      </div>
    </div>
    <div class="spec">居中 · 内边距 24 · 行高 1.6<br>
      正文 <b>--ui-fg-info</b>，动作是链接色</div>
  </div>

</div>
"""

def build():
    toc=''.join(f'<a href="#{i}" data-s="{i}"><span class="n">{n:02d}</span>{t}</a>'
                for n,(i,t) in enumerate(SECTIONS,1))
    css_vars=open(os.path.join(ROOT,'src/tokens.css')).read()
    sec=lambda i,n,t,note,body: (f'<section id="{i}"><h2><span class="n">{n:02d}</span>{t}</h2>'
                                 f'<p class="note">{note}</p>{body}</section>')
    parts=[]
    parts.append(sec('s1',1,'用法',
      '这份文件是 <code>deveco-intui-kit</code> 的规范页，和 <code>src/tokens.css</code> 同源。'
      '色块可以点击复制 hex；表格里的「来源 key」是安装包 theme.json 里的原始键名，'
      '改 token 时按这个键去核对，不要凭印象调色。',
      '<div class="tw"><table><thead><tr><th>文件</th><th>作用</th><th>什么时候改</th></tr></thead><tbody>'
      '<tr><td class="v">src/tokens.css</td><td>全部设计 token（浅色 + 深色）</td><td>换主题、调色、改字号阶梯</td></tr>'
      '<tr><td class="v">src/components.css</td><td>组件样式，只引用 token</td><td>加组件、改组件尺寸</td></tr>'
      '<tr><td class="v">src/icons.svg</td><td>图标雪碧图（安装包原件）</td><td>加图标，之后跑 build.py sync-icons</td></tr>'
      '<tr><td class="v">src/app.js</td><td>demo 交互与预置回答</td><td>改 demo 行为、换对话内容</td></tr>'
      '<tr><td class="v">demo/index.html</td><td>主窗口界面稿</td><td>改界面结构</td></tr>'
      '<tr><td class="v">docs/index.html</td><td>本页（由 gen_docs_page.py 生成）</td><td>改数据后重新生成</td></tr>'
      '</tbody></table></div>'))
    parts.append(sec('s2',2,'调色板',
      '两套调色板<b>编号方向相反</b>：Dark 的 Gray1 最深，Light 的 Gray1 是纯黑、Gray13 才是面板底。'
      '主蓝 <code>#3574F0</code> 在 Dark 叫 Blue6、在 Light 叫 Blue4——同一个颜色两个名字，别混。',
      '<div class="themes"><div><h3>Dark<em>expUI_dark.theme.json</em></h3>'+G.swatch_rows(G.DARK,'dark')+'</div>'
      '<div><h3>Light<em>expUI_light.theme.json</em></h3>'+G.swatch_rows(G.LIGHT,'light')+
      '<div class="ramp"><div class="ramp-h">Extra<span>Windows 专用</span></div><div class="ramp-g">'+
      ''.join(f'<button class="sw" data-hex="{h}" style="--c:{h}" title="{n} {h}"><span class="sw-c"></span>'
              f'<span class="sw-n">{n[:9]}</span><span class="sw-h">{h}</span></button>' for n,h,_ in G.EXTRA_LIGHT)+
      '</div></div></div></div>'))
    parts.append(sec('s3',3,'语义 token',
      '写 CSS 时只用这一层，不要直接写 Gray/Blue 的编号。'
      'Light 主题有个反直觉的地方：<b>Header 是深色的</b>（Gray2 #27282E），'
      '通体浅色是另一个变体「Light with Light Header」。',
      G.semantic_table()))
    parts.append(sec('s4',4,'字体与字号',
      'UI 用鸿蒙黑体（HarmonyOS Sans SC），代码用 JetBrains Mono；字体文件在 <code>fonts/</code>，由 <code>tokens.css</code> 引入。'
      '字重用 400 / 500 / 600 三档，不用 700。（Int UI Kit 原文注明 Figma 里标 Medium 的实现里是 Regular；换成鸿蒙黑体后 500 用于强调。）',
      G.type_table()))
    parts.append(sec('s5',5,'尺寸与间距','高度与圆角来自 theme.json，间距来自 Int UI Kit 的 Spacing 页。',
      G.size_table()))
    parts.append(sec('s6',6,'组件库',
      '每个组件左边是名称、中间是实样（跟随本页主题）、右边是尺寸与用到的 token。'
      '实样直接用 <code>src/components.css</code> 渲染，改了组件这里会同步变。',
      GALLERY))
    parts.append(sec('s7',7,'编辑器语法色',
      '这一组<b>没有</b>从安装包 colorSchemes 核实，取自 IntelliJ 公开的 Dark / Light 默认方案，属已知局限。',
      G.syntax_table()))
    parts.append(sec('s8',8,'CSS 变量',
      '整份 <code>src/tokens.css</code>，可直接复制进别的工程。',
      '<div class="code"><button class="tbtn cp" data-copy="tokens">复制</button>'
      f'<pre id="tokens-src">{__import__("html").escape(css_vars)}</pre></div>'))
    parts.append(sec('s9',9,'来源与已知局限','',
      '<div class="tw"><table><thead><tr><th>内容</th><th>来源</th><th>可靠度</th></tr></thead><tbody>'
      '<tr><td>调色板、语义 token、高度、圆角</td><td class="v">DevEco Studio 6.0.2.670 安装包<br>lib/app.jar!/themes/expUI/*.theme.json</td><td>一手，2026-09-08 提取</td></tr>'
      '<tr><td>字号阶梯、间距</td><td class="v">JetBrains 官方 Figma「Int UI Kit」<br>Typography / Spacing 页</td><td>一手，2026-09-09 核实</td></tr>'
      '<tr><td>图标线稿</td><td class="v">安装包 expui/**/*.svg</td><td>一手（描边改为 currentColor）</td></tr>'
      '<tr><td>编辑器语法色</td><td class="v">IntelliJ 公开的 Dark / Light 默认方案</td><td><b>未从安装包核实</b></td></tr>'
      '<tr><td>.ets 图标、CodeGenie 标题栏九个图标、右侧栏 H/笔/拼图</td><td class="v">按真机截图目测重绘</td><td><b>非安装包原件</b></td></tr>'
      '<tr><td>Windows 标题栏按钮 hover 红 #E81123</td><td class="v">Windows 11 系统惯例</td><td><b>待 Windows 真机核对</b></td></tr>'
      '<tr><td>提取环境</td><td class="v">macOS 安装包（243.24978.46）</td><td>jar 内容与 Windows 一致，字体回退与 DPI 待复核</td></tr>'
      '</tbody></table></div>'))

    html=('<!doctype html>\n<html lang="zh-CN">\n<head>\n<meta charset="utf-8">\n'
      '<meta name="viewport" content="width=device-width,initial-scale=1">\n'
      '<title>Int UI 组件库与 Token</title>\n'
      '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=JetBrains+Mono:wght@400;500&display=swap">\n'
      '<link rel="stylesheet" href="../src/tokens.css">\n'
      '<link rel="stylesheet" href="../src/components.css">\n'
      '<link rel="stylesheet" href="docs.css">\n'
      '<script src="../src/icons.js"></script>\n</head>\n<body>\n'
      '<div class="wrap">\n<aside class="toc">\n'
      '<div class="brand"><span class="mk">DS</span><b>Int UI 组件库</b></div>\n'
      '<p class="sub">DevEco Studio 6.0.2 · IntelliJ 243</p>\n'
      f'<nav>{toc}</nav>\n'
      '<div class="foot">token 取自安装包 theme.json<br>字号与间距取自官方 Figma<br>'
      '本页由 <code>gen_docs_page.py</code> 生成</div>\n</aside>\n<main>\n'
      '<div class="top"><div><h1>Int UI 组件库与 Token</h1>'
      '<p class="lede">DevEco Studio（Windows）界面稿的唯一事实来源：颜色、字号、间距、组件尺寸。'
      '画任何一张 DevEco 界面稿之前，先在这里对一遍。</p></div><span class="grow"></span>'
      '<button class="tbtn" id="theme"><svg><use href="#i-moon"/></svg><span>深色</span></button></div>\n'
      '<div class="meta"><span>DevEco 6.0.2.670</span><span>IntelliJ 243 / 2024.3</span>'
      '<span>Int UI</span><span>提取 2026-09-08</span><span>Figma 核实 2026-09-09</span></div>\n'
      + '\n'.join(parts) +
      '\n</main>\n</div>\n<div class="toast" id="toast"></div>\n<script src="docs.js"></script>\n</body>\n</html>\n')
    open(os.path.join(ROOT,'docs/index.html'),'w').write(html)
    print('docs/index.html', len(html))

if __name__=='__main__':
    build()
