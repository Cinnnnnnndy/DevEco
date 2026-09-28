/* 质感卡片 v3 · 每张参考图一张卡片：不画具体的东西，但要有它的渐变、质感和光。
   玻璃参照苹果的做法用程序算。每张卡片一个 WebGL1 上下文，分四步画：
     1 bg  背景光场：这张参考图的颜色排成发光的渐变，画进一张带 mipmap 的贴图（四周多画一圈 MG，折射到边外也有东西可取）
     2 fx  这张卡片自己的玻璃：高度场 → 法线 → 折射偏移 + 色散（RGB 各偏一点）+ 磨砂（按 mip 级取模糊，
           每个像素转一个随机角度，所以糊得匀、带一点磨砂颗粒）+ 菲涅尔反光 + 高光 + 内部发光
     3 dn  把 fx 的结果缩进一张小贴图并生成 mipmap，给字底下的玻璃片和泛光取模糊
     4 ui  液态玻璃片（.plate 的位置和圆角从 DOM 量）：边缘像透镜一样把底下的东西往里压、分出色边，
           中间磨砂、提饱和，边上一道随光源转的亮线；再加泛光、暗角和抖动（防色带）
   鼠标在卡片上时就是光源（u_ptr / u_hover，已缓动）：高光、反光、玻璃片边上的亮线都跟着走；
   毛玻璃卡片上是透镜跟着走，月晕是月亮，彩虹是虹的圆心，冰泉是漩涡，天水镜像是贴着地平线的太阳。
   会动的卡片只在进入视口时画（约 30fps），静态的只在鼠标移动或尺寸变化时重画；系统开了「减少动态效果」时停在一帧。 */
