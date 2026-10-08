#!/usr/bin/env python3
"""把 analysis/ablation/<NN-slug>.md 汇成一页 analysis/ablation/index.html。

每份记录的格式：
  # 标题
  - 没有 Agent：…
  - 有 Agent：…
  - 多 Agent：…
  | 元素 | 结果 | 依据 |（表格）
新增或修改记录后重跑：python3 analysis/ablation/build.py
"""
import html, pathlib, re

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent.parent


def kind(result):
    r = result.strip()
    for k, words in (('del', ('删除', '删掉', '删', '移除', '去掉')), ('merge', ('合并', '并入', '收进', '收起', '折叠', '改为', '改成', '改写', '降为', '挪', '换成')), ('keep', ('保留',))):
        if any(r.startswith(w) or w in r[:6] for w in words):
            return k
    return 'merge'


def inline(s):
    s = html.escape(s)
    s = re.sub(r'`([^`]+)`', r'<code>\1</code>', s)
    s = re.sub(r'\*\*([^*]+)\*\*', r'<b>\1</b>', s)
    return s


def parse(p):
    txt = p.read_text(encoding='utf-8')
    title = re.search(r'^#\s+(.+)$', txt, re.M)
    title = title.group(1).strip() if title else p.stem
    title = re.sub(r'\s*[·—-]\s*消融记录.*$', '', title)
    three = {}
    for key in ('没有 Agent', '有 Agent', '多 Agent'):
        m = re.search(r'^[-*]\s*\**' + key + r'\**\s*[：:]\s*(.+)$', txt, re.M)
        if m:
            three[key] = m.group(1).strip()
    rows = []
    for line in txt.splitlines():
        if not line.startswith('|') or re.match(r'^\|\s*-', line):
            continue
        cells = [c.strip() for c in line.strip().strip('|').split('|')]
        if len(cells) < 3 or cells[0] in ('元素', '---'):
            continue
        rows.append((cells[0], cells[1], ' | '.join(cells[2:])))
    return title, three, rows


def main():
    items = []
    for p in sorted(HERE.glob('[0-9][0-9]-*.md')):
        title, three, rows = parse(p)
        items.append((p, title, three, rows))

    tot = {'del': 0, 'merge': 0, 'keep': 0}
    for *_, rows in items:
        for r in rows:
            tot[kind(r[1])] += 1

    nav, secs = [], []
    for p, title, three, rows in items:
        no = p.stem[:2]
        slug = p.stem
        c = {'del': 0, 'merge': 0, 'keep': 0}
        for r in rows:
            c[kind(r[1])] += 1
        nav.append(f'<a class="cat" href="#d{no}"><span class="lbl">{inline(title)}</span><span class="cnt">{c["del"]}</span></a>')
        tl = ''.join(f'<div class="tl"><em>{k}</em><span>{inline(v)}</span></div>' for k, v in three.items())
        tr = ''.join(
            f'<tr class="k-{kind(r[1])}"><td>{inline(r[0])}</td><td class="res"><span class="pill">{inline(r[1])}</span></td><td>{inline(r[2])}</td></tr>'
            for r in rows)
        demo = ROOT / 'demos' / slug / 'index.html'
        link = f'<a href="../../demos/{slug}/index.html">打开 demo</a> · ' if demo.exists() else ''
        secs.append(f'''<section class="grp" id="d{no}">
  <div class="ghead"><h3>{inline(title)}</h3><span class="cnt">删 {c["del"]} · 合并/改 {c["merge"]} · 留 {c["keep"]}</span></div>
  <p class="note">{link}<a href="{slug}.md">原始记录</a></p>
  <div class="three">{tl}</div>
  <div class="tw"><table><thead><tr><th>元素</th><th>结果</th><th>依据</th></tr></thead><tbody>{tr}</tbody></table></div>
</section>''')

    page = f'''<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>消融记录</title>
<meta name="description" content="全部 demo 终轮消融：每页先写没有 Agent / 有 Agent / 多 Agent 三种做法，再逐元素记录删除、合并或保留及依据。">
<link rel="stylesheet" href="../../deveco-intui-kit/src/tokens.css">
<link rel="stylesheet" href="../../site/launcher.css">
<style>
.three{{display:grid;gap:6px;margin:0 0 14px;padding:14px 16px;border-radius:16px;background:var(--ui-editor-bg)}}
.tl{{display:grid;grid-template-columns:72px minmax(0,1fr);gap:10px;font-size:var(--fs);line-height:20px}}
.tl em{{font-style:normal;color:var(--ui-fg-info);white-space:nowrap}}
.tw{{overflow-x:auto;border-radius:16px;background:var(--ui-editor-bg)}}
table{{width:100%;border-collapse:collapse;font-size:var(--fs);line-height:20px}}
th,td{{text-align:left;vertical-align:top;padding:9px 14px}}
th{{font-weight:600;color:var(--ui-fg-info);font-size:var(--fs-sm)}}
tbody tr+tr td{{border-top:1px solid color-mix(in srgb,var(--ui-fg) 6%,transparent)}}
td:first-child{{width:30%}} td.res{{width:1%;white-space:nowrap}}
.pill{{display:inline-block;padding:0 8px;border-radius:9px;font-size:11.5px;line-height:18px;background:color-mix(in srgb,var(--ui-fg) 7%,transparent)}}
tr.k-del .pill{{background:color-mix(in srgb,var(--ui-error) 14%,transparent);color:color-mix(in srgb,var(--ui-error) 80%,var(--ui-fg))}}
tr.k-keep .pill{{color:var(--ui-fg-info)}}
code{{font-family:var(--font-code);font-size:.92em}}
.sum{{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}}
.sum span{{font-family:var(--font-code);font-size:11px;line-height:18px;padding:1px 8px;border-radius:5px;background:var(--ui-tag-bg);color:var(--ui-tag-fg)}}
a.tbtn{{text-decoration:none}}
@media (max-width:900px){{main{{width:100%}} .sidebar nav{{max-height:none}}}}
@media (max-width:600px){{td:first-child{{width:auto}} th,td{{padding:8px 10px}} .tl{{grid-template-columns:1fr;gap:0}}}}
</style>
</head>
<body>
<div class="page">
  <header class="mast"><h1>消融记录</h1><span class="grow"></span><a class="tbtn" href="../../index.html">启动页</a></header>
  <p class="lede">终轮每个 demo 先回答三件事：没有 Agent 时怎么做、有 Agent 时操作变成什么、多个 Agent 同时在跑会遇到什么；再逐个元素问「它帮这一页任务的哪一步」，答不上就删，重复的只留一处。</p>
  <div class="sum"><span>{len(items)} 个 demo</span><span>删除 {tot["del"]}</span><span>合并 / 改写 {tot["merge"]}</span><span>保留 {tot["keep"]}</span></div>
  <div class="layout">
    <aside class="sidebar" aria-label="目录"><div class="sd-title">目录 · 删除数</div><nav>{''.join(nav)}</nav></aside>
    <main>{''.join(secs)}
      <footer><span>由 <code>analysis/ablation/build.py</code> 从同目录的 <code>NN-slug.md</code> 生成</span></footer>
    </main>
  </div>
</div>
<script>
(function(){{var KEY='deveco-launcher-theme';try{{var s=localStorage.getItem(KEY);if(s)document.documentElement.setAttribute('data-theme',s);}}catch(e){{}}}})();
</script>
</body>
</html>
'''
    (HERE / 'index.html').write_text(page, encoding='utf-8')
    print(len(items), 'records', tot)


if __name__ == '__main__':
    main()
