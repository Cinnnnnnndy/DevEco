/* =====================================================================
   demos/_shared/guide.js —— 页面内跟随指引
   用法（放在 DemoFrame.init(...) 之后）：
     DemoGuide.init([
       {target:'#btn-x', kind:'click',  pos:'bottom', label:'点这里：批准这一步'},
       {target:'#area-y', kind:'change', pos:'top',   label:'这里会变：状态从「在等你」变成「在干」'}
     ]);
   kind: 'click'（要点的地方，蓝色实框+跳动的小红点）｜ 'change'（结果会变的地方，绿色虚框）
   pos:  标签相对目标框的方位，top/bottom/left/right，默认 top
   标注跟着目标元素的位置实时走（哪怕在 DemoFrame 切换标签页/面板之后目标移动了也一样），
   找不到目标（selector 暂时没渲染出来）就自动隐藏那一条，不报错。
   开关：左下角「关闭标注 / 显示标注」按钮、图例右上角的 × 关掉后记在 localStorage 的
   deveco-guide（'off' / 'on'），所有 demo 与启动页共用，关一次处处都关；Esc 只收起当前页。
   ===================================================================== */
window.DemoGuide = (function(){
  'use strict';
  var $ = function(s,r){ return (r||document).querySelector(s); };
  var esc = function(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;'); };
  var marks = [], visible = true, raf = null, KEY = 'deveco-guide', SKEY = 'deveco-guide-scene', scene = null;
  function saved(){ try{ return localStorage.getItem(KEY); }catch(e){ return null; } }
  function save(on){ try{ localStorage.setItem(KEY, on ? 'on' : 'off'); }catch(e){} }

  function sync(){
    marks.forEach(function(m){
      var t = $(m.sel);
      if(!t){ m.el.style.display='none'; return; }
      var r = t.getBoundingClientRect();
      if((r.width===0 && r.height===0) || r.bottom<0 || r.top>window.innerHeight || r.right<0 || r.left>window.innerWidth){
        m.el.style.display='none'; return;
      }
      m.el.style.display='';
      m.el.style.setProperty('--rx', r.left+'px');
      m.el.style.setProperty('--ry', r.top+'px');
      m.el.style.setProperty('--rw', r.width+'px');
      m.el.style.setProperty('--rh', r.height+'px');
    });
  }
  function loop(){ sync(); raf = requestAnimationFrame(loop); }
  function start(){ if(!raf) raf = requestAnimationFrame(loop); }
  function stop(){ if(raf){ cancelAnimationFrame(raf); raf=null; } }

  function setVisible(on, keep){
    visible = on;
    if(keep !== false) save(on);
    var layer = $('#gd-layer'); if(layer) layer.classList.toggle('hidden', !visible);
    var legend = $('#gd-legend'); if(legend) legend.classList.toggle('hidden', !visible);
    var btn = $('#gd-toggle-btn');
    if(btn){
      btn.classList.toggle('on', visible);
      btn.title = visible ? '关闭页面上的全部标注（Esc），所有 demo 一起关' : '显示页面上的标注：点哪里、哪里会变';
      btn.querySelector('span').textContent = visible ? '关闭标注' : '显示标注';
    }
    if(visible) start(); else stop();
  }

  function buildToggle(){
    var b = document.createElement('button');
    b.type = 'button'; b.id = 'gd-toggle-btn'; b.className = 'gd-toggle on';
    b.title = '';
    b.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5c-2.8 0-5 2-5 4.5 0 1.6.8 2.7 1.8 3.6.5.4.7.8.7 1.4v.3h5v-.3c0-.6.2-1 .7-1.4C12.2 8.7 13 7.6 13 6c0-2.5-2.2-4.5-5-4.5z" stroke="currentColor" fill="none" stroke-linejoin="round"/><path d="M6.7 13.7h2.6M6.9 12h2.2" stroke="currentColor" stroke-linecap="round"/></svg><span></span>';
    b.addEventListener('click', function(){ setVisible(!visible); });
    document.body.appendChild(b);

    var legend = document.createElement('div');
    legend.id = 'gd-legend'; legend.className = 'gd-legend';
    var X = '<button type="button" class="x" title="关闭全部标注（Esc）" aria-label="关闭全部标注">'
      + '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></button>';
    var keys = '<div class="keys"><span class="row"><i></i>点这里</span><span class="row"><i></i>点完这里会变</span></div>';
    if(scene){
      var rows = [['在做', scene.at], ['要做成', scene.goal], ['卡在', scene.pain], ['这里', scene.fix], ['Agent', scene.agent]]
        .filter(function(r){ return r[1]; })
        .map(function(r){ return '<div class="sc' + (r[0] === '这里' ? ' fix' : r[0] === 'Agent' ? ' agent' : '') + '"><em>' + r[0] + '</em><span>' + esc(r[1]) + '</span></div>'; }).join('');
      legend.classList.add('gd-scene');
      legend.innerHTML = '<div class="hd"><button type="button" class="fold" aria-expanded="true" title="折叠 / 展开场景">'
        + '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 6.5 8 10l3.5-3.5" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        + '<b>这一页解决什么</b><span class="brief">' + esc(scene.at || scene.goal || '') + '</span></button>' + X + '</div>'
        + '<div class="bd">' + rows + keys + '</div>';
      var fold = legend.querySelector('.fold');
      var setFold = function(c){ legend.classList.toggle('folded', c); fold.setAttribute('aria-expanded', String(!c)); };
      var sv = null; try{ sv = localStorage.getItem(SKEY); }catch(e){}
      setFold(sv === 'folded');
      fold.addEventListener('click', function(){
        var c = !legend.classList.contains('folded'); setFold(c);
        try{ localStorage.setItem(SKEY, c ? 'folded' : 'open'); }catch(e){}
      });
      /* 读完场景开始动手：第一次点页面别处就自动折成一行，不挡操作（不记忆，下次进来仍展开） */
      var autoFold = function(e){
        if(legend.contains(e.target)) return;
        document.removeEventListener('pointerdown', autoFold, true);
        setFold(true);
      };
      document.addEventListener('pointerdown', autoFold, true);
    } else {
      legend.innerHTML = '<div class="hd"><b>页面标注</b>' + X + '</div>'
        + '<span class="row"><i></i>点这里，触发这条创新点的关键交互</span><span class="row"><i></i>这里会变，是点完之后的结果</span>';
    }
    legend.querySelector('.x').addEventListener('click', function(){ setVisible(false); });
    document.body.appendChild(legend);

    /* Esc 只在当前页收起（demo 里 Esc 也用来关弹层，不应顺带改掉全局选择） */
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && visible) setVisible(false, false); });
  }

  function init(list, opts){
    if(!list || !list.length) return;
    scene = (opts && opts.scene) || null;
    var layer = document.createElement('div');
    layer.id = 'gd-layer'; layer.className = 'gd-layer';
    list.forEach(function(m, i){
      var el = document.createElement('div');
      el.className = 'gd-mark gd-' + (m.kind || 'click') + ' gd-pos-' + (m.pos || 'top');
      var num = m.kind === 'change' ? '→' : String(i + 1);
      el.innerHTML = '<span class="gd-ring"></span><span class="gd-tag"><b>' + num + '</b><span>' + esc(m.label) + '</span></span>';
      layer.appendChild(el);
      marks.push({ el: el, sel: m.target });
    });
    document.body.appendChild(layer);
    buildToggle();
    setVisible(saved() !== 'off', false);
    sync();
  }

  return { init: init, refresh: sync, setVisible: setVisible };
})();
