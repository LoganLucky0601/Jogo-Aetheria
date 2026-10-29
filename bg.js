(()=>{const c=document.getElementById('bg'),g=c.getContext('2d');let W,H,S=[],M=[];const R=Math.random;
function rs(){W=c.width=innerWidth;H=c.height=innerHeight;S=Array.from({length:Math.round(W*H/5200)},()=>({x:R()*W,y:R()*H,z:.2+R()*.8,t:R()*6}))}
addEventListener('resize',rs);rs();
function f(){g.fillStyle='#04050c';g.fillRect(0,0,W,H);
 const n=g.createRadialGradient(W*.7,H*.3,0,W*.7,H*.3,W*.7);n.addColorStop(0,'rgba(30,90,170,.3)');n.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=n;g.fillRect(0,0,W,H);
 for(const s of S){s.x-=s.z*.12;s.t+=.02;if(s.x<0)s.x=W;g.fillStyle=`rgba(215,238,255,${.35+.4*Math.sin(s.t)*s.z})`;g.fillRect(s.x,s.y,s.z*1.8,s.z*1.8)}
 if(R()<.004)M.push({x:R()*W,y:-10,v:6+R()*5,l:0});
 for(const m of M){m.x-=m.v*.55;m.y+=m.v*.8;m.l++;const q=g.createLinearGradient(m.x,m.y,m.x+m.v*9,m.y-m.v*14);q.addColorStop(0,'rgba(140,230,255,.9)');q.addColorStop(1,'rgba(60,160,255,0)');g.strokeStyle=q;g.lineWidth=2;g.beginPath();g.moveTo(m.x,m.y);g.lineTo(m.x+m.v*9,m.y-m.v*14);g.stroke()}
 M=M.filter(m=>m.y<H+20);requestAnimationFrame(f)}f()})();
