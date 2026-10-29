(()=>{'use strict';
const $=i=>document.getElementById(i),cv=$('c'),ctx=cv.getContext('2d');
let W,H;const rs=()=>{const d=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*d;cv.height=H*d;ctx.setTransform(d,0,0,d,0,0)};addEventListener('resize',rs);rs();
const R=Math.random,TAU=Math.PI*2,rr=(a,b)=>a+R()*(b-a),cl=(v,a,b)=>v<a?a:v>b?b:v;
const ST=[['Asteroide',0],['Lua',30],['Planeta anão',80],['Planeta rochoso',170],['Planeta gasoso',420],['Estrela anã',1000],['Sol',2500],['Estrela gigante',6000],['Buraco negro',15000]];
const WIN=30000,P0=12,stage=r=>{let i=0;while(i<8&&r>=ST[i+1][1])i++;return i};
const vpx=r=>330/(1+1.3*Math.log10(Math.max(r,4)/4));
let nome='Viajante';try{nome=localStorage.getItem('aeth_nome')||nome}catch(_){}
/* ---------- sprites (estilo meteoro: rocha escura, luz quente, crateras) ---------- */
let METEOR=null;{const i=new Image();i.onload=()=>METEOR=i;i.src='assets/meteoro.png'}
const mk=f=>{const c=document.createElement('canvas');c.width=c.height=192;f(c.getContext('2d'),192,96);return c};
const shade=(g,s,h)=>{let l=g.createRadialGradient(h*.7,h*.6,h*.1,h,h,h*1.05);l.addColorStop(0,'rgba(170,220,255,.2)');l.addColorStop(.55,'rgba(0,0,0,0)');l.addColorStop(1,'rgba(0,0,0,.78)');g.fillStyle=l;g.fillRect(0,0,s,s);
 l=g.createRadialGradient(h,h,h*.72,h,h,h);l.addColorStop(0,'rgba(70,190,255,0)');l.addColorStop(1,'rgba(70,190,255,.3)');g.fillStyle=l;g.fillRect(0,0,s,s)};
const rock=(base,o)=>mk((g,s,h)=>{g.beginPath();
 if(o.irr){for(let i=0;i<=24;i++){const a=i/24*TAU,q=h*(.93-o.irr*R());g.lineTo(h+Math.cos(a)*q,h+Math.sin(a)*q)}}else g.arc(h,h,h*.98,0,TAU);
 g.closePath();g.clip();g.fillStyle=base;g.fillRect(0,0,s,s);
 for(let i=0;i<70;i++){g.fillStyle=`rgba(${R()<.5?'210,235,255':'0,0,0'},${rr(.03,.1)})`;g.beginPath();g.arc(rr(0,s),rr(0,s),rr(4,o.bl||26),0,TAU);g.fill()}
 for(let i=0;i<o.cr;i++){const x=rr(20,s-20),y=rr(20,s-20),q=rr(4,o.cs);g.fillStyle='rgba(0,0,0,.38)';g.beginPath();g.arc(x,y,q,0,TAU);g.fill();g.strokeStyle='rgba(200,235,255,.25)';g.lineWidth=2;g.beginPath();g.arc(x+1,y+1,q,.8,3.9);g.stroke()}
 shade(g,s,h)});
const gas=p=>mk((g,s,h)=>{g.beginPath();g.arc(h,h,h*.98,0,TAU);g.clip();let y=0,i=0;while(y<s){const t=rr(8,26);g.fillStyle=p[i++%p.length];g.fillRect(0,y,s,t+1);y+=t}
 for(let k=0;k<40;k++){g.strokeStyle=`rgba(255,255,255,${rr(.02,.08)})`;g.lineWidth=rr(1,4);const yy=rr(0,s);g.beginPath();g.moveTo(0,yy);g.bezierCurveTo(s*.3,yy+rr(-9,9),s*.6,yy+rr(-9,9),s,yy);g.stroke()}
 g.fillStyle='rgba(60,90,200,.4)';g.beginPath();g.ellipse(rr(60,130),rr(80,120),rr(10,20),rr(6,10),0,0,TAU);g.fill();shade(g,s,h)});
const SP=[[],[],[],[],[]];
function build(){['#5d6672','#4e5663','#6a7380','#434b5c'].forEach(c=>SP[0].push(rock(c,{irr:.22,cr:9,cs:16})));
 ['#8a929c','#737b88','#9aa3ad'].forEach(c=>SP[1].push(rock(c,{cr:22,cs:18})));
 ['#8c929e','#7f8aa0','#a3a9b8'].forEach(c=>SP[2].push(rock(c,{cr:14,cs:22,bl:40})));
 ['#4a78a8','#3f8c8c','#7d86b8','#5a8a9e','#8a74c0'].forEach(c=>SP[3].push(rock(c,{cr:6,cs:24,bl:55})));
 [['#a9d6f0','#6aa5cf','#d4ecf8','#4d7fb0'],['#9ec9ff','#6f8fe0','#cfe0ff','#4a62b8'],['#b5a8f0','#8672d0','#dcd5fa','#5a4aa0']].forEach(p=>SP[4].push(gas(p)))}
const SC=[[255,75,43],[255,154,60],[255,216,107],[255,246,232],[143,184,255]];
function starCol(b){const u=cl(b.e*.75+(b.t-5)*.1,0,.999)*4,i=u|0,f=u-i,a=SC[i],c=SC[i+1];return[0,1,2].map(k=>(a[k]+(c[k]-a[k])*f)|0).join(',')}
/* ---------- estado ---------- */
let T=0,uid=0,B=[],PA=[],RG=[],P,planet,phase='load',t0=0,ex=false,spT=0;
const cam={x:0,y:0,z:.3,sh:0};
const M={x:innerWidth/2,y:innerHeight/2,d:false},keys={};
addEventListener('pointerdown',e=>{if(e.target.closest('#pb,#pz'))return;M.d=true;M.x=e.clientX;M.y=e.clientY});addEventListener('pointermove',e=>{M.x=e.clientX;M.y=e.clientY});addEventListener('pointerup',()=>M.d=false);
addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=1;if(e.key.startsWith('Arrow'))e.preventDefault()});addEventListener('keyup',e=>delete keys[e.key.toLowerCase()]);
const zT=()=>(22+14*Math.log10(Math.max(P.r,P0)/P0))/P.r, UW=()=>1/zT(), VR=()=>Math.hypot(W,H)/2*UW();
function body(x,y,r,o){const t=stage(r),b={id:++uid,x,y,vx:0,vy:0,r,t,lt:t,mt:t,stT:T,v:R()*9|0,rot:R()*TAU,e:rr(.25,.9),idle:0,heat:0,ht:0,hx:0,hy:0,cd:0,born:T,ang:rr(0,TAU),tm:0,mode:0,orb:null,...o};B.push(b);return b}
const assign=b=>{b.mode=b.t<=1?(R()<.4?0:1):b.t<=4&&R()<.15?0:R()<.5?2:1};
function pickR(f){const q=R(),k=f?rr(.12,.75):q<.5?rr(.1,.6):q<.62?rr(.6,1):q<.82?rr(1.25,3):q<.94?rr(3,10):rr(10,40);return cl(P.r*k,P.r/50,ST[Math.min(8,stage(P.r)+3)][1]*1.4)}
function free(x,y,r){const vr=VR();return B.every(o=>Math.hypot(o.x-x,o.y-y)>=Math.max((r+o.r)*2.5,vr*.3))}
function spawn(inside,force){const vr=VR();for(let n=0;n<25;n++){let r=pickR(force);const t=stage(r),belt=!inside&&t>=3&&t<=7&&r>P.r*1.5&&R()<.12&&!B.some(o=>o.belt),rb=belt?r*3.4:r;
 const a=rr(0,TAU),d=inside?rr(.5,2.2)*vr:rr(1.1,1.7)*vr+rb,x=P.x+Math.cos(a)*d,y=P.y+Math.sin(a)*d;if(!free(x,y,rb))continue;
 const b=body(x,y,r,{});assign(b);if(belt)mkBelt(b);return}}
