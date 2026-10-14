/* Static, local-only application. No runtime requests or credentials. */
'use strict';
(() => {
 const $ = id => document.getElementById(id);
 const today = '2026-10-14';
 let visible = GameCatalog.select(GAMES), selected = 'castlevania';
 const dateLabel = date => new Intl.DateTimeFormat('ar', {day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'));
 const current = () => visible.find(g=>g.id===selected);
 function render() {
  visible = GameCatalog.select(GAMES,{query:$('search').value,platform:$('platform').value,sort:$('sort').value});
  if (!current()) selected = visible[0]?.id;
  $('cards').replaceChildren();
  visible.forEach(g=>{
   const b=document.createElement('button');b.className='game-card';b.dataset.id=g.id;b.setAttribute('aria-pressed',String(g.id===selected));b.setAttribute('aria-label','عرض '+g.title);
   const img=document.createElement('img');img.src=g.image;img.alt='';img.loading='lazy';img.width=320;img.height=180;
   const copy=document.createElement('span');copy.className='card-copy';
   [['card-date',dateLabel(g.date)],['card-title',g.title],['card-platforms',g.platforms.join(' · ')]].forEach(([className,text])=>{const span=document.createElement('span');span.className=className;span.textContent=text;if(className!=='card-date')span.dir='ltr';copy.append(span)});
   b.append(img,copy);b.onclick=()=>{selected=g.id;show()};$('cards').append(b);
  });
  $('results').textContent=`${visible.length} من ${GAMES.length} ألعاب منتقاة`;
  $('empty').hidden=visible.length!==0;$('featured').hidden=visible.length===0;
  show();
 }
 function show(){
  const g=current();if(!g)return;
  $('game-title').textContent=g.title;$('summary').textContent=g.summary;$('release').textContent=dateLabel(g.date);$('status').textContent=GameCatalog.status(g.date,today);$('platform-list').textContent=g.platforms.join(' / ');
  $('poster').src=g.image;$('poster').alt='صورة ترويجية للعبة '+g.title;$('backdrop').style.backgroundImage=`url("${g.image}")`;
  const i=visible.indexOf(g);$('counter').textContent=`${String(i+1).padStart(2,'0')} / ${String(visible.length).padStart(2,'0')}`;$('progress-fill').style.width=`${(i+1)/visible.length*100}%`;
  document.querySelectorAll('.game-card').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.id===g.id)));
  $('prev').disabled=$('next').disabled=visible.length<2;
 }
 function move(delta){if(!visible.length)return;selected=visible[(visible.findIndex(g=>g.id===selected)+delta+visible.length)%visible.length].id;show()}
 function reset(){$('search').value='';$('platform').value='all';$('sort').value='earliest';render()}
 $('search').addEventListener('input',render);$('platform').addEventListener('change',render);$('sort').addEventListener('change',render);$('reset').onclick=$('empty-reset').onclick=reset;$('prev').onclick=()=>move(-1);$('next').onclick=()=>move(1);
 $('details').onclick=()=>{
  const g=current();if(!g)return;
  $('dialog-title').textContent=g.title;$('dialog-summary').textContent=g.summary;$('dialog-date').textContent=dateLabel(g.date);$('dialog-platforms').textContent=g.platforms.join(' / ');$('dialog-genre').textContent=g.genre;$('dialog-note').textContent=g.note;$('sources').replaceChildren();
  g.sources.forEach(s=>{const li=document.createElement('li');const a=document.createElement('a');a.href=s.url;a.textContent=s.label;a.target='_blank';a.rel='noopener noreferrer';li.append(a);$('sources').append(li)});$('dialog').showModal();
 };
 $('close').onclick=()=>$('dialog').close();$('dialog').addEventListener('click',e=>{if(e.target===$('dialog')){const r=$('dialog').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('dialog').close()}});
 document.addEventListener('keydown',e=>{if($('dialog').open||e.altKey||e.metaKey||e.ctrlKey||e.target.closest('input,select,textarea,[contenteditable]'))return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1)}});
 let touch=null;const art=document.querySelector('.feature-art');art.addEventListener('touchstart',e=>{touch=e.touches.length===1?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null},{passive:true});art.addEventListener('touchend',e=>{if(!touch||!e.changedTouches.length)return;const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy))move(dx<0?1:-1);touch=null},{passive:true});art.addEventListener('touchcancel',()=>{touch=null},{passive:true});
 render();
})();
