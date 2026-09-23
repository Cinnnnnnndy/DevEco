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
  /* deck 里的标记：投 / 半投 强调，其余弱化 */
  function markCls(m){ return m==='投' ? 'm1' : (m==='半投' ? 'm2' : 'm3'); }

  /* ---- 顶部 ---- */
  document.title = C.title;
  $('#title').textContent = C.title;
  $('#lede').textContent = C.lede;
  var all = [];
  C.groups.forEach(function(g){ g.items.forEach(function(it){ all.push(it); it._group = g; }); });
  var ready = all.filter(function(i){ return i.view==='ready'; }).length;
  var sketch = all.filter(function(i){ return i.view==='sketch'; }).length;
  var keyN = all.filter(function(i){ return i.key; }).length;
  $('#meta').innerHTML = '<span>'+all.length+' 个条目</span><span>'+ready+' 个可演示</span>'
    + (keyN?'<span class="k">'+keyN+' 个规划重点</span>':'')
    + (sketch?'<span>'+sketch+' 个规划中</span>':'') + '<span>更新 '+esc(C.updated)+'</span>';

  /* ---- 节奏条 ---- */
  var ms = $('#milestones');
  if(C.milestones && C.milestones.length){
    var today = new Date().toISOString().slice(0,10), nextFound=false;
    ms.innerHTML = C.milestones.map(function(m){
      var past = m.date < today, cls = past ? 'past' : (!nextFound ? (nextFound=true,'next') : '');
      return '<div class="ms '+cls+'" title="'+esc(m.date)+'">'+(cls==='next'?'<b>下一个</b>':'')+esc(m.label)+'</div>';
    }).join('');
  } else ms.hidden = true;

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

  /* ---- 卡片 ---- */
  function card(it){
    var v = it.view || (it.href ? 'ready' : 'sketch'), vinfo = VIEW[v] || VIEW.doc;
    var primary = it.href
      ? '<a class="primary" href="'+url(it.href)+'">打开<svg><use href="#i-ext"/></svg></a>'
      : '<span class="ph">待排期，暂无链接</span>';
    var links = (it.links||[]).map(function(l){ return '<a href="'+url(l.href)+'">'+esc(l.label)+'</a>'; }).join('');
    var text = ((it.no||'')+' '+it.title+' '+(it.subtitle||'')+' '+it.desc+' '+(it.tags||[]).join(' ')+' '+(it.mark||'')+' '+(it.note||'')+' '+it._group.title).toLowerCase();
    if(it.key) text += ' 重点 '+String(it.key).toLowerCase();
    return '<article class="card '+v+(it.key?' key':'')+'"'+(it.no?' id="card-'+esc(it.no)+'"':'')+' data-view="'+v+'" data-key="'+(it.key?'1':'')+'" data-cat="'+esc(it._group.id)+'" data-href="'+(it.href?url(it.href):'')+'" data-text="'+esc(text)+'">'
      + thumbHTML(it)
      + '<div class="body">'
      + '<div class="row1"><span class="cat-lbl"><span class="dot"></span>'+esc(it._group.title)+(it.no?' <span class="no">'+esc(it.no)+'</span>':'')+'</span>'
      + (it.key?'<span class="keyb" title="规划重点"><svg><use href="#i-star"/></svg>重点</span>':'')
      + (it.mark?'<span class="mark '+markCls(it.mark)+'">'+esc(it.mark)+'</span>':'')+'<span class="grow"></span>'
      + '<span class="status '+v+'">'+vinfo.label+'</span></div>'
      + '<h4 class="title">'+(it.href?'<a href="'+url(it.href)+'">'+esc(it.title)+'</a>':esc(it.title))+'</h4>'
      + (it.subtitle?'<p class="subtitle">'+esc(it.subtitle)+'</p>':'')
      + (it.key?'<p class="keyline"><svg><use href="#i-star"/></svg>规划重点 · '+esc(it.key)+'</p>':'')
      + '<p class="desc">'+esc(it.desc)+'</p>'
      + (it.tags&&it.tags.length?'<div class="tags">'+it.tags.map(function(t){return '<span>'+esc(t)+'</span>';}).join('')+'</div>':'')
      + (it.note?'<p class="memo">'+esc(it.note)+'</p>':'')
      + '<div class="links">'+primary+links+'</div>'
      + '</div></article>';
  }

  /* ---- 分组渲染（全部视图下逐段展示；选中某个分类时只留那一段） ---- */
  /* ---- 规划重点总览：新一轮规划点 → 归到哪一类、落在哪张卡上 ---- */
  var F = C.focus, focusHTML = '';
  if(F && F.themes){
    var byNo = {}; all.forEach(function(i){ if(i.no) byNo[i.no]=i; });
    focusHTML = '<section class="focus" id="focus"><div class="fhead"><svg><use href="#i-star"/></svg><h3>'+esc(F.title)+'</h3>'
      + '<span class="cnt">'+F.themes.reduce(function(n,t){return n+t.points.length;},0)+' 个点</span></div>'
      + (F.note?'<p class="note">'+esc(F.note)+'</p>':'')
      + '<div class="fgrid">'+F.themes.map(function(t){
          return '<div class="ftheme"><div class="ft"><b>'+esc(t.title)+'</b>'+(t.sub?'<span>'+esc(t.sub)+'</span>':'')+'</div>'
            + t.points.map(function(p){
                var it = byNo[p.no], how = p.merged ? '并入' : '新增';
                return '<button type="button" class="fp" data-no="'+esc(p.no)+'">'
                  + '<span class="fp-t">'+esc(p.title)+'</span>'
                  + (p.detail?'<span class="fp-d">'+esc(p.detail)+'</span>':'')
                  + '<span class="fp-to"><i class="'+(p.merged?'mg':'nw')+'">'+how+'</i>'
                  + '<span class="no">'+esc(p.no)+'</span>'+(it?esc(it.title.split('：')[0]):'')+'</span></button>';
              }).join('')+'</div>';
        }).join('')+'</div></section>';
  }

  groupsEl.innerHTML = focusHTML + C.groups.map(function(g){
    return '<section class="grp" id="'+esc(g.id)+'">'
      + '<div class="ghead"><h3>'+esc(g.title)+'</h3><span class="cnt" data-cnt></span></div>'
      + (g.note?'<p class="note">'+esc(g.note)+'</p>':'')
      + '<div class="grid">'+g.items.map(card).join('')+'</div></section>';
  }).join('') + '<div class="empty" id="empty" hidden>没有匹配的条目</div>';

  groupsEl.addEventListener('click', function(e){
    var fp = e.target.closest('.fp');
    if(fp){
      var tgt = document.getElementById('card-'+fp.dataset.no); if(!tgt) return;
      if(tgt.hidden){ cat='全部'; q=''; $('#search').value=''; viewFilter=null;
        catsEl.querySelectorAll('.cat').forEach(function(x){ x.classList.toggle('on', x.dataset.cat==='全部'); });
        legendEl.querySelectorAll('.lg').forEach(function(x){ x.classList.remove('on'); }); apply(); }
      tgt.scrollIntoView({behavior:'smooth', block:'center'});
      tgt.classList.remove('flash'); void tgt.offsetWidth; tgt.classList.add('flash');
      return;
    }
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
    + (keyCount?catRow('key','规划重点','i-star',keyCount):'')
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
    var fs = $('#focus'); if(fs) fs.hidden = !((cat==='全部' || cat==='key') && !q && !viewFilter);
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
})();