function mkBelt(c){c.mode=1;const id=++uid;for(let i=0;i<26;i++){const d=c.r*rr(2.3,3.1),a=rr(0,TAU),r=cl(c.r*rr(.015,.09),P.r/50,P.r*1.2);body(c.x+Math.cos(a)*d,c.y+Math.sin(a)*d,r,{belt:id,orb:{c,d,a,w:.045}})}}
function fx(x,y,rad,n){const Ui=1/cam.z;RG.push({x,y,r:rad*.3,m:Math.max(rad*2.4,16*Ui),t:0});for(let i=0;i<n&&PA.length<900;i++){const a=rr(0,TAU),s=rr(40,220)*Ui;PA.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:0,m:rr(.5,1.3),s:rr(2,6)*Ui,c:[rr(90,200)|0,rr(190,255)|0,255]})}}
/* ---------- colisões ---------- */
function hit(big,sm){if((big===P||sm===P)&&big.t===8&&sm.t===8){supernova();return}const q=sm.r/big.r,dx=sm.x-big.x,dy=sm.y-big.y,d=Math.hypot(dx,dy)||1,nx=dx/d,ny=dy/d;
 if(q<.82){sm.dead=true;fx(big.x+nx*big.r,big.y+ny*big.r,sm.r,14+Math.min(30,sm.r*cam.z|0));big.r=Math.sqrt(big.r*big.r+.9*sm.r*sm.r);big.idle=0;big.e=Math.min(1,big.e+.2+.3*q);
  if(big===P||sm===P)cam.sh=Math.max(cam.sh,.5);if(sm===P)end('morte');return}
 const ov=big.r+sm.r*.8-d;sm.x+=nx*ov*.5;sm.y+=ny*ov*.5;big.x-=nx*ov*.5;big.y-=ny*ov*.5;
 const rv=(sm.vx-big.vx)*nx+(sm.vy-big.vy)*ny;if(rv<0){const k=-rv*.8;sm.vx+=nx*k;sm.vy+=ny*k;big.vx-=nx*k;big.vy-=ny*k}
 if(big.cd<=0&&sm.cd<=0){for(const o of[big,sm]){o.r*=.92;o.cd=1.5;const s=o===big?-1:1;for(let i=0;i<3;i++){const a=Math.atan2(ny*s,nx*s)+rr(-1,1),b=body(o.x+Math.cos(a)*o.r,o.y+Math.sin(a)*o.r,Math.max(o.r*.14,P.r/50),{vx:Math.cos(a)*UW()*90+o.vx,vy:Math.sin(a)*UW()*90+o.vy,cd:2});assign(b);b.mode=1}}
  fx(big.x+nx*big.r,big.y+ny*big.r,sm.r*.5,18);if(big===P||sm===P)cam.sh=.9;if(P.r<5)end('morte')}}
