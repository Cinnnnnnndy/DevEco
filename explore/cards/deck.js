/* 质感色卡页：按 cards-data.js 的顺序排出十张色卡。
   卡面默认是最抽象的一版（tex/abs），鼠标移上去换成纹理（tex）；右上角可以整页切换。
   色条按各色占比分宽，下面列六个颜色（按亮度从暗到亮）。点一张进工作台。 */
(function () {
  'use strict';

  var D = window.CARD_DATA, deck = document.getElementById('deck');
  if (!D || !deck) return;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  D.list.forEach(function (c, i) {
    var t = c.data, a = el('a', 'chip');
    a.href = 'workbench.html#' + c.id;
    a.setAttribute('aria-label', c.name + '，进入工作台');

    var f = el('div', 'field' + (c.aspect > 1 ? ' wide' : ''));
    var im = new Image(); im.className = 'f-abs'; im.src = 'tex/abs/' + c.id + '.webp'; im.alt = ''; im.width = c.aspect > 1 ? 1600 : 800; im.height = 1000;
    var tx = new Image(); tx.className = 'f-tex'; tx.src = 'tex/' + c.id + '.webp'; tx.alt = ''; tx.loading = 'lazy'; tx.width = im.width; tx.height = 1000;
    f.appendChild(im); f.appendChild(tx);
    if (c.isNew) f.appendChild(el('span', 'tag', '新'));
    a.appendChild(f);

    var bar = el('div', 'bar'), info = el('div', 'info'), top = el('div', 'info-top'), list = el('ul', 'hx');
    top.appendChild(el('span', 'no', ('0' + (i + 1)).slice(-2)));
    top.appendChild(el('span', 'go', '工作台 →'));
    info.appendChild(top);
    info.appendChild(el('h2', 'nm', c.name));
    info.appendChild(el('p', 'ln', c.line));
    if (t) {
      t.palette.forEach(function (hx, j) {
        var s = el('i'); s.style.background = hx; s.style.flexGrow = t.share[j]; bar.appendChild(s);
        var li = el('li'), sw = el('i'); sw.style.background = hx;
        li.appendChild(sw); li.appendChild(document.createTextNode(hx.slice(1)));
        list.appendChild(li);
      });
      list.setAttribute('aria-label', '调色板：' + t.palette.join('、'));
      // 图还没加载出来时，卡面先铺调色板里偏暗的一个颜色，不是一片灰
      f.style.background = t.palette[Math.min(2, t.palette.length - 1)];
    }
    bar.setAttribute('aria-hidden', 'true');
    a.appendChild(bar);
    info.appendChild(list);
    a.appendChild(info);
    deck.appendChild(a);
  });

  // 整页切换：色卡 / 纹理（记在本机，下次打开还是这个）
  var btns = document.querySelectorAll('.view button');
  function view(v) {
    document.body.classList.toggle('view-tex', v === 'tex');
    Array.prototype.forEach.call(btns, function (b) { b.setAttribute('aria-checked', String(b.dataset.view === v)); });
  }
  Array.prototype.forEach.call(btns, function (b) {
    b.addEventListener('click', function () {
      view(b.dataset.view);
      try { localStorage.setItem('texture-deck:view', b.dataset.view); } catch (e) { /* 存不了就算了 */ }
    });
  });
  var saved = null;
  try { saved = localStorage.getItem('texture-deck:view'); } catch (e) { saved = null; }
  if (saved === 'tex') view('tex');
})();
