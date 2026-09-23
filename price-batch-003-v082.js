// ShelfCheck pricing campaign — Phase 3 batch 003 (6 verified identities).
// First batch under the "high-confidence price harvest" strategy: candidates were
// preselected for being plain standalone retail releases without compilation/edition/
// import ambiguity, then verified live against PriceCharting.com on 2026-09-22.
// See audit-out/pricing-batch-003.md for the 4 candidates that were checked and skipped
// this batch (import-only or no PS4 release found) rather than priced.
//
// Guarded exactly like price-negative-space-v042.js / price-direct-v050/051.js /
// price-batch-001-v079.js: only fills a title that has no price yet, never overwrites.
(()=>{
  const DIRECT=[
    ['Prince of Persia: The Lost Crown',20.07,'Prince Of Persia: The Lost Crown','Playstation 4'],
    ['Tony Hawk\'s Pro Skater 3 + 4',24.80,'Tony Hawk\'s Pro Skater 3 + 4','Playstation 4'],
    ['Tails of Iron',15.99,'Tails of Iron [Crimson Knight Edition]','Playstation 4'],
    ['Bomb Rush Cyberfunk',29.72,'Bomb Rush Cyberfunk','Playstation 4'],
    ['DC\'s Justice League: Cosmic Chaos',7.45,'DC\'s Justice League Cosmic Chaos','Playstation 4'],
    ['PAW Patrol Rescue Wheels: Championship',14.55,'PAW Patrol Rescue Wheels: Championship','PAL Playstation 4']
  ];
  let tries=0;
  const apply=()=>{
    tries++;
    if(typeof byId==='undefined'||typeof stateCache==='undefined'||!stateCache||typeof saveState!=='function'||typeof pcNormTitle!=='function'){if(tries<120)setTimeout(apply,100);return;}
    const map=new Map((stateCache.prices||[]).map(p=>[pcNormTitle(p.t),p]));let added=0;
    const titleMap=new Map();for(const x of byId.values())if(x&&x.title)titleMap.set(pcNormTitle(x.title),x);
    for(const [t,m,pc,c] of DIRECT){const x=titleMap.get(pcNormTitle(t));if(!x||x.set!=='INCLUDED')continue;const k=pcNormTitle(x.title);if(map.has(k))continue;map.set(k,{t:x.title,m,s:+(m*.70).toFixed(2),g:+(m*.85).toFixed(2),x:+(m*1.10).toFixed(2),pc,c,source:'PriceCharting verified — pricing campaign batch 003'});added++;}
    if(added){stateCache={...stateCache,version:18,prices:[...map.values()].sort((a,b)=>a.t.localeCompare(b.t)),priceSupplement:'2026-09-22-batch-003'};saveState(stateCache);if(typeof resetBrowse==='function')resetBrowse();}
    window.SHELFCHECK_PRICE_BATCH_003={verifiedIdentityPrices:DIRECT.length,added,total:(stateCache.prices||[]).length};
  };
  apply();
})();
