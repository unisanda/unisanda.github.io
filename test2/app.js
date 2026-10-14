'use strict';
(() => {
 const games=globalThis.GAMES; let index=0;
 const $=id=>document.getElementById(id);
 const crops={starwars:'28% 50%',gears:'50% 50%',silver:'50% 50%',castlevania:'50% 50%',tenebris:'50% 50%',phantom:'50% 50%'};
 games.forEach((g,i)=>{const button=document.createElement('button');button.className='thumb-item';button.setAttribute('aria-label',g.title);button.style.setProperty('--crop',crops[g.id]);const image=document.createElement('img');image.src=g.image;image.alt='';button.append(image);button.addEventListener('click',()=>render(i));$('thumbstrip').append(button);});
 function render(next){index=(next+games.length)%games.length;const g=games[index];$('game-title').textContent=g.title;$('synopsis').textContent=g.summary;$('poster').src=g.image;$('poster').alt=g.title;$('poster').style.setProperty('--crop',crops[g.id]);$('backdrop').style.backgroundImage=`url("${g.image}")`;$('counter-current').textContent=String(index+1).padStart(2,'0');$('counter-total').textContent=String(games.length).padStart(2,'0');$('date').textContent=new Intl.DateTimeFormat('ar-SA-u-ca-gregory-nu-latn',{weekday:'long',day:'numeric',month:'long'}).format(new Date(g.date+'T12:00:00'));$('platforms').textContent=g.platforms.map(p=>p==='Xbox Series X|S'?'Xbox':p).join(' · ');$('details').href=g.sources.find(s=>/starwars.com|xbox.com|konami.com|steampowered.com|playstation.com/.test(s.url))?.url||g.sources[0].url;$('details').setAttribute('aria-label',`تفاصيل ${g.title} — ${g.sources[0].label}`);const now=new Date();const today=Date.UTC(now.getFullYear(),now.getMonth(),now.getDate());const days=Math.round((Date.parse(g.date+'T00:00:00Z')-today)/86400000);$('status').textContent=days<0?'متاح حسب الموعد':days===0?'موعده اليوم':days===1?'غداً':`متبقي ${days} يوماً`;$('progress-fill').style.width=((index+1)/games.length*100)+'%';[...$('thumbstrip').children].forEach((b,i)=>{b.classList.toggle('active',i===index);b.setAttribute('aria-current',i===index?'true':'false');});const active=$('thumbstrip').children[index];const strip=$('thumbstrip');strip.scrollLeft=Math.max(0,active.offsetLeft-strip.offsetWidth/2+active.offsetWidth/2);}
 $('next').addEventListener('click',()=>render(index+1));
 $('previous').addEventListener('click',()=>render(index-1));
 document.addEventListener('keydown',e=>{if(e.altKey||e.ctrlKey||e.metaKey)return;const targets={ArrowRight:index+1,ArrowLeft:index-1,Home:0,End:games.length-1};if(e.key in targets){e.preventDefault();render(targets[e.key]);}});
 let touch=null;
 document.querySelector('.hero').addEventListener('touchstart',e=>{touch=e.touches.length===1?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null;},{passive:true});
 document.querySelector('.hero').addEventListener('touchend',e=>{if(!touch)return;const end=e.changedTouches[0];const dx=end.clientX-touch.x,dy=end.clientY-touch.y;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy))render(index+(dx<0?1:-1));touch=null;},{passive:true});
 document.querySelector('.hero').addEventListener('touchcancel',()=>{touch=null;},{passive:true});
 render(0);
})();
