// ShelfCheck price repair: an explicitly imported user price profile may override
// ShelfCheck's shared public pricing per identity; baked-in audited CIB values must keep
// working on every device without an import, and must keep receiving ShelfCheck's ongoing
// pricing updates instead of freezing at whatever was known the first time a browser loaded.
//
// Precedence, deterministic and evaluated per identity:
//   explicit user-imported profile  >  current ShelfCheck public/audited pricing  >  x.max  >  no price (PRICE PENDING)
//
// "Current ShelfCheck public/audited pricing" is `priceMap`, the SAME global app.js's own
// rebuildPriceMap() keeps live from stateCache.prices on every saveState() call (which every
// public price-*.js script triggers when it merges new data in) -- this file must not shadow
// or freeze that, or newly shipped public pricing stops reaching a browser that already has
// some price data cached. `shelfcheckPriceProfile` in localStorage is a SEPARATE, much
// narrower thing: it is ONLY authoritative when it carries userImported:true, set exclusively
// by importPrices() below (a deliberate action from the maintenance menu's IMPORT PRICES
// button). An older ShelfCheck version auto-migrated an untagged snapshot into this same key
// the first time a browser ever loaded the app; that untagged snapshot must NOT be treated as
// an intentional import -- it is silently ignored here rather than deleted (no destructive
// migration needed), and ShelfCheck falls through to live public pricing instead.
const PRICE_STORAGE_KEY='shelfcheckPriceProfile';
let userPriceMap=new Map();
function loadUserPriceProfile(){
  let d=null;
  try{d=JSON.parse(localStorage.getItem(PRICE_STORAGE_KEY)||'null')}catch{}
  userPriceMap=new Map();
  if(d&&d.userImported===true)for(const p of d.prices||[])if(p?.t)userPriceMap.set(norm(p.t),p);
  return d;
}
function priceCount(){return priceMap?.size||0}
function priceFor(x){
  // 1) An explicit user import wins, per identity, when it covers this title.
  let p=userPriceMap.get(norm(x.title));if(p)return p;
  for(const a of aliasesById.get(x.id)||[]){p=userPriceMap.get(a);if(p)return p}
  // 2) Current ShelfCheck public/audited pricing -- kept live by app.js's rebuildPriceMap().
  p=priceMap.get(norm(x.title));if(p)return p;
  for(const a of aliasesById.get(x.id)||[]){p=priceMap.get(a);if(p)return p}
  // 3) Public pricing patches write their audited CIB value to x.max. Treat that as the
  // shared market price so browse cards, HUNT sorting and detail pages work fresh/incognito.
  const m=Number(x?.max);if(Number.isFinite(m)&&m>0)return{t:x.title,m,x:m,source:x.priceSource||'ShelfCheck public price snapshot',public:true};
  return null;
}
function money(v){return v==null?'—':`$${Number(v).toFixed(2)}`}
function priceHtml(x){const p=priceFor(x);if(!p)return `<div class="dossier-block"><h4>PRICE GUIDE</h4><p class="muted">PRICE PENDING</p></div>`;return `<div class="dossier-block"><h4>PRICE GUIDE</h4><div class="hltb-times"><div><small>STRONG BUY</small><b>${money(p.s)}</b></div><div><small>TARGET</small><b>${money(p.g)}</b></div><div><small>CIB MARKET</small><b>${money(p.m??p.x)}</b></div></div></div>`}
function advice(x,p){if(status(x)==='OWNED')return['SKIP','Already owned.'];if(x.set!=='INCLUDED')return['SKIP','Not part of the Josh Set.'];const pr=priceFor(x),strong=pr?.s??x.strong,target=pr?.g??x.target,max=pr?.x??pr?.m??x.max;if(strong!=null&&p<=strong)return['GRAB IT',`At/below your ${money(strong)} strong-buy price.`];if(target!=null&&p<=target)return['BUY',`Within your ${money(target)} target.`];if(max!=null&&p<=max)return['FAIR',`Reasonable versus the ${money(max)} CIB market ceiling.`];if(max!=null)return['WAIT',`Above the ${money(max)} CIB market ceiling.`];return['NEED IT','You need it; no verified price profile yet.']}
importPrices=async function(f){try{const d=JSON.parse(await f.text());if(!Array.isArray(d.prices)||!d.prices.length)throw 0;const clean={version:d.version||1,source:d.source||f.name,method:d.method||'',userImported:true,importedAt:new Date().toISOString(),prices:d.prices};localStorage.setItem(PRICE_STORAGE_KEY,JSON.stringify(clean));loadUserPriceProfile();resetBrowse();$('#syncmsg').textContent=`Prices: ${userPriceMap.size} verified CIB profiles imported locally (override).`}catch(e){console.warn(e);$('#syncmsg').textContent='Invalid ShelfCheck price profile.'}}
function decoratePriceCards(){for(const card of document.querySelectorAll('#results article.card')){const title=card.querySelector('.top b')?.textContent;if(!title)continue;const x=items.find(g=>norm(g.title)===norm(title));if(!x)continue;const p=priceFor(x);if(!p)continue;const market=p.m??p.x;if(market==null)continue;const sub=card.querySelector('.sub');if(sub&&!sub.dataset.priced){sub.dataset.priced='1';sub.innerHTML+=` · <b>CIB ${money(market)}</b>`}}}
const _renderWithCollections=render;
render=function(){_renderWithCollections();decoratePriceCards()};
loadUserPriceProfile();
const _loadState=loadState;
// _loadState (app.js) already calls rebuildPriceMap(), so priceMap stays live from
// stateCache.prices on every load -- only the user-import tier needs a manual refresh here.
loadState=function(){_loadState();loadUserPriceProfile()};