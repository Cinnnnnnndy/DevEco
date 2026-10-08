/* =====================================================================
   demos/_shared/workspace.js —— 「Agent 工作台」外壳（鸿蒙电脑版 DevEco Studio · AI Coding 默认视图）
   和 frame.js 平行、互不依赖：frame 画经典 IDE，workspace 画任务优先的窗口。
   用法（页面末尾，引 tokens.css / components.css / ai.css / workspace.css 与 icons.js / ai-icons.js 之后）：
     <div class="ide ws" id="ide" data-ide-theme="dark" data-view="ws"><div class="ws-body">…</div></div>
     var shell = WorkspaceShell.init({
       project:'MallApp', branch:'feature/grid-list',
       target:'MateBook Pro (This PC)',
       views:[['ws','工作台'],['classic','编辑视图']],   // 顶栏视图切换；省略则不显示
       onView:function(v){ … }                            // 切换后回调，.ide[data-view] 已更新
     });
     shell.capsule(state, html)   // 顶栏中间的 Agent 胶囊：state 取 ai.css 状态机（idle/thinking/tool/generating/waiting/verifying/done/error）
     shell.onCapsule(fn)          // 点胶囊
     shell.status(html)           // 状态栏右侧的自定义片段
     shell.setView(v)
   另给：WorkspaceShell.hl(src) —— ArkTS 单行语法着色（返回 HTML，类名沿用 components.css 的 .k/.s/.n/.c/.f/.p/.m/.ty）
   主题：读 / 写 localStorage 的 deveco-theme（与所有 demo 共用），dark ↔ light；同时写 :root[data-theme]
   让页面外层的标注卡跟着换肤。
   ===================================================================== */
