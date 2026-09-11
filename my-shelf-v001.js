// ShelfCheck "My Shelf" v1 -- a celebratory collection-profile screen: "what have I built?"
// Complementary to Shelf Roulette ("what should I play?"). Every number is computed live from
// the app's existing effective state each time this opens -- nothing here is hardcoded, and
// nothing here is a second ownership/census system.
(()=>{
  const style=document.createElement('style');
  style.textContent=`.shelf-actions{display:flex;flex-direction:column;gap:8px;margin:10px 0}.shelf-actions .roulette-entry-btn{margin:0}.my-shelf-entry-btn{display:block;width:100%;margin:0;padding:14px;border:0;border-radius:14px;background:linear-gradient(135deg,#4ee1c4,#4e8cff);color:#04241d;font-weight:950;font-size:1rem;letter-spacing:.02em;box-shadow:0 8px 24px #4e8cff33;cursor:pointer}@media(min-width:480px){.shelf-actions{flex-direction:row}}`
    +`.my-shelf{padding-top:2px}.my-shelf-hero{text-align:center;padding:4px 0 6px}.my-shelf-hero>small{display:block;color:var(--blue);font-size:.62rem;font-weight:900;letter-spacing:.16em}.my-shelf-hero h2{margin:3px 0 16px;font-size:1.4rem}`
    +`.my-shelf-ring-row{display:flex;align-items:center;justify-content:center;gap:22px;flex-wrap:wrap}`
    +`.my-shelf-ring{position:relative;width:132px;height:132px;border-radius:50%;background:conic-gradient(var(--blue) var(--pct),#232b3a 0);display:flex;align-items:center;justify-content:center;flex:0 0 auto}`
    +`.my-shelf-ring::after{content:'';position:absolute;inset:11px;border-radius:50%;background:#111620}`
    +`.my-shelf-ring b{position:relative;z-index:1;font-size:1.55rem}.my-shelf-ring small{position:relative;z-index:1;display:block;margin-top:-2px;font-size:.6rem;font-weight:900;letter-spacing:.1em;color:#8dbaff}`
    +`.my-shelf-bignums{display:flex;gap:22px}.my-shelf-bignums div{text-align:center}.my-shelf-bignums b{display:block;font-size:1.9rem;font-variant-numeric:tabular-nums}.my-shelf-bignums small{display:block;color:#8e9aad;font-size:.62rem;font-weight:900;letter-spacing:.12em;margin-top:2px}`
    +`.my-shelf-section-head{margin:22px 0 10px;color:var(--blue);font-size:.62rem;font-weight:900;letter-spacing:.16em}`
    +`.my-shelf-stats{display:grid;grid-template-columns:1fr 1fr;gap:10px}.my-shelf-stat{background:#171d27;border:1px solid #283242;border-radius:12px;padding:12px 13px}.my-shelf-stat small{display:block;color:#8dbaff;font-size:.62rem;font-weight:900;letter-spacing:.08em}.my-shelf-stat b{display:block;margin-top:4px;font-size:1.25rem}.my-shelf-stat span{display:block;margin-top:3px;font-size:.75rem;color:#9ba7b8;line-height:1.3}`
    +`.my-shelf-note{font-size:.75rem;margin-top:10px}`
    +`.my-shelf-superlatives{display:flex;flex-direction:column;gap:12px}@media(min-width:700px){.my-shelf-superlatives{flex-direction:row}}`
    +`.superlative-card{display:flex;gap:13px;align-items:center;background:linear-gradient(145deg,#1b2230,#141a24);border:1px solid #344154;border-radius:16px;padding:12px;box-shadow:0 8px 20px #0005;cursor:pointer;flex:1;min-width:0}`
    +`.superlative-cover{flex:0 0 auto;width:70px;height:94px;border-radius:8px;overflow:hidden;background:linear-gradient(160deg,#283343,#151b25);border:1px solid #344154;display:flex;align-items:center;justify-content:center}.superlative-cover img{width:100%;height:100%;object-fit:contain}.superlative-cover .cover-fallback{font-size:.55rem;font-weight:950;letter-spacing:.06em;color:#7790b1;text-align:center;padding:4px;line-height:1.25}`
    +`.superlative-info{min-width:0}.superlative-info small{display:block;color:#8dbaff;font-size:.63rem;font-weight:900;letter-spacing:.08em}.superlative-info b{display:block;margin-top:3px;font-size:.95rem;line-height:1.25}.superlative-time,.superlative-sub{display:block;margin-top:3px;font-size:.78rem;color:#9ba7b8}`
    +`.my-shelf-strip{display:flex;gap:8px;overflow-x:auto;padding:2px 2px 10px}.my-shelf-strip-item{flex:0 0 auto;width:76px;height:102px;border-radius:9px;overflow:hidden;background:linear-gradient(160deg,#283343,#151b25);border:1px solid #344154;box-shadow:0 4px 12px #0005;display:flex;align-items:center;justify-content:center;cursor:pointer}.my-shelf-strip-item img{width:100%;height:100%;object-fit:cover}.my-shelf-strip-item .cover-fallback{font-size:.5rem;font-weight:950;letter-spacing:.05em;color:#7790b1;text-align:center;padding:4px;line-height:1.25}`
    +`.my-shelf-reshuffle{width:100%;margin:14px 0 4px;padding:13px;border:0;border-radius:12px;background:#273044;color:white;font-weight:850;cursor:pointer}`;
  document.head.appendChild(style);

  function ownedPool(){return items.filter(x=>x.set==='INCLUDED'&&effectiveStatus(x)==='OWNED')}
  function mainHoursOf(x){const h=typeof hltbFor==='function'?hltbFor(x):null;const n=Number(h?.a);return Number.isFinite(n)&&n>0?n:null}
  function timeLabel(x){const n=mainHoursOf(x);return n!=null?`~${fmtHours(n)} main`:'TIME UNKNOWN'}
  function shuffle(arr){for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}return arr}

  function coverInnerHtml(x){
    const cover=window.SHELFCHECK_COVER_ART?.coverFor?.(x);
    return cover
      ?`<img src="${esc(cover)}" alt="" loading="lazy" decoding="async" onerror="__myShelfCoverError(this)">`
      :'<div class="cover-fallback">PS4<br>COVER</div>';
  }
  window.__myShelfCoverError=function(img){const p=img.parentElement;if(p)p.innerHTML='<div class="cover-fallback">PS4<br>COVER</div>'};

  function superlativeCard(emoji,label,x,sub){
    return `<article class="superlative-card" onclick="detail(${x.id})">`
      +`<div class="superlative-cover">${coverInnerHtml(x)}</div>`
      +`<div class="superlative-info"><small>${emoji} ${esc(label)}</small><b>${esc(x.title)}</b>`
      +`<span class="superlative-time">${esc(timeLabel(x))}</span>`
      +(sub?`<span class="superlative-sub">${esc(sub)}</span>`:'')
      +'</div></article>';
  }
  function stripItemHtml(x){return `<div class="my-shelf-strip-item" onclick="detail(${x.id})" title="${esc(x.title)}">${coverInnerHtml(x)}</div>`}

  function buildStats(){
    const included=items.filter(x=>x.set==='INCLUDED');
    const owned=included.filter(x=>effectiveStatus(x)==='OWNED');
    const withTime=owned.map(x=>({x,h:mainHoursOf(x)})).filter(o=>o.h!=null);
    let quick=null,monster=null;
    for(const o of withTime){if(!quick||o.h<quick.h)quick=o;if(!monster||o.h>monster.h)monster=o}
    const oneNight=withTime.filter(o=>o.h<=8).length;
    const backlogHours=withTime.reduce((n,o)=>n+o.h,0);
    const wildcard=owned.length?owned[Math.floor(Math.random()*owned.length)]:null;
    const strip=shuffle(owned.slice()).slice(0,Math.min(12,owned.length));
    return{included,owned,withTime,quick,monster,oneNight,backlogHours,wildcard,strip};
  }

  function render(){
    const s=buildStats();
    const host=$('#detail');
    if(!s.owned.length){
      host.innerHTML='<section class="my-shelf"><div class="my-shelf-hero"><small>MY SHELF</small><h2>📊 Your PS4 Collection</h2></div><p class="muted">No owned games yet -- import your GameEye CSV to see your shelf come alive.</p></section>';
      dlg.showModal();
      return;
    }
    const pct=s.included.length?Math.round(s.owned.length/s.included.length*100):0;
    const statBlock=(label,value,sub)=>`<div class="my-shelf-stat"><small>${esc(label)}</small><b>${value}</b>${sub?`<span>${esc(sub)}</span>`:''}</div>`;
    host.innerHTML=`<section class="my-shelf">`
      +`<div class="my-shelf-hero"><small>MY SHELF</small><h2>📊 Your PS4 Collection</h2>`
      +`<div class="my-shelf-ring-row">`
      +`<div class="my-shelf-ring" style="--pct:${pct}%"><b>${pct}%</b><small>COMPLETE</small></div>`
      +`<div class="my-shelf-bignums"><div><b>${s.owned.length}</b><small>OWNED</small></div><div><b>${s.included.length}</b><small>JOSH SET</small></div></div>`
      +`</div></div>`
      +`<div class="my-shelf-section-head">YOUR SHELF</div>`
      +`<div class="my-shelf-stats">`
      +statBlock('QUICK HIT',s.quick?fmtHours(s.quick.h):'—',s.quick?s.quick.x.title:'No known times yet')
      +statBlock('THE MONSTER',s.monster?fmtHours(s.monster.h):'—',s.monster?s.monster.x.title:'No known times yet')
      +statBlock('ONE-NIGHT GAMES',String(s.oneNight),'Known ≤8h main story')
      +statBlock('BACKLOG HOURS',`${Math.round(s.backlogHours)}h`,'Known main-story estimates')
      +`</div>`
      +`<p class="muted my-shelf-note">Known HLTB only · Based on ${s.withTime.length} of ${s.owned.length} owned games with known times</p>`
      +`<div class="my-shelf-section-head">COLLECTION SUPERLATIVES</div>`
      +`<div class="my-shelf-superlatives">`
      +(s.quick?superlativeCard('⚡','QUICK HIT',s.quick.x):'')
      +(s.monster?superlativeCard('🐉','THE MONSTER',s.monster.x):'')
      +(s.wildcard?superlativeCard('🎲',"TONIGHT'S WILDCARD",s.wildcard):'')
      +`</div>`
      +`<div class="my-shelf-section-head">THE SHELF</div>`
      +`<div class="my-shelf-strip">${s.strip.map(stripItemHtml).join('')}</div>`
      +`<button class="my-shelf-reshuffle" onclick="myShelfOpen()">🔀 RESHUFFLE</button>`
      +`</section>`;
    dlg.showModal();
  }

  function openMyShelf(){render()}
  myShelfOpen=openMyShelf;

  function install(){const btn=document.getElementById('myShelfBtn');if(btn)btn.onclick=openMyShelf}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
  window.SHELFCHECK_MY_SHELF={version:1,buildStats,mainHoursOf};
})();
