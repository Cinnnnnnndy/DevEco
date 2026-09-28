/* 质感卡片 · 每张参考图只抽三样：序列（结构和节奏）、颜色对比（哪些色、各占多少）、质感（材质细节），
   全部由片元着色器（WebGL1）现算，不画具体的东西。
   每个着色器都算出四个结果，由 u_view 选一个输出：
     0 合成   三层叠在一起
     1 序列   灰度的结构：条、环、带、流线怎么排
     2 配色   平涂色块：只看用了哪些色、各占多少
     3 质感   颜色换成中性灰：只看颗粒、纤维、反光
   u_ptr / u_hover：鼠标在卡片上的位置（0–1）和「在不在卡片上」，已缓动。各卡跟着鼠标走的东西不同：
   塑料膜、冰沙是光源，石塔是最高那格，月晕是光心，天水镜像是对称轴，冰泉是漩涡，彩虹是色带位置，苔原是地层视差。
   会动的（横带、雾、水）只在卡片进入视口时逐帧画，静态的只在鼠标或视图变化时重画；减少动效时停在一帧。
   塑料膜多一层画在内容上面：高光压在印刷的字上（只在合成和质感视图里出现）。 */
(function () {
  'use strict';

  var COMMON = [
    'precision highp float;',
    'varying vec2 v_uv;',
    'uniform vec2 u_res;uniform float u_time;uniform vec2 u_ptr;uniform float u_hover;uniform float u_mode;uniform float u_view;',
    'float hash12(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}',
    'vec2 hash22(vec2 p){vec3 p3=fract(vec3(p.xyx)*vec3(.1031,.1030,.0973));p3+=dot(p3,p3.yzx+33.33);return fract((p3.xx+p3.yz)*p3.zy);}',
    'float gnoise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*f*(f*(f*6.-15.)+10.);',
    '  float a=dot(hash22(i)*2.-1.,f),b=dot(hash22(i+vec2(1.,0.))*2.-1.,f-vec2(1.,0.));',
    '  float c=dot(hash22(i+vec2(0.,1.))*2.-1.,f-vec2(0.,1.)),d=dot(hash22(i+vec2(1.,1.))*2.-1.,f-vec2(1.,1.));',
    '  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);}',
    'const mat2 ROT=mat2(1.6,1.2,-1.2,1.6);',
    'float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*gnoise(p);p=ROT*p;a*=.5;}return s;}',
    'float fbm3(vec2 p){float s=0.,a=.5;for(int i=0;i<3;i++){s+=a*gnoise(p);p=ROT*p;a*=.5;}return s;}',
    'vec3 hex(float r,float g,float b){return vec3(r,g,b)/255.;}',
    'float grain(){return hash12(gl_FragCoord.xy+fract(u_time*.37)*391.)-.5;}',
    'float asp(){return u_res.x/u_res.y;}',
    'vec2 P(){return vec2(v_uv.x*asp(),v_uv.y);}',
    'float lum(vec3 c){return dot(c,vec3(.2126,.7152,.0722));}',
    'vec3 pick(vec3 comb,vec3 seqc,vec3 flatc,vec3 texc){if(u_view<.5)return comb;if(u_view<1.5)return seqc;if(u_view<2.5)return flatc;return texc;}',
    ''
  ].join('\n');

  var SHADERS = {};

  /* 塑料膜 · 序列：两组斜褶，一密一疏，折线处是硬的（三角波）；对比：洋红、黑、白硬碰硬，背光的褶转紫；
     质感：镜面反光——影棚的柔光箱和灯管反射在褶上，再加跟着鼠标的点光 */
  SHADERS.film = [
    'float tri(float x){return abs(fract(x)-.5)*2.;}',
    'vec2 warp(vec2 p){return p+vec2(fbm3(p*1.1+1.3),fbm3(p*1.1+7.1))*.14;}',
    'float pleat(vec2 q){return tri(dot(q,vec2(.876,.482))*3.4+fbm3(q*1.4)*.6)*.6+tri(dot(q,vec2(-.371,.928))*1.9+fbm3(q*1.8+4.)*.5)*.4;}',
    'float H(vec2 p){vec2 q=warp(p);return pleat(q)*.17+.55*fbm3(q*vec2(1.2,1.6)+3.7)+.035*fbm3(p*vec2(12.,17.)+11.)+.012*gnoise(p*60.);}',
    'void main(){',
    '  vec2 p=P();float e=1.5/u_res.y;',
    '  float h0=H(p),hx=H(p+vec2(e,0.)),hy=H(p+vec2(0.,e));',
    '  vec3 N=normalize(vec3(-(hx-h0)/e*.08,-(hy-h0)/e*.08,1.));',
    '  vec2 lp=mix(vec2(.2*asp(),.1),vec2(u_ptr.x*asp(),u_ptr.y),u_hover);',
    '  vec3 L=normalize(vec3(lp-p,.45));vec3 V=vec3(0.,0.,1.);float nh=max(dot(N,normalize(L+V)),0.);',
    '  vec3 R=reflect(-V,N);',
    '  float box=smoothstep(.62,.97,dot(R,normalize(vec3(-.42,-.55,.72))));',
    '  float tube=smoothstep(.06,0.,abs(R.y+.46+.12*R.x))*smoothstep(.9,.35,abs(R.x+.1));',
    '  float E=.26+.85*box+.5*tube+.4*pow(nh,6.)+.16*N.z;',
    '  vec3 col=mix(hex(104.,12.,60.),hex(234.,42.,144.),clamp(E,0.,1.15));',
    '  float irid=smoothstep(.05,.32,N.x+.15*N.y)*(1.-clamp(E*.85,0.,1.));',
    '  col=mix(col,hex(130.,72.,226.)*(.35+.8*E),irid*.62);',
    '  col=mix(col,hex(255.,182.,222.),smoothstep(.95,1.4,E)*.55);',
    '  float gloss=pow(nh,70.)*1.1+smoothstep(1.1,1.5,E)*.45+tube*.12;',
    '  if(u_mode>.5){',
    '    if(u_view>.5&&u_view<2.5){gl_FragColor=vec4(0.);return;}',
    '    float a=clamp(gloss,0.,1.)*.62;vec3 gc=u_view>2.5?vec3(1.):mix(vec3(1.),hex(255.,196.,232.),.4);',
    '    float sh=(1.-smoothstep(.05,.35,E))*.16;gl_FragColor=vec4(gc*a,a+sh*(1.-a));return;}',
    '  vec3 seqc=vec3(.12+.76*pleat(warp(p)));',
    '  vec3 flatc=E<.4?hex(120.,14.,68.):(irid>.4?hex(128.,70.,224.):(E<1.05?hex(232.,40.,142.):hex(255.,176.,218.)));',
    '  vec3 texc=vec3(lum(col))*1.05;',
    '  gl_FragColor=vec4(pick(col+grain()*.015,seqc,flatc,texc),1.);}'
  ].join('\n');

  /* 月晕 · 序列：以光心为圆心的几圈光环，被一条条横向暗带切开（暗带慢慢往左漂）；
     对比：大面积近黑，中间一小块冷白，环上很淡的黄和紫；质感：柔、散、胶片颗粒。光心跟着鼠标 */
  SHADERS.moon = [
    'void main(){',
    '  vec2 p=P();float t=u_time;',
    '  vec2 c=mix(vec2(.62*asp(),.27),vec2(u_ptr.x*asp(),u_ptr.y),u_hover*.85);',
    '  float r=length((p-c)*vec2(1.,1.06));',
    '  float yy=p.y+.03*fbm3(vec2(p.x*1.4-t*.03,p.y*5.));',
    '  float bands=sin(yy*30.+sin(yy*6.3+1.)*1.8)*.5+.5;',
    '  float dark=smoothstep(.4,.78,bands)*smoothstep(-.35,.25,fbm3(vec2(p.x*1.8-t*.025,yy*8.)));',
    '  float core=smoothstep(.058,.054,r);',
    '  float halo=exp(-r*4.2)*.78+exp(-r*1.7)*.2;',
    '  float r1=exp(-pow((r-.30)/.05,2.)),r2=exp(-pow((r-.42)/.065,2.));',
    '  vec3 cool=hex(214.,226.,240.);',
    '  vec3 Lc=cool*halo+hex(198.,190.,124.)*r1*.32+hex(150.,116.,152.)*r2*.18;',
    '  float occ=dark*(1.-exp(-r*6.)*.55);',
    '  vec3 comb=mix(hex(5.,6.,9.),hex(14.,15.,19.),v_uv.y)+Lc*(1.-occ*.85);',
    '  comb+=cool*exp(-r*3.)*.1*smoothstep(.1,.5,dark)*smoothstep(.95,.5,dark);',
    '  comb=mix(comb,hex(244.,246.,248.),core*(1.-dark*.35));',
    '  float g=grain();comb+=g*.035;',
    '  float st=floor(clamp(1.-r/.62,0.,1.)*6.)/6.;',
    '  vec3 seqc=mix(vec3(.07+.82*st*(1.-dark*.75)),vec3(1.),core);',
    '  vec3 flatc=hex(10.,11.,14.);',
    '  if(r<.2)flatc=hex(150.,162.,176.);else if(r<.34)flatc=hex(92.,100.,110.);else if(r<.38)flatc=hex(186.,178.,120.);else if(r<.48)flatc=hex(122.,102.,126.);',
    '  flatc=mix(flatc,hex(24.,26.,32.),step(.5,dark)*step(.058,r)*.9);flatc=mix(flatc,hex(244.,246.,248.),core);',
    '  gl_FragColor=vec4(pick(comb,seqc,flatc,vec3(lum(comb))+g*.04),1.);}'
  ].join('\n');

  /* 石塔 · 序列：23 根竖条从最高处往两边一级级降（每级同样的落差），最高那格跟着鼠标；
     对比：大面积钴蓝对暖灰，只在最高的几根上有错落的暖黄点；质感：混凝土细颗粒、竖向雨痕、柱面圆弧明暗 */
  SHADERS.tower = [
    'void main(){',
    '  vec2 uv=v_uv;float x=uv.x,y=uv.y;float N=15.;',
    '  float fi=floor(x*N),fx=fract(x*N);',
    '  float c=mix(N*.5-.5,clamp(u_ptr.x,0.,1.)*N-.5,u_hover);',
    '  float k=min(floor(abs(fi-c)+.5),5.);float s=k/5.;',
    '  vec3 conc=hex(112.,106.,116.),cob=hex(30.,78.,186.),warm=hex(252.,200.,92.);',
    '  vec3 fc=mix(conc,cob,s);',
    '  fc*=mix(1.08,.92,smoothstep(0.,1.,y));fc+=hex(255.,190.,110.)*smoothstep(.8,1.,y)*.06*(1.-s);',
    '  float ly=(y-.1)/.034;float row=floor(ly);float lxv=fract(fx*1.+mod(row,2.)*.5);',
    '  float on=step(.45,hash12(vec2(fi,row)+3.))*step(k,1.)*step(0.,ly)*step(ly,12.);',
    '  float slot=smoothstep(.16,.09,abs(lxv-.5))*smoothstep(.34,.18,abs(fract(ly)-.5))*on;',
    '  float glow=on*exp(-length(vec2(lxv-.5,(fract(ly)-.5)*1.3))*5.)*.3;',
    '  float flute=.82+.3*sin(3.14159*fx);float groove=smoothstep(0.,.06,fx)*smoothstep(1.,.94,fx);',
    '  float gr=(hash12(gl_FragCoord.xy*.73)-.5)*.08;float streak=fbm3(vec2(x*130.,y*2.2))*.08;',
    '  float T=(flute+gr+streak)*(.45+.55*groove);',
    '  vec3 comb=mix(fc*T,warm,slot)+warm*glow*(1.-slot);',
    '  vec3 seqc=vec3(.18+.66*(1.-s))*(.55+.45*groove);seqc=mix(seqc,vec3(1.),slot);',
    '  vec3 flatc=mix(fc,warm,slot);',
    '  vec3 texc=mix(vec3(.55)*T,vec3(.95),slot*.7);',
    '  gl_FragColor=vec4(pick(comb,seqc,flatc,texc),1.);}'
  ].join('\n');

  /* 冰沙 · 序列：颗粒沿着挖痕的同心弧一道道排开，每四道弧有一道亮边；
     对比：同一个橙色系从深砖红到杏色，高光是奶白；质感：半透明，每颗冰晶一个小圆顶，光跟着鼠标 */
  SHADERS.slush = [
    'void main(){',
    '  vec2 p=P();vec2 lp=mix(vec2(.3*asp(),.1),vec2(u_ptr.x*asp(),u_ptr.y),u_hover);',
    '  vec2 s0=vec2(1.08*asp(),-.12);vec2 d=p-s0;float rr=length(d)+fbm3(p*3.)*.012;float ang=atan(d.y,d.x);',
    '  float n=fbm(p*1.8+1.3);',
    '  vec3 deep=hex(182.,66.,18.),mid=hex(232.,130.,32.),hi=hex(250.,192.,110.),cream=hex(255.,242.,226.);',
    '  float glow=exp(-length((p-vec2(.42*asp(),.34))*vec2(1.,1.2))*1.9);',
    '  float tone=smoothstep(-.5,.4,n)*.75+.25;',
    '  vec3 base=mix(deep,mid,tone);base=mix(base,hi,glow*.62);',
    '  float lanes=rr*20.;float lane=floor(lanes);',
    '  float lip=smoothstep(.07,0.,fract(lanes))*step(mod(lane,4.),.5)*smoothstep(1.5,.6,rr);',
    '  float rl=(lane+.5)/20.;vec2 g=vec2(ang*rl*20.+mod(lane,2.)*.5,lanes);vec2 gi=floor(g),gf=fract(g);',
    '  vec2 dv=gf-(vec2(.5)+(hash22(gi)-.5)*vec2(.3,.2));',
    '  float rad=.2+.18*hash12(gi+4.)+.08*glow;',
    '  float gm=smoothstep(rad,rad*.6,length(dv))*step(.3,hash12(gi+9.));',
    '  vec3 dn=normalize(vec3(dv/max(rad,.001)*1.1,1.));vec3 Ld=normalize(vec3(lp-p,.5));',
    '  float shade=(dot(dn,Ld)-.7)*gm;',
    '  float spk=pow(max(dot(reflect(-Ld,dn),vec3(0.,0.,1.)),0.),26.)*gm;',
    '  vec3 comb=base*(1.+shade*.6)+cream*spk*.85+cream*lip*.3;',
    '  comb=mix(comb,cream,gm*smoothstep(.6,1.,dot(dn,Ld))*.24);',
    '  float gg=grain();comb+=gg*.02;',
    '  vec3 seqc=vec3(.1)+vec3(.78)*gm+vec3(.45)*lip;',
    '  float lev=tone*.6+glow*.55;',
    '  vec3 flatc=lev<.52?deep:(lev<.78?mid:hi);flatc=mix(flatc,cream,max(step(.5,gm),lip));',
    '  vec3 texc=vec3(.55)*(1.+shade*.6)+vec3(spk*.85+lip*.3)+gg*.03;',
    '  gl_FragColor=vec4(pick(comb,seqc,flatc,texc),1.);}'
  ].join('\n');

  /* 苔原 · 序列：横向地层，厚薄交替、微微倾斜，中间夹一条亮绿，下面一大块炭黑；
     对比：土黄、赭石、橄榄占大面积，苔藓绿一小条，炭黑压底；质感：草的纤维、苔藓的团块、玄武岩碎粒。鼠标上下有一点视差 */
  SHADERS.tundra = [
    'void main(){',
    '  vec2 uv=v_uv;vec2 p=P();float x=uv.x;',
    '  float yy=uv.y+x*.05+.018*fbm3(vec2(x*3.,uv.y*2.))+(u_ptr.y-.5)*.03*u_hover*(1.-uv.y);',
    '  float m;vec3 fc;',
    '  if(yy<.07){m=0.;fc=hex(212.,216.,219.);}',
    '  else if(yy<.16){m=1.;fc=hex(178.,140.,70.);}',
    '  else if(yy<.20){m=1.;fc=hex(156.,123.,76.);}',
    '  else if(yy<.27){m=1.;fc=hex(110.,102.,48.);}',
    '  else if(yy<.29){m=2.;fc=hex(140.,78.,46.);}',
    '  else if(yy<.37){m=1.;fc=hex(184.,146.,72.);}',
    '  else if(yy<.40){m=1.;fc=hex(150.,118.,74.);}',
    '  else if(yy<.46){m=3.;fc=hex(160.,170.,58.);}',
    '  else if(yy<.48){m=1.;fc=hex(96.,92.,44.);}',
    '  else if(yy<.965){m=4.;fc=hex(44.,45.,41.);}',
    '  else if(yy<.98){m=5.;fc=hex(94.,103.,108.);}',
    '  else{m=4.;fc=hex(44.,45.,41.);}',
    '  float fib=gnoise(vec2(p.x*260.,p.y*46.))*.45+gnoise(vec2(p.x*110.+3.,p.y*24.))*.3+gnoise(p*60.)*.25;',
    '  float T=1.;',
    '  if(m<.5)T=1.+fbm3(p*vec2(3.,9.))*.06;',
    '  else if(m<1.5)T=.84+.28*fib;',
    '  else if(m<2.5)T=.9+.2*fib;',
    '  else if(m<3.5)T=.78+.4*smoothstep(-.25,.45,fbm(p*9.))+.14*smoothstep(.45,.75,gnoise(p*140.));',
    '  else if(m<4.5){vec2 g=p*22.;vec2 gi=floor(g),gf=fract(g);float f1=9.;vec2 rp1=vec2(0.);',
    '    for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 o=vec2(float(i),float(j));vec2 rp=o+hash22(gi+o)-gf;float dd=dot(rp,rp);if(dd<f1){f1=dd;rp1=rp;}}',
    '    float peb=smoothstep(.42,.3,sqrt(f1))*(.5+.5*(-rp1.y+.3));T=.9+.25*peb+fbm3(p*6.)*.12;}',
    '  else T=1.+.06*gnoise(vec2(p.x*2.,p.y*120.));',
    '  float gg=grain();',
    '  vec3 comb=fc*T+gg*.03;',
    '  vec3 seqc=vec3(smoothstep(.02,.8,lum(fc)));',
    '  gl_FragColor=vec4(pick(comb,seqc,fc,vec3(.55)*T+gg*.03),1.);}'
  ].join('\n');

  /* 彩虹薄雾 · 序列：一道主虹、一道颜色反过来的淡副虹，中间夹一条更暗的天；
     对比：灰蓝底上几乎没有饱和度的粉彩；质感：雾的颗粒和慢慢飘的明暗，没有硬边。鼠标左右推动色带 */
  SHADERS.rainbow = [
    'vec3 pastel(float x){vec3 c0=hex(236.,190.,160.),c1=hex(236.,218.,156.),c2=hex(203.,226.,176.),c3=hex(182.,224.,212.),c4=hex(168.,200.,236.),c5=hex(188.,180.,222.);',
    '  x=clamp(x,0.,1.)*5.;if(x<1.)return mix(c0,c1,x);if(x<2.)return mix(c1,c2,x-1.);if(x<3.)return mix(c2,c3,x-2.);if(x<4.)return mix(c3,c4,x-3.);return mix(c4,c5,x-4.);}',
    'void main(){',
    '  vec2 uv=v_uv;vec2 p=P();float t=u_time;',
    '  vec3 base=mix(hex(128.,142.,162.),hex(172.,182.,192.),smoothstep(0.,.5,uv.y));base=mix(base,hex(206.,208.,205.),smoothstep(.45,1.,uv.y));',
    '  float m=fbm(p*1.6+vec2(t*.015,-t*.006));',
    '  vec2 A=vec2(.08*asp(),1.18),B=vec2(.9*asp(),-.22);vec2 D=normalize(B-A);vec2 Nn=vec2(-D.y,D.x);',
    '  float bw=.2;float s=dot(p-A,Nn)+(u_ptr.x-.5)*.1*u_hover;float al=dot(p-A,D)/length(B-A);',
    '  float xs=s/bw,xs2=(s+bw*2.9)/(bw*1.25);',
    '  float band=smoothstep(1.,.3,abs(xs)),band2=smoothstep(1.,.35,abs(xs2));',
    '  float gap=smoothstep(-.95,-1.15,xs)*smoothstep(1.,1.2,xs2);',
    '  float fade=smoothstep(.04,.42,al)*smoothstep(1.04,.58,al);',
    '  float patchy=.5+.5*smoothstep(-.3,.5,fbm(p*2.2+vec2(t*.01,t*.012)));',
    '  vec3 comb=mix(base,hex(226.,229.,230.),smoothstep(-.15,.55,m)*.3);',
    '  comb*=1.-gap*fade*.07;',
    '  comb=mix(comb,pastel(xs*.5+.5)*1.04,band*fade*patchy*.74);',
    '  comb=mix(comb,pastel(.5-.5*xs2),band2*fade*patchy*.32);',
    '  comb+=smoothstep(.3,1.6,xs)*fade*.045;',
    '  float gg=grain();comb+=gg*.018;',
    '  float q1=floor(clamp(xs*.5+.5,0.,.999)*6.)/5.,q2=floor(clamp(.5-.5*xs2,0.,.999)*6.)/5.;',
    '  vec3 seqc=vec3(.34-gap*fade*.12);seqc=mix(seqc,vec3(.5+.45*q1),step(.5,band)*step(.2,fade));seqc=mix(seqc,vec3(.42+.25*q2),step(.5,band2)*step(.2,fade));',
    '  vec3 flatc=uv.y<.45?hex(132.,146.,166.):hex(196.,200.,202.);',
    '  flatc=mix(flatc,pastel(q1),step(.5,band)*step(.2,fade));flatc=mix(flatc,mix(flatc,pastel(q2),.6),step(.5,band2)*step(.2,fade));',
    '  gl_FragColor=vec4(pick(comb,seqc,flatc,vec3(lum(comb))+gg*.02),1.);}'
  ].join('\n');

  /* 天水镜像 · 序列：一条水平对称轴，上下是同一片纹理，下半部分越往下水纹越疏；轴跟着鼠标上下；
     对比：冷的蓝紫对轴线上一道暖橙，下半部整体压暗偏蓝；质感：上面柔的云絮，下面水的横纹 */
  SHADERS.mirror = [
    'float F(vec2 q,float t){vec2 cq=vec2(q.x*1.1+t*.004,q.y*2.6);vec2 wq=vec2(fbm3(cq*1.6),fbm3(cq*1.6+5.));return fbm(cq*1.5+wq*.9);}',
    'vec3 skyP(float h,float f){',
    '  vec3 base=mix(hex(246.,158.,86.),hex(206.,212.,232.),smoothstep(0.,.08,h));base=mix(base,hex(108.,134.,194.),smoothstep(.08,.42,h));',
    '  vec3 cl=mix(hex(92.,100.,132.),hex(236.,238.,248.),smoothstep(-.3,.45,f*1.2+.1));cl=mix(cl,hex(240.,172.,146.),smoothstep(.18,.03,h)*.8);',
    '  return mix(base,cl,smoothstep(-.08,.32,f)*.85);}',
    'void main(){',
    '  vec2 uv=v_uv;float t=u_time;',
    '  float axis=mix(.40,clamp(u_ptr.y,.30,.46),u_hover);',
    '  float dy=uv.y-axis;float below=step(0.,dy);float depth=max(dy,0.);',
    '  float lc=pow(depth,.75)*22.;',
    '  float rip=below*(sin(lc*6.2832+gnoise(vec2(uv.x*3.,lc))*2.)*.004+gnoise(vec2(uv.x*5.,lc*2.))*.003);',
    '  vec2 q=vec2(uv.x*asp()+rip*asp(),abs(dy)*mix(1.,1.05,below)+rip*.3);',
    '  float f=F(q,t);',
    '  vec3 col=skyP(q.y,f);',
    '  col=mix(col,col*vec3(.7,.78,.9)*mix(1.,.6,smoothstep(0.,.6,depth)),below);',
    '  float line=smoothstep(.965,1.,sin(lc*6.2832))*below*smoothstep(.02,.14,depth);',
    '  col+=hex(200.,214.,236.)*line*.05;',
    '  float ax=exp(-abs(dy)*u_res.y*.35);vec3 warm=hex(255.,156.,64.);',
    '  col=mix(col,warm*1.05,ax*.9);col+=warm*exp(-abs(dy)*40.)*.18;',
    '  float gg=grain();col+=gg*.02;',
    '  float dens=smoothstep(-.08,.32,f);',
    '  vec3 seqc=vec3(.2+.55*dens)*mix(1.,.68,below)+line*.14;seqc=mix(seqc,vec3(1.),ax);',
    '  float zone=step(.08,q.y)+step(.25,q.y);',
    '  vec3 flatc=zone<.5?hex(240.,170.,120.):(zone<1.5?hex(200.,206.,228.):hex(112.,136.,194.));',
    '  flatc=mix(flatc,hex(226.,230.,242.),step(.5,dens));flatc=mix(flatc,flatc*vec3(.62,.72,.86),below);flatc=mix(flatc,warm,step(.5,ax));',
    '  gl_FragColor=vec4(pick(col,seqc,flatc,vec3(lum(col))),1.);}'
  ].join('\n');

  /* 冰泉 · 序列：流函数的等值线——绕漩涡的一根根白丝，往外被水流拉直；漩涡跟着鼠标；
     对比：青绿、乳白、深青同一冷色系，漩涡中心最深；质感：乳白的通透和水花颗粒。下半部白丝收一点，好放字 */
  SHADERS.spring = [
    'void main(){',
    '  vec2 p=P();float t=u_time*.22;',
    '  vec2 c=mix(vec2(.62*asp(),.3),vec2(u_ptr.x*asp(),u_ptr.y),u_hover*.8);',
    '  vec2 d=p-c;float r=length(d)+.002;',
    '  float psi=.5*log(r)+p.x*.85+.32*fbm(p*2.1+vec2(0.,-t));',
    '  float lf=abs(fract(psi*8.)-.5);float w=.025+.08*smoothstep(-.35,.5,fbm3(p*3.+t));',
    '  float calm=mix(1.,.45,smoothstep(.45,.75,v_uv.y));',
    '  float fil=smoothstep(w,0.,lf)*calm*smoothstep(-.45,.05,fbm3(p*5.+vec2(t*.5,0.)));',
    '  float foam=smoothstep(.25,.75,fbm(p*6.5+vec2(0.,-t*2.)));',
    '  vec3 deep=hex(10.,100.,128.),mid=hex(46.,184.,206.),hi=hex(150.,226.,238.),milk=hex(228.,247.,250.);',
    '  float g=smoothstep(0.,.5,r);float hz=fbm3(p*1.5+t*.2)+.3;',
    '  vec3 base=mix(deep,mid,g);base=mix(base,hi,smoothstep(.1,.7,hz)*.6);',
    '  vec3 comb=mix(base,milk,clamp(fil*.85+foam*fil*.1+smoothstep(.22,0.,lf)*.12*calm,0.,1.));',
    '  float gg=grain();comb+=gg*.02;',
    '  vec3 seqc=vec3(.1)+vec3(.85)*fil;',
    '  vec3 flatc=g<.35?deep:(hz>.4?hi:mid);flatc=mix(flatc,milk,step(.5,fil));',
    '  gl_FragColor=vec4(pick(comb,seqc,flatc,vec3(lum(comb))+gg*.02),1.);}'
  ].join('\n');

  var VERT = 'attribute vec2 a;varying vec2 v_uv;void main(){v_uv=vec2(a.x*.5+.5,.5-a.y*.5);gl_Position=vec4(a,0.,1.);}';

  function compile(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      var log = gl.getShaderInfoLog(s);
      gl.deleteShader(s);
      throw new Error(log);
    }
    return s;
  }

  function Layer(canvas, name, mode, scale) {
    var gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false });
    if (!gl) throw new Error('no webgl');
    var prog = gl.createProgram();
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, COMMON + SHADERS[name]));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    this.gl = gl; this.canvas = canvas; this.mode = mode; this.scale = scale;
    this.u = {};
    ['u_res', 'u_time', 'u_ptr', 'u_hover', 'u_mode', 'u_view'].forEach(function (k) { this.u[k] = gl.getUniformLocation(prog, k); }, this);
  }
  Layer.prototype.draw = function (t, card) {
    var gl = this.gl, c = this.canvas;
    var s = Math.min(window.devicePixelRatio || 1, 2) * this.scale;
    var w = Math.max(1, Math.round(c.clientWidth * s)), h = Math.max(1, Math.round(c.clientHeight * s));
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
    gl.viewport(0, 0, w, h);
    gl.uniform2f(this.u.u_res, w, h);
    gl.uniform1f(this.u.u_time, t);
    gl.uniform2f(this.u.u_ptr, card.ptr[0], card.ptr[1]);
    gl.uniform1f(this.u.u_hover, card.hover);
    gl.uniform1f(this.u.u_mode, this.mode);
    gl.uniform1f(this.u.u_view, view);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  // 每种质感：会不会自己动、画布分辨率倍率（柔的画低一点省电）、要不要内容上面那一层
  var KINDS = {
    film: { animate: false, scale: 1, over: true },
    moon: { animate: true, scale: .75 },
    tower: { animate: false, scale: 1 },
    slush: { animate: false, scale: 1 },
    tundra: { animate: false, scale: 1 },
    rainbow: { animate: true, scale: .6 },
    mirror: { animate: true, scale: .85 },
    spring: { animate: true, scale: .85 }
  };
  var VIEWS = ['all', 'seq', 'color', 'tex'];
  var view = 0;
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cards = [];

  Array.prototype.forEach.call(document.querySelectorAll('.card[data-fx]'), function (el) {
    var name = el.getAttribute('data-fx'), kind = KINDS[name];
    if (!kind || !SHADERS[name]) return;
    var card = { el: el, kind: kind, layers: [], ptr: [.5, .5], target: [.5, .5], hover: 0, hoverTarget: 0, visible: true, dirty: true };
    try {
      card.layers.push(new Layer(el.querySelector('canvas.fx-under'), name, 0, kind.scale));
      if (kind.over) card.layers.push(new Layer(el.querySelector('canvas.fx-over'), name, 1, kind.scale));
    } catch (e) {
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
    cards.push(card);
  });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var c = cards.filter(function (k) { return k.el === e.target; })[0];
        if (c) { c.visible = e.isIntersecting; if (c.visible) c.dirty = true; }
      });
    }, { rootMargin: '120px' });
    cards.forEach(function (c) { io.observe(c.el); });
  }
  window.addEventListener('resize', function () { cards.forEach(function (c) { c.dirty = true; }); });

  function ease(c) {
    var moved = false;
    for (var i = 0; i < 2; i++) {
      var d = c.target[i] - c.ptr[i];
      if (Math.abs(d) > .0005) { c.ptr[i] += d * .18; moved = true; }
    }
    var dh = c.hoverTarget - c.hover;
    if (Math.abs(dh) > .002) { c.hover += dh * .1; moved = true; } else c.hover = c.hoverTarget;
    return moved;
  }

  var start = performance.now();
  function frame(now) {
    var t = reduced ? 12 : 12 + (now - start) / 1000;
    cards.forEach(function (c) {
      if (!c.visible) return;
      var moved = ease(c);
      if ((c.kind.animate && !reduced) || moved || c.dirty) {
        c.layers.forEach(function (l) { l.draw(t, c); });
        c.dirty = false;
      }
    });
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------- 视图切换：合成 / 序列 / 配色 / 质感 ---------- */
  var NOTES = [
    '三层叠在一起的样子。',
    '只留结构和节奏：去掉颜色和材质，用灰度看条、环、带、流线怎么排。',
    '只留颜色和面积：每块平涂，看用了哪些色、各占多少。',
    '只留材质：颜色换成中性灰，看颗粒、纤维、反光。'
  ];
  function setView(v) {
    view = Math.max(0, Math.min(3, v | 0));
    document.body.setAttribute('data-view', VIEWS[view]);
    Array.prototype.forEach.call(document.querySelectorAll('.views [data-view]'), function (b) {
      b.setAttribute('aria-checked', String(Number(b.getAttribute('data-view')) === view));
    });
    var note = document.getElementById('view-note');
    if (note) note.textContent = NOTES[view];
    cards.forEach(function (c) { c.dirty = true; });
  }
  Array.prototype.forEach.call(document.querySelectorAll('.views [data-view]'), function (b) {
    b.addEventListener('click', function () {
      setView(Number(b.getAttribute('data-view')));
      try { history.replaceState(null, '', view ? '#' + VIEWS[view] : location.pathname); } catch (e) { /* 预览环境不让改地址就算了 */ }
    });
  });
  var fromHash = VIEWS.indexOf(location.hash.replace('#', ''));
  setView(fromHash > 0 ? fromHash : 0);

  window.textureCards = { count: function () { return cards.length; }, view: setView };
})();