window.WorkspaceShell = (function(){
  'use strict';
  var $ = function(s, r){ return (r || document).querySelector(s); };
  var esc = function(s){ return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };

  var SYMBOLS = ''
    + '<symbol id="ws-logo" viewBox="0 0 64 64"><defs><linearGradient id="wsl1" x1="100%" y1="57%" x2="39%" y2="57%"><stop stop-color="#2C8DDD" offset="0"/><stop stop-color="#3357AC" offset="1"/></linearGradient><linearGradient id="wsl2" x1="61%" y1="10%" x2="25%" y2="87%"><stop stop-color="#2369BD" offset="0"/><stop stop-color="#307BD4" offset=".32"/><stop stop-color="#3C6ACB" offset="1"/></linearGradient><linearGradient id="wsl3" x1="32%" y1="76%" x2="68%" y2="0%"><stop stop-color="#1A88AC" offset="0"/><stop stop-color="#4BDEE8" offset="1"/></linearGradient></defs><g transform="translate(0,7)"><polygon fill="url(#wsl1)" transform="translate(50.15,44.4) scale(-1,1) translate(-50.15,-44.4)" points="36.3 38.15 64 38.15 64 50.67 43.7 50.67"/><polygon fill="url(#wsl2)" transform="translate(44.1,25.33) scale(-1,1) translate(-44.1,-25.33)" points="48.5 0 63.97 0 64 0.02 31.6 50.67 24.2 38.15"/><polygon fill="url(#wsl3)" points="24.3 0 39.76 0 39.8 0.02 7.4 50.67 0 38.15"/><polygon fill="#1C9DCC" points="0 38.15 27.7 38.15 27.7 50.67 7.4 50.67"/></g></symbol>'
    + '<symbol id="ws-moon" viewBox="0 0 16 16"><path d="M13.5 9.5A5.5 5.5 0 0 1 6.5 2.5a5.5 5.5 0 1 0 7 7Z" stroke="currentColor" stroke-linejoin="round" fill="none"/></symbol>'
    + '<symbol id="ws-sun" viewBox="0 0 16 16"><circle cx="8" cy="8" r="3" stroke="currentColor" fill="none"/><path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4" stroke="currentColor" stroke-linecap="round"/></symbol>'
    + '<symbol id="ws-min" viewBox="0 0 16 16"><path d="M3.5 8h9" stroke="currentColor" stroke-linecap="round"/></symbol>'
    + '<symbol id="ws-max" viewBox="0 0 16 16"><rect x="3.5" y="3.5" width="9" height="9" rx="2" stroke="currentColor" fill="none"/></symbol>'
    + '<symbol id="ws-x" viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-linecap="round"/></symbol>'
    + '<symbol id="ws-phone" viewBox="0 0 16 16"><rect x="4.5" y="1.5" width="7" height="13" rx="1.6" stroke="currentColor" fill="none"/><path d="M7 12.5h2" stroke="currentColor" stroke-linecap="round"/></symbol>'
    + '<symbol id="ws-fold" viewBox="0 0 16 16"><rect x="2" y="2.5" width="12" height="11" rx="1.5" stroke="currentColor" fill="none"/><path d="M8 2.5v11" stroke="currentColor" stroke-dasharray="1.5 1.5"/></symbol>'
    + '<symbol id="ws-tablet" viewBox="0 0 16 16"><rect x="1.5" y="3" width="13" height="10" rx="1.5" stroke="currentColor" fill="none"/></symbol>'
    + '<symbol id="ws-pc" viewBox="0 0 16 16"><rect x="2.5" y="3" width="11" height="7.5" rx="1" stroke="currentColor" fill="none"/><path d="M1 13h14" stroke="currentColor" stroke-linecap="round"/></symbol>'
    + '<symbol id="ws-branch" viewBox="0 0 16 16"><circle cx="4.5" cy="3.5" r="1.5" stroke="currentColor" fill="none"/><circle cx="4.5" cy="12.5" r="1.5" stroke="currentColor" fill="none"/><circle cx="11.5" cy="5.5" r="1.5" stroke="currentColor" fill="none"/><path d="M4.5 5v6M11.5 7c0 3-7 1-7 4" stroke="currentColor" fill="none"/></symbol>'
    + '<symbol id="ws-tasks" viewBox="0 0 16 16"><path d="M6.5 4h7M6.5 8h7M6.5 12h7" stroke="currentColor" stroke-linecap="round"/><circle cx="3.2" cy="4" r="1.1" fill="currentColor"/><circle cx="3.2" cy="8" r="1.1" fill="currentColor"/><circle cx="3.2" cy="12" r="1.1" fill="currentColor"/></symbol>'
    + '<symbol id="ws-files" viewBox="0 0 16 16"><path d="M4 1.8h5l3 3v9.4H4z" stroke="currentColor" stroke-linejoin="round" fill="none"/><path d="M9 1.8v3h3" stroke="currentColor" stroke-linejoin="round" fill="none"/></symbol>'
    + '<symbol id="ws-layout-ws" viewBox="0 0 16 16"><rect x="1.5" y="2.5" width="13" height="11" rx="1.5" stroke="currentColor" fill="none"/><path d="M5 2.5v11M5 8.5h9.5" stroke="currentColor"/></symbol>'
    + '<symbol id="ws-layout-ed" viewBox="0 0 16 16"><rect x="1.5" y="2.5" width="13" height="11" rx="1.5" stroke="currentColor" fill="none"/><path d="M5 2.5v11M11 2.5v11M7 5.5h2.5M7 7.5h2.5M7 9.5h1.5" stroke="currentColor" stroke-linecap="round"/></symbol>'
    + '<symbol id="ws-warn" viewBox="0 0 16 16"><path d="M8 2l6.5 11.5h-13z" stroke="currentColor" stroke-linejoin="round" fill="none"/><path d="M8 6.5v3.2" stroke="currentColor" stroke-linecap="round"/><circle cx="8" cy="11.6" r=".7" fill="currentColor"/></symbol>'
    + '<symbol id="ws-err" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" stroke="currentColor" fill="none"/><path d="M5.8 5.8l4.4 4.4M10.2 5.8l-4.4 4.4" stroke="currentColor" stroke-linecap="round"/></symbol>'
    + '<symbol id="ws-okc" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" stroke="currentColor" fill="none"/><path d="M5.3 8.2l1.9 1.9 3.6-3.8" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" fill="none"/></symbol>'
    + '<symbol id="ws-reload" viewBox="0 0 16 16"><path d="M13.5 8A5.5 5.5 0 1 1 8 2.5h2.5" stroke="currentColor" stroke-linecap="round" fill="none"/><path d="M9 .5l2 2-2 2" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" fill="none"/></symbol>'
    + '<symbol id="ws-plus" viewBox="0 0 16 16"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-linecap="round"/></symbol>'
    + '<symbol id="ws-eye" viewBox="0 0 16 16"><path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z" stroke="currentColor" stroke-linejoin="round" fill="none"/><circle cx="8" cy="8" r="2" stroke="currentColor" fill="none"/></symbol>'
    + '<symbol id="ws-commit" viewBox="0 0 16 16"><circle cx="8" cy="8" r="2.6" stroke="currentColor" fill="none"/><path d="M1.5 8h3.9M10.6 8h3.9" stroke="currentColor" stroke-linecap="round"/></symbol>';

  function injectSymbols(){
    var d = document.createElement('div'); d.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    d.innerHTML = '<svg width="0" height="0" aria-hidden="true"><defs>' + SYMBOLS + '</defs></svg>';
    document.body.insertBefore(d, document.body.firstChild);
  }
  function ico(id, cls){ return '<svg class="i' + (cls ? ' ' + cls : '') + '"><use href="#' + id + '"/></svg>'; }

  /* ---------- ArkTS 单行着色 ---------- */
  var KW = /^(import|from|export|struct|private|public|new|this|return|if|else|const|let|async|await|string|number|boolean|true|false)$/;
  function hl(src){
    var re = /(\/\/.*$)|('(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(@\w+)|(\b\d+(?:\.\d+)?\b)|(\$r)|([A-Za-z_]\w*)/g;
    var out = '', last = 0, m;
    while((m = re.exec(src))){
      out += esc(src.slice(last, m.index)); last = re.lastIndex;
      var t = esc(m[0]);
      if(m[1]) out += '<span class="c">' + t + '</span>';
      else if(m[2]) out += '<span class="s">' + t + '</span>';
      else if(m[3]) out += '<span class="m">' + t + '</span>';
      else if(m[4]) out += '<span class="n">' + t + '</span>';
      else if(m[5]) out += '<span class="f">' + t + '</span>';
      else {
        var w = m[6], prev = src.charAt(m.index - 1), next = src.slice(re.lastIndex).match(/^\s*(\(|\{)/);
        if(KW.test(w)) out += '<span class="k">' + t + '</span>';
        else if(next && /^[A-Z]/.test(w)) out += '<span class="f">' + t + '</span>';
        else if(next && next[1] === '(') out += '<span class="f">' + t + '</span>';
        else if(/^[A-Z]/.test(w)) out += '<span class="ty">' + t + '</span>';
        else if(prev === '.') out += '<span class="p">' + t + '</span>';
        else out += t;
      }
    }
    return out + esc(src.slice(last));
  }

  /* ---------- 主题 ---------- */
  var ide, opts, capFn = null;
  function theme(){ return ide.getAttribute('data-ide-theme'); }
  function applyTheme(t){
    ide.setAttribute('data-ide-theme', t);
    document.documentElement.setAttribute('data-theme', t);
    var u = $('#ws-theme use'); if(u) u.setAttribute('href', t === 'dark' ? '#ws-moon' : '#ws-sun');
    try{ localStorage.setItem('deveco-theme', t); }catch(e){}
  }

  function header(o){
    var views = o.views ? '<div class="ws-seg" id="view-switch" role="group" aria-label="视图">' + o.views.map(function(v, i){
      return '<button type="button" data-view="' + v[0] + '" aria-pressed="' + (i === 0) + '" title="' + esc(v[2] || '') + '">' + (v[3] ? ico(v[3]) : '') + esc(v[1]) + '</button>';
    }).join('') + '</div><span class="sep"></span>' : '';
    return '<header class="ws-hdr">'
      + '<div class="zl"><svg class="logo"><use href="#ws-logo"/></svg>'
      + '<button class="ws-hb" type="button"><b>' + esc(o.project) + '</b>' + ico('i-chevD', 'chev') + '</button>'
      + '<button class="ws-hb" type="button">' + ico('ws-branch') + '<span class="dim">' + esc(o.branch) + '</span>' + ico('i-chevD', 'chev') + '</button></div>'
      + '<div class="zc" id="ws-capsule"></div>'
      + '<div class="zr">' + views
      + '<button class="ws-hb" type="button" title="运行目标">' + ico('ws-pc') + '<span>' + esc(o.target) + '</span>' + ico('i-chevD', 'chev') + '</button>'
      + '<button class="ws-hb icon run" type="button" title="Run entry">' + ico('i-run') + '</button>'
      + '<button class="ws-hb icon" type="button" title="Debug entry">' + ico('i-debug') + '</button>'
      + '<span class="sep"></span>'
      + '<button class="ws-hb icon" type="button" title="Search Everywhere">' + ico('i-search') + '</button>'
      + '<button class="ws-hb icon" type="button" title="Settings">' + ico('i-settings') + '</button>'
      + '<button class="ws-hb icon" type="button" id="ws-theme" title="Theme">' + ico('ws-moon') + '</button>'
      + '<div class="ws-winctl" aria-hidden="true"><span>' + ico('ws-min') + '</span><span>' + ico('ws-max') + '</span><span class="x">' + ico('ws-x') + '</span></div>'
      + '</div></header>';
  }
  function statusbar(o){
    return '<footer class="ws-status"><span class="it path">' + esc(o.path) + '</span><span class="grow"></span><span id="ws-status-slot" style="display:inline-flex;align-items:center;gap:2px"></span>'
      + '<span class="it">HarmonyOS 6.1</span><span class="it">UTF-8</span><span class="it">' + ico('i-lock') + '</span></footer>';
  }

  function capsule(state, html){
    var c = $('#ws-capsule'); if(!c) return;
    var icon = {
      idle: '<svg class="ai-ico"><use href="#ai-mark"/></svg>',
      thinking: '<span class="ai-spark is-live"></span>',
      generating: '<span class="ai-spark is-live"></span>',
      tool: '<span class="ai-ring"></span>',
      verifying: '<span class="ai-ring"></span>',
      waiting: '<span class="ai-wait-dot"></span>',
      done: '<svg class="ai-ico"><use href="#ws-okc"/></svg>',
      error: '<svg class="ai-ico"><use href="#ws-err"/></svg>'
    }[state] || '';
    c.innerHTML = '<span class="ai-status ws-cap" role="button" tabindex="0" data-state="' + state + '">' + icon + '<span class="lbl">' + html + '</span></span>';
  }

  function setView(v){
    ide.setAttribute('data-view', v);
    var sw = $('#view-switch');
    if(sw) Array.prototype.forEach.call(sw.querySelectorAll('button'), function(b){ b.setAttribute('aria-pressed', String(b.dataset.view === v)); });
    if(opts.onView) opts.onView(v);
  }

  function init(o){
    opts = o || {};
    ide = $('#ide') || $('.ide.ws'); if(!ide) return null;
    injectSymbols();
    var cfg = { project: opts.project || 'MyApplication', branch: opts.branch || 'main', target: opts.target || 'This PC',
      path: opts.path || '~/DevEcoStudioProjects/' + (opts.project || 'MyApplication'), views: opts.views };
    ide.insertAdjacentHTML('afterbegin', header(cfg));
    ide.insertAdjacentHTML('beforeend', statusbar(cfg));
    var saved = 'dark'; try{ saved = localStorage.getItem('deveco-theme') || 'dark'; }catch(e){}
    applyTheme(saved === 'dark' ? 'dark' : 'light');
    $('#ws-theme').addEventListener('click', function(){ applyTheme(theme() === 'dark' ? 'light' : 'dark'); });
    var sw = $('#view-switch');
    if(sw) sw.addEventListener('click', function(e){ var b = e.target.closest('button[data-view]'); if(b) setView(b.dataset.view); });
    $('#ws-capsule').addEventListener('click', function(){ if(capFn) capFn(); });
    $('#ws-capsule').addEventListener('keydown', function(e){ if((e.key === 'Enter' || e.key === ' ') && capFn){ e.preventDefault(); capFn(); } });
    capsule('idle', '待命');
    return {
      capsule: capsule,
      onCapsule: function(fn){ capFn = fn; },
      status: function(html){ var s = $('#ws-status-slot'); if(s) s.innerHTML = html; },
      setView: setView,
      theme: theme
    };
  }

  return { init: init, hl: hl, esc: esc, ico: ico };
})();
