// ShelfCheck v0.42 — negative-space pricing pass.
// Adds verified PriceCharting profiles that exist publicly but were absent from the
// Collector export. These are identity-safe matches only; compilation prices stay
// product-level and are never copied onto component-game identities.
(()=>{
  const EXTRA=[
    {id:758,m:28.99,pc:'Mega Man Zero/ZX Legacy Collection',c:'Playstation 4'},
    {id:2051,m:40.00,pc:'Metaphor Refantazio',c:'Asian English Playstation 4'},
    {id:525,m:7.19,pc:'Geometry Wars 3: Dimensions Evolved',c:'Playstation 4'},
    {id:1660,m:38.63,pc:'LocoRoco 2',c:'Asian English Playstation 4'}
  ];
  let tries=0;
  const apply=()=>{
    tries++;
    if(typeof byId==='undefined'||typeof stateCache==='undefined'||!stateCache||typeof saveState!=='function'){if(tries<120)setTimeout(apply,100);return;}
    const map=new Map((stateCache.prices||[]).map(p=>[pcNormTitle(p.t),p]));let added=0;
    for(const e of EXTRA){const x=byId.get(e.id);if(!x||x.set!=='INCLUDED')continue;const k=pcNormTitle(x.title);if(map.has(k))continue;const m=e.m;map.set(k,{t:x.title,m,s:+(m*.70).toFixed(2),g:+(m*.85).toFixed(2),x:+(m*1.10).toFixed(2),pc:e.pc,c:e.c,source:'PriceCharting negative-space audit'});added++;}
    if(added){stateCache={...stateCache,version:12,prices:[...map.values()].sort((a,b)=>a.t.localeCompare(b.t)),priceSupplement:'2026-08-28-v042'};saveState(stateCache);if(typeof resetBrowse==='function')resetBrowse();}
    window.SHELFCHECK_PC_V042={verifiedExtras:EXTRA.length,added,total:(stateCache.prices||[]).length,productOnly:['Ninja Gaiden Master Collection']};
  };
  apply();
})();
