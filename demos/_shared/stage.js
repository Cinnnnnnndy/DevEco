/* =====================================================================
   demos/_shared/stage.js —— 多设备「台前调度」
   场景：画布上并排好几台设备，你在改其中一台（比如 Mate XT 三屏下列表只占左半）。
   平铺时每台都小到看不清细节；放大一台又看不到别的台有没有被这次改动带坏。
   台前调度：改哪台哪台上台放大，其余缩到侧边一列、弱化但仍实时刷新；
   被这次改动影响到的侧边设备会亮点（变了 / 坏了），点一下换上台。

   用法（设备元素原样不动，只用 transform 摆位，退出后原样复原）：
     var st = DeviceStage.init({
       root:  '#canvas',            // 画布容器（摆位范围）
       items: '.dm-device',         // 参与调度的设备元素
       rail:  'left',               // 侧边一列放左边（默认）或 'right'
       onChange: function(focused){ ... }   // focused：台上元素数组，退出时为 []
     });
     st.focus(el)          // 某台上台；传数组 = 两台并排上台对比（像台前调度的窗口组）
     st.add(el)            // 把一台加进台上组（已在台上则移出）
     st.clear()            // 回到平铺
     st.flag(el, 'changed'|'broken'|null, '一句话')   // 侧边缩略图上的状态点
     st.relayout()         // 设备尺寸变了（比如折叠态切换）后重新摆位
   交互：点侧边缩略图 = 换它上台；⇧ 点 = 加进台上组；Esc = 回到平铺。
   台前调度打开时 root 会加 .ds-on，可在 demo 里据此隐藏平铺时才有的连线等装饰。
   ===================================================================== */
