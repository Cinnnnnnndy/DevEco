// 阅读导航：滚动时标记当前章节（与启动页分析报告同一做法）
(function(){
  const links=[...document.querySelectorAll('nav.toc a[href^="#"]')];
  if(!links.length) return;
  const heads=links.map(a=>document.getElementById(a.hash.slice(1))).filter(Boolean);
  function update(){
    let i=0; heads.forEach((h,k)=>{ if(h.getBoundingClientRect().top<=90) i=k; });
    if(Math.ceil(scrollY+innerHeight)>=document.documentElement.scrollHeight-2) i=heads.length-1;
    links.forEach((a,k)=>k===i?a.setAttribute('aria-current','location'):a.removeAttribute('aria-current'));
  }
  addEventListener('scroll',update,{passive:true}); addEventListener('load',update); update();
})();
