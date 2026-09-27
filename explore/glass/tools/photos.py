#!/usr/bin/env python3
"""把 explore/glass/photos/ 里的照片登记成 photos.js。

用法（在仓库根目录）：
    python3 explore/glass/tools/photos.py

做三件事：
1. 长边超过 2560px 的照片缩到 2560（覆盖原文件，JPEG 质量 86），网页里用不到更大的；
2. 每张照片算一张 64 列的小色块网格（base64 RGB），页面用它判断「玻璃底下是亮还是暗」
   和提取景色主色——file:// 打开时浏览器不让 canvas 读本地图片像素，所以提前算好；
3. 写 photos/photos.js。已有条目的 name 会保留，想改照片名字直接改 photos.js 里的 name 再重跑。

以 _standin- 开头的是合成的占位风景图，排在真照片后面。
依赖：Pillow（pip install pillow）。
"""
import base64
import json
import re
from pathlib import Path

from PIL import Image, ImageOps

HERE = Path(__file__).resolve().parent.parent
PHOTOS = HERE / 'photos'
OUT = PHOTOS / 'photos.js'
MAX_SIDE = 2560
GRID_W = 64
EXTS = {'.jpg', '.jpeg', '.png', '.webp'}


def old_names():
    if not OUT.exists():
        return {}
    m = re.search(r'=\s*(\[.*\])\s*;?\s*$', OUT.read_text('utf-8'), re.S)
    if not m:
        return {}
    try:
        return {p['src'].split('/')[-1]: p.get('name') for p in json.loads(m.group(1))}
    except (ValueError, KeyError):
        return {}


def main():
    names = old_names()
    files = sorted(p for p in PHOTOS.iterdir() if p.suffix.lower() in EXTS)
    files.sort(key=lambda p: (p.name.startswith('_standin-'), p.name.lower()))
    entries = []
    for i, f in enumerate(files):
        im = Image.open(f)
        im = ImageOps.exif_transpose(im).convert('RGB')
        if max(im.size) > MAX_SIDE:
            im.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
            if f.suffix.lower() in ('.jpg', '.jpeg'):
                im.save(f, quality=86, optimize=True, progressive=True)
            else:
                im.save(f)
            print(f'缩小 {f.name} → {im.size[0]}×{im.size[1]}')
        gh = max(1, round(GRID_W * im.size[1] / im.size[0]))
        grid = im.resize((GRID_W, gh), Image.BOX).tobytes()
        standin = f.name.startswith('_standin-')
        default = f.stem.replace('_standin-', '') if standin else f'照片 {i + 1}'
        entries.append({
            'src': f'photos/{f.name}',
            'name': names.get(f.name) or default,
            'w': im.size[0], 'h': im.size[1],
            'standin': standin,
            'gw': GRID_W, 'gh': gh,
            'grid': base64.b64encode(grid).decode('ascii'),
        })
    body = ',\n'.join('  ' + json.dumps(e, ensure_ascii=False) for e in entries)
    OUT.write_text(
        '/* 由 tools/photos.py 生成：照片清单 + 每张 64 列的色块网格（判断明暗、取景色用）。\n'
        '   name 可以手改，重跑脚本会保留。 */\n'
        f'window.GLASS_PHOTOS = [\n{body}\n];\n', 'utf-8')
    print(f'写入 {OUT.relative_to(HERE.parent.parent)}：{len(entries)} 张')


if __name__ == '__main__':
    main()
