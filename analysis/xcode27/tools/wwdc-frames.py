#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
从 WWDC26 session 视频按时间点截图，给 REPORT-Xcode27新特性研究.html 配图。

两种用法：
  1. 联网下载（要能访问 Apple 视频 CDN devstreaming-cdn.apple.com）
       python3 analysis/xcode27/tools/wwdc-frames.py                # 全部 session
       python3 analysis/xcode27/tools/wwdc-frames.py 260 258        # 只截这几个
     云端环境默认拦这个域名：会话标题栏的云环境菜单 → Edit → Network access，
     把 devstreaming-cdn.apple.com 加进 Allowed domains（保留「Allow package managers」）。
  2. 用自己下好的视频（在本机浏览器里从 session 页面点 HD Video 下载）
       python3 analysis/xcode27/tools/wwdc-frames.py --video 260=~/Downloads/wwdc2026-260_hd.mp4

  --list  只列出要截的画面，不下载
  --sd    用标清视频（下载快，画面只有 960 宽）

输出：analysis/xcode27/images/wwdc/<session>-<名字>.webp（最宽 1600）。下载的视频放临时目录，用完即删。
依赖：curl、ffmpeg、Pillow。时间点取自逐字稿里报告引用的那一句，往后挪 1–2 秒让画面跟上。
"""
import os, re, subprocess, sys, tempfile
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(os.path.dirname(HERE), 'images', 'wwdc')
PAGE = 'https://developer.apple.com/videos/play/wwdc2026/{}/'

FRAMES = {
    '260': [  # Get the most out of Device Hub
        ('1:47', 'compact', '紧凑窗'), ('2:10', 'tv-controls', 'Apple TV 的控件'),
        ('2:17', 'vision-controls', 'Vision Pro 的控件'), ('2:22', 'watch-controls', 'Watch 的侧键与表冠'),
        ('2:36', 'full-window', '展开成完整窗口'), ('3:22', 'canvas-live', '画布里的活屏'),
        ('3:58', 'canvas-controls', '缩放、1:1、改尺寸、键盘捕获'), ('4:59', 'sidebar', '侧栏库存'),
        ('5:08', 'filter-menu', '过滤与排序'), ('5:17', 'context-menu', '右键快捷操作'),
        ('5:44', 'multi-compact', '多台紧凑窗并排'), ('6:28', 'settings', '设置面板'),
        ('6:42', 'conditions', '位置等模拟条件'), ('6:56', 'diagnostics', '诊断报告'),
        ('7:20', 'info', '设备信息'), ('7:30', 'apps', '应用与数据容器'), ('7:39', 'profiles', '描述文件'),
        ('9:12', 'pair-nearby', '无线配对'), ('9:25', 'pair-pin', '输入 PIN'), ('9:40', 'paired', '手表出现在侧栏'),
        ('10:06', 'drop-profile', '拖入描述文件'), ('10:57', 'bug', '横屏后文字被截断'),
        ('11:09', 'sysdiagnose', '抓 sysdiagnose'), ('11:31', 'copy-text', '从设备复制文字'),
        ('12:05', 'container', '下载数据容器'), ('13:27', 'replace-container', '换上同事的数据'),
        ('14:23', 'location', '位置设为约翰内斯堡'), ('14:50', 'text-size', '调大字号后复现'),
        ('16:08', 'devicectl', 'devicectl 命令行'),
    ],
    '258': [  # What's new in Xcode 27
        ('1:24', 'toolbar', '新工具栏'), ('1:48', 'three-way', '预览 / 辅助 / 评审三段开关'),
        ('2:12', 'toolbar-customize', '自定义工具栏'), ('2:46', 'theme-sliders', '主题的两个滑块'),
        ('3:06', 'theme-gradient', '背景推满成渐变'), ('4:44', 'workspace-theme', '按工作区设主题'),
        ('5:46', 'predicted-issues', '淡色的预测问题'), ('6:23', 'new-project-menu', '新建的四种起点'),
        ('6:53', 'untitled-project', '无标题工程'), ('7:22', 'single-file', '单文件出预览'),
        ('7:52', 'conversation-editor', '对话进编辑区'), ('8:36', 'plan-command', '/plan'),
        ('9:04', 'plan-review', '读计划、批注'), ('9:39', 'assistant-sidebar', '会话侧栏'),
        ('10:17', 'dh-compact', 'Device Hub 紧凑窗'), ('10:44', 'dh-inspector', 'Device Hub 检查器'),
        ('11:15', 'dh-resize', '改尺寸'), ('12:05', 'dh-physical-ipad', '侧栏里的 iPad 真机'),
        ('14:30', 'loc-progress', '本地化进度'), ('15:24', 'loc-generate', '目录里生成译文'),
        ('18:01', 'organizer-overview', 'Organizer 总览'), ('19:40', 'metric-goals', '目标线'),
        ('20:50', 'generate-recommendations', '生成建议'), ('22:56', 'top-functions', 'Top Functions'),
        ('26:12', 'cloud-get-started', 'Xcode Cloud 上手'),
    ],
    '102': [  # Platforms State of the Union
        ('48:01', 'dh-window', 'Device Hub 窗口'), ('48:20', 'dh-settings', '切深色、调字号'),
        ('48:33', 'dh-resize', '捏合缩放与改尺寸'), ('48:47', 'dh-physical-iphone', '操作桌上的 iPhone'),
        ('53:50', 'agent-testing', 'Agent 在 Device Hub 里测'), ('54:00', 'test-summary', '测试小结与截图'),
        ('55:23', 'top-crashes', '对话里拉出 top 崩溃'),
    ],
    '259': [  # Xcode, agents, and you
        ('2:38', 'new-conversation', '新建会话'), ('5:24', 'artifacts', '产物栏'), ('7:46', 'plan-mode', '计划模式'),
        ('9:11', 'queued', '追问排队'), ('10:00', 'plan-markdown', '计划是 Markdown'), ('10:20', 'diff-artifact', '改动以 diff 出现'),
        ('15:05', 'chart-previews', '每种图表一张预览'), ('17:08', 'inline-annotations', '行内批注'),
        ('19:58', 'parallel', '两个会话并行'), ('20:52', 'progress', '随时看进度'),
    ],
    '213': [  # Translate your app using agents in Xcode
        ('2:21', 'ask', '一句话加语言'), ('3:52', 'context', '每条字符串带上下文'), ('4:10', 'plurals', '复数自动拆'),
        ('6:40', 'adjust', '一句话改译法'), ('8:48', 'truncation', '查截断'),
    ],
    '227': [('5:10', 'ten-options', '十个方案并排')],  # Create UI prototypes using agents in Xcode
    '268': [  # Profile, fix, and verify
        ('10:49', 'top-functions', 'Top Functions'), ('14:10', 'compare', '选基线对比'),
        ('15:05', 'compare-flame', '红绿火焰图'), ('16:34', 'executors', '执行器轨道'),
    ],
    '261': [('3:07', 'get-started', '开始接入'), ('4:30', 'default-workflow', '默认流程'), ('7:20', 'create-app', '发版时建记录')],
}


def secs(t):
    m, s = t.split(':')
    return int(m) * 60 + int(s)


def video_url(session, quality):
    html = subprocess.run(['curl', '-sS', '-f', PAGE.format(session)], capture_output=True, text=True, check=True).stdout
    links = re.findall(r'https://devstreaming-cdn\.apple\.com/videos/wwdc/\d+/' + session + r'/[^"\']+?_(?:hd|sd)\.mp4\?dl=1', html)
    pick = [u for u in links if '_%s.mp4' % quality in u] or links
    if not pick:
        sys.exit('session %s 页面里没找到视频下载链接' % session)
    return pick[0]


def grab(video, session, frames):
    os.makedirs(OUT, exist_ok=True)
    with tempfile.TemporaryDirectory() as td:
        for t, name, _ in frames:
            png = os.path.join(td, name + '.png')
            subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-ss', str(secs(t)), '-i', video, '-frames:v', '1', png], check=True)
            im = Image.open(png).convert('RGB')
            if im.width > 1600:
                im = im.resize((1600, round(im.height * 1600 / im.width)), Image.LANCZOS)
            dst = os.path.join(OUT, '%s-%s.webp' % (session, name))
            im.save(dst, 'WEBP', quality=82, method=6)
            print('→', os.path.relpath(dst), t)


def main(argv):
    quality = 'sd' if '--sd' in argv else 'hd'
    local = dict(a.split('=', 1) for a in (argv[i + 1] for i, x in enumerate(argv) if x == '--video'))
    picked = [a for a in argv if a in FRAMES] or (list(local) if local else list(FRAMES))
    if '--list' in argv:
        for s in picked:
            for t, name, note in FRAMES[s]:
                print('%s  %6s  %-24s %s' % (s, t, name, note))
        return
    for s in picked:
        if s in local:
            grab(os.path.expanduser(local[s]), s, FRAMES[s])
            continue
        url = video_url(s, quality)
        with tempfile.TemporaryDirectory() as td:
            mp4 = os.path.join(td, '%s.mp4' % s)
            print('下载', url)
            if subprocess.run(['curl', '-sS', '-f', '-L', '-o', mp4, url]).returncode:
                sys.exit('下载失败：多半是网络拦了 devstreaming-cdn.apple.com（见文件头说明），'
                         '或在本机下好视频后用 --video %s=<路径>' % s)
            grab(mp4, s, FRAMES[s])


if __name__ == '__main__':
    main(sys.argv[1:])
