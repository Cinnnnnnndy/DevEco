#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
deveco-intui-kit 构建脚本

  python3 build.py              把 demo 与 docs 各打包成一个单文件 HTML，输出到 dist/
                                （单文件版没有外链，适合发给别人 / 发布成 Artifact）
  python3 build.py sync-icons   src/icons.svg 改过之后，重新生成 src/icons.js
  python3 build.py docs         只重新生成 docs/index.html（等同 tools/gen_docs_page.py）

日常在 demo/index.html 与 docs/index.html 上直接双击预览即可，不需要构建。
"""
import os, re, sys, json, subprocess

ROOT = os.path.dirname(os.path.abspath(__file__))
def rd(p):  return open(os.path.join(ROOT, p), encoding='utf-8').read()
def wr(p,s):
    full=os.path.join(ROOT,p); os.makedirs(os.path.dirname(full),exist_ok=True)
    open(full,'w',encoding='utf-8').write(s); print('  →', p, f'({len(s):,} bytes)')

FONTS = ('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?'
         'family=Inter:wght@400;600&family=JetBrains+Mono:wght@400;500&display=swap">')

def sync_icons():
    """src/icons.svg → src/icons.js（以 JS 注入，file:// 下也能用）"""
    sprite = rd('src/icons.svg').strip()
    js = ('/* 由 build.py sync-icons 生成，不要直接改这个文件；改 src/icons.svg */\n'
          'window.INT_UI_SPRITE = ' + json.dumps(sprite, ensure_ascii=False) + ';\n'
          "document.addEventListener('DOMContentLoaded',function(){"
          "var d=document.createElement('div');"
          "d.style.cssText='position:absolute;width:0;height:0;overflow:hidden';"
          "d.innerHTML=window.INT_UI_SPRITE;"
          "document.body.insertBefore(d,document.body.firstChild)});\n")
    wr('src/icons.js', js)

def inline(page_path, out_path, title=None):
    """把一个多文件页面打成单文件：内联 css / js / 图标雪碧图"""
    html = rd(page_path)
    base = os.path.dirname(page_path)

    def css_repl(m):
        href = m.group(1)
        if href.startswith('http'): return m.group(0)          # 字体外链保留
        return '<style>\n/* ← ' + href + ' */\n' + rd(os.path.normpath(os.path.join(base, href))) + '\n</style>'
    html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', css_repl, html)

    def js_repl(m):
        src = m.group(1)
        if src.endswith('icons.js'):                            # 图标直接内联成 svg，省一层
            return '<!-- icons -->\n' + rd('src/icons.svg')
        return '<script>\n/* ← ' + src + ' */\n' + rd(os.path.normpath(os.path.join(base, src))) + '\n</script>'
    html = re.sub(r'<script src="([^"]+)"></script>', js_repl, html)

    if title: html = re.sub(r'<title>.*?</title>', f'<title>{title}</title>', html, count=1)
    wr(out_path, html)

def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'all'
    if cmd in ('sync-icons','icons'):
        sync_icons(); return
    if cmd == 'docs':
        subprocess.run([sys.executable, os.path.join(ROOT,'tools/gen_docs_page.py')], check=True); return
    print('打包单文件：')
    sync_icons()
    inline('demo/index.html', 'dist/deveco-main-window.html')
    inline('docs/index.html', 'dist/intui-tokens-docs.html')
    print('完成。dist/ 里的两个文件可以直接发给别人或发布成 Artifact。')

if __name__ == '__main__':
    main()
