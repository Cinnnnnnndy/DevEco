"""质感卡片 · 照片纹理算法

把参考照片里画圈的那一块变成一张抽象纹理：不画任何图形，光、渐变、质感全都来自照片自己的像素。
每张卡片一个「配方」，由下面几种公开的图像处理 / 数字艺术做法组合而成：

  拖曳曝光 icm()       模拟摄影里的「有意识的相机移动」（ICM）：每个像素沿一条设计好的运动路径
                       （竖直、水平、绕圈、放射）把照片积分起来。竖拖出水幕，横拖出天际线，绕圈拖出弧。
  流线卷积 lic()       Cabral & Leedom 1993（Line Integral Convolution）：沿照片自己的纹理走向抹开；
                       走向由结构张量算出（Kyprianidis & Döllner 2008 / Kang 等 2009 的边缘切向流）。
  各向异性 Kuwahara akf()  Kyprianidis、Kang、Döllner 2009，多项式权重版（GPU Pro 2011）：油画式抽象，
                       保住边、把细碎的东西按走向压成有方向的色块。
  图像绗缝 quilt()     Efros & Freeman 2001（Image Quilting）：把照片切成小块、按重叠误差挑块、
                       沿最小误差路径缝起来，拼成一张更大的、没有具体物体的纹理。
  纹理迁移 transfer()  同一篇论文第 4 节：按一张设计好的构图（例如倾斜的地层）去挑块来拼，
                       构图是参数化的，纹理全是照片的。
  像素拉伸（tower 里）  slit-scan：取最有代表性的一行拉满整张，只留下横向的序列，再把原来的明暗乘回去。
  沿流向修补 inpaint_flow()  用户画的红圈先识别出来，沿拖曳方向多尺度扩散补掉，拖完不留接缝。
  后期                 泛光（亮部多尺度模糊叠回去）、曲线和饱和度、细颗粒。
  色卡 palette() / abstract()  Lab 空间 k-means 取 6 个主色（色度放大，小而鲜的颜色也能成一类）；
                       沿每张的主路径再两头拖 0.35 个卡片高、糊一层，按调色板做渐变映射，就是最抽象的一版。

用法（在仓库根目录）：
  pip install numpy opencv-python numba
  python3 explore/cards/tools/texture.py            # 全部重新生成
  python3 explore/cards/tools/texture.py fall moon  # 只生成这几张
输入：tools/src/<名字>.jpg（参考照片画圈附近的原图裁切，红圈还在，脚本自己处理）
输出：
  tex/<名字>.webp       纹理成品（瀑布 1600×1000，其余 800×1000）；毛玻璃的由其余九张的竖条拼成
  tex/base/<名字>.webp  工作台的起点：拖曳、Kuwahara、调色这些能在工作台里调的步骤之前的那一张
  tex/abs/<名字>.webp   最抽象的一版（色卡页用）：沿主路径长拖 + 按调色板渐变映射
  tex/data.js           每张的调色板、占比、渐变映射的亮度范围（色卡页和工作台共用）
"""
import json
import math
import os
import sys
import time

import cv2
import numpy as np
from numba import njit, prange

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')
OUT = os.path.join(os.path.dirname(HERE), 'tex')
PI = math.pi
LUMA = np.array([.2126, .7152, .0722], np.float32)


# ---------------------------------------------------------------- 读写、取景
def read(name):
    return cv2.cvtColor(cv2.imread(os.path.join(SRC, name + '.jpg')), cv2.COLOR_BGR2RGB)


def write(name, img, q=86, sub=''):
    rgb8 = np.clip(img * 255 + .5, 0, 255).astype(np.uint8)
    cv2.imwrite(os.path.join(OUT, sub, name + '.webp'), cv2.cvtColor(rgb8, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_WEBP_QUALITY, q])


def fit(img, w, h):
    """等比缩放到刚好盖住 w×h，再居中裁"""
    H, W = img.shape[:2]
    s = max(w / W, h / H)
    size = (max(w, int(round(W * s))), max(h, int(round(H * s))))
    r = cv2.resize(img, size, interpolation=cv2.INTER_AREA if s < 1 else cv2.INTER_CUBIC)
    y, x = (r.shape[0] - h) // 2, (r.shape[1] - w) // 2
    return np.ascontiguousarray(r[y:y + h, x:x + w])


def lum(img):
    return img @ LUMA


def smooth(x, a, b):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


# ---------------------------------------------------------------- 红圈：识别 + 沿流向修补
def stroke_mask(rgb8, dilate=27):
    """用户画的红圈：色相在 ±6° 以内、饱和和明度都在一个窄区间、R 比 G 高很多、G≈B；只留成片的笔画，再膨胀盖住描边的虚边"""
    hsv = cv2.cvtColor(rgb8, cv2.COLOR_RGB2HSV_FULL)
    hd = hsv[..., 0].astype(np.float32) * 360 / 256
    s, v = hsv[..., 1].astype(int), hsv[..., 2].astype(int)
    r, g, b = [rgb8[..., i].astype(int) for i in range(3)]
    m = (((hd > 352) | (hd < 7)) & (s > 140) & (s < 225) & (v > 135) & (v < 228)
         & (r - g > 95) & (np.abs(g - b) < 22)).astype(np.uint8) * 255
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m)
    keep = np.zeros_like(m)
    for i in range(1, n):
        if st[i, cv2.CC_STAT_AREA] > 400:
            keep[lab == i] = 255
    return cv2.dilate(keep, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (dilate, dilate)))