function nova(b){b.dead=true;const U=UW();fx(b.x,b.y,b.r,b===P?200:70);RG.push({x:b.x,y:b.y,r:b.r,m:b.r*4,t:0});if(b===P||Math.hypot(b.x-P.x,b.y-P.y)<VR())cam.sh=Math.max(cam.sh,1);
 for(let i=0;i<10;i++){const a=rr(0,TAU),r=Math.max(b.r*rr(.02,.05),P.r/50),d=b.r*1.05,o=body(b.x+Math.cos(a)*d,b.y+Math.sin(a)*d,r,{vx:Math.cos(a)*rr(60,200)*U,vy:Math.sin(a)*rr(60,200)*U,cd:2});assign(o)}
 if(b===P)end('morte','Sua estrela explodiu')}
function supernova(){if(phase==='end')return;P.dead=true;fx(P.x,P.y,P.r*1.5,300);for(let i=1;i<4;i++)RG.push({x:P.x,y:P.y,r:P.r,m:P.r*(3+i*3),t:-i*.15});cam.sh=2.5;$('flash').classList.add('on');end('vitoria','Supernova! Você é o ápice')}
/* ---------- fim de jogo ---------- */
const score=()=>Math.round(P.r*P.r/14.4);
function end(res,txt){if(phase==='end')return;phase='end';const m=$('msg');m.textContent=txt||(res==='vitoria'?'Você se tornou o ápice':'Você foi absorvido');m.classList.add('on');
 try{localStorage.setItem('aeth_res',JSON.stringify({res,name:nome,score:score(),st:ST[stage(P.max)][0]}))}catch(_){}
 setTimeout(()=>location.href='fim.html',2200)}
/* ---------- intro ---------- */
function explode(){ex=true;planet.dead=true;const U=UW();fx(0,0,planet.r*.7,160);RG.push({x:0,y:0,r:10,m:planet.r*3.5,t:0});cam.sh=1.4;
 for(let i=0;i<18;i++){const a=i/18*TAU+rr(-.2,.2),r=rr(5,24),d=planet.r*rr(.1,.5),b=body(Math.cos(a)*d,Math.sin(a)*d,r,{vx:Math.cos(a)*rr(60,170)*U,vy:Math.sin(a)*rr(60,170)*U,born:-9});assign(b);b.mode=R()<.5?1:0}
 P.hid=false;P.vx=Math.cos(.6)*130*U;P.vy=Math.sin(.6)*130*U}
