// ShelfCheck Shelf Roulette v2 -- deal three owned, unbeaten games.
// Beaten state is intentionally lightweight and local: it lives beside the existing
// ShelfCheck state, survives backup/restore, and does not alter ownership or census data.
(()=>{
  const style=document.createElement('style');
  style.textContent=`.roulette-entry-btn{display:block;width:100%;margin:10px 0;padding:14px;border:0;border-radius:14px;background:linear-gradient(135deg,#ffb648,#ff5f6d 55%,#8b5cf6);color:#1a0f00;font-weight:950;font-size:1rem;letter-spacing:.02em;box-shadow:0 8px 24px #ff5f6d33;cursor:pointer}.roulette{padding-top:2px}.roulette-head{margin-bottom:10px}.roulette-head small{display:block;color:var(--blue);font-size:.62rem;font-weight:900;letter-spacing:.16em}.roulette-head h2{margin:3px 0 0;font-size:1.4rem}.roulette-toggle{display:flex;align-items:center;gap:8px;margin:2px 0 10px;font-weight:850;font-size:.85rem}.roulette-toggle input{width:18px;height:18px}.roulette-toggle small{color:#8e9aad;font-weight:600}.roulette-hand{display:flex;flex-direction:column;gap:14px}.roulette-card{display:flex;gap:14px;align-items:flex-start;background:linear-gradient(145deg,#1b2230,#141a24);border:1px solid #344154;border-radius:16px;padding:13px;box-shadow:0 10px 26px #0006;cursor:pointer;opacity:0;animation:rouletteDeal .38s ease-out forwards}.roulette-cover{flex:0 0 auto;width:84px;height:112px;border-radius:9px;overflow:hidden;background:linear-gradient(160deg,#283343,#151b25);border:1px solid #344154;display:flex;align-items:center;justify-content:center}.roulette-cover img{width:100%;height:100%;object-fit:contain}.roulette-cover .cover-fallback{font-size:.6rem;font-weight:950;letter-spacing:.08em;color:#7790b1;text-align:center;padding:5px;line-height:1.3}.roulette-info{min-width:0;flex:1}.roulette-info b{display:block;font-size:1.02rem;line-height:1.25}.roulette-time{display:inline-block;margin-top:5px;color:#8dbaff;font-weight:900;font-size:.68rem;letter-spacing:.05em}.roulette-hook{margin:7px 0 0;font-size:.82rem;line-height:1.4;color:#c3ccd9}.roulette-hook.muted{color:#6f7c90;font-style:italic}.roulette-beaten{margin-top:10px;padding:8px 10px;border:1px solid #46556d;border-radius:9px;background:#111824;color:#d7e3f5;font-weight:900;cursor:pointer}.roulette-deal{width:100%;margin:16px 0 6px;padding:14px;border:0;border-radius:12px;background:linear-gradient(135deg,#7b5cff,#4e8cff);color:white;font-weight:950;box-shadow:0 5px 18px #315cff33;cursor:pointer}.roulette-pool-note{text-align:center;font-size:.75rem}@keyframes rouletteDeal{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:none}}@media(min-width:700px){.roulette-hand{flex-direction:row}.roulette-card{flex-direction:column;flex:1;min-width:0}.roulette-cover{width:100%;height:190px}}@media(prefers-reduced-motion:reduce){.roulette-card{animation:none;opacity:1}}`;
  document.head.appendChild(style);

  let lastHandIds=[];
  let shortNight=false;
  let includeBeaten=false;

  function beatenIds(){return new Set(Array.isArray(stateCache?.beaten)?stateCache.beaten:[])}
  function isBeaten(x){return beatenIds().has(x.id)}
  function setBeaten(id,value){
    const beaten=beatenIds();
    value?beaten.add(id):beaten.delete(id);
    saveState({...stateCache,beaten:[...beaten]});
  }
  function eligiblePool(){
    const beaten=beatenIds();
    return items.filter(x=>x.set==='INCLUDED'&&effectiveStatus(x)==='OWNED'&&(includeBeaten||!beaten.has(x.id))&&(!shortNight||isShortNight(x)));
  }
  function isShortNight(x){const h=typeof hltbFor==='function'?hltbFor(x):null;const main=Number(h?.a);return Number.isFinite(main)&&main>0&&main<=8}
  function shuffle(arr){for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}return arr}
  function dealHand(){const pool=eligiblePool();let candidates=pool.filter(x=>!lastHandIds.includes(x.id));if(candidates.length<Math.min(3,pool.length))candidates=pool;const hand=shuffle(candidates.slice()).slice(0,Math.min(3,candidates.length));lastHandIds=hand.map(x=>x.id);return{hand,poolSize:pool.length}}
  function timeLabel(x){const h=typeof hltbFor==='function'?hltbFor(x):null;if(!h)return'TIME UNKNOWN';const t=fmtHours(h.a)||fmtHours(h.e)||fmtHours(h.c);return t?`~${t} main`:'TIME UNKNOWN'}
  function hookText(x){const d=typeof dossierFor==='function'?dossierFor(x):null;if(!d||(typeof summaryLooksWrong==='function'&&summaryLooksWrong(d,x)))return'';const s=typeof usefulText==='function'?usefulText(d.s):'';if(!s)return'';return s.length>140?s.slice(0,137).trimEnd()+'…':s}
  function cardHtml(x,i){const cover=window.SHELFCHECK_COVER_ART?.coverFor?.(x);const coverHtml=cover?`<img src="${esc(cover)}" alt="" loading="lazy" decoding="async" onerror="__rouletteCoverError(this)">`:'<div class="cover-fallback">PS4<br>COVER</div>';const hook=hookText(x);return `<article class="roulette-card" data-id="${x.id}" style="animation-delay:${i*90}ms"><div class="roulette-cover" onclick="detail(${x.id})">${coverHtml}</div><div class="roulette-info" onclick="detail(${x.id})"><b>${esc(x.title)}</b><small class="roulette-time">${esc(timeLabel(x))}</small>${hook?`<p class="roulette-hook">${esc(hook)}</p>`:'<p class="roulette-hook muted">No dossier hook yet.</p>'}</div><button class="roulette-beaten" onclick="event.stopPropagation();shelfRouletteMarkBeaten(${x.id})">✓ I BEAT THIS</button></article>`}
  window.__rouletteCoverError=function(img){const shell=img.closest('.roulette-cover');if(shell)shell.innerHTML='<div class="cover-fallback">PS4<br>COVER</div>'};
  function renderHand(){const {hand,poolSize}=dealHand();const host=$('#detail');const toggleHtml=`<label class="roulette-toggle"><input type="checkbox" id="rouletteShortNight"${shortNight?' checked':''}> SHORT NIGHT <small>(known ≤8h main story)</small></label><label class="roulette-toggle"><input type="checkbox" id="rouletteIncludeBeaten"${includeBeaten?' checked':''}> INCLUDE BEATEN <small>(${beatenIds().size} marked)</small></label>`;const bodyHtml=hand.length?`<div class="roulette-hand">${hand.map(cardHtml).join('')}</div><button class="roulette-deal" onclick="shelfRouletteDeal()">🎲 DEAL AGAIN</button>`:`<p class="muted">No owned games match these Roulette filters yet.</p>`;host.innerHTML=`<section class="roulette"><div class="roulette-head"><small>SHELF ROULETTE</small><h2>🎰 What should I play?</h2></div>${toggleHtml}${bodyHtml}<p class="muted roulette-pool-note">${poolSize} owned ${poolSize===1?'game':'games'} eligible${includeBeaten?' including beaten games':' · beaten games excluded'}</p></section>`;const shortToggle=host.querySelector('#rouletteShortNight');if(shortToggle)shortToggle.onchange=()=>{shortNight=shortToggle.checked;lastHandIds=[];renderHand()};const beatenToggle=host.querySelector('#rouletteIncludeBeaten');if(beatenToggle)beatenToggle.onchange=()=>{includeBeaten=beatenToggle.checked;lastHandIds=[];renderHand()}}
  function markBeaten(id){setBeaten(id,true);lastHandIds=lastHandIds.filter(x=>x!==id);renderHand()}
  function openShelfRoulette(){lastHandIds=[];renderHand();dlg.showModal()}
  shelfRouletteDeal=renderHand;shelfRouletteOpen=openShelfRoulette;shelfRouletteMarkBeaten=markBeaten;
  function install(){const btn=document.getElementById('shelfRouletteBtn');if(!btn)return;btn.onclick=openShelfRoulette}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
  window.SHELFCHECK_ROULETTE={version:2,openShelfRoulette,eligiblePool,isShortNight,isBeaten,setBeaten};
})();
