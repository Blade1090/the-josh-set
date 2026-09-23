// ShelfCheck pricing campaign — Phase 3 batch 001 (5 verified identities).
// Sourced live from PriceCharting.com CIB values on 2026-09-22; each entry independently
// re-verified against the live PriceCharting product page before being committed here (not
// taken on a single agent's word). See audit-out/pricing-batch-001.md for full sourcing,
// confidence, and the curator-review items this batch also surfaced but did NOT price.
//
// Two of these five (Final Fantasy Crystal Chronicles: Remastered Edition, Travis Strikes
// Again: No More Heroes - Complete Edition) only ever received a genuine physical PS4 disc in
// Japan -- PriceCharting has no separate US/EU PlayStation 4 listing for either, and no boxed
// NA/EU copy could be found anywhere. Priced as the JP import SKU per the campaign's "price the
// correct physical product" rule; flagged in the batch report for curator confirmation that an
// import disc is an acceptable qualifying physical release for these two identities.
//
// Guarded exactly like price-negative-space-v042.js / price-direct-v050.js / price-direct-
// v051.js: only fills a title that has no price yet, and never overwrites an existing entry.
(()=>{
  const DIRECT=[
    ['Final Fantasy Crystal Chronicles: Remastered Edition',29.03,'Final Fantasy Crystal Chronicles: Remastered Edition','JP Playstation 4'],
    ['Travis Strikes Again: No More Heroes - Complete Edition',34.87,'Travis Strikes Again: No More Heroes Complete Edition','JP Playstation 4'],
    ['Warhammer: Vermintide 2',16.14,'Warhammer: Vermintide II [Deluxe Edition]','Playstation 4'],
    ['Unbound: Worlds Apart',21.84,'Unbound: Worlds Apart','PAL Playstation 4'],
    ['Vostok Inc',23.73,'Vostok Inc','PAL Playstation 4']
  ];
  let tries=0;
  const apply=()=>{
    tries++;
    if(typeof byId==='undefined'||typeof stateCache==='undefined'||!stateCache||typeof saveState!=='function'||typeof pcNormTitle!=='function'){if(tries<120)setTimeout(apply,100);return;}
    const map=new Map((stateCache.prices||[]).map(p=>[pcNormTitle(p.t),p]));let added=0;
    const titleMap=new Map();for(const x of byId.values())if(x&&x.title)titleMap.set(pcNormTitle(x.title),x);
    for(const [t,m,pc,c] of DIRECT){const x=titleMap.get(pcNormTitle(t));if(!x||x.set!=='INCLUDED')continue;const k=pcNormTitle(x.title);if(map.has(k))continue;map.set(k,{t:x.title,m,s:+(m*.70).toFixed(2),g:+(m*.85).toFixed(2),x:+(m*1.10).toFixed(2),pc,c,source:'PriceCharting verified — pricing campaign batch 001'});added++;}
    if(added){stateCache={...stateCache,version:17,prices:[...map.values()].sort((a,b)=>a.t.localeCompare(b.t)),priceSupplement:'2026-09-22-batch-001'};saveState(stateCache);if(typeof resetBrowse==='function')resetBrowse();}
    window.SHELFCHECK_PRICE_BATCH_001={verifiedIdentityPrices:DIRECT.length,added,total:(stateCache.prices||[]).length};
  };
  apply();
})();
