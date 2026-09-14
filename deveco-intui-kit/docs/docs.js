/* 规范页交互：主题切换、目录高亮、点色块复制 hex、复制 tokens.css */
(function(){
  var $=function(s,r){return (r||document).querySelector(s)};
  var $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
  var root=document.documentElement, toast=$('#toast'), tid;

  function say(msg){toast.textContent=msg;toast.classList.add('on');
    clearTimeout(tid);tid=setTimeout(function(){toast.classList.remove('on')},1400)}

  /* ---- 主题：默认跟随系统，点一下显式切换并记住 ---- */
  function label(){
    var dark = root.getAttribute('data-theme')==='dark' ||
      (!root.hasAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
    $('#theme span').textContent = dark ? '浅色' : '深色';
    $('#theme use').setAttribute('href', dark ? '#i-sun' : '#i-moon');
  }
  try{var sv=localStorage.getItem('intui-docs-theme'); if(sv) root.setAttribute('data-theme',sv)}catch(e){}
  label();
  $('#theme').addEventListener('click',function(){
    var dark = root.getAttribute('data-theme')==='dark' ||
      (!root.hasAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
    var next = dark ? 'light' : 'dark';
    root.setAttribute('data-theme',next);
    try{localStorage.setItem('intui-docs-theme',next)}catch(e){}
    label();
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change',label);

  /* ---- 复制：clipboard 不可用时退回 execCommand ---- */
  function copy(text,msg){
    function fallback(){
      try{var ta=document.createElement('textarea');ta.value=text;ta.style.cssText='position:fixed;opacity:0';
        document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();say(msg);
      }catch(e){say('复制失败，请手动选中')}
    }
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(function(){say(msg)},fallback);
    }else fallback();
  }
  document.addEventListener('click',function(e){
    var sw=e.target.closest('.sw');
    if(sw){copy(sw.dataset.hex,'已复制 '+sw.dataset.hex);return}
    var cp=e.target.closest('[data-copy]');
    if(cp){copy($('#tokens-src').textContent,'已复制 tokens.css');return}
  });

  /* ---- 目录高亮 ---- */
  var links=$$('.toc a'), secs=links.map(function(a){return $('#'+a.dataset.s)});
  var io=new IntersectionObserver(function(es){
    es.forEach(function(en){
      if(!en.isIntersecting)return;
      links.forEach(function(a){a.classList.toggle('on',a.dataset.s===en.target.id)});
    });
  },{rootMargin:'-10% 0px -75% 0px'});
  secs.forEach(function(s){if(s)io.observe(s)});
})();
