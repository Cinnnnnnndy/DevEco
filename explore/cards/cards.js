/* 质感卡片 v4 · 卡片的画面是 tools/texture.py 从参考照片算出来的纹理（tex/*.webp），这里只让它活起来：
     1 bg  把纹理图传成一张带 mipmap 的贴图（边缘镜像重复）
     2 fx  顺着这张纹理当初拖曳的方向慢慢流（两个相位交替淡入淡出，看不出循环的接缝）；
           鼠标在卡片上是一盏柔光；毛玻璃卡片在这里画跟着鼠标走的液态透镜
     3 dn  把 fx 的结果缩小、生成 mipmap，给下一步取模糊
     4 ui  字底下的液态玻璃片（.plate 的位置和圆角从 DOM 量）：边缘像透镜一样往里压、分出色边，中间磨砂提饱和，
           边上一道随光源转的亮线；再加一点泛光、暗角和抖动
   纹理图本身就在卡片里（img.tex），WebGL 起不来、或者直接双击打开（file:// 下浏览器不让把图片传进 WebGL）时，
   就只显示这张图，字底下换成 CSS 毛玻璃。会动的卡片只在进入视口时画（约 30fps），系统开了「减少动态效果」时不流。 */
(function () {
  'use strict';

  var HEAD = `precision highp float;
varying vec2 v_uv;
uniform vec2 u_res;uniform float u_asp;uniform float u_time;uniform vec2 u_ptr;uniform float u_hover;uniform float u_lk;uniform vec2 u_l0;
`;

  var LIB = `
float hash12(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}
vec2 hash22(vec2 p){vec3 p3=fract(vec3(p.xyx)*vec3(.1031,.1030,.0973));p3+=dot(p3,p3.yzx+33.33);return fract((p3.xx+p3.yz)*p3.zy);}
float gnoise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*f*(f*(f*6.-15.)+10.);
  float a=dot(hash22(i)*2.-1.,f),b=dot(hash22(i+vec2(1.,0.))*2.-1.,f-vec2(1.,0.));
  float c=dot(hash22(i+vec2(0.,1.))*2.-1.,f-vec2(0.,1.)),d=dot(hash22(i+vec2(1.,1.))*2.-1.,f-vec2(1.,1.));
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);}
float lum(vec3 c){return dot(c,vec3(.2126,.7152,.0722));}
vec3 sat(vec3 c,float s){return max(mix(vec3(lum(c)),c,s),0.);}
vec2 iso(vec2 uv){return vec2(uv.x*u_asp,uv.y);}
vec2 LP(){return mix(u_l0,u_ptr,u_hover*u_lk);}
float sdRB(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
float fres(float c,float f0){return f0+(1.-f0)*pow(1.-clamp(c,0.,1.),5.);}
float dith(){return (hash12(gl_FragCoord.xy+fract(u_time*.61)*97.)+hash12(gl_FragCoord.yx*1.37+11.3)-1.)/255.;}
float jit(){
#ifdef LOD
  return hash12(gl_FragCoord.xy*.917+3.1)*6.2831853;
#else
  return 0.;
#endif
}
`;

  // 2 fx 的公用部分：B() 按卡片坐标取纹理（u_cover 做和 object-fit: cover 一样的裁切），G() 透过玻璃看（折射、色散、磨砂）
  var FXLIB = `
uniform sampler2D u_bg;uniform vec2 u_bgsz;uniform vec2 u_cover;
vec2 TX(vec2 uv){return (uv-.5)*u_cover+.5;}
vec3 B(vec2 uv,float l){
#ifdef LOD
  return texture2DLodEXT(u_bg,TX(uv),l).rgb;
#else
  return texture2D(u_bg,TX(uv),l).rgb;
#endif
}
float lodR(float r){return log2(max(r*u_bgsz.y*u_cover.y*.6,1.));}
vec3 G(vec2 uv,vec2 off,float dsp,float r){
  if(r<.0008)return vec3(B(uv+off*(1.+dsp),0.).r,B(uv+off,0.).g,B(uv+off*(1.-dsp),0.).b);
  float l=lodR(r),a0=jit();vec3 s=vec3(0.);
  for(int i=0;i<10;i++){float fi=float(i),a=a0+fi*2.3999632,rr=sqrt((fi+.5)/10.)*r;
    vec2 j=vec2(cos(a)/u_asp,sin(a))*rr;
    s+=vec3(B(uv+off*(1.+dsp)+j,l).r,B(uv+off+j,l).g,B(uv+off*(1.-dsp)+j,l).b);}
  return s/10.;}
// 顺着流向走：两个相位各偏一段、交替淡入淡出（Valve 的 flow map 做法）
vec3 FLOWED(vec2 uv,vec2 f,float speed){
  float t=u_time*speed,p0=fract(t),p1=fract(t+.5);
  return mix(B(uv-f*p0,0.),B(uv-f*p1,0.),abs(p0*2.-1.));}
// 鼠标的柔光：整体轻轻提亮，亮处更亮一点
vec3 GLOW(vec2 uv,vec3 col,float k){
  vec2 d=(uv-LP())*vec2(u_asp,1.);float g=exp(-dot(d,d)*5.)*u_hover*u_lk*k;
  return col+(1.-col)*g*.16+smoothstep(.5,1.,lum(col))*g*.16;}
`;

  var DOWN = `precision mediump float;varying vec2 v_uv;uniform sampler2D u_src;
void main(){gl_FragColor=texture2D(u_src,vec2(v_uv.x,1.-v_uv.y));}
`;

  // 4 ui：泛光 + 暗角 + 字底下的液态玻璃片（同 v3）
  var UI = `
uniform sampler2D u_fx;uniform sampler2D u_dn;uniform vec2 u_dnsz;
uniform vec4 u_plate;uniform float u_pr;uniform float u_dpr;uniform vec4 u_ptint;uniform float u_pdark;
uniform vec2 u_bloom;uniform float u_vig;
vec3 FX(vec2 uv){return texture2D(u_fx,vec2(uv.x,1.-uv.y)).rgb;}
vec3 DN(vec2 uv,float l){
#ifdef LOD
  return texture2DLodEXT(u_dn,vec2(uv.x,1.-uv.y),l).rgb;
#else
  return texture2D(u_dn,vec2(uv.x,1.-uv.y),l).rgb;
#endif
}
void main(){
  vec2 uv=v_uv,px=uv*u_res;vec3 col=FX(uv);
  if(u_bloom.x>0.){vec3 b=DN(uv,2.)*.3+DN(uv,3.5)*.4+DN(uv,5.)*.3;col+=max(b-u_bloom.y,0.)*u_bloom.x;}
  col*=1.-u_vig*smoothstep(.25,.95,length((uv-.5)*vec2(1.,.9)));
  if(u_plate.z>u_plate.x){
    vec2 c=(u_plate.xy+u_plate.zw)*.5,b=(u_plate.zw-u_plate.xy)*.5,q=px-c;
    float R=u_pr,s=u_dpr,d=sdRB(q,b,R);
    float sd=sdRB(q-vec2(0.,5.*s),b,R);
    col*=1.-smoothstep(24.*s,-6.*s,sd)*mix(.16,.24,u_pdark)*smoothstep(-1.,1.,d);
    col*=1.-(1.-u_pdark)*.08*smoothstep(1.5*s,0.,d)*smoothstep(-1.,1.,d);
    if(d<1.5){
      float bez=min(R*1.25,min(b.x,b.y)*.85),dep=max(-d,0.);
      vec2 g=vec2(sdRB(q+vec2(1.,0.),b,R)-sdRB(q-vec2(1.,0.),b,R),sdRB(q+vec2(0.,1.),b,R)-sdRB(q-vec2(0.,1.),b,R));
      vec2 n=g/max(length(g),1e-4);
      float t=1.-clamp(dep/bez,0.,1.),m=t*t;
      vec2 off=(-n*m*bez*.7-q*.03)/u_res;
      float rad=15.*s/u_res.y,l=log2(max(rad*u_dnsz.y*.6,1.)),a0=jit(),dsp=.06+.35*m;
      vec3 fr=vec3(0.);
      for(int i=0;i<12;i++){float fi=float(i),a=a0+fi*2.3999632,rr=sqrt((fi+.5)/12.)*rad;
        vec2 j=vec2(cos(a)*u_res.y/u_res.x,sin(a))*rr;
        fr+=vec3(DN(uv+off*(1.+dsp)+j,l).r,DN(uv+off+j,l).g,DN(uv+off*(1.-dsp)+j,l).b);}
      fr=sat(fr/12.,1.5);
      vec3 gc=u_pdark>.5?fr*.7:fr*1.04+.04;
      gc=mix(gc,u_ptint.rgb,u_ptint.a);
      vec2 ld=normalize(LP()*u_res-c+vec2(.001));
      float fa=dot(n,ld),line=smoothstep(1.6*s,.3*s,dep),soft=smoothstep(14.*s,0.,dep);
      gc+=line*(.16+.62*pow(max(fa,0.),2.)+.3*pow(max(-fa,0.),3.))*mix(1.,.7,u_pdark);
      gc+=soft*m*(.04+.16*pow(max(fa,0.),2.));
      gc+=.035*smoothstep(b.y,-b.y,q.y)*mix(1.,.5,u_pdark);
      col=mix(col,gc,smoothstep(.8,-.8,d));
    }
  }
  gl_FragColor=vec4(col+dith(),1.);
}
`;

  /* ---------------- 每张卡片：纹理怎么流 ----------------
     l0 默认光源位置，lk 光源跟不跟鼠标，animate 会不会流，scale 画布分辨率倍率，bloom [强度, 阈值]，vig 暗角，
     plate 字底下那块玻璃：dark 深色玻璃，tint 染色 [r,g,b,量]；fx 里的 main() 决定这张纹理怎么动 */
  var STILL = `void main(){vec3 col=B(v_uv,0.);gl_FragColor=vec4(GLOW(v_uv,col,1.),1.);}`;
  var CARDS = {
    // 竖向拖出来的水幕：往下流，每一缕快慢不一样
    fall: { l0: [.9, .05], animate: true, scale: .7, bloom: [.25, .75], vig: .08, plate: { dark: 0, tint: [.97, .98, .96, .22] },
      fx: `void main(){vec2 uv=v_uv;float v=.75+.5*(gnoise(vec2(uv.x*7.,.5))*.5+.5);
  vec3 col=FLOWED(uv,vec2(0.,.06*v),.35);gl_FragColor=vec4(GLOW(uv,col,1.),1.);}` },
    // 九张纹理的竖条上，一块跟着鼠标走的液态透镜
    glass: { l0: [.16, .08], lk: 0, animate: false, scale: 1, bloom: [0, 1], vig: 0, plate: { dark: 0, tint: [.98, .98, 1, .16] },
      fx: `
const vec2 HB=vec2(.24,.085);const float RR=.085;
void main(){
  vec2 uv=v_uv,p=iso(uv),lp=iso(LP());
  vec2 c=iso(mix(vec2(.5,.27),u_ptr,u_hover)),q=p-c;
  float sd=sdRB(q,HB,RR);
  vec3 col=B(uv,0.);
  vec2 ld=normalize(c-lp+vec2(1e-4));
  col*=1.-.26*smoothstep(.06,-.03,sdRB(q-ld*.03,HB,RR))*smoothstep(-.002,.002,sd);
  if(sd<.003){
    vec2 e=vec2(.0015,0.);
    vec2 n=normalize(vec2(sdRB(q+e,HB,RR)-sdRB(q-e,HB,RR),sdRB(q+e.yx,HB,RR)-sdRB(q-e.yx,HB,RR))+1e-6);
    float u=clamp(-sd/.05,0.,1.),tt=1.-u,m=tt*tt;
    vec2 oi=-n*m*.05-q*.06;
    vec3 see=G(uv,vec2(oi.x/u_asp,oi.y),.03+.22*m,0.);
    vec3 N=normalize(vec3(n*tt,sqrt(max(1.-tt*tt,.004))));
    vec3 L=normalize(vec3(lp-p,.3));float nh=max(dot(N,normalize(L+vec3(0.,0.,1.))),0.);
    vec3 g=see*1.03+.015;
    g=mix(g,vec3(.97,.98,1.),fres(N.z,.04)*.55);
    float fa=dot(n,-ld),edge=smoothstep(.006,0.,-sd);
    g+=edge*(.18+.7*pow(max(fa,0.),3.)+.4*pow(max(-fa,0.),3.));
    g+=pow(nh,120.)*.7+pow(nh,10.)*.04;
    g+=m*.05*(1.+fa);
    g+=.035*smoothstep(HB.y,-HB.y,q.y);
    col=mix(col,g,smoothstep(.0012,-.0012,sd));
  }
  gl_FragColor=vec4(col,1.);
}` },
    film: { l0: [.3, .2], animate: false, scale: 1, bloom: [.15, .8], vig: .12, plate: { dark: 1, tint: [.05, .02, .04, .6] }, fx: STILL },
    // 横带的云慢慢往右漂，月亮和光晕（最亮的地方）不动
    moon: { l0: [.5, .45], animate: true, scale: .8, bloom: [.2, .7], vig: .12, plate: { dark: 1, tint: [.05, .06, .08, .35] },
      fx: `void main(){vec2 uv=v_uv;float still=smoothstep(.35,.7,lum(B(uv,4.)));
  vec3 col=FLOWED(uv,vec2(.035*(1.-still),0.),.06);gl_FragColor=vec4(GLOW(uv,col,.8),1.);}` },
    tower: { l0: [.3, .1], animate: false, scale: 1, bloom: [.15, .8], vig: .1, plate: { dark: 1, tint: [.05, .1, .26, .3] }, fx: STILL },
    slush: { l0: [.35, .2], animate: false, scale: 1, bloom: [.15, .85], vig: .1, plate: { dark: 0, tint: [1, .95, .9, .3] }, fx: STILL },
    tundra: { l0: [.25, .08], animate: false, scale: 1, bloom: [.1, .85], vig: .12, plate: { dark: 1, tint: [.1, .1, .08, .42] }, fx: STILL },
    // 沿着虹的弧慢慢挪
    rainbow: { l0: [.35, .2], animate: true, scale: .7, bloom: [.1, .85], vig: .06, plate: { dark: 0, tint: [.95, .95, .93, .28] },
      fx: `void main(){vec2 uv=v_uv;vec2 d=iso(uv)-iso(vec2(.1,1.4));vec2 t=normalize(vec2(-d.y,d.x));
  vec3 col=FLOWED(uv,vec2(t.x/u_asp,t.y)*.03,.05);gl_FragColor=vec4(GLOW(uv,col,1.),1.);}` },
    // 天和倒影一起横着漂，水面（下半）再加一点上下的细波
    mirror: { l0: [.6, .45], animate: true, scale: .8, bloom: [.2, .75], vig: .1, plate: { dark: 1, tint: [.08, .1, .2, .3] },
      fx: `void main(){vec2 uv=v_uv;float w=smoothstep(.45,.6,uv.y);
  vec2 rip=vec2(0.,sin(uv.y*260.-u_time*1.6+gnoise(vec2(uv.x*4.,uv.y*20.))*3.)*.0015*w);
  vec3 col=FLOWED(uv+rip,vec2(.04,0.),.05);gl_FragColor=vec4(GLOW(uv,col,1.),1.);}` },
    // 绕着一个中心慢慢转（水花细，偏移短一点，不然两个相位叠起来会糊）
    spring: { l0: [.35, .15], animate: true, scale: .8, bloom: [.1, .85], vig: .1, plate: { dark: 0, tint: [.9, .98, 1, .26] },
      fx: `void main(){vec2 uv=v_uv;vec2 d=iso(uv)-iso(vec2(.55,.5));vec2 t=vec2(-d.y,d.x)/max(length(d),.05);
  vec3 col=FLOWED(uv,vec2(t.x/u_asp,t.y)*.012,.2);gl_FragColor=vec4(GLOW(uv,col,1.),1.);}` }
  };

  /* ---------------- WebGL ---------------- */
  var VERT = 'attribute vec2 a;varying vec2 v_uv;void main(){v_uv=vec2(a.x*.5+.5,.5-a.y*.5);gl_Position=vec4(a,0.,1.);}';
  var UNIFORMS = ['u_res', 'u_asp', 'u_time', 'u_ptr', 'u_hover', 'u_lk', 'u_l0', 'u_bg', 'u_bgsz', 'u_cover', 'u_src', 'u_fx', 'u_dn', 'u_dnsz',
    'u_plate', 'u_pr', 'u_dpr', 'u_ptint', 'u_pdark', 'u_bloom', 'u_vig'];

  function shader(gl, type, src, label) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      var log = gl.getShaderInfoLog(s);
      gl.deleteShader(s);
      throw new Error(label + '\n' + log);
    }
    return s;
  }
  function program(gl, src, label) {
    var p = gl.createProgram();
    gl.attachShader(p, shader(gl, gl.VERTEX_SHADER, VERT, label));
    gl.attachShader(p, shader(gl, gl.FRAGMENT_SHADER, src, label));
    gl.bindAttribLocation(p, 0, 'a');
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(label + '\n' + gl.getProgramInfoLog(p));
    var u = {};
    UNIFORMS.forEach(function (k) { u[k] = gl.getUniformLocation(p, k); });
    return { p: p, u: u };
  }
  function target(gl, w, h, mip) {
    var t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mip ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    var f = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    return { tex: t, fbo: f, w: w, h: h };
  }
  // 最近的 2 的幂（要生成 mipmap、要镜像重复的贴图 WebGL1 只认 2 的幂）
  function pow2(x, lo, hi) { return Math.pow(2, Math.max(lo, Math.min(hi, Math.round(Math.log(Math.max(x, 1)) / Math.LN2)))); }

  // 纹理图 → 2 的幂大小的贴图；file:// 下浏览器会拦（SecurityError），交给调用方退回纯图片
  function upload(gl, img) {
    var w = pow2(img.naturalWidth, 8, 11), h = pow2(img.naturalHeight, 8, 11);
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    c.getContext('2d').drawImage(img, 0, 0, w, h);
    var t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    return { tex: t, w: w, h: h, asp: img.naturalWidth / img.naturalHeight };
  }

  function Card(el, name, def, img) {
    var canvas = el.querySelector('canvas.fx');
    var gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, preserveDrawingBuffer: false });
    if (!gl) throw new Error('no webgl');
    var ext = gl.getExtension('EXT_shader_texture_lod') ? '#extension GL_EXT_shader_texture_lod : enable\n#define LOD 1\n' : '';
    this.P = {
      fx: program(gl, ext + HEAD + LIB + FXLIB + def.fx, name + ' fx'),
      dn: program(gl, DOWN, name + ' dn'),
      ui: program(gl, ext + HEAD + LIB + UI, name + ' ui')
    };
    this.tBG = upload(gl, img);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    this.el = el; this.canvas = canvas; this.gl = gl; this.def = def; this.name = name;
    this.plate = el.querySelector('.plate');
    this.ptr = def.l0.slice(); this.target = def.l0.slice(); this.hover = 0; this.hoverTarget = 0;
    this.visible = true; this.dirty = true; this.relayout = true; this.last = 0; this.w = 0; this.h = 0;
  }

  Card.prototype.size = function () {
    var c = this.canvas, cw = c.clientWidth, ch = c.clientHeight;
    if (!cw || !ch) return false;
    var s = Math.min(window.devicePixelRatio || 1, 2) * this.def.scale;
    var w = Math.max(2, Math.round(cw * s)), h = Math.max(2, Math.round(ch * s));
    if (w !== this.w || h !== this.h) {
      var gl = this.gl;
      [this.tFX, this.tDN].forEach(function (t) { if (t) { gl.deleteTexture(t.tex); gl.deleteFramebuffer(t.fbo); } });
      this.w = c.width = w; this.h = c.height = h; this.asp = cw / ch;
      this.tFX = target(gl, w, h, false);
      this.tDN = target(gl, pow2(w / 2, 6, 9), pow2(h / 2, 6, 9), true);
      // 和 object-fit: cover 一样：纹理比卡片宽就裁左右，比卡片窄就裁上下
      var ta = this.tBG.asp;
      this.cover = this.asp > ta ? [1, ta / this.asp] : [this.asp / ta, 1];
      this.relayout = true;
    }
    if (this.relayout) { this.measure(); this.relayout = false; }
    return true;
  };

  // 字底下那块玻璃的位置和圆角，换算成画布像素
  Card.prototype.measure = function () {
    var p = this.plate, k = this.w / this.canvas.clientWidth;
    this.k = k;
    if (!p) { this.pr = null; return; }
    this.pr = [p.offsetLeft * k, p.offsetTop * k, (p.offsetLeft + p.offsetWidth) * k, (p.offsetTop + p.offsetHeight) * k];
    this.prad = (parseFloat(getComputedStyle(p).borderTopLeftRadius) || 0) * k;
  };

  Card.prototype.use = function (P, tgt, t) {
    var gl = this.gl, u = P.u, d = this.def;
    var w = tgt ? tgt.w : this.w, h = tgt ? tgt.h : this.h;
    gl.bindFramebuffer(gl.FRAMEBUFFER, tgt ? tgt.fbo : null);
    gl.viewport(0, 0, w, h);
    gl.useProgram(P.p);
    gl.uniform2f(u.u_res, w, h);
    gl.uniform1f(u.u_asp, this.asp);
    gl.uniform1f(u.u_time, t);
    gl.uniform2f(u.u_ptr, this.ptr[0], this.ptr[1]);
    gl.uniform1f(u.u_hover, this.hover);
    gl.uniform1f(u.u_lk, d.lk == null ? 1 : d.lk);
    gl.uniform2f(u.u_l0, d.l0[0], d.l0[1]);
    return u;
  };

  Card.prototype.draw = function (t) {
    if (!this.size()) return;
    var gl = this.gl, d = this.def, u;
    gl.activeTexture(gl.TEXTURE0);
    // 2 纹理怎么流 + 鼠标的光
    u = this.use(this.P.fx, this.tFX, t);
    gl.bindTexture(gl.TEXTURE_2D, this.tBG.tex);
    gl.uniform1i(u.u_bg, 0);
    gl.uniform2f(u.u_bgsz, this.tBG.w, this.tBG.h);
    gl.uniform2f(u.u_cover, this.cover[0], this.cover[1]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    // 3 缩小 + mipmap
    u = this.use(this.P.dn, this.tDN, t);
    gl.bindTexture(gl.TEXTURE_2D, this.tFX.tex);
    gl.uniform1i(u.u_src, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindTexture(gl.TEXTURE_2D, this.tDN.tex);
    gl.generateMipmap(gl.TEXTURE_2D);
    // 4 字底下的玻璃片、泛光
    u = this.use(this.P.ui, null, t);
    gl.bindTexture(gl.TEXTURE_2D, this.tFX.tex);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.tDN.tex);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(u.u_fx, 0);
    gl.uniform1i(u.u_dn, 1);
    gl.uniform2f(u.u_dnsz, this.tDN.w, this.tDN.h);
    var r = this.pr || [0, 0, 0, 0], pl = d.plate;
    gl.uniform4f(u.u_plate, r[0], r[1], r[2], r[3]);
    gl.uniform1f(u.u_pr, this.prad || 0);
    gl.uniform1f(u.u_dpr, this.k || 1);
    gl.uniform4f(u.u_ptint, pl.tint[0], pl.tint[1], pl.tint[2], pl.tint[3]);
    gl.uniform1f(u.u_pdark, pl.dark);
    gl.uniform2f(u.u_bloom, d.bloom[0], d.bloom[1]);
    gl.uniform1f(u.u_vig, d.vig || 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  Card.prototype.ease = function () {
    var moved = false;
    for (var i = 0; i < 2; i++) {
      var d = this.target[i] - this.ptr[i];
      if (Math.abs(d) > .0005) { this.ptr[i] += d * .16; moved = true; }
    }
    var dh = this.hoverTarget - this.hover;
    if (Math.abs(dh) > .002) { this.hover += dh * .1; moved = true; } else this.hover = this.hoverTarget;
    return moved;
  };

  /* ---------------- 页面 ---------------- */
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cards = [];
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { var c = byEl(e.target); if (c) { c.visible = e.isIntersecting; if (c.visible) c.dirty = true; } });
  }, { rootMargin: '160px' }) : null;
  var ro = 'ResizeObserver' in window ? new ResizeObserver(function (es) {
    es.forEach(function (e) { var c = byEl(e.target); if (c) { c.relayout = true; c.dirty = true; } });
  }) : null;
  function byEl(el) { for (var i = 0; i < cards.length; i++) if (cards[i].el === el) return cards[i]; return null; }

  function start(el) {
    var name = el.getAttribute('data-fx'), def = CARDS[name], img = el.querySelector('img.tex'), card;
    if (!def || !img) return;
    try { card = new Card(el, name, def, img); } catch (e) {
      el.classList.add('no-fx');
      if (window.console) console.warn('质感卡片', name, e.message);
      return;
    }
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      card.target = [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
      card.hoverTarget = 1;
    });
    el.addEventListener('pointerleave', function () { card.hoverTarget = 0; });
    card.canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); card.dead = true; el.classList.add('no-fx'); });
    cards.push(card);
    if (io) io.observe(el);
    if (ro) ro.observe(el);
  }

  // 纹理图加载好了再起 WebGL；起不来就一直是纯图片
  Array.prototype.forEach.call(document.querySelectorAll('.card[data-fx]'), function (el) {
    var img = el.querySelector('img.tex');
    if (!img) return;
    if (img.complete && img.naturalWidth) start(el);
    else img.addEventListener('load', function () { start(el); }, { once: true });
  });
  if (!ro) window.addEventListener('resize', function () { cards.forEach(function (c) { c.relayout = true; c.dirty = true; }); });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { cards.forEach(function (c) { c.relayout = true; c.dirty = true; }); });
  }

  var t0 = performance.now();
  function frame(now) {
    var t = reduced ? 3 : 3 + (now - t0) / 1000;
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      if (!c.visible || c.dead) continue;
      var moved = c.ease(), anim = c.def.animate && !reduced;
      if (!(moved || c.dirty || (anim && now - c.last > 30))) continue;
      try { c.draw(anim ? t : 3); if (!c.shown) { c.shown = true; c.el.classList.add('fx-on'); } } catch (e) {
        c.dead = true; c.el.classList.add('no-fx'); c.el.classList.remove('fx-on');
        if (window.console) console.warn('质感卡片', c.name, e.message);
      }
      c.dirty = false; c.last = now;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  window.textureCards = { count: function () { return cards.length; }, names: function () { return cards.map(function (c) { return c.name; }); } };
})();
