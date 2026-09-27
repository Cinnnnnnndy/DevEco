/* 质感卡片 · 每张卡片的底是一段片元着色器（WebGL1），内容是普通 DOM 叠在上面。
   - 所有着色器共用 COMMON：噪声、fbm、颗粒；坐标 v_uv 左上 (0,0) 右下 (1,1)，p = 按宽高比拉正的坐标
   - u_ptr / u_hover：鼠标在卡片上的位置（0–1）和「在不在卡片上」，都做了缓动；光源跟着它走
   - 会动的（云、雾、水）只在卡片进入视口时逐帧画；静态的只在光源变化时重画；减少动效时全部停在一帧
   塑料膜多一层画在内容上面：高光和折痕的暗部要压在印刷的标签和字上。 */
(function () {
  'use strict';

  var COMMON = [
    'precision highp float;',
    'varying vec2 v_uv;',
    'uniform vec2 u_res;uniform float u_time;uniform vec2 u_ptr;uniform float u_hover;uniform float u_mode;',
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
    ''
  ].join('\n');

  var SHADERS = {};

  /* 塑料膜：膨化食品袋的铝膜。高度场 = 大鼓包 + 十几道折痕（帐篷形截面，折线处法线突变）+ 细皱；
     颜色来自「反射到的影棚」：左上一块柔光箱、顶上一根灯管，再加跟着鼠标的点光；朝右下倾的面偏紫。
     u_mode 0 = 膜本身（在内容下面），1 = 高光与折痕暗部（在内容上面，压住印刷的标签） */
  SHADERS.film = [
    'float crease(vec2 p,float fi){',
    '  vec2 r1=hash22(vec2(fi,1.7)),r2=hash22(vec2(fi,9.1)),r3=hash22(vec2(fi,4.3)),r4=hash22(vec2(fi,6.6));',
    '  vec2 a=vec2(r1.x*asp(),r1.y);float ang=r2.x*3.14159;vec2 dir=vec2(cos(ang),sin(ang));',
    '  vec2 d=p-a;float al=dot(d,dir),pe=dot(d,vec2(-dir.y,dir.x))+.05*gnoise(p*2.5+fi*3.1);',
    '  float len=.12+r2.y*.32;float fade=1.-smoothstep(len*.3,len,abs(al));',
    '  float w=.035+r3.x*.09;float x=abs(pe)/w;',
    '  float sharp=max(1.-x,0.);sharp*=sharp;float rnd=exp(-x*x*2.2);',
    '  float pr=mix(rnd,sharp,step(.62,r4.y));',
    '  return (r4.x-.5)*(.35+r3.y*.5)*pr*fade;}',
    'float H(vec2 p){vec2 w=vec2(fbm3(p*1.2+1.3),fbm3(p*1.2+7.1));',
    '  float h=1.15*fbm3(p*vec2(1.25,1.7)+w*.9+3.7);',
    '  for(int i=0;i<10;i++)h+=crease(p,float(i));',
    '  return h+.022*fbm3(p*vec2(14.,20.)+11.);}',
    'void main(){',
    '  vec2 p=P();float e=1.5/u_res.y;',
    '  float h0=H(p),hx=H(p+vec2(e,0.)),hy=H(p+vec2(0.,e));',
    '  vec3 N=normalize(vec3(-(hx-h0)/e*.085,-(hy-h0)/e*.085,1.));',
    '  vec2 lp=mix(vec2(.2*asp(),.1),vec2(u_ptr.x*asp(),u_ptr.y),u_hover);',
    '  vec3 L=normalize(vec3(lp-p,.45));vec3 V=vec3(0.,0.,1.);float nh=max(dot(N,normalize(L+V)),0.);',
    '  vec3 R=reflect(-V,N);',
    '  float box=smoothstep(.62,.97,dot(R,normalize(vec3(-.42,-.55,.72))));',
    '  float tube=smoothstep(.06,0.,abs(R.y+.46+.12*R.x))*smoothstep(.9,.35,abs(R.x+.1));',
    '  float E=.24+.85*box+.5*tube+.4*pow(nh,6.)+.16*N.z;',
    '  vec3 foil=hex(234.,42.,144.),dark=hex(104.,12.,60.),violet=hex(130.,72.,226.);',
    '  vec3 col=mix(dark,foil,clamp(E,0.,1.15));',
    '  float irid=smoothstep(.05,.32,N.x+.15*N.y)*(1.-clamp(E*.85,0.,1.));',
    '  col=mix(col,violet*(.35+.8*E),irid*.62);',
    '  col=mix(col,hex(255.,182.,222.),smoothstep(.95,1.4,E)*.55);',
    '  float gloss=pow(nh,70.)*1.1+smoothstep(1.1,1.5,E)*.45+tube*.12;',
    '  if(u_mode<.5){gl_FragColor=vec4(col+grain()*.015,1.);return;}',
    '  float a=clamp(gloss,0.,1.)*.62;vec3 gc=mix(vec3(1.),hex(255.,196.,232.),.4);',
    '  float sh=(1.-smoothstep(.05,.35,E))*.16;float A=a+sh*(1.-a);',
    '  gl_FragColor=vec4(gc*a,A);}'
  ].join('\n');

  /* 月晕：满月透过薄云。中间冷白的光，往外一圈淡黄、再外一圈偏紫的光环（华）；
     云是横向拉长的 fbm，慢慢往左飘；离月亮近的云被照亮、带银边，远处的云压暗 */
  SHADERS.moon = [
    'void main(){',
    '  vec2 p=P();float t=u_time;vec2 mc=vec2(.64*asp(),.25);float mr=.064;',
    '  vec2 d=p-mc;float r=length(d*vec2(1.,1.1));',
    '  vec2 q=vec2(p.x*.95-t*.007,p.y*3.3);',
    '  float w=fbm3(q*1.3+vec2(t*.004,0.));float c=fbm(q+vec2(w*.9,w*.35));',
    '  float dens=smoothstep(-.3,.42,c);',
    '  float core=exp(-r*14.),veilL=exp(-r*3.4),wide=exp(-r*1.6);',
    '  float ring=exp(-pow((r-.34)/.07,2.)),ring2=exp(-pow((r-.46)/.08,2.));',
    '  vec3 col=mix(hex(4.,5.,7.),hex(12.,13.,16.),v_uv.y);',
    '  vec3 ml=hex(212.,224.,238.);float veil=.45+.55*smoothstep(-.45,.6,c);',
    '  col+=ml*(veilL*.62+wide*.14)*veil+ml*core*.7;',
    '  col+=(hex(196.,190.,128.)*ring*.34+hex(150.,118.,150.)*ring2*.18)*veil;',
    '  float lit=exp(-r*2.9);',
    '  vec3 cc=mix(hex(16.,18.,22.),hex(126.,138.,152.),lit)+ml*lit*.18;',
    '  col=mix(col,cc,smoothstep(.5,.98,dens)*.8);',
    '  col+=ml*smoothstep(.38,.58,dens)*smoothstep(.8,.58,dens)*lit*.4;',
    '  float md=1.-smoothstep(mr-1.5/u_res.y,mr,length(d));',
    '  float maria=fbm3(d*34.+2.)*.5+fbm3(d*84.)*.2;',
    '  vec3 mcol=hex(240.,236.,230.)-vec3(.15,.15,.14)*smoothstep(-.05,.35,maria);',
    '  col=mix(col,mcol,md*(1.-smoothstep(.6,.98,dens)*.7));',
    '  gl_FragColor=vec4(col+grain()*.035,1.);}'
  ].join('\n');

  /* 石塔：哈尔格林姆斯教堂的黄昏。中间是尖塔 + 平整的塔身，两侧竖向柱子一格格往外降；
     混凝土灰里带一点紫，柱子有圆柱的明暗；尖塔上错落的小窗、钟楼的拱窗和钟面是暖黄的灯 */
  SHADERS.tower = [
    'float warm(vec2 uv,vec2 c,vec2 hs){vec2 d=abs(uv-c)/hs;return smoothstep(1.,.6,max(d.x,d.y));}',
    'void main(){',
    '  vec2 uv=v_uv;float x=uv.x,y=uv.y;float ax=abs(x-.5);',
    '  vec3 col=mix(hex(38.,88.,194.),hex(108.,152.,230.),smoothstep(0.,.62,y));',
    '  float stepH=.021;float ys=floor(y/stepH)*stepH;',
    '  float sh=mix(.016,.17,smoothstep(.03,.30,ys));',
    '  bool inSpire=y>.03&&y<.30&&ax<sh;bool inBody=ax<.25&&y>=.30;',
    '  float cw=.042;float ci=floor((ax-.25)/cw);float cx=fract((ax-.25)/cw);',
    '  bool inCol=ax>=.25&&y>.33+ci*.034;',
    '  float glowAcc=0.;',
    '  if(inSpire||inBody||inCol){',
    '    vec3 c=hex(140.,134.,141.);',
    '    float n=fbm3(vec2(x*55.,y*6.))*.08+(hash12(gl_FragCoord.xy*.7)-.5)*.05+fbm3(vec2(x*150.,y*2.4))*.06;',
    '    c*=1.+n;',
    '    if(inCol){float s=.8+.3*sin(3.14159*cx);s-=.28*smoothstep(.14,0.,cx)+.1*smoothstep(.86,1.,cx);c*=s;}',
    '    if(inSpire){float sx=fract((x-.5)/.034+.5);c*=.84+.22*sin(3.14159*sx);}',
    '    if(inBody){c*=1.-.05*smoothstep(.2,.25,ax);}',
    '    c*=mix(.86,1.05,smoothstep(.2,1.,y));c*=1.-.06*step(.5,x);',
    '    c+=hex(255.,196.,110.)*smoothstep(.86,1.,y)*.1;',
    '    col=c;',
    '    if(inSpire&&y>.055&&y<.235){',
    '      vec2 g=vec2((x-.5)/.022,(y-.055)/.026);float row=floor(g.y);g.x+=mod(row,2.)*.5;',
    '      vec2 gi=floor(g),gf=fract(g);float on=step(.38,hash12(gi+vec2(3.,row)));',
    '      float slot=smoothstep(.2,.08,abs(gf.x-.5))*smoothstep(.34,.18,abs(gf.y-.5))*on;',
    '      col=mix(col,hex(255.,206.,104.),slot);glowAcc+=slot;}',
    '    for(int i=0;i<3;i++){float fi=float(i)-1.;vec2 wc=vec2(.5+fi*.052,.268);',
    '      float arch=warm(uv,wc,vec2(.013,.022))*step(abs(x-wc.x),.013);',
    '      col=mix(col,mix(hex(255.,190.,80.),hex(190.,110.,30.),smoothstep(.25,.29,y)),arch);glowAcc+=arch;}',
    '    vec2 cd=vec2((x-.5)*asp(),y-.35);float cr=length(cd);',
    '    float face=smoothstep(.03,.026,cr);col=mix(col,hex(246.,210.,116.),face);',
    '    float hand=face*(smoothstep(.003,.0,abs(cd.x))*step(-.02,cd.y)*step(cd.y,0.)+smoothstep(.003,.0,abs(cd.y+cd.x*.3))*step(0.,cd.x)*step(cd.x,.016));',
    '    col=mix(col,hex(70.,52.,30.),hand*.9);glowAcc+=face;',
    '    for(int i=0;i<2;i++){float fy=.455+float(i)*.1;float win=warm(uv,vec2(.5,fy),vec2(.006,.016));',
    '      col=mix(col,hex(236.,232.,220.),win*.85);}',
    '  }',
    '  vec2 sp=vec2((x-.5)*asp(),y-.15);col+=hex(255.,190.,90.)*exp(-length(sp*vec2(3.,1.2))*9.)*.12;',
    '  col+=hex(255.,200.,110.)*exp(-length(vec2((x-.5)*asp(),y-.35))*28.)*.35;',
    '  gl_FragColor=vec4(col+grain()*.02,1.);}'
  ].join('\n');

  /* 冰沙：橙红的底从里面透亮（中心亮、边缘深），表面一颗颗小冰晶（Voronoi 小圆顶，
     朝光的一侧亮、背光一侧暗，个别跟着鼠标闪一下）；挖过的地方留一道带光泽的弧 */
  SHADERS.slush = [
    'float crystals(vec2 p,float sc,vec2 lp,float seed,float keep,out float dome){',
    '  vec2 g=p*sc;vec2 gi=floor(g),gf=fract(g);float f1=9.;vec2 cid=vec2(0.),rp1=vec2(0.);',
    '  for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 o=vec2(float(i),float(j));vec2 rp=o+hash22(gi+o+seed)-gf;float dd=dot(rp,rp);',
    '    if(dd<f1){f1=dd;cid=gi+o;rp1=rp;}}',
    '  f1=sqrt(f1);float cr=hash12(cid*1.3+seed);float rad=.3+.2*hash12(cid+7.+seed);',
    '  dome=smoothstep(rad,rad*.55,f1)*step(keep,cr);',
    '  vec3 dn=normalize(vec3(rp1/max(rad,.001)*1.1,1.));vec3 L=normalize(vec3(lp-p,.5));',
    '  float spk=pow(max(dot(reflect(-L,dn),vec3(0.,0.,1.)),0.),26.)*dome;',
    '  return (dot(dn,L)-.72)*dome+spk*(.6+.8*step(.8,cr));}',
    'void main(){',
    '  vec2 p=P();vec2 lp=mix(vec2(.28*asp(),.1),vec2(u_ptr.x*asp(),u_ptr.y),u_hover);',
    '  float n=fbm(p*2.+1.3);',
    '  vec3 deep=hex(186.,72.,16.),mid=hex(232.,132.,30.),hi=hex(250.,190.,108.);',
    '  float glow=exp(-length((p-vec2(.4*asp(),.3))*vec2(1.,1.25))*1.9);',
    '  vec3 col=mix(deep,mid,smoothstep(-.5,.4,n)*.8+.2);col=mix(col,hi,glow*.62);',
    '  float a1=length(p-vec2(1.25*asp(),-.18))-.95+fbm3(p*2.6)*.04;',
    '  float fold1=smoothstep(-.02,.03,a1)*smoothstep(.16,.03,a1);float lip1=smoothstep(.014,0.,abs(a1));float sh1=smoothstep(0.,-.05,a1)*smoothstep(-.12,-.05,a1);',
    '  float a2=length(p-vec2(-.22*asp(),1.05))-.62+fbm3(p*3.+5.)*.035;',
    '  float fold2=smoothstep(-.02,.025,a2)*smoothstep(.11,.02,a2);float lip2=smoothstep(.011,0.,abs(a2));',
    '  col=mix(col,hi*1.06,fold1*.5+fold2*.35);col*=1.-sh1*.14;',
    '  float var1=smoothstep(-.3,.5,fbm3(p*vec2(4.,6.)+2.)),var2=smoothstep(-.3,.5,fbm3(p*vec2(4.,6.)+9.));',
    '  col+=hex(255.,236.,206.)*(lip1*.38*var1+lip2*.28*var2);',
    '  float d1,d2;float big=crystals(p,26.,lp,0.,.45,d1);float small=crystals(p,58.,lp,3.7,.25,d2);',
    '  col*=1.+big*.55+small*.4;',
    '  col+=hex(255.,242.,224.)*max(big,0.)*.12;',
    '  float fr=smoothstep(.15,.6,fbm3(p*3.3+7.));col=mix(col,hex(255.,226.,190.),fr*.14);',
    '  gl_FragColor=vec4(col+grain()*.02,1.);}'
  ].join('\n');

  /* 苔原：上面是阴天的灰；山体的土黄、赭石、橄榄一层层横着叠（带草的纤维感）；
     中间一条发黄的苔藓绿；下面是湿的玄武岩，零星苔藓和石子，内容放在这一块上 */
  SHADERS.tundra = [
    'void main(){',
    '  vec2 uv=v_uv;vec2 p=P();float y=uv.y;',
    '  vec2 w=vec2(fbm3(p*1.6+2.),fbm3(p*1.6+8.));',
    '  float z=y+.12*fbm(p*2.2+w*1.3)+.03*gnoise(p*9.);',
    '  float fib=gnoise(vec2(p.x*260.,p.y*46.))*.45+gnoise(vec2(p.x*110.+3.,p.y*24.))*.3+gnoise(p*60.)*.25;',
    '  vec3 col;',
    '  if(z<.1){col=mix(hex(216.,220.,222.),hex(198.,203.,206.),z/.1)+fbm3(p*vec2(3.,9.))*.035;}',
    '  else if(z<.44){',
    '    float slope=(p.y*1.-p.x*.3);',
    '    float band=sin(slope*26.+fbm3(p*vec2(2.,5.))*4.);',
    '    vec3 gold=hex(184.,146.,72.),tan=hex(158.,124.,76.),olive=hex(112.,102.,48.),rust=hex(142.,82.,46.);',
    '    col=mix(gold,tan,smoothstep(-.2,.6,fbm3(p*vec2(3.,6.))+.2));',
    '    col=mix(col,olive,smoothstep(.35,.95,band)*.55);',
    '    col=mix(col,rust,smoothstep(.45,.8,fbm3(p*4.5+3.))*.35);',
    '    col*=.86+.26*fib;',
    '    float rock=smoothstep(.62,.72,fbm(p*7.+1.))*.8;col=mix(col,hex(52.,52.,46.),rock);',
    '    col=mix(col,col*.78,smoothstep(.02,0.,abs(z-.1)));',
    '  }else if(z<.56){',
    '    float cl=fbm(p*8.+w);vec3 m1=hex(122.,136.,40.),m2=hex(168.,174.,58.);',
    '    col=mix(m1,m2,smoothstep(-.25,.45,cl));col*=.82+.34*fib;',
    '    col=mix(col,hex(184.,146.,72.)*(.9+.2*fib),smoothstep(.49,.44,z)*smoothstep(.1,.5,fbm3(p*5.))*.6);',
    '  }else{',
    '    col=mix(hex(38.,39.,36.),hex(58.,59.,54.),fbm3(p*5.)*.5+.5);',
    '    float wet=pow(max(fbm3(p*vec2(9.,5.)+4.),0.),2.)*.35;col+=hex(150.,160.,168.)*wet*.25;',
    '    float mp=smoothstep(.25,.6,fbm(p*4.+w*1.5+2.))*(1.-smoothstep(.56,.8,z));',
    '    col=mix(col,hex(118.,130.,40.)*(.78+.34*fib),mp*.8);',
    '    float foam=smoothstep(.55,.9,gnoise(vec2(p.x*9.,p.y*40.)+w*3.))*smoothstep(.02,0.,abs(y-.93-fbm3(vec2(p.x*2.,9.))*.04));',
    '    col=mix(col,hex(226.,232.,232.),foam*.6);',
    '  }',
    '  gl_FragColor=vec4(col+grain()*.03,1.);}'
  ].join('\n');

  /* 彩虹薄雾：阴天的灰蓝，雾慢慢飘；一道很淡的彩虹斜着穿过，外侧杏色、内侧偏蓝，
     被雾吃掉一半，边缘没有硬线；彩虹里侧的天比外侧亮一点 */
  SHADERS.rainbow = [
    'vec3 pastel(float x){vec3 c0=hex(236.,190.,160.),c1=hex(236.,218.,156.),c2=hex(203.,226.,176.),c3=hex(182.,224.,212.),c4=hex(168.,200.,236.),c5=hex(188.,180.,222.);',
    '  x=clamp(x,0.,1.)*5.;if(x<1.)return mix(c0,c1,x);if(x<2.)return mix(c1,c2,x-1.);if(x<3.)return mix(c2,c3,x-2.);if(x<4.)return mix(c3,c4,x-3.);return mix(c4,c5,x-4.);}',
    'void main(){',
    '  vec2 uv=v_uv;vec2 p=P();float t=u_time;',
    '  vec3 col=mix(hex(128.,142.,162.),hex(172.,182.,192.),smoothstep(0.,.5,uv.y));col=mix(col,hex(206.,208.,205.),smoothstep(.45,1.,uv.y));',
    '  float m=fbm(p*1.6+vec2(t*.015,-t*.006));col=mix(col,hex(226.,229.,230.),smoothstep(-.15,.55,m)*.3);',
    '  vec2 A=vec2(.08*asp(),1.18),B=vec2(.9*asp(),-.22);vec2 D=normalize(B-A);vec2 Nn=vec2(-D.y,D.x);',
    '  float s=dot(p-A,Nn);float al=dot(p-A,D)/length(B-A);float xs=s/.22;',
    '  float band=smoothstep(1.,.3,abs(xs));float fade=smoothstep(.04,.42,al)*smoothstep(1.04,.58,al);',
    '  float patchy=.5+.5*smoothstep(-.3,.5,fbm(p*2.2+vec2(t*.01,t*.012)));',
    '  col=mix(col,pastel(xs*.5+.5)*1.04,band*fade*patchy*.74);',
    '  col+=smoothstep(.3,1.6,xs)*fade*.045;',
    '  gl_FragColor=vec4(col+grain()*.018,1.);}'
  ].join('\n');

  /* 天水镜像：上面是日落后的天，云底带杏粉色，地平线一道橙光；下面的水把整片天倒过来，
     压暗、偏蓝，越往下越暗，有很细的横向波纹；地平线是一条暗的岸线，岸上几点灯也倒映下来 */
  SHADERS.mirror = [
    'vec3 sky(vec2 q,float t){float y=q.y;',
    '  vec3 base=mix(hex(246.,156.,82.),hex(214.,222.,236.),smoothstep(0.,.09,y));base=mix(base,hex(104.,136.,196.),smoothstep(.09,.42,y));',
    '  vec2 cq=vec2(q.x*1.1+t*.004,y*2.7);vec2 wq=vec2(fbm3(cq*1.6),fbm3(cq*1.6+5.));',
    '  float c=fbm(cq*1.5+wq*.9);float dens=smoothstep(-.08,.32,c);',
    '  float sh=fbm3(cq*3.2+wq*1.5+4.);',
    '  vec3 cc=mix(hex(88.,98.,128.),hex(238.,242.,250.),smoothstep(-.3,.45,sh));',
    '  cc=mix(cc,mix(hex(240.,168.,140.),hex(250.,196.,160.),smoothstep(-.2,.4,sh)),smoothstep(.2,.03,y)*.85);',
    '  base=mix(base,cc,dens*.9);',
    '  return base+hex(255.,146.,52.)*exp(-y*34.)*.65;}',
    'void main(){',
    '  vec2 uv=v_uv;float t=u_time;float hz=.40;vec3 col;',
    '  float shore=hz-.014+gnoise(vec2(uv.x*14.,.5))*.007;',
    '  if(uv.y<hz){col=sky(vec2(uv.x*asp(),hz-uv.y),t);}',
    '  else{float dy=uv.y-hz;',
    '    float rip=(gnoise(vec2(uv.x*5.,uv.y*80.-t*.4))*.004+sin(uv.y*430.+t*1.2+gnoise(vec2(uv.x*3.,uv.y*18.))*4.)*.0011)*smoothstep(.01,.2,dy);',
    '    col=sky(vec2(uv.x*asp()+rip*asp(),dy*1.04+rip*.4),t)*vec3(.7,.78,.9)*mix(1.,.58,smoothstep(0.,.6,dy));',
    '    col+=hex(220.,230.,240.)*smoothstep(.93,1.,gnoise(vec2(uv.x*2.,uv.y*150.)))*.05;}',
    '  float land=step(shore,uv.y)*step(uv.y,hz);float rland=step(hz,uv.y)*step(uv.y,hz+(hz-shore)*.9);',
    '  col=mix(col,hex(24.,32.,32.),land);col=mix(col,hex(30.,38.,40.),rland*.85);',
    '  vec2 lg=vec2(uv.x*60.,0.);float li=step(.82,hash12(floor(lg)))*smoothstep(.5,.1,abs(fract(lg.x)-.5));',
    '  float ly=smoothstep(.004,0.,abs(uv.y-(hz-.006)));float lry=smoothstep(.01,0.,abs(uv.y-(hz+.008)))*.5;',
    '  col+=hex(255.,214.,140.)*li*(ly+lry);',
    '  gl_FragColor=vec4(col+grain()*.02,1.);}'
  ].join('\n');

  /* 冰泉：冰川融水的蓝。乳白里透青绿，白色水花一缕一缕（域扭曲的 fbm 取脊线），
     整体往下流；右上有个漩涡，中心颜色最深；下半部分水花收一点，好放字 */
  SHADERS.spring = [
    'void main(){',
    '  vec2 p=P();float t=u_time*.3;vec2 c=vec2(.64*asp(),.27);vec2 d=p-c;float r=length(d);',
    '  float sw=1.5*exp(-r*4.2);float cs=cos(sw),sn=sin(sw);vec2 q=c+mat2(cs,-sn,sn,cs)*d;q.y-=t*.32;',
    '  vec2 w=vec2(fbm3(q*2.5+vec2(0.,t)),fbm3(q*2.5+vec2(4.2,-t)));',
    '  float n=fbm(q*vec2(3.,4.)+w*1.4);',
    '  float ridge=pow(clamp(1.-abs(n)*2.3,0.,1.),4.);',
    '  float fine=pow(clamp(1.-abs(fbm3(q*vec2(9.,12.)+w*2.))*3.,0.,1.),5.);',
    '  vec3 col=mix(hex(14.,120.,148.),hex(52.,190.,212.),smoothstep(-.45,.15,n));',
    '  col=mix(col,hex(144.,226.,238.),smoothstep(.0,.5,n)*.8);',
    '  float calm=mix(1.,.5,smoothstep(.42,.72,v_uv.y));float foam=clamp(ridge*.9+fine*.6,0.,1.)*calm;',
    '  col=mix(col,hex(220.,246.,250.),foam);col+=pow(foam,4.)*.22;',
    '  col=mix(col,hex(10.,96.,122.),smoothstep(.1,.0,r)*.55);',
    '  col=mix(col,col*vec3(.9,.97,1.),smoothstep(.5,1.,v_uv.y)*.4);',
    '  gl_FragColor=vec4(col+grain()*.02,1.);}'
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
    ['u_res', 'u_time', 'u_ptr', 'u_hover', 'u_mode'].forEach(function (k) { this.u[k] = gl.getUniformLocation(prog, k); }, this);
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

  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cards = [];

  Array.prototype.forEach.call(document.querySelectorAll('.card[data-fx]'), function (el) {
    var name = el.getAttribute('data-fx'), kind = KINDS[name];
    if (!kind || !SHADERS[name]) return;
    var card = { el: el, kind: kind, layers: [], ptr: [.5, .5], target: [.5, .5], hover: 0, hoverTarget: 0, visible: true, dirty: true };
    try {
      var under = el.querySelector('canvas.fx-under');
      card.layers.push(new Layer(under, name, 0, kind.scale));
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

  window.textureCards = { count: function () { return cards.length; } };
})();
