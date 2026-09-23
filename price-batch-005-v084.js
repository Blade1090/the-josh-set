// ShelfCheck pricing campaign — Phase 3 batch 005 (3 verified identities).
// Same "high-confidence price harvest" strategy and research limits as batches 003-004.
// Lower yield this batch (3 of 10) -- most candidates had an exact PriceCharting product
// page but zero price data, or turned out import-only/compilation-only. See
// audit-out/pricing-batch-005.md for the 7 skipped this batch.
//
// Guarded exactly like the prior batch files: only fills a title with no existing price,
// never overwrites.
(()=>{
  const DIRECT=[
    ['Exophobia',19.14,'Exophobia','Playstation 4'],
    ['Fahrenheit',19.98,'Fahrenheit','PAL Playstation 4'],
    ['Trailblazers',12.51,'Trailblazers','Playstation 4']
  ];
  let tries=0;
  const apply=()=>{
    tries++;
    if(typeof byId==='undefined'||typeof stateCache==='undefined'||!stateCache||typeof saveState!=='function'||typeof pcNormTitle!=='function'){if(tries<120)setTimeout(apply,100);return;}
    const map=new Map((stateCache.prices||[]).map(p=>[pcNormTitle(p.t),p]));let added=0;
    const titleMap=new Map();for(const x of byId.values())if(x&&x.title)titleMap.set(pcNormTitle(x.title),x);
    for(const [t,m,pc,c] of DIRECT){const x=titleMap.get(pcNormTitle(t));if(!x||x.set!=='INCLUDED')continue;const k=pcNormTitle(x.title);if(map.has(k))continue;map.set(k,{t:x.title,m,s:+(m*.70).toFixed(2),g:+(m*.85).toFixed(2),x:+(m*1.10).toFixed(2),pc,c,source:'PriceCharting verified — pricing campaign batch 005'});added++;}
    if(added){stateCache={...stateCache,version:20,prices:[...map.values()].sort((a,b)=>a.t.localeCompare(b.t)),priceSupplement:'2026-09-22-batch-005'};saveState(stateCache);if(typeof resetBrowse==='function')resetBrowse();}
    window.SHELFCHECK_PRICE_BATCH_005={verifiedIdentityPrices:DIRECT.length,added,total:(stateCache.prices||[]).length};
  };
  apply();
})();
