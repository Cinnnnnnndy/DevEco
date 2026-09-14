/* 启动页交互：按 catalog.js 渲染分组与卡片、类型筛选、搜索、节奏条、主题切换。
   不依赖任何库；file:// 下直接可用。 */
(function(){
  'use strict';
  var C = window.DEVECO_CATALOG;
  if(!C){ document.getElementById('groups').innerHTML='<div class="empty">没有找到 site/catalog.js</div>'; return; }

  var $ = function(s,el){ return (el||document).querySelector(s); };
  var esc = function(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); };
  var url = function(h){ return encodeURI(h); };
  var STATUS = { ready:'可演示', wip:'进行中', planned:'规划中' };
  var EXT = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6.5 3.5H3.5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V9.5M9.5 2.5h4v4M13.5 2.5 7.5 8.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';

  /* ---- 顶部 ---- */
  document.title = C.title;
  $('#title').textContent = C.title;
  $('#lede').textContent = C.lede;
  var all = [], kinds = {};
  C.groups.forEach(function(g){ g.items.forEach(function(it){ all.push(it); kinds[it.kind]=(kinds[it.kind]||0)+1; }); });
  var ready = all.filter(function(i){ return i.status==='ready'; }).length;
  var planned = all.filter(function(i){ return i.status==='planned'; }).length;
  $('#meta').innerHTML = '<span>'+all.length+' 个条目</span><span>'+ready+' 个可演示</span>'
    + (planned?'<span>'+planned+' 个规划中</span>':'') + '<span>更新 '+esc(C.updated)+'</span>';

  /* ---- 节奏条 ---- */
  var ms = $('#milestones');
  if(C.milestones && C.milestones.length){
    var today = new Date().toISOString().slice(0,10), nextFound=false;
    ms.innerHTML = C.milestones.map(function(m){
      var past = m.date < today, cls = past ? 'past' : (!nextFound ? (nextFound=true,'next') : '');
      return '<div class="ms '+cls+'" title="'+esc(m.date)+'">'+(cls==='next'?'<b>下一个</b>':'')+esc(m.label)+'</div>';
    }).join('');
  } else ms.hidden = true;

  /* ---- 卡片 ---- */
  function card(it){
    var st = it.status || (it.href ? 'ready' : 'planned');
    var primary = it.href
      ? '<a class="primary" href="'+url(it.href)+'">打开'+EXT+'</a>'
      : '<span class="ph">'+(st==='planned'?'待排期，暂无链接':'暂无链接')+'</span>';
    var links = (it.links||[]).map(function(l){ return '<a href="'+url(l.href)+'">'+esc(l.label)+'</a>'; }).join('');
    return '<article class="card '+st+'" data-kind="'+esc(it.kind)+'" data-href="'+(it.href?url(it.href):'')+'" '
      + 'data-text="'+esc((it.title+' '+it.desc+' '+(it.tags||[]).join(' ')+' '+it.kind).toLowerCase())+'">'
      + '<div class="top"><span class="kind">'+esc(it.kind)+'</span><span class="status '+st+'">'+STATUS[st]+'</span><span class="grow"></span>'
      + (it.date?'<span class="date">'+esc(it.date)+'</span>':'')+'</div>'
      + '<h3>'+(it.href?'<a href="'+url(it.href)+'">'+esc(it.title)+'</a>':esc(it.title))+'</h3>'
      + '<p>'+esc(it.desc)+'</p>'
      + (it.tags&&it.tags.length?'<div class="tags">'+it.tags.map(function(t){return '<span>'+esc(t)+'</span>';}).join('')+'</div>':'')
      + (it.note?'<p class="memo">'+esc(it.note)+'</p>':'')
      + '<div class="links">'+primary+links+'</div>'
      + '</article>';
  }
  var groupsEl = $('#groups');
  groupsEl.innerHTML = C.groups.map(function(g,i){
    return '<section class="grp" id="'+esc(g.id)+'"><h2><span class="n">0'+(i+1)+'</span>'+esc(g.title)
      + '<span class="cnt" data-cnt></span></h2>'
      + (g.note?'<p class="note">'+esc(g.note)+'</p>':'')
      + '<div class="grid">'+g.items.map(card).join('')+'</div></section>';
  }).join('') + '<div class="empty" id="empty" hidden>没有匹配的条目</div>';

  /* 点卡片空白处也能打开（真正的链接交给浏览器自己处理） */
  groupsEl.addEventListener('click', function(e){
    if(e.target.closest('a')) return;
    var c = e.target.closest('.card'); if(!c || !c.dataset.href) return;
    if(window.getSelection && String(window.getSelection())) return;
    window.location.href = c.dataset.href;
  });

  /* ---- 筛选与搜索 ---- */
  var filters = $('#filters'), kind = '全部', q = '';
  filters.innerHTML = ['全部'].concat(Object.keys(kinds)).map(function(k){
    return '<button type="button" class="f'+(k==='全部'?' on':'')+'" data-kind="'+esc(k)+'">'+esc(k)
      + '<span class="c">'+(k==='全部'?all.length:kinds[k])+'</span></button>';
  }).join('');
  filters.addEventListener('click', function(e){
    var b = e.target.closest('.f'); if(!b) return;
    kind = b.dataset.kind;
    filters.querySelectorAll('.f').forEach(function(x){ x.classList.toggle('on', x===b); });
    apply();
  });
  $('#search').addEventListener('input', function(e){ q = e.target.value.trim().toLowerCase(); apply(); });
  function apply(){
    var any = false;
    groupsEl.querySelectorAll('section.grp').forEach(function(sec){
      var n = 0;
      sec.querySelectorAll('.card').forEach(function(c){
        var ok = (kind==='全部' || c.dataset.kind===kind) && (!q || c.dataset.text.indexOf(q)>=0);
        c.hidden = !ok; if(ok) n++;
      });
      sec.hidden = n===0; any = any || n>0;
      sec.querySelector('[data-cnt]').textContent = n + ' 项';
    });
    $('#empty').hidden = any;
  }
  apply();

  /* ---- 主题：跟随系统，点按钮后记住显式选择（与 kit 的 tokens.css 同一套 data-theme） ---- */
  var root = document.documentElement, KEY = 'deveco-launcher-theme';
  try{ var saved = localStorage.getItem(KEY); if(saved) root.setAttribute('data-theme', saved); }catch(e){}
  function effective(){
    return root.getAttribute('data-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }
  function paintBtn(){
    var dark = effective()==='dark';
    $('#theme-btn use').setAttribute('href', dark ? '#i-sun' : '#i-moon');
    $('#theme-label').textContent = dark ? '浅色' : '深色';
  }
  $('#theme-btn').addEventListener('click', function(){
    var next = effective()==='dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try{ localStorage.setItem(KEY, next); }catch(e){}
    paintBtn();
  });
  paintBtn();
})();
