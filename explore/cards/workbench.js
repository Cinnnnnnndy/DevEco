/* 质感工作台：一张纹理的参数和它在不同场景里的样子。
   从 tex/base/<名字>.webp（texture.py 里可调步骤之前的那张）出发，把配方后面几步用 WebGL2 实时重做：
     A 拖曳   取景（缩放、平移、旋转）→ 两层拖曳曝光（平拖 / 绕圈 / 放射，长度、单向拖尾）→ 像素拉伸 → 留住原图亮处
     B 油画化 结构张量（Sobel → 两次高斯）→ 各向异性 Kuwahara（8 扇区、多项式权重），和 texture.py 同一个算法
     C 出图   每个场景一次：按场景比例裁、再抽象一层（沿主路径长拖 + 模糊）、流动、水雾、泛光、调色、按调色板渐变映射、
             横幅的变形（条带 / 镜像 / 渐隐 / 色块）、暗角、颗粒、压暗
   A、B 只在取景或拖曳参数变了才重算（拖滑块时先用半分辨率），C 很轻，每个场景各画一次；
   所有场景共用一个离屏 WebGL2 画布，画完用 drawImage 贴到各自的 2D 画布上。
   调色板在参数停下来 0.3 秒后，从一张 48 像素宽的小图里用 k-means（Lab，色度加权）重取；默认参数时用 texture.py 算好的。 */