function begin(){phase='intro';t0=T;P=body(0,0,P0,{hid:true,born:-9,max:P0,e:.5});planet=body(0,0,P0*28,{born:-9,v:3,mode:0});planet.t=3;P.inv=T+8}
/* ---------- update ---------- */
function update(dt){T+=dt;const U=UW(),vr=VR(),zt=zT();
 if(phase==='intro'){const t=T-t0;if(!ex&&t>.9)explode();planet.heat=ex?0:Math.min(1,t/.9);
  const k=cl((t-.9)/3.3,0,1),e=k*k*(3-2*k);cam.z=.3*Math.pow(zt/.3,e);if(t>4.2){phase='play';cam.z=zt;for(let i=0;i<8;i++)spawn(true,true);$('tip').style.display='block'}}
 else cam.z+=(zt-cam.z)*Math.min(1,dt*2.5);
 if(phase==='play'){const kx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),ky=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);let a=null;P.comet=!!keys.shift&&P.t===0;
  if(kx||ky)a=Math.atan2(ky,kx);else if(M.d)a=Math.atan2(M.y-H/2,M.x-W/2);
  if(a!==null){P.ang=a;const S=vpx(P.r)*(P.comet?1.8:1)*U,k=Math.min(1,dt*3);P.vx+=(Math.cos(a)*S-P.vx)*k;P.vy+=(Math.sin(a)*S-P.vy)*k}
  if(P.comet&&PA.length<900){const s=Math.hypot(P.vx,P.vy)||1;for(let i=0;i<2;i++)PA.push({x:P.x-P.vx/s*P.r*(.9+i*.6)+rr(-1,1)*P.r*.2,y:P.y-P.vy/s*P.r*(.9+i*.6)+rr(-1,1)*P.r*.2,vx:-P.vx*.15,vy:-P.vy*.15,l:0,m:rr(.5,.9),s:P.r*rr(.25,.5),c:[190,235,255]})}}
 /* IA dos bots: maiores = mais lentos */
 for(const b of B){if(b===P||b.orb||b.hid||b===planet)continue;b.tm-=dt;
  if(b.tm<=0){b.tm=rr(.7,1.6);if(b.mode){let tg=null,bd=1e18,fl=null,fd=1e18;for(const o of B){if(o===b||o.hid)continue;const d=Math.hypot(o.x-b.x,o.y-b.y)-o.r-b.r;if(b.mode===2&&o.r<b.r*.8&&d<bd){bd=d;tg=o}if(o.r>b.r*1.15&&d<o.r*2.5+b.r*3&&d<fd){fd=d;fl=o}}
   if(fl)b.ang=Math.atan2(b.y-fl.y,b.x-fl.x);else if(tg&&bd<vr*1.2)b.ang=Math.atan2(tg.y-b.y,tg.x-b.x);else b.ang+=rr(-.9,.9)}}
  const sp=U*(b.mode?vpx(b.r)*(b.mode===2?.6:.4):4),k=Math.min(1,dt*1.5);
  b.vx+=(Math.cos(b.ang)*sp-b.vx)*k;b.vy+=(Math.sin(b.ang)*sp-b.vy)*k}
 /* gravidade + calor */
 for(let i=0;i<B.length;i++){const a=B[i];if(a.orb||a.hid)continue;for(let j=i+1;j<B.length;j++){const b=B[j];if(b.orb||b.hid)continue;
  const big=a.r>=b.r?a:b,sm=big===a?b:a,gr=big.r*(big.t===8?4.5:3.2),dx=big.x-sm.x,dy=big.y-sm.y;if(Math.abs(dx)>gr||Math.abs(dy)>gr)continue;const d=Math.hypot(dx,dy);if(d>=gr||d<1e-6)continue;
  const ux=dx/d,uy=dy/d,ac=160*U*Math.pow(1-d/gr,1.2)*Math.min(2.5,Math.pow(big.r/sm.r,.25))*(big.t===8?1.6:1)*dt;
  sm.vx+=ux*ac;sm.vy+=uy*ac;if(sm.r>big.r*.82){big.vx-=ux*ac;big.vy-=uy*ac}
  if(big.t!==8&&big.r>sm.r*1.2){const h=cl(1-(d-big.r)/(gr-big.r),0,1);if(h>sm.ht){sm.ht=h;sm.hx=-ux;sm.hy=-uy}}}}
 const Smax=vpx(P.r)*U*(P.comet?1.8:1)*2.6;
 for(const b of B){if(b.orb){const o=b.orb;if(o.c.dead){b.vx=-Math.sin(o.a)*o.d*o.w;b.vy=Math.cos(o.a)*o.d*o.w;b.orb=null}else{o.a+=o.w*dt;b.x=o.c.x+Math.cos(o.a)*o.d;b.y=o.c.y+Math.sin(o.a)*o.d}}
  else{if(b===P){const s=Math.hypot(b.vx,b.vy);if(s>Smax){b.vx*=Smax/s;b.vy*=Smax/s}}b.x+=b.vx*dt;b.y+=b.vy*dt}
  b.rot+=dt*.9/Math.pow(b.r/P0+1,.3)*(b.id%2?1:-1);b.cd-=dt;b.heat+=(b.ht-b.heat)*Math.min(1,dt*3);b.ht=0;b.idle+=dt;
  if(b.t>=5&&b.t<8&&b.idle>25){b.r*=1-.004*dt;b.e=Math.max(0,b.e-.02*dt)}
  b.t=stage(b.r);if(b===P&&b.r>P.max)P.max=b.r;if(b.t>b.mt){b.mt=b.t;b.stT=T}if(b.t>=5&&b.t<8&&!b.hid&&T-b.stT>120)nova(b);
  if(b.heat>.25&&b.t<8&&!b.hid&&b.r*cam.z>1.5&&PA.length<900&&R()<b.heat*1.5){const Ui=1/cam.z,s=Math.hypot(b.vx,b.vy)||1;PA.push({x:b.x-b.vx/s*b.r*.8+rr(-1,1)*b.r*.3,y:b.y-b.vy/s*b.r*.8+rr(-1,1)*b.r*.3,vx:-b.vx*.1+rr(-1,1)*20*Ui,vy:-b.vy*.1+rr(-1,1)*20*Ui,l:0,m:rr(.5,1),s:Math.min(rr(3,7)*Ui,b.r*.35),c:[rr(60,160)|0,rr(190,255)|0,255]})}}
 /* colisões */
 if(phase!=='intro')for(let i=0;i<B.length;i++){const a=B[i];if(a.dead||a.hid)continue;for(let j=i+1;j<B.length;j++){const b=B[j];if(b.dead||b.hid||(a.belt&&a.belt===b.belt))continue;
  const dx=b.x-a.x,dy=b.y-a.y,rs=a.r+b.r;if(Math.abs(dx)>rs||Math.abs(dy)>rs)continue;const big=a.r>=b.r?a:b,sm=big===a?b:a;if(Math.hypot(dx,dy)>big.r+sm.r*.8)continue;
  if((a===P||b===P)&&T<P.inv)continue;hit(big,sm);if(a.dead)break}}
 /* limpeza: 100x menores somem, distantes saem */
 B=B.filter(b=>b===P?!b.dead:!b.dead&&(phase==='intro'||b.r>=P.r/100)&&Math.hypot(b.x-P.x,b.y-P.y)<5*vr+b.r);
 /* spawn sutil, fora da tela */
 if(phase==='play'||phase==='end'){spT-=dt;if(spT<=0){spT=rr(.45,.9);const nb=B.filter(b=>!b.orb),dd=b=>Math.hypot(b.x-P.x,b.y-P.y);if(nb.filter(b=>dd(b)<3*vr).length<22&&nb.filter(b=>dd(b)<1.25*vr).length<11)spawn(false,nb.filter(b=>b!==P&&b.r<P.r*.8&&dd(b)<2.5*vr).length<7)}}
 if(phase==='play'&&P.r>=WIN)end('vitoria');
 cam.x+=(P.x-cam.x)*Math.min(1,dt*6);cam.y+=(P.y-cam.y)*Math.min(1,dt*6);cam.sh=Math.max(0,cam.sh-dt*1.5);
 for(const p of PA){p.l+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=1-dt;p.vy*=1-dt}PA=PA.filter(p=>p.l<p.m);
 for(const r of RG){r.r+=(r.m-r.r)*dt*5;r.t+=dt/.7}RG=RG.filter(r=>r.t<1);
 $('hn').textContent=nome;{let h=ST[stage(P.r)][0];if(P.comet&&P.t===0)h+=' · cometa';if(P.t>=5&&P.t<8){const q=Math.ceil(120-(T-P.stT));if(q<=40)h+=' · instável: '+Math.max(q,0)+'s'}$('hs').textContent=h}$('hp').textContent=score();$('hb').style.width=cl(Math.log(P.r/P0)/Math.log(WIN/P0)*100,1,100)+'%'}
