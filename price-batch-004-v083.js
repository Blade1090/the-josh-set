// ShelfCheck pricing campaign — Phase 3 batch 004 (9 verified identities).
// Same "high-confidence price harvest" strategy and research limits as batch 003. See
// audit-out/pricing-batch-004.md for the 2 candidates checked and skipped this batch
// (no price data / genuine edition ambiguity) rather than priced.
//
// Guarded exactly like the prior batch files: only fills a title with no existing price,
// never overwrites.
(()=>{
  const DIRECT=[
    ['Bus Simulator',22.98,'Bus Simulator','PAL Playstation 4'],
    ['Bus Simulator 21',24.10,'Bus Simulator 21','PAL Playstation 4'],
    ['Brunswick Pro Bowling',29.95,'Brunswick Pro Bowling','Playstation 4'],
    ['Taxi Chaos',13.29,'Taxi Chaos','Playstation 4'],
    ['Ginger Beyond the Crystal',20.29,'Ginger Beyond the Crystal','PAL Playstation 4'],
    ['Dreamfall Chapters',11.31,'Dreamfall Chapters','PAL Playstation 4'],
    ['Broken Sword 5 The Serpent\'s Curse',13.80,'Broken Sword 5 The Serpent\'s Curse','PAL Playstation 4'],
    ['UglyDolls: An Imperfect Adventure',6.77,'Ugly Dolls: An Imperfect Adventure','PAL Playstation 4'],
    ['Tannenberg',12.49,'WWI Tannenberg Eastern Front','Playstation 4']
  ];
  let tries=0;
  const apply=()=>{
    tries++;
    if(typeof byId==='undefined'||typeof stateCache==='undefined'||!stateCache||typeof saveState!=='function'||typeof pcNormTitle!=='function'){if(tries<120)setTimeout(apply,100);return;}
    const map=new Map((stateCache.prices||[]).map(p=>[pcNormTitle(p.t),p]));let added=0;
    const titleMap=new Map();for(const x of byId.values())if(x&&x.title)titleMap.set(pcNormTitle(x.title),x);
    for(const [t,m,pc,c] of DIRECT){const x=titleMap.get(pcNormTitle(t));if(!x||x.set!=='INCLUDED')continue;const k=pcNormTitle(x.title);if(map.has(k))continue;map.set(k,{t:x.title,m,s:+(m*.70).toFixed(2),g:+(m*.85).toFixed(2),x:+(m*1.10).toFixed(2),pc,c,source:'PriceCharting verified — pricing campaign batch 004'});added++;}
    if(added){stateCache={...stateCache,version:19,prices:[...map.values()].sort((a,b)=>a.t.localeCompare(b.t)),priceSupplement:'2026-09-22-batch-004'};saveState(stateCache);if(typeof resetBrowse==='function')resetBrowse();}
    window.SHELFCHECK_PRICE_BATCH_004={verifiedIdentityPrices:DIRECT.length,added,total:(stateCache.prices||[]).length};
  };
  apply();
})();
