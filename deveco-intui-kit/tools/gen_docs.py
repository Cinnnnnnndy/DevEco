# -*- coding: utf-8 -*-
"""生成 docs/index.html —— 组件库与 token 规范页。
   数据在 tools_data.py；改完数据跑 python3 gen_docs.py 重新生成。"""
import html, json
from data import DARK, LIGHT, EXTRA_LIGHT, SEMANTIC, TYPE, SIZES, SYNTAX

def esc(x): return html.escape(str(x))

def swatch_rows(pal, theme):
    out=[]
    for name, arr in pal.items():
        cells=''.join(
            f'<button class="sw" data-hex="{h}" style="--c:{h}" title="{name}{i+1} {h}">'
            f'<span class="sw-c"></span><span class="sw-n">{name}{i+1}</span>'
            f'<span class="sw-h">{h}</span></button>' for i,h in enumerate(arr))
        out.append(f'<div class="ramp"><div class="ramp-h">{name}<span>{len(arr)} 级</span></div><div class="ramp-g">{cells}</div></div>')
    return '\n'.join(out)

def semantic_table():
    groups={}
    for g,u,d,l,k in SEMANTIC: groups.setdefault(g,[]).append((u,d,l,k))
    out=[]
    for g,rows in groups.items():
        body=''.join(
            f'<tr><td>{esc(u)}</td><td class="v">{d}</td><td class="v">{l}</td><td class="k">{esc(k)}</td></tr>'
            for u,d,l,k in rows)
        out.append(f'<h3 class="grp">{esc(g)}</h3><div class="tw"><table><thead><tr>'
                   f'<th>用途</th><th>Dark</th><th>Light</th><th>来源 key（theme.json）</th>'
                   f'</tr></thead><tbody>{body}</tbody></table></div>')
    return '\n'.join(out)

def type_table():
    rows=''
    for role,w,fs,lh,use in TYPE:
        mono=' mono' if role.startswith('Editor') else ''
        weight='600' if 'Semibold' in w else '400'
        sample='Aa 开发工具 DevEco 123' if not mono else 'const message = 123'
        rows+=(f'<tr><td class="r">{esc(role)}</td>'
               f'<td class="s"><span class="samp{mono}" style="font-size:{fs}px;line-height:{lh}px;font-weight:{weight}">{esc(sample)}</span></td>'
               f'<td class="v">{esc(w)}</td><td class="v">{fs} / {lh}</td><td>{esc(use)}</td></tr>')
    return ('<div class="tw"><table><thead><tr><th>角色</th><th>实样</th><th>字重</th>'
            '<th>字号 / 行高</th><th>用在哪</th></tr></thead><tbody>'+rows+'</tbody></table></div>')

def size_table():
    groups={}
    for g,n,v,note in SIZES: groups.setdefault(g,[]).append((n,v,note))
    out=[]
    for g,rows in groups.items():
        body=''.join(f'<tr><td>{esc(n)}</td><td class="v num">{esc(v)}</td><td>{esc(note)}</td></tr>' for n,v,note in rows)
        out.append(f'<h3 class="grp">{esc(g)}</h3><div class="tw"><table><thead><tr><th>对象</th>'
                   f'<th>值 (px)</th><th>备注</th></tr></thead><tbody>{body}</tbody></table></div>')
    return '\n'.join(out)

def syntax_table():
    rows=''.join(
        f'<tr><td>{esc(n)}</td>'
        f'<td class="v"><span class="dot" style="background:{d}"></span>{d}</td>'
        f'<td class="v"><span class="dot" style="background:{l}"></span>{l}</td></tr>'
        for n,d,l in SYNTAX)
    return ('<div class="tw"><table><thead><tr><th>语法角色</th><th>Dark</th><th>Light</th>'
            '</tr></thead><tbody>'+rows+'</tbody></table></div>')

def tokens_json():
    return json.dumps({'palette':{'dark':DARK,'light':LIGHT,
        'light_extra':{k:v for k,v,_ in EXTRA_LIGHT}},
        'type':[{'role':r,'weight':w,'size':int(fs),'lineHeight':int(lh),'use':u} for r,w,fs,lh,u in TYPE],
        'syntax':{n:{'dark':d,'light':l} for n,d,l in SYNTAX}}, ensure_ascii=False, indent=2)