# 红圈要盖多宽：按原照片的宽度定（原片 1368 宽的 27 像素，1500 宽的 31，2000 宽的 41）
DILATE = {'rainbow': 31, 'mirror': 31, 'tundra': 41, 'spring': 41}


def load(name, scale=1.):
    """读原图裁切，先用 Telea 粗补一遍红圈（给沿流向修补一个起点），返回 (图 0..1, 红圈掩码 0..1)"""
    rgb = read(name)
    m = stroke_mask(rgb, DILATE.get(name, 27))
    if m.any():
        rgb = cv2.inpaint(rgb, m, 9, cv2.INPAINT_TELEA)
    img, hole = rgb.astype(np.float32) / 255., m.astype(np.float32) / 255.
    if scale != 1.:
        img = cv2.resize(img, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA if scale < 1 else cv2.INTER_CUBIC)
        hole = cv2.resize(hole, (img.shape[1], img.shape[0]))
    return img, hole


def inpaint_flow(img, hole, fx, fy, steps=(48, 24, 12, 6, 3, 1.5), iters=40):
    """洞里的像素反复取「顺流 / 逆流各走一步」的平均，步长从大到小；补出来的东西顺着拖影方向连起来"""
    H, W = hole.shape
    xs, ys = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))
    x = img.copy()
    hm = hole > .5
    if not hm.any():
        return x
    for st in steps:
        m1 = (xs + st * fx, ys + st * fy); m2 = (xs - st * fx, ys - st * fy)
        for _ in range(iters):
            a = cv2.remap(x, *m1, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
            b = cv2.remap(x, *m2, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
            x[hm] = (.5 * (a + b))[hm]
    return x


# ---------------------------------------------------------------- 运动路径（单位向量场，按卡片高做单位）
def field(kind, w, h, cx=.5, cy=.5, k=0., ang=0.):
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    X, Y = (x - cx * w) / h, (y - cy * h) / h
    if kind == 'dir':      # 一个方向平拖
        fx = np.full((h, w), math.cos(ang), np.float32); fy = np.full((h, w), math.sin(ang), np.float32)
    elif kind == 'zoom':   # 从 (cx, cy) 往外放射，k 加一点旋
        r = np.sqrt(X * X + Y * Y) + 1e-6; fx = X / r - k * Y / r; fy = Y / r + k * X / r
    elif kind == 'spin':   # 绕 (cx, cy) 转，k 加一点向外
        r = np.sqrt(X * X + Y * Y) + 1e-6; fx = -Y / r + k * X / r; fy = X / r + k * Y / r
    else:
        raise ValueError(kind)
    n = np.sqrt(fx * fx + fy * fy) + 1e-9
    return (fx / n).astype(np.float32), (fy / n).astype(np.float32)


def frame(name, w, h, kind, scale=1., **fk):
    """取景 + 运动路径 + 沿这条路径把红圈补掉"""
    img, hole = load(name, scale)
    img = fit(img, w, h); hole = fit(hole[..., None].repeat(3, 2), w, h)[..., 0]
    fx, fy = field(kind, w, h, **fk)
    return inpaint_flow(img, hole, fx, fy), fx, fy


# ---------------------------------------------------------------- 拖曳曝光（ICM）
def icm(img, fx, fy, L=60, h=1., tau=None, both=False):
    """沿 (fx, fy) 走 L 步，每步取一次照片累加。tau：拖影按 exp(-k/tau) 衰减（单向拖尾），None 为均匀；both：往两头拖"""
    H, W = fx.shape
    xs, ys = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))
    acc = img.copy(); ws = 1.
    for sgn in ((1., -1.) if both else (1.,)):
        px, py = xs.copy(), ys.copy()
        for k in range(1, L + 1):
            vx = cv2.remap(fx, px, py, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT) * sgn
            vy = cv2.remap(fy, px, py, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT) * sgn
            px += h * vx; py += h * vy
            wk = 1. if tau is None else math.exp(-k / tau)
            acc += wk * cv2.remap(img, px, py, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT); ws += wk
    return acc / ws


# ---------------------------------------------------------------- 结构张量 / 流线卷积
def etf(img, sigma=3., pre=1.):
    """结构张量 → 切向（最弱变化方向）和各向异性程度 A"""
    g = cv2.GaussianBlur(img, (0, 0), pre) if pre > 0 else img
    ix = cv2.Sobel(g, cv2.CV_32F, 1, 0, ksize=3) / 8.
    iy = cv2.Sobel(g, cv2.CV_32F, 0, 1, ksize=3) / 8.
    E, F, G = [cv2.GaussianBlur(a, (0, 0), sigma) for a in ((ix * ix).sum(2), (ix * iy).sum(2), (iy * iy).sum(2))]
    d = np.sqrt((E - G) ** 2 + 4 * F * F)
    l1, l2 = .5 * (E + G + d), .5 * (E + G - d)
    tx, ty = l1 - E, -F
    n = np.sqrt(tx * tx + ty * ty)
    ok = n > 1e-9
    tx = np.where(ok, tx / np.maximum(n, 1e-9), 0.).astype(np.float32)
    ty = np.where(ok, ty / np.maximum(n, 1e-9), 1.).astype(np.float32)
    A = np.where(l1 + l2 > 1e-9, (l1 - l2) / np.maximum(l1 + l2, 1e-9), 0.).astype(np.float32)
    return tx, ty, A


