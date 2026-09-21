
const q=s=>document.querySelector(s), qa=s=>[...document.querySelectorAll(s)];

const menu=q('.menu'), links=q('.links');
if(menu&&links){
  menu.setAttribute('aria-expanded','false');
  menu.onclick=()=>{
    const open=links.classList.toggle('open');
    menu.setAttribute('aria-expanded',String(open));
    document.body.classList.toggle('menu-open',open);
  };
  qa('.links a').forEach(a=>a.addEventListener('click',()=>{
    links.classList.remove('open'); menu.setAttribute('aria-expanded','false'); document.body.classList.remove('menu-open');
  }));
}

const launch=q('.ai-launch'), panel=q('.ai-panel'), close=q('.ai-close');
if(launch&&panel){
  launch.setAttribute('aria-label','Open AI Support Guide');
  launch.onclick=()=>{panel.classList.toggle('open'); if(panel.classList.contains('open')) q('.ai-input input')?.focus()};
}
if(close&&panel) close.onclick=()=>panel.classList.remove('open');

const box=q('.ai-messages'), inp=q('.ai-input input'), send=q('.ai-input button');
function msg(t,c){
  if(!box)return;
  const d=document.createElement('div'); d.className='msg '+c; d.textContent=t; box.appendChild(d); box.scrollTop=box.scrollHeight;
}
async function go(text){
  let t=(text??inp?.value??'').trim(); if(!t)return;
  if(inp)inp.value=''; msg(t,'user'); msg('Thinking…','bot');
  let p=box?.lastChild;
  try{
    const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:t})});
    const d=await r.json(); p?.remove(); msg(d.reply||'Please contact the practice for help.','bot');
  }catch(e){p?.remove();msg('The AI guide is temporarily unavailable. Explore the therapy profiles or contact the practice directly.','bot')}
}
if(send)send.onclick=()=>go();
if(inp)inp.onkeydown=e=>{if(e.key==='Enter')go()};
qa('.ai-prompts button').forEach(b=>b.onclick=()=>go(b.dataset.prompt||b.textContent));

/* Therapy profile finder — educational navigation, not diagnosis. */
const finderResult=q('.finder-result');
qa('[data-finder]').forEach(btn=>{
  btn.onclick=()=>{
    qa('[data-finder]').forEach(x=>x.classList.remove('selected'));
    btn.classList.add('selected');
    const data=btn.dataset.finder.split('|');
    if(finderResult){
      finderResult.innerHTML=`<strong>A useful place to start: ${data[0]}</strong><p style="margin-top:6px;color:var(--muted)">${data[1]}</p><a class="btn dark" style="margin-top:14px" href="${data[2]}">Explore this guide</a>`;
      finderResult.classList.add('show');
    }
  };
});

/* Profiles search + category filters. */
const search=q('#profile-search');
const cards=qa('.profile-card');
let activeFilter='all';
function filterProfiles(){
  const term=(search?.value||'').toLowerCase().trim();
  cards.forEach(card=>{
    const text=(card.textContent+' '+(card.dataset.tags||'')).toLowerCase();
    const okFilter=activeFilter==='all'||(card.dataset.tags||'').includes(activeFilter);
    card.dataset.hidden=String(!(okFilter&&(!term||text.includes(term))));
  });
}
if(search)search.addEventListener('input',filterProfiles);
qa('.filter').forEach(btn=>btn.addEventListener('click',()=>{
  qa('.filter').forEach(x=>x.classList.remove('active'));btn.classList.add('active');activeFilter=btn.dataset.filter;filterProfiles();
}));

/* Gentle scroll reveal. */
const reveals=qa('.reveal');
if('IntersectionObserver' in window){
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.08});
  reveals.forEach(x=>io.observe(x));
}else reveals.forEach(x=>x.classList.add('visible'));

/* Current year. */
qa('[data-year]').forEach(x=>x.textContent=new Date().getFullYear());


/* Dark mode: persistent, accessible, and independent of system preference. */
(function(){
  const body=document.body;
  const buttons=[...document.querySelectorAll('[data-theme-toggle]')];
  if(!buttons.length)return;
  const saved=localStorage.getItem('maya-theme');
  const dark=saved==='dark';
  body.classList.toggle('dark-mode',dark);
  function sync(){
    const isDark=body.classList.contains('dark-mode');
    buttons.forEach(b=>{
      b.setAttribute('aria-pressed',String(isDark));
      b.setAttribute('aria-label',isDark?'Switch to light mode':'Switch to dark mode');
      b.title=isDark?'Switch to light mode':'Switch to dark mode';
      const icon=b.querySelector('.theme-icon'); if(icon) icon.textContent=isDark?'☼':'☾';
    });
  }
  buttons.forEach(b=>b.addEventListener('click',()=>{
    body.classList.toggle('dark-mode');
    localStorage.setItem('maya-theme',body.classList.contains('dark-mode')?'dark':'light');
    sync();
  }));
  sync();
})();
