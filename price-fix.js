// ShelfCheck price repair: keep imported PriceCharting-derived profile local to this browser,
// independent from GameEye state, and surface verified CIB market values on browse cards.
const PRICE_STORAGE_KEY='shelfcheckPriceProfile';
function loadLocalPrices(){
  let d=null;
  try{d=JSON.parse(localStorage.getItem(PRICE_STORAGE_KEY)||'null')}catch{}
  // Migrate the first price import from the older combined joshSetState format if present.
  if(!d&&Array.isArray(stateCache?.prices)&&stateCache.prices.length){d={version:1,source:stateCache.priceSource||'Migrated ShelfCheck profile',prices:stateCache.prices};try{localStorage.setItem(PRICE_STORAGE_KEY,JSON.stringify(d))}catch(e){console.warn('Price profile migration failed',e)}}
  priceMap=new Map();for(const p of d?.prices||[])if(p?.t)priceMap.set(norm(p.t),p);
  return d;
}
function priceCount(){return priceMap?.size||0}
function priceFor(x){
  let p=priceMap.get(norm(x.title));if(p)return p;
  for(const a of aliasesById.get(x.id)||[]){p=priceMap.get(a);if(p)return p}
  return null;
}
function money(v){return v==null?'—':`$${Number(v).toFixed(2)}`}
function priceHtml(x){const p=priceFor(x);if(!p)return `<div class="dossier-block"><h4>PRICE GUIDE</h4><p class="muted">No verified price profile yet.${priceCount()?` (${priceCount()} profiles loaded locally.)`:''}</p></div>`;return `<div class="dossier-block"><h4>PRICE GUIDE</h4><div class="hltb-times"><div><small>STRONG BUY</small><b>${money(p.s)}</b></div><div><small>TARGET</small><b>${money(p.g)}</b></div><div><small>CIB MARKET</small><b>${money(p.m)}</b></div></div></div>`}
function advice(x,p){if(status(x)==='OWNED')return['SKIP','Already owned.'];if(x.set!=='INCLUDED')return['SKIP','Not part of the Josh Set.'];const pr=priceFor(x),strong=pr?.s??x.strong,target=pr?.g??x.target,max=pr?.x??x.max;if(strong!=null&&p<=strong)return['GRAB IT',`At/below your ${money(strong)} strong-buy price.`];if(target!=null&&p<=target)return['BUY',`Within your ${money(target)} target.`];if(max!=null&&p<=max)return['FAIR',`Reasonable versus the ${money(max)} CIB market ceiling.`];if(max!=null)return['WAIT',`Above the ${money(max)} CIB market ceiling.`];return['NEED IT','You need it; no verified price profile yet.']}
importPrices=async function(f){try{const d=JSON.parse(await f.text());if(!Array.isArray(d.prices)||!d.prices.length)throw 0;const clean={version:d.version||1,source:d.source||f.name,method:d.method||'',prices:d.prices};localStorage.setItem(PRICE_STORAGE_KEY,JSON.stringify(clean));priceMap=new Map();for(const p of clean.prices)if(p?.t)priceMap.set(norm(p.t),p);if(stateCache){stateCache.priceSource=clean.source;stateCache.priceCount=clean.prices.length;delete stateCache.prices;try{localStorage.setItem('joshSetState',JSON.stringify(stateCache))}catch{}}resetBrowse();$('#syncmsg').textContent=`Prices: ${priceMap.size} verified CIB profiles loaded locally.`}catch(e){console.warn(e);$('#syncmsg').textContent='Invalid ShelfCheck price profile.'}}
function decoratePriceCards(){for(const card of document.querySelectorAll('#results article.card')){const title=card.querySelector('.top b')?.textContent;if(!title)continue;const x=items.find(g=>norm(g.title)===norm(title));if(!x)continue;const p=priceFor(x);if(!p)continue;const sub=card.querySelector('.sub');if(sub&&!sub.dataset.priced){sub.dataset.priced='1';sub.innerHTML+=` · <b>CIB ${money(p.m)}</b>`}}}
const _renderWithCollections=render;
render=function(){_renderWithCollections();decoratePriceCards()};
// Load/migrate prices immediately, and again after census state finishes loading.
loadLocalPrices();
const _loadState=loadState;
loadState=function(){_loadState();loadLocalPrices()};