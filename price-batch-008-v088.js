// ShelfCheck pricing campaign — Phase 3 batch 008 (1 verified identity, CONFIRMED_PHYSICAL
// salvage from the physical-legitimacy adjudication).
//
// World of Horror (id 1546): confirmed genuine physical PS4 release via Fangamer (Oct 19,
// 2023, PS4 & Switch). Exact-title match on PriceCharting is the only PS4 product page found
// anywhere (the plain US slug has no page at all) -- PriceCharting files it under its "JP"
// platform category; this could not be independently confirmed as a genuine separate JP SKU
// vs. a PriceCharting categorization quirk, but since it is the ONLY PS4 listing found for
// this title in any region, it is treated as the qualifying physical product.
//
// Guarded exactly like every prior batch file: only fills a title with no existing price,
// never overwrites -- if a price appeared for this title from other work since verification,
// that existing value is preserved untouched.
(()=>{
  const DIRECT=[
    ['World of Horror',38.10,'World of Horror','JP Playstation 4']
  ];
  let tries=0;
  const apply=()=>{
    tries++;
    if(typeof byId==='undefined'||typeof stateCache==='undefined'||!stateCache||typeof saveState!=='function'||typeof pcNormTitle!=='function'){if(tries<120)setTimeout(apply,100);return;}
    const map=new Map((stateCache.prices||[]).map(p=>[pcNormTitle(p.t),p]));let added=0;
    const titleMap=new Map();for(const x of byId.values())if(x&&x.title)titleMap.set(pcNormTitle(x.title),x);
    for(const [t,m,pc,c] of DIRECT){const x=titleMap.get(pcNormTitle(t));if(!x||x.set!=='INCLUDED')continue;const k=pcNormTitle(x.title);if(map.has(k))continue;map.set(k,{t:x.title,m,s:+(m*.70).toFixed(2),g:+(m*.85).toFixed(2),x:+(m*1.10).toFixed(2),pc,c,source:'PriceCharting verified — pricing campaign batch 008'});added++;}
    if(added){stateCache={...stateCache,version:19,prices:[...map.values()].sort((a,b)=>a.t.localeCompare(b.t)),priceSupplement:'2026-09-23-batch-008'};saveState(stateCache);if(typeof resetBrowse==='function')resetBrowse();}
    window.SHELFCHECK_PRICE_BATCH_008={verifiedIdentityPrices:DIRECT.length,added,total:(stateCache.prices||[]).length};
  };
  apply();
})();
