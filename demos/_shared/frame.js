/* =====================================================================
   demos/_shared/frame.js —— 创新点 demo 的共享 IDE 外壳
   用法（页面末尾）：
     <div class="ide" id="ide" data-ide-theme="dark" data-left="project" data-right="agent" data-bottom="none">
       <div class="body">
         <div class="tw tw-left">  <div class="pane on" data-pane="project">…</div> </div>
         <div class="editor">…</div>
         <div class="tw tw-right"> <div class="pane on" data-pane="agent">…</div>   </div>
         <div class="tw tw-bottom"><div class="pane on" data-pane="build">…</div>   </div>
       </div>
     </div>
     <script>DemoFrame.init({project:'MyApplication', device:'Troubleshoot Device Connections'})</script>
   frame 负责：Header、菜单栏、左右侧栏、状态栏、Tooltip、主题循环（深 → 浅 → 浅+浅 Header）、
   侧栏按钮开合面板（按 .pane[data-pane] 名字匹配）、编辑器标签切换（.tab[data-file] ↔ [data-for-file]）。
   辅助：DemoFrame.tree(opts) / .code(file, opts) / .tabs(list) / .crumbs(file) / .setSide(side, name)
   ===================================================================== */
window.DemoFrame = (function(){
  'use strict';
  var $ = function(s,r){ return (r||document).querySelector(s); };
  var $$ = function(s,r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); };
  var esc = function(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); };
  var ide;

  /* ---------- 额外图标（主窗口界面稿里的 34 个 + demo 新增） ---------- */
  var EXTRA_SYMBOLS = "<symbol id=\"i-logo\" viewBox=\"0 0 64 64\"><defs><linearGradient id=\"lg1\" x1=\"100%\" y1=\"57%\" x2=\"39%\" y2=\"57%\"><stop stop-color=\"#2C8DDD\" offset=\"0\"/><stop stop-color=\"#3357AC\" offset=\"1\"/></linearGradient><linearGradient id=\"lg2\" x1=\"61%\" y1=\"10%\" x2=\"25%\" y2=\"87%\"><stop stop-color=\"#2369BD\" offset=\"0\"/><stop stop-color=\"#307BD4\" offset=\".32\"/><stop stop-color=\"#3C6ACB\" offset=\"1\"/></linearGradient><linearGradient id=\"lg3\" x1=\"32%\" y1=\"76%\" x2=\"68%\" y2=\"0%\"><stop stop-color=\"#1A88AC\" offset=\"0\"/><stop stop-color=\"#4BDEE8\" offset=\"1\"/></linearGradient></defs><g transform=\"translate(0,7)\"><polygon fill=\"url(#lg1)\" transform=\"translate(50.15,44.4) scale(-1,1) translate(-50.15,-44.4)\" points=\"36.3 38.15 64 38.15 64 50.67 43.7 50.67\"/><polygon fill=\"url(#lg2)\" transform=\"translate(44.1,25.33) scale(-1,1) translate(-44.1,-25.33)\" points=\"48.5 0 63.97 0 64 0.02 31.6 50.67 24.2 38.15\"/><polygon fill=\"url(#lg3)\" points=\"24.3 0 39.76 0 39.8 0.02 7.4 50.67 0 38.15\"/><polygon fill=\"#1C9DCC\" points=\"0 38.15 27.7 38.15 27.7 50.67 7.4 50.67\"/></g></symbol>\n<symbol id=\"i-moon\" viewBox=\"0 0 16 16\"><path d=\"M13.5 9.5A5.5 5.5 0 0 1 6.5 2.5a5.5 5.5 0 1 0 7 7Z\" stroke=\"currentColor\" stroke-linejoin=\"round\" fill=\"none\"/></symbol>\n<symbol id=\"i-sun\" viewBox=\"0 0 16 16\"><circle cx=\"8\" cy=\"8\" r=\"3\" stroke=\"currentColor\" fill=\"none\"/><path d=\"M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4\" stroke=\"currentColor\" stroke-linecap=\"round\"/></symbol>\n<symbol id=\"i-copy\" viewBox=\"0 0 16 16\"><rect x=\"5.5\" y=\"5.5\" width=\"8\" height=\"8\" rx=\"1\" stroke=\"currentColor\" fill=\"none\"/><path d=\"M10.5 5.5v-2a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2\" stroke=\"currentColor\" fill=\"none\"/></symbol>\n<symbol id=\"i-insert\" viewBox=\"0 0 16 16\"><path d=\"M2.5 8h11M9.5 4l4 4-4 4\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"/></symbol>\n<symbol id=\"i-cloud\" viewBox=\"0 0 16 16\"><path d=\"M4.5 12.5a3 3 0 0 1-.4-6 4 4 0 0 1 7.8 1 2.5 2.5 0 0 1-.4 5H4.5Z\" stroke=\"currentColor\" stroke-linejoin=\"round\" fill=\"none\"/></symbol>\n<symbol id=\"i-stopSq\" viewBox=\"0 0 16 16\"><rect x=\"4\" y=\"4\" width=\"8\" height=\"8\" rx=\"1.5\" fill=\"currentColor\"/></symbol>\n<symbol id=\"i-phone\" viewBox=\"0 0 16 16\"><rect x=\"4.5\" y=\"1.5\" width=\"7\" height=\"13\" rx=\"1.5\" stroke=\"currentColor\" fill=\"none\"/><path d=\"M7 12.5h2\" stroke=\"currentColor\" stroke-linecap=\"round\"/></symbol>\n<symbol id=\"i-rotate\" viewBox=\"0 0 16 16\"><path d=\"M13.5 8A5.5 5.5 0 1 1 8 2.5h2.5\" stroke=\"currentColor\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M9 .5l2 2-2 2\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"/></symbol>\n<symbol id=\"i-plus-box\" viewBox=\"0 0 16 16\"><rect x=\"2.5\" y=\"2.5\" width=\"11\" height=\"11\" rx=\"2\" stroke=\"currentColor\" fill=\"none\"/><path d=\"M8 5v6M5 8h6\" stroke=\"currentColor\" stroke-linecap=\"round\"/></symbol>\n<symbol id=\"i-translate\" viewBox=\"0 0 16 16\"><path d=\"M2.5 3.5h7M6 2v1.5M3.5 6.5c1.2 2.5 3 4 5.5 5M8.5 6.5c-.8 2.3-2.4 4.2-5 5.5\" stroke=\"currentColor\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M9.5 14l2.2-6h.6l2.2 6M10.4 12h3\" stroke=\"currentColor\" stroke-linecap=\"round\" fill=\"none\"/></symbol>\n<symbol id=\"i-sdk\" viewBox=\"0 0 16 16\"><circle cx=\"8\" cy=\"8\" r=\"5.5\" stroke=\"currentColor\" fill=\"none\"/><circle cx=\"8\" cy=\"8\" r=\"1.5\" fill=\"currentColor\"/><path d=\"M8 2.5v2M8 11.5v2M2.5 8h2M11.5 8h2\" stroke=\"currentColor\"/></symbol>\n<symbol id=\"i-projstruct\" viewBox=\"0 0 16 16\"><rect x=\"2.5\" y=\"2.5\" width=\"4.5\" height=\"4.5\" rx=\"1\" stroke=\"currentColor\" fill=\"none\"/><rect x=\"9\" y=\"2.5\" width=\"4.5\" height=\"4.5\" rx=\"1\" stroke=\"currentColor\" fill=\"none\"/><rect x=\"2.5\" y=\"9\" width=\"4.5\" height=\"4.5\" rx=\"1\" stroke=\"currentColor\" fill=\"none\"/><rect x=\"9\" y=\"9\" width=\"4.5\" height=\"4.5\" rx=\"1\" stroke=\"currentColor\" fill=\"none\"/></symbol>\n<symbol id=\"i-info\" viewBox=\"0 0 16 16\"><circle cx=\"8\" cy=\"8\" r=\"6.5\" stroke=\"currentColor\" fill=\"none\"/><path d=\"M8 7v4\" stroke=\"currentColor\" stroke-linecap=\"round\"/><circle cx=\"8\" cy=\"5\" r=\".7\" fill=\"currentColor\"/></symbol>\n<symbol id=\"i-user-sync\" viewBox=\"0 0 16 16\"><circle cx=\"7\" cy=\"5\" r=\"2.5\" stroke=\"currentColor\" fill=\"none\"/><path d=\"M2 13.5c.3-2.5 2.2-4 5-4 .9 0 1.7.2 2.4.5\" stroke=\"currentColor\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M14.5 11.5a2.5 2.5 0 0 1-4.3 1.7M9.5 12.5a2.5 2.5 0 0 1 4.3-1.7\" stroke=\"currentColor\" stroke-linecap=\"round\" fill=\"none\"/></symbol>\n<symbol id=\"i-kb\" viewBox=\"0 0 16 16\"><path d=\"M2.5 3.5c2-1 4-1 5.5.5 1.5-1.5 3.5-1.5 5.5-.5v9c-2-1-4-1-5.5.5-1.5-1.5-3.5-1.5-5.5-.5z\" stroke=\"currentColor\" stroke-linejoin=\"round\" fill=\"none\"/><path d=\"M8 4v9\" stroke=\"currentColor\"/></symbol>\n<symbol id=\"i-export\" viewBox=\"0 0 16 16\"><path d=\"M8 10V2M5 5l3-3 3 3\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"/><path d=\"M2.5 9.5v3a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-3\" stroke=\"currentColor\" stroke-linecap=\"round\" fill=\"none\"/></symbol>\n<symbol id=\"i-cube\" viewBox=\"0 0 16 16\"><path d=\"M8 1.5l6 3.25v6.5L8 14.5l-6-3.25v-6.5z\" stroke=\"currentColor\" stroke-linejoin=\"round\" fill=\"none\"/><path d=\"M2 4.75L8 8l6-3.25M8 8v6.5\" stroke=\"currentColor\" fill=\"none\"/></symbol>\n<symbol id=\"i-skills\" viewBox=\"0 0 16 16\"><path d=\"M3 3l10 10M13 3L3 13\" stroke=\"currentColor\" stroke-linecap=\"round\"/><circle cx=\"8\" cy=\"8\" r=\"2.2\" fill=\"var(--ui-bg,#2B2D30)\" stroke=\"currentColor\"/></symbol>\n<symbol id=\"i-genie\" viewBox=\"0 0 16 16\"><path d=\"M8 1.5l5.6 3.25v6.5L8 14.5l-5.6-3.25v-6.5z\" stroke=\"currentColor\" stroke-width=\"1.2\" stroke-linejoin=\"round\" fill=\"none\"/><path d=\"M10.3 6.3a2.8 2.8 0 1 0 .5 3H8.2\" stroke=\"currentColor\" stroke-width=\"1.2\" stroke-linecap=\"round\" fill=\"none\"/></symbol>\n<symbol id=\"i-hdoc\" viewBox=\"0 0 16 16\"><rect x=\"2.5\" y=\"2.5\" width=\"11\" height=\"11\" rx=\"2\" stroke=\"currentColor\" fill=\"none\"/><path d=\"M5.5 5v6M10.5 5v6M5.5 8h5\" stroke=\"currentColor\" stroke-linecap=\"round\"/></symbol>\n<symbol id=\"i-pen\" viewBox=\"0 0 16 16\"><path d=\"M2.5 13.5l.8-3.2 7.4-7.4a1.4 1.4 0 0 1 2 0l.4.4a1.4 1.4 0 0 1 0 2l-7.4 7.4z\" stroke=\"currentColor\" stroke-linejoin=\"round\" fill=\"none\"/><path d=\"M9.5 4l2.5 2.5\" stroke=\"currentColor\"/></symbol>\n<symbol id=\"i-puzzle\" viewBox=\"0 0 16 16\"><path d=\"M6 2.5h3v1.8a1.5 1.5 0 1 0 0 2.4V8h2.3a1.5 1.5 0 1 1 2.4 0H13v5.5H2.5V8h1.8a1.5 1.5 0 1 1 2.4 0H6z\" stroke=\"currentColor\" stroke-linejoin=\"round\" fill=\"none\"/></symbol>\n<symbol id=\"i-send-o\" viewBox=\"0 0 16 16\"><path d=\"M14 2L2 7l5 2 2 5z\" stroke=\"currentColor\" stroke-linejoin=\"round\" fill=\"none\"/><path d=\"M7 9l7-7\" stroke=\"currentColor\"/></symbol>\n<symbol id=\"i-indent\" viewBox=\"0 0 16 16\"><path d=\"M2 3.5h12M2 6.5h7M2 9.5h9M2 12.5h5\" stroke=\"currentColor\" stroke-linecap=\"round\"/><circle cx=\"12\" cy=\"11.5\" r=\"2.2\" stroke=\"currentColor\" fill=\"none\"/><path d=\"M13.6 13.1l1.4 1.4\" stroke=\"currentColor\" stroke-linecap=\"round\"/></symbol>\n<symbol id=\"i-unlock\" viewBox=\"0 0 16 16\"><rect x=\"3.5\" y=\"7.5\" width=\"9\" height=\"6\" rx=\"1\" stroke=\"currentColor\" fill=\"none\"/><path d=\"M5.5 7.5V5.5a2.5 2.5 0 0 1 4.8-1\" stroke=\"currentColor\" fill=\"none\" stroke-linecap=\"round\"/></symbol>\n<symbol id=\"i-regen\" viewBox=\"0 0 16 16\"><path d=\"M13.5 8A5.5 5.5 0 1 1 8 2.5h2.5\" stroke=\"currentColor\" stroke-linecap=\"round\" fill=\"none\"/><path d=\"M9 .5l2 2-2 2\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"/></symbol>\n<symbol id=\"i-like\" viewBox=\"0 0 16 16\"><path d=\"M5 7v6.5H2.5V7z\" stroke=\"currentColor\" fill=\"none\"/><path d=\"M5 7l3-5c1 0 1.7.7 1.5 1.7L9 6.5h3.5a1 1 0 0 1 1 1.2l-1 5a1 1 0 0 1-1 .8H5\" stroke=\"currentColor\" stroke-linejoin=\"round\" fill=\"none\"/></symbol>\n<symbol id=\"i-dislike\" viewBox=\"0 0 16 16\"><path d=\"M11 9V2.5h2.5V9z\" stroke=\"currentColor\" fill=\"none\"/><path d=\"M11 9l-3 5c-1 0-1.7-.7-1.5-1.7L7 9.5H3.5a1 1 0 0 1-1-1.2l1-5a1 1 0 0 1 1-.8H11\" stroke=\"currentColor\" stroke-linejoin=\"round\" fill=\"none\"/></symbol>\n<symbol id=\"i-flag\" viewBox=\"0 0 16 16\"><path d=\"M3.5 14V2.5h9l-2 3 2 3h-9\" stroke=\"currentColor\" stroke-linejoin=\"round\" fill=\"none\"/></symbol>\n<symbol id=\"i-method\" viewBox=\"0 0 16 16\"><circle cx=\"8\" cy=\"8\" r=\"6\" fill=\"#E37774\"/><text x=\"8\" y=\"11\" text-anchor=\"middle\" font-family=\"JetBrains Mono,monospace\" font-size=\"8\" font-weight=\"600\" fill=\"#1E1F22\">m</text></symbol>\n<symbol id=\"i-field\" viewBox=\"0 0 16 16\"><circle cx=\"8\" cy=\"8\" r=\"6\" fill=\"#E37774\"/><text x=\"8\" y=\"11\" text-anchor=\"middle\" font-family=\"JetBrains Mono,monospace\" font-size=\"8\" font-weight=\"600\" fill=\"#1E1F22\">f</text></symbol>\n<symbol id=\"i-struct\" viewBox=\"0 0 16 16\"><rect x=\"2.5\" y=\"2.5\" width=\"11\" height=\"11\" rx=\"2\" fill=\"#4E8052\" stroke=\"#89CC8E\"/><path d=\"M5 8h6M8 5v6\" stroke=\"#fff\" stroke-linecap=\"round\"/></symbol>\n<symbol id=\"i-at-gutter\" viewBox=\"0 0 16 16\"><circle cx=\"8\" cy=\"8\" r=\"2.2\" stroke=\"currentColor\" fill=\"none\"/><path d=\"M10.2 8v.8a1.3 1.3 0 0 0 2.6 0V8a4.8 4.8 0 1 0-1.9 3.8\" stroke=\"currentColor\" stroke-linecap=\"round\" fill=\"none\"/></symbol>";
  var DEMO_SYMBOLS = [
    '<symbol id="i-mic" viewBox="0 0 16 16"><rect x="5.5" y="1.5" width="5" height="8" rx="2.5" stroke="currentColor" fill="none"/><path d="M3.5 7.5a4.5 4.5 0 0 0 9 0M8 12v2.5M5.5 14.5h5" stroke="currentColor" stroke-linecap="round" fill="none"/></symbol>',
    '<symbol id="i-watch" viewBox="0 0 16 16"><rect x="4" y="4" width="8" height="8" rx="2" stroke="currentColor" fill="none"/><path d="M6 4V1.5h4V4M6 12v2.5h4V12" stroke="currentColor" stroke-linejoin="round" fill="none"/></symbol>',
    '<symbol id="i-tablet" viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" fill="none"/><circle cx="12.3" cy="8" r=".6" fill="currentColor"/></symbol>',
    '<symbol id="i-car" viewBox="0 0 16 16"><path d="M3 9.5l1.2-3.5A1.5 1.5 0 0 1 5.6 5h4.8a1.5 1.5 0 0 1 1.4 1L13 9.5v3H3z" stroke="currentColor" stroke-linejoin="round" fill="none"/><circle cx="5.3" cy="10.8" r=".9" fill="currentColor"/><circle cx="10.7" cy="10.8" r=".9" fill="currentColor"/><path d="M4 12.5v1.5M12 12.5v1.5" stroke="currentColor" stroke-linecap="round"/></symbol>',
    '<symbol id="i-tv" viewBox="0 0 16 16"><rect x="1.5" y="3" width="13" height="8.5" rx="1.5" stroke="currentColor" fill="none"/><path d="M5.5 14h5" stroke="currentColor" stroke-linecap="round"/></symbol>',
    '<symbol id="i-fold" viewBox="0 0 16 16"><rect x="2" y="2.5" width="12" height="11" rx="1.5" stroke="currentColor" fill="none"/><path d="M8 2.5v11" stroke="currentColor" stroke-dasharray="1.5 1.5"/></symbol>',
    '<symbol id="i-layout" viewBox="0 0 16 16"><rect x="2" y="2.5" width="12" height="11" rx="1.5" stroke="currentColor" fill="none"/><path d="M2 6h12M6 6v7.5" stroke="currentColor"/></symbol>',
    '<symbol id="i-clock" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" stroke="currentColor" fill="none"/><path d="M8 4.5V8l2.5 1.5" stroke="currentColor" stroke-linecap="round" fill="none"/></symbol>',
    '<symbol id="i-warn" viewBox="0 0 16 16"><path d="M8 2l6.5 11.5h-13z" stroke="currentColor" stroke-linejoin="round" fill="none"/><path d="M8 6.5v3.2" stroke="currentColor" stroke-linecap="round"/><circle cx="8" cy="11.6" r=".7" fill="currentColor"/></symbol>',
    '<symbol id="i-err" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" stroke="currentColor" fill="none"/><path d="M5.8 5.8l4.4 4.4M10.2 5.8l-4.4 4.4" stroke="currentColor" stroke-linecap="round"/></symbol>',
    '<symbol id="i-undo" viewBox="0 0 16 16"><path d="M3 6.5h7a3 3 0 0 1 0 6H7" stroke="currentColor" stroke-linecap="round" fill="none"/><path d="M5.5 4L3 6.5 5.5 9" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" fill="none"/></symbol>',
    '<symbol id="i-link" viewBox="0 0 16 16"><path d="M6.5 9.5l3-3M7 4.5l1.2-1.2a2.5 2.5 0 0 1 3.5 3.5L10.5 8M9 11.5l-1.2 1.2a2.5 2.5 0 0 1-3.5-3.5L5.5 8" stroke="currentColor" stroke-linecap="round" fill="none"/></symbol>',
    '<symbol id="i-bolt" viewBox="0 0 16 16"><path d="M9 1.5L3.5 9h4l-.5 5.5L12.5 7h-4z" stroke="currentColor" stroke-linejoin="round" fill="none"/></symbol>',
    '<symbol id="i-arrowR" viewBox="0 0 16 16"><path d="M2.5 8h11M9.5 4l4 4-4 4" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" fill="none"/></symbol>',
    '<symbol id="i-pause" viewBox="0 0 16 16"><rect x="4" y="3" width="3" height="10" rx=".8" fill="currentColor"/><rect x="9" y="3" width="3" height="10" rx=".8" fill="currentColor"/></symbol>',
    '<symbol id="i-play" viewBox="0 0 16 16"><path d="M4.5 3l8 5-8 5z" fill="currentColor"/></symbol>',
    '<symbol id="i-camera" viewBox="0 0 16 16"><path d="M2 5.5h2.5l1-1.8h5l1 1.8H14v7.5H2z" stroke="currentColor" stroke-linejoin="round" fill="none"/><circle cx="8" cy="9" r="2.3" stroke="currentColor" fill="none"/></symbol>',
    '<symbol id="i-diff" viewBox="0 0 16 16"><path d="M5 2.5v11M2.5 5H7.5M2.5 11.5h5" stroke="currentColor" stroke-linecap="round"/><path d="M11 2.5v11M8.5 11.5h5" stroke="currentColor" stroke-linecap="round"/></symbol>',
    '<symbol id="i-branch" viewBox="0 0 16 16"><circle cx="4" cy="3.5" r="1.5" stroke="currentColor" fill="none"/><circle cx="4" cy="12.5" r="1.5" stroke="currentColor" fill="none"/><circle cx="12" cy="5.5" r="1.5" stroke="currentColor" fill="none"/><path d="M4 5v6M12 7c0 3-8 1-8 4" stroke="currentColor" fill="none"/></symbol>',
    '<symbol id="i-sparkle" viewBox="0 0 16 16"><path d="M8 1.5l1.6 4.4L14 7.5l-4.4 1.6L8 13.5 6.4 9.1 2 7.5l4.4-1.6z" stroke="currentColor" stroke-linejoin="round" fill="none"/></symbol>',
    '<symbol id="i-speaker" viewBox="0 0 16 16"><path d="M2.5 6v4h2.5l3.5 3V3L5 6z" stroke="currentColor" stroke-linejoin="round" fill="none"/><path d="M10.5 5.5a3.5 3.5 0 0 1 0 5M12.5 3.5a6 6 0 0 1 0 9" stroke="currentColor" stroke-linecap="round" fill="none"/></symbol>',
    '<symbol id="i-question" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.5" stroke="currentColor" fill="none"/><path d="M6 6.3a2 2 0 1 1 2.8 1.8c-.6.3-.8.7-.8 1.3" stroke="currentColor" stroke-linecap="round" fill="none"/><circle cx="8" cy="11.5" r=".7" fill="currentColor"/></symbol>',
    '<symbol id="i-hand" viewBox="0 0 16 16"><path d="M5 8V3.5a1 1 0 0 1 2 0V7M7 7V2.5a1 1 0 0 1 2 0V7M9 7V3.5a1 1 0 0 1 2 0V8.5M11 8.5V5.5a1 1 0 0 1 2 0v4a4.5 4.5 0 0 1-4.5 4.5H8a4 4 0 0 1-3.3-1.8L2.4 8.8a1 1 0 0 1 1.7-1L5 9" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" fill="none"/></symbol>',
    '<symbol id="i-usb" viewBox="0 0 16 16"><path d="M8 1.5v13M8 1.5l-1.5 2h3zM8 11.5l-2.5-1.5V7M8 10l2.5-1.5V6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="5.5" cy="6" r="1" stroke="currentColor" fill="none"/><rect x="9.5" y="4.5" width="2" height="2" stroke="currentColor" fill="none"/><circle cx="8" cy="13.5" r="1.2" fill="currentColor"/></symbol>',
    '<symbol id="i-wifi" viewBox="0 0 16 16"><path d="M1.5 6a9.5 9.5 0 0 1 13 0M4 8.5a6 6 0 0 1 8 0M6.3 11a2.6 2.6 0 0 1 3.4 0" stroke="currentColor" stroke-linecap="round" fill="none"/><circle cx="8" cy="13.2" r=".9" fill="currentColor"/></symbol>',
    '<symbol id="i-scene" viewBox="0 0 16 16"><path d="M2 4.5h12M2 8h12M2 11.5h7" stroke="currentColor" stroke-linecap="round"/><circle cx="12.5" cy="11.5" r="1.5" stroke="currentColor" fill="none"/></symbol>',
    '<symbol id="i-sync" viewBox="0 0 16 16"><path d="M13 7A5 5 0 0 0 4 4.5M3 9a5 5 0 0 0 9 2.5" stroke="currentColor" stroke-linecap="round" fill="none"/><path d="M4 1.5v3h3M12 14.5v-3H9" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" fill="none"/></symbol>',
    '<symbol id="i-hourglass" viewBox="0 0 16 16"><path d="M4 2h8M4 14h8M5 2c0 4 3 4.5 3 6s-3 2-3 6M11 2c0 4-3 4.5-3 6s3 2 3 6" stroke="currentColor" stroke-linecap="round" fill="none"/></symbol>',
    '<symbol id="i-md" viewBox="0 0 16 16"><rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="currentColor" fill="none"/><path d="M4 10V6l1.8 2L7.5 6v4M10.5 6v4M9 8.5l1.5 1.5L12 8.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" fill="none"/></symbol>',
    '<symbol id="i-cursor" viewBox="0 0 16 16"><path d="M3 2l10 5-4.5 1.5L7 13z" stroke="currentColor" stroke-linejoin="round" fill="none"/></symbol>',
    '<symbol id="i-tune" viewBox="0 0 16 16"><path d="M2 4.5h6M11 4.5h3M2 11.5h3M8 11.5h6" stroke="currentColor" stroke-linecap="round"/><circle cx="9.5" cy="4.5" r="1.5" stroke="currentColor" fill="none"/><circle cx="6.5" cy="11.5" r="1.5" stroke="currentColor" fill="none"/></symbol>'
  ].join('');

  function injectSymbols(){
    var d=document.createElement('div');d.style.cssText='position:absolute;width:0;height:0;overflow:hidden';
    d.innerHTML='<svg width="0" height="0" aria-hidden="true"><defs>'+EXTRA_SYMBOLS+DEMO_SYMBOLS+'</defs></svg>';
    document.body.insertBefore(d,document.body.firstChild);
  }

  /* ---------- Header / 菜单栏 ---------- */
  function headerHTML(o){
    return '<div class="hdr">'
      + '<div class="zone left">'
      + '<button class="hbtn icon-only hamburger" title="Main Menu|Alt+\\"><svg class="i"><use href="#i-hamburger"/></svg></button>'
      + '<button class="hbtn"><span class="avatar">'+esc(o.avatar)+'</span><span class="name">'+esc(o.project)+'</span><svg class="i"><use href="#i-chevD"/></svg></button>'
      + '<button class="hbtn"><svg class="i"><use href="#i-vcs"/></svg><span class="dim">'+esc(o.vcs)+'</span><svg class="i"><use href="#i-chevD"/></svg></button>'
      + '</div><div class="zone center" id="hdr-center">'+(o.center||'')+'</div><div class="zone right">'
      + '<button class="hbtn icon-only" title="Translate"><svg class="i"><use href="#i-translate"/></svg></button>'
      + '<button class="hbtn"><svg class="i"><use href="#i-module"/></svg><span>'+esc(o.module)+'</span><svg class="i"><use href="#i-chevD"/></svg></button>'
      + '<button class="hbtn" id="hdr-device">'+(o.deviceIcon?'<svg class="i"><use href="'+o.deviceIcon+'"/></svg>':'')+'<span>'+esc(o.device)+'</span><svg class="i"><use href="#i-chevD"/></svg></button>'
      + '<button class="hbtn icon-only" title="Run \''+esc(o.module)+'\'|Shift+F10"><svg class="i"><use href="#i-run"/></svg></button>'
      + '<button class="hbtn icon-only" title="Debug \''+esc(o.module)+'\'|Shift+F9"><svg class="i"><use href="#i-debug"/></svg></button>'
      + '<button class="hbtn icon-only disabled" title="Rerun"><svg class="i"><use href="#i-rerun"/></svg></button>'
      + '<button class="hbtn icon-only disabled" title="Profile"><svg class="i"><use href="#i-profile"/></svg></button>'
      + '<button class="hbtn icon-only" title="More Run Actions"><svg class="i"><use href="#i-moreV"/></svg></button>'
      + '<span class="sep"></span>'
      + '<button class="hbtn icon-only" title="SDK Settings"><svg class="i"><use href="#i-sdk"/></svg></button>'
      + '<button class="hbtn icon-only" title="Project Structure|Ctrl+Alt+Shift+S"><svg class="i"><use href="#i-projstruct"/></svg></button>'
      + '<button class="hbtn icon-only" title="Account"><svg class="i"><use href="#i-user"/></svg></button>'
      + '<button class="hbtn icon-only" title="Search Everywhere|Double Shift"><svg class="i"><use href="#i-search"/></svg></button>'
      + '<button class="hbtn icon-only" title="Settings|Ctrl+Alt+S"><svg class="i"><use href="#i-settings"/></svg></button>'
      + '<button class="hbtn icon-only" id="theme-btn" title="Theme: Dark / Light / Light Header"><svg class="i"><use href="#i-moon"/></svg></button>'
      + '<div class="caption"><button type="button" title="Minimize"><svg><use href="#i-win-min"/></svg></button><button type="button" title="Maximize"><svg><use href="#i-win-max"/></svg></button><button type="button" class="close" title="Close"><svg><use href="#i-win-close"/></svg></button></div>'
      + '</div></div>'
      + '<div class="menubar"><span>File</span><span>Edit</span><span>View</span><span>Navigate</span><span>Code</span><span>Refactor</span><span>Build</span><span>Run</span><span>Tools</span><span>Git</span><span>Window</span><span>Help</span></div>';
  }

  /* ---------- 侧栏 ---------- */
  var LEFT_DEFAULT = [
    {left:'project',icon:'#i-tw-project',title:'Project|Alt+1'},
    {left:'structure',icon:'#i-tw-structure',title:'Structure|Alt+7'},
    {more:1},{gap:1},
    {bottom:'build',icon:'#i-tw-build',title:'Build'},
    {bottom:'log',icon:'#i-tw-device',title:'Log'},
    {bottom:'services',icon:'#i-tw-todo',title:'Services|Alt+8'},
    {bottom:'problems',icon:'#i-tw-problems',title:'Problems|Alt+6'},
    {bottom:'run',icon:'#i-tw-services',title:'Run|Alt+4'},
    {bottom:'terminal',icon:'#i-tw-terminal',title:'Terminal|Alt+F12'},
    {bottom:'debug',icon:'#i-info',title:'Debug|Alt+5'},
    {bottom:'vcs',icon:'#i-vcs',title:'Version Control|Alt+9'}
  ];
  var RIGHT_DEFAULT = [
    {right:'notifications',icon:'#i-tw-notifications',title:'Notifications',dot:1},
    {right:'agent',icon:'#i-genie',title:'DevEco Code'},
    {right:'docs',icon:'#i-hdoc',title:'HarmonyOS Docs'},
    {right:'inspector',icon:'#i-pen',title:'Code Review'},
    {right:'web',icon:'#i-puzzle',title:'Extensions'},
    {right:'previewer',icon:'#i-tw-preview',title:'Previewer'},
    {more:1},
    {right:'devices',icon:'#i-phone',title:'Device Manager'}
  ];
  function stripeHTML(side,list){
    return '<div class="stripe '+side+'">'+list.map(function(b){
      if(b.gap) return '<span class="gap"></span>';
      if(b.more) return '<button class="sbtn more" title="More Tool Windows"><svg class="i"><use href="#i-moreH"/></svg></button>';
      var key=b.left?'data-left="'+b.left+'"':(b.right?'data-right="'+b.right+'"':'data-bottom="'+b.bottom+'"');
      return '<button class="sbtn" '+key+' title="'+esc(b.title||'')+'"><svg class="i"><use href="'+b.icon+'"/></svg>'+(b.dot?'<span class="dot"></span>':'')+'</button>';
    }).join('')+'</div>';
  }

  /* ---------- 状态栏 ---------- */
  function statusHTML(o){
    return '<div class="status"><span class="crumbs" id="status-crumbs"></span><span class="grow"></span><span class="status-slot" id="status-slot"></span>'
      + '<span class="sw" title="DevEco Code"><svg class="i"><use href="#i-genie"/></svg></span><span class="sw"><span class="green"></span></span>'
      + '<span class="sw" id="status-pos">'+esc(o.pos||'23:2')+'</span><span class="sw">LF</span><span class="sw">UTF-8</span>'
      + '<span class="sw"><svg class="i"><use href="#i-indent"/></svg>2 spaces</span><span class="sw"><svg class="i"><use href="#i-unlock"/></svg></span></div>'
      + '<div class="tip" id="tip" hidden></div>';
  }

  /* ---------- 项目树 ---------- */
  var ICON={folder:'#i-folder',module:'#i-module',sourceRoot:'#i-sourceRoot',testRoot:'#i-testRoot',resRoot:'#i-resRoot',ets:'#i-ets',json:'#i-json',gitignore:'#i-gitignore',hvigor:'#i-hvigor',text:'#i-text',cog:'#i-cog',lib:'#i-lib',scratch:'#i-scratch',md:'#i-text',ts:'#i-ts'};
  var TREE=[
    ['module','MyApplication',{b:1,hint:'~/DevEcoStudioProjects/MyApplication',open:1},[
      ['folder','.codegenie',{},[['json','codegenie.json']]],
      ['folder','.hvigor',{tint:1},[['folder','cache'],['text','.hvigor.lock']]],
      ['folder','.idea',{},[['text','.gitignore'],['text','misc.xml'],['text','modules.xml']]],
      ['folder','AppScope',{},[['folder','resources'],['json','app.json5']]],
      ['module','entry',{b:1,open:1},[
        ['folder','src',{open:1},[
          ['folder','main',{open:1},[
            ['sourceRoot','ets',{open:1},[
              ['folder','components',{open:1},[['ets','ItemCard.ets',{file:1}]]],
              ['folder','entryability',{},[['ets','EntryAbility.ets',{file:1}]]],
              ['folder','entrybackupability',{},[['ets','EntryBackupAbility.ets']]],
              ['folder','pages',{open:1},[['ets','Index.ets',{file:1}],['ets','ListPage.ets',{file:1}],['ets','LoginPage.ets',{file:1}]]]
            ]],
            ['resRoot','resources',{},[['folder','base'],['folder','dark'],['folder','rawfile']]],
            ['json','module.json5']
          ]],
          ['folder','mock',{},[['json','mock-config.json5']]],
          ['testRoot','ohosTest',{},[['folder','ets'],['json','module.json5']]],
          ['testRoot','test',{},[['text','List.test.ets'],['text','LocalUnit.test.ets']]]
        ]],
        ['gitignore','.gitignore'],['json','build-profile.json5'],['hvigor','hvigorfile.ts'],['text','obfuscation-rules.txt'],['json','oh-package.json5']
      ]],
      ['folder','hvigor',{},[['json','hvigor-config.json5']]],
      ['folder','oh_modules',{tint:1},[['folder','.ohpm']]],
      ['gitignore','.gitignore'],['json','build-profile.json5'],['json','code-linter.json5'],['hvigor','hvigorfile.ts'],['cog','local.properties'],['json','oh-package.json5'],['json','oh-package-lock.json5'],['md','README.md',{file:1}]
    ]],
    ['lib','External Libraries',{open:1},[['lib','ArkTS-HarmonyOS-26.0.0(hms)'],['lib','ArkTS-HarmonyOS-26.0.0(openharmony)']]],
    ['scratch','Scratches and Consoles']
  ];
  /* opts: {sel:'Index.ets', decorate:function(name,node)->html 追加在行尾, compact:true 只保留 entry/src 分支} */
  function tree(opts){
    opts=opts||{};var sel=opts.sel||'Index.ets';
    function node(n,depth){
      var ic=n[0],name=n[1],o=n[2]||{},kids=n[3],isDir=!!kids,open=!!o.open;
      var extra=opts.decorate?(opts.decorate(name,n)||''):'';
      var h='<div class="row'+(name===sel?' sel':'')+(o.tint?' tint':'')+'" style="padding-left:'+(8+depth*16)+'px"'+(isDir?' data-dir="1" data-open="'+(open?1:0)+'"':'')+(o.file?' data-file="'+name+'"':'')+'>';
      h+='<span class="tg">'+(isDir?'<svg class="i"><use href="'+(open?'#i-chevD':'#i-chevR')+'"/></svg>':'')+'</span>';
      h+='<span class="ico"><svg><use href="'+ICON[ic]+'"/></svg></span><span class="lbl">'+(o.b?'<b>'+name+'</b>':name)+'</span>'+(o.hint?'<span class="hint">'+esc(o.hint)+'</span>':'')+extra+'</div>';
      if(isDir){h+='<div class="kids"'+(open?'':' hidden')+'>'+kids.map(function(k){return node(k,depth+1)}).join('')+'</div>'}
      return h;
    }
    return '<div class="tree" id="tree">'+TREE.map(function(n){return node(n,0)}).join('')+'</div>';
  }

  /* ---------- 示例代码 ---------- */
  var FILES={
    'Index.ets':{path:['entry','src','main','ets','pages'],crumbs:['Index','Entry'],lines:[
      ['<span class="m">@Entry</span>',{fold:0}],
      ['<span class="m">@Component</span>'],
      ['<span class="k">struct</span> <span class="ty">Index</span> {',{fold:1}],
      ['  <span class="m">@State</span> <span class="p">message</span>: <span class="k">string</span> = <span class="s">\'Hello World\'</span>;'],
      [''],
      ['  <span class="f">build</span>() {',{fold:1,at:1}],
      ['    <span class="f">RelativeContainer</span>() {',{fold:1}],
      ['      <span class="f">Text</span>(<span class="k">this</span>.<span class="p">message</span>)'],
      ['        .<span class="f">id</span>(<span class="s">\'HelloWorld\'</span>)'],
      ['        .<span class="f">fontSize</span>(<span class="f">$r</span>(<span class="s">\'app.float.page_text_font_size\'</span>))'],
      ['        .<span class="f">fontWeight</span>(<span class="ty">FontWeight</span>.<span class="p">Bold</span>)'],
      ['        .<span class="f">alignRules</span>({',{fold:1}],
      ['          <span class="p">center</span>: { <span class="p">anchor</span>: <span class="s">\'__container__\'</span>, <span class="p">align</span>: <span class="ty">VerticalAlign</span>.<span class="p">Center</span> },'],
      ['          <span class="p">middle</span>: { <span class="p">anchor</span>: <span class="s">\'__container__\'</span>, <span class="p">align</span>: <span class="ty">HorizontalAlign</span>.<span class="p">Center</span> }'],
      ['        })'],
      ['        .<span class="f">onClick</span>(() =&gt; {',{fold:1}],
      ['          <span class="k">this</span>.<span class="p">message</span> = <span class="s">\'Welcome\'</span>;'],
      ['        })'],
      ['    }'],
      ['    .<span class="f">height</span>(<span class="s">\'100%\'</span>)'],
      ['    .<span class="f">width</span>(<span class="s">\'100%\'</span>)'],
      ['  }'],
      ['}']
    ]},
    'ListPage.ets':{path:['entry','src','main','ets','pages'],crumbs:['ListPage','build'],lines:[
      ['<span class="k">import</span> { <span class="ty">ItemCard</span> } <span class="k">from</span> <span class="s">\'../components/ItemCard\'</span>;'],
      ['<span class="k">import</span> { <span class="ty">ItemSource</span> } <span class="k">from</span> <span class="s">\'../model/ItemSource\'</span>;'],
      [''],
      ['<span class="m">@Entry</span>'],
      ['<span class="m">@Component</span>'],
      ['<span class="k">struct</span> <span class="ty">ListPage</span> {',{fold:1}],
      ['  <span class="m">@State</span> <span class="p">source</span>: <span class="ty">ItemSource</span> = <span class="k">new</span> <span class="ty">ItemSource</span>(<span class="n">2000</span>);'],
      ['  <span class="m">@State</span> <span class="p">keyword</span>: <span class="k">string</span> = <span class="s">\'\'</span>;'],
      [''],
      ['  <span class="f">build</span>() {',{fold:1,at:1}],
      ['    <span class="f">Column</span>() {',{fold:1}],
      ['      <span class="f">Search</span>({ <span class="p">value</span>: <span class="k">this</span>.<span class="p">keyword</span> })'],
      ['        .<span class="f">margin</span>({ <span class="p">top</span>: <span class="n">12</span>, <span class="p">bottom</span>: <span class="n">8</span> })'],
      ['      <span class="f">List</span>({ <span class="p">space</span>: <span class="n">8</span> }) {',{fold:1}],
      ['        <span class="f">ForEach</span>(<span class="k">this</span>.<span class="p">source</span>.<span class="f">all</span>(), (<span class="p">item</span>: <span class="ty">Item</span>) =&gt; {',{fold:1}],
      ['          <span class="f">ListItem</span>() {'],
      ['            <span class="f">ItemCard</span>({ <span class="p">item</span>: <span class="p">item</span>, <span class="p">cover</span>: <span class="k">this</span>.<span class="f">loadCover</span>(<span class="p">item</span>.<span class="p">id</span>) })'],
      ['          }'],
      ['        }, (<span class="p">item</span>: <span class="ty">Item</span>) =&gt; <span class="p">item</span>.<span class="p">id</span>)'],
      ['      }'],
      ['      .<span class="f">cachedCount</span>(<span class="n">0</span>)'],
      ['      .<span class="f">layoutWeight</span>(<span class="n">1</span>)'],
      ['    }'],
      ['    .<span class="f">padding</span>({ <span class="p">left</span>: <span class="n">16</span>, <span class="p">right</span>: <span class="n">16</span> })'],
      ['  }'],
      [''],
      ['  <span class="f">loadCover</span>(<span class="p">id</span>: <span class="k">number</span>): <span class="ty">PixelMap</span> {',{fold:1}],
      ['    <span class="k">return</span> <span class="p">image</span>.<span class="f">createPixelMapSync</span>(<span class="k">this</span>.<span class="p">source</span>.<span class="f">rawCover</span>(<span class="p">id</span>));  <span class="c">// 同步解码，每帧都在做</span>'],
      ['  }'],
      ['}']
    ]},
    'LoginPage.ets':{path:['entry','src','main','ets','pages'],crumbs:['LoginPage','build'],lines:[
      ['<span class="m">@Entry</span>'],
      ['<span class="m">@Component</span>'],
      ['<span class="k">struct</span> <span class="ty">LoginPage</span> {',{fold:1}],
      ['  <span class="m">@State</span> <span class="p">phone</span>: <span class="k">string</span> = <span class="s">\'\'</span>;'],
      ['  <span class="m">@State</span> <span class="p">code</span>: <span class="k">string</span> = <span class="s">\'\'</span>;'],
      ['  <span class="m">@State</span> <span class="p">error</span>: <span class="k">string</span> = <span class="s">\'\'</span>;'],
      [''],
      ['  <span class="f">build</span>() {',{fold:1,at:1}],
      ['    <span class="f">Column</span>({ <span class="p">space</span>: <span class="n">16</span> }) {',{fold:1}],
      ['      <span class="f">Text</span>(<span class="s">\'欢迎回来\'</span>).<span class="f">fontSize</span>(<span class="n">24</span>).<span class="f">fontWeight</span>(<span class="ty">FontWeight</span>.<span class="p">Bold</span>)'],
      ['      <span class="f">TextInput</span>({ <span class="p">placeholder</span>: <span class="s">\'手机号\'</span> }).<span class="f">type</span>(<span class="ty">InputType</span>.<span class="p">PhoneNumber</span>)'],
      ['      <span class="f">TextInput</span>({ <span class="p">placeholder</span>: <span class="s">\'验证码\'</span> }).<span class="f">maxLength</span>(<span class="n">6</span>)'],
      ['      <span class="k">if</span> (<span class="k">this</span>.<span class="p">error</span>) {'],
      ['        <span class="f">Text</span>(<span class="k">this</span>.<span class="p">error</span>).<span class="f">fontColor</span>(<span class="s">\'#DB3B4B\'</span>).<span class="f">fontSize</span>(<span class="n">12</span>)'],
      ['      }'],
      ['      <span class="f">Button</span>(<span class="s">\'登录\'</span>)'],
      ['        .<span class="f">width</span>(<span class="s">\'100%\'</span>)'],
      ['        .<span class="f">margin</span>({ <span class="p">top</span>: <span class="n">12</span> })'],
      ['        .<span class="f">onClick</span>(() =&gt; <span class="k">this</span>.<span class="f">submit</span>())'],
      ['    }'],
      ['    .<span class="f">padding</span>(<span class="n">24</span>)'],
      ['  }'],
      [''],
      ['  <span class="k">async</span> <span class="f">submit</span>() {',{fold:1}],
      ['    <span class="k">try</span> {'],
      ['      <span class="k">await</span> <span class="p">auth</span>.<span class="f">login</span>(<span class="k">this</span>.<span class="p">phone</span>, <span class="k">this</span>.<span class="p">code</span>);'],
      ['    } <span class="k">catch</span> (<span class="p">e</span>) {'],
      ['      <span class="k">this</span>.<span class="p">error</span> = <span class="s">\'ERR_AUTH_401\'</span>;'],
      ['    }'],
      ['  }'],
      ['}']
    ]},
    'README.md':{path:[],crumbs:['README.md'],md:1,lines:[
      ['<span class="k"># MyApplication</span>'],
      [''],
      ['鸿蒙原生应用示例工程，包含列表页、详情页与登录流程。'],
      [''],
      ['<span class="k">## 环境要求</span>'],
      [''],
      ['- DevEco Studio 7.0 及以上'],
      ['- HarmonyOS SDK API 20'],
      [''],
      ['<span class="k">## 接口说明</span>'],
      [''],
      ['<span class="k">### login(phone, code)</span>'],
      [''],
      ['传入手机号与验证码，返回 <span class="s">`Session`</span>。失败时抛出 <span class="s">`AuthError`</span>，错误码见下表。'],
      [''],
      ['| 错误码 | 含义 |'],
      ['|---|---|'],
      ['| ERR_AUTH_401 | 验证码错误 |'],
      ['| ERR_AUTH_429 | 请求过于频繁 |']
    ]}
  };
  /* code(file, {cur:行号, hl:[行号…], marks:{行号:'bp'|'bulb'|'at'|'warn'|'err'}, from:起始行, to:结束行}) */
  function code(name,opts){
    opts=opts||{};var f=FILES[name];if(!f)return '';
    var marks=opts.marks||{},hl=opts.hl||[],c='';
    f.lines.forEach(function(l,i){
      var n=i+1;if(opts.from&&n<opts.from)return;if(opts.to&&n>opts.to)return;
      var o=l[1]||{},mk=marks[n]||(o.at?'at':'');
      var m='';
      if(mk==='bp')m='<span class="bp"></span>';else if(mk==='bulb')m='<svg class="bulb"><use href="#i-bulb"/></svg>';
      else if(mk==='at')m='<svg class="atmark"><use href="#i-at-gutter"/></svg>';
      else if(mk==='warn')m='<svg class="i" style="width:14px;height:14px;color:var(--ui-warning)"><use href="#i-warn"/></svg>';
      else if(mk==='err')m='<svg class="i" style="width:14px;height:14px;color:var(--ui-error)"><use href="#i-err"/></svg>';
      var g='<span class="n">'+n+'</span><span class="m">'+m+'</span><span class="fold">'+(o.fold?'<svg class="i" style="width:12px;height:12px"><use href="#i-chevD"/></svg>':'')+'</span>';
      c+='<div class="ln'+(opts.cur===n?' cur':'')+(hl.indexOf(n)>=0?' hl':'')+'" data-ln="'+n+'"><span class="g">'+g+'</span><span class="t">'+l[0]+'</span></div>';
    });
    return c;
  }
  function tabs(list){
    return list.map(function(t){
      var ic=t.icon||(/\.md$/.test(t.file)?'#i-text':'#i-ets');
      return '<button class="tab'+(t.on?' on':'')+'" data-file="'+esc(t.file)+'"><svg class="i"><use href="'+ic+'"/></svg>'+esc(t.label||t.file)+'<span class="x"><svg class="i"><use href="#i-closeS"/></svg></span></button>';
    }).join('');
  }
  function crumbs(name){
    var f=FILES[name]||{path:[],crumbs:[name]};
    var bc=f.crumbs.map(function(x,i){return (i?'<svg class="i" style="width:12px;height:12px"><use href="#i-chevR"/></svg>':'')+'<span class="crumb">'+(i===0?'<svg class="i"><use href="#i-module"/></svg>':'')+x+'</span>'}).join('');
    var sc=['MyApplication'].concat(f.path).concat([name]);
    var st=sc.map(function(x,i){var ic=i===0?null:(i===1?'#i-module':(i===sc.length-1?'#i-ets':null));return (i?'<svg class="i"><use href="#i-chevR"/></svg>':'')+'<span class="sw">'+(i===0?'<span class="proj"></span>':'')+(ic?'<svg class="i"><use href="'+ic+'"/></svg>':'')+x+'</span>'}).join('');
    var el=$('#status-crumbs');if(el)el.innerHTML=st;
    return bc;
  }

  /* ---------- 面板开合 ---------- */
  function setSide(side,name){
    if(!ide)return;
    var tw=$('.tw-'+side);
    if(!tw||!name){ide.setAttribute('data-'+side,'none');}
    else{
      var pane=$('.pane[data-pane="'+name+'"]',tw);
      if(!pane){return;}
      ide.setAttribute('data-'+side,name);
      $$('.pane',tw).forEach(function(p){if(p.parentNode===pane.parentNode||side!=='left')p.classList.toggle('on',p===pane)});
    }
    $$('.stripe [data-'+side+']').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-'+side)===(name||''))});
  }

  /* ---------- 主题 ---------- */
  var THEMES=['dark','light','light-lh'];
  function applyTheme(t){
    ide.setAttribute('data-ide-theme',t==='dark'?'dark':'light');
    ide.setAttribute('data-light-header',t==='light-lh'?'1':'0');
    var u=$('#theme-btn use');if(u)u.setAttribute('href',t==='dark'?'#i-moon':'#i-sun');
    try{localStorage.setItem('deveco-theme',t)}catch(e){}
  }

  /* ---------- Tooltip ---------- */
  function tooltips(){
    var tip=$('#tip');if(!tip)return;
    document.addEventListener('mouseover',function(e){
      var t=e.target.closest('[title]');if(!t||!ide.contains(t)){tip.hidden=true;return;}
      var v=t.getAttribute('title');if(!v)return;
      t.setAttribute('data-title',v);t.removeAttribute('title');
      show(t);
    });
    document.addEventListener('mouseover',function(e){var t=e.target.closest('[data-title]');if(t&&ide.contains(t))show(t);else tip.hidden=true;});
    function show(t){
      var v=t.getAttribute('data-title').split('|');
      tip.innerHTML=esc(v[0])+(v[1]?'<span class="sc">'+esc(v[1])+'</span>':'');tip.hidden=false;
      var r=t.getBoundingClientRect();tip.style.left=Math.min(r.left,window.innerWidth-tip.offsetWidth-8)+'px';tip.style.top=(r.bottom+6)+'px';
    }
  }

  /* ---------- init ---------- */
  function init(opts){
    opts=opts||{};
    ide=$('#ide')||$('.ide');if(!ide)return;
    injectSymbols();
    var project=opts.project||ide.dataset.project||'MyApplication';
    var o={project:project,avatar:opts.avatar||project.replace(/[^A-Z]/g,'').slice(0,2)||project.slice(0,2),vcs:opts.vcs||'Version Control',
      module:opts.module||'entry',device:opts.device||ide.dataset.device||'Troubleshoot Device Connections',deviceIcon:opts.deviceIcon||'',center:opts.center||'',pos:opts.pos};
    ide.insertAdjacentHTML('afterbegin',headerHTML(o));
    var body=$('.body',ide);
    if(body){body.insertAdjacentHTML('afterbegin',stripeHTML('left',opts.stripeLeft||LEFT_DEFAULT));body.insertAdjacentHTML('beforeend',stripeHTML('right',opts.stripeRight||RIGHT_DEFAULT));}
    ide.insertAdjacentHTML('beforeend',statusHTML(o));
    ['left','right','bottom'].forEach(function(side){
      var want=ide.getAttribute('data-'+side);
      if(!$('.tw-'+side,ide)||!want||want==='none'){setSide(side,null);}
      else setSide(side,want);
    });
    /* 侧栏按钮：点一下开合 */
    $$('.stripe .sbtn',ide).forEach(function(b){
      b.addEventListener('click',function(){
        var side=b.hasAttribute('data-left')?'left':(b.hasAttribute('data-right')?'right':(b.hasAttribute('data-bottom')?'bottom':null));if(!side)return;
        var name=b.getAttribute('data-'+side);
        setSide(side,ide.getAttribute('data-'+side)===name?null:name);
      });
    });
    /* 工具窗标题栏的隐藏按钮 */
    ide.addEventListener('click',function(e){
      var a=e.target.closest('[data-act]');if(!a)return;
      if(a.dataset.act==='hide-left')setSide('left',null);
      else if(a.dataset.act==='hide-right')setSide('right',null);
      else if(a.dataset.act==='hide-bottom')setSide('bottom',null);
    });
    /* 编辑器标签：.tab[data-file] ↔ [data-for-file] */
    ide.addEventListener('click',function(e){
      var t=e.target.closest('.tab[data-file]');if(!t||e.target.closest('.x'))return;
      var name=t.dataset.file;
      $$('.tab[data-file]',t.parentNode).forEach(function(x){x.classList.toggle('on',x===t)});
      $$('[data-for-file]',ide).forEach(function(x){x.hidden=x.dataset.forFile!==name});
      var bc=$('#crumbs',ide);if(bc)bc.innerHTML=crumbs(name);
      $$('#tree .row.sel',ide).forEach(function(x){x.classList.remove('sel')});var r=$('#tree .row[data-file="'+name+'"]',ide);if(r)r.classList.add('sel');
    });
    /* 树：点目录开合，点文件切标签（如果有对应标签） */
    ide.addEventListener('click',function(e){
      var r=e.target.closest('#tree .row');if(!r)return;
      if(r.dataset.dir){var open=r.dataset.open==='1';r.dataset.open=open?'0':'1';var k=r.nextElementSibling;if(k&&k.classList.contains('kids'))k.hidden=open;var u=$('.tg use',r);if(u)u.setAttribute('href',open?'#i-chevR':'#i-chevD');}
      else if(r.dataset.file){var tb=$('.tab[data-file="'+r.dataset.file+'"]',ide);if(tb)tb.click();}
    });
    /* 代码行：点一下变成当前行 */
    ide.addEventListener('click',function(e){
      var ln=e.target.closest('.code .ln');if(!ln)return;
      $$('.ln.cur',ln.parentNode).forEach(function(x){x.classList.remove('cur')});ln.classList.add('cur');
      var p=$('#status-pos');if(p)p.textContent=ln.dataset.ln+':1';
    });
    /* 弹层：[data-pop] 按钮开合自己里面的 .popup */
    $$('[data-pop]',ide).forEach(function(b){
      b.addEventListener('click',function(e){
        if(e.target.closest('.popup'))return;
        var open=b.getAttribute('aria-expanded')==='true';
        $$('[data-pop]',ide).forEach(function(x){x.setAttribute('aria-expanded','false');var p=$('.popup',x);if(p)p.hidden=true});
        if(!open){b.setAttribute('aria-expanded','true');var p=$('.popup',b);if(p)p.hidden=false}
        e.stopPropagation();
      });
    });
    document.addEventListener('click',function(e){if(!e.target.closest('.popup')&&!e.target.closest('[data-pop]'))$$('[data-pop]',ide).forEach(function(x){x.setAttribute('aria-expanded','false');var p=$('.popup',x);if(p)p.hidden=true})});
    /* 主题 */
    var saved='dark';try{saved=localStorage.getItem('deveco-theme')||'dark'}catch(e){}
    if(THEMES.indexOf(saved)<0)saved='dark';applyTheme(saved);
    $('#theme-btn').addEventListener('click',function(){var cur=ide.getAttribute('data-light-header')==='1'?'light-lh':ide.getAttribute('data-ide-theme');applyTheme(THEMES[(THEMES.indexOf(cur)+1)%3])});
    tooltips();
    var bc=$('#crumbs',ide);var first=$('.tab.on[data-file]',ide);
    if(first){var html=crumbs(first.dataset.file);if(bc)bc.innerHTML=html;}else crumbs(opts.file||'Index.ets');
    if(opts.onReady)opts.onReady();
  }

  return {init:init,tree:tree,code:code,tabs:tabs,crumbs:crumbs,setSide:setSide,esc:esc,FILES:FILES,$:$,$$:$$};
})();
