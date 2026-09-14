// ShelfCheck Shelf Roulette v5 -- deal three owned games and optionally pick tonight's play.
// Played/beaten state is lightweight local ShelfCheck state and survives backup/restore.
// Roulette roles and picks are session-only UI state; choosing a game never mutates shelf state.
(()=>{
  const style=document.createElement('style');
  style.textContent=`.roulette-entry-btn{display:block;width:100%;margin:10px 0;padding:14px;border:0;border-radius:14px;background:linear-gradient(135deg,#ffb648,#ff5f6d 55%,#8b5cf6);color:#1a0f00;font-weight:950;font-size:1rem;letter-spacing:.02em;box-shadow:0 8px 24px #ff5f6d33;cursor:pointer}.roulette{padding-top:2px}.roulette-head{margin-bottom:10px}.roulette-head small{display:block;color:var(--blue);font-size:.62rem;font-weight:900;letter-spacing:.16em}.roulette-head h2{margin:3px 0 0;font-size:1.4rem}.roulette-toggle{display:flex;align-items:center;gap:8px;margin:2px 0 8px;font-weight:850;font-size:.85rem}.roulette-toggle input{width:18px;height:18px}.roulette-toggle small{color:#8e9aad;font-weight:600}.roulette-hand{display:flex;flex-direction:column;gap:12px}.roulette-card{position:relative;display:grid;grid-template-columns:76px minmax(0,1fr);gap:10px 12px;align-items:start;background:linear-gradient(145deg,#1b2230,#141a24);border:1px solid #344154;border-radius:16px;padding:11px;box-shadow:0 10px 26px #0006;cursor:pointer;opacity:0;animation:rouletteDeal .38s ease-out forwards;transition:border-color .14s ease,box-shadow .14s ease,transform .14s ease}.roulette-card.roulette-cycling{border-color:#8dbaff;box-shadow:0 0 0 2px #4e8cff55,0 12px 30px #4e8cff33;transform:translateY(-2px)}.roulette-card.roulette-winner{border-color:#ffcf5a;box-shadow:0 0 0 2px #ffcf5a55,0 14px 34px #ffb64833}.roulette-role{display:inline-block;margin:0 0 7px;padding:4px 7px;border:1px solid #44536a;border-radius:999px;background:#111824;color:#b9c9df;font-size:.61rem;font-weight:950;letter-spacing:.07em;white-space:nowrap}.roulette-winner-badge{display:block;margin:0 0 8px;padding:6px 8px;border-radius:9px;background:#ffcf5a;color:#211500;font-size:.68rem;font-weight:950;letter-spacing:.07em;text-align:center}.roulette-cover{grid-column:1;grid-row:1;flex:0 0 auto;width:76px;height:102px;border-radius:9px;overflow:hidden;background:linear-gradient(160deg,#283343,#151b25);border:1px solid #344154;display:flex;align-items:center;justify-content:center}.roulette-cover img{width:100%;height:100%;object-fit:contain}.roulette-cover .cover-fallback{font-size:.6rem;font-weight:950;letter-spacing:.08em;color:#7790b1;text-align:center;padding:5px;line-height:1.3}.roulette-info{grid-column:2;grid-row:1;min-width:0}.roulette-info b{display:block;font-size:1.02rem;line-height:1.22;overflow-wrap:break-word}.roulette-time{display:inline-block;margin-top:5px;color:#8dbaff;font-weight:900;font-size:.68rem;letter-spacing:.05em}.roulette-hook{margin:6px 0 0;font-size:.8rem;line-height:1.35;color:#c3ccd9;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.roulette-hook.muted{color:#6f7c90;font-style:italic}.roulette-actions{grid-column:1/-1;grid-row:2;display:flex;gap:7px;margin-top:0}.roulette-played,.roulette-beaten{flex:1;min-width:0;padding:9px 6px;border:1px solid #46556d;border-radius:9px;background:#111824;color:#d7e3f5;font-size:.78rem;font-weight:900;white-space:nowrap;cursor:pointer}.roulette-beaten{border-color:#7b5cff}.roulette-pick{width:100%;margin:14px 0 7px;padding:15px;border:0;border-radius:12px;background:linear-gradient(135deg,#ffb648,#ff5f6d 58%,#8b5cf6);color:#160c00;font-weight:950;font-size:.95rem;box-shadow:0 6px 20px #ff5f6d33;cursor:pointer}.roulette-pick[disabled]{opacity:.55;cursor:wait}.roulette-pick-again{width:100%;margin:0 0 7px;padding:12px;border:1px solid #5b6880;border-radius:11px;background:#151c28;color:#e7edf7;font-weight:900;cursor:pointer}.roulette-deal{width:100%;margin:0 0 6px;padding:13px;border:0;border-radius:12px;background:linear-gradient(135deg,#7b5cff,#4e8cff);color:white;font-weight:950;box-shadow:0 5px 18px #315cff33;cursor:pointer}.roulette-pool-note{text-align:center;font-size:.75rem}@keyframes rouletteDeal{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:none}}@media(min-width:700px){.roulette-hand{flex-direction:row}.roulette-card{display:flex;flex-direction:column;flex:1;min-width:0;padding:13px}.roulette-cover{width:100%;height:190px}.roulette-actions{width:100%;margin-top:10px}.roulette-hook{display:block;overflow:visible}.roulette-played,.roulette-beaten{font-size:.82rem}.roulette-role{align-self:flex-start}.roulette-winner-badge{width:100%;box-sizing:border-box}}@media(prefers-reduced-motion:reduce){.roulette-card{animation:none;opacity:1;transition:none}.roulette-card.roulette-cycling{transform:none}}`;
  document.head.appendChild(style);

  let lastHandIds=[];
  let currentHand=[];
  let winnerId=null;
  let picking=false;
  let shortNight=false;
  let includePlayed=false;
  let includeBeaten=false;

  function idsFor(key){return new Set(Array.isArray(stateCache?.[key])?stateCache[key]:[])}
  function playedIds(){return idsFor('played')}
  function beatenIds(){return idsFor('beaten')}
  function isPlayed(x){return playedIds().has(x.id)}
  function isBeaten(x){return beatenIds().has(x.id)}
  function setStatus(id,status){
    const played=playedIds(),beaten=beatenIds();
    played.delete(id);beaten.delete(id);
    if(status==='PLAYED')played.add(id);
    if(status==='BEATEN')beaten.add(id);
    saveState({...stateCache,played:[...played],beaten:[...beaten]});
  }
  function eligiblePool(){
    const played=playedIds(),beaten=beatenIds();
    return items.filter(x=>x.set==='INCLUDED'&&effectiveStatus(x)==='OWNED'&&(includePlayed||!played.has(x.id))&&(includeBeaten||!beaten.has(x.id))&&(!shortNight||isShortNight(x)));
  }
  function isShortNight(x){const h=typeof hltbFor==='function'?hltbFor(x):null;const main=Number(h?.a);return Number.isFinite(main)&&main>0&&main<=8}
  function shuffle(arr){for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}return arr}
  function dealHand(){const pool=eligiblePool();let candidates=pool.filter(x=>!lastHandIds.includes(x.id));if(candidates.length<Math.min(3,pool.length))candidates=pool;const hand=shuffle(candidates.slice()).slice(0,Math.min(3,candidates.length));lastHandIds=hand.map(x=>x.id);currentHand=hand;winnerId=null;return{hand,poolSize:pool.length}}
  function mainHours(x){const h=typeof hltbFor==='function'?hltbFor(x):null;const main=Number(h?.a);return Number.isFinite(main)&&main>0?main:null}
  function roleFor(x){const main=mainHours(x);if(main!==null&&main<=8)return{key:'quick',label:'⚡ QUICK HIT'};if(main!==null&&main>=30)return{key:'deep',label:'🏔️ DEEP DIVE'};return{key:'wild',label:'🎲 WILDCARD'}}
  function timeLabel(x){const h=typeof hltbFor==='function'?hltbFor(x):null;if(!h)return'TIME UNKNOWN';const t=fmtHours(h.a)||fmtHours(h.e)||fmtHours(h.c);return t?`~${t} main`:'TIME UNKNOWN'}
  function hookText(x){const d=typeof dossierFor==='function'?dossierFor(x):null;if(!d||(typeof summaryLooksWrong==='function'&&summaryLooksWrong(d,x)))return'';const s=typeof usefulText==='function'?usefulText(d.s):'';if(!s)return'';return s.length>140?s.slice(0,137).trimEnd()+'…':s}
  function cardHtml(x,i){const cover=window.SHELFCHECK_COVER_ART?.coverFor?.(x);const coverHtml=cover?`<img src="${esc(cover)}" alt="" loading="lazy" decoding="async" onerror="__rouletteCoverError(this)">`:'<div class="cover-fallback">PS4<br>COVER</div>';const hook=hookText(x),role=roleFor(x),winner=x.id===winnerId;return `<article class="roulette-card${winner?' roulette-winner':''}" data-id="${x.id}" style="animation-delay:${i*90}ms">${winner?'<div class="roulette-winner-badge">🏆 TONIGHT\'S PICK</div>':''}<div class="roulette-cover" onclick="detail(${x.id})">${coverHtml}</div><div class="roulette-info" onclick="detail(${x.id})"><span class="roulette-role">${role.label}</span><b>${esc(x.title)}</b><small class="roulette-time">${esc(timeLabel(x))}</small>${hook?`<p class="roulette-hook">${esc(hook)}</p>`:'<p class="roulette-hook muted">No dossier hook yet.</p>'}</div><div class="roulette-actions"><button class="roulette-played" onclick="event.stopPropagation();shelfRouletteMarkPlayed(${x.id})">✓ PLAYED THIS</button><button class="roulette-beaten" onclick="event.stopPropagation();shelfRouletteMarkBeaten(${x.id})">🏆 BEAT THIS</button></div></article>`}
  window.__rouletteCoverError=function(img){const shell=img.closest('.roulette-cover');if(shell)shell.innerHTML='<div class="cover-fallback">PS4<br>COVER</div>'};
  function controlsHtml(){if(!currentHand.length)return'';return `<button class="roulette-pick" id="roulettePickBtn" onclick="shelfRoulettePick()">🎰 PICK FOR ME</button>${winnerId?'<button class="roulette-pick-again" onclick="shelfRoulettePick()">NOPE — PICK AGAIN</button>':''}<button class="roulette-deal" onclick="shelfRouletteDeal()">🎲 DEAL AGAIN</button>`}
  function renderCurrent(poolSize){const host=$('#detail');const p=playedIds().size,b=beatenIds().size;const toggleHtml=`<label class="roulette-toggle"><input type="checkbox" id="rouletteShortNight"${shortNight?' checked':''}> SHORT NIGHT <small>(known ≤8h main story)</small></label><label class="roulette-toggle"><input type="checkbox" id="rouletteIncludePlayed"${includePlayed?' checked':''}> INCLUDE PLAYED <small>(${p} marked)</small></label><label class="roulette-toggle"><input type="checkbox" id="rouletteIncludeBeaten"${includeBeaten?' checked':''}> INCLUDE BEATEN <small>(${b} marked)</small></label>`;const bodyHtml=currentHand.length?`<div class="roulette-hand">${currentHand.map(cardHtml).join('')}</div>${controlsHtml()}`:`<p class="muted">No owned games match these Roulette filters yet.</p>`;host.innerHTML=`<section class="roulette"><div class="roulette-head"><small>SHELF ROULETTE</small><h2>🎰 What should I play?</h2></div>${toggleHtml}${bodyHtml}<p class="muted roulette-pool-note">${poolSize} owned ${poolSize===1?'game':'games'} eligible · played/beaten excluded by default</p></section>`;wireToggles(host)}
  function wireToggles(host){const shortToggle=host.querySelector('#rouletteShortNight');if(shortToggle)shortToggle.onchange=()=>{shortNight=shortToggle.checked;lastHandIds=[];renderHand()};const playedToggle=host.querySelector('#rouletteIncludePlayed');if(playedToggle)playedToggle.onchange=()=>{includePlayed=playedToggle.checked;lastHandIds=[];renderHand()};const beatenToggle=host.querySelector('#rouletteIncludeBeaten');if(beatenToggle)beatenToggle.onchange=()=>{includeBeaten=beatenToggle.checked;lastHandIds=[];renderHand()}}
  function renderHand(){const {poolSize}=dealHand();renderCurrent(poolSize)}
  function currentPoolSize(){return eligiblePool().length}
  function chooseFromHand(hand=currentHand,random=Math.random){if(!Array.isArray(hand)||!hand.length)return null;const raw=Number(random());const safe=Number.isFinite(raw)?Math.min(.999999999999,Math.max(0,raw)):0;return hand[Math.floor(safe*hand.length)]||null}
  function reducedMotion(){return typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches}
  function delay(ms){return new Promise(resolve=>setTimeout(resolve,ms))}
  async function pickForMe(){
    if(picking||!currentHand.length)return;
    picking=true;
    const snapshot=currentHand.slice();
    const button=$('#roulettePickBtn');
    if(button)button.disabled=true;
    const winner=chooseFromHand(snapshot);
    if(!winner){picking=false;return}
    if(!reducedMotion()&&snapshot.length>1){
      const cards=[...document.querySelectorAll('.roulette-card')];
      const spins=7;
      for(let i=0;i<spins;i++){
        cards.forEach(c=>c.classList.remove('roulette-cycling'));
        const card=cards[i%snapshot.length];
        if(card)card.classList.add('roulette-cycling');
        await delay(70+i*8);
      }
      cards.forEach(c=>c.classList.remove('roulette-cycling'));
    }
    if(currentHand.length!==snapshot.length||currentHand.some((x,i)=>x.id!==snapshot[i]?.id)){picking=false;return}
    winnerId=winner.id;
    picking=false;
    renderCurrent(currentPoolSize());
  }
  function scrollRouletteTop(){requestAnimationFrame(()=>{if(typeof dlg?.scrollTo==='function')dlg.scrollTo({top:0,behavior:'smooth'});else dlg.scrollTop=0})}
  function dealAgain(){if(picking)return;renderHand();scrollRouletteTop()}
  function markPlayed(id){if(picking)return;setStatus(id,'PLAYED');lastHandIds=lastHandIds.filter(x=>x!==id);renderHand()}
  function markBeaten(id){if(picking)return;setStatus(id,'BEATEN');lastHandIds=lastHandIds.filter(x=>x!==id);renderHand()}
  function openShelfRoulette(){lastHandIds=[];winnerId=null;picking=false;renderHand();dlg.showModal();dlg.scrollTop=0}
  shelfRouletteDeal=dealAgain;shelfRouletteOpen=openShelfRoulette;shelfRoulettePick=pickForMe;shelfRouletteMarkPlayed=markPlayed;shelfRouletteMarkBeaten=markBeaten;
  function install(){const btn=document.getElementById('shelfRouletteBtn');if(!btn)return;btn.onclick=openShelfRoulette}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
  window.SHELFCHECK_ROULETTE={version:5,openShelfRoulette,eligiblePool,isShortNight,isPlayed,isBeaten,setStatus,roleFor,chooseFromHand,getCurrentHand:()=>currentHand.slice(),getWinnerId:()=>winnerId,reducedMotion};
})();
