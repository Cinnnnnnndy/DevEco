/* DevEco 毛玻璃实验台 · 交互
   - 照片：photos/photos.js 的清单 + 拖进页面或「加照片」选的本地照片（只在这次打开里有效）
   - 深浅「随照片」：大面板跟整张照片走（整屏一个深浅，不花），浮在内容上的液态控件跟自己底下的景色走
   - 取景色：从照片色块里挑一个又多又有颜色的主色，只混进玻璃的中性染色；蓝 / 紫 / 琥珀这些语义色不动
   - 液态折射：Chromium 用 SVG feDisplacementMap 挂在 backdrop-filter 上；其他浏览器退回只有高光的液态
   - 宽屏可拖动每块玻璃；窄屏竖排，不拖
   对外留了 window.glassLab，出图脚本用。 */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var NS = 'http://www.w3.org/2000/svg';
  var root = document.documentElement, body = document.body;
  var stage = $('#stage'), bg = $('#bg'), defs = $('#lq-defs'), lab = $('#lab');
  if (!root.lang) root.lang = 'zh-CN';

  ['INT_UI_SPRITE', 'AI_SPRITE'].forEach(function (k) {
    if (window[k]) body.insertAdjacentHTML('afterbegin', window[k]);
  });

  /* ---------- 状态：本机记住，读不到就用默认 ---------- */
  var KEY = 'deveco-glass-lab';
  var DEF = { photo: '', view: 'desk', glass: 'classic', tone: 'auto', tint: 'neutral',
    blur: 1, alpha: 1, sat: 1, grain: 0.05, rim: 0.75, refr: 22, disp: 0.35 };
  var st = Object.assign({}, DEF, readStore());
  function readStore() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save() {
    var out = Object.assign({}, st);
    if (photos[cur] && photos[cur].local) delete out.photo;
    try { localStorage.setItem(KEY, JSON.stringify(out)); } catch (e) { /* 存不了就算了 */ }
  }

  /* ---------- 照片 ---------- */
  var photos = (window.GLASS_PHOTOS || []).map(function (p) { return Object.assign({}, p); });
  var cur = Math.max(0, photos.findIndex(function (p) { return p.src === st.photo; }));

  function gridOf(p) {
    if (!p) return null;
    if (p._grid) return p._grid;
    if (p.grid) {
      var bin = atob(p.grid), a = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
      p._grid = { w: p.gw, h: p.gh, px: a };
    }
    return p._grid || null;
  }
  function gridFromImage(img) {
    var gw = 64, gh = Math.max(1, Math.round(gw * img.naturalHeight / img.naturalWidth));
    var c = document.createElement('canvas'); c.width = gw; c.height = gh;
    var x = c.getContext('2d');
    x.drawImage(img, 0, 0, gw, gh);
    try {
      var d = x.getImageData(0, 0, gw, gh).data, a = new Uint8Array(gw * gh * 3);
      for (var i = 0, j = 0; i < d.length; i += 4) { a[j++] = d[i]; a[j++] = d[i + 1]; a[j++] = d[i + 2]; }
      return { w: gw, h: gh, px: a };
    } catch (e) { return null; }   // file:// 下本地图片读不了像素：清单里的照片有预算好的色块
  }

  var loadSeq = 0;
  function setPhoto(i) {
    if (!photos[i]) return;
    cur = i; st.photo = photos[i].src; save();
    var p = photos[i], seq = ++loadSeq;
    var img = new Image();
    img.decoding = 'async';
    img.onload = function () {
      if (seq !== loadSeq) return;
      p.w = img.naturalWidth; p.h = img.naturalHeight;
      if (!gridOf(p)) p._grid = gridFromImage(img);
      bg.classList.add('swap');
      setTimeout(function () {
        if (seq !== loadSeq) return;
        bg.src = p.src;
        bg.classList.remove('swap');
        analyse(p);
        refresh();
      }, bg.getAttribute('src') ? 180 : 0);
    };
    img.src = p.src;
    renderThumbs();
  }

  function addFiles(list) {
    var first = -1;
    Array.prototype.forEach.call(list || [], function (f) {
      if (!/^image\//.test(f.type)) return;
      photos.push({ src: URL.createObjectURL(f), name: f.name.replace(/\.[^.]+$/, ''), local: true });
      if (first < 0) first = photos.length - 1;
    });
    if (first >= 0) setPhoto(first);
  }

  function renderThumbs() {
    var box = $('#thumbs'), add = box.querySelector('label');
    $$('button', box).forEach(function (b) { b.remove(); });
    photos.forEach(function (p, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.style.backgroundImage = 'url("' + p.src + '")';
      b.title = p.name + (p.standin ? '（合成占位图）' : '');
      b.setAttribute('aria-label', '换成 ' + p.name);
      b.setAttribute('aria-pressed', String(i === cur));
      b.addEventListener('click', function () { setPhoto(i); });
      box.insertBefore(b, add);
    });
    var p = photos[cur];
    $('#lab-thumb').style.backgroundImage = p ? 'url("' + p.src + '")' : '';
    $('#lab-sub').textContent = p ? p.name + (p.standin ? ' · 合成占位图' : '') : '还没有照片';
  }

  /* ---------- 照片分析：整张的明暗、主色 ---------- */
  var scene = null;   // { l, d, swatches, pick }
  function analyse(p) {
    var g = gridOf(p);
    if (!g) { scene = null; p._luma = null; renderSwatches(); return; }
    var px = g.px, n = px.length / 3, sum = 0, pts = [];
    for (var i = 0; i < n; i++) {
      var r = px[i * 3], gg = px[i * 3 + 1], b = px[i * 3 + 2];
      sum += luma(r, gg, b);
      pts.push([r, gg, b]);
    }
    p._luma = sum / n;
    var cl = kmeans(pts, 5);
    var best = null, bestScore = -1;
    cl.forEach(function (c) {
      var mx = Math.max.apply(null, c.c), mn = Math.min.apply(null, c.c);
      var score = c.n * (0.2 + (mx - mn) / 255);
      if (score > bestScore) { bestScore = score; best = c; }
    });
    var c = best.c;
    scene = {
      swatches: cl, pick: best,
      l: mix([246, 247, 249], c, 0.2).join(' '),
      d: mix([30, 31, 35], c.map(function (v) { return v * 0.55; }), 0.45).join(' ')
    };
    renderSwatches();
  }
  function luma(r, g, b) { return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; }
  function mix(a, b, t) { return a.map(function (v, i) { return Math.round(v + (b[i] - v) * t); }); }
  function kmeans(pts, k) {
    var sorted = pts.slice().sort(function (a, b) { return luma(a[0], a[1], a[2]) - luma(b[0], b[1], b[2]); });
    var cs = [];
    for (var i = 0; i < k; i++) cs.push(sorted[Math.floor((i + 0.5) / k * sorted.length)].slice());
    var as = new Array(pts.length);
    for (var it = 0; it < 12; it++) {
      var acc = cs.map(function () { return [0, 0, 0, 0]; });
      pts.forEach(function (p, j) {
        var bi = 0, bd = Infinity;
        cs.forEach(function (c, ci) {
          var d = (p[0] - c[0]) * (p[0] - c[0]) + (p[1] - c[1]) * (p[1] - c[1]) + (p[2] - c[2]) * (p[2] - c[2]);
          if (d < bd) { bd = d; bi = ci; }
        });
        as[j] = bi;
        var a = acc[bi]; a[0] += p[0]; a[1] += p[1]; a[2] += p[2]; a[3]++;
      });
      cs = acc.map(function (a, ci) { return a[3] ? [a[0] / a[3], a[1] / a[3], a[2] / a[3]] : cs[ci]; });
    }
    var counts = cs.map(function () { return 0; });
    as.forEach(function (ci) { counts[ci]++; });
    return cs.map(function (c, ci) { return { c: c.map(Math.round), n: counts[ci] }; })
      .filter(function (c) { return c.n > 0; })
      .sort(function (a, b) { return b.n - a.n; });
  }
  function renderSwatches() {
    var box = $('#swatches');
    box.innerHTML = '';
    if (!scene) return;
    scene.swatches.forEach(function (s) {
      var i = document.createElement('i');
      var hex = '#' + s.c.map(function (v) { return v.toString(16).padStart(2, '0'); }).join('').toUpperCase();
      i.style.background = hex;
      i.title = hex + (s === scene.pick ? ' · 取这个' : '');
      if (s === scene.pick) i.className = 'pick';
      box.appendChild(i);
    });
  }

  /* ---------- 深浅与取景色 ---------- */
  function sysTone() {
    var t = root.getAttribute('data-theme');
    if (t === 'dark' || t === 'light') return t;
    return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function coverMap(p) {
    var vw = innerWidth, vh = innerHeight, s = Math.max(vw / p.w, vh / p.h);
    return { s: s, ox: (vw - p.w * s) / 2, oy: (vh - p.h * s) / 2 };
  }
  function lumaUnder(rect) {
    var p = photos[cur], g = gridOf(p);
    if (!g || !p.w) return null;
    var m = coverMap(p);
    var gx = function (x) { return Math.min(g.w, Math.max(0, (x - m.ox) / m.s / p.w * g.w)); };
    var gy = function (y) { return Math.min(g.h, Math.max(0, (y - m.oy) / m.s / p.h * g.h)); };
    var x0 = Math.floor(gx(rect.left)), x1 = Math.max(x0 + 1, Math.ceil(gx(rect.right)));
    var y0 = Math.floor(gy(rect.top)), y1 = Math.max(y0 + 1, Math.ceil(gy(rect.bottom)));
    var sum = 0, n = 0;
    for (var y = y0; y < Math.min(y1, g.h); y++) for (var x = x0; x < Math.min(x1, g.w); x++) {
      var i = (y * g.w + x) * 3;
      sum += luma(g.px[i], g.px[i + 1], g.px[i + 2]); n++;
    }
    return n ? sum / n : null;
  }
  function pickTone(v, prev) {
    if (v == null) return prev || sysTone();
    if (prev === 'light') return v < 0.46 ? 'dark' : 'light';
    if (prev === 'dark') return v > 0.54 ? 'light' : 'dark';
    return v >= 0.5 ? 'light' : 'dark';
  }
  function sceneTone() {
    var p = photos[cur];
    return pickTone(p && p._luma, null);
  }
  function toneFor(el, global) {
    if (st.tone !== 'auto') return st.tone;
    if (el.classList.contains('lq')) return pickTone(lumaUnder(el.getBoundingClientRect()), el.getAttribute('data-tone'));
    return global;
  }
  function setTone(el, tone) {
    el.setAttribute('data-tone', tone);
    if (st.tint === 'scene' && scene) el.style.setProperty('--tint', tone === 'dark' ? scene.d : scene.l);
    else el.style.removeProperty('--tint');
  }
  function activeGlass() {
    var v = st.view === 'mats' ? '#view-mats' : '#view-desk';
    return $$(v + ' .glass').concat([lab]);
  }
  function refresh() {
    var g = st.tone === 'auto' ? sceneTone() : st.tone;
    activeGlass().forEach(function (el) { setTone(el, toneFor(el, g)); });
    paramText();
  }

  /* ---------- 液态：边缘折射 + 高光 ----------
     折射滤镜挂在元素里面一层不带阴影的 .lq-surface 上：Chromium 会把 SVG 背景滤镜的坐标原点
     放在「元素 + 它的阴影外扩」的左上角，元素自己带投影时整张位移图会往右下错开一个阴影半径，
     边上露出一圈没处理过的原图。阴影留在外层元素上，滤镜放在里层，两边互不干扰。 */
  var canRefract = !!(navigator.userAgentData && navigator.userAgentData.brands &&
    navigator.userAgentData.brands.some(function (b) { return /Chromium|Google Chrome|Microsoft Edge/.test(b.brand); }));
  var lqSeq = 0;

  // 位移图：R/G 编码每个像素去哪儿取底下的景色。圆角矩形的边缘一圈（斜面）往里取、越靠边取得越远，
  // 再叠一点整体放大，看上去像一块凸起的玻璃把景色往边上推。
  function liquidMap(w, h, r) {
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    var x = c.getContext('2d'), im = x.createImageData(w, h), d = im.data;
    var hw = w / 2, hh = h / 2, bezel = Math.min(40, Math.max(10, Math.min(w, h) * 0.34));
    for (var y = 0; y < h; y++) {
      for (var X = 0; X < w; X++) {
        var px = X + 0.5 - hw, py = y + 0.5 - hh;
        var qx = Math.abs(px) - (hw - r), qy = Math.abs(py) - (hh - r);
        var inside, nx, ny;
        if (qx > 0 && qy > 0) { var L = Math.hypot(qx, qy) || 1; inside = r - L; nx = qx / L; ny = qy / L; }
        else if (qx > qy) { inside = r - qx; nx = 1; ny = 0; }
        else { inside = r - qy; nx = 0; ny = 1; }
        if (px < 0) nx = -nx;
        if (py < 0) ny = -ny;
        var u = Math.min(1, Math.max(0, inside / bezel));
        var m = inside < 0 ? 0 : (1 - u) * (1 - u);
        var dx = -nx * m - px / hw * 0.05, dy = -ny * m - py / hh * 0.05;
        var k = (y * w + X) * 4;
        d[k] = Math.max(0, Math.min(255, 128 + dx * 127));
        d[k + 1] = Math.max(0, Math.min(255, 128 + dy * 127));
        d[k + 2] = 128; d[k + 3] = 255;
      }
    }
    x.putImageData(im, 0, 0);
    return c.toDataURL();
  }
  function filterBody(map, w, h, S, disp) {
    var img = '<feImage href="' + map + '" x="0" y="0" width="' + w + '" height="' + h + '" preserveAspectRatio="none" result="m"/>';
    if (disp < 0.01) return img + '<feDisplacementMap in="SourceGraphic" in2="m" scale="' + S + '" xChannelSelector="R" yChannelSelector="G"/>';
    var ch = function (scale, mat, n) {
      return '<feDisplacementMap in="SourceGraphic" in2="m" scale="' + scale.toFixed(2) + '" xChannelSelector="R" yChannelSelector="G" result="d' + n + '"/>' +
        '<feColorMatrix in="d' + n + '" type="matrix" values="' + mat + '" result="' + n + '"/>';
    };
    return img +
      ch(S * (1 + 0.1 * disp), '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0', 'r') +
      ch(S, '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0', 'g') +
      ch(S * (1 - 0.1 * disp), '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0', 'b') +
      '<feBlend in="r" in2="g" mode="screen" result="rg"/><feBlend in="rg" in2="b" mode="screen"/>';
  }
  function buildLiquid(el) {
    if (!canRefract) return;
    var w = el.offsetWidth, h = el.offsetHeight;
    if (!w || !h) return;
    var r = Math.min(parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0, w / 2, h / 2);
    var key = w + 'x' + h + 'r' + r;
    if (el._lqKey !== key) { el._lqMap = liquidMap(w, h, r); el._lqKey = key; }
    if (!el._lqId) el._lqId = 'lq-' + (++lqSeq);
    var f = document.getElementById(el._lqId);
    if (!f) { f = document.createElementNS(NS, 'filter'); f.id = el._lqId; defs.appendChild(f); }
    [['x', 0], ['y', 0], ['width', w], ['height', h], ['filterUnits', 'userSpaceOnUse'],
      ['primitiveUnits', 'userSpaceOnUse'], ['color-interpolation-filters', 'sRGB']].forEach(function (a) { f.setAttribute(a[0], a[1]); });
    f.innerHTML = filterBody(el._lqMap, w, h, st.refr * 2, st.disp);
    var sf = el.querySelector(':scope > .lq-surface');
    if (!sf) {
      sf = document.createElement('span');
      sf.className = 'lq-surface';
      sf.setAttribute('aria-hidden', 'true');
      el.insertBefore(sf, el.firstChild);
    }
    var v = 'url(#' + el._lqId + ') blur(var(--lq-blur)) saturate(calc(var(--lq-sat) * var(--sat-k))) brightness(var(--g-bri))';
    sf.style.backdropFilter = v;
    sf.style.webkitBackdropFilter = v;
    el.classList.add('lq-split');
  }
  function clearLiquid(el) {
    var sf = el.querySelector(':scope > .lq-surface');
    if (sf) sf.remove();
    el.classList.remove('lq-split');
  }
  function applyGlass() {
    $$('.lq-able').forEach(function (el) { el.classList.toggle('lq', st.glass === 'liquid'); });
    $$('.glass').forEach(function (el) {
      if (el.classList.contains('lq') && el.offsetParent !== null) buildLiquid(el); else clearLiquid(el);
    });
  }
  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(function (es) {
      es.forEach(function (e) { if (e.target.classList.contains('lq')) buildLiquid(e.target); });
    });
    $$('.lq-able, .lq-fixed').forEach(function (el) { ro.observe(el); });
  }

  // 高光朝向光源：有指针时跟着指针，没有就是左上
  var ptr = null, rimRaf = 0;
  function aimRims() {
    rimRaf = 0;
    $$('.glass.lq').forEach(function (el) {
      if (!ptr) { el.style.removeProperty('--rim-angle'); return; }
      var r = el.getBoundingClientRect();
      var dx = ptr[0] - (r.left + r.width / 2), dy = ptr[1] - (r.top + r.height / 2);
      el.style.setProperty('--rim-angle', (Math.atan2(-dx, dy) * 180 / Math.PI).toFixed(1) + 'deg');
    });
  }
  document.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    ptr = [e.clientX, e.clientY];
    if (!rimRaf) rimRaf = requestAnimationFrame(aimRims);
  }, { passive: true });

  /* ---------- 拖动碎片（宽屏） ---------- */
  var wideMq = matchMedia('(min-width: 1100px) and (min-height: 700px)');
  var homes = [], z = 10, drag = null;
  $$('.frag').forEach(function (el) {
    var p = el.parentNode;
    if (!homes.some(function (h) { return h.p === p; })) homes.push({ p: p, kids: Array.prototype.slice.call(p.children) });
  });
  function resetLayout() {
    homes.forEach(function (h) { h.kids.forEach(function (k) { h.p.appendChild(k); }); });
    $$('.frag').forEach(function (el) {
      el.classList.remove('free', 'dragging');
      ['left', 'top', 'width', 'height', 'z-index'].forEach(function (k) { el.style.removeProperty(k); });
    });
    requestAnimationFrame(function () { applyGlass(); refresh(); });
  }
  stage.addEventListener('pointerdown', function (e) {
    if (!wideMq.matches || e.button !== 0) return;
    var el = e.target.closest('.frag');
    if (!el || e.target.closest('button, a, input, label, select, .code')) return;
    if (el.classList.contains('win') && !e.target.closest('[data-drag]')) return;
    e.preventDefault();
    var r = el.getBoundingClientRect();
    if (!el.classList.contains('free')) {
      el.style.width = r.width + 'px';
      el.style.height = r.height + 'px';
      el.classList.add('free');
      el.closest('.view').appendChild(el);
    }
    el.style.left = r.left + 'px';
    el.style.top = r.top + 'px';
    el.style.zIndex = String(++z);
    el.classList.add('dragging');
    drag = { el: el, dx: e.clientX - r.left, dy: e.clientY - r.top };
    try { el.setPointerCapture(e.pointerId); } catch (err) { /* 老浏览器 */ }
  });
  stage.addEventListener('pointermove', function (e) {
    if (!drag) return;
    var el = drag.el, w = el.offsetWidth, h = el.offsetHeight;
    var x = Math.min(innerWidth - 40, Math.max(40 - w, e.clientX - drag.dx));
    var y = Math.min(innerHeight - 30, Math.max(0, e.clientY - drag.dy));
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    if (el.classList.contains('lq')) {
      setTone(el, toneFor(el, st.tone === 'auto' ? sceneTone() : st.tone));
      ptr && aimRims();
    }
  });
  function endDrag() { if (drag) { drag.el.classList.remove('dragging'); drag = null; } }
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);
  (wideMq.addEventListener ? wideMq.addEventListener.bind(wideMq, 'change') : wideMq.addListener.bind(wideMq))(resetLayout);

  /* ---------- 视图、调参、面板 ---------- */
  function setView(v) {
    st.view = v === 'mats' ? 'mats' : 'desk';
    stage.setAttribute('data-view', st.view);
    $('#view-desk').hidden = st.view !== 'desk';
    $('#view-mats').hidden = st.view !== 'mats';
    applyGlass();
    refresh();
  }
  var P = {
    blur: { el: '#p-blur', css: '--blur-k', fmt: function (v) { return '×' + v.toFixed(2); } },
    alpha: { el: '#p-alpha', css: '--alpha-k', fmt: function (v) { return '×' + v.toFixed(2); } },
    sat: { el: '#p-sat', css: '--sat-k', fmt: function (v) { return '×' + v.toFixed(2); } },
    grain: { el: '#p-grain', css: '--grain', fmt: function (v) { return v.toFixed(2); } },
    rim: { el: '#p-rim', css: '--rim', fmt: function (v) { return v.toFixed(2); } },
    refr: { el: '#p-refr', fmt: function (v) { return canRefract ? v + 'px' : '—'; } },
    disp: { el: '#p-disp', fmt: function (v) { return canRefract ? v.toFixed(2) : '—'; } }
  };
  function applyParams() {
    Object.keys(P).forEach(function (k) {
      var d = P[k], inp = $(d.el), v = Number(st[k]);
      inp.value = v;
      inp.nextElementSibling.textContent = d.fmt(v);
      if (d.css) root.style.setProperty(d.css, String(v));
      if ((k === 'refr' || k === 'disp') && !canRefract) inp.disabled = true;
    });
  }
  function paramText() {
    $$('#view-mats .mat').forEach(function (m) {
      var out = m.querySelector('[data-param]');
      if (m.classList.contains('lq')) {
        out.textContent = canRefract ? '折射 ' + st.refr + ' · 模糊 1.5' : '只有高光（此浏览器不折射）';
        return;
      }
      var cs = getComputedStyle(m);
      var b = parseFloat(cs.getPropertyValue('--m-blur')) * st.blur;
      var a = Math.min(1, parseFloat(cs.getPropertyValue('--m-a')) * st.alpha);
      out.textContent = '模糊 ' + Math.round(b) + ' · 染色 ' + a.toFixed(2).replace(/^0/, '');
    });
  }
  Object.keys(P).forEach(function (k) {
    $(P[k].el).addEventListener('input', function (e) {
      st[k] = Number(e.target.value);
      applyParams();
      if (k === 'refr' || k === 'disp') applyGlass();
      paramText();
      save();
    });
  });

  function syncSegs() {
    $$('.seg[data-key]').forEach(function (s) {
      var key = s.getAttribute('data-key');
      $$('button', s).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-v') === st[key])); });
    });
  }
  $$('.seg[data-key]').forEach(function (s) {
    s.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-v]');
      if (!b) return;
      set(s.getAttribute('data-key'), b.getAttribute('data-v'));
    });
  });
  function set(key, v) {
    st[key] = v;
    syncSegs();
    if (key === 'view') setView(v);
    else if (key === 'glass') { applyGlass(); refresh(); }
    else refresh();
    save();
  }

  $('#lab-toggle').addEventListener('click', function () {
    var open = !lab.classList.contains('open');
    lab.classList.toggle('open', open);
    $('#lab-body').hidden = !open;
    this.setAttribute('aria-expanded', String(open));
  });
  $('#file').addEventListener('change', function (e) { addFiles(e.target.files); e.target.value = ''; });
  $('#reset-layout').addEventListener('click', resetLayout);
  $('#reset-params').addEventListener('click', function () {
    ['blur', 'alpha', 'sat', 'grain', 'rim', 'refr', 'disp'].forEach(function (k) { st[k] = DEF[k]; });
    applyParams(); applyGlass(); paramText(); save();
  });

  var hint = $('#drop-hint'), dragDepth = 0;
  window.addEventListener('dragenter', function (e) {
    if (!e.dataTransfer || Array.prototype.indexOf.call(e.dataTransfer.types, 'Files') < 0) return;
    dragDepth++; hint.hidden = false;
  });
  window.addEventListener('dragleave', function () { if (--dragDepth <= 0) { dragDepth = 0; hint.hidden = true; } });
  window.addEventListener('dragover', function (e) { e.preventDefault(); });
  window.addEventListener('drop', function (e) {
    e.preventDefault(); dragDepth = 0; hint.hidden = true;
    addFiles(e.dataTransfer && e.dataTransfer.files);
  });

  var resizeRaf = 0;
  window.addEventListener('resize', function () {
    if (resizeRaf) return;
    resizeRaf = requestAnimationFrame(function () { resizeRaf = 0; refresh(); });
  });
  if (window.matchMedia) {
    var dm = matchMedia('(prefers-color-scheme: dark)');
    (dm.addEventListener ? dm.addEventListener.bind(dm, 'change') : dm.addListener.bind(dm))(refresh);
  }

  function readHash() {
    var h = location.hash.replace('#', '');
    body.classList.toggle('clean', h === 'clean');
    if (h === 'materials') set('view', 'mats');
    if (h === 'desk') set('view', 'desk');
    if (h === 'liquid' || h === 'classic') set('glass', h);
  }
  window.addEventListener('hashchange', readHash);

  /* ---------- 启动 ---------- */
  syncSegs();
  applyParams();
  setView(st.view);
  readHash();
  if (photos.length) setPhoto(cur); else renderThumbs();

  window.glassLab = {
    set: set,
    photo: function (i) { setPhoto(i); },
    photos: function () { return photos.map(function (p) { return p.name; }); },
    reset: resetLayout,
    param: function (k, v) { st[k] = v; applyParams(); applyGlass(); paramText(); },
    ready: function () { return !!bg.getAttribute('src') && !bg.classList.contains('swap'); },
    canRefract: canRefract
  };
})();
