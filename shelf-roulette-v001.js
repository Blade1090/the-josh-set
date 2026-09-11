// ShelfCheck Shelf Roulette v1 -- a playful "deal three owned games" screen answering
// "what the hell should I play?" Distinct from Random Game (which browses one NEEDED/OWNED
// title at a time): Roulette always draws from the OWNED shelf and always deals three at once.
//
// Deliberately reuses existing machinery rather than building parallel systems:
//   - eligibility: the exact same `x.set==='INCLUDED' && effectiveStatus(x)==='OWNED'` check
//     ownedPool() (fun-features-v103.js) already uses, so a multi-identity product/compilation
//     the app already treats as satisfying its underlying identities is handled identically --
//     there is no separate "container" object in `items` to accidentally deal.
//   - cover art: window.SHELFCHECK_COVER_ART.coverFor(x), the same lookup cover-art-v080.js
//     uses for cards/detail, with the same PS4/COVER fallback markup.
//   - HLTB + dossier hook: hltbFor()/dossierFor()/fmtHours()/usefulText()/summaryLooksWrong()
//     (dossiers.js) -- the same data and the same "is this summary actually good" filtering
//     the real dossier view already applies. Nothing new is generated.
//   - opening a card: detail(x.id), the real detail/dossier renderer, inside the SAME <dialog
//     id="dlg"> Random Game and Should I Buy This? already repurpose for non-card content.
(()=>{
  const style=document.createElement('style');
  style.textContent=`.roulette-entry-btn{display:block;width:100%;margin:10px 0;padding:14px;border:0;border-radius:14px;background:linear-gradient(135deg,#ffb648,#ff5f6d 55%,#8b5cf6);color:#1a0f00;font-weight:950;font-size:1rem;letter-spacing:.02em;box-shadow:0 8px 24px #ff5f6d33;cursor:pointer}.roulette{padding-top:2px}.roulette-head{margin-bottom:10px}.roulette-head small{display:block;color:var(--blue);font-size:.62rem;font-weight:900;letter-spacing:.16em}.roulette-head h2{margin:3px 0 0;font-size:1.4rem}.roulette-toggle{display:flex;align-items:center;gap:8px;margin:2px 0 16px;font-weight:850;font-size:.85rem}.roulette-toggle input{width:18px;height:18px}.roulette-toggle small{color:#8e9aad;font-weight:600}.roulette-hand{display:flex;flex-direction:column;gap:14px}.roulette-card{display:flex;gap:14px;align-items:flex-start;background:linear-gradient(145deg,#1b2230,#141a24);border:1px solid #344154;border-radius:16px;padding:13px;box-shadow:0 10px 26px #0006;cursor:pointer;opacity:0;animation:rouletteDeal .38s ease-out forwards}.roulette-cover{flex:0 0 auto;width:84px;height:112px;border-radius:9px;overflow:hidden;background:linear-gradient(160deg,#283343,#151b25);border:1px solid #344154;display:flex;align-items:center;justify-content:center}.roulette-cover img{width:100%;height:100%;object-fit:contain}.roulette-cover .cover-fallback{font-size:.6rem;font-weight:950;letter-spacing:.08em;color:#7790b1;text-align:center;padding:5px;line-height:1.3}.roulette-info{min-width:0;flex:1}.roulette-info b{display:block;font-size:1.02rem;line-height:1.25}.roulette-time{display:inline-block;margin-top:5px;color:#8dbaff;font-weight:900;font-size:.68rem;letter-spacing:.05em}.roulette-hook{margin:7px 0 0;font-size:.82rem;line-height:1.4;color:#c3ccd9}.roulette-hook.muted{color:#6f7c90;font-style:italic}.roulette-deal{width:100%;margin:16px 0 6px;padding:14px;border:0;border-radius:12px;background:linear-gradient(135deg,#7b5cff,#4e8cff);color:white;font-weight:950;box-shadow:0 5px 18px #315cff33;cursor:pointer}.roulette-pool-note{text-align:center;font-size:.75rem}@keyframes rouletteDeal{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:none}}@media(min-width:700px){.roulette-hand{flex-direction:row}.roulette-card{flex-direction:column;flex:1;min-width:0}.roulette-cover{width:100%;height:190px}}@media(prefers-reduced-motion:reduce){.roulette-card{animation:none;opacity:1}}`;
  document.head.appendChild(style);

  let lastHandIds=[];
  let shortNight=false;

  function eligiblePool(){
    return items.filter(x=>x.set==='INCLUDED'&&effectiveStatus(x)==='OWNED'&&(!shortNight||isShortNight(x)));
  }
  function isShortNight(x){
    const h=typeof hltbFor==='function'?hltbFor(x):null;
    const main=Number(h?.a);
    return Number.isFinite(main)&&main>0&&main<=8;
  }
  function shuffle(arr){for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}return arr}

  // Avoids repeating the immediately previous hand (the concept the existing Random Game
  // shuffle-bag uses to avoid an immediate repeat) without needing that bag's full
  // cross-hand-cycling machinery, which solves a different problem (never repeating ANYTHING
  // until the whole pool has been seen) than "just don't deal the same 3 again next time".
  // Falls back to the unfiltered pool if excluding the last hand would leave too few games
  // (e.g. a very small or heavily-filtered Short Night pool) -- 3 (possibly-repeated) cards
  // beat a broken deal.
  function dealHand(){
    const pool=eligiblePool();
    let candidates=pool.filter(x=>!lastHandIds.includes(x.id));
    if(candidates.length<Math.min(3,pool.length))candidates=pool;
    const hand=shuffle(candidates.slice()).slice(0,Math.min(3,candidates.length));
    lastHandIds=hand.map(x=>x.id);
    return {hand,poolSize:pool.length};
  }

  function timeLabel(x){
    const h=typeof hltbFor==='function'?hltbFor(x):null;
    if(!h)return'TIME UNKNOWN';
    const t=fmtHours(h.a)||fmtHours(h.e)||fmtHours(h.c);
    return t?`~${t} main`:'TIME UNKNOWN';
  }
  function hookText(x){
    const d=typeof dossierFor==='function'?dossierFor(x):null;
    if(!d||(typeof summaryLooksWrong==='function'&&summaryLooksWrong(d,x)))return'';
    const s=typeof usefulText==='function'?usefulText(d.s):'';
    if(!s)return'';
    return s.length>140?s.slice(0,137).trimEnd()+'…':s;
  }
  function cardHtml(x,i){
    const cover=window.SHELFCHECK_COVER_ART?.coverFor?.(x);
    const coverHtml=cover
      ?`<img src="${esc(cover)}" alt="" loading="lazy" decoding="async" onerror="__rouletteCoverError(this)">`
      :'<div class="cover-fallback">PS4<br>COVER</div>';
    const hook=hookText(x);
    return `<article class="roulette-card" data-id="${x.id}" style="animation-delay:${i*90}ms" onclick="detail(${x.id})">`
      +`<div class="roulette-cover">${coverHtml}</div>`
      +`<div class="roulette-info"><b>${esc(x.title)}</b>`
      +`<small class="roulette-time">${esc(timeLabel(x))}</small>`
      +(hook?`<p class="roulette-hook">${esc(hook)}</p>`:'<p class="roulette-hook muted">No dossier hook yet.</p>')
      +'</div></article>';
  }
  window.__rouletteCoverError=function(img){const shell=img.closest('.roulette-cover');if(shell)shell.innerHTML='<div class="cover-fallback">PS4<br>COVER</div>'};

  function renderHand(){
    const {hand,poolSize}=dealHand();
    const host=$('#detail');
    // The Short Night toggle always renders, even with zero matches, so a user who just
    // filtered themselves into an empty pool can turn it back off without being stuck.
    const toggleHtml=`<label class="roulette-toggle"><input type="checkbox" id="rouletteShortNight"${shortNight?' checked':''}> SHORT NIGHT <small>(known ≤8h main story)</small></label>`;
    const bodyHtml=hand.length
      ?`<div class="roulette-hand">${hand.map(cardHtml).join('')}</div>`
      +`<button class="roulette-deal" onclick="shelfRouletteDeal()">🎲 DEAL AGAIN</button>`
      :`<p class="muted">No owned games match${shortNight?' Short Night':''} yet.</p>`;
    host.innerHTML=`<section class="roulette">`
      +`<div class="roulette-head"><small>SHELF ROULETTE</small><h2>🎰 What should I play?</h2></div>`
      +toggleHtml
      +bodyHtml
      +`<p class="muted roulette-pool-note">${poolSize} owned ${poolSize===1?'game':'games'} eligible${shortNight?' for Short Night':''}</p>`
      +`</section>`;
    const toggle=host.querySelector('#rouletteShortNight');
    if(toggle)toggle.onchange=()=>{shortNight=toggle.checked;renderHand()};
  }

  function openShelfRoulette(){lastHandIds=[];renderHand();dlg.showModal()}
  shelfRouletteDeal=renderHand;
  shelfRouletteOpen=openShelfRoulette;

  function install(){
    const btn=document.getElementById('shelfRouletteBtn');
    if(!btn)return;
    btn.onclick=openShelfRoulette;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
  window.SHELFCHECK_ROULETTE={version:1,openShelfRoulette,eligiblePool,isShortNight};
})();