/* ---------- desenho ---------- */
const SS=Array.from({length:180},()=>({x:R(),y:R(),f:.02+R()*.08,s:.5+R()*1.4,a:.3+R()*.6}));
function drawBody(b,z,ox,oy){let sx=b.x*z+ox,sy=b.y*z+oy;const sr=b.r*z,m=sr*(b.t>=5?4.6:1.7)+80;if(b.hid||sx<-m||sx>W+m||sy<-m||sy>H+m||sr<.4)return;
 const al=cl((T-b.born)/3,0,1);if(!al)return;if(b===planet&&!ex){const q=(T-t0)*3;sx+=Math.sin(T*80)*q;sy+=Math.cos(T*71)*q}
 ctx.globalAlpha=al;
 if(b.t<=4){ctx.save();ctx.translate(sx,sy);ctx.rotate(b.rot);const im=b.t===0&&METEOR?METEOR:SP[b.t][b.v%SP[b.t].length];ctx.drawImage(im,-sr,-sr,sr*2,sr*2);ctx.restore();
  if(b.t>=3){ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(sx,sy,sr*.95,sx,sy,sr*1.2);g.addColorStop(0,'rgba(150,200,255,.22)');g.addColorStop(1,'rgba(150,200,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(sx,sy,sr*1.2,0,TAU);ctx.fill();ctx.globalCompositeOperation='source-over'}}
 else if(b.t<8){const c=starCol(b);ctx.globalCompositeOperation='lighter';let g=ctx.createRadialGradient(sx,sy,sr*.8,sx,sy,sr*3.6);g.addColorStop(0,`rgba(${c},.5)`);g.addColorStop(1,`rgba(${c},0)`);ctx.fillStyle=g;ctx.beginPath();ctx.arc(sx,sy,sr*3.6,0,TAU);ctx.fill();ctx.globalCompositeOperation='source-over';
  g=ctx.createRadialGradient(sx-sr*.25,sy-sr*.25,sr*.1,sx,sy,sr);g.addColorStop(0,'#fff');g.addColorStop(.55,`rgb(${c})`);g.addColorStop(1,`rgba(${c},.9)`);ctx.fillStyle=g;ctx.beginPath();ctx.arc(sx,sy,sr,0,TAU);ctx.fill();
  ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(${c},.45)`;ctx.lineWidth=Math.max(1,sr*.07);for(let k=0;k<3;k++){ctx.beginPath();ctx.arc(sx,sy,sr*(.97-k*.12),b.rot*(k+1),b.rot*(k+1)+1.1);ctx.stroke()}ctx.globalCompositeOperation='source-over'}
 else{ctx.globalCompositeOperation='lighter';let g=ctx.createRadialGradient(sx,sy,sr,sx,sy,sr*2.8);g.addColorStop(0,'rgba(90,150,255,.4)');g.addColorStop(1,'rgba(90,150,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(sx,sy,sr*2.8,0,TAU);ctx.fill();ctx.globalCompositeOperation='source-over';ctx.fillStyle='#000';ctx.beginPath();ctx.arc(sx,sy,sr,0,TAU);ctx.fill();ctx.strokeStyle='rgba(140,210,255,.55)';ctx.lineWidth=Math.max(1,sr*.03);ctx.stroke()}
 if(b.mode===2&&sr>6){ctx.strokeStyle='rgba(255,90,130,.45)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(sx,sy,sr*1.12+3,0,TAU);ctx.stroke()}
 if(b.heat>.05&&b.t<8){ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(sx,sy,sr*.6,sx,sy,sr*1.5);g.addColorStop(0,`rgba(70,170,255,${b.heat*.6})`);g.addColorStop(1,'rgba(70,170,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(sx,sy,sr*1.5,0,TAU);ctx.fill();
  if(b.heat>.12){const L=sr*(1.5+b.heat*6)+20*b.heat,g2=ctx.createLinearGradient(sx,sy,sx+b.hx*L,sy+b.hy*L);g2.addColorStop(0,`rgba(255,255,255,${b.heat})`);g2.addColorStop(.4,`rgba(120,210,255,${b.heat*.6})`);g2.addColorStop(1,'rgba(70,170,255,0)');ctx.strokeStyle=g2;ctx.lineWidth=Math.max(1.5,sr*.18);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx+b.hx*L,sy+b.hy*L);ctx.stroke()}
  ctx.globalCompositeOperation='source-over'}
 ctx.globalAlpha=1}
function draw(){ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.fillStyle='#04050c';ctx.fillRect(0,0,W,H);if(!P)return;
 const z=cam.z,sh=cam.sh*8,ox=W/2-cam.x*z+rr(-sh,sh),oy=H/2-cam.y*z+rr(-sh,sh);
 for(const s of SS){ctx.fillStyle=`rgba(255,244,230,${s.a})`;ctx.fillRect(((s.x*W-cam.x*z*s.f)%W+W)%W,((s.y*H-cam.y*z*s.f)%H+H)%H,s.s,s.s)}
 ctx.lineWidth=1;for(const b of B){const gr=b.r*(b.t===8?4.5:3.2)*z;if(b.hid||b.orb||b.r*z<5||gr>5000)continue;ctx.setLineDash(b===P?[6,8]:[2,10]);ctx.strokeStyle=b===P?'rgba(159,211,255,.4)':'rgba(180,200,255,.13)';ctx.beginPath();ctx.arc(b.x*z+ox,b.y*z+oy,gr,0,TAU);ctx.stroke()}ctx.setLineDash([]);
 for(const b of B.slice().sort((a,c)=>c.r-a.r))drawBody(b,z,ox,oy);
 ctx.globalCompositeOperation='lighter';for(const p of PA){ctx.fillStyle=`rgba(${p.c},${1-p.l/p.m})`;ctx.beginPath();ctx.arc(p.x*z+ox,p.y*z+oy,Math.max(.6,p.s*z),0,TAU);ctx.fill()}
 for(const r of RG){ctx.strokeStyle=`rgba(160,225,255,${1-r.t})`;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(r.x*z+ox,r.y*z+oy,r.r*z,0,TAU);ctx.stroke()}ctx.globalCompositeOperation='source-over';
 if(!P.hid&&!P.dead&&phase!=='end'){const sx=P.x*z+ox,sy=P.y*z+oy,sr=P.r*z,s=Math.hypot(P.vx,P.vy),a=s>1e-3?Math.atan2(P.vy,P.vx):P.ang||0;
  ctx.strokeStyle='rgba(159,211,255,.55)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(sx,sy,sr+3,0,TAU);ctx.stroke();
  ctx.save();ctx.translate(sx+Math.cos(a)*(sr+20),sy+Math.sin(a)*(sr+20));ctx.rotate(a);ctx.fillStyle='#38e1ff';ctx.strokeStyle='#021018';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(11,0);ctx.lineTo(-6,7);ctx.lineTo(-3,0);ctx.lineTo(-6,-7);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
  ctx.font='600 13px "Exo 2",sans-serif';ctx.textAlign='center';ctx.fillStyle='#f3ede6';ctx.fillText(nome,sx,sy-sr-12)}}
/* ---------- carga e loop ---------- */
$('ph').textContent=['Dica de sobrevivência: se algo parecer maior que você... provavelmente é. Corra!','Procurando uma dieta equilibrada? Coma uma lua no café da manhã e um planeta no almoço.','Quando você vira um Buraco Negro, todos querem se aproximar. Literalmente.'][R()*3|0];
$('tip').style.display='none';
build();setTimeout(()=>{$('load').classList.add('off');begin()},2500);
let paused=false;const pz=$('pz');
function pause(v){if(phase==='load'||phase==='end')return;paused=v;pz.hidden=!v;M.d=false;if(v)$('go').focus()}
$('pb').onclick=()=>pause(true);$('go').onclick=()=>pause(false);
addEventListener('keydown',e=>{if(e.key==='Escape'||e.key.toLowerCase()==='p')pause(!paused)});document.addEventListener('visibilitychange',()=>{if(document.hidden)pause(true)});
let last=0;(function loop(ts){const dt=Math.min(.05,(ts-last)/1000||0);last=ts;if(phase!=='load'&&!paused)update(dt);draw();requestAnimationFrame(loop)})(0);
})();
