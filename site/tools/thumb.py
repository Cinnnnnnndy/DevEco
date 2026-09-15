#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
给 demo 出启动页缩略图：无头 Chromium 截 1600×1000，裁成 16:10 缩到 640×400，存 site/thumbs/<slug>.jpg
用法：python3 site/tools/thumb.py 20-connect-status [07-agent-team …]
     python3 site/tools/thumb.py --all        # demos/ 下所有带 index.html 的目录（_shared 除外）
依赖：Pillow（pip install pillow）；Chromium 路径按环境改 CHROME。
"""
import os, sys, subprocess, tempfile
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CHROME = os.environ.get('CHROME') or next((p for p in [
    '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
] if os.path.exists(p)), None)

def shoot(slug):
    src = os.path.join(ROOT, 'demos', slug, 'index.html')
    if not os.path.exists(src):
        print('skip (no index.html):', slug); return
    out = os.path.join(ROOT, 'site', 'thumbs', slug + '.jpg')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with tempfile.TemporaryDirectory() as td:
        png = os.path.join(td, 'shot.png')
        cmd = [CHROME, '--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars',
               '--window-size=1600,1000', '--virtual-time-budget=2500', '--screenshot=' + png, 'file://' + src]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        im = Image.open(png).convert('RGB')
        w, h = im.size
        th = int(w / 1.6)
        im = im.crop((0, 0, w, min(h, th))).resize((640, 400), Image.LANCZOS)
        im.save(out, 'JPEG', quality=84, optimize=True)
    print('→', os.path.relpath(out, ROOT), os.path.getsize(out), 'bytes')

if __name__ == '__main__':
    if not CHROME:
        sys.exit('找不到 Chromium，设环境变量 CHROME=/path/to/chrome')
    args = sys.argv[1:]
    if not args or args == ['--all']:
        args = sorted(d for d in os.listdir(os.path.join(ROOT, 'demos'))
                      if not d.startswith('_') and os.path.exists(os.path.join(ROOT, 'demos', d, 'index.html')))
    for s in args: shoot(s)
