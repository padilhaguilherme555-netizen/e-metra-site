(()=>{
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine=matchMedia('(pointer:fine)').matches;
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=t=>{t=clamp(t);return t*t*(3-2*t)};
const sectionIds=['inicio','conceito','origem','solucoes','servicos','projetos','sobre','processo','contato','finale'];
let vw=innerWidth,vh=innerHeight,scroll=window.scrollY,mx=-1e4,my=-1e4,mouseLive=false;
let resizeFlag=true;
window.addEventListener('scroll',()=>{scroll=window.scrollY},{passive:true});
window.addEventListener('resize',()=>{vw=innerWidth;vh=innerHeight;resizeFlag=true},{passive:true});
window.addEventListener('pointermove',e=>{mx=e.clientX;my=e.clientY;mouseLive=true},{passive:true});
window.addEventListener('pointerleave',()=>{mouseLive=false;mx=-1e4;my=-1e4},{passive:true});
const progress=document.createElement('div');progress.className='motion-progress';document.body.append(progress);
// Palavra por palavra — também em títulos existentes que já incluem ênfase inline.
const heads=$$('.section-head, .intro h2, .hero h1');
for(const el of heads){
 const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),nodes=[];
 while(walker.nextNode())if(walker.currentNode.textContent.trim())nodes.push(walker.currentNode);
 let idx=0;
 for(const node of nodes){const frag=document.createDocumentFragment();for(const part of node.textContent.match(/\S+\s*|\s+/g)||[]){if(!part.trim()){frag.append(document.createTextNode(part));continue}const m=part.match(/^(\S+)(\s*)$/),sp=document.createElement('span');sp.className='motion-word';sp.style.setProperty('--word-index',idx++);sp.textContent=m?m[1]:part;frag.append(sp);if(m?.[2])frag.append(document.createTextNode(m[2]));}node.replaceWith(frag)}el.classList.add('word-reveal')
}
const wordObserver=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('words-visible');wordObserver.unobserve(e.target)}})},{threshold:.1});heads.forEach(el=>wordObserver.observe(el));
const animated=$$('.eyebrow,.muted,.service,.step,.workspace,.project-card,.founder-photo,.signature,.contact-form,.demo-tabs,.project-visual,.contact-actions');
const enterObserver=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('motion-entered');enterObserver.unobserve(e.target)}})},{threshold:.06});
animated.forEach((el,i)=>{if(el.closest('.hero')||el.classList.contains('reveal'))return;el.classList.add('motion-enter');el.style.setProperty('--enter-delay',`${(i%4)*75}ms`);enterObserver.observe(el)});
if(reduced)return;
// Dois estados completos da marca, construídos da imagem original e recortados em mosaicos.
const stage=document.createElement('div');stage.className='brand-stage';stage.setAttribute('aria-hidden','true');document.body.append(stage);
const ASSETS={em:'assets/em-cropped.png',word:'assets/word-cropped.png'};
const SEED=n=>{let x=Math.sin((n+1)*127.1)*43758.5453;return x-Math.floor(x)};
function makeForm(kind,cols,rows){
 const el=document.createElement('div');el.className='brand-form brand-'+kind;
 const solid=document.createElement('img');solid.className='brand-solid';solid.src=ASSETS[kind];solid.alt='';el.append(solid);
 const pieces=[];
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
  const ix=y*cols+x;
  const part=document.createElement('div');part.className='brand-tile';
  part.style.clipPath=`inset(${y/rows*100}% ${(cols-x-1)/cols*100}% ${(rows-y-1)/rows*100}% ${x/cols*100}%)`;
  el.append(part);
  pieces.push({el:part,x:(x+.5)/cols-.5,y:(y+.5)/rows-.5,r:SEED(ix+321)*Math.PI*2,seed:SEED(ix+91),vx:0,vy:0,px:0,py:0});
 }
 stage.append(el);return {el,solid,pieces,kind};
}
const em=makeForm('em',9,7),word=makeForm('word',14,4);
const nodes=[];
function buildRoute(){
 nodes.length=0;
 const top=id=>{let el=$('#'+id);return el?el.getBoundingClientRect().top+window.scrollY:0};
 const height=id=>$('#'+id)?.offsetHeight||vh;
 // scroll => x/y in VIEWPORT. O EM cruza o visor de cima até embaixo e muda de lado entre seções.
 const freeSpace=$('.hero-mark-space')?.getBoundingClientRect();
 const openingX=freeSpace?(freeSpace.left+freeSpace.width*.5)/vw:.75;
 const openingY=freeSpace?(freeSpace.top+freeSpace.height*.5)/vh:.4;
 const openingSize=freeSpace?Math.min(.69,Math.max(.34,freeSpace.width/Math.min(vw,vh)*.8)):.56;
 const configs=[
 // scroll offset, viewport x/y, relative size, fragmentation, full word, opacity
 [0,openingX,openingY,openingSize,0,0,1],
 [vh*.10,openingX,openingY,openingSize,0,0,1],
 [vh*.40,openingX,openingY+.1,openingSize*.94,1.0,0,.90],
 [vh*.78,.73,.68,.74,1.8,0,.37],
 [top('conceito')-vh*.48,.76,.35,.88,1.1,0,.28],
 [top('conceito')-vh*.10,.75,.50,.95,1.0,.55,.65],
 [top('conceito')+height('conceito')*.22,.76,.50,.96,.15,1,.82],
 [top('conceito')+height('conceito')*.55,.76,.53,.86,.18,1,.65],
 [top('origem')-vh*.38,.82,.60,.69,1.5,0,.20],
 [top('origem')+height('origem')*.45,.16,.72,.65,1.45,0,.13],
 [top('solucoes')-vh*.34,.82,.76,.82,1.25,0,.20],
 [top('solucoes')+height('solucoes')*.45,.83,.79,.88,1.3,0,.16],
 [top('servicos')+height('servicos')*.19,.85,.32,.82,1.45,0,.17],
 [top('servicos')+height('servicos')*.67,.14,.70,.75,1.4,0,.16],
 [top('projetos')+height('projetos')*.25,.16,.76,.90,1.25,0,.20],
 [top('sobre')+height('sobre')*.30,.83,.74,.83,1.15,0,.15],
 [top('diferenciais')+height('diferenciais')*.35,.80,.73,.70,1.35,0,.15],
 [top('processo')+height('processo')*.25,.84,.74,.80,1.35,0,.17],
 [top('contato')-vh*.25,.13,.70,.80,1.5,0,.17],
 [top('contato')+height('contato')*.40,.82,.82,.74,.55,0,.14],
 [top('finale')-vh*.28,.80,.60,.70,1.08,0,.18],
 [top('finale')+height('finale')*.10,.77,.33,.64,.82,0,.28],
 [top('finale')+height('finale')*.26,.74,.29,.58,.46,0,.48],
 [top('finale')+height('finale')*.48,.72,.26,.50,.12,0,.76],
 [top('finale')+height('finale')*.72,.71,.25,.46,.02,0,.96],
 [document.documentElement.scrollHeight-vh*.40,.71,.25,.44,.01,0,.98]
 ];
 configs.forEach(([at,x,y,size,scatter,wordness,opacity])=>nodes.push({at:Math.max(0,at),x,y,size,scatter,wordness,opacity}));
 nodes.sort((a,b)=>a.at-b.at);
}
function sceneAt(pos){let i=0;while(i<nodes.length-2&&nodes[i+1].at<=pos)i++;const a=nodes[i],b=nodes[Math.min(nodes.length-1,i+1)];const t=smooth((pos-a.at)/Math.max(1,b.at-a.at));const result={};for(const k of ['x','y','size','scatter','wordness','opacity'])result[k]=lerp(a[k],b[k],t);return result}
const originalImages=Promise.all([...stage.querySelectorAll('img')].map(im=>im.decode().catch(()=>{})));
function updateForm(form,scene,alpha,now){
 const isWord=form.kind==='word',ratio=isWord?5.446:1.559;
 const width=(!isWord&&scene.exactWidth)?scene.exactWidth:Math.min(vw*(isWord?.68:.59),Math.max(isWord?180:150,Math.min(vw,vh)*(scene.size*(isWord?1.15:1.0))));
 const height=width/ratio;
 const cx=scene.exactWidth&&!isWord?scene.x*vw:Math.max(width/2+12,Math.min(vw-width/2-12,scene.x*vw)),cy=scene.y*vh;
 form.el.style.width=width+'px';form.el.style.height=height+'px';
 form.el.style.left=cx+'px';form.el.style.top=cy+'px';
 form.el.style.opacity=clamp(alpha*scene.opacity).toFixed(3);
 const spread=scene.scatter*(isWord?90:220)*(vw<700?.63:1);
 const fragmentBlend=smooth(scene.scatter/.55);
 form.solid.style.opacity=(1-fragmentBlend).toFixed(3);
 form.pieces.forEach((p,i)=>{
   const bx=p.x*width,by=p.y*height;
   let tx=p.x*spread*(1.8+p.seed)+Math.sin(now*.0005+i*.7)*scene.scatter*12;
   let ty=p.y*spread*(1.8+p.seed)+Math.cos(now*.0004+i*.6)*scene.scatter*12;
   if(fine&&mouseLive&&scroll>vh*.12&&!scene.locked){let dx=cx+bx+tx-mx,dy=cy+by+ty-my;let d=Math.max(1,Math.hypot(dx,dy)),radius=Math.max(170,Math.min(320,width*.54));if(d<radius){const power=Math.pow(1-d/radius,1.6)*Math.min(240,width*.5);tx+=dx/d*power;ty+=dy/d*power;}}
   if(scene.locked){p.px=0;p.py=0;p.vx=0;p.vy=0;tx=0;ty=0;}else{p.vx=(p.vx+(tx-p.px)*.16)*.69;p.vy=(p.vy+(ty-p.py)*.16)*.69;p.px+=p.vx;p.py+=p.vy;}
   p.el.style.opacity=fragmentBlend.toFixed(3);
   p.el.style.transform=`translate3d(${p.px.toFixed(1)}px,${p.py.toFixed(1)}px,0) rotate(${((p.seed-.5)*scene.scatter*19).toFixed(2)}deg)`;
 });
}
let frame=0,lastHeight=0;
function draw(now){
 if(resizeFlag||document.documentElement.scrollHeight!==lastHeight){lastHeight=document.documentElement.scrollHeight;buildRoute();resizeFlag=false}
 const s=sceneAt(scroll);
 // The EM is assembled into the ACTUAL measured box, not a viewport percentage.
 // The original image inside this box is kept invisible: the travelling tiles are the real final symbol.
 const finale=$('#finale'),landing=$('#finaleEmTarget');
 if(finale&&landing){
   const r=finale.getBoundingClientRect(),target=landing.getBoundingClientRect();
   // Begin near the start of the ending scene; finish while the reconstruction frame is on screen.
   const p=clamp((vh*.88-r.top)/Math.max(vh*.68,280));
   if(p>0){
     const t=smooth(p);
     const baseWidth=Math.min(vw*.59,Math.max(150,Math.min(vw,vh)*s.size));
     s.exactWidth=lerp(baseWidth,target.width,t);
     s.x=lerp(s.x,(target.left+target.width/2)/vw,t);
     s.y=lerp(s.y,(target.top+target.height/2)/vh,t);
     s.scatter=lerp(s.scatter,0,t);
     s.wordness=lerp(s.wordness,0,t);
     s.opacity=lerp(s.opacity,1,t);
     s.locked=p>=.999;
   }
 }
 const wordPresence=smooth((s.wordness-.12)/.72);
 const atY=scroll+vh*s.y;
 const inLight=['servicos','processo'].some(id=>{const el=$('#'+id);if(!el)return false;const t=el.getBoundingClientRect().top+scroll;return atY>=t&&atY<t+el.offsetHeight});
 stage.classList.toggle('is-light',inLight);
 // Formas coexistem na metamorfose; ao restante da página o EM volta e continua descendo.
 updateForm(em,s,1-wordPresence,now);
 updateForm(word,s,wordPresence,now);
 progress.style.transform=`scaleX(${clamp(scroll/Math.max(1,lastHeight-vh))})`;
 $('#header')?.classList.toggle('scrolled',scroll>50);
 frame=requestAnimationFrame(draw);
}
originalImages.then(()=>{stage.classList.add('active');document.body.classList.add('motion-ready');buildRoute();frame=requestAnimationFrame(draw)}).catch(()=>{stage.remove();});
if(fine){
 const glow=$('#glow'),grid=$('.hero-grid'),photo=$('.founder-photo');let sx=vw/2,sy=vh/2;
 function cursor(){sx+=(mx-sx)*.08;sy+=(my-sy)*.08;if(glow){glow.style.opacity=mouseLive?'1':'0';glow.style.transform=`translate3d(${sx-300}px,${sy-300}px,0)`}if(grid){grid.style.setProperty('--grid-x',`${(sx/vw-.5)*15}px`);grid.style.setProperty('--grid-y',`${(sy/vh-.5)*15}px`)}if(photo){photo.style.setProperty('--photo-x',`${(sx/vw-.5)*-12}px`);photo.style.setProperty('--photo-y',`${(sy/vh-.5)*-8}px`)}requestAnimationFrame(cursor)}cursor();
 $$('.service,.step,.project-card,.workspace,.mini-ui').forEach(el=>{
 el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;el.style.setProperty('--spot-x',`${x*100}%`);el.style.setProperty('--spot-y',`${y*100}%`);el.style.setProperty('--shine','1');el.style.setProperty('--tilt-x',`${(.5-y)*3.2}deg`);el.style.setProperty('--tilt-y',`${(x-.5)*4}deg`)},{passive:true});
 el.addEventListener('pointerleave',()=>{el.style.setProperty('--shine','0');el.style.setProperty('--tilt-x','0deg');el.style.setProperty('--tilt-y','0deg')});
 });
}
})();