(function () {
  'use strict';

  var D = window.CARD_DATA;
  if (!D) return;

  /* ================================================================ GLSL */
  var VERT = `#version 300 es
in vec2 a;out vec2 v_uv;
void main(){v_uv=vec2(a.x*.5+.5,.5-a.y*.5);gl_Position=vec4(a,0.,1.);}`;

  var HEAD = `#version 300 es
precision highp float;precision highp int;
in vec2 v_uv;out vec4 o;
float lum(vec3 c){return dot(c,vec3(.2126,.7152,.0722));}
float hash12(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}
`;

  // 路径：v 是按卡片算的 uv（y 朝下），t 按卡片高算；type 1 平拖（角度 ang），2 绕 c 转，3 从 c 放射
  var PATH = `
uniform float u_pasp;
vec2 iso(vec2 v){return vec2((v.x-.5)*u_pasp,v.y-.5);}
vec2 fromIso(vec2 p){return vec2(p.x/u_pasp+.5,p.y+.5);}
vec2 walk(vec2 v,float type,float ang,vec2 c,float t){
  if(type<1.5)return v+vec2(cos(ang)/u_pasp,sin(ang))*t;
  vec2 d=iso(v)-iso(c);float r=max(length(d),.02);
  if(type<2.5){float a=t/r,cs=cos(a),sn=sin(a);d=mat2(cs,sn,-sn,cs)*d;}
  else d*=max(1.+t/r,0.);
  return fromIso(d+iso(c));
}
`;

  // A 拖曳：取景 + 两层拖曳曝光 + 像素拉伸 + 留住原图亮处
  var PASS_A = HEAD + PATH + `
uniform sampler2D u_src;
uniform float u_zoom,u_rot;uniform vec2 u_pan;
uniform vec4 u_A,u_B,u_C;uniform vec2 u_lod;
uniform float u_mix,u_stretch,u_spos,u_sdir,u_keep;
vec3 S(vec2 v,float l){vec2 p=iso(v);float c=cos(u_rot),s=sin(u_rot);p=mat2(c,-s,s,c)*p/u_zoom-u_pan;return textureLod(u_src,fromIso(p),l).rgb;}
vec3 drag(vec2 v,vec4 L,vec2 c,float l){
  vec3 acc=S(v,0.);
  if(L.x<.5||L.z<.0005)return acc;
  float ws=1.;
  for(int i=1;i<=40;i++){
    float f=float(i)/40.,t=L.z*f,wf=mix(1.,exp(-2.*f),L.w),wb=1.-L.w;
    acc+=wf*S(walk(v,L.x,L.y,c,t),l);ws+=wf;
    if(wb>0.){acc+=wb*S(walk(v,L.x,L.y,c,-t),l);ws+=wb;}
  }
  return acc/ws;
}
vec3 layers(vec2 v){
  if(u_mix<=0.)return drag(v,u_A,u_C.xy,u_lod.x);
  if(u_mix>=1.)return drag(v,u_B,u_C.zw,u_lod.y);
  return mix(drag(v,u_A,u_C.xy,u_lod.x),drag(v,u_B,u_C.zw,u_lod.y),u_mix);
}
void main(){
  vec2 v=v_uv;vec3 col=layers(v);
  if(u_stretch>0.){
    vec3 st=vec3(0.);
    for(int i=-2;i<=2;i++){float d=float(i)*.004;st+=S(u_sdir<.5?vec2(v.x,u_spos+d):vec2(u_spos+d,v.y),0.);}
    st/=5.;
    col=mix(col,st*clamp(pow(lum(col)/max(lum(st),.03),.7),.6,1.4),u_stretch);
  }
  if(u_keep>0.){vec3 o0=S(v,1.);col=mix(col,o0,smoothstep(.55,.85,lum(o0))*u_keep);}
  o=vec4(col,1.);
}`;

  // B1 结构张量（Sobel，按像素取），B2 高斯（可分离），B3 各向异性 Kuwahara
  var PASS_TENSOR = HEAD + `
uniform sampler2D u_img;uniform ivec2 u_size;
vec3 T(ivec2 p){return texelFetch(u_img,clamp(p,ivec2(0),u_size-1),0).rgb;}
void main(){
  ivec2 p=ivec2(gl_FragCoord.xy);
  vec3 gx=(-T(p+ivec2(-1,-1))-2.*T(p+ivec2(-1,0))-T(p+ivec2(-1,1))+T(p+ivec2(1,-1))+2.*T(p+ivec2(1,0))+T(p+ivec2(1,1)))/8.;
  vec3 gy=(-T(p+ivec2(-1,-1))-2.*T(p+ivec2(0,-1))-T(p+ivec2(1,-1))+T(p+ivec2(-1,1))+2.*T(p+ivec2(0,1))+T(p+ivec2(1,1)))/8.;
  o=vec4(dot(gx,gx),dot(gx,gy),dot(gy,gy),1.)*u_scale.x+u_scale.y;
}`.replace('uniform ivec2 u_size;', 'uniform ivec2 u_size;uniform vec2 u_scale;');

  var PASS_BLUR = HEAD + `
uniform sampler2D u_img;uniform ivec2 u_size;uniform ivec2 u_dir;
void main(){
  ivec2 p=ivec2(gl_FragCoord.xy);vec4 s=vec4(0.);float ws=0.;
  for(int i=-6;i<=6;i++){float w=exp(-float(i*i)/8.);s+=w*texelFetch(u_img,clamp(p+u_dir*i,ivec2(0),u_size-1),0);ws+=w;}
  o=s/ws;
}`;

  var PASS_AKF = HEAD + `
uniform sampler2D u_img;uniform sampler2D u_st;uniform ivec2 u_size;uniform float u_rad,u_kmix;uniform vec2 u_scale;
void main(){
  ivec2 p=ivec2(gl_FragCoord.xy);
  vec3 g=(texelFetch(u_st,p,0).xyz-u_scale.y)/u_scale.x;
  float E=g.x,F=g.y,G=g.z,d=sqrt((E-G)*(E-G)+4.*F*F),l1=.5*(E+G+d),l2=.5*(E+G-d);
  vec2 t=vec2(l1-E,-F);float tl=length(t);t=tl>1e-9?t/tl:vec2(0.,1.);
  float A=l1+l2>1e-9?(l1-l2)/(l1+l2):0.;
  float a=u_rad*clamp(1.+A,.1,2.),b=u_rad*clamp(1./(1.+A),.1,2.),c_=t.x,s_=t.y;
  int mx=int(sqrt(a*a*c_*c_+b*b*s_*s_))+1,my=int(sqrt(a*a*s_*s_+b*b*c_*c_))+1;
  float zeta=2./u_rad,sz=sin(.58),eta=(zeta+cos(.58))/(sz*sz);
  vec3 m[8];vec3 q[8];float ws[8];float w[8];
  for(int k=0;k<8;k++){m[k]=vec3(0.);q[k]=vec3(0.);ws[k]=0.;}
  for(int dy=-my;dy<=my;dy++)for(int dx=-mx;dx<=mx;dx++){
    float vx=(c_*float(dx)+s_*float(dy))*.5/a,vy=(-s_*float(dx)+c_*float(dy))*.5/b,r2=vx*vx+vy*vy;
    if(r2>.25)continue;
    vec3 c=texelFetch(u_img,clamp(p+ivec2(dx,dy),ivec2(0),u_size-1),0).rgb;
    float vxx=zeta-eta*vx*vx,vyy=zeta-eta*vy*vy,z;
    z=max(0.,vy+vxx);w[0]=z*z;z=max(0.,-vx+vyy);w[2]=z*z;z=max(0.,-vy+vxx);w[4]=z*z;z=max(0.,vx+vyy);w[6]=z*z;
    float ux=.70710678*(vx-vy),uy=.70710678*(vx+vy);
    vxx=zeta-eta*ux*ux;vyy=zeta-eta*uy*uy;
    z=max(0.,uy+vxx);w[1]=z*z;z=max(0.,-ux+vyy);w[3]=z*z;z=max(0.,-uy+vxx);w[5]=z*z;z=max(0.,ux+vyy);w[7]=z*z;
    float tot=0.;for(int k=0;k<8;k++)tot+=w[k];
    float gg=exp(-3.125*r2)/max(tot,1e-9);
    for(int k=0;k<8;k++){float wk=w[k]*gg;m[k]+=c*wk;q[k]+=c*c*wk;ws[k]+=wk;}
  }
  vec3 oc=vec3(0.);float ot=0.;
  for(int k=0;k<8;k++){if(ws[k]<=0.)continue;vec3 mm=m[k]/ws[k];vec3 vv=abs(q[k]/ws[k]-mm*mm);
    float wk=1./(1.+pow(8000.*(vv.r+vv.g+vv.b),4.));oc+=mm*wk;ot+=wk;}
  vec3 orig=texelFetch(u_img,p,0).rgb;
  o=vec4(mix(orig,oc/max(ot,1e-6),u_kmix),1.);
}`;

  // C 出图
  var PASS_C = HEAD + PATH + `
uniform sampler2D u_m;uniform vec4 u_map;uniform float u_time,u_seed;
uniform float u_gain,u_lift,u_gamma,u_sat,u_warm,u_pal,u_steps;
uniform vec3 u_palc[6];uniform float u_pals[6];uniform float u_share[6];uniform vec4 u_lohi;
uniform float u_bloom,u_bthr,u_haze,u_grain,u_vig,u_dim;
uniform float u_abs;uniform vec4 u_absP;uniform vec2 u_absC;
uniform float u_flow;uniform vec4 u_flowP;uniform vec2 u_flowC;
uniform int u_var;uniform vec3 u_solid;uniform float u_col;uniform float u_pm;
vec3 M(vec2 v,float l){return textureLod(u_m,vec2(v.x,1.-v.y),l).rgb;}
vec2 MAP(vec2 uv){return u_map.xy+uv*u_map.zw;}
vec3 glow(vec2 m){return M(m,3.)*.3+M(m,4.5)*.4+M(m,6.)*.3;}
// 返回颜色；g 是泛光用的那层大半径模糊，沿同一条路径取
vec3 abstracted(vec2 m,out vec3 g){
  if(u_abs<=0.){g=glow(m);return M(m,0.);}
  float L=u_abs*.35,H=float(textureSize(u_m,0).y),l=log2(max(L*H/24.,1.))+.25,lg=max(l+1.,4.5);
  vec3 acc=M(m,l);g=M(m,lg);float ws=1.;
  for(int i=1;i<=24;i++){float t=L*float(i)/24.;vec2 a=walk(m,u_absP.x,u_absP.y,u_absC,t),b=walk(m,u_absP.x,u_absP.y,u_absC,-t);
    acc+=M(a,l)+M(b,l);g+=M(a,lg)+M(b,lg);ws+=2.;}
  g/=ws;return acc/ws;
}
vec3 flowed(vec2 m,out vec3 g){
  if(u_flow<=0.)return abstracted(m,g);
  float t=u_time*u_flow,p0=fract(t),p1=fract(t+.5),k=abs(p0*2.-1.);vec3 g0,g1;
  vec3 a=abstracted(walk(m,u_flowP.x,u_flowP.y,u_flowC,-.05*p0),g0),b=abstracted(walk(m,u_flowP.x,u_flowP.y,u_flowC,-.05*p1),g1);
  g=mix(g0,g1,k);return mix(a,b,k);
}
vec3 palmap(float t){
  vec3 c=u_palc[0];
  for(int i=1;i<6;i++)c=mix(c,u_palc[i],clamp((t-u_pals[i-1])/max(u_pals[i]-u_pals[i-1],1e-4),0.,1.));
  return c;
}
vec3 grade(vec3 c){
  vec3 x=pow(max(c*u_gain+u_lift*(1.-c),0.),vec3(1./u_gamma));
  x*=vec3(1.+.08*u_warm,1.,1.-.08*u_warm);
  float l=lum(x);return l+(x-l)*u_sat;
}
void main(){
  vec2 uv=v_uv,u2=uv;
  if(u_var==1)u2.x=u_col;
  if(u_var==2)u2.x=abs(uv.x*2.-1.);
  vec2 m=MAP(u2);vec3 g,g2;
  vec3 col=flowed(m,g);
  if(u_var==1){col=mix(col,flowed(MAP(uv),g2),.12);g=mix(g,g2,.12);}
  if(u_haze>0.)col=mix(col,M(m,5.)*1.08+.06,smoothstep(.5,1.05,m.y)*u_haze);
  if(u_bloom>0.)col+=u_bloom*max(g-u_bthr,0.)/(1.-u_bthr);
  col=grade(col);
  float s=max(u_pal,u_abs)*u_pm;
  if(s>0.){
    float lo=mix(u_lohi.x,u_lohi.z,u_abs),hi=mix(u_lohi.y,u_lohi.w,u_abs);
    float t=clamp((lum(col)-lo)/max(hi-lo,1e-3),0.,1.);
    if(u_steps>1.5)t=(floor(t*u_steps*.9999)+.5)/u_steps;
    col=mix(col,.85*palmap(t)+.15*col,s);
  }
  if(u_var==3)col=mix(u_solid,col,smoothstep(.3,.72,uv.x));
  if(u_var==4){
    vec3 bl=u_palc[0];float acc=0.;
    for(int i=0;i<5;i++){acc+=u_share[i];bl=mix(bl,u_palc[i+1],smoothstep(acc-.012,acc+.012,uv.x));}
    col=mix(bl,bl*(.78+.44*lum(col)),.5);
  }
  col*=1.-u_vig*smoothstep(.25,.95,length((uv-.5)*vec2(1.,.9)));
  col+=u_grain*(hash12(gl_FragCoord.xy+u_seed)-.5)*3.4;
  col*=1.-u_dim;
  o=vec4(col+(hash12(gl_FragCoord.yx*1.37+u_seed)-.5)/255.,1.);
}`;

  /* ================================================================ 参数面板的定义 */
  var TYPES = [['off', '关'], ['dir', '平拖'], ['spin', '绕圈'], ['zoom', '放射']];
  function layer(pfx, title) {
    return { title: title, items: [
      { k: pfx + 'Type', label: '路径', seg: TYPES },
      { k: pfx + 'Ang', label: '方向', min: -180, max: 180, step: 1, unit: '°', show: function (p) { return p[pfx + 'Type'] === 'dir'; } },
      { k: pfx + 'Cx', label: '中心 · 左右', min: -1, max: 2, step: .01, show: function (p) { return p[pfx + 'Type'] === 'spin' || p[pfx + 'Type'] === 'zoom'; } },
      { k: pfx + 'Cy', label: '中心 · 上下', min: -1, max: 2, step: .01, show: function (p) { return p[pfx + 'Type'] === 'spin' || p[pfx + 'Type'] === 'zoom'; } },
      { k: pfx + 'Len', label: '长度', min: 0, max: .5, step: .002, show: function (p) { return p[pfx + 'Type'] !== 'off'; } },
      { k: pfx + 'Trail', label: '单向拖尾', min: 0, max: 1, step: .01, show: function (p) { return p[pfx + 'Type'] !== 'off'; } }
    ] };
  }
  var GROUPS = [
    { title: '抽象度', hint: '沿这张纹理的主路径再拖一长刀、糊一层，按调色板上色；1 就是色卡页上那张', items: [
      { k: 'abs', label: '主图', min: 0, max: 1, step: .01 }] },
    { title: '取景', items: [
      { k: 'zoom', label: '缩放', min: .5, max: 3, step: .01, unit: '×' },
      { k: 'panx', label: '左右', min: -.6, max: .6, step: .005 },
      { k: 'pany', label: '上下', min: -.6, max: .6, step: .005 },
      { k: 'rot', label: '旋转', min: -180, max: 180, step: 1, unit: '°' }] },
    layer('a', '拖曳曝光 · 第一层'),
    (function () { var g = layer('b', '拖曳曝光 · 第二层'); g.items.push({ k: 'mix', label: '第二层占比', min: 0, max: 1, step: .01 }); return g; })(),
    { title: '像素拉伸', hint: '取一行（或一列）拉满，只留下横向（或竖向）的序列', items: [
      { k: 'stretch', label: '强度', min: 0, max: 1, step: .01 },
      { k: 'spos', label: '取样位置', min: 0, max: 1, step: .002 },
      { k: 'sdir', label: '拉伸方向', seg: [['v', '竖着拉'], ['h', '横着拉']] }] },
    { title: '油画化', hint: '各向异性 Kuwahara：按纹理走向压成色块', items: [
      { k: 'kuwa', label: '半径', min: 0, max: 8, step: .5, unit: 'px' },
      { k: 'kmix', label: '占比', min: 0, max: 1, step: .01 },
      { k: 'keep', label: '留住原图亮处', min: 0, max: 1, step: .01 }] },
    { title: '颜色', items: [
      { k: 'gain', label: '曝光', min: .5, max: 1.8, step: .01, unit: '×' },
      { k: 'lift', label: '提亮暗部', min: -.1, max: .3, step: .005 },
      { k: 'gamma', label: '中间调', min: .6, max: 1.6, step: .01 },
      { k: 'sat', label: '饱和', min: 0, max: 2, step: .01 },
      { k: 'warm', label: '冷 ↔ 暖', min: -1, max: 1, step: .01 },
      { k: 'pal', label: '色卡化', min: 0, max: 1, step: .01 },
      { k: 'steps', label: '色阶（0 为平滑）', min: 0, max: 10, step: 1 }] },
    { title: '光', items: [
      { k: 'bloom', label: '泛光', min: 0, max: 1.5, step: .01 },
      { k: 'bthr', label: '泛光阈值', min: .3, max: .98, step: .01 },
      { k: 'haze', label: '底部水雾', min: 0, max: 1, step: .01 },
      { k: 'grain', label: '颗粒', min: 0, max: .05, step: .001 },
      { k: 'vig', label: '暗角', min: 0, max: .5, step: .01 }] },
    { title: '流动', hint: '只在主图上：顺着第一层的路径慢慢流', items: [
      { k: 'flow', label: '速度', min: 0, max: 1, step: .01 }] }
  ];
  var SCENE_CTL = {
    wp: [{ k: 'wpAbs', label: '再抽象', min: 0, max: 1, step: .01 }, { k: 'wpDim', label: '压暗', min: 0, max: .6, step: .01 }, { k: 'wpPos', label: '取景', min: 0, max: 1, step: .01 }],
    bn: [{ k: 'bnAbs', label: '再抽象', min: 0, max: 1, step: .01 }, { k: 'bnPos', label: '取景', min: 0, max: 1, step: .01 }, { k: 'bnCol', label: '条带取样', min: 0, max: 1, step: .01 }]
  };
  // 变了要重算 A、B 的参数；其余只重画各个场景
  var MASTER = ['zoom', 'panx', 'pany', 'rot', 'aType', 'aAng', 'aCx', 'aCy', 'aLen', 'aTrail', 'bType', 'bAng', 'bCx', 'bCy', 'bLen', 'bTrail',
    'mix', 'stretch', 'spos', 'sdir', 'keep', 'kuwa', 'kmix'];
  var EXTRA = { wpPos: .5, bnPos: .5, bnCol: .5 };

  /* ================================================================ WebGL2 */
  var glc = document.createElement('canvas');
  var gl = glc.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, preserveDrawingBuffer: true });
  var floatRT = !!(gl && gl.getExtension('EXT_color_buffer_float'));

  function shader(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  function program(src) {
    var p = gl.createProgram();
    gl.attachShader(p, shader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(p, shader(gl.FRAGMENT_SHADER, src));
    gl.bindAttribLocation(p, 0, 'a');
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    var u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < n; i++) { var nm = gl.getActiveUniform(p, i).name.replace('[0]', ''); u[nm] = gl.getUniformLocation(p, nm); }
    return { p: p, u: u };
  }
  function tex(w, h, fmt) {
    var t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    if (fmt === 'f16') gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
    else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, fmt === 'mip' ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    var f = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    return { t: t, f: f, w: w, h: h };
  }
  function freeTex(x) { if (x) { gl.deleteTexture(x.t); gl.deleteFramebuffer(x.f); } }

  var P = {};           // 程序
  var R = {};           // 渲染目标
  var src = null;       // 起点图贴图
  function initGL() {
    P.a = program(PASS_A); P.st = program(PASS_TENSOR); P.bl = program(PASS_BLUR); P.akf = program(PASS_AKF); P.c = program(PASS_C);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  }
  function use(prog, target, w, h) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.f : null);
    gl.viewport(0, 0, w, h);
    gl.useProgram(prog.p);
    return prog.u;
  }
  function bindTex(unit, t) { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t); }
  function draw() { gl.drawArrays(gl.TRIANGLES, 0, 3); }
  var TYPE_ID = { off: 0, dir: 1, spin: 2, zoom: 3 };
  function rad(d) { return d * Math.PI / 180; }

  /* ---------------- A + B：母图 ---------------- */
  var masterScale = 1, master = null;
  function renderMaster(p, scale) {
    var w = Math.max(64, Math.round(card.w * scale)), h = Math.max(64, Math.round(card.h * scale));
    if (!R.m1 || R.m1.w !== w || R.m1.h !== h) {
      ['m1', 'm2', 't1', 't2'].forEach(function (k) { freeTex(R[k]); });
      R.m1 = tex(w, h, 'mip'); R.m2 = tex(w, h, 'mip');
      R.t1 = tex(w, h, floatRT ? 'f16' : '8'); R.t2 = tex(w, h, floatRT ? 'f16' : '8');
    }
    var u = use(P.a, R.m1, w, h);
    bindTex(0, src.t); gl.uniform1i(u.u_src, 0);
    gl.uniform1f(u.u_pasp, card.aspect);
    gl.uniform1f(u.u_zoom, p.zoom); gl.uniform1f(u.u_rot, rad(p.rot)); gl.uniform2f(u.u_pan, p.panx, p.pany);
    gl.uniform4f(u.u_A, TYPE_ID[p.aType], rad(p.aAng), p.aLen, p.aTrail);
    gl.uniform4f(u.u_B, TYPE_ID[p.bType], rad(p.bAng), p.bLen, p.bTrail);
    gl.uniform4f(u.u_C, p.aCx, p.aCy, p.bCx, p.bCy);
    var lod = function (L) { return Math.max(0, Math.log2(Math.max(L * src.h / 40, 1)) - .5); };
    gl.uniform2f(u.u_lod, lod(p.aLen), lod(p.bLen));
    gl.uniform1f(u.u_mix, p.aType === 'off' && p.bType !== 'off' ? p.mix : (p.bType === 'off' ? 0 : p.mix));
    gl.uniform1f(u.u_stretch, p.stretch); gl.uniform1f(u.u_spos, p.spos); gl.uniform1f(u.u_sdir, p.sdir === 'v' ? 0 : 1);
    gl.uniform1f(u.u_keep, p.keep);
    draw();
    bindTex(0, R.m1.t); gl.generateMipmap(gl.TEXTURE_2D);
    master = R.m1;
    if (p.kuwa > .25 && p.kmix > 0) {
      // 张量值很小，8 位时放大再存
      var sc = floatRT ? [1, 0] : [8, .5];
      u = use(P.st, R.t1, w, h); bindTex(0, R.m1.t); gl.uniform1i(u.u_img, 0); gl.uniform2i(u.u_size, w, h); gl.uniform2f(u.u_scale, sc[0], sc[1]); draw();
      u = use(P.bl, R.t2, w, h); bindTex(0, R.t1.t); gl.uniform1i(u.u_img, 0); gl.uniform2i(u.u_size, w, h); gl.uniform2i(u.u_dir, 1, 0); draw();
      u = use(P.bl, R.t1, w, h); bindTex(0, R.t2.t); gl.uniform1i(u.u_img, 0); gl.uniform2i(u.u_size, w, h); gl.uniform2i(u.u_dir, 0, 1); draw();
      u = use(P.akf, R.m2, w, h); bindTex(0, R.m1.t); bindTex(1, R.t1.t); gl.activeTexture(gl.TEXTURE0);
      gl.uniform1i(u.u_img, 0); gl.uniform1i(u.u_st, 1); gl.uniform2i(u.u_size, w, h);
      gl.uniform1f(u.u_rad, p.kuwa * scale); gl.uniform1f(u.u_kmix, p.kmix); gl.uniform2f(u.u_scale, sc[0], sc[1]);
      draw();
      master = R.m2;
      bindTex(0, master.t); gl.generateMipmap(gl.TEXTURE_2D);
    }
    masterScale = scale;
  }

  /* ---------------- C：一个场景 ---------------- */
  var pal = null;   // { colors: [[r,g,b]...] 按亮度, stops, share, lohi }
  function coverMap(outAsp, pos) {
    var a = card.aspect;
    pos = pos == null ? .5 : pos;
    if (outAsp > a) { var hh = a / outAsp; return [0, (1 - hh) * pos, 1, hh]; }
    var ww = outAsp / a; return [(1 - ww) * pos, 0, ww, 1];
  }
  function renderOut(w, h, o) {
    var p = state;
    if (glc.width < w || glc.height < h) { glc.width = Math.max(glc.width, w); glc.height = Math.max(glc.height, h); }
    var u = use(P.c, null, w, h);
    if (o.vx) gl.viewport(o.vx, 0, w, h);   // 量字色时几张小图并排画
    bindTex(0, master.t); gl.uniform1i(u.u_m, 0);
    gl.uniform1f(u.u_pasp, card.aspect);
    var mp = o.map || coverMap(w / h, o.pos);
    gl.uniform4f(u.u_map, mp[0], mp[1], mp[2], mp[3]);
    gl.uniform1f(u.u_time, o.time || 0); gl.uniform1f(u.u_seed, o.seed || 0);
    gl.uniform1f(u.u_gain, p.gain); gl.uniform1f(u.u_lift, p.lift); gl.uniform1f(u.u_gamma, p.gamma); gl.uniform1f(u.u_sat, p.sat); gl.uniform1f(u.u_warm, p.warm);
    gl.uniform1f(u.u_pal, o.pal != null ? o.pal : p.pal); gl.uniform1f(u.u_steps, p.steps);
    gl.uniform3fv(u.u_palc, pal.flat); gl.uniform1fv(u.u_pals, pal.stops); gl.uniform1fv(u.u_share, pal.share);
    gl.uniform4f(u.u_lohi, pal.lohi[0], pal.lohi[1], pal.lohi[2], pal.lohi[3]);
    gl.uniform1f(u.u_bloom, o.plain ? 0 : p.bloom); gl.uniform1f(u.u_bthr, p.bthr); gl.uniform1f(u.u_haze, p.haze);
    gl.uniform1f(u.u_grain, o.plain ? 0 : p.grain); gl.uniform1f(u.u_vig, o.plain ? 0 : p.vig); gl.uniform1f(u.u_dim, o.dim || 0);
    var ab = card.abs;
    gl.uniform1f(u.u_abs, o.abs || 0);
    gl.uniform4f(u.u_absP, TYPE_ID[ab.type], rad(ab.ang || 0), 0, 0); gl.uniform2f(u.u_absC, ab.cx == null ? .5 : ab.cx, ab.cy == null ? .5 : ab.cy);
    var fl = p.aType !== 'off' ? 'a' : 'b';
    gl.uniform1f(u.u_flow, o.flow || 0);
    gl.uniform4f(u.u_flowP, TYPE_ID[p[fl + 'Type']] || 1, rad(p[fl + 'Ang']), 0, 0); gl.uniform2f(u.u_flowC, p[fl + 'Cx'], p[fl + 'Cy']);
    gl.uniform1i(u.u_var, o.variant || 0);
    gl.uniform3fv(u.u_solid, o.solid || [0, 0, 0]); gl.uniform1f(u.u_col, o.col == null ? .5 : o.col);
    gl.uniform1f(u.u_pm, o.nomap ? 0 : 1);
    draw();
  }
  // 画到 2D 画布上（WebGL 的原点在左下，画的那块在离屏画布的底部）
  function blit(canvas, w, h) {
    var c = canvas.getContext('2d');
    c.drawImage(glc, 0, glc.height - h, w, h, 0, 0, w, h);
    if (!canvas.parentNode.classList.contains('drawn')) canvas.parentNode.classList.add('drawn');
  }
  function sizeOf(canvas, cap) {
    var dpr = Math.min(window.devicePixelRatio || 1, cap || 2);
    var w = Math.max(2, Math.round(canvas.clientWidth * dpr)), h = Math.max(2, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    return [w, h];
  }

  /* ---------------- 调色板：k-means（Lab，色度加权），按亮度排 ---------------- */
  function lin(c) { return c <= .04045 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4); }
  function toLab(r, g, b) {
    r = lin(r); g = lin(g); b = lin(b);
    var x = (r * .4124 + g * .3576 + b * .1805) / .95047, y = r * .2126 + g * .7152 + b * .0722, z = (r * .0193 + g * .1192 + b * .9505) / 1.08883;
    var f = function (t) { return t > .008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116; };
    var fx = f(x), fy = f(y), fz = f(z);
    return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
  }
  function luma(c) { return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; }
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function kmeans(px, k) {
    var n = px.length, cw = 1.8, feats = px.map(function (c) { var l = toLab(c[0], c[1], c[2]); return [l[0], l[1] * cw, l[2] * cw]; });
    var rnd = rng(7), cent = [feats[Math.floor(rnd() * n)].slice()];
    var d2 = function (a, b) { var x = a[0] - b[0], y = a[1] - b[1], z = a[2] - b[2]; return x * x + y * y + z * z; };
    while (cent.length < k) {   // k-means++
      var ds = feats.map(function (f) { var m = Infinity; cent.forEach(function (c) { m = Math.min(m, d2(f, c)); }); return m; });
      var tot = ds.reduce(function (s, v) { return s + v; }, 0), r = rnd() * tot, i = 0;
      while (r > ds[i] && i < n - 1) { r -= ds[i]; i++; }
      cent.push(feats[i].slice());
    }
    var lab = new Array(n);
    for (var it = 0; it < 25; it++) {
      var sum = cent.map(function () { return [0, 0, 0, 0]; }), rs = cent.map(function () { return [0, 0, 0]; });
      for (var j = 0; j < n; j++) {
        var best = 0, bd = Infinity;
        for (var c = 0; c < k; c++) { var dd = d2(feats[j], cent[c]); if (dd < bd) { bd = dd; best = c; } }
        lab[j] = best; var s = sum[best]; s[0] += feats[j][0]; s[1] += feats[j][1]; s[2] += feats[j][2]; s[3]++;
        rs[best][0] += px[j][0]; rs[best][1] += px[j][1]; rs[best][2] += px[j][2];
      }
      cent = cent.map(function (c, ci) { var s = sum[ci]; return s[3] ? [s[0] / s[3], s[1] / s[3], s[2] / s[3]] : c; });
    }
    var out = cent.map(function (c, ci) { var s = sum[ci]; return { rgb: s[3] ? [rs[ci][0] / s[3], rs[ci][1] / s[3], rs[ci][2] / s[3]] : [0, 0, 0], share: s[3] / n, L: c[0] }; });
    return out.filter(function (o) { return o.share > 0; });
  }
  function hexToRgb(h) { return [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255]; }
  function rgbToHex(c) { return '#' + c.map(function (v) { return ('0' + Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16)).slice(-2); }).join('').toUpperCase(); }
  function setPalette(colors, shares, lohi) {
    var items = colors.map(function (c, i) { return { rgb: c, share: shares[i] }; });
    items.sort(function (a, b) { return luma(a.rgb) - luma(b.rgb); });
    while (items.length < 6) items.push(items[items.length - 1]);
    var l0 = luma(items[0].rgb), l1 = luma(items[5].rgb);
    pal = {
      items: items,
      flat: new Float32Array([].concat.apply([], items.map(function (i) { return i.rgb; }))),
      stops: new Float32Array(items.map(function (i) { return (luma(i.rgb) - l0) / Math.max(l1 - l0, 1e-3); })),
      share: new Float32Array(items.map(function (i) { return i.share; })),
      lohi: lohi
    };
    showPalette();
  }
  function readSmall(o) {
    var w = 48, h = Math.max(8, Math.round(48 / card.aspect));
    renderOut(w, h, o);
    var buf = new Uint8Array(w * h * 4);
    gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, buf);
    var px = [];
    for (var i = 0; i < w * h; i++) px.push([buf[i * 4] / 255, buf[i * 4 + 1] / 255, buf[i * 4 + 2] / 255]);
    return px;
  }
  function pct(arr, q) { var s = arr.slice().sort(function (a, b) { return a - b; }); return s[Math.min(s.length - 1, Math.floor(q * s.length))]; }
  function extractPalette() {
    var px0 = readSmall({ abs: 0, pal: 0, plain: true, map: [0, 0, 1, 1] });
    var px1 = readSmall({ abs: 1, pal: 0, plain: true, nomap: true, map: [0, 0, 1, 1] });
    var km = kmeans(px0, 6);
    var l0 = px0.map(luma), l1 = px1.map(luma);
    setPalette(km.map(function (k) { return k.rgb; }), km.map(function (k) { return k.share; }), [pct(l0, .02), pct(l0, .98), pct(l1, .02), pct(l1, .98)]);
  }

  /* ================================================================ 页面 */
  var $ = function (id) { return document.getElementById(id); };
  var card = null, state = null, baseImg = null;
  var dirtyMaster = true, dirtyOut = true, interacting = false, palTimer = 0, atDefaults = true;

  function stored(id) { try { var s = localStorage.getItem('texture-wb:' + id); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
  function store() { try { localStorage.setItem('texture-wb:' + card.id, JSON.stringify(state)); } catch (e) { /* 存不了就算了 */ } }
  function fresh() { var s = {}; Object.keys(card.defaults).forEach(function (k) { s[k] = card.defaults[k]; }); Object.keys(EXTRA).forEach(function (k) { s[k] = EXTRA[k]; }); return s; }

  function fmt(it, v) {
    if (it.seg) return '';
    var d = it.step >= 1 ? 0 : it.step >= .1 ? 1 : it.step >= .01 ? 2 : 3;
    return (+v).toFixed(d) + (it.unit || '');
  }
  function control(it, host) {
    var row = document.createElement('div');
    row.className = 'ctl' + (it.seg ? ' seg-row' : '');
    row.dataset.k = it.k;
    var id = 'p-' + it.k;
    if (it.seg) {
      var lab = document.createElement('span'); lab.className = 'lab'; lab.id = id + '-l'; lab.textContent = it.label; row.appendChild(lab);
      var seg = document.createElement('div'); seg.className = 'seg'; seg.setAttribute('role', 'radiogroup'); seg.setAttribute('aria-labelledby', id + '-l');
      it.seg.forEach(function (o) {
        var b = document.createElement('button'); b.type = 'button'; b.id = id + '-' + o[0]; b.setAttribute('role', 'radio'); b.dataset.v = o[0]; b.textContent = o[1];
        b.addEventListener('click', function () { set(it.k, o[0]); });
        seg.appendChild(b);
      });
      row.appendChild(seg);
    } else {
      var l = document.createElement('label'); l.className = 'lab'; l.htmlFor = id; l.textContent = it.label; row.appendChild(l);
      var out = document.createElement('output'); out.className = 'val'; out.id = id + '-v'; out.htmlFor = id; row.appendChild(out);
      var r = document.createElement('input'); r.type = 'range'; r.id = id; r.min = it.min; r.max = it.max; r.step = it.step;
      r.addEventListener('input', function () { set(it.k, parseFloat(r.value), true); });
      r.addEventListener('change', function () { interacting = false; dirtyMaster = dirtyMaster || MASTER.indexOf(it.k) >= 0; schedulePalette(); });
      r.addEventListener('pointerdown', function () { interacting = true; });
      row.appendChild(r);
    }
    row._it = it;
    host.appendChild(row);
  }
  function buildPanel() {
    var panel = $('panel');
    var narrow = window.matchMedia && matchMedia('(max-width: 859px)').matches;
    GROUPS.forEach(function (g, gi) {
      var sec = document.createElement('details'); sec.className = 'grp' + (gi === 0 ? ' key' : '');
      sec.open = !narrow || gi < 2;
      var sum = document.createElement('summary'), h = document.createElement('h2'); h.textContent = g.title; sum.appendChild(h); sec.appendChild(sum);
      if (g.hint) { var p = document.createElement('p'); p.className = 'hint'; p.textContent = g.hint; sec.appendChild(p); }
      var box = document.createElement('div'); box.className = 'ctls';
      g.items.forEach(function (it) { control(it, box); });
      sec.appendChild(box);
      panel.appendChild(sec);
    });
    SCENE_CTL.wp.forEach(function (it) { control(it, $('ctl-wp')); });
    SCENE_CTL.bn.forEach(function (it) { control(it, $('ctl-bn')); });
  }
  function syncPanel() {
    Array.prototype.forEach.call(document.querySelectorAll('.ctl'), function (row) {
      var it = row._it, v = state[it.k];
      row.hidden = it.show ? !it.show(state) : false;
      if (it.seg) {
        Array.prototype.forEach.call(row.querySelectorAll('button'), function (b) { b.setAttribute('aria-checked', String(b.dataset.v === v)); });
      } else {
        var r = row.querySelector('input'); if (+r.value !== +v) r.value = v;
        row.querySelector('output').textContent = fmt(it, v);
      }
    });
  }
  function set(k, v, fromRange) {
    state[k] = v; atDefaults = false;
    if (MASTER.indexOf(k) >= 0) dirtyMaster = true;
    dirtyOut = true;
    if (!fromRange) { syncPanel(); schedulePalette(); } else {
      var row = document.querySelector('.ctl[data-k="' + k + '"]');
      if (row) row.querySelector('output').textContent = fmt(row._it, v);
      if (k.slice(1) === 'Type') syncPanel();
    }
    store();
  }
  function schedulePalette() {
    clearTimeout(palTimer);
    palTimer = setTimeout(function () { if (!atDefaults) { needPalette = true; dirtyOut = true; } }, 300);
  }
  var needPalette = false;

  function showPalette() {
    var bar = $('bar'), list = $('hexes');
    bar.innerHTML = ''; list.innerHTML = '';
    var seen = {};
    pal.items.forEach(function (it, i) {
      var hx = rgbToHex(it.rgb);
      if (seen[hx + i] || (i > 0 && pal.items[i - 1] === it)) return;
      seen[hx + i] = 1;
      var s = document.createElement('i'); s.style.background = hx; s.style.flexGrow = Math.max(it.share, .01); bar.appendChild(s);
      var li = document.createElement('li');
      li.innerHTML = '<i style="background:' + hx + '"></i><code>' + hx + '</code><span>' + Math.round(it.share * 100) + '%</span>';
      list.appendChild(li);
    });
    // 渐隐横幅的纯色：最暗的那个颜色够暗就用它，不然用最亮的；字色跟着它
    var dark = pal.items[0].rgb, light = pal.items[5].rgb;
    solid = luma(dark) < .28 ? dark : light;
    document.documentElement.style.setProperty('--bn-solid-ink', luma(solid) < .5 ? '#FFFFFF' : '#15171A');
    inks();
    // 手机桌面图标的颜色轮流取调色板里的六个颜色；浅色图标上的线条换成深色
    var order = [1, 4, 2, 5, 3, 0];
    Array.prototype.forEach.call(document.querySelectorAll('.app i'), function (el, i) {
      var c = pal.items[order[i % 6]].rgb;
      el.style.setProperty('--tint', rgbToHex(c));
      el.style.color = luma(c) > .62 ? '#1B1C1F' : '#FFFFFF';
    });
  }
  var solid = [0, 0, 0];
  // 场景里的字和玻璃：按调色板的平均明暗（壁纸再算上压暗）选白字暗玻璃或者深字亮玻璃
  function inks() {
    if (!pal || !state) return;
    var avg = 0, tot = 0;
    pal.items.forEach(function (it, i) { if (i > 0 && pal.items[i - 1] === it) return; avg += it.share * luma(it.rgb); tot += it.share; });
    avg /= Math.max(tot, 1e-6);
    var root = document.documentElement.style;
    var light = function (pfx, on) {
      root.setProperty('--' + pfx + '-ink', on ? '#15171A' : '#FFFFFF');
      root.setProperty('--' + pfx + '-ink2', on ? 'rgb(21 23 26 / .68)' : 'rgb(255 255 255 / .74)');
      root.setProperty('--' + pfx + '-glass', on ? 'rgb(255 255 255 / .34)' : 'rgb(255 255 255 / .16)');
      root.setProperty('--' + pfx + '-edge', on ? 'rgb(255 255 255 / .7)' : 'rgb(255 255 255 / .34)');
    };
    light('scene', avg > .58);
    root.setProperty('--wp-ink', avg * (1 - state.wpDim) > .58 ? '#15171A' : '#FFFFFF');
  }
  function inkVars(el, on) {
    el.style.setProperty('--scene-ink', on ? '#15171A' : '#FFFFFF');
    el.style.setProperty('--scene-ink2', on ? 'rgb(21 23 26 / .68)' : 'rgb(255 255 255 / .74)');
    el.style.setProperty('--scene-glass', on ? 'rgb(255 255 255 / .34)' : 'rgb(255 255 255 / .16)');
    el.style.setProperty('--scene-edge', on ? 'rgb(255 255 255 / .7)' : 'rgb(255 255 255 / .34)');
  }
  // 按调色板猜字色不够：条带可能正好穿过月亮。每个场景画一张很小的，读回来量字底下那一块有多亮
  // box 是字所在的那块（x0, y0, x1, y1，y 朝下）；apply 拿到亮度去改对应元素的字色
  var PROBES = [
    { asp: 3, box: [.04, .2, .5, .8], o: function () { return { abs: state.bnAbs, pos: state.bnPos, variant: 1, col: state.bnCol, solid: solid }; },
      apply: function (l) { inkVars(document.querySelector('#c-bn1 + .bn-copy'), l > .62); } },
    { asp: 3, box: [.3, .22, .7, .82], o: function () { return { abs: state.bnAbs, pos: state.bnPos, variant: 2 }; },
      apply: function (l) { inkVars(document.querySelector('#c-bn2 + .bn-copy'), l > .56); } },
    { asp: 3, box: [.03, .55, .45, .95], o: function () { return { abs: Math.max(state.bnAbs, .5), pos: state.bnPos, variant: 4 }; },
      apply: function (l) { inkVars(document.querySelector('#c-bn4 + .bn-copy'), l > .56); } },
    { asp: 9 / 19.5, box: [.1, .06, .9, .3], o: function () { return { abs: state.wpAbs, dim: state.wpDim, pos: state.wpPos }; },
      apply: function (l) { document.documentElement.style.setProperty('--wp-ink', l > .58 ? '#15171A' : '#FFFFFF'); } },
    { asp: 9 / 19.5, box: [.04, .55, .96, .95], o: function () { return { abs: state.wpAbs, dim: state.wpDim + .03, pos: state.wpPos }; },
      apply: function (l) { Array.prototype.forEach.call(document.querySelectorAll('.screen'), function (el) { inkVars(el, l > .62); }); } }
  ];
  function measureInks() {
    var sizes = PROBES.map(function (pr) { var h = 12, w = Math.round(h * pr.asp); if (w < 12) { w = 12; h = Math.round(w / pr.asp); } return [w, h]; });
    var tw = 0, th = 0;
    sizes.forEach(function (sz) { tw += sz[0]; th = Math.max(th, sz[1]); });
    if (glc.width < tw || glc.height < th) { glc.width = Math.max(glc.width, tw); glc.height = Math.max(glc.height, th); }
    var x = 0;
    PROBES.forEach(function (pr, i) { var o = pr.o(); o.vx = x; o.plain = false; renderOut(sizes[i][0], sizes[i][1], o); x += sizes[i][0]; });
    var buf = new Uint8Array(tw * th * 4);
    gl.readPixels(0, 0, tw, th, gl.RGBA, gl.UNSIGNED_BYTE, buf);
    x = 0;
    PROBES.forEach(function (pr, i) {
      var w = sizes[i][0], h = sizes[i][1], b = pr.box, sum = 0, n = 0;
      for (var yy = Math.floor(b[1] * h); yy < Math.ceil(b[3] * h); yy++) {
        var r = h - 1 - yy;   // readPixels 从下往上
        for (var xx = Math.floor(b[0] * w); xx < Math.ceil(b[2] * w); xx++) {
          var k = (r * tw + x + xx) * 4; sum += (.2126 * buf[k] + .7152 * buf[k + 1] + .0722 * buf[k + 2]) / 255; n++;
        }
      }
      pr.apply(sum / Math.max(n, 1));
      x += w;
    });
  }

  function stepsText() {
    var s = state, a = [];
    var nm = { dir: '平拖', spin: '绕圈拖', zoom: '放射拖' };
    if (s.aType !== 'off' && s.aLen > 0) a.push(nm[s.aType] + ' ' + Math.round(s.aLen * 1000));
    if (s.bType !== 'off' && s.bLen > 0) a.push(nm[s.bType] + ' ' + Math.round(s.bLen * 1000) + (s.bTrail > .5 ? '（拖尾）' : ''));
    if (s.stretch > 0) a.push('像素拉伸');
    if (s.kuwa > .25 && s.kmix > 0) a.push('Kuwahara ' + s.kuwa);
    if (s.abs > 0) a.push('抽象度 ' + s.abs.toFixed(2));
    return '起点' + (a.length ? ' → ' + a.join(' → ') : '') + ' → 调色';
  }

  // 每一帧：母图脏了就重算；场景脏了就都画一遍；主图在流就只画主图
  var t0 = performance.now(), lastMain = 0, lastScenes = 0, scenesDirty = false;
  function frame(now) {
    if (card && src && !lost) {
      var t = (now - t0) / 1000;
      if (dirtyMaster) {
        renderMaster(state, interacting ? .5 : 1);
        dirtyMaster = false; dirtyOut = true;
        if (!interacting && masterScale < 1) dirtyMaster = true;
      } else if (!interacting && masterScale < 1) { dirtyMaster = true; }
      if (needPalette) { extractPalette(); needPalette = false; dirtyOut = true; }
      if (dirtyOut) {
        renderMain(t); lastMain = now; dirtyOut = false;
        if (!interacting || now - lastScenes > 120) { renderScenes(); lastScenes = now; scenesDirty = false; } else scenesDirty = true;
      } else if (scenesDirty && (!interacting || now - lastScenes > 120)) { renderScenes(); lastScenes = now; scenesDirty = false; }
      else if (state.flow > 0 && !reduced && now - lastMain > 33) { renderMain(t); lastMain = now; }
    }
    requestAnimationFrame(frame);
  }
  var lost = false;
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function renderMain(t) {
    var c = $('c-main'), s = sizeOf(c, 1.5);
    renderOut(s[0], s[1], { abs: state.abs, flow: reduced ? 0 : state.flow, time: t, seed: t % 7 });
    blit(c, s[0], s[1]);
  }
  function renderScenes() {
    var c, s;
    c = $('c-swatch'); s = sizeOf(c); renderOut(s[0], s[1], { abs: 1, seed: 1 }); blit(c, s[0], s[1]);
    ['lock', 'home'].forEach(function (k, i) {
      c = $('c-' + k); s = sizeOf(c);
      renderOut(s[0], s[1], { abs: state.wpAbs, dim: state.wpDim + (i ? .06 : 0), pos: state.wpPos, seed: 2 + i });
      blit(c, s[0], s[1]);
    });
    for (var v = 1; v <= 4; v++) {
      c = $('c-bn' + v); s = sizeOf(c);
      renderOut(s[0], s[1], { abs: v === 4 ? Math.max(state.bnAbs, .5) : state.bnAbs, pos: state.bnPos, variant: v, solid: solid, col: state.bnCol, seed: 3 + v });
      blit(c, s[0], s[1]);
    }
    $('steps').textContent = stepsText();
    if (!interacting) measureInks();
  }

  /* ---------------- 换卡片 ---------------- */
  function load(id) {
    var c = D.byId(id) || D.list[0];
    card = c;
    state = stored(c.id) || fresh();
    Object.keys(fresh()).forEach(function (k) { if (state[k] == null) state[k] = fresh()[k]; });
    atDefaults = !stored(c.id);
    document.title = c.name + ' · 质感工作台';
    $('name').textContent = c.name;
    $('line').textContent = c.line;
    var mf = $('main-frame');
    mf.style.aspectRatio = c.aspect >= 1 ? '16 / 10' : '4 / 5'; mf.style.setProperty('--ar', c.aspect >= 1 ? 1.6 : .8);
    $('i-ref').src = c.ref || 'refs/' + c.id + '.jpg'; $('i-base').src = 'tex/base/' + c.id + '.webp';
    $('i-tex').src = 'tex/' + c.id + '.webp'; $('i-abs').src = 'tex/abs/' + c.id + '.webp';
    $('i-ref').alt = '参考照片：' + c.name; $('i-base').alt = '起点：' + c.name; $('i-tex').alt = '纹理：' + c.name; $('i-abs').alt = '色卡：' + c.name;
    // 画好之前（或者画不出来）显示 texture.py 算好的图
    Array.prototype.forEach.call(document.querySelectorAll('[data-fb]'), function (el) {
      el.classList.remove('drawn');
      el.style.backgroundImage = 'url("' + (el.dataset.fb === 'tex' ? 'tex/' : 'tex/abs/') + c.id + '.webp")';
    });
    var dl = $('notes'); dl.innerHTML = '';
    Object.keys(c.notes).forEach(function (k) {
      var d = document.createElement('div');
      d.innerHTML = '<dt>' + k + '</dt><dd></dd>'; d.querySelector('dd').textContent = c.notes[k];
      dl.appendChild(d);
    });
    Array.prototype.forEach.call(document.querySelectorAll('#picker button'), function (b) { b.setAttribute('aria-current', String(b.dataset.id === c.id)); });
    Array.prototype.forEach.call(document.querySelectorAll('.bn-title'), function (el) { el.textContent = c.name; });
    Array.prototype.forEach.call(document.querySelectorAll('.bn-sub'), function (el) { el.textContent = c.line; });
    syncPanel();
    // 默认参数时用 texture.py 算好的调色板，和色卡页一致
    if (c.data && atDefaults) setPalette(c.data.palette.map(hexToRgb), c.data.share, [c.data.lo0, c.data.hi0, c.data.lo, c.data.hi]);
    else if (!pal) setPalette([[0, 0, 0], [.5, .5, .5], [1, 1, 1]], [.3, .4, .3], [.05, .95, .05, .95]);
    var img = new Image();
    img.onload = function () {
      if (card !== c) return;
      try {
        freeTex(src);
        var t = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
        src = { t: t, w: img.naturalWidth, h: img.naturalHeight, f: null };
        card.w = img.naturalWidth; card.h = img.naturalHeight;
        dirtyMaster = true; dirtyOut = true;
        if (!atDefaults || !c.data) needPalette = true;
      } catch (e) {
        fail(location.protocol === 'file:' ?
          '直接双击打开时，浏览器不让把图片交给 WebGL，工作台画不出来。在仓库根目录运行 python3 -m http.server，再打开 http://localhost:8000/explore/cards/workbench.html' :
          '图片没法交给 WebGL：' + e.message);
      }
    };
    img.src = 'tex/base/' + c.id + '.webp';
  }
  function fail(msg) { var n = $('notice'); n.textContent = msg; n.hidden = false; document.body.classList.add('no-gl'); }

  function toast(msg) {
    var t = $('toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.hidden = true; }, 1800);
  }

  function boot() {
    var picker = $('picker');
    D.list.forEach(function (c) {
      var b = document.createElement('button'); b.type = 'button'; b.dataset.id = c.id; b.id = 'pick-' + c.id;
      b.innerHTML = '<i></i><span></span>'; b.querySelector('span').textContent = c.name;
      if (c.data) {
        var acc = 0, stops = c.data.palette.map(function (hx, i) { var a = acc; acc += c.data.share[i] * 360; return hx + ' ' + a.toFixed(1) + 'deg ' + acc.toFixed(1) + 'deg'; });
        b.querySelector('i').style.background = 'conic-gradient(' + stops.join(',') + ')';
      }
      b.addEventListener('click', function () {
        try { history.replaceState(null, '', '#' + c.id); } catch (e) { /* 预览环境不让改地址就算了 */ }
        load(c.id);
      });
      picker.appendChild(b);
    });
    buildPanel();
    $('reset').addEventListener('click', function () {
      state = fresh(); atDefaults = true;
      try { localStorage.removeItem('texture-wb:' + card.id); } catch (e) { /* 忽略 */ }
      syncPanel();
      if (card.data) setPalette(card.data.palette.map(hexToRgb), card.data.share, [card.data.lo0, card.data.hi0, card.data.lo, card.data.hi]);
      else needPalette = true;
      dirtyMaster = true; dirtyOut = true;
      toast('已恢复成默认参数');
    });
    $('copy').addEventListener('click', function () {
      var txt = JSON.stringify({ card: card.id, params: state, palette: pal.items.map(function (i) { return rgbToHex(i.rgb); }) }, null, 2);
      var done = function () { toast('参数已复制'); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, function () { fallbackCopy(txt); });
      else fallbackCopy(txt);
    });
    window.addEventListener('resize', function () { dirtyOut = true; });
    var release = function () { if (interacting) { interacting = false; dirtyOut = true; schedulePalette(); } };
    window.addEventListener('pointerup', release); window.addEventListener('pointercancel', release);
    glc.addEventListener('webglcontextlost', function (e) { e.preventDefault(); lost = true; fail('显卡把这一页的 WebGL 重置了（多半是某一步算得太久），刷新一下就好；油画化的半径调小一点会快很多。'); });
    var id = location.hash.replace('#', '');
    load(D.byId(id) ? id : D.list[0].id);
    requestAnimationFrame(frame);
  }
  function fallbackCopy(txt) {
    var ta = document.createElement('textarea'); ta.value = txt; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    var ok = false; try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    toast(ok ? '参数已复制' : '复制不了，这个环境不让读写剪贴板');
  }

  if (!gl) { document.addEventListener('DOMContentLoaded', function () { fail('这个浏览器不支持 WebGL2，工作台用不了；色卡页可以正常看。'); }); return; }
  try { initGL(); } catch (e) { fail('着色器编不过：' + e.message); if (window.console) console.error(e); return; }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  window.textureWorkbench = { state: function () { return state; }, card: function () { return card && card.id; }, palette: function () { return pal; } };
})();
