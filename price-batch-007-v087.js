// ShelfCheck pricing campaign — Phase 3 batch 007 (15 verified identities, EDITION_AMBIGUITY
// resolution pass). Source: audit-out/price-review-classify-report.json's EDITION_AMBIGUITY
// bucket (21 identities), each candidate SKU's live PriceCharting CIB price re-fetched directly
// from its already-known product URL on 2026-09-23. See the pricing-campaign chat report for
// full per-identity candidate lists, region, and same-playable-identity reasoning.
//
// Resolution rule applied: where 2+ physical editions of the SAME playable game are tracked and
// no separately-trackable plain/standard SKU exists with its own price, the cheapest qualifying
// edition is used (Apex Legends, GrimGrimoire OnceMore, Beyond A Steel Sky, Legend Of Heroes:
// Trails Beyond The Horizon, Terminator 2D No Fate). Where only one edition-labeled SKU is
// tracked at all, that SKU is the identity's sole qualifying physical release. Day
// One/SteelBook-Launch editions are treated as the base retail SKU, not a premium tier.
//
// Explicitly NOT included in this batch (left PRICE PENDING, no guessing):
// - Ravenswatch, Noob: Les Sans-Factions, PlateUp, Kamen Rider: Battride War Creation,
//   Raidou Remastered: Mystery Of The Soulless Army -- correct product identified in every case,
//   but zero CIB sales data exists on PriceCharting for any tracked edition.
// - Catlateral Damage -- pending a curator same-identity ruling on whether the "Remeowstered"
//   re-release satisfies the original (digital-only-at-launch) census identity.
//
// Guarded exactly like every prior batch file: only fills a title with no existing price, never
// overwrites -- if a price appeared for any of these from other work since verification, that
// existing value is preserved untouched.
(()=>{
  const DIRECT=[
    ['Apex Legends',8.14,'Apex Legends [Bloodhound Edition]','Playstation 4'],
    ['Pac-Man Championship Edition 2',11.31,'Pac-Man Championship Edition 2 + Arcade Game Series','Playstation 4'],
    ['Fury Unleashed',25.57,'Fury Unleashed [Bang Edition]','PAL Playstation 4'],
    ['Shadow of Loot Box',29.88,'Shadow of Loot Box [Limited Edition]','Playstation 4'],
    ['Wife Quest',43.27,'Wife Quest [Limited Edition]','Playstation 4'],
    ['Empire of Angels IV',42.00,'Empire of Angels IV [Limited Edition]','Playstation 4'],
    ['Hamidashi Creative',95.62,'Hamidashi Creative [Limited Edition]','JP Playstation 4'],
    ['GrimGrimoire OnceMore',65.00,'GrimGrimoire OnceMore [Deluxe Edition]','Playstation 4'],
    ['Mato Anomalies',14.01,'Mato Anomalies [Day One Edition]','PAL Playstation 4'],
    ['Anonymous;Code',40.06,'Anonymous;Code [SteelBook Launch Edition]','Playstation 4'],
    ['Beyond A Steel Sky',14.99,'Beyond a Steel Sky [Beyond a Steel Book Edition]','Playstation 4'],
    ['Legend Of Heroes: Trails Beyond The Horizon',52.79,'Legend Of Heroes: Trails Beyond The Horizon: Deluxe Edition','Playstation 4'],
    ['Q.U.B.E.',24.97,'Q.U.B.E. [10th Anniversary]','Playstation 4'],
    ['Raiden III x Mikado Maniax',28.95,'Raiden III x Mikado Maniax: Deluxe Edition','Playstation 4'],
    ['Terminator 2D No Fate',54.77,'Terminator 2D: NO FATE [Day One Edition]','Playstation 4']
  ];
  let tries=0;
  const apply=()=>{
    tries++;
    if(typeof byId==='undefined'||typeof stateCache==='undefined'||!stateCache||typeof saveState!=='function'||typeof pcNormTitle!=='function'){if(tries<120)setTimeout(apply,100);return;}
    const map=new Map((stateCache.prices||[]).map(p=>[pcNormTitle(p.t),p]));let added=0;
    const titleMap=new Map();for(const x of byId.values())if(x&&x.title)titleMap.set(pcNormTitle(x.title),x);
    for(const [t,m,pc,c] of DIRECT){const x=titleMap.get(pcNormTitle(t));if(!x||x.set!=='INCLUDED')continue;const k=pcNormTitle(x.title);if(map.has(k))continue;map.set(k,{t:x.title,m,s:+(m*.70).toFixed(2),g:+(m*.85).toFixed(2),x:+(m*1.10).toFixed(2),pc,c,source:'PriceCharting verified — pricing campaign batch 007 (edition ambiguity)'});added++;}
    if(added){stateCache={...stateCache,version:18,prices:[...map.values()].sort((a,b)=>a.t.localeCompare(b.t)),priceSupplement:'2026-09-23-batch-007'};saveState(stateCache);if(typeof resetBrowse==='function')resetBrowse();}
    window.SHELFCHECK_PRICE_BATCH_007={verifiedIdentityPrices:DIRECT.length,added,total:(stateCache.prices||[]).length};
  };
  apply();
})();
