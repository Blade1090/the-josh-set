// ShelfCheck v1.05 — random game picker (NEEDED), price bands, playtime bands, and quick buy advice.
(()=>{
let priceBand='ALL',ownedBand='ALL',buyChoice=null,randomCycle={universe:null,remaining:[],lastId:null};
const bands=[['ALL','ALL PRICES'],['UNDER10','UNDER $10'],['10TO20','$10–20'],['20TO40','$20–40'],['40PLUS','$40+'],['PENDING','PRICE PENDING']];
const lengthBands=[['ALL','ANY LENGTH'],['UNDER4','UNDER 4H'],['4TO8','4–8H'],['8TO15','8–15H'],['15TO30','15–30H'],['30PLUS','30H+'],['PENDING','TIME PENDING']];
const market=x=>{const p=priceFor(x),n=Number(p?.m??p?.x??x.max);return Number.isFinite(n)&&n>0?n:null};
const inBand=x=>{const v=market(x);if(priceBand==='ALL')return true;if(priceBand==='PENDING')return v==null;if(v==null)return false;if(priceBand==='UNDER10')return v<10;if(priceBand==='10TO20')return v>=10&&v<20;if(priceBand==='20TO40')return v>=20&&v<40;return priceBand==='40PLUS'&&v>=40};
const neededPool=()=>{const q=norm($('#q').value);return items.filter(x=>x.set==='INCLUDED'&&effectiveStatus(x)==='NEEDED'&&inBand(x)&&(!q||x.search.includes(q)))};
const playtime=x=>{const h=typeof hltbFor==='function'?hltbFor(x):null,n=Number(h?.a??h?.e??h?.c);return Number.isFinite(n)&&n>=0?n:null};
const inLengthBand=x=>{const h=playtime(x);if(ownedBand==='ALL')return true;if(ownedBand==='PENDING')return h==null;if(h==null)return false;if(ownedBand==='UNDER4')return h<4;if(ownedBand==='4TO8')return h>=4&&h<=8;if(ownedBand==='8TO15')return h>8&&h<=15;if(ownedBand==='15TO30')return h>15&&h<=30;return ownedBand==='30PLUS'&&h>30};
const ownedPool=()=>{const q=norm($('#q').value);return items.filter(x=>x.set==='INCLUDED'&&effectiveStatus(x)==='OWNED'&&inLengthBand(x)&&(!q||x.search.includes(q)))};
function cleanTools(){document.querySelectorAll('.hunt-tools').forEach(x=>x.remove());document.querySelectorAll('.random-main').forEach(x=>x.remove())}
// On NEEDED, Random belongs in the same control row as Should I Buy This?, exactly where
// the user's thumb already is. Price bands remain immediately below that row.
function neededTools(){const results=$('#results');if(filter!=='NEEDED'||!results)return;const sync=document.querySelector('.sync');if(sync){const b=document.createElement('button');b.className='random-main';b.id='randomGame';b.textContent='🎲 RANDOM GAME';b.onclick=randomGame;sync.appendChild(b)}const filterBox=document.createElement('section');filterBox.className='hunt-tools';filterBox.innerHTML=`<div class="price-bands">${bands.map(([key,label])=>`<button data-band="${key}" class="${priceBand===key?'active':''}">${label}</button>`).join('')}</div>`;results.before(filterBox);filterBox.querySelector('.price-bands').onclick=e=>{const key=e.target.dataset.band;if(!key)return;priceBand=key;visibleLimit=70;render()}}
function ownedTools(){const results=$('#results');if(filter!=='OWNED'||!results)return;const pool=ownedPool(),box=document.createElement('section');box.className='hunt-tools owned-random-tools';box.innerHTML=`<div class="hunt-random"><div><small>CAN'T PICK YOUR NEXT GAME?</small><b>${pool.length} ${pool.length===1?'game':'games'} in this playtime</b></div><button id="randomOwned">🎲 WHAT SHOULD I PLAY?</button></div><div class="price-bands length-bands">${lengthBands.map(([key,label])=>`<button data-length="${key}" class="${ownedBand===key?'active':''}">${label}</button>`).join('')}</div>`;results.before(box);box.querySelector('#randomOwned').onclick=randomGame;box.querySelector('.length-bands').onclick=e=>{const key=e.target.dataset.length;if(!key)return;ownedBand=key;visibleLimit=70;render()}}
function resetDialogScroll(){if(dlg)dlg.scrollTop=0}
function shuffle(arr){for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}return arr}
function drawRandomId(pool){const ids=pool.map(x=>x.id),universe=randomCycle.universe,sameUniverse=!!universe&&universe.size===ids.length&&ids.every(id=>universe.has(id));if(!sameUniverse||!randomCycle.remaining.length){const shuffled=shuffle(ids.slice()),last=shuffled.length-1;if(last>0&&shuffled[last]===randomCycle.lastId){const j=Math.floor(Math.random()*last);[shuffled[last],shuffled[j]]=[shuffled[j],shuffled[last]]}randomCycle={universe:new Set(ids),remaining:shuffled,lastId:randomCycle.lastId}}const id=randomCycle.remaining.pop();randomCycle.lastId=id;return id}
function randomGame(){const owned=filter==='OWNED',pool=owned?ownedPool():neededPool();if(!pool.length){$('#syncmsg').textContent=owned?'No owned games match this search.':'No needed games match this price range.';return}const x=byId.get(drawRandomId(pool));detail(x.id);resetDialogScroll();setTimeout(randomDetailButton,0);setTimeout(randomDetailButton,650)}
// Random-opened dossiers get ONE reroll control directly below Store Mode's price/verdict
// area and directly above the Josh Dossier. Anchor to #v instead of guessing by text/content,
// because dossier enhancement wraps sections and made the old text-based anchor land at top.
function randomDetailButton(){resetDialogScroll();if(!dlg.open)return;const host=$('#detail');if(!host||host.querySelector('.another-random-thumb'))return;const b=document.createElement('button');b.className='another-random another-random-thumb';b.textContent='🎲 ANOTHER RANDOM GAME';b.onclick=randomGame;const verdict=host.querySelector('#v');if(verdict)verdict.after(b);else{const dossier=host.querySelector('.dossier');if(dossier)dossier.before(b);else host.appendChild(b)}}
const baseRender=render;render=function(){cleanTools();const original=items;if(filter==='NEEDED'&&priceBand!=='ALL')items=items.filter(inBand);if(filter==='OWNED'&&ownedBand!=='ALL')items=items.filter(inLengthBand);try{baseRender()}finally{items=original}neededTools();ownedTools()};
function buyMatches(value){const q=norm(value);if(!q)return[];return items.filter(x=>x.set==='INCLUDED'&&x.search.includes(q)).sort((a,b)=>(norm(b.title)===q)-(norm(a.title)===q)||a.title.length-b.title.length||a.title.localeCompare(b.title)).slice(0,8)}
function buySearch(){const matches=buyMatches($('#buyTitle').value),out=$('#buyMatches');buyChoice=null;out.innerHTML=matches.length?matches.map(x=>{const st=effectiveStatus(x);return `<button data-id="${x.id}"><b>${esc(x.title)}</b><small>${st}${market(x)==null?' · PRICE PENDING':` · CIB ${money(market(x))}`}</small></button>`}).join(''):'<p class="muted">Type a game title.</p>'}
// Should I Buy This? v2 price-verdict logic. Deliberately independent of dossiers.js's
// storeAdvice() (the per-game detail-view "Store Mode", a different, unrelated screen that
// keeps its own existing OWNED->SKIP behavior) -- this tool always returns a real price
// verdict, with ownership shown as separate context per the v2 spec. Bands are fixed
// percentages of the existing priceFor(x).m CIB market value; all comparisons are done in
// integer cents to avoid float boundary bugs at the exact 75/115/140% edges.
const VERDICT_META={
  GREAT_DEAL:{emoji:'🔥',label:'GREAT DEAL',tone:'great'},
  FAIR:{emoji:'👍',label:'FAIR PRICE',tone:'fair'},
  HIGH:{emoji:'⚠️',label:'HIGH',tone:'high'},
  OVERPRICED:{emoji:'🛑',label:'OVERPRICED',tone:'overpriced'},
  UNKNOWN:{emoji:'❓',label:'PRICE UNKNOWN',tone:'unknown'},
};
function priceVerdict(x,askedPrice){
  if(!Number.isFinite(askedPrice)||askedPrice<0)return null;
  const pr=typeof priceFor==='function'?priceFor(x):null;
  const marketRaw=Number(pr?.m);
  const askedCents=Math.round(askedPrice*100);
  if(!Number.isFinite(marketRaw)||marketRaw<=0)return{tier:'UNKNOWN',asked:askedCents/100};
  const marketCents=Math.round(marketRaw*100);
  let tier;
  if(askedCents*100<=marketCents*75)tier='GREAT_DEAL';
  else if(askedCents*100<=marketCents*115)tier='FAIR';
  else if(askedCents*100<=marketCents*140)tier='HIGH';
  else tier='OVERPRICED';
  const diffCents=askedCents-marketCents;
  // Cheap-game tolerance: only ever pulls an above-market HIGH/OVERPRICED verdict DOWN to
  // FAIR, and only within $2 of market -- never touches GREAT_DEAL (diffCents is always
  // negative or zero there relative to the tighter 75% band, so this branch can't fire for it).
  if((tier==='HIGH'||tier==='OVERPRICED')&&diffCents<=200)tier='FAIR';
  const pctDiff=Math.round(Math.abs(diffCents)/marketCents*100);
  return{tier,market:marketCents/100,asked:askedCents/100,diffCents,diff:diffCents/100,pctDiff};
}
function verdictPriceLine(v){return `${money(v.asked)} store · ${money(v.market)} market`}
function verdictDiffLine(v){if(Math.abs(v.diffCents)<1)return 'Matches market price exactly.';const dir=v.diffCents<0?'under market':'over market',word=v.diffCents<0?'cheaper':'more';return `${money(Math.abs(v.diff))} ${dir} · ${v.pctDiff}% ${word}`}
// Supporting context only -- HLTB/dossier/compilation info that must never change the price
// tier above, reusing dossiers.js's existing storeFacts()/dossierQuality() gating exactly as
// the per-game detail view already does, rather than re-deriving any of it here.
function buyContextLines(x){
  const lines=[];
  const f=typeof storeFacts==='function'?storeFacts(x):null;
  if(!f)return lines;
  if(f.time)lines.push(`Main story about ${f.time}.`);
  if(f.d&&typeof dossierQuality==='function'&&dossierQuality(f.d,x).kind==='good'){
    const text=typeof usefulText==='function'?usefulText(f.d.s):f.d.s;
    if(text)lines.push(text.length>150?text.slice(0,147).trimEnd()+'…':text);
  }
  if(f.pref&&!f.pref.owned)lines.push(`Check ${esc(f.pref.p.title)} instead -- covers ${f.pref.count} Josh Set identities.`);
  return lines;
}
window.__buyCoverError=function(img){const shell=img.closest('.buy-cover');if(shell)shell.innerHTML='<div class="cover-fallback">PS4<br>COVER</div>'};
function buyCoverHtml(x){const cover=window.SHELFCHECK_COVER_ART?.coverFor?.(x);return `<div class="buy-cover">${cover?`<img src="${esc(cover)}" alt="" loading="lazy" decoding="async" onerror="__buyCoverError(this)">`:'<div class="cover-fallback">PS4<br>COVER</div>'}</div>`}
function chooseBuy(id){buyChoice=byId.get(Number(id));const st=effectiveStatus(buyChoice);$('#buyTitle').value=buyChoice.title;$('#buyMatches').innerHTML=`<div class="buy-selected">${buyCoverHtml(buyChoice)}<div class="buy-selected-info"><span class="badge ${st}">${st}</span><b>${esc(buyChoice.title)}</b></div></div>`;$('#buyVerdict').innerHTML='';$('#buyPrice').focus()}
function runBuyAdvice(){
  const el=$('#buyPrice'),p=Number(el.value),out=$('#buyVerdict');
  if(!buyChoice){out.innerHTML='<div class="verdict">Pick the game first.</div>';return}
  if(el.value===''||!Number.isFinite(p)||p<0){out.innerHTML='<div class="verdict">Enter the store price.</div>';return}
  if(buyChoice.set!=='INCLUDED'){out.innerHTML='<div class="buy-answer unknown"><small>SHELFCHECK SAYS</small><strong>❓ NOT IN THE JOSH SET</strong><p>This identity is outside the curated Josh Set -- ShelfCheck has no purchase recommendation for it.</p></div>';return}
  const st=effectiveStatus(buyChoice),owned=st==='OWNED',v=priceVerdict(buyChoice,p),meta=VERDICT_META[v.tier];
  const ownedBanner=owned?'<div class="buy-owned-banner">🔵 ALREADY OWNED</div>':'';
  const priceBlock=v.tier==='UNKNOWN'
    ?`<p>No verified CIB market price yet for ${esc(buyChoice.title)} -- ShelfCheck won't guess at $${p.toFixed(2)}. Use your own judgment.</p>`
    :`<p class="buy-price-line">${esc(verdictPriceLine(v))}</p><p class="buy-diff-line">${esc(verdictDiffLine(v))}</p>`;
  const context=buyContextLines(buyChoice);
  const contextHtml=context.length?`<div class="buy-context"><small>ALSO WORTH KNOWING</small><ul>${context.map(l=>`<li>${esc(l)}</li>`).join('')}</ul></div>`:'';
  out.innerHTML=`${ownedBanner}<div class="buy-answer ${meta.tone}"><small>SHELFCHECK SAYS</small><strong>${meta.emoji} ${meta.label}</strong>${priceBlock}<button id="buyDetails">OPEN FULL DOSSIER</button></div>${contextHtml}`;
  $('#buyDetails').onclick=()=>detail(buyChoice.id);
}
function openBuyTool(){buyChoice=null;$('#detail').innerHTML=`<section class="buy-tool"><small>STORE MODE</small><h2>Should I Buy This?</h2><p class="muted">Pick the game, enter the price on the sticker, and ShelfCheck will call it.</p><label>GAME<input id="buyTitle" type="search" placeholder="Start typing a title…" autocomplete="off"></label><div id="buyMatches"><p class="muted">Type a needed game title.</p></div><label>STORE PRICE<input id="buyPrice" type="number" inputmode="decimal" min="0" step=".01" placeholder="$0.00"></label><button id="runBuy">GET VERDICT</button><div id="buyVerdict"></div></section>`;$('#buyTitle').oninput=buySearch;$('#buyMatches').onclick=e=>{const b=e.target.closest('[data-id]');if(b)chooseBuy(b.dataset.id)};$('#runBuy').onclick=runBuyAdvice;$('#buyPrice').onkeydown=e=>{if(e.key==='Enter')runBuyAdvice()};dlg.showModal();setTimeout(()=>$('#buyTitle').focus(),50)}
function install(){if($('#quickBuyBtn'))return;const b=document.createElement('button');b.id='quickBuyBtn';b.textContent='🤔 SHOULD I BUY THIS?';b.onclick=openBuyTool;document.querySelector('.sync').appendChild(b);render()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();window.SHELFCHECK_FUN={version:106,randomGame,openBuyTool,priceVerdict};
})();
