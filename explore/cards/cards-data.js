/* 质感色卡 · 十张卡片的定义（色卡页 index 和工作台 workbench 共用）
   defaults 是工作台的默认参数，和 tools/texture.py 里每张的配方对应：工作台从 tex/base/<名字>.webp 出发，
   用 WebGL 把配方里「拖曳、像素拉伸、Kuwahara、调色、泛光」这几步实时重做，所以默认看到的就是色卡页上的那张纹理。
   长度都按卡片高算（0.17 ≈ 1000 像素高的图上拖 170 像素），角度是度，0° 朝右、90° 朝下。
   abs 是「抽象度」拖一长刀时走的路径，和 texture.py 的 PATHS 一致；色卡页上那张最抽象的就是抽象度 1。 */
(function () {
  'use strict';

  // 所有参数的默认值；每张卡片只写和这里不一样的
  var BASE = {
    zoom: 1, panx: 0, pany: 0, rot: 0,
    aType: 'off', aAng: 90, aCx: .5, aCy: .5, aLen: 0, aTrail: 0,
    bType: 'off', bAng: 90, bCx: .5, bCy: .5, bLen: 0, bTrail: 0,
    mix: .5,
    stretch: 0, spos: .5, sdir: 'v',
    keep: 0,
    kuwa: 0, kmix: 1,
    gain: 1, lift: 0, gamma: 1, sat: 1, warm: 0,
    pal: 0, steps: 0,
    bloom: 0, bthr: .8, haze: 0, grain: .008, vig: .06,
    flow: 0, abs: 0,
    wpAbs: .6, wpDim: .18,
    bnAbs: .35
  };

  var CARDS = [
    { id: 'fall', name: '瀑布', line: '竖向拖曳曝光 · 水雾 · 逆光', aspect: 1.6, isNew: true,
      abs: { type: 'dir', ang: 90 },
      notes: {
        取样: '画圈的水幕，连着两边长苔藓的岩壁',
        算法: '竖向拖曳曝光：一层往上下各拖 170 像素，拉成丝一样的水幕；一层单向拖尾 60 像素，留住水花的细节。底部抬一层模糊提亮的水雾，亮处泛光',
        留下: '水的丝感、逆光的亮、苔绿的暗底'
      },
      defaults: { aType: 'dir', aAng: 90, aLen: .17, bType: 'dir', bAng: 90, bLen: .06, bTrail: 1, mix: .5,
        haze: .55, bloom: .55, bthr: .7, lift: .02, gamma: 1.05, sat: 1.05, vig: .08, flow: .35 } },
    { id: 'film', name: '塑料膜', line: '图像绗缝 · Kuwahara · 洋红', aspect: .8,
      abs: { type: 'dir', ang: 34.4 },
      notes: {
        取样: '零食袋的镀铝膜，避开印刷的大字、纸箱和红圈',
        算法: '图像绗缝：切成 56 像素的小块，按重叠误差挑块、沿最小误差的路径缝起来，拼成没有字的整张皱膜；去掉原来的明暗只留褶皱，再用照片里量出的颜色打一道斜向反光；各向异性 Kuwahara 压成亮面色块，斜向轻拖',
        留下: '洋红的金属光泽、背光处转紫、零星的黑色碎片'
      },
      defaults: { bType: 'dir', bAng: 34.4, bLen: .012, mix: .15, kuwa: 2.5, kmix: .4, bloom: .45, bthr: .8, sat: 1.05, vig: .12 } },
    { id: 'moon', name: '月晕', line: '横拖 + 放射拖尾 · 冷光', aspect: .8,
      abs: { type: 'dir', ang: 0 },
      notes: {
        取样: '薄云里的满月（这张没有画圈，取月亮和四周的云）',
        算法: '两次曝光叠在一起：横向拖 80 像素，云变成一条条横带；从月亮往外放射拖尾 50 像素，拖出光晕。月亮留一点形，大半径泛光',
        留下: '冷白的光心、一圈圈暗下去的晕、云的层次'
      },
      defaults: { aType: 'dir', aAng: 0, aLen: .08, bType: 'zoom', bLen: .05, bTrail: 1, mix: .5, keep: .7,
        bloom: .7, bthr: .55, gamma: 1.05, grain: .01, vig: .12, flow: .06 } },
    { id: 'tower', name: '石塔', line: '像素拉伸 · 钴蓝 · 暖灰', aspect: .8,
      abs: { type: 'dir', ang: 90 },
      notes: {
        取样: '塔身一级级往外退的那段柱子',
        算法: '像素拉伸（slit-scan）：在柱子最宽的那一行取一条，竖着拉满整张；再用竖向拖过的塔身明暗给色带加上原来的光',
        留下: '柱子排成的序列，混凝土的暖灰对两边的钴蓝，底下暖灯的光'
      },
      defaults: { aType: 'dir', aAng: 90, aLen: .26, mix: 0, stretch: .8, spos: .922, sdir: 'v', bloom: .4, bthr: .75, sat: 1.08, vig: .1 } },
    { id: 'slush', name: '冰沙', line: 'Kuwahara · 弧向短拖 · 透橙', aspect: .8,
      abs: { type: 'spin', cx: 1.2, cy: -.3 },
      notes: {
        取样: '画圈的那块冰面',
        算法: '放大后用各向异性 Kuwahara（8 个扇区、半径 5）把冰粒压成有光泽的小块，再绕着杯心短拖一下，留出挖痕的弧',
        留下: '橙色从里往外透的光、奶白的高光、颗粒感'
      },
      defaults: { bType: 'spin', bCx: 1.2, bCy: -.3, bLen: .022, bTrail: 1, mix: .45, kuwa: 5, kmix: 1, bloom: .5, bthr: .8, sat: 1.05, vig: .1 } },
    { id: 'tundra', name: '苔原', line: '纹理迁移 · 倾斜的地层', aspect: .8,
      abs: { type: 'dir', ang: -10.3 },
      notes: {
        取样: '河边的苔藓、草坡和玄武岩',
        算法: '纹理迁移：先按参数画一张倾斜的地层构图，再从照片里挑草、苔、石头的小块把它拼出来（三轮，块从 48 像素缩到 22 像素），打上左上来的低角度阳光，最后顺着地层轻拖',
        留下: '土黄、橄榄、亮苔绿、炭黑，每一块都是照片里真的草和石头'
      },
      defaults: { bType: 'dir', bAng: -10.3, bLen: .024, mix: .3, bloom: .3, bthr: .82, sat: 1.08, grain: .009, vig: .12 } },
    { id: 'rainbow', name: '彩虹薄雾', line: '沿虹弧拖曳 · 粉彩', aspect: .8,
      abs: { type: 'spin', cx: .1, cy: 1.4 },
      notes: {
        取样: '雾里的那段彩虹和它后面的天',
        算法: '绕着虹心转着拖：长的一层 130 像素把虹拉成干净的光带，短的一层 40 像素留住雾的层次',
        留下: '粉彩的七色、灰蓝的天、没有硬边的雾'
      },
      defaults: { aType: 'spin', aCx: .1, aCy: 1.4, aLen: .13, bType: 'spin', bCx: .1, bCy: 1.4, bLen: .04, mix: .4,
        bloom: .4, bthr: .8, lift: .02, sat: 1.12, vig: .06, flow: .05 } },
    { id: 'mirror', name: '天水镜像', line: '横向拖曳曝光 · 倒影', aspect: .8,
      abs: { type: 'dir', ang: 0 },
      notes: {
        取样: '日落的天、地平线和水里的倒影',
        算法: '横向拖曳曝光：120 像素一层、36 像素一层叠起来',
        留下: '深蓝到淡紫到地平线的暖橙，倒过来偏冷的水'
      },
      defaults: { aType: 'dir', aAng: 0, aLen: .12, bType: 'dir', bAng: 0, bLen: .036, mix: .45, bloom: .5, bthr: .75, sat: 1.08, vig: .1, flow: .05 } },
    { id: 'spring', name: '冰泉', line: '图像绗缝 · 旋拖 · 乳蓝', aspect: .8,
      abs: { type: 'spin', cx: .55, cy: .5 },
      notes: {
        取样: '画圈的那潭乳蓝的水（避开红圈）',
        算法: '图像绗缝：只用水面的块拼成整张，没有岸也没有石头；再绕一个中心轻轻转着拖',
        留下: '乳白的水花、青绿的深处、水流的丝'
      },
      defaults: { bType: 'spin', bCx: .55, bCy: .5, bLen: .02, mix: .25, bloom: .25, bthr: .9, lift: -.01, gamma: .97, sat: 1.06, grain: .006, vig: .1, flow: .2 } },
    { id: 'glass', name: '毛玻璃', line: '九张纹理的竖条 · 宽窄不一', aspect: .8, ref: 'refs/glass-bg.jpg',
      abs: { type: 'dir', ang: 90 },
      notes: {
        取样: '另外九张纹理，各取中间一条竖条，宽窄不一地排开',
        算法: '九张纹理各截一条，按设计好的宽度排成一排；在工作台里可以把竖条拖开、揉成色块，或者只留竖条的节奏',
        留下: '九种质感排在一起的节奏'
      },
      defaults: { grain: 0, vig: 0 } }
  ];

  CARDS.forEach(function (c) {
    var d = {};
    Object.keys(BASE).forEach(function (k) { d[k] = BASE[k]; });
    Object.keys(c.defaults).forEach(function (k) { d[k] = c.defaults[k]; });
    // 月晕的放射中心：texture.py 从起点图里找到的月亮位置
    var t = window.TEXTURE_DATA && window.TEXTURE_DATA[c.id];
    if (c.id === 'moon' && t && t.center) { d.bCx = t.center[0]; d.bCy = t.center[1]; }
    c.defaults = d;
    c.data = t || null;
  });

  window.CARD_DATA = { list: CARDS, byId: function (id) { for (var i = 0; i < CARDS.length; i++) if (CARDS[i].id === id) return CARDS[i]; return null; } };
})();
