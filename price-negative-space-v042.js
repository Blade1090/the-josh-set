// ShelfCheck v0.47 — verified negative-space pricing supplement.
// PriceCharting CIB profiles absent from Collector export. Identity-safe only;
// compilation/product prices are never copied onto component identities.
(()=>{
  const EXTRA=[
    {id:758,m:28.99,pc:'Mega Man Zero/ZX Legacy Collection',c:'Playstation 4'},
    {id:2051,m:40.00,pc:'Metaphor Refantazio',c:'Asian English Playstation 4'},
    {id:525,m:7.19,pc:'Geometry Wars 3: Dimensions Evolved',c:'Playstation 4'},
    {id:1660,m:38.63,pc:'LocoRoco 2',c:'Asian English Playstation 4'},
    {id:2239,m:35.74,pc:'Breakers Collection',c:'PAL Playstation 4'},
    {id:2240,m:25.00,pc:'Zero Tolerance Collection',c:'Playstation 4'},
    {id:2242,m:25.57,pc:'JaJaMaru Legendary Ninja Collection',c:'PAL Playstation 4'},
    {id:2243,m:26.65,pc:'Irem Collection Volume 1',c:'PAL Playstation 4'},
    {id:2244,m:22.00,pc:'Puzzle Bobble 3D Vacation Odyssey',c:'Playstation 4'},
    {id:2245,m:51.23,pc:'Eschatos',c:'PAL Playstation 4'},
    {id:2247,m:23.13,pc:'Warhammer 40,000: Shootas, Blood & Teef',c:'Playstation 4'},
    {id:2248,m:52.50,pc:'Cotton Guardian Force: Saturn Tribute',c:'PAL Playstation 4'},
    {id:2249,m:20.68,pc:'Shadow Of The Ninja Reborn',c:'PAL Playstation 4'},
    {id:2250,m:19.99,pc:'Cotton Fantasy',c:'Playstation 4'},
    {id:2251,m:15.27,pc:'Star Renegades',c:'Playstation 4'},
    {id:2252,m:13.42,pc:'Umihara Kawase Bazooka',c:'Playstation 4'},
    {id:2253,m:35.00,pc:'Clockwork Aquario',c:'Playstation 4'},
    {id:2254,m:28.96,pc:'Bubble Bobble 4 Friends: The Baron is Back',c:'Playstation 4'},
    {id:2255,m:45.82,pc:'Wonder Boy Anniversary Collection',c:'PAL Playstation 4'},
    {id:2258,m:24.26,pc:'Spelunker HD Deluxe',c:'PAL Playstation 4'},
    {id:2259,m:51.04,pc:'DeathSmiles I & II',c:'Playstation 4'},
    {id:2260,m:18.95,pc:'Asterix & Obelix Slap Them All',c:'PAL Playstation 4'},
    {id:2261,m:19.99,pc:'Cotton Reboot',c:'Playstation 4'},
    {id:2262,m:23.94,pc:'Turrican Anthology Vol. 1',c:'PAL Playstation 4'},
    {id:2263,m:27.12,pc:'Turrican Anthology Vol. 2',c:'PAL Playstation 4'}
  ];
  let tries=0;
  const apply=()=>{
    tries++;
    if(typeof byId==='undefined'||typeof stateCache==='undefined'||!stateCache||typeof saveState!=='function'||typeof pcNormTitle!=='function'){if(tries<120)setTimeout(apply,100);return;}
    const map=new Map((stateCache.prices||[]).map(p=>[pcNormTitle(p.t),p]));let added=0;
    for(const e of EXTRA){const x=byId.get(e.id);if(!x||x.set!=='INCLUDED')continue;const k=pcNormTitle(x.title);if(map.has(k))continue;const m=e.m;map.set(k,{t:x.title,m,s:+(m*.70).toFixed(2),g:+(m*.85).toFixed(2),x:+(m*1.10).toFixed(2),pc:e.pc,c:e.c,source:'PriceCharting negative-space audit'});added++;}
    if(added){stateCache={...stateCache,version:12,prices:[...map.values()].sort((a,b)=>a.t.localeCompare(b.t)),priceSupplement:'2026-08-28-v047'};saveState(stateCache);if(typeof resetBrowse==='function')resetBrowse();}
    window.SHELFCHECK_PC_V047={verifiedExtras:EXTRA.length,added,total:(stateCache.prices||[]).length,productOnly:['Ninja Gaiden Master Collection'],noReliablePriceYet:['Steel Empire Chronicles']};
  };
  apply();
})();