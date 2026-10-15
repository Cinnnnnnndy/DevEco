/* Int UI Kit Main Window (7070:138481), adapted to the existing Tree Lab. */
window.renderIdePreview = ({main,pageHead,icon,createTree,esc,config}) => {
  const A='assets/ij/';
  const img=(file)=>`<img src="${A+file}" alt="" aria-hidden="true" draggable="false">`;
  const control=(file,label,id,cls='')=>`<button class="ij-icon-button ${cls}" id="${id}" title="${label}" aria-label="${label}">${img(file)}</button>`;
  const display=(file,label,cls='')=>`<span class="ij-icon-button ${cls}" title="${label}">${img(file)}</span>`;
  const nodes=[
    {id:'root',name:'workspace-demo',folder:true,depth:0},
    {id:'src',parent:'root',name:'src',folder:true,depth:1},
    {id:'features',parent:'src',name:'features',folder:true,depth:2},
    {id:'account',parent:'features',name:'account',folder:true,depth:3},
    {id:'settings',parent:'account',name:'AccountSettings.java',depth:4,type:'java'},
    {id:'service',parent:'account',name:'AccountService.java',depth:4,type:'java'},
    {id:'billing',parent:'features',name:'billing',folder:true,depth:3},
    {id:'billing-file',parent:'billing',name:'BillingOverview.java',depth:4,type:'java'},
    {id:'shared',parent:'src',name:'shared',folder:true,depth:2},
    {id:'repository',parent:'shared',name:'AccountRepository.java',depth:3,type:'interface'},
    {id:'tests',parent:'root',name:'test',folder:true,depth:1},
    {id:'test',parent:'tests',name:'AccountSettingsTest.java',depth:2,type:'java'},
    {id:'target',parent:'root',name:'target',folder:true,depth:1},
    {id:'gitignore',parent:'root',name:'.gitignore',depth:1,type:'ignore'},
    {id:'libraries',parent:'root',name:'External Libraries',folder:true,depth:1}
  ];
  const files={
    settings:`package demo.features.account;

import java.util.Objects;
import demo.shared.AccountRepository;

/**
 * Keeps account preferences in one place.
 * A small example for the file-tree preview.
 */
public final class AccountSettings {

    private final AccountRepository repository;

    public AccountSettings(AccountRepository repository) {
        this.repository = Objects.requireNonNull(repository);
    }

    public void updateDisplayName(String accountId, String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Name is required");
        }

        repository.updateDisplayName(accountId, name.trim());
    }

    public boolean notificationsEnabled(String accountId) {
        return repository.preferences(accountId).notifications();
    }
}`,
    service:`package demo.features.account;

import demo.shared.AccountRepository;

public final class AccountService {
    private final AccountRepository repository;

    public AccountService(AccountRepository repository) {
        this.repository = repository;
    }

    public String displayName(String accountId) {
        return repository.findById(accountId).displayName();
    }
}`,
    'billing-file':`package demo.features.billing;

import java.math.BigDecimal;

public record BillingOverview(
    String accountId,
    BigDecimal monthlyTotal,
    boolean subscriptionActive
) {
    public boolean requiresPayment() {
        return monthlyTotal.signum() > 0;
    }
}`,
    repository:`package demo.shared;

public interface AccountRepository {
    Account findById(String accountId);

    Preferences preferences(String accountId);

    void updateDisplayName(String accountId, String name);
}`,
    test:`package demo.features.account;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class AccountSettingsTest {
    @Test
    void emptyDisplayNameIsRejected() {
        var settings = new AccountSettings(new InMemoryRepository());
        assertThrows(IllegalArgumentException.class,
            () -> settings.updateDisplayName("demo", ""));
    }
}`,
    gitignore:`# Build output
/target/
/out/

# Local workspace settings
.idea/workspace.xml
*.log`
  };
  let density=20,width=320,selected='settings',terminal=true,project=true,activeConsole='local';
  const tabs=['settings','service','repository'];
  const fileAsset=n=>n.type==='interface'?'066d5.svg':n.type==='ignore'?'c0dc4.svg':'39c22.svg';
  const nodeAsset=n=>n.folder?(n.id==='tests'?'cc4db.svg':n.id==='target'?'5405f.svg':n.id==='libraries'?'90579.svg':'1f5f9.svg'):fileAsset(n);
  main.innerHTML=pageHead('LIVE','把文件树放回完整的 IDE。','基于 Int UI Kit 主窗口组件构建的交互效果页。切换缩进与侧栏宽度，观察目录、编辑器和终端在同一界面中的关系。','IDE PREVIEW / INT UI KIT')+`
    <div class="ide-demo-controls"><div class="ide-density" aria-label="文件树每级缩进">${[16,20,24].map(v=>`<button data-ide-indent="${v}" aria-pressed="${v===20}">${v}px <span>${v===20?'标准':v===16?'紧凑':'对照'}</span></button>`).join('')}</div><label class="ide-width-control">文件树宽度 <input id="ide-width" type="range" min="260" max="420" step="20" value="320"><output for="ide-width" id="ide-width-value">320px</output></label><button class="button" id="ide-focus">${icon('external')}宽屏查看</button></div>
    <div class="ide-scroll" tabindex="0" role="region" aria-label="完整 IDE 界面，窄屏可横向滚动"><section class="ide-window" id="ide-window" aria-label="IntelliJ 风格的文件树设计效果" data-figma-node="7070:138481">
      <header class="ij-main-toolbar" data-figma-node="7070:138482"><img class="ij-gradient" src="${A}6b2e8.png" alt=""><span class="ij-window-dots">${img('13f54.svg')}</span><div class="ij-toolbar-project"><span class="ij-project-logo">IJ</span><span>workspace-demo</span>${img('e1857.svg')}</div><div class="ij-branch">${img('7b238.svg')}main ${img('e1857.svg')}</div><div class="ij-toolbar-right"><span class="ij-run-config">${img('d42a9.svg')}Workspace Demo ${img('3d8af.svg')}</span>${control('47565.svg','展示示例运行结果','ij-run','ij-run-button')}${display('a9f6d.svg','Debug · 视觉展示','ij-run-button')}${display('2bc8e.svg','运行选项 · 视觉展示','ij-run-button')}<span class="ij-toolbar-separator"></span>${display('6f187.svg','Code With Me · 视觉展示')}${control('c9e06.svg','搜索示例文件','ij-search-open')}${display('5983b.svg','Settings · 视觉展示')}</div></header>
      <div class="ij-workspace"><aside class="ij-stripe ij-stripe-left"><div>${control('daf5c.svg','显示或隐藏项目目录','ij-project-toggle','ij-stripe-button active')}${display('d5028.svg','Structure · 视觉展示','ij-stripe-button')}${display('b2fac.svg','Commit · 视觉展示','ij-stripe-button')}${display('7135a.svg','Bookmarks · 视觉展示','ij-stripe-button')}${display('c8b56.svg','更多工具窗口 · 视觉展示','ij-stripe-button')}</div><div>${control('68f8e.svg','显示或隐藏终端','ij-terminal-toggle','ij-stripe-button terminal-active')}${control('ec300.svg','展示示例运行结果','ij-run-side','ij-stripe-button')}${display('4e22d.svg','Version Control · 视觉展示','ij-stripe-button')}${display('5dc83.svg','Problems · 视觉展示','ij-stripe-button')}</div></aside>
      <div class="ij-center"><div class="ij-top-panes" id="ij-top-panes" style="--project-width:320px"><aside class="ij-project" id="ij-project"><div class="ij-panel-header"><strong>Project</strong><div>${control('31728.svg','定位当前打开文件','ij-locate')}${control('667c6.svg','展开全部目录','ij-expand')}${control('1f4e4.svg','收起全部目录','ij-collapse')}${display('b8262.svg','项目选项 · 视觉展示')}${control('c37a1.svg','隐藏项目目录','ij-project-hide')}</div></div><div class="ij-project-tree" id="ij-project-tree"></div><div class="ij-tree-caption"><span id="ij-indent-caption">20px / 层</span><span>图文间距 4px</span></div><div class="ij-divider" id="ij-divider" tabindex="0" role="separator" aria-label="调整文件树宽度" aria-orientation="vertical" aria-valuemin="260" aria-valuemax="420" aria-valuenow="320"></div></aside><section class="ij-editor"><div class="ij-editor-tabs" id="ij-tabs" role="tablist" aria-label="已打开的示例文件"></div><div class="ij-code-area" role="tabpanel" id="ij-code-panel" tabindex="0" aria-label="示例代码"><div class="ij-inspections">${img('9ef54.svg')}<span>3</span>${img('24fe0.svg')}<span>10</span>${img('e7b0b.svg')}${img('e1857.svg')}</div><div id="ij-code" class="ij-code"></div></div></section></div>
      <section class="ij-terminal" id="ij-terminal"><div class="ij-panel-header"><strong>Terminal</strong><div class="ij-console-tabs"><button id="ij-local" aria-pressed="true">Local</button><button id="ij-run-output" aria-pressed="false">Run · 示例</button></div><span class="ij-panel-spacer"></span>${display('b8262.svg','终端选项 · 视觉展示')}${control('c37a1.svg','收起终端','ij-terminal-hide')}</div><div class="ij-terminal-output" id="ij-terminal-output" role="log" aria-live="polite"></div></section></div>
      <aside class="ij-stripe ij-stripe-right">${display('12567.svg','Notifications · 视觉展示','ij-stripe-button')}${display('c8b56.svg','更多面板 · 视觉展示','ij-stripe-button')}${display('92678.svg','Maven · 视觉展示','ij-stripe-button')}</aside></div>
      <footer class="ij-status"><span class="ij-breadcrumb" id="ij-breadcrumb">workspace-demo / src / features / account / AccountSettings.java</span><span class="ij-status-right"><span id="ij-position">1:1</span><span>LF</span><span>UTF-8</span>${img('efff0.svg')}</span></footer>
      <dialog class="ij-search-dialog" id="ij-search-dialog"><div class="ij-search-heading"><strong>Search Everywhere</strong><button id="ij-search-close" aria-label="关闭文件搜索">${img('0032a.svg')}</button></div><label><span class="sr-only">搜索示例文件</span><input id="ij-search-input" placeholder="输入文件名…" autocomplete="off"></label><div id="ij-search-results"></div><p>选择文件后将在编辑器中打开 · Esc 关闭</p></dialog>
    </section></div>
    <div class="ide-preview-caption"><span>保持 1:1 逻辑像素展示，窄屏可横向滚动；拖动项目区右边界调整宽度。</span><span id="ide-selection-info" aria-live="polite">标准模式 · 20px 缩进</span></div>
    <div class="ide-design-summary"><div><b>20</b><span>箭头容器</span></div><div><b>20</b><span>图标容器</span></div><div><b>16</b><span>文件名字号</span></div><div><b>4</b><span>图标 → 名称</span></div><div><b>28</b><span>列表行高</span></div></div>
    <div class="export-panel"><div><h2>查看完整场景中的设计取舍</h2><p>标准与紧凑模式只改变缩进。代码与运行结果为演示内容。</p></div><div class="export-actions"><a class="button" href="assets/ide-standard.png" download>下载标准效果图</a><a class="button" href="assets/ide-compact.png" download>下载紧凑效果图</a><a class="button primary" href="#solution">返回方案说明 ${icon('arrow')}</a></div></div>
    <p class="ide-source-note">界面外壳、工具栏和图标来自 <a href="https://www.figma.com/design/3q89XhaMGImDOPJwvfEpd7/Int-UI-Kit--Community-?node-id=7070-138481" target="_blank" rel="noopener noreferrer">Int UI Kit · Main Window ↗</a>。文件树采用当前自定义参数；原始 16px 文件图形居中放置于 20px 容器。此页展示设计效果，并非 IntelliJ 官方默认界面。</p>`;
  const $=id=>document.getElementById(id);
  function highlight(line){const regex=/(\/\/.*|\/\*.*|\s*\*.*|"(?:[^"\\]|\\.)*"|\b(?:package|import|public|private|final|class|interface|record|void|boolean|return|new|if|throw|this|var|null|true|false)\b|@\w+|\b\d+\b)/g;let out='',last=0;for(const m of line.matchAll(regex)){out+=esc(line.slice(last,m.index));const t=m[0];const cls=/^\s*\*|^\/\//.test(t)||t.startsWith('/*')?'comment':t[0]==='"'?'string':t[0]==='@'?'annotation':/^\d+$/.test(t)?'number':'keyword';out+=`<span class="ij-token-${cls}">${esc(t)}</span>`;last=m.index+t.length;}return out+esc(line.slice(last));}
  function filePath(n){const a=[n.name];while(n.parent){n=nodes.find(x=>x.id===n.parent);a.unshift(n.name);}return a.join(' / ');}
  function renderEditor(){const n=nodes.find(n=>n.id===selected);$('ij-tabs').innerHTML=tabs.map(id=>{const f=nodes.find(n=>n.id===id);return `<div class="ij-tab ${id===selected?'selected':''}"><button role="tab" aria-controls="ij-code-panel" aria-selected="${id===selected}" data-open="${id}">${img(fileAsset(f))}<span>${esc(f.name)}</span></button><button class="ij-tab-close" data-close="${id}" aria-label="关闭 ${esc(f.name)}">${img('bf27f.svg')}</button></div>`}).join('');$('ij-code').innerHTML=(files[selected]||'').split('\n').map((line,i)=>`<div class="ij-code-line ${i===13?'line-highlight':''}"><span class="ij-line-number">${i+1}</span><code>${highlight(line)||' '}</code></div>`).join('');$('ij-breadcrumb').textContent=filePath(n);$('ij-position').textContent='1:1';$('ij-tabs').querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>openFile(b.dataset.open));$('ij-tabs').querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>{if(tabs.length===1)return;const i=tabs.indexOf(b.dataset.close);tabs.splice(i,1);if(selected===b.dataset.close)selected=tabs[Math.min(i,tabs.length-1)];tree.select(selected);renderEditor()});$('ij-tabs').querySelectorAll('[role=tab]').forEach(b=>b.addEventListener('keydown',e=>{if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;e.preventDefault();const next=tabs[(tabs.indexOf(b.dataset.open)+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length];openFile(next);$('ij-tabs').querySelector(`[data-open="${next}"]`)?.focus()}));}
  function openFile(id){if(!files[id])return;selected=id;if(!tabs.includes(id))tabs.push(id);tree.select(id);renderEditor();}
  const tree=createTree($('ij-project-tree'),{...config},{guides:true,nodeData:nodes,renderIcon:n=>img(nodeAsset(n)),renderArrow:()=>img('a0622.svg'),onSelect:n=>{if(!n.folder)openFile(n.id)}});
  function setWidth(value){width=Math.max(260,Math.min(420,Number(value)));$('ij-top-panes').style.setProperty('--project-width',width+'px');$('ide-width').value=width;$('ide-width-value').textContent=width+'px';$('ij-divider').setAttribute('aria-valuenow',String(width));}
  main.querySelectorAll('[data-ide-indent]').forEach(b=>b.onclick=()=>{density=Number(b.dataset.ideIndent);tree.update({...config,indent:density},true);main.querySelectorAll('[data-ide-indent]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('ij-indent-caption').textContent=density+'px / 层';$('ide-selection-info').textContent=(density===20?'标准模式':density===16?'紧凑模式':'对照模式')+' · '+density+'px 缩进';});
  $('ide-width').oninput=e=>setWidth(e.target.value);
  const divider=$('ij-divider');let dragging=false,startX=0,startWidth=0;divider.onpointerdown=e=>{dragging=true;startX=e.clientX;startWidth=width;divider.setPointerCapture(e.pointerId);e.preventDefault()};divider.onpointermove=e=>{if(dragging)setWidth(Math.round(startWidth+e.clientX-startX))};divider.onpointerup=()=>dragging=false;divider.onpointercancel=()=>dragging=false;divider.onkeydown=e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();setWidth(width+(e.key==='ArrowRight'?20:-20))}};
  function toggleProject(show){project=show;$('ij-top-panes').classList.toggle('project-hidden',!show);$('ij-project-toggle').classList.toggle('active',show);$('ij-project-toggle').setAttribute('aria-pressed',String(show));}
  function toggleTerminal(show){terminal=show;$('ij-terminal').hidden=!show;$('ij-terminal-toggle').classList.toggle('terminal-active',show);$('ij-terminal-toggle').setAttribute('aria-pressed',String(show));}
  function renderConsole(){const isRun=activeConsole==='run';$('ij-local').setAttribute('aria-pressed',String(!isRun));$('ij-run-output').setAttribute('aria-pressed',String(isRun));$('ij-terminal-output').innerHTML=isRun?'<p class="ij-terminal-muted">演示日志 · 不会执行本机代码</p><p><span class="ij-terminal-green">✓</span> AccountSettingsTest · emptyDisplayNameIsRejected</p><p><span class="ij-terminal-green">✓</span> AccountServiceTest · displayName</p><p class="ij-terminal-green">示例：2 tests passed</p><p>Process finished with exit code 0 <span class="ij-terminal-muted">(示例)</span></p>':'<p><span class="ij-terminal-green">demo@workspace</span> workspace-demo % ls</p><p>README.md &nbsp;&nbsp; pom.xml &nbsp;&nbsp; src &nbsp;&nbsp; target &nbsp;&nbsp; test</p><p>&nbsp;</p><p><span class="ij-terminal-green">demo@workspace</span> workspace-demo % <span class="ij-terminal-caret"></span></p>';}
  const run=()=>{activeConsole='run';toggleTerminal(true);renderConsole()};$('ij-run').onclick=run;$('ij-run-side').onclick=run;$('ij-run-output').onclick=run;$('ij-local').onclick=()=>{activeConsole='local';renderConsole()};$('ij-terminal-toggle').onclick=()=>toggleTerminal(!terminal);$('ij-terminal-hide').onclick=()=>toggleTerminal(false);$('ij-project-toggle').onclick=()=>toggleProject(!project);$('ij-project-hide').onclick=()=>toggleProject(false);$('ij-expand').onclick=()=>tree.expandAll();$('ij-collapse').onclick=()=>tree.collapseAll();$('ij-locate').onclick=()=>{tree.select(selected);$('ij-project-tree').querySelector(`[data-id="${selected}"]`)?.scrollIntoView({block:'nearest',inline:'nearest'})};
  function search(){const q=$('ij-search-input').value.toLowerCase().trim();const found=nodes.filter(n=>!n.folder&&n.name.toLowerCase().includes(q));$('ij-search-results').innerHTML=found.map(n=>`<button data-search-file="${n.id}">${img(fileAsset(n))}<span>${esc(n.name)}</span><small>${esc(filePath(n))}</small></button>`).join('')||'<p>没有匹配的示例文件</p>';$('ij-search-results').querySelectorAll('[data-search-file]').forEach(b=>b.onclick=()=>{openFile(b.dataset.searchFile);toggleProject(true);$('ij-search-dialog').close()});}
  $('ij-search-open').onclick=()=>{$('ij-search-input').value='';search();$('ij-search-dialog').showModal();$('ij-search-input').focus()};$('ij-search-input').oninput=search;$('ij-search-close').onclick=()=>$('ij-search-dialog').close();
  $('ide-focus').onclick=()=>{const enabled=document.body.classList.toggle('ide-wide');$('ide-focus').innerHTML=icon('external')+(enabled?'退出宽屏':'宽屏查看');};
  const onEscape=e=>{if(e.key==='Escape'&&document.body.classList.contains('ide-wide')){document.body.classList.remove('ide-wide');$('ide-focus').innerHTML=icon('external')+'宽屏查看'}};window.addEventListener('keydown',onEscape);
  renderEditor();renderConsole();toggleProject(true);toggleTerminal(true);
  return ()=>{window.removeEventListener('keydown',onEscape);document.body.classList.remove('ide-wide');};
};
