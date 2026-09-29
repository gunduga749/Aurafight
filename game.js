const $=i=>document.getElementById(i),st=$('st'),sleep=ms=>new Promise(r=>setTimeout(r,ms)),rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const IC=['img/embestida.jpg','img/golpe-de-aura.jpg','img/barrera.jpg','img/tormenta.jpg'];
const SK=[
{k:'emb',n:'EMBESTIDA',c:1,d:[10,16],t:'Ataque veloz de aura. Daño 10-16'},
{k:'gol',n:'GOLPE DE AURA',c:2,d:[18,26],t:'Golpe cargado. Daño 18-26'},
{k:'bar',n:'BARRERA',c:1,d:0,t:'Reduce un 75% el daño recibido y ganas +6'},
{k:'tor',n:'TORMENTA',c:3,d:[30,42],t:'Devastadora. Daño 30-42, 25% de fallo'}];
const POS=[{x:27,y:56},{x:72,y:40}];
let hp,en,sel,busy,turn;
function place(e,p,w,h){e.style.left=p.x+'%';e.style.top=p.y+'%';e.style.width=w+'cqw';e.style.height=h+'cqw'}
place($('aP'),POS[0],40,46);place($('aE'),POS[1],26,34);place($('s0'),POS[0],30,40);place($('s1'),POS[1],17,26);
SK.forEach((s,i)=>{const b=document.createElement('button');b.className='s';b.innerHTML=`<img src="${IC[i]}" alt=""><span>${s.n}</span><small>${'⚡'.repeat(s.c)}</small>`;b.onclick=()=>pick(i);$('sk').appendChild(b)});
const msg=t=>$('msg').textContent=t;
function render(){for(let i=0;i<2;i++){$('h'+i).style.width=hp[i]+'%';$('t'+i).textContent=hp[i]+'/100';$('e'+i).innerHTML=[0,1,2,3,4].map(k=>`<u class="${k<en[i]?'on':''}"></u>`).join('')}
[...$('sk').children].forEach((b,i)=>{b.classList.toggle('on',sel===i);b.classList.toggle('no',SK[i].c>en[0])});
$('go').disabled=busy||sel===null;$('turn').textContent='TURNO '+turn}
function reset(){hp=[100,100];en=[3,3];sel=null;busy=false;turn=1;$('end').style.display='none';$('inf').textContent='';msg('Elige tu técnica y pulsa ATACAR');render()}
function pick(i){if(busy)return;if(SK[i].c>en[0]){msg('¡Aura insuficiente!');snd(120,.2,'sawtooth');return}sel=i;$('inf').textContent=SK[i].t;msg('Elegida: '+SK[i].n);snd(660,.08);render()}
function ai(){const o=[0,1,2,3].filter(i=>SK[i].c<=en[1]);if(hp[1]<35&&o.includes(2)&&Math.random()<.5)return 2;const a=o.filter(i=>i!=2);return(Math.random()<.2||!a.length)?2:a[rnd(0,a.length-1)]}
async function play(){
if(busy||sel===null)return;busy=true;const a=SK[sel],b=SK[ai()];en[0]-=a.c;en[1]-=b.c;render();snd(300,.15,'square');
msg(`TÚ: ${a.n}  vs  OPONENTE: ${b.n}`);await sleep(1200);
[[0,a],[1,b]].forEach(([i,s])=>{if(s.k=='bar'){$('s'+i).classList.add('on');flare(i);gain(i,6);snd(520,.3)}});
if(a.k=='bar'||b.k=='bar')await sleep(900);
await act(0,a,b);if(hp[1]>0)await act(1,b,a);
$('s0').classList.remove('on');$('s1').classList.remove('on');
if(hp[0]<=0||hp[1]<=0)return finish();
en=en.map(v=>Math.min(5,v+1));turn++;sel=null;busy=false;$('inf').textContent='';msg('Elige tu técnica y pulsa ATACAR');render()}
async function act(i,s,o){if(s.k=='bar')return;const j=1-i;flare(i);
await(i?orbs(s):dash(s));
if(s.k=='tor'&&Math.random()<.25){pop(j,'¡FALLO!','miss');snd(150,.3);await sleep(900);return}
let d=rnd(...s.d);const bl=o.k=='bar';if(bl){d=Math.max(1,Math.round(d*.25));pop(j,'¡BLOQUEO!','blk',9)}
hp[j]=Math.max(0,hp[j]-d);impact(j,s,bl);pop(j,'-'+d,'neg');render();
await sleep(800);gain(i,Math.round(d*.2));await sleep(800)}
function gain(i,n){const g=Math.min(n,100-hp[i]);if(g<=0)return;hp[i]+=g;pop(i,'+'+g,'pos');render();snd(880,.2)}
function finish(){const w=hp[1]<=0,h=$('end').firstElementChild;h.textContent=w?'¡VICTORIA!':'DERROTA';h.style.color=w?'#ffd76a':'#ff6a55';msg(w?'El oponente ha caído':'Tu aura se ha apagado');$('end').style.display='flex';snd(w?900:100,.8,'triangle')}
function dash(s){const W=st.clientWidth,dx=(POS[1].x-POS[0].x)/100*W,dy=(POS[1].y-POS[0].y)/100*W*.5455,T=`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px))`;
const kf=[{transform:'translate(-50%,-50%) scale(1)',opacity:0},{opacity:.9,offset:.2},{transform:T+' scale(.5)',opacity:.9,offset:.9},{transform:T+' scale(.4)',opacity:0}];
for(let k=0;k<(s.k=='emb'?3:4);k++){const c=$('spr').cloneNode();c.removeAttribute('id');c.className='gh';st.appendChild(c);c.animate(kf,{duration:600,delay:k*80,easing:'ease-in'}).onfinish=()=>c.remove()}
if(s.k=='tor')swirl(1);snd(400,.4,'sawtooth');return sleep(700)}
function orbs(s){const W=st.clientWidth,dx=(POS[0].x-POS[1].x)/100*W,dy=(POS[0].y-POS[1].y)/100*W*.5455,n=s.k=='tor'?3:1,z=s.k=='gol'?9:6;
for(let k=0;k<n;k++){const o=document.createElement('div');o.className='orb';o.style.cssText=`left:${POS[1].x}%;top:${POS[1].y}%;width:${z}cqw;height:${z}cqw`;st.appendChild(o);
o.animate([{transform:'translate(-50%,-50%) scale(.3)',opacity:0},{opacity:1,offset:.2},{transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(1)`,opacity:1}],{duration:600,delay:k*130,easing:'ease-in'}).onfinish=()=>o.remove()}
if(s.k=='tor')swirl(0);snd(300,.4,'sawtooth');return sleep(700+(n-1)*130)}
function swirl(j){const c=j?'80,200,255':'255,70,50',d=document.createElement('div');d.className='sw';d.style.cssText=`left:${POS[j].x}%;top:${POS[j].y}%;background:conic-gradient(rgba(${c},.9),transparent 25%,rgba(${c},.9) 50%,transparent 75%,rgba(${c},.9))`;st.appendChild(d);
d.animate([{transform:'translate(-50%,-50%) rotate(0) scale(.4)',opacity:0},{opacity:1,offset:.3},{transform:'translate(-50%,-50%) rotate(540deg) scale(1.5)',opacity:0}],{duration:1400}).onfinish=()=>d.remove()}
function impact(j,s,bl){const c=j?'80,200,255':'255,70,50';ring(j,c);burst(j,bl?20:s.k=='tor'?90:55,c);flare(j);shake(s.k=='tor'?2:1);flash(j?'#7df':'#f33');snd(bl?200:90,.25,'sawtooth')}
function ring(j,c){const r=document.createElement('div');r.className='rg';r.style.cssText=`left:${POS[j].x}%;top:${POS[j].y}%;border-color:rgb(${c});box-shadow:0 0 3cqw rgb(${c}),inset 0 0 2cqw rgb(${c})`;st.appendChild(r);
r.animate([{transform:'translate(-50%,-50%) scale(.2)',opacity:1},{transform:'translate(-50%,-50%) scale(1.8)',opacity:0}],{duration:700,easing:'ease-out'}).onfinish=()=>r.remove()}
function flash(c){$('fl').style.background=c;$('fl').animate([{opacity:.55},{opacity:0}],{duration:450})}
function shake(n){const p=st.clientWidth*.012*n;st.animate([{transform:'translate(0,0)'},{transform:`translate(${-p}px,${p/2}px)`},{transform:`translate(${p}px,${-p/2}px)`},{transform:`translate(${-p/2}px,0)`},{transform:'translate(0,0)'}],{duration:400})}
function flare(j){const e=$(j?'aE':'aP');e.classList.remove('f');void e.offsetWidth;e.classList.add('f')}
function pop(j,t,c,dy=0){const n=document.createElement('div');n.className='num '+c;n.textContent=t;n.style.left=(POS[j].x+(Math.random()-.5)*8)+'%';n.style.top=(POS[j].y-14+dy)+'%';st.appendChild(n);setTimeout(()=>n.remove(),1600)}
const cv=$('fx'),g=cv.getContext('2d');cv.width=1408;cv.height=768;let ps=[];
function burst(j,n,c){const x=POS[j].x*14.08,y=POS[j].y*7.68;for(let k=0;k<n;k++){const a=Math.random()*6.283,v=2+Math.random()*9;ps.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:0,m:35+Math.random()*35,c,r:2+Math.random()*4,f:.95})}}
function amb(j,c,n,w,h){for(let k=0;k<n;k++)if(Math.random()<.5)ps.push({x:POS[j].x*14.08+(Math.random()-.5)*w,y:POS[j].y*7.68+Math.random()*h,vx:(Math.random()-.5)*.6,vy:-.8-Math.random()*1.6,l:0,m:60+Math.random()*50,c,r:1.5+Math.random()*3,f:1})}
(function loop(){g.clearRect(0,0,1408,768);amb(0,'80,200,255',2,340,200);amb(1,'255,80,50',1,200,140);g.globalCompositeOperation='lighter';
ps=ps.filter(p=>p.l<p.m);for(const p of ps){p.l++;p.x+=p.vx;p.y+=p.vy;p.vx*=p.f;p.vy*=p.f;g.fillStyle=`rgba(${p.c},${1-p.l/p.m})`;g.shadowBlur=8;g.shadowColor=`rgb(${p.c})`;g.beginPath();g.arc(p.x,p.y,p.r,0,6.283);g.fill()}
g.globalCompositeOperation='source-over';requestAnimationFrame(loop)})();
let ac;function snd(f,d,t='sine'){try{ac=ac||new AudioContext();const o=ac.createOscillator(),v=ac.createGain(),n=ac.currentTime;o.type=t;o.frequency.setValueAtTime(f,n);o.frequency.exponentialRampToValueAtTime(f/2,n+d);v.gain.setValueAtTime(.07,n);v.gain.exponentialRampToValueAtTime(.001,n+d);o.connect(v);v.connect(ac.destination);o.start();o.stop(n+d)}catch(e){}}
$('go').onclick=play;$('again').onclick=reset;reset();