(function () {
  'use strict';

  var HEAD = `precision highp float;
varying vec2 v_uv;
uniform vec2 u_res;uniform float u_asp;uniform float u_time;uniform vec2 u_ptr;uniform float u_hover;uniform float u_lk;uniform vec2 u_l0;
`;

  // 噪声、颜色、坐标这些每一步都要用的
  var LIB = `
float hash12(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}
vec2 hash22(vec2 p){vec3 p3=fract(vec3(p.xyx)*vec3(.1031,.1030,.0973));p3+=dot(p3,p3.yzx+33.33);return fract((p3.xx+p3.yz)*p3.zy);}
float gnoise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*f*(f*(f*6.-15.)+10.);
  float a=dot(hash22(i)*2.-1.,f),b=dot(hash22(i+vec2(1.,0.))*2.-1.,f-vec2(1.,0.));
  float c=dot(hash22(i+vec2(0.,1.))*2.-1.,f-vec2(0.,1.)),d=dot(hash22(i+vec2(1.,1.))*2.-1.,f-vec2(1.,1.));
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);}
const mat2 ROT=mat2(1.6,1.2,-1.2,1.6);
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*gnoise(p);p=ROT*p;a*=.5;}return s;}
float fbm3(vec2 p){float s=0.,a=.5;for(int i=0;i<3;i++){s+=a*gnoise(p);p=ROT*p;a*=.5;}return s;}
vec3 hex(float r,float g,float b){return vec3(r,g,b)/255.;}
float lum(vec3 c){return dot(c,vec3(.2126,.7152,.0722));}
vec3 sat(vec3 c,float s){return max(mix(vec3(lum(c)),c,s),0.);}
vec3 hue(float h){return clamp(abs(mod(h*6.+vec3(0.,4.,2.),6.)-3.)-1.,0.,1.);}
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

  // 1 bg：每张卡片写一个 vec3 bg(vec2 q, vec2 uv)，q 是等比坐标（卡片高 = 1），uv 可以落到 [-MG, 1+MG]
  var BG_MAIN = `
const float MG=.08;
void main(){vec2 uv=v_uv*(1.+2.*MG)-MG;gl_FragColor=vec4(bg(iso(uv),uv)+dith(),1.);}
`;

  // 2 fx 的公用部分：B() 取背景（l 是 mip 级），G() 透过玻璃看背景（折射偏移、色散、磨砂半径、竖向拉长）
  var FXLIB = `
uniform sampler2D u_bg;uniform vec2 u_bgsz;
const float MG=.08;
vec2 TB(vec2 uv){return vec2((uv.x+MG)/(1.+2.*MG),1.-(uv.y+MG)/(1.+2.*MG));}
vec3 B(vec2 uv,float l){
#ifdef LOD
  return texture2DLodEXT(u_bg,TB(uv),l).rgb;
#else
  return texture2D(u_bg,TB(uv),l).rgb;
#endif
}
float lodR(float r){return log2(max(r*u_bgsz.y/(1.+2.*MG)*.6,1.));}
#ifndef TAPS
#define TAPS 10
#endif
vec3 G(vec2 uv,vec2 off,float dsp,float r,float an){
  if(r<.0008)return vec3(B(uv+off*(1.+dsp),0.).r,B(uv+off,0.).g,B(uv+off*(1.-dsp),0.).b);
  float l=lodR(r),a0=jit();vec3 s=vec3(0.);
  for(int i=0;i<TAPS;i++){float fi=float(i),a=a0+fi*2.3999632,rr=sqrt((fi+.5)/float(TAPS))*r;
    vec2 j=vec2(cos(a)/u_asp,sin(a)*an)*rr;
    s+=vec3(B(uv+off*(1.+dsp)+j,l).r,B(uv+off+j,l).g,B(uv+off*(1.-dsp)+j,l).b);}
  return s/float(TAPS);}
#define NRM(p,k,e) normalize(vec3(-(H((p)+vec2(e,0.))-H((p)-vec2(e,0.)))*(k)/(2.*(e)),-(H((p)+vec2(0.,e))-H((p)-vec2(0.,e)))*(k)/(2.*(e)),1.))
`;

  // 3 dn：原样缩小
  var DOWN = `precision mediump float;varying vec2 v_uv;uniform sampler2D u_src;
void main(){gl_FragColor=texture2D(u_src,vec2(v_uv.x,1.-v_uv.y));}
`;

  // 4 ui：泛光 + 暗角 + 字底下的液态玻璃片
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
      fr=sat(fr/12.,1.55);
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

  /* ---------------- 每张卡片：背景光场 bg + 玻璃 fx ----------------
     l0 默认光源位置（uv），lk 光源跟不跟鼠标，animate 会不会自己动，scale 画布分辨率倍率，bgRes 背景贴图精度，
     bgPtr / bgAnim 背景要不要跟鼠标 / 时间重画，bloom [强度, 阈值]，vig 暗角，plate 字底下那块玻璃：dark 深色玻璃，tint 染色 [r,g,b,量] */
  var CARDS = {};

  /* 瀑布 · 右上角的太阳逆光照过来：苔绿和岩石的暗底，前面一缕缕竖向的水幕往下流——
     薄处透出后面的苔绿（折射、竖向拉长的磨砂），厚处发白发亮；底部水雾把整片抬成乳白，雾里斜着几道光，水滴闪着往下走 */
  CARDS.fall = {
    l0: [.93, .02], animate: true, scale: .62, bgRes: .9, bloom: [.45, .6], vig: .1,
    plate: { dark: 0, tint: [.97, .98, .96, .2] },
    bg: `
vec3 bg(vec2 q,vec2 uv){
  float n=fbm(q*vec2(2.4,1.8)+2.3),n2=fbm(q*vec2(7.,4.6)+7.7),n3=gnoise(q*vec2(26.,18.));
  vec3 rock=mix(hex(20.,21.,16.),hex(56.,53.,36.),smoothstep(-.45,.45,n));
  rock*=.8+.3*smoothstep(-.4,.45,n2)+.1*n3;
  float mm=fbm(q*vec2(3.2,2.4)+11.)+.25*(1.-uv.y)-.08+.1*n3;
  vec3 mc=mix(hex(66.,82.,26.),hex(146.,158.,56.),smoothstep(-.35,.5,n2+.35*n3));
  vec3 col=mix(rock,mc,smoothstep(0.,.3,mm)*.85);
  vec2 sp=vec2(1.02*u_asp,-.32);float sd=length((q-sp)*vec2(.75,1.));
  col*=.5+.8*exp(-sd*1.5);
  col+=hex(206.,216.,110.)*smoothstep(.22,0.,uv.y)*smoothstep(-.1,.4,mm)*.16;
  return col;
}`,
    fx: `
float W(vec2 p){
  float x=p.x/u_asp,y=p.y;
  float body=smoothstep(.38,.5,x+.05*y+.04*fbm3(vec2(y*2.5,3.)))*smoothstep(.96,.82,x-.1*y);
  float left=smoothstep(.02,.1,x-.03*y)*smoothstep(.48,.38,x);
  return max(body,left*(.62+.3*y));
}
float H(vec2 p){
  float t=u_time,x=p.x/u_asp;
  float s=fbm(vec2(p.x*6.,p.y*.6-t*.18))+.12*gnoise(vec2(p.x*30.,p.y*1.8-t*.7));
  s=smoothstep(-.12,.22,s);
  float dense=smoothstep(.5,.62,x)*smoothstep(.95,.85,x);
  return W(p)*mix(.16+.84*s,.72+.28*s,dense);
}
void main(){
  vec2 uv=v_uv,p=iso(uv);float t=u_time;
  float d=H(p);vec3 N=NRM(p,.045,1.6/u_res.y);
  vec2 sp=vec2(1.02*u_asp,-.32);float sunF=exp(-length((p-sp)*vec2(.75,1.))*1.05);
  vec3 see=G(uv,-N.xy*vec2(.05/u_asp,.015),.3,mix(.0012,.02,d),3.);
  vec3 wc=mix(hex(172.,180.,178.),hex(255.,253.,248.),clamp(sunF*1.3+.22,0.,1.));
  float fs=gnoise(vec2(p.x*150.,p.y*3.-t*1.6))*.6+gnoise(vec2(p.x*290.,p.y*5.-t*2.4))*.4;
  float fk=smoothstep(-.3,.3,fbm3(vec2(p.x*9.,p.y*1.4-t*.5)));
  wc*=.86+(.12+.26*fk)*smoothstep(-.1,.45,fs);
  wc*=.84+.3*smoothstep(-.3,.35,fbm(vec2(p.x*10.,p.y*2.4-t*.9)));
  wc+=.1*smoothstep(.25,.62,gnoise(vec2(p.x*420.,p.y*150.-t*9.)));
  vec2 lp=iso(LP());
  wc+=hex(255.,240.,214.)*exp(-length(p-lp)*2.4)*u_hover*.3;
  float a=smoothstep(.18,.8,d);
  vec3 col=see*(1.+.3*d)*(1.-.7*a)+wc*a*.9;
  vec3 L=normalize(vec3(lp-p,.4));float nh=max(dot(N,normalize(L+vec3(0.,0.,1.))),0.);
  col+=vec3(1.)*pow(nh,50.)*.2*a;
  float mz=fbm(vec2(p.x*1.5-t*.04,p.y*2.2-t*.09));
  float mist=smoothstep(.36,1.,uv.y+.14*mz)*(.75+.25*mz);
  mist=max(mist,smoothstep(.25,.9,d)*smoothstep(.45,1.,uv.y)*.62);
  vec3 mc=mix(hex(208.,214.,210.),hex(255.,252.,244.),.4+.6*sunF)+.1*d;
  col=mix(col,mc,clamp(mist,0.,1.)*.84);
  vec2 dv=p-sp;float an=atan(dv.y,dv.x);
  float rays=pow(.5+.5*fbm3(vec2(an*15.,t*.035)),3.2);
  col+=hex(255.,238.,204.)*rays*exp(-length(dv)*.75)*(.2+.4*mist+.2*a);
  gl_FragColor=vec4(col,1.);
}`
  };

  /* 毛玻璃 · 底下是另外九张卡片的主色排成宽窄不一的竖条（每条上浅下深）；
     上面一块清透的液态透镜跟着鼠标走：边缘把色条往里压弯、分出色边，迎光那侧一道亮线、对面一道弱的内反光，底下落一片淡影；
     字底下那块是磨砂的，把色条糊成柔和的过渡 */
  CARDS.glass = {
    l0: [.16, .08], lk: 0, animate: false, scale: 1, bgRes: 1.2, bloom: [0, 1], vig: 0,
    plate: { dark: 0, tint: [.98, .98, 1, .16] },
    bg: `
vec3 stripe(float x){
  if(x<6.)return hex(233.,236.,232.);if(x<11.)return hex(111.,122.,52.);
  if(x<21.)return hex(224.,34.,138.);if(x<24.)return hex(22.,9.,15.);
  if(x<28.)return hex(14.,16.,22.);if(x<30.)return hex(201.,212.,226.);
  if(x<41.)return hex(30.,79.,182.);if(x<47.)return hex(142.,136.,144.);if(x<49.)return hex(246.,196.,84.);
  if(x<58.)return hex(240.,138.,44.);if(x<60.)return hex(255.,217.,168.);
  if(x<68.)return hex(178.,140.,70.);if(x<72.)return hex(160.,170.,58.);
  if(x<78.)return hex(195.,201.,208.);if(x<80.)return hex(238.,168.,144.);
  if(x<87.)return hex(108.,136.,194.);if(x<89.)return hex(255.,156.,64.);
  if(x<97.)return hex(52.,190.,212.);return hex(14.,120.,148.);}
vec3 bg(vec2 q,vec2 uv){
  vec3 c=stripe(clamp(uv.x,0.,.9999)*100.);
  c=mix(c*1.12+.04,c*.74,smoothstep(-.1,1.1,uv.y));
  c+=.06*exp(-length(q)*1.5);
  return c;
}`,
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
    vec3 see=G(uv,vec2(oi.x/u_asp,oi.y),.03+.22*m,0.,1.);
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
}`
  };

  /* 塑料膜 · 像在影棚里拍一张皱起来的镀铝膜：背景贴图这次当环境光用（一块大柔光箱、一条灯管、洋红和紫的补光），
     膜的法线把它反射出来——金属反射带洋红，清漆层按菲涅尔再盖一层白；褶子背光的一面转紫（薄膜干涉）；鼠标是点光。
     黑标签是一块深色的亮面玻璃 */
  CARDS.film = {
    l0: [.28, .2], animate: false, scale: 1, bgRes: .8, bloom: [.25, .7], vig: .15,
    plate: { dark: 1, tint: [.04, .02, .03, .72] },
    bg: `
vec3 bg(vec2 q,vec2 uv){
  vec2 e=uv*2.-1.;
  vec3 c=mix(hex(150.,120.,140.),hex(20.,8.,16.),smoothstep(-.6,.9,e.y));
  c*=1.-.35*smoothstep(.4,1.3,length(e));
  c+=hex(255.,250.,252.)*smoothstep(.08,-.1,sdRB(e-vec2(-.28,-.36),vec2(.3,.2),.14))*1.2;
  c+=hex(255.,246.,250.)*smoothstep(.06,-.06,sdRB(e-vec2(.34,-.44),vec2(.12,.1),.08))*.8;
  c+=hex(255.,240.,248.)*smoothstep(.05,-.04,sdRB(e-vec2(.55,-.05),vec2(.04,.5),.04));
  c+=hex(255.,236.,244.)*smoothstep(.06,-.05,sdRB(e-vec2(.05,.5),vec2(.24,.045),.045))*.55;
  c+=hex(120.,80.,255.)*exp(-length(e-vec2(-.8,.45))*2.6)*.7;
  c+=hex(255.,90.,180.)*exp(-length(e-vec2(.3,.8))*2.4)*.5;
  return c;
}`,
    fx: `
float tri(float x){return abs(fract(x)-.5)*2.;}
float rfbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*abs(gnoise(p));p=ROT*p;a*=.5;}return s;}
float H(vec2 p){
  vec2 q=p+vec2(fbm3(p*1.2+1.3),fbm3(p*1.2+7.1))*.16;
  return fbm3(q*1.3+3.7)*.55-rfbm(q*2.1+.7)*.3+(1.-tri(dot(q,vec2(.87,.49))*2.2+fbm3(q*1.6)*.7))*.06;
}
void main(){
  vec2 uv=v_uv,p=iso(uv);
  vec3 N=NRM(p,.1,1.2/u_res.y);
  vec2 R=2.*N.z*N.xy;
  vec2 eu=R*.85+.5+(LP()-u_l0)*vec2(.5,.4);
  vec3 eS=B(eu,0.),eB=B(eu,2.5);
  vec3 tint=hex(240.,36.,146.);
  vec3 col=(eS*.62+eB*.55)*tint*1.2+hex(50.,4.,28.)*.3;
  float th=dot(N.xy,vec2(.8,.35))*2.6+fbm3(p*2.4)*.7;
  vec3 ir=.55+.45*cos(6.2831*(th+vec3(0.,.33,.67)));
  col=mix(col,col*ir*1.7,smoothstep(.04,.3,1.-N.z)*.4);
  col+=eS*fres(N.z,.08)*.9;
  vec2 lp=iso(LP());vec3 L=normalize(vec3(lp-p,.55));
  float nh=max(dot(N,normalize(L+vec3(0.,0.,1.))),0.);
  col+=hex(255.,236.,246.)*(pow(nh,110.)*1.+pow(nh,14.)*.12);
  gl_FragColor=vec4(col,1.);
}`
  };

  /* 月晕 · 近黑的夜空里一小块冷白（月亮跟着鼠标走），往外一圈圈暗下去，带一点淡黄和淡紫；
     前面一条条横向的云是磨砂玻璃条，慢慢往左漂：厚处把月光糊成光晕、薄处透，云边镶一道亮边，薄云上有一圈淡淡的彩色光环 */
  CARDS.moon = {
    l0: [.62, .3], lk: .85, animate: true, scale: .7, bgRes: .8, bgPtr: true, bloom: [.45, .35], vig: .2,
    plate: { dark: 1, tint: [.05, .06, .08, .35] },
    bg: `
vec3 bg(vec2 q,vec2 uv){
  float r=length(q-iso(LP()));
  vec3 col=mix(hex(7.,9.,14.),hex(15.,18.,25.),uv.y);
  col+=hex(206.,220.,238.)*(exp(-r*5.5)*.55+exp(-r*2.)*.16);
  col+=hex(214.,200.,132.)*exp(-pow((r-.25)/.04,2.))*.08+hex(170.,120.,176.)*exp(-pow((r-.34)/.055,2.))*.06;
  col=mix(col,hex(246.,248.,250.),smoothstep(.064,.058,r));
  return col;
}`,
    fx: `
float H(vec2 p){
  float t=u_time*.018;
  float yy=p.y+.03*fbm3(vec2(p.x*1.2-t,p.y*4.));
  float b=sin(yy*22.+sin(yy*5.+1.)*1.7)*.5+.5;
  float m=smoothstep(-.22,.32,fbm3(vec2(p.x*1.4-t*1.4,yy*6.)));
  float fine=fbm3(vec2(p.x*5.-t*2.,yy*36.))*.5+.5;
  return smoothstep(.34,.9,b)*m*(.72+.28*fine);
}
void main(){
  vec2 uv=v_uv,p=iso(uv);
  float d=H(p);vec3 N=NRM(p,.02,1.6/u_res.y);
  vec3 see=G(uv,-N.xy*vec2(.02/u_asp,.02),.35,mix(.001,.042,d),1.);
  float rm=length(p-iso(LP()));
  vec3 col=see*(1.-d*.42);
  col+=mix(hex(120.,104.,92.),hex(214.,224.,240.),exp(-rm*2.2))*d*(exp(-rm*2.8)*.5+.05);
  float thin=d*(1.-d)*4.;
  col+=hue(fract(.62-rm*1.6))*.05*thin*smoothstep(.5,.1,rm);
  col+=hex(220.,230.,244.)*length(N.xy)*exp(-rm*2.5)*.25;
  gl_FragColor=vec4(col,1.);
}`
  };

  /* 石塔 · 长虹玻璃：十三根竖向的玻璃柱，把后面「两边钴蓝、中间暖灰、几点暖黄灯」的渐变折成一级一级；
     柱顶从中间往两边一级级降（石塔的序列），每根柱子上一道竖向高光排成一列，柱缝暗下去 */
  CARDS.tower = {
    l0: [.28, .08], animate: false, scale: 1, bgRes: .8, bloom: [.35, .6], vig: .12,
    plate: { dark: 1, tint: [.05, .1, .26, .3] },
    bg: `
vec3 bg(vec2 q,vec2 uv){
  float x=uv.x-.5,y=uv.y;
  vec3 sky=mix(hex(12.,36.,122.),hex(46.,104.,212.),smoothstep(-.1,.75,y));
  float m=exp(-pow(x/.27,2.))*smoothstep(-.12,.3,y);
  vec3 conc=mix(hex(204.,192.,184.),hex(118.,108.,114.),smoothstep(.05,1.,y));
  conc+=hex(255.,190.,130.)*.14*smoothstep(.12,-.25,x);
  vec3 col=mix(sky,conc,clamp(m*1.1,0.,1.));
  col+=hex(255.,196.,96.)*exp(-length((q-vec2(.5*u_asp,.5))*vec2(2.2,1.))*7.)*.7;
  col+=hex(255.,180.,84.)*exp(-length((q-vec2(.42*u_asp,.68))*vec2(2.2,1.))*9.)*.55;
  col+=hex(255.,214.,120.)*exp(-length((q-vec2(.6*u_asp,.33))*vec2(2.2,1.))*10.)*.45;
  col+=hex(255.,200.,110.)*exp(-length((q-vec2(.53*u_asp,.84))*vec2(2.2,1.))*10.)*.4;
  col+=hex(255.,150.,70.)*smoothstep(.6,1.1,y)*.12;
  return col;
}`,
    fx: `
const float NR=13.;
void main(){
  vec2 uv=v_uv,p=iso(uv);
  float fx=uv.x*NR,k=floor(fx),lx=fract(fx)*2.-1.;
  float st=abs(k-(NR-1.)*.5);
  float top=.06+st*.05,w=1./NR,rw=w*u_asp*.5;
  vec2 lc=vec2(lx*rw,max(top+rw-p.y,0.));
  float rr=length(lc)/rw;
  float inside=smoothstep(1.02,.98,rr);
  vec3 N=normalize(vec3(lc/rw*.96,sqrt(max(1.-min(rr*rr,1.)*.92,0.))));
  vec2 off=-N.xy*vec2(w*1.5,rw*1.2);
  vec3 col=G(uv,off*inside,.14*inside,(.002+.0014*st)*inside,1.);
  vec2 lp=iso(LP());vec3 L=normalize(vec3(lp-p,.5));
  float nh=max(dot(N,normalize(L+vec3(0.,0.,1.))),0.);
  col=mix(col,hex(210.,222.,255.),fres(N.z,.04)*.35*inside);
  col+=(pow(nh,70.)*.75+pow(nh,9.)*.06)*inside;
  col*=1.-.35*smoothstep(.8,1.,rr)*inside;
  gl_FragColor=vec4(col,1.);
}`
  };

  /* 冰沙 · 同一个橙：中心亮杏色，往外到橙、到砖红，像从里面透出来的光；
     冰粒沿着挖痕的同心弧一道道排开，每颗都是一个小透镜：里面倒映一小块橙光，顶上一个奶白高光，背光那侧透出暖光，粒间是暗下去的碎冰 */
  CARDS.slush = {
    l0: [.3, .12], animate: false, scale: 1, bgRes: .6, bloom: [.3, .72], vig: .14,
    plate: { dark: 0, tint: [1, .95, .9, .3] },
    bg: `
vec3 bg(vec2 q,vec2 uv){
  vec2 c=vec2(.42*u_asp,.36);
  float r=length((q-c)*vec2(1.,1.15));
  vec3 col=mix(hex(255.,196.,120.),hex(236.,120.,34.),smoothstep(0.,.45,r));
  col=mix(col,hex(160.,52.,14.),smoothstep(.4,1.,r));
  col+=hex(255.,230.,190.)*exp(-r*5.)*.3;
  col*=.92+.12*fbm(q*3.+1.);
  return col;
}`,
    fx: `
const float LN=28.;
vec2 S0(){return vec2(1.12*u_asp,-.18);}
// 碎冰：沿同心弧排开的 Voronoi 晶粒。返回 (指向晶粒中心的向量, 到中心距离, 离晶界多远)，id 是晶粒编号
vec4 vor(vec2 x,out vec2 id){
  vec2 n=floor(x),f=fract(x),r1=vec2(0.);float d1=8.,d2=8.;id=n;
  for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){
    vec2 g=vec2(float(i),float(j)),r=g+.15+.7*hash22(n+g)-f;float d=dot(r,r);
    if(d<d1){d2=d1;d1=d;r1=r;id=n+g;}else if(d<d2)d2=d;}
  return vec4(r1,sqrt(d1),sqrt(d2)-sqrt(d1));
}
void main(){
  vec2 uv=v_uv,p=iso(uv),lp=iso(LP());
  vec2 d=p-S0();float an=atan(d.y,d.x),rr=length(d);
  vec2 ac=vec2(an*1.05*LN*.8,rr*LN),id;
  vec4 v=vor(ac,id);
  vec2 tg=vec2(-sin(an),cos(an)),rd=vec2(cos(an),sin(an));
  vec2 rs=(v.x*tg/.8+v.y*rd)/LN;
  vec3 N=normalize(vec3((hash22(id+3.)-.5)*.7-rs*14.,1.));
  vec3 L=normalize(vec3(lp-p,.45));
  float nl=max(dot(N,L),0.),nh=max(dot(N,normalize(L+vec3(0.,0.,1.))),0.);
  vec2 oi=-N.xy*.03;
  vec3 see=G(uv,vec2(oi.x/u_asp,oi.y),.2,.005,1.);
  float core=1.-smoothstep(0.,.7,v.z);
  vec3 col=see*(.78+.36*nl)*(.9+.2*core);
  col+=hex(255.,172.,86.)*core*core*.14;
  col=mix(col,hex(255.,244.,228.),fres(N.z,.04)*.45);
  col+=hex(255.,250.,240.)*(pow(nh,160.)*1.2+pow(nh,20.)*.1);
  float gv=hash12(id+17.);
  col*=.84+.3*gv;
  col=mix(col,hex(255.,228.,194.),step(.84,gv)*.22);
  col*=.76+.24*smoothstep(0.,.1,v.w);
  col+=hex(255.,222.,176.)*smoothstep(.02,.06,v.w)*smoothstep(.13,.06,v.w)*.13;
  float lip=abs(fract(rr*LN/5.)-.5)*5.;
  col+=hex(255.,236.,208.)*exp(-lip*lip*5.)*.16*(.5+.5*nl);
  gl_FragColor=vec4(col,1.);
}`
  };

  /* 苔原 · 倾斜的地层：浅灰、土黄、橄榄、亮苔绿，炭黑压底，里面有草纤维、苔藓团和碎石粒；
     每一层是一片有色玻璃叠在上一片下面：上沿一道斜面接住左上来的光，下面落一道浅影，有的层磨砂、有的清透 */
  CARDS.tundra = {
    l0: [.2, .05], animate: false, scale: 1, bgRes: 1, bloom: [.2, .75], vig: .14,
    plate: { dark: 1, tint: [.1, .1, .08, .42] },
    bg: `
float Y(vec2 uv){return uv.y-.15*(uv.x-.5)+.03*fbm3(vec2(uv.x*2.2,4.))+.012*sin(uv.x*9.+1.);}
vec3 layer(float y){
  if(y<.08)return hex(212.,216.,219.);if(y<.25)return hex(178.,140.,70.);
  if(y<.37)return hex(110.,102.,48.);if(y<.52)return hex(184.,146.,74.);
  if(y<.62)return hex(160.,170.,58.);return hex(44.,45.,41.);}
vec3 bg(vec2 q,vec2 uv){
  float y=Y(uv);vec3 c=layer(y);
  float tuft=gnoise(vec2(q.x*38.+q.y*6.,q.y*12.))*.6+gnoise(vec2(q.x*90.,q.y*30.))*.4;
  float clump=fbm(q*8.+2.),spk=step(.985,hash12(floor(q*260.)));
  c*=(.84+.3*tuft+.3*clump)*step(.08,y)+(1.-step(.08,y));
  c=mix(c,c*vec3(.8,1.08,.7),smoothstep(.1,.4,clump)*step(.25,y)*step(y,.62)*.5);
  c=mix(c,hex(90.,92.,86.),spk*step(.62,y)*.6);
  float sun=exp(-length(q-vec2(-.1,-.1))*1.3);
  c*=.7+.62*sun;
  c+=hex(255.,236.,190.)*sun*.1;
  return c;
}`,
    fx: `
float Y(vec2 uv){return uv.y-.15*(uv.x-.5)+.03*fbm3(vec2(uv.x*2.2,4.))+.012*sin(uv.x*9.+1.);}
void main(){
  vec2 uv=v_uv,p=iso(uv);float y=Y(uv);
  float t0=-1.,fr=.006,gw=0.;
  if(y>=.62){t0=.62;fr=.004;}else if(y>=.52){t0=.52;fr=.001;gw=1.;}else if(y>=.37){t0=.37;fr=.009;}
  else if(y>=.25){t0=.25;fr=.0015;}else if(y>=.08){t0=.08;fr=.01;}
  float dd=y-t0,u=clamp(dd/.02,0.,1.),tt=1.-u,m=tt*tt;
  vec2 n2=normalize(vec2(.15,-1.));
  float wob=fbm3(vec2(p.x*3.,y*9.)+t0*10.);
  vec3 N=normalize(vec3(n2*tt*.9+vec2(wob*.12,wob*.05),sqrt(1.-tt*tt*.81)));
  vec3 col=G(uv,-N.xy*.03*vec2(1./u_asp,1.),.25,fr,1.);
  vec2 lp=iso(LP());vec3 L=normalize(vec3(lp-p,.5));
  float nh=max(dot(N,normalize(L+vec3(0.,0.,1.))),0.);
  col*=1.-.3*exp(-dd/.03)*(1.-m);
  col*=1.-.12*smoothstep(.0,.14,dd);
  col+=hex(214.,232.,96.)*gw*.1;
  col+=pow(nh,70.)*.7*m+m*.1;
  col=mix(col,vec3(.96),fres(N.z,.04)*.3);
  gl_FragColor=vec4(col,1.);
}`
  };

  /* 彩虹薄雾 · 灰蓝的天往下变暖白，主虹和反过来的副虹都是粉彩（虹的圆心跟着鼠标），主虹里面比外面亮、两道虹之间一条暗带；
     雾是一层层飘着的磨砂，把虹糊开又露出来，雾里有几道斜光 */
  CARDS.rainbow = {
    l0: [.3, .1], animate: true, scale: .6, bgRes: .6, bgPtr: true, bloom: [.3, .75], vig: .08,
    plate: { dark: 0, tint: [.95, .95, .93, .28] },
    bg: `
vec3 bg(vec2 q,vec2 uv){
  vec3 sky=mix(hex(96.,110.,138.),hex(190.,197.,203.),smoothstep(-.05,.85,uv.y));
  sky=mix(sky,hex(228.,224.,210.),smoothstep(.62,1.1,uv.y));
  float r=length(q-iso(vec2(mix(.3,u_ptr.x,u_hover*.7),1.08)));
  float R1=.74,R2=.96,x1=(r-R1)/.07,x2=(R2-r)/.095;
  float w1=exp(-x1*x1*1.1),w2=exp(-x2*x2*1.1);
  vec3 s1=mix(vec3(1.),hue(.375*(1.-clamp(x1,-1.,1.))),.66);
  vec3 s2=mix(vec3(1.),hue(.375*(1.-clamp(x2,-1.,1.))),.52);
  vec3 col=sky+hex(255.,250.,236.)*.1*smoothstep(R1,R1-.3,r);
  col-=.045*smoothstep(R1+.05,R1+.1,r)*smoothstep(R2-.02,R2-.08,r);
  col=mix(col,col*.35+s1*.78,w1*.5);
  col=mix(col,col*.5+s2*.6,w2*.28);
  return col;
}`,
    fx: `
float H(vec2 p){float t=u_time;return fbm(p*vec2(1.5,2.3)+vec2(t*.028,-t*.012))*.5+.5;}
void main(){
  vec2 uv=v_uv,p=iso(uv);float t=u_time;
  float m=smoothstep(.32,.78,H(p));
  vec3 N=NRM(p,.02,2./u_res.y);
  vec3 col=G(uv,-N.xy*vec2(.03/u_asp,.03),.7,mix(.002,.045,m),1.);
  col=mix(col,hex(236.,236.,232.),m*.28);
  vec2 lp=iso(LP());
  col+=hex(255.,250.,236.)*exp(-length(p-lp)*2.2)*.14*(.5+m);
  float sh=pow(.5+.5*fbm3(vec2((p.x-p.y*.4)*5.,t*.03)),3.);
  col+=hex(255.,252.,240.)*sh*.16*(.4+.6*m);
  col*=.94+.1*(1.-uv.y)*m;
  gl_FragColor=vec4(col,1.);
}`
  };

  /* 天水镜像 · 上面从深蓝到淡紫，到地平线一道暖橙，云慢慢飘；下面是同一片天倒过来，偏冷偏暗；
     水面是一层会动的玻璃：越远的水纹越细，把倒影揉碎，太阳贴着地平线（左右跟着鼠标），水面上一条碎金的光路 */
  CARDS.mirror = {
    l0: [.62, .455], animate: true, scale: .75, bgRes: .8, bgAnim: true, bloom: [.45, .6], vig: .12,
    plate: { dark: 1, tint: [.08, .1, .2, .3] },
    bg: `
const float HZ=.46;
vec3 sky(vec2 q,float y){
  float h=clamp(y/HZ,0.,1.);
  vec3 c=mix(hex(52.,80.,156.),hex(140.,152.,210.),smoothstep(0.,.7,h));
  c=mix(c,hex(232.,218.,226.),smoothstep(.62,.94,h));
  c=mix(c,hex(255.,156.,72.),smoothstep(.9,1.,h)*.9);
  float t=u_time*.01;
  float cl=fbm(vec2(q.x*1.2-t,y*4.6)+2.)*.5+.5;
  cl=smoothstep(.48,.8,cl)*smoothstep(.05,.45,h)*(1.-smoothstep(.8,.98,h));
  c=mix(c,mix(hex(238.,234.,246.),hex(255.,214.,190.),h),cl*.55);
  c+=hex(255.,190.,110.)*exp(-length(vec2(q.x-LP().x*u_asp,(y-HZ)*1.6))*5.)*.5;
  return c;}
vec3 bg(vec2 q,vec2 uv){
  if(uv.y<HZ)return sky(q,uv.y);
  float yr=2.*HZ-uv.y;
  return sky(vec2(q.x,yr),yr)*vec3(.8,.84,.94);
}`,
    fx: `
const float HZ=.46;
float H(vec2 p){
  float dy=p.y-HZ;if(dy<=0.)return 0.;
  vec2 w=vec2((p.x-.5*u_asp)/(dy+.02),1./(dy+.02));float t=u_time;
  float h=gnoise(vec2(w.x*.35,w.y*.9+t*.7))*.6+gnoise(vec2(w.x*.8-t*.2,w.y*2.1-t*.45))*.3+gnoise(vec2(w.x*1.7,w.y*4.)+t*.3)*.12;
  return h*dy*.55;
}
void main(){
  vec2 uv=v_uv,p=iso(uv);vec3 col;
  vec2 sp=vec2(LP().x*u_asp,HZ);
  if(p.y<HZ){col=B(uv,0.);}
  else{
    vec3 N=NRM(p,1.,1.5/u_res.y);
    float dy=p.y-HZ;
    vec3 refl=G(uv,vec2(N.x*.02/u_asp,N.y*.08),.2,.0015+dy*.012,1.);
    col=mix(hex(20.,30.,52.),refl,mix(.95,.55,smoothstep(0.,.5,dy)));
    float colm=exp(-pow((p.x-sp.x)/(.03+dy*.3),2.));
    float g=smoothstep(.55,.95,-N.y*6.+hash12(floor(p*vec2(300.,120.)))*.3);
    col+=hex(255.,214.,150.)*g*colm*(1.-smoothstep(0.,.55,dy)*.6)*.9;
  }
  col+=hex(255.,176.,96.)*exp(-abs(p.y-HZ)*160.)*.35;
  gl_FragColor=vec4(col,1.);
}`
  };

  /* 冰泉 · 中间乳白的浅青，往外到湖蓝、到深青；水面绕着漩涡流（漩涡跟着鼠标）：把底折射得晃动，
     把光聚成一张亮网落在底上，乳白的水丝顺着流向走，高光和天光浮在水面 */
  CARDS.spring = {
    l0: [.3, .12], animate: true, scale: .72, bgRes: .7, bloom: [.35, .7], vig: .14,
    plate: { dark: 0, tint: [.9, .98, 1, .26] },
    bg: `
vec3 bg(vec2 q,vec2 uv){
  vec2 c=vec2(.6*u_asp,.3);float r=length((q-c)*vec2(1.,1.1));
  vec3 col=mix(hex(168.,234.,240.),hex(46.,188.,210.),smoothstep(0.,.42,r));
  col=mix(col,hex(10.,98.,124.),smoothstep(.38,1.,r));
  col*=.86+.24*smoothstep(-.3,.35,fbm(q*3.2+3.));
  col=mix(col,col*vec3(.7,.86,.9),smoothstep(.25,.5,fbm(q*7.+9.))*.35);
  return col;
}`,
    fx: `
vec2 VC(){return iso(mix(vec2(.6,.32),u_ptr,u_hover*.7));}
float PH(vec2 p){vec2 d=p-VC();float r=length(d);return atan(d.y,d.x)+1.8/(r+.22)-u_time*.3;}
float H(vec2 p){
  vec2 d=p-VC();float r=length(d),sw=PH(p);
  vec2 q=vec2(cos(sw),sin(sw))*r;
  return fbm3(q*3.2+vec2(u_time*.05,0.))*.7+.18*sin(sw*2.+r*12.);
}
void main(){
  vec2 uv=v_uv,p=iso(uv);
  float h=H(p),e=2./u_res.y;vec3 N=NRM(p,.05,1.5/u_res.y);
  vec3 col=G(uv,-N.xy*vec2(.05/u_asp,.05),.25,.008,1.);
  col=mix(col,hex(196.,240.,244.),.12);
  float lap=(H(p+vec2(e,0.))+H(p-vec2(e,0.))+H(p+vec2(0.,e))+H(p-vec2(0.,e))-4.*h)/(e*e);
  col+=hex(220.,255.,255.)*clamp(-lap*.0006,0.,1.)*.5;
  float f=abs(sin(PH(p)*3.+fbm3(p*6.)*1.5));
  float foam=smoothstep(.12,0.,f)*smoothstep(-.2,.3,fbm3(p*4.+u_time*.05));
  col=mix(col,hex(246.,252.,252.),foam*.7);
  vec2 lp=iso(LP());vec3 L=normalize(vec3(lp-p,.5));
  float nh=max(dot(N,normalize(L+vec3(0.,0.,1.))),0.);
  col+=pow(nh,80.)*.6+pow(nh,8.)*.05;
  col=mix(col,vec3(.9,.97,1.),fres(N.z,.02)*.4);
  gl_FragColor=vec4(col,1.);
}`
  };

  /* ---------------- WebGL ---------------- */
  var VERT = 'attribute vec2 a;varying vec2 v_uv;void main(){v_uv=vec2(a.x*.5+.5,.5-a.y*.5);gl_Position=vec4(a,0.,1.);}';
  var UNIFORMS = ['u_res', 'u_asp', 'u_time', 'u_ptr', 'u_hover', 'u_lk', 'u_l0', 'u_bg', 'u_bgsz', 'u_src', 'u_fx', 'u_dn', 'u_dnsz',
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
  // 最近的 2 的幂（要生成 mipmap 的贴图 WebGL1 只认 2 的幂），夹在 64–1024
  function pow2(x) { return Math.pow(2, Math.max(6, Math.min(10, Math.round(Math.log(Math.max(x, 1)) / Math.LN2)))); }

  function Card(el, name, def) {
    var canvas = el.querySelector('canvas.fx');
    var gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, preserveDrawingBuffer: false });
    if (!gl) throw new Error('no webgl');
    var ext = gl.getExtension('EXT_shader_texture_lod') ? '#extension GL_EXT_shader_texture_lod : enable\n#define LOD 1\n' : '';
    this.P = {
      bg: program(gl, HEAD + LIB + def.bg + BG_MAIN, name + ' bg'),
      fx: program(gl, ext + HEAD + LIB + FXLIB + def.fx, name + ' fx'),
      dn: program(gl, DOWN, name + ' dn'),
      ui: program(gl, ext + HEAD + LIB + UI, name + ' ui')
    };
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
      var gl = this.gl, br = 1.16 * (this.def.bgRes || 1);
      [this.tBG, this.tFX, this.tDN].forEach(function (t) { if (t) { gl.deleteTexture(t.tex); gl.deleteFramebuffer(t.fbo); } });
      this.w = c.width = w; this.h = c.height = h; this.asp = cw / ch;
      this.tBG = target(gl, pow2(w * br), pow2(h * br), true);
      this.tFX = target(gl, w, h, false);
      this.tDN = target(gl, pow2(w / 2), pow2(h / 2), true);
      this.bgDirty = true; this.relayout = true;
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
    // 1 背景光场
    if (this.bgDirty || d.bgAnim || (d.bgPtr && this.moved)) {
      this.use(this.P.bg, this.tBG, t);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindTexture(gl.TEXTURE_2D, this.tBG.tex);
      gl.generateMipmap(gl.TEXTURE_2D);
      this.bgDirty = false;
    }
    // 2 玻璃
    u = this.use(this.P.fx, this.tFX, t);
    gl.bindTexture(gl.TEXTURE_2D, this.tBG.tex);
    gl.uniform1i(u.u_bg, 0);
    gl.uniform2f(u.u_bgsz, this.tBG.w, this.tBG.h);
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

  Array.prototype.forEach.call(document.querySelectorAll('.card[data-fx]'), function (el) {
    var name = el.getAttribute('data-fx'), def = CARDS[name], card;
    if (!def) return;
    try { card = new Card(el, name, def); } catch (e) {
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
  });

  function byEl(el) { for (var i = 0; i < cards.length; i++) if (cards[i].el === el) return cards[i]; return null; }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { var c = byEl(e.target); if (c) { c.visible = e.isIntersecting; if (c.visible) c.dirty = true; } });
    }, { rootMargin: '160px' });
    cards.forEach(function (c) { io.observe(c.el); });
  }
  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(function (es) {
      es.forEach(function (e) { var c = byEl(e.target); if (c) { c.relayout = true; c.dirty = true; } });
    });
    cards.forEach(function (c) { ro.observe(c.el); });
  } else {
    window.addEventListener('resize', function () { cards.forEach(function (c) { c.relayout = true; c.dirty = true; }); });
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { cards.forEach(function (c) { c.relayout = true; c.dirty = true; }); });
  }

  var start = performance.now();
  function frame(now) {
    var t = reduced ? 20 : 20 + (now - start) / 1000;
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      if (!c.visible || c.dead) continue;
      var moved = c.ease(), anim = c.def.animate && !reduced;
      if (!(moved || c.dirty || (anim && now - c.last > 30))) continue;
      c.moved = moved;
      try { c.draw(anim ? t : 20); } catch (e) {
        c.dead = true; c.el.classList.add('no-fx');
        if (window.console) console.warn('质感卡片', c.name, e.message);
      }
      c.dirty = false; c.last = now;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  window.textureCards = { count: function () { return cards.length; }, names: function () { return cards.map(function (c) { return c.name; }); } };
})();
