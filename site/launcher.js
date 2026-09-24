/* 启动页交互：按 catalog.js 渲染左侧分类导航、卡片网格、状态图例、搜索、节奏条、主题切换。
   不依赖任何库；file:// 下直接可用。 */
(function(){
  'use strict';
  var C = window.DEVECO_CATALOG;
  var groupsEl = document.getElementById('groups');
  if(!C){ groupsEl.innerHTML='<div class="empty">没有找到 site/catalog.js</div>'; return; }

  var $ = function(s,el){ return (el||document).querySelector(s); };
  var esc = function(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); };
  var url = function(h){ return encodeURI(h); };
  var VIEW = {
    ready:  { label: '可体验', hint: '可真实交互' },
    sketch: { label: '原型',   hint: '草图 / 占位' },
    doc:    { label: '文档',   hint: '白皮书 / 说明' },
  };
  var DOC_ACCENT = { MD: '--ui-info', PPTX: '--ui-warning', BUNDLE: '--ui-accent', README: '--ui-fg-info' };

  /* ---- 顶部 ---- */
  document.title = C.title;
  $('#title').textContent = C.title;
  var all = [];
  /* 规划重点的卡片在各自分类里排到最前，其余保持 catalog.js 里的顺序 */
  C.groups.forEach(function(g){
    g.items = g.items.map(function(it,i){ return {it:it,i:i}; })
      .sort(function(a,b){ return ((b.it.key?1:0)-(a.it.key?1:0)) || (a.i-b.i); })
      .map(function(x){ return x.it; });
    g.items.forEach(function(it){ all.push(it); it._group = g; });
  });

  /* ---- 缩略图 ---- */
  function thumbHTML(it){
    var t = it.thumb || (it.view==='sketch' ? {type:'sketch'} : {type:'doc',kind:'README'});
    if(t.type==='image'){
      return '<div class="thumb"><img src="'+url(t.src)+'" alt="" loading="lazy"></div>';
    }
    if(t.type==='doc'){
      var accentVar = DOC_ACCENT[t.kind] || DOC_ACCENT.README;
      return '<div class="thumb doc" style="--ac:var('+accentVar+')">'
        + '<span class="filechip">'+esc(t.kind||'DOC')+'</span>'
        + '<div class="skel"><span class="skel-h"></span>'
        + '<span class="skel-l" style="width:86%"></span>'
        + '<span class="skel-l" style="width:71%"></span>'
        + '<span class="skel-l" style="width:79%"></span>'
        + '<span class="skel-l" style="width:56%"></span></div></div>';
    }
    /* sketch: 虚线线框，代表这块还是草图 / 占位 */
    return '<div class="thumb sketch"><svg viewBox="0 0 640 400" preserveAspectRatio="none" aria-hidden="true">'
      + '<rect x="16" y="16" width="608" height="368" rx="10" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="7 7"/>'
      + '<rect x="32" y="32" width="576" height="38" rx="6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="4 5" opacity=".7"/>'
      + '<rect x="32" y="86" width="140" height="282" rx="6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="4 5" opacity=".7"/>'
      + '<rect x="188" y="86" width="420" height="282" rx="6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="4 5" opacity=".45"/>'
      + '</svg><span class="sketch-label">原型 · 待排期</span></div>';
  }

  /* ---- 卡片：参照 DevEco Studio 官网「新增特性」——渐变底上嵌一张截图，下面居中大标题 ---- */
  function card(it){
    var v = it.view || (it.href ? 'ready' : 'sketch'), vinfo = VIEW[v] || VIEW.doc;
    var links = (it.links||[]).map(function(l){ return '<a href="'+url(l.href)+'">'+esc(l.label)+'</a>'; }).join('');
    var text = ((it.no||'')+' '+it.title+' '+(it.subtitle||'')+' '+it.desc+' '+(it.tags||[]).join(' ')+' '+(it.mark||'')+' '+(it.note||'')+' '+it._group.title).toLowerCase();
    if(it.key) text += ' 重点 '+String(it.key).toLowerCase();
    var chips = (it.no?'<span class="no">'+esc(it.no)+'</span>':'')
      + (it.key?'<span class="keyb" title="规划重点">重点</span>':'')
      + (v!=='ready'?'<span class="status '+v+'">'+vinfo.label+'</span>':'');
    return '<article class="card '+v+(it.key?' key':'')+'"'+(it.no?' id="card-'+esc(it.no)+'"':'')+' data-view="'+v+'" data-key="'+(it.key?'1':'')+'" data-cat="'+esc(it._group.id)+'" data-href="'+(it.href?url(it.href):'')+'" data-text="'+esc(text)+'">'
      + '<div class="hero">'+thumbHTML(it)+'</div>'
      + '<div class="body">'
      + (chips?'<div class="chips">'+chips+'</div>':'')
      + '<h4 class="title">'+(it.href?'<a href="'+url(it.href)+'">'+esc(it.title)+'</a>':esc(it.title))+'</h4>'
      + (links?'<div class="links">'+links+'</div>':'')
      + '</div></article>';
  }

  /* ---- 分组渲染（全部视图下逐段展示；选中某个分类时只留那一段） ---- */
  groupsEl.innerHTML = C.groups.map(function(g){
    return '<section class="grp" id="'+esc(g.id)+'" data-g="'+esc(g.id)+'">'
      + '<div class="ghead"><h3>'+esc(g.title)+'</h3><span class="cnt" data-cnt></span></div>'
      + '<div class="grid">'+g.items.map(card).join('')+'</div></section>';
  }).join('') + '<div class="empty" id="empty" hidden>没有匹配的条目</div>';

  groupsEl.addEventListener('click', function(e){
    if(e.target.closest('a')) return;
    var c = e.target.closest('.card'); if(!c || !c.dataset.href) return;
    if(window.getSelection && String(window.getSelection())) return;
    window.location.href = c.dataset.href;
  });

  /* ---- 左侧分类导航 ---- */
  var catsEl = $('#cats'), cat = '全部';
  var catRow = function(id,title,icon,count){
    return '<button type="button" class="cat'+(id===cat?' on':'')+'" data-cat="'+esc(id)+'">'
      + '<svg><use href="#'+icon+'"/></svg><span class="lbl">'+esc(title)+'</span><span class="cnt">'+count+'</span></button>';
  };
  var keyCount = all.filter(function(i){ return i.key; }).length;
  catsEl.innerHTML = catRow('全部','全部','i-cat-all',all.length)
    + (keyCount?catRow('key','规划重点','i-flag',keyCount):'')
    + C.groups.map(function(g){ return catRow(g.id, g.title, g.icon, g.items.length); }).join('');
  catsEl.addEventListener('click', function(e){
    var b = e.target.closest('.cat'); if(!b) return;
    cat = b.dataset.cat;
    catsEl.querySelectorAll('.cat').forEach(function(x){ x.classList.toggle('on', x===b); });
    apply();
  });

  /* ---- 状态图例（同时也是筛选器） ---- */
  var legendEl = $('#legend'), viewFilter = null;
  legendEl.innerHTML = Object.keys(VIEW).map(function(k){
    var v = VIEW[k];
    return '<button type="button" class="lg v-'+k+'" data-view="'+k+'"><span class="dot"></span><b>'+v.label+'</b>&nbsp;<small>'+v.hint+'</small></button>';
  }).join('');
  legendEl.addEventListener('click', function(e){
    var b = e.target.closest('.lg'); if(!b) return;
    var k = b.dataset.view;
    viewFilter = (viewFilter===k) ? null : k;
    legendEl.querySelectorAll('.lg').forEach(function(x){ x.classList.toggle('on', x.dataset.view===viewFilter); });
    apply();
  });

  /* ---- 搜索 ---- */
  var q = '';
  $('#search').addEventListener('input', function(e){ q = e.target.value.trim().toLowerCase(); apply(); });

  /* ---- 应用筛选：分类（单选）× 状态图例（可选，独立维度）× 搜索文本 ---- */
  function apply(){
    var visibleTotal = 0;
    var sections = groupsEl.querySelectorAll('section.grp');
    sections.forEach(function(sec){
      var secCat = sec.id, showSection = (cat==='全部' || cat==='key' || cat===secCat);
      var n = 0;
      sec.querySelectorAll('.card').forEach(function(c){
        var ok = showSection && (cat!=='key' || c.dataset.key==='1') && (!viewFilter || c.dataset.view===viewFilter) && (!q || c.dataset.text.indexOf(q)>=0);
        c.hidden = !ok; if(ok) n++;
      });
      sec.hidden = n===0; if(showSection) visibleTotal += n;
      sec.querySelector('[data-cnt]').textContent = n + ' 项';
    });
    $('#section-title').textContent = cat==='全部' ? '全部项目' : cat==='key' ? '规划重点' : cat && (function(){ var g=C.groups.filter(function(g){return g.id===cat})[0]; return g?g.title:'全部项目'; })();
    var totalForCat = cat==='全部' ? all.length : cat==='key' ? keyCount : all.filter(function(i){ return i._group.id===cat; }).length;
    $('#count').textContent = visibleTotal + ' / ' + totalForCat;
    $('#empty').hidden = visibleTotal>0;
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

  /* ---- demo 标注总开关：和 demos/_shared/guide.js 共用 localStorage 的 deveco-guide ---- */
  var GKEY = 'deveco-guide';
  function guideOn(){ try{ return localStorage.getItem(GKEY)!=='off'; }catch(e){ return true; } }
  function paintGuide(){
    var on = guideOn();
    $('#guide-label').textContent = 'demo 标注：'+(on?'开':'关');
    $('#guide-btn').classList.toggle('off', !on);
  }
  $('#guide-btn').addEventListener('click', function(){
    try{ localStorage.setItem(GKEY, guideOn()?'off':'on'); }catch(e){}
    paintGuide();
  });
  paintGuide();
})();