def lic(img, tx, ty, L=20, h=1.):
    """沿切向场双向积分，高斯权重；切向没有正负号，每一步和上一步对齐"""
    H, W = tx.shape
    xs, ys = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))
    sig = L / 2.; acc = img.copy(); ws = 1.
    for sgn in (1., -1.):
        px, py = xs.copy(), ys.copy(); pdx, pdy = tx * sgn, ty * sgn
        for k in range(1, L + 1):
            vx = cv2.remap(tx, px, py, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
            vy = cv2.remap(ty, px, py, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
            s = np.where(vx * pdx + vy * pdy < 0, -1., 1.).astype(np.float32)
            vx *= s; vy *= s
            px += h * vx; py += h * vy; pdx, pdy = vx, vy
            wk = math.exp(-.5 * (k / sig) ** 2)
            acc += wk * cv2.remap(img, px, py, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT); ws += wk
    return acc / ws


# ---------------------------------------------------------------- 各向异性 Kuwahara（8 扇区，多项式权重）
@njit(parallel=True, fastmath=True)
def _akf(img, tx, ty, A, radius, alpha, q, hard, zc):
    H, W, _ = img.shape
    out = np.empty_like(img)
    zeta = 2.0 / radius
    sz = math.sin(zc)
    eta = (zeta + math.cos(zc)) / (sz * sz)
    for y in prange(H):
        m = np.zeros((8, 3)); s = np.zeros((8, 3)); wsum = np.zeros(8); w = np.zeros(8)
        for x in range(W):
            m[:] = 0.; s[:] = 0.; wsum[:] = 0.
            an = A[y, x]
            a = radius * min(max((alpha + an) / alpha, .1), 2.)   # 沿走向拉长
            b = radius * min(max(alpha / (alpha + an), .1), 2.)   # 垂直走向压扁
            c_ = tx[y, x]; s_ = ty[y, x]
            mx = int(math.sqrt(a * a * c_ * c_ + b * b * s_ * s_)) + 1
            my = int(math.sqrt(a * a * s_ * s_ + b * b * c_ * c_)) + 1
            for dy in range(-my, my + 1):
                yy = min(max(y + dy, 0), H - 1)
                for dx in range(-mx, mx + 1):
                    vx = (c_ * dx + s_ * dy) * .5 / a
                    vy = (-s_ * dx + c_ * dy) * .5 / b
                    r2 = vx * vx + vy * vy
                    if r2 > .25:
                        continue
                    xx = min(max(x + dx, 0), W - 1)
                    vxx = zeta - eta * vx * vx; vyy = zeta - eta * vy * vy
                    z = max(0., vy + vxx); w[0] = z * z
                    z = max(0., -vx + vyy); w[2] = z * z
                    z = max(0., -vy + vxx); w[4] = z * z
                    z = max(0., vx + vyy); w[6] = z * z
                    ux = .70710678 * (vx - vy); uy = .70710678 * (vx + vy)
                    vxx = zeta - eta * ux * ux; vyy = zeta - eta * uy * uy
                    z = max(0., uy + vxx); w[1] = z * z
                    z = max(0., -ux + vyy); w[3] = z * z
                    z = max(0., -uy + vxx); w[5] = z * z
                    z = max(0., ux + vyy); w[7] = z * z
                    tot = 0.
                    for k in range(8):
                        tot += w[k]
                    g = math.exp(-3.125 * r2) / max(tot, 1e-9)
                    c0 = img[yy, xx, 0]; c1 = img[yy, xx, 1]; c2 = img[yy, xx, 2]
                    for k in range(8):
                        wk = w[k] * g
                        m[k, 0] += c0 * wk; m[k, 1] += c1 * wk; m[k, 2] += c2 * wk
                        s[k, 0] += c0 * c0 * wk; s[k, 1] += c1 * c1 * wk; s[k, 2] += c2 * c2 * wk
                        wsum[k] += wk
            o0 = 0.; o1 = 0.; o2 = 0.; ot = 0.
            for k in range(8):
                if wsum[k] <= 0.:
                    continue
                m0 = m[k, 0] / wsum[k]; m1 = m[k, 1] / wsum[k]; m2 = m[k, 2] / wsum[k]
                v = (abs(s[k, 0] / wsum[k] - m0 * m0) + abs(s[k, 1] / wsum[k] - m1 * m1)
                     + abs(s[k, 2] / wsum[k] - m2 * m2))
                wk = 1. / (1. + (hard * 1000. * v) ** (.5 * q))   # 方差小的扇区说了算
                o0 += m0 * wk; o1 += m1 * wk; o2 += m2 * wk; ot += wk
            out[y, x, 0] = o0 / ot; out[y, x, 1] = o1 / ot; out[y, x, 2] = o2 / ot
    return out


def akf(img, radius=5., alpha=1., q=8., hard=8., zc=.58, sigma=2.):
    tx, ty, A = etf(img, sigma)
    return _akf(np.ascontiguousarray(img, np.float64), tx.astype(np.float64), ty.astype(np.float64),
                A.astype(np.float64), float(radius), float(alpha), float(q), float(hard), float(zc)).astype(np.float32)


# ---------------------------------------------------------------- 图像绗缝 / 纹理迁移（Efros & Freeman 2001）
def _cut(err):
    """err：h×w 的重叠误差；返回沿最小误差路径切开后「保留已有像素」那一侧为 1 的掩码（竖向切缝）"""
    h, w = err.shape
    E = err.copy()
    for i in range(1, h):
        p = E[i - 1]
        E[i] += np.minimum(np.minimum(np.r_[np.inf, p[:-1]], p), np.r_[p[1:], np.inf])
    path = np.zeros(h, int); path[-1] = int(np.argmin(E[-1]))
    for i in range(h - 2, -1, -1):
        j = path[i + 1]; lo = max(j - 1, 0)
        path[i] = lo + int(np.argmin(E[i, lo:min(j + 2, w)]))
    m = np.zeros((h, w), np.float32)
    for i in range(h):
        m[i, :path[i]] = 1.
    return m


def _bad(invalid, B, frac):
    """块里无效像素占比超过 frac 的起点不能选"""
    if invalid is None:
        return None
    box = cv2.boxFilter(invalid.astype(np.float32), -1, (B, B), normalize=True, anchor=(0, 0), borderType=cv2.BORDER_CONSTANT)
    return box[:invalid.shape[0] - B + 1, :invalid.shape[1] - B + 1] > frac


def _pick(cost, bad, tol, rng):
    cost = np.where(np.isfinite(cost), cost, np.inf)
    if bad is not None:
        cost = np.where(bad, np.inf, cost)
    mn = cost.min()
    ys, xs = np.where(cost <= mn + tol * (abs(mn) + 1e-4))
    if len(ys) == 0:
        y, x = np.unravel_index(np.argmin(cost), cost.shape); return y, x
    k = rng.integers(0, len(ys))
    return ys[k], xs[k]


def _sew(tmpl, p, i, j, ov):
    B = p.shape[0]
    keep = np.zeros((B, B), np.float32)
    if j > 0:
        keep[:, :ov] = np.maximum(keep[:, :ov], _cut(((p[:, :ov] - tmpl[:, :ov]) ** 2).sum(2)))
    if i > 0:
        keep[:ov, :] = np.maximum(keep[:ov, :], _cut(((p[:ov, :] - tmpl[:ov, :]) ** 2).sum(2).T).T)
    keep = cv2.GaussianBlur(keep, (0, 0), 1.)[..., None]
    return tmpl * keep + p * (1 - keep)


def quilt(src, out_h, out_w, patch=96, overlap=24, tol=.08, seed=1, invalid=None, frac=.02):
    rng = np.random.default_rng(seed)
    bad = _bad(invalid, patch, frac)
    step = patch - overlap
    ny = int(math.ceil((out_h - overlap) / step)); nx = int(math.ceil((out_w - overlap) / step))
    out = np.zeros((ny * step + overlap, nx * step + overlap, 3), np.float32)
    for i in range(ny):
        for j in range(nx):
            y0, x0 = i * step, j * step
            tmpl = out[y0:y0 + patch, x0:x0 + patch].copy()
            mask = np.zeros((patch, patch, 3), np.float32)
            if j > 0: mask[:, :overlap] = 1
            if i > 0: mask[:overlap, :] = 1
            if i == 0 and j == 0:
                cost = np.zeros((src.shape[0] - patch + 1, src.shape[1] - patch + 1), np.float32)
                yy, xx = _pick(cost + rng.random(cost.shape).astype(np.float32), bad, 0., rng)
            else:
                yy, xx = _pick(cv2.matchTemplate(src, tmpl, cv2.TM_SQDIFF, mask=mask), bad, tol, rng)
            out[y0:y0 + patch, x0:x0 + patch] = _sew(tmpl, src[yy:yy + patch, xx:xx + patch], i, j, overlap)
    return out[:out_h, :out_w]


def _feat(img, wab, blur):
    lab = cv2.cvtColor(np.clip(img, 0, 1), cv2.COLOR_RGB2Lab)
    f = np.stack([lab[..., 0] / 100., lab[..., 1] / 100. * wab, lab[..., 2] / 100. * wab], -1).astype(np.float32)
    return cv2.GaussianBlur(f, (0, 0), blur)


def transfer(src, target, patches=(48, 32, 22), wab=1., blur=2., tol=.02, seed=1, invalid=None, frac=0.):
    """多轮：块逐轮变小，α 逐轮变大（前几轮听构图的，后几轮听相邻块和上一轮结果的）"""
    rng = np.random.default_rng(seed)
    sf, tf = _feat(src, wab, blur), _feat(target, wab, blur)
    h, w = target.shape[:2]
    out = None
    N = len(patches)
    for it, B in enumerate(patches):
        al = .8 * it / max(N - 1, 1) + .1
        ov = max(4, B // 6); step = B - ov
        bad = _bad(invalid, B, frac)
        ny = int(math.ceil((h - ov) / step)); nx = int(math.ceil((w - ov) / step))
        H, W = ny * step + ov, nx * step + ov
        tfp = cv2.copyMakeBorder(tf, 0, H - h, 0, W - w, cv2.BORDER_REFLECT)
        prev = None if out is None else cv2.copyMakeBorder(out, 0, H - h, 0, W - w, cv2.BORDER_REFLECT)
        cur = np.zeros((H, W, 3), np.float32)
        for i in range(ny):
            for j in range(nx):
                y0, x0 = i * step, j * step
                tmpl = cur[y0:y0 + B, x0:x0 + B].copy()
                m = np.zeros((B, B, 3), np.float32)
                if j > 0: m[:, :ov] = 1.
                if i > 0: m[:ov, :] = 1.
                if prev is not None:
                    tm = np.where(m > 0, tmpl, prev[y0:y0 + B, x0:x0 + B]).astype(np.float32)
                    e_ov = cv2.matchTemplate(src, tm, cv2.TM_SQDIFF, mask=np.where(m > 0, 1., .5).astype(np.float32)) / (B * B)
                elif m.any():
                    e_ov = cv2.matchTemplate(src, tmpl, cv2.TM_SQDIFF, mask=m) / max(m[..., 0].sum(), 1)
                else:
                    e_ov = 0.
                e_c = cv2.matchTemplate(sf, tfp[y0:y0 + B, x0:x0 + B], cv2.TM_SQDIFF) / (B * B)
                yy, xx = _pick(al * e_ov + (1 - al) * e_c, bad, tol, rng)
                cur[y0:y0 + B, x0:x0 + B] = _sew(tmpl, src[yy:yy + B, xx:xx + B], i, j, ov)
        out = cur[:h, :w]
        print('    迁移第', it + 1, '轮，块', B, flush=True)
    return out


# ---------------------------------------------------------------- 后期
def bloom(img, thr=.7, k=.6, sigmas=(6, 18, 48)):
    hl = np.maximum(img - thr, 0) / (1 - thr)
    return img + k * sum(cv2.GaussianBlur(hl, (0, 0), s) for s in sigmas) / len(sigmas)


def grade(img, lift=0., gamma=1., gain=1., sat=1.):
    x = np.clip(img * gain + lift * (1 - img), 0, None) ** (1 / gamma)
    l = lum(x)[..., None]
    return l + (x - l) * sat


def grain(img, amt=.008, seed=3):
    n = cv2.GaussianBlur(np.random.default_rng(seed).standard_normal(img.shape[:2]).astype(np.float32), (0, 0), .6)
    return img + amt * n[..., None]


# ================================================================ 每张卡片的配方
# 每个配方返回 (base, final)：base 是工作台的起点（拖曳、Kuwahara、调色这些能在工作台里调的步骤之前），
# final 是色卡页上的纹理。工作台（workbench.js）在 base 上把后面几步用 WebGL 重做一遍，默认参数和这里一致。
RECIPES = {}


def recipe(fn):
    RECIPES[fn.__name__] = fn
    return fn


@recipe
def fall():
    """瀑布：竖向拖曳。一层两头均匀拖 170 像素（丝一样的水幕），一层单向拖尾 60 像素（留住水花的细节），
       底部往上抬一层模糊提亮的水雾，再加泛光"""
    w, h = 1600, 1000
    base, fx, fy = frame('fall', w, h, 'dir', ang=PI / 2)
    o = .5 * icm(base, fx, fy, L=170, both=True) + .5 * icm(base, fx, fy, L=60, tau=30)
    m = smooth(np.linspace(0, 1, h, dtype=np.float32)[:, None, None], .5, 1.05) * .55
    o = o * (1 - m) + (cv2.GaussianBlur(o, (0, 0), 25) * 1.08 + .06) * m
    return base, grain(grade(bloom(o, .7, .55, (8, 24, 60)), .02, 1.05, 1., 1.05))


@recipe
def film():
    """塑料膜：图像绗缝 + 重新打光。
       1 只从镀铝膜上取块（避开印刷的大黑字、纸箱和红圈），用 56 像素的块拼成一张没有字的皱膜；
       2 除掉它自己的大块明暗，只留褶皱的细节（亮度和大半径模糊之比）；
       3 调色板从照片的膜上量——暗处、中间、高光、泛紫的那部分——按一道斜着扫过的反光重新上色：
         大的渐变是设计的，颜色和褶皱全是照片的；
       4 轻一点的各向异性 Kuwahara 和斜向短拖，让高光有点方向"""
    w, h = 800, 1000
    img, hole = load('film', 1500 / 1368)
    L = lum(img)
    dark = cv2.dilate((L < .13).astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
    hsv = cv2.cvtColor(np.clip(img, 0, 1), cv2.COLOR_RGB2HSV)
    foil = ~(dark | ((hsv[..., 1] < .35) & (L > .2)) | (hole > .5))
    fl, px = L[foil], img[foil]

    def tone(a, b):
        m = (fl >= np.percentile(fl, a)) & (fl <= np.percentile(fl, b))
        return px[m].mean(0)
    c_dark, c_mid, c_hi = tone(5, 15), tone(45, 55), tone(97, 99.8)
    violet = px[(hsv[..., 0][foil] > 250) & (hsv[..., 0][foil] < 300) & (hsv[..., 1][foil] > .3)]
    c_vio = violet.mean(0) if len(violet) > 50 else c_mid

    q = quilt(img, h, w, patch=56, overlap=14, seed=9, invalid=~foil, frac=.12, tol=.1)
    detail = np.clip(lum(q) / np.maximum(lum(cv2.GaussianBlur(q, (0, 0), 36)), 1e-3), 0, 3)[..., None]

    y, x = np.mgrid[0:h, 0:w].astype(np.float32); u, v = x / h, y / h
    d = u * .55 + v * .84
    wob = cv2.resize(np.random.default_rng(4).standard_normal((6, 5)).astype(np.float32), (w, h), interpolation=cv2.INTER_CUBIC) * .06
    lt = np.clip(.25 + .75 * np.maximum(np.exp(-((d - .52 + wob) / .16) ** 2), .7 * np.exp(-((d - 1.05 + wob * 1.4) / .1) ** 2)), 0, 1)[..., None]
    ramp = np.where(lt < .6, c_dark + (c_mid - c_dark) * (lt / .6), c_mid + (c_hi - c_mid) * ((lt - .6) / .4))
    vz = (np.clip(1 - np.hypot((u - .1) / .35, (v - .85) / .3), 0, 1) ** 1.5)[..., None] * .6
    base = np.clip((ramp * (1 - vz) + c_vio * vz) * detail, 0, 1)

    fx, fy = field('dir', w, h, ang=.6)
    a = akf(base, 2.5)
    o = .6 * base + .25 * a + .15 * icm(a, fx, fy, L=12, both=True)
    return base, grain(grade(bloom(o, .8, .45), 0, 1, 1, 1.05))


@recipe
def moon():
    """月晕：两次曝光叠在一起。一次横向拖（云变成一条条横带），一次从月亮往外放射拖尾（光晕）；
       月亮本身用轻微模糊的原图留住一点形，最后大半径泛光"""
    w, h = 800, 1000
    base, fx, fy = frame('moon', w, h, 'dir', ang=0.)
    cx, cy = moon_center(base)
    zx, zy = field('zoom', w, h, cx=cx, cy=cy)
    o = .5 * icm(base, fx, fy, L=80, both=True) + .5 * icm(base, zx, zy, L=50, tau=25)
    core = cv2.GaussianBlur(base, (0, 0), 3); k = smooth(lum(core), .55, .85)[..., None] * .7
    o = o * (1 - k) + core * k
    return base, grain(grade(bloom(o, .55, .7, (10, 30, 80)), 0, 1.05, 1, 1), .01)


def moon_center(img):
    L = lum(img); ys, xs = np.where(L > np.percentile(L, 99.7))
    return xs.mean() / img.shape[1], ys.mean() / img.shape[0]


@recipe
def tower():
    """石塔：像素拉伸（slit-scan）。在塔身最宽、一级级往外退的柱子都露出来的那一行取一条（2% 高取平均去噪），
       竖着拉满整张：柱子的序列变成宽窄不一的竖向色带，两边是天的钴蓝；
       再用同样这几列从上到下的平均颜色，以及竖向拖曳过的塔身明暗，给色带加上照片里原来的光。
       工作台的起点是这几列塔身（拉成 800×1000），取样的那一行在它 92.2% 的高度"""
    w, h = 800, 1000
    img, hole = load('tower')
    H, W = img.shape[:2]
    x0, x1, y = int(.05 * W), int(.966 * W), int(.897 * H)
    band = img[y - 8:y + 8, x0:x1].mean(0)
    st = np.repeat(cv2.resize(band[None], (w, 1), interpolation=cv2.INTER_AREA), h, 0)
    base = cv2.resize(img[int(.03 * H):int(.97 * H), x0:x1], (w, h), interpolation=cv2.INTER_AREA)
    prof = cv2.resize(base.mean(1, keepdims=True), (w, h), interpolation=cv2.INTER_LINEAR)
    prof = np.clip(prof / prof.mean((0, 1), keepdims=True), .75, 1.3)
    fx, fy = field('dir', w, h, ang=PI / 2)
    sm = icm(base, fx, fy, L=260, both=True)
    ratio = np.clip(lum(sm) / np.maximum(cv2.GaussianBlur(lum(sm), (0, 0), 60), 1e-3), .6, 1.5)[..., None]
    o = st * prof ** .7 * ratio ** .8
    o = .8 * o + .2 * sm
    return base, grain(grade(bloom(o, .75, .4), 0, 1, 1, 1.08))


@recipe
def slush():
    """冰沙：画圈那块冰面放大，各向异性 Kuwahara 把冰粒压成有光泽的小块，再绕杯心方向短短拖一下（挖痕的弧）"""
    base, fx, fy = frame('slush', 800, 1000, 'spin', cx=1.2, cy=-.3)
    a = akf(base, 5.)
    o = .55 * a + .45 * icm(a, fx, fy, L=22, tau=11)
    return base, grain(grade(bloom(o, .8, .5), 0, 1, 1, 1.05))


@recipe
def tundra():
    """苔原：纹理迁移。先按参数画一张倾斜的地层构图（土黄、橄榄、亮苔绿、深褐、玄武岩黑），
       再从照片里挑草、苔、石头的小块把它拼出来，打上左上来的低角度阳光；最后顺着地层方向轻拖"""
    w, h = 800, 1000
    img, hole = load('tundra', 1000 / 1340)
    y, x = np.mgrid[0:h, 0:w].astype(np.float32); u, v = x / w, y / h
    Y = v - .18 * (u - .5) + .03 * np.sin(u * 7 + 1)
    cols = np.array([(186, 150, 80), (112, 104, 50), (196, 158, 86), (118, 142, 44), (150, 120, 70), (42, 44, 40)], np.float32) / 255.
    tgt = cv2.GaussianBlur(cols[np.digitize(Y, [.14, .30, .44, .56, .66])], (0, 0), 2)
    o = transfer(img, tgt, patches=(48, 32, 22), wab=1.2, blur=3., invalid=hole > .5)
    # 左上来的低角度阳光：离左上角越近越亮、越暖，右下沉下去
    sun = np.exp(-((u + .15) ** 2 + (v + .1) ** 2) * 1.4)[..., None]
    base = np.clip(o * (.72 + .5 * sun) + np.array([.12, .09, .03], np.float32) * sun * .5, 0, 1)
    fx, fy = field('dir', w, h, ang=-.18)
    o = .7 * base + .3 * icm(base, fx, fy, L=24, both=True)
    return base, grain(grade(bloom(o, .82, .3), 0, 1, 1, 1.08), .009)


@recipe
def rainbow():
    """彩虹薄雾：绕虹心转着拖（沿着虹的弧），两层长短不同的曝光叠起来：虹变成干净的光带，雾变成柔的渐变"""
    base, fx, fy = frame('rainbow', 800, 1000, 'spin', cx=.1, cy=1.4)
    o = .6 * icm(base, fx, fy, L=130, both=True) + .4 * icm(base, fx, fy, L=40, both=True)
    return base, grain(grade(bloom(o, .8, .4), .02, 1, 1, 1.12))


@recipe
def mirror():
    """天水镜像：横向拖曳。天、地平线的暖光和水里的倒影各自拉成横带，长短两层叠起来留一点云的纹理"""
    base, fx, fy = frame('mirror', 800, 1000, 'dir', ang=0.)
    o = .55 * icm(base, fx, fy, L=120, both=True) + .45 * icm(base, fx, fy, L=36, both=True)
    return base, grain(grade(bloom(o, .75, .5), 0, 1, 1, 1.08))


@recipe
def spring():
    """冰泉：图像绗缝。画圈的那潭乳蓝的水（避开红圈）拼成整张没有岸、没有石头的水面，再绕一个中心轻轻转着拖"""
    img, hole = load('spring', 3.5)
    base = quilt(img, 1000, 800, patch=100, overlap=26, seed=3, invalid=hole > .05, frac=0., tol=.05)
    fx, fy = field('spin', 800, 1000, cx=.55, cy=.5, k=.2)
    o = .75 * base + .25 * icm(base, fx, fy, L=20, both=True)
    return base, grain(grade(bloom(o, .9, .25), -.01, .97, 1, 1.06), .006)


# 毛玻璃卡片的底：其余九张各取中间一条竖条，宽窄不一地排在一起（起点和成品是同一张）
GLASS_STRIPES = [('fall', 11), ('film', 12), ('moon', 7), ('tower', 17), ('slush', 11), ('tundra', 12), ('rainbow', 9), ('mirror', 10), ('spring', 11)]


def glass():
    w, h = 800, 1000
    tot = sum(p for _, p in GLASS_STRIPES)
    cols, x = [], 0
    for name, part in GLASS_STRIPES:
        img = readout(name)
        img = fit(img, 800, 1000)
        sw = int(round(w * part / tot)) if name != GLASS_STRIPES[-1][0] else w - x
        c0 = (img.shape[1] - sw) // 2
        cols.append(img[:, c0:c0 + sw]); x += sw
    o = np.concatenate(cols, 1)
    return o, o


def readout(name, sub=''):
    return cv2.cvtColor(cv2.imread(os.path.join(OUT, sub, name + '.webp')), cv2.COLOR_BGR2RGB).astype(np.float32) / 255.


# ================================================================ 色卡：调色板 + 最抽象的一版
# 每张卡片「最抽象」时沿哪条路径拖（和工作台里「抽象度」用的是同一条）
PATHS = {
    'fall': ('dir', dict(ang=PI / 2)), 'film': ('dir', dict(ang=.6)), 'moon': ('dir', dict(ang=0.)),
    'tower': ('dir', dict(ang=PI / 2)), 'slush': ('spin', dict(cx=1.2, cy=-.3)), 'tundra': ('dir', dict(ang=-.18)),
    'rainbow': ('spin', dict(cx=.1, cy=1.4)), 'mirror': ('dir', dict(ang=0.)), 'spring': ('spin', dict(cx=.55, cy=.5)),
    'glass': ('dir', dict(ang=PI / 2)),
}


def palette(img, k=6, cw=1.8):
    """k-means（Lab 空间，色度 a/b 放大 cw 倍，让面积小但鲜的颜色——比如地平线那道暖橙——也能单独成一类）取 k 个主色，
       按亮度从暗到亮排；返回 (颜色 k×3, 占比 k)"""
    small = cv2.resize(img, (80, int(80 * img.shape[0] / img.shape[1])), interpolation=cv2.INTER_AREA)
    lab = cv2.cvtColor(np.clip(small, 0, 1).astype(np.float32), cv2.COLOR_RGB2Lab).reshape(-1, 3)
    wgt = np.array([1, cw, cw], np.float32)
    cv2.setRNGSeed(7)
    _, labels, centers = cv2.kmeans(lab * wgt, k, None, (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 60, .05), 6, cv2.KMEANS_PP_CENTERS)
    centers = centers / wgt
    share = np.bincount(labels.ravel(), minlength=k) / len(labels)
    rgb = np.clip(cv2.cvtColor(centers.reshape(-1, 1, 3).astype(np.float32), cv2.COLOR_Lab2RGB).reshape(-1, 3), 0, 1)
    order = np.argsort(centers[:, 0])
    return rgb[order], share[order]


def palmap(img, pal, lo, hi):
    """渐变映射：亮度按 [lo, hi] 拉到 0..1，再沿调色板（按亮度排好的）插值"""
    t = np.clip((lum(img) - lo) / max(hi - lo, 1e-3), 0, 1)
    pl = pal @ LUMA
    stops = (pl - pl[0]) / max(pl[-1] - pl[0], 1e-3)
    return np.stack([np.interp(t, stops, pal[:, c]) for c in range(3)], -1).astype(np.float32)


def abstract(img, name, pal, amount=1.):
    """最抽象的一版：沿这张卡片的主路径两头拖 0.35 个卡片高、再糊一层，然后按调色板做渐变映射，只留一点原来的颜色"""
    h, w = img.shape[:2]
    kind, fk = PATHS[name]
    fx, fy = field(kind, w, h, **fk)
    a = icm(img, fx, fy, L=int(.35 * h * amount / 2), h=2., both=True)
    a = cv2.GaussianBlur(a, (0, 0), 6 * amount)
    L = lum(a); lo, hi = np.percentile(L, 2), np.percentile(L, 98)
    o = .85 * palmap(a, pal, lo, hi) + .15 * a
    return grain(o, .012), (float(lo), float(hi))


def hexc(c):
    return '#%02X%02X%02X' % tuple(int(round(v * 255)) for v in np.clip(c, 0, 1))


def main(names):
    for d in ('', 'base', 'abs'):
        os.makedirs(os.path.join(OUT, d), exist_ok=True)
    data = {}
    dpath = os.path.join(OUT, 'data.js')
    if os.path.exists(dpath):  # 只重生成几张时，别的卡片的数据留着
        txt = open(dpath, encoding='utf-8').read()
        data = json.loads(txt[txt.index('{'):txt.rindex('}') + 1])
    for n in names:
        t0 = time.time()
        base, final = glass() if n == 'glass' else RECIPES[n]()
        base, final = np.clip(base, 0, 1), np.clip(final, 0, 1)
        write(n, final)
        write(n, base, q=90, sub='base')
        pal, share = palette(final)
        ab, (lo, hi) = abstract(final, n, pal)
        write(n, ab, q=88, sub='abs')
        L0 = lum(final)
        d = {'palette': [hexc(c) for c in pal], 'share': [round(float(x), 3) for x in share],
             'lo0': round(float(np.percentile(L0, 2)), 3), 'hi0': round(float(np.percentile(L0, 98)), 3), 'lo': round(lo, 3), 'hi': round(hi, 3)}
        if n == 'moon':
            d['center'] = [round(float(v), 3) for v in moon_center(base)]
        data[n] = d
        print(n, '%.1fs' % (time.time() - t0), ' '.join(d['palette']), flush=True)
    write_data(data, dpath)


def write_data(data, dpath):
    """tex/data.js：一张卡片一行。palette 按亮度从暗到亮，share 是各色占比；
       lo0 / hi0 是纹理本身、lo / hi 是最抽象那版的亮度范围（2% 和 98% 分位），工作台按亮度映射调色板时用"""
    rows = ['  %s: %s' % (json.dumps(k), json.dumps(v, ensure_ascii=False, separators=(', ', ': '))) for k, v in data.items()]
    with open(dpath, 'w', encoding='utf-8') as f:
        f.write('/* texture.py 生成，别手改。每张卡片的调色板（按亮度从暗到亮）、各色占比、纹理和最抽象一版的亮度范围 */\n')
        f.write('window.TEXTURE_DATA = {\n' + ',\n'.join(rows) + '\n};\n')


if __name__ == '__main__':
    main(sys.argv[1:] or list(RECIPES) + ['glass'])
