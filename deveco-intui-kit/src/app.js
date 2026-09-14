/* ============================================================
   DevEco 主窗口 demo 的交互：主题切换、工具窗开合、文件树、
   编辑器标签、Tooltip、CodeGenie 会话
   预置回答在文件末尾的 ASK_ANSWER / ACT_ANSWER 两个常量里
   ============================================================ */
(function(){
  var ide=document.getElementById('ide');
  var $=function(s,r){return (r||document).querySelector(s)};
  var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;')}

  /* ---------------- 主题（Dark → Light → Light+浅色 Header）---------------- */
  var THEMES=['dark','light','light-lh'];
  function applyTheme(t){
    ide.setAttribute('data-ide-theme',t==='dark'?'dark':'light');
    ide.setAttribute('data-light-header',t==='light-lh'?'1':'0');
    $('#theme-btn use').setAttribute('href',t==='dark'?'#i-moon':'#i-sun');
    try{localStorage.setItem('deveco-theme',t)}catch(e){}
  }
  var saved='dark';try{saved=localStorage.getItem('deveco-theme')||'dark'}catch(e){}
  if(THEMES.indexOf(saved)<0)saved='dark';applyTheme(saved);
  $('#theme-btn').addEventListener('click',function(){var i=THEMES.indexOf(ide.getAttribute('data-light-header')==='1'?'light-lh':ide.getAttribute('data-ide-theme'));applyTheme(THEMES[(i+1)%3])});

  /* ---------------- 弹层 ---------------- */
  function closePops(){$$('[data-pop]').forEach(function(b){b.setAttribute('aria-expanded','false');var p=$('.popup',b);if(p)p.hidden=true})}
  $$('[data-pop]').forEach(function(b){
    b.addEventListener('click',function(e){
      if(e.target.closest('.popup')){return}
      var open=b.getAttribute('aria-expanded')==='true';closePops();
      if(!open){b.setAttribute('aria-expanded','true');$('.popup',b).hidden=false}
      e.stopPropagation();
    });
  });
  document.addEventListener('click',function(e){if(!e.target.closest('.popup'))closePops()});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closePops()});

  /* ---------------- 菜单动作 ---------------- */
  function setMenuBar(on){ide.setAttribute('data-menu',on?'bar':'hamburger');$('#chk-menubar').innerHTML=on?'<svg class="i" style="width:14px;height:14px"><use href="#i-checkS"/></svg>':''}
  document.addEventListener('click',function(e){
    var a=e.target.closest('[data-act]');if(!a)return;
    var act=a.dataset.act;
    if(act==='menu-bar'){setMenuBar(ide.getAttribute('data-menu')!=='bar');closePops();e.stopPropagation()}
    else if(act==='hide-left'){setLeft(null)}
    else if(act==='hide-structure'){structOn=false;setLeft(ide.getAttribute('data-left')==='structure'?null:'project')}
    else if(act==='hide-right'){setRight(null)}
    else if(act==='hide-bottom'){setBottom(null)}
    else if(act==='open-devices'){setRight('devices');closePops()}
    else if(act==='expand'){$$('#tree .kids').forEach(function(k){k.hidden=false});$$('#tree .row[data-dir]').forEach(function(r){r.dataset.open='1';setChev(r)})}
    else if(act==='collapse'){$$('#tree .kids').forEach(function(k,i){k.hidden=i>0});$$('#tree .row[data-dir]').forEach(function(r,i){r.dataset.open=i===0?'1':'0';setChev(r)})}
    else if(act==='new-chat'){resetChat()}
    else if(act==='run'){runApp()}
    else if(act==='noop'){e.preventDefault()}
  });

  /* ---------------- 工具窗开关 ---------------- */
  var structOn=true;
  function setLeft(p){ide.setAttribute('data-left',p||'none');$$('.tw-left .pane').forEach(function(x){x.classList.toggle('on',x.dataset.pane===p||(p==='project'&&structOn&&x.dataset.pane==='structure'))});$$('.stripe.left [data-left]').forEach(function(b){b.classList.toggle('on',b.dataset.left===p||(p==='project'&&structOn&&b.dataset.left==='structure'))})}
  function setRight(p){ide.setAttribute('data-right',p||'none');$$('.tw-right .pane').forEach(function(x){x.classList.toggle('on',x.dataset.pane===p)});$$('.stripe.right [data-right]').forEach(function(b){b.classList.toggle('on',b.dataset.right===p)})}
  var BOTTOM_TITLES={build:'Build',terminal:'Terminal',problems:'Problems',run:'Run',debug:'Debug',log:'Log',services:'Services',vcs:'Version Control'};
  var BOTTOM_TABS={build:['Sync'],terminal:['Local','+'],problems:['Current File','Project Errors'],run:['entry'],debug:[],log:['HiLog','FaultLog'],services:[],vcs:['Log','Console']};
  function setBottom(p){
    ide.setAttribute('data-bottom',p||'none');
    $$('.tw-bottom .pane').forEach(function(x){x.classList.toggle('on',x.dataset.pane===p)});
    $$('.stripe.left [data-bottom]').forEach(function(b){b.classList.toggle('on',b.dataset.bottom===p)});
    if(p){$('#bottom-title').textContent=BOTTOM_TITLES[p];$('#bottom-tabs').innerHTML=BOTTOM_TABS[p].map(function(t,i){return '<button class="btab'+(i===0&&t!=='+'?' on':'')+'">'+t+(t!=='+'&&i===0?'<span class="x"><svg class="i"><use href="#i-closeS"/></svg></span>':'')+'</button>'}).join('')}
  }
  $$('.stripe.left [data-left]').forEach(function(b){b.addEventListener('click',function(){var cur=ide.getAttribute('data-left');if(b.dataset.left==='structure'){if(cur==='project'){structOn=!structOn;setLeft('project')}else{setLeft(cur==='structure'?null:'structure')}}else{setLeft(cur===b.dataset.left?null:b.dataset.left)}})});
  $$('[data-right]').forEach(function(b){b.addEventListener('click',function(){setRight(ide.getAttribute('data-right')===b.dataset.right&&b.classList.contains('sbtn')?null:b.dataset.right)})});
  $$('.stripe.left [data-bottom]').forEach(function(b){b.addEventListener('click',function(){setBottom(ide.getAttribute('data-bottom')===b.dataset.bottom?null:b.dataset.bottom)})});
  setLeft('project');setRight('agent');setBottom('build');

  /* ---------------- 项目树 ---------------- */
  var ICON={folder:'#i-folder',module:'#i-module',sourceRoot:'#i-sourceRoot',testRoot:'#i-testRoot',resRoot:'#i-resRoot',ets:'#i-ets',json:'#i-json',gitignore:'#i-gitignore',hvigor:'#i-hvigor',text:'#i-text',cog:'#i-cog',lib:'#i-lib',scratch:'#i-scratch'};
  // [icon, name, options, children]
  var TREE=[
    ['module','MyApplication',{b:1,hint:'~\\DevEcoStudioProjects\\MyApplication',open:1},[
      ['folder','.codegenie',{},[['json','codegenie.json']]],
      ['folder','.hvigor',{tint:1},[['folder','cache'],['text','.hvigor.lock']]],
      ['folder','.idea',{},[['text','.gitignore'],['text','misc.xml'],['text','modules.xml']]],
      ['folder','AppScope',{},[['folder','resources'],['json','app.json5']]],
      ['module','entry',{b:1,open:1},[
        ['folder','src',{open:1},[
          ['folder','main',{open:1},[
            ['sourceRoot','ets',{open:1},[
              ['folder','entryability',{},[['ets','EntryAbility.ets',{file:1}]]],
              ['folder','entrybackupability',{},[['ets','EntryBackupAbility.ets']]],
              ['folder','pages',{open:1},[['ets','Index.ets',{file:1,sel:1}]]]
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
      ['gitignore','.gitignore'],['json','build-profile.json5'],['json','code-linter.json5'],['hvigor','hvigorfile.ts'],['cog','local.properties'],['json','oh-package.json5'],['json','oh-package-lock.json5']
    ]],
    ['lib','External Libraries',{open:1},[['lib','ArkTS-HarmonyOS-26.0.0(hms)'],['lib','ArkTS-HarmonyOS-26.0.0(openharmony)']]],
    ['scratch','Scratches and Consoles']
  ];
  function renderNode(n,depth){
    var ic=n[0],name=n[1],o=n[2]||{},kids=n[3];
    var isDir=!!kids;var open=!!o.open;
    var h='<div class="row'+(o.sel?' sel':'')+(o.tint?' tint':'')+'" style="padding-left:'+(8+depth*16)+'px"'+(isDir?' data-dir="1" data-open="'+(open?1:0)+'"':'')+(o.file?' data-file="'+name+'"':'')+'>';
    h+='<span class="tg">'+(isDir?'<svg class="i"><use href="'+(open?'#i-chevD':'#i-chevR')+'"/></svg>':'')+'</span>';
    h+='<span class="ico"><svg><use href="'+ICON[ic]+'"/></svg></span><span class="lbl">'+(o.b?'<b>'+name+'</b>':name)+'</span>'+(o.hint?'<span class="hint">'+esc(o.hint)+'</span>':'')+'</div>';
    if(isDir){h+='<div class="kids"'+(open?'':' hidden')+'>'+kids.map(function(k){return renderNode(k,depth+1)}).join('')+'</div>'}
    return h;
  }
  var tree=$('#tree');tree.innerHTML=TREE.map(function(n){return renderNode(n,0)}).join('');
  function setChev(r){$('use',r).setAttribute('href',r.dataset.open==='1'?'#i-chevD':'#i-chevR')}
  tree.addEventListener('click',function(e){
    var r=e.target.closest('.row');if(!r)return;
    $$('#tree .row.sel').forEach(function(x){x.classList.remove('sel')});r.classList.add('sel');
    if(r.dataset.dir){var open=r.dataset.open==='1';r.dataset.open=open?'0':'1';r.nextElementSibling.hidden=open;setChev(r);var nm=$('.lbl',r).textContent;if(nm!=='MyApplication')$('#status-crumbs').innerHTML='<span class="sw"><span class="proj"></span>MyApplication</span><svg class="i"><use href="#i-chevR"/></svg><span class="sw"><svg class="i fold"><use href="#i-folder"/></svg>'+esc(nm)+'</span>'}
    if(r.dataset.file){openFile(r.dataset.file)}
  });
  ICON.struct='#i-struct';ICON.method='#i-method';ICON.field='#i-field';
  $('#structure').innerHTML=renderNode(['struct','Index',{open:1},[['method','build()',{},[['method','RelativeContainer()']]],['field','message: string']]],0);
  $('#structure .kids .kids').hidden=true;$$('#structure .row[data-dir]')[1].dataset.open='0';setChev($$('#structure .row[data-dir]')[1]);
  $('#structure').addEventListener('click',function(e){var r=e.target.closest('.row');if(!r||!r.dataset.dir)return;var o=r.dataset.open==='1';r.dataset.open=o?'0':'1';r.nextElementSibling.hidden=o;setChev(r)});

  /* ---------------- 编辑器 ---------------- */
  var FILES={
    'Index.ets':{path:['entry','src','main','ets','pages'],crumbs:['Index','Entry'],lines:[
      ['<span class="m">@Entry</span>',{fold:0,cur:1}],
      ['<span class="m">@Component</span>'],
      ['<span class="k">struct</span> <span class="ty">Index</span> {',{fold:1}],
      ['  <span class="m">@State</span> <span class="p">message</span>: <span class="k">string</span> = <span class="s">\'Hello World\'</span>;',{bulb:1}],
      [''],
      ['  <span class="f">build</span>() {',{fold:1,at:1}],
      ['    <span class="f">RelativeContainer</span>() {',{fold:1}],
      ['      <span class="f">Text</span>(<span class="k">this</span>.<span class="p">message</span>)'],
      ['        .<span class="f">id</span>(<span class="s">\'HelloWorld\'</span>)'],
      ['        .<span class="f">fontSize</span>(<span class="f">$r</span>(<span class="s">\'app.float.page_text_font_size\'</span>))',{bp:1}],
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
    'EntryAbility.ets':{path:['entry','src','main','ets','entryability'],crumbs:['EntryAbility'],lines:[
      ['<span class="k">import</span> { <span class="ty">AbilityConstant</span>, <span class="ty">ConfigurationConstant</span>, <span class="ty">UIAbility</span>, <span class="ty">Want</span> } <span class="k">from</span> <span class="s">\'@kit.AbilityKit\'</span>;',{cur:1}],
      ['<span class="k">import</span> { <span class="p">hilog</span> } <span class="k">from</span> <span class="s">\'@kit.PerformanceAnalysisKit\'</span>;'],
      ['<span class="k">import</span> { <span class="p">window</span> } <span class="k">from</span> <span class="s">\'@kit.ArkUI\'</span>;'],
      [''],
      ['<span class="k">const</span> <span class="p">DOMAIN</span> = <span class="n">0x0000</span>;'],
      [''],
      ['<span class="k">export default class</span> <span class="ty">EntryAbility</span> <span class="k">extends</span> <span class="ty">UIAbility</span> {',{fold:1}],
      ['  <span class="f">onCreate</span>(<span class="p">want</span>: <span class="ty">Want</span>, <span class="p">launchParam</span>: <span class="ty">AbilityConstant</span>.<span class="ty">LaunchParam</span>): <span class="k">void</span> {',{fold:1}],
      ['    <span class="k">this</span>.<span class="p">context</span>.<span class="f">getApplicationContext</span>().<span class="f">setColorMode</span>(<span class="ty">ConfigurationConstant</span>.<span class="ty">ColorMode</span>.<span class="p">COLOR_MODE_NOT_SET</span>);'],
      ['    <span class="p">hilog</span>.<span class="f">info</span>(<span class="p">DOMAIN</span>, <span class="s">\'testTag\'</span>, <span class="s">\'%{public}s\'</span>, <span class="s">\'Ability onCreate\'</span>);'],
      ['  }'],
      [''],
      ['  <span class="f">onDestroy</span>(): <span class="k">void</span> {',{fold:1}],
      ['    <span class="p">hilog</span>.<span class="f">info</span>(<span class="p">DOMAIN</span>, <span class="s">\'testTag\'</span>, <span class="s">\'%{public}s\'</span>, <span class="s">\'Ability onDestroy\'</span>);'],
      ['  }'],
      [''],
      ['  <span class="f">onWindowStageCreate</span>(<span class="p">windowStage</span>: <span class="p">window</span>.<span class="ty">WindowStage</span>): <span class="k">void</span> {',{fold:1}],
      ['    <span class="c">// Main window is created, set main page for this ability</span>'],
      ['    <span class="p">hilog</span>.<span class="f">info</span>(<span class="p">DOMAIN</span>, <span class="s">\'testTag\'</span>, <span class="s">\'%{public}s\'</span>, <span class="s">\'Ability onWindowStageCreate\'</span>);'],
      [''],
      ['    <span class="p">windowStage</span>.<span class="f">loadContent</span>(<span class="s">\'pages/Index\'</span>, (<span class="p">err</span>) =&gt; {',{fold:1}],
      ['      <span class="k">if</span> (<span class="p">err</span>.<span class="p">code</span>) {'],
      ['        <span class="p">hilog</span>.<span class="f">error</span>(<span class="p">DOMAIN</span>, <span class="s">\'testTag\'</span>, <span class="s">\'Failed to load the content. Cause: %{public}s\'</span>, <span class="ty">JSON</span>.<span class="f">stringify</span>(<span class="p">err</span>));'],
      ['        <span class="k">return</span>;'],
      ['      }'],
      ['      <span class="p">hilog</span>.<span class="f">info</span>(<span class="p">DOMAIN</span>, <span class="s">\'testTag\'</span>, <span class="s">\'Succeeded in loading the content.\'</span>);'],
      ['    });'],
      ['  }'],
      [''],
      ['  <span class="f">onWindowStageDestroy</span>(): <span class="k">void</span> {',{fold:1}],
      ['    <span class="c">// Main window is destroyed, release UI related resources</span>'],
      ['    <span class="p">hilog</span>.<span class="f">info</span>(<span class="p">DOMAIN</span>, <span class="s">\'testTag\'</span>, <span class="s">\'%{public}s\'</span>, <span class="s">\'Ability onWindowStageDestroy\'</span>);'],
      ['  }'],
      [''],
      ['  <span class="f">onForeground</span>(): <span class="k">void</span> {',{fold:1}],
      ['    <span class="p">hilog</span>.<span class="f">info</span>(<span class="p">DOMAIN</span>, <span class="s">\'testTag\'</span>, <span class="s">\'%{public}s\'</span>, <span class="s">\'Ability onForeground\'</span>);'],
      ['  }'],
      [''],
      ['  <span class="f">onBackground</span>(): <span class="k">void</span> {',{fold:1}],
      ['    <span class="p">hilog</span>.<span class="f">info</span>(<span class="p">DOMAIN</span>, <span class="s">\'testTag\'</span>, <span class="s">\'%{public}s\'</span>, <span class="s">\'Ability onBackground\'</span>);'],
      ['  }'],
      ['}']
    ]}
  };
  var current='Index.ets';
  function renderCode(name){
    var f=FILES[name],c='';
    f.lines.forEach(function(l,i){var o=l[1]||{};
      var g='<span class="n">'+(i+1)+'</span><span class="m">'+(o.bp?'<span class="bp"></span>':(o.bulb?'<svg class="bulb"><use href="#i-bulb"/></svg>':(o.at?'<svg class="atmark"><use href="#i-at-gutter"/></svg>':'')))+'</span><span class="fold">'+(o.fold?'<svg class="i" style="width:12px;height:12px"><use href="#i-chevD"/></svg>':'')+'</span>';
      c+='<div class="ln'+(o.cur?' cur':'')+'" data-ln="'+(i+1)+'"><span class="g">'+g+'</span><span class="t">'+l[0]+'</span></div>'});
    $('#code').innerHTML=c;
    $('#crumbs').innerHTML=f.crumbs.map(function(x,i){return (i?'<svg class="i" style="width:12px;height:12px"><use href="#i-chevR"/></svg>':'')+'<span class="crumb">'+(i===0?'<svg class="i"><use href="#i-module"/></svg>':'')+x+'</span>'}).join('');
    var sc=['MyApplication'].concat(f.path).concat([name]);
    $('#status-crumbs').innerHTML=sc.map(function(x,i){var ic=i===0?null:(i===1?'#i-module':(i===sc.length-1?'#i-ets':null));return (i?'<svg class="i"><use href="#i-chevR"/></svg>':'')+'<span class="sw">'+(i===0?'<span class="proj"></span>':'')+(ic?'<svg class="i"><use href="'+ic+'"/></svg>':'')+x+'</span>'}).join('');
    $('#ctx-file').lastChild.textContent=name;
    $('#status-pos').textContent='23:2';
  }
  function openFile(name){
    current=name;
    if(!$('#tabs .tab[data-file="'+name+'"]')){var t=document.createElement('button');t.className='tab';t.dataset.file=name;t.innerHTML='<svg class="i"><use href="#i-ets"/></svg>'+name+'<span class="x"><svg class="i"><use href="#i-closeS"/></svg></span>';$('#tabs .grow').before(t)}
    $$('#tabs .tab').forEach(function(t){t.classList.toggle('on',t.dataset.file===name)});
    renderCode(name);
    $$('#tree .row.sel').forEach(function(x){x.classList.remove('sel')});
    var r=$('#tree .row[data-file="'+name+'"]');if(r)r.classList.add('sel');
  }
  $('#tabs').addEventListener('click',function(e){var t=e.target.closest('.tab');if(!t)return;if(e.target.closest('.x')){var was=t.classList.contains('on');t.remove();var rest=$$('#tabs .tab');if(was&&rest.length)openFile(rest[rest.length-1].dataset.file);if(!rest.length){$('#code').innerHTML='';$('#crumbs').innerHTML=''}}else openFile(t.dataset.file)});
  $('#code').addEventListener('click',function(e){var ln=e.target.closest('.ln');if(!ln)return;$$('#code .ln.cur').forEach(function(x){x.classList.remove('cur')});ln.classList.add('cur');$('#status-pos').textContent=ln.dataset.ln+':1'});
  renderCode('Index.ets');
  /* 焦点：编辑器有焦点时标签下划线为蓝，否则为灰（*.inactiveUnderlineColor）*/
  ide.setAttribute('data-focus','editor');
  document.addEventListener('mousedown',function(e){ide.setAttribute('data-focus',e.target.closest('.editor')?'editor':'other')});

  /* ---------------- Tooltip（IntelliJ 样式，含快捷键）---------------- */
  var tip=$('#tip'),tipT;
  document.addEventListener('mouseover',function(e){
    var el=e.target.closest('[title]');if(!el||!ide.contains(el))return;
    var raw=el.getAttribute('title');if(!raw)return;el.dataset.tt=raw;el.removeAttribute('title');
    show(el);
  });
  document.addEventListener('mouseover',function(e){var el=e.target.closest('[data-tt]');if(el)show(el)});
  document.addEventListener('mouseout',function(e){var el=e.target.closest('[data-tt]');if(el){clearTimeout(tipT);tip.hidden=true}});
  function show(el){clearTimeout(tipT);tipT=setTimeout(function(){var p=el.dataset.tt.split('|');tip.innerHTML=esc(p[0])+(p[1]?'<span class="sc">'+esc(p[1])+'</span>':'');tip.hidden=false;var r=el.getBoundingClientRect();var x=Math.min(r.left,window.innerWidth-tip.offsetWidth-8),y=r.bottom+6;if(y+30>window.innerHeight)y=r.top-30;tip.style.left=x+'px';tip.style.top=y+'px'},450)}

  /* ---------------- Run ---------------- */
  function runApp(){setBottom('run');$('.tw-bottom .pane[data-pane="run"]').innerHTML='<div class="out">Launching \'entry\' on <span style="color:var(--ui-error)">No Devices</span>…\n\n<span style="color:var(--ui-error)">Error: No connected devices.</span> Connect a device or create an emulator in Device Manager, then run again.</div>'}

  /* ---------------- Agent ---------------- */
  var mode='ask';
  var thread=$('#ai-thread'),welcome=$('#ai-welcome'),scroll=$('#ai-scroll'),ta=$('#ai-text'),send=$('#send');
  function setMode(m){mode=m;$('#mode-label').textContent=m==='ask'?'HarmonyOS Ask':'HarmonyOS Act';$('#mode-btn use').setAttribute('href',m==='ask'?'#i-chat':'#i-tw-agent');closePops()}
  $$('[data-mode]').forEach(function(b){b.addEventListener('click',function(e){setMode(b.dataset.mode);e.stopPropagation();if(b.classList.contains('chip'))ta.focus()})});
  $$('[data-model]').forEach(function(b){b.addEventListener('click',function(e){var m=b.dataset.model;$('#model-label').textContent=m.length>15?m.slice(0,14)+'…':m;closePops();e.stopPropagation()})});
  $$('#chips [data-q]').forEach(function(b){b.addEventListener('click',function(){ta.value=b.dataset.q;ta.dispatchEvent(new Event('input'));ta.focus()})});
  ta.addEventListener('input',function(){$('#counter').title=ta.value.length+' / 30000';send.classList.toggle('ready',ta.value.trim().length>0)});
  ta.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();doSend()}});
  send.addEventListener('click',function(){if(send.classList.contains('stop')){stopGen()}else{doSend()}});
  var genTimer=null;
  function now(){var d=new Date();return d.getFullYear()+'/'+(d.getMonth()+1)+'/'+d.getDate()+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')}
  function doSend(){
    var q=ta.value.trim();if(!q)return;
    welcome.hidden=true;thread.hidden=false;
    var u=document.createElement('div');u.className='umsg';u.innerHTML='<span class="time">'+now()+'</span><div class="bubble">'+esc(q)+'</div>';thread.appendChild(u);
    var a=document.createElement('div');a.className='amsg';
    a.innerHTML=(mode==='ask'?'<div class="step"><svg class="i"><use href="#i-cloud"/></svg>Query Cloud Knowledge Base</div>':'<div class="step"><svg class="i"><use href="#i-tw-project"/></svg>Reading project · Index.ets · string.json</div>')+
      ($('#deep').classList.contains('on')?'<details><summary>Deep Thinking</summary><div class="think">用户想确认 DevEco Code 的交互形态。先查官方仓库 README：它是命令行运行的 Agent，基于 OpenCode 扩展；同时说明与 CodeGenie（IDE 内插件）的分工，避免混淆。回答按"结论 → 关键特点 → 典型工作流 → 对比表"组织。</div></details>':'')+
      '<div class="typing"><i></i><i></i><i></i></div>';
    thread.appendChild(a);scroll.scrollTop=scroll.scrollHeight;
    ta.value='';ta.dispatchEvent(new Event('input'));
    send.classList.add('stop');$('#send use').setAttribute('href','#i-stopSq');$('#fontsize').hidden=false;
    genTimer=setTimeout(function(){finish(a,q)},1400);
  }
  function stopGen(){clearTimeout(genTimer);$$('.typing',thread).forEach(function(t){t.outerHTML='<div class="step" style="color:var(--ui-error)">已停止生成</div>'});resetSend()}
  function resetSend(){send.classList.remove('stop');send.classList.remove('ready');$('#send use').setAttribute('href','#i-send-o')}
  function finish(a,q){
    var t=$('.typing',a);if(!t)return;
    var body=document.createElement('div');body.className='md';
    body.innerHTML=(mode==='ask'?ASK_ANSWER:ACT_ANSWER)+'<div class="ans-foot"><svg class="i" style="width:12px;height:12px"><use href="#i-tw-agent"/></svg>AI-generated content. For reference only<span class="grow"></span><button class="abtn" title="Regenerate"><svg class="i"><use href="#i-regen"/></svg></button><button class="abtn" title="Copy"><svg class="i"><use href="#i-copy"/></svg></button><button class="abtn" title="Like"><svg class="i"><use href="#i-like"/></svg></button><button class="abtn" title="Dislike"><svg class="i"><use href="#i-dislike"/></svg></button><button class="abtn" title="Report"><svg class="i"><use href="#i-flag"/></svg></button></div>';
    t.replaceWith(body);resetSend();scroll.scrollTop=scroll.scrollHeight;
    if(mode==='act'){var st=$$('.stp .st',body);setTimeout(function(){st[2].className='st done';st[2].innerHTML='<svg><use href="#i-checkS"/></svg>';st[3].className='st run'},1500)}
  }
  function resetChat(){thread.innerHTML='';thread.hidden=true;welcome.hidden=false;$('#fontsize').hidden=true;resetSend();clearTimeout(genTimer)}
  var ASK_ANSWER='<p><b>是的，DevEco Code 是一个 TUI（终端用户界面）工具。</b></p><p>DevEco Code 本质是一个运行在命令行终端中的 AI Agent。它基于开源项目 OpenCode 扩展开发，采用对话式交互——你不需要打开 DevEco Studio，直接在终端里用自然语言描述需求，它就能自主完成代码编写、编译构建、设备部署、错误修复等全链路开发工作。</p>'+
    '<h4 class="emoji">🔑 关键特点</h4><ul><li><b>终端交互</b>：安装后通过 <code>deveco</code> 命令启动，进入一个基于终端的对话界面（TUI），支持多轮会话、模式切换（Build / Plan / Goal）、模型选择等。</li><li><b>两种使用形态</b>：虽然主力形态是终端 TUI，但它也可以嵌入 VS Code 使用（作为扩展），但核心交互方式依然是终端对话式。</li><li><b>与 CodeGenie 的区别</b>：CodeGenie 是 DevEco Studio 编辑区内的 AI 辅助插件（补全、修改），而 DevEco Code 独立于 IDE 运行，是"从零到能起来"的 Agent 工具。</li></ul>'+
    '<h4 class="emoji">🧭 典型工作流</h4><div class="codeblock"><div class="cb-hdr"><button class="abtn" title="Copy"><svg class="i"><use href="#i-copy"/></svg></button><button class="abtn" title="Insert to Terminal"><svg class="i"><use href="#i-insert"/></svg></button><button class="abtn" title="Open in new file"><svg class="i"><use href="#i-plus-box"/></svg></button></div><pre><span class="c"># 安装（前提：Node.js ≥ 18）</span>\nnpm install -g @deveco/deveco-code\n\n<span class="c"># 启动 TUI</span>\ndeveco\n\n<span class="c"># 登录华为账号（首次使用）</span>\ndeveco auth login\n\n<span class="c"># 进入对话界面后，直接说需求</span>\n/build 帮我创建一个鸿蒙登录页面，包含手机号输入和密码输入</pre></div>'+
    '<h4 class="emoji">✅ 总结</h4><table><thead><tr><th>维度</th><th>说明</th></tr></thead><tbody><tr><td>是否 TUI</td><td>✅ 是，终端对话式界面</td></tr><tr><td>是否可嵌入 VS Code</td><td>✅ 也支持，但本质仍是终端 Agent</td></tr><tr><td>是否需要 DevEco Studio</td><td>写代码、查文档不需要；编译构建/推包运行需要 SDK 环境</td></tr></tbody></table><p>所以，DevEco Code 就是一个<b>面向 HarmonyOS 开发的 AI Agent TUI 工具</b>，让你在命令行里用自然语言驱动整个开发流程。</p>';
  var ACT_ANSWER='<p>我会分三步改动，改完前不会写入文件，你可以逐项审阅。</p>'+
    '<div class="steps"><div class="stp"><span class="st done"><svg><use href="#i-checkS"/></svg></span><span class="txt">读取页面与资源定义</span><span class="file">Index.ets · string.json</span></div><div class="stp"><span class="st done"><svg><use href="#i-checkS"/></svg></span><span class="txt">新增字符串资源 greeting_en / greeting_zh</span><span class="file">string.json</span></div><div class="stp"><span class="st run"></span><span class="txt">改写 onClick 切换逻辑</span><span class="file">Index.ets</span></div><div class="stp"><span class="st todo"></span><span class="txt">hvigor 编译校验</span><span class="file">entry:assembleHap</span></div></div>'+
    '<div class="tool-call"><svg class="i"><use href="#i-tw-terminal"/></svg><span>调用</span><code>hvigorw assembleHap --mode module -p product=default</code><span>· 等待审批</span></div>'+
    '<div class="diffcard"><div class="dh"><svg class="i"><use href="#i-ets"/></svg><span class="fn">entry/src/main/ets/pages/Index.ets</span><span class="cnt"><span class="add">+4</span> <span class="del">−1</span></span><span class="grow"></span><button class="abtn" title="Open diff in editor"><svg class="i"><use href="#i-split"/></svg></button></div><pre><span class="l">  .onClick(() =&gt; {</span><span class="l del">-   this.message = \'Welcome\';</span><span class="l add">+   this.isZh = !this.isZh;</span><span class="l add">+   this.message = this.isZh</span><span class="l add">+     ? $r(\'app.string.greeting_zh\')</span><span class="l add">+     : $r(\'app.string.greeting_en\');</span><span class="l">  })</span></pre><div class="actions"><button class="btn sm">Reject</button><button class="btn sm primary">Accept</button></div></div>';
})();