window.DeviceStage = (function(){
  'use strict';
  var $$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  /* 样式随脚本注入，demo 只需引一个 stage.js */
  var CSS = ''
    + '.ds-anim .ds-side,.ds-anim .ds-stage{transition:transform .32s cubic-bezier(.2,.8,.2,1),opacity .2s,filter .2s}'
    + '.ds-on{overflow:hidden!important}'
    + '.ds-side{opacity:.5;cursor:pointer;z-index:1}'
    + '.ds-side:hover{opacity:.95}'
    + '.ds-side *{pointer-events:none}'
    + '.ds-side.ds-changed,.ds-side.ds-broken{opacity:.9}'
    + '.ds-stage{z-index:2}'
    /* 设备自带的名称签 .tag 与尺寸说明 .cap 反向缩放，保持原字号；侧边只留名称签 */
    + '.ds-on .ds-stage>.tag,.ds-on .ds-side>.tag{transform:scale(var(--ds-inv,1));transform-origin:0 100%;max-width:none;white-space:nowrap}'
    + '.ds-on .ds-stage>.cap{transform:scale(var(--ds-inv,1));transform-origin:50% 0}'
    + '.ds-on .ds-side>.cap{display:none}'
    + '.ds-flag{position:absolute;top:-6px;right:-6px;z-index:5;display:inline-flex;align-items:center;gap:5px;transform:scale(var(--ds-inv,1));transform-origin:100% 0;'
    +   'height:20px;padding:0 8px 0 6px;border-radius:10px;background:var(--ui-popup-bg);color:var(--ui-fg);font:500 11px/20px var(--font-ui);white-space:nowrap;'
    +   'box-shadow:0 2px 8px rgba(0,0,0,.25)}'
    + '.ds-flag i{width:8px;height:8px;border-radius:50%;flex:none}'
    + '.ds-flag.changed i{background:var(--ui-success)}'
    + '.ds-flag.broken i{background:var(--ui-error)}'
    + '.ds-flag:not(:has(span)){padding:0;width:20px;justify-content:center}'
    + ':not(.ds-side)>.ds-flag{display:none}'
    + '.ds-side.ds-changed{animation:ds-pulse 1.1s ease-out 1}'
    + '@keyframes ds-pulse{0%{filter:drop-shadow(0 0 0 transparent)}35%{filter:drop-shadow(0 0 10px color-mix(in srgb,var(--ui-success) 70%,transparent))}100%{filter:drop-shadow(0 0 0 transparent)}}'
    + '@media (prefers-reduced-motion:reduce){.ds-side.ds-changed{animation:none}}';
  (function(){ if(document.getElementById('ds-style')) return; var st = document.createElement('style'); st.id = 'ds-style'; st.textContent = CSS; document.head.appendChild(st); })();
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function init(opts){
    var root = typeof opts.root === 'string' ? document.querySelector(opts.root) : opts.root;
    if(!root) return null;
    var sel = opts.items || '.dm-device', railSide = opts.rail || 'left';
    var PAD = 20, GAP = 18, RAIL = opts.railWidth || 132, MAXUP = opts.maxScale || 1.7;
    var focused = [], on = false, saved = new Map();

    function items(){ return $$(sel, root).filter(function(el){ return el.offsetParent !== null || saved.has(el); }); }

    function natural(el){
      /* 去掉我们加的 transform 量原始位置：offsetWidth/Height 不受 transform 影响，位置用 rect 减掉 root */
      var prevT = el.style.transform, prevTr = el.style.transition;
      el.style.transition = 'none'; el.style.transform = saved.has(el) ? saved.get(el).transform : prevT;
      var r = el.getBoundingClientRect(), rr = root.getBoundingClientRect();
      var o = { x: r.left - rr.left + root.scrollLeft, y: r.top - rr.top + root.scrollTop, w: el.offsetWidth, h: el.offsetHeight };
      el.style.transform = prevT; void el.offsetWidth; el.style.transition = prevTr;
      return o;
    }

    function place(el, n, x, y, s){
      /* n 是原始位置；把左上角移到 (x,y)，按 s 缩放 */
      el.style.transformOrigin = '0 0';
      el.style.transform = 'translate(' + (x - n.x) + 'px,' + (y - n.y) + 'px) scale(' + s + ')';
      el.style.setProperty('--ds-inv', (1 / s).toFixed(3));
    }

    function layout(){
      if(!on) return;
      var all = items(), side = all.filter(function(el){ return focused.indexOf(el) < 0; });
      var W = root.clientWidth, H = root.clientHeight, sx = root.scrollLeft, sy = root.scrollTop;
      var nat = new Map(); all.forEach(function(el){ nat.set(el, natural(el)); });

      /* 侧边一列：等比缩到 RAIL 宽，高度平分，放不下就再缩 */
      var railH = H - PAD * 2, per = side.length ? (railH - GAP * (side.length - 1)) / side.length : 0;
      var railX = railSide === 'left' ? PAD : W - PAD - RAIL, y = PAD;
      var sized = side.map(function(el){ var n = nat.get(el); return { el: el, n: n, s: Math.min(RAIL / n.w, Math.max(per, 40) / n.h, 1) }; });
      var total = sized.reduce(function(a, b){ return a + b.n.h * b.s; }, 0) + GAP * Math.max(0, sized.length - 1);
      y = PAD + Math.max(0, (railH - total) / 2);
      sized.forEach(function(it){
        var w = it.n.w * it.s;
        place(it.el, it.n, sx + railX + (RAIL - w) / 2, sy + y, it.s);
        it.el.classList.add('ds-side'); it.el.classList.remove('ds-stage');
        y += it.n.h * it.s + GAP;
      });

      /* 台上：一台居中放大；多台同一缩放比并排 */
      var ax = railSide === 'left' ? PAD * 2 + RAIL : PAD, aw = W - RAIL - PAD * 3, ah = H - PAD * 2 - 28;
      var ns = focused.map(function(el){ return nat.get(el); });
      var sumW = ns.reduce(function(a, n){ return a + n.w; }, 0) + GAP * 2 * Math.max(0, ns.length - 1);
      var maxH = ns.reduce(function(a, n){ return Math.max(a, n.h); }, 0);
      var s = Math.min(aw / sumW, ah / maxH, MAXUP);
      var x = ax + (aw - sumW * s) / 2;
      focused.forEach(function(el, i){
        var n = ns[i];
        place(el, n, sx + x, sy + PAD + (ah - n.h * s) / 2, s);
        el.classList.add('ds-stage'); el.classList.remove('ds-side');
        x += n.w * s + GAP * 2 * s;
      });
    }

    function remember(el){ if(!saved.has(el)) saved.set(el, { transform: el.style.transform, origin: el.style.transformOrigin }); }

    function focus(target){
      var list = (Array.isArray(target) ? target : [target]).map(function(t){ return typeof t === 'string' ? root.querySelector(t) : t; }).filter(Boolean);
      if(!list.length) return;
      items().forEach(remember);
      focused = list;
      if(!on){ on = true; root.classList.add('ds-on'); if(!reduce) root.classList.add('ds-anim'); }
      focused.forEach(function(el){ flag(el, null); });
      layout();
      if(opts.onChange) opts.onChange(focused.slice());
    }

    function add(el){
      if(!on){ focus(el); return; }
      var i = focused.indexOf(el);
      if(i >= 0){ if(focused.length > 1) focused.splice(i, 1); }
      else focused.push(el);
      flag(el, null); layout();
      if(opts.onChange) opts.onChange(focused.slice());
    }

    function clear(){
      if(!on) return;
      on = false; focused = [];
      saved.forEach(function(v, el){
        el.style.transform = v.transform; el.style.transformOrigin = v.origin;
        el.style.removeProperty('--ds-inv');
        el.classList.remove('ds-side', 'ds-stage');
      });
      saved.clear();
      root.classList.remove('ds-on');
      setTimeout(function(){ if(!on) root.classList.remove('ds-anim'); }, 320);
      if(opts.onChange) opts.onChange([]);
    }

    function flag(el, kind, text){
      if(typeof el === 'string') el = root.querySelector(el);
      if(!el) return;
      var b = el.querySelector(':scope > .ds-flag');
      if(!kind){ if(b) b.remove(); el.classList.remove('ds-changed', 'ds-broken'); return; }
      if(!b){ b = document.createElement('span'); b.className = 'ds-flag'; el.appendChild(b); }
      b.className = 'ds-flag ' + kind;
      b.innerHTML = '<i></i>' + (text ? '<span></span>' : '');
      if(text) b.lastChild.textContent = text;
      el.classList.remove('ds-changed', 'ds-broken'); void el.offsetWidth;
      el.classList.add('ds-' + kind);
    }

    /* 点侧边缩略图：捕获阶段拦下，不让点击落进设备里的界面 */
    root.addEventListener('click', function(e){
      if(!on) return;
      var el = e.target.closest(sel);
      if(!el || !el.classList.contains('ds-side')) return;
      e.preventDefault(); e.stopPropagation();
      if(e.shiftKey) add(el); else focus(el);
    }, true);
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && on && !e.defaultPrevented){ clear(); }
    });
    var ro = window.ResizeObserver ? new ResizeObserver(function(){ layout(); }) : null;
    if(ro) ro.observe(root); else window.addEventListener('resize', layout);

    return {
      focus: focus, add: add, clear: clear, flag: flag, relayout: layout,
      isOn: function(){ return on; }, focused: function(){ return focused.slice(); },
      toggle: function(el){ if(on) clear(); else focus(el || items()[0]); }
    };
  }

  /* 工具栏按钮用的图标：一大一小两列，像台前调度 */
  var icon = '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="5.5" y="2.5" width="9" height="11" rx="1.5" stroke="currentColor" fill="none"/>'
    + '<rect x="1.5" y="3" width="2.5" height="3" rx=".6" fill="currentColor" opacity=".7"/><rect x="1.5" y="7" width="2.5" height="3" rx=".6" fill="currentColor" opacity=".5"/><rect x="1.5" y="11" width="2.5" height="2.5" rx=".6" fill="currentColor" opacity=".35"/></svg>';

  return { init: init, icon: icon };
})();
