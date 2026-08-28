// ShelfCheck v0.46 — negative-space pricing pass.
// Verified PriceCharting profiles absent from the Collector export. Identity-safe
// only: compilation/product prices are never copied onto component identities.
(()=>{
  const EXTRA=[
    {id:758,m:28.99,pc:'Mega Man Zero/ZX Legacy Collection',c:'Playstation 4'},
    {id:2051,m:40.00,pc:'Metaphor Refantazio',c:'Asian English Playstation 4'},
    {id:525,m:7.19,pc:'Geometry Wars 3: Dimensions Evolved',c:'Playstation 4'},
    {id:1660,m:38.63,pc:'LocoRoco 2',c:'Asian English Playstation 4'},
    {id:2240,m:25.00,pc:'Zero Tolerance Collection',c:'Playstation 4'},
    {id:2243,m:26.65,pc:'Irem Collection Volume 1',c:'PAL Playstation 4'},
    {id:2244,m:22.00,pc:'Puzzle Bobble 3D Vacation Odyssey',c:'Playstation 4'},
    {id:2248,m:52.50,pc:'Cotton Guardian Force: Saturn Tribute',c:'PAL Playstation 4'},
    {id:2249,m:20.68,pc:'Shadow Of The Ninja Reborn',c:'PAL Playstation 4'},
    {id:2255,m:45.82,pc:'Wonder Boy Anniversary Collection',c:'PAL Playstation 4'},
    {id:2258,m:24.26,pc:'Spelunker HD Deluxe',c:'PAL Playstation 4'},
    {id:2259,m:51.04,pc:'DeathSmiles I & II',c:'Playstation 4'}
  ];
  let tries=0;
  const apply=()=>{
    tries++;
    if(typeof byId==='undefined'||typeof stateCache==='undefined'||!stateCache||typeof saveState!=='function'||typeof pcNormTitle!=='function'){if(tries<120)setTimeout(apply,100);return;}
    const map=new Map((stateCache.prices||[]).map(p=>[pcNormTitle(p.t),p]));let added=0;
    for(const e of EXTRA){const x=byId.get(e.id);if(!x||x.set!=='INCLUDED')continue;const k=pcNormTitle(x.title);if(map.has(k))continue;const m=e.m;map.set(k,{t:x.title,m,s:+(m*.70).toFixed(2),g:+(m*.85).toFixed(2),x:+(m*1.10).toFixed(2),pc:e.pc,c:e.c,source:'PriceCharting negative-space audit'});added++;}
    if(added){stateCache={...stateCache,version:12,prices:[...map.values()].sort((a,b)=>a.t.localeCompare(b.t)),priceSupplement:'2026-08-28-v046'};saveState(stateCache);if(typeof resetBrowse==='function')resetBrowse();}
    window.SHELFCHECK_PC_V046={verifiedExtras:EXTRA.length,added,total:(stateCache.prices||[]).length,productOnly:['Ninja Gaiden Master Collection'],noReliablePriceYet:['Breakers Collection','Ninja JaJaMaru Legendary Ninja Collection','Warhammer 40,000: Shootas, Blood & Teef']};
  };
  apply();
})();