// ShelfCheck v0.61 — stable, compilation-aware progress display.
// Prevents the header from flashing the old denominator before late census layers finish.
(()=>{
  let timer=null;
  const renderStable=()=>{
    if(!DATA||!Array.isArray(items)||!byId)return;
    const satisfied=new Set();
    for(const id of ownedSet||[])if(byId.get(id)?.set==='INCLUDED')satisfied.add(+id);
    // A physical compilation/product on the shelf satisfies every included identity on its disc(s).
    for(const p of productMap?.values?.()||[]){
      if(!p?.key||!productSet?.has?.(p.key))continue;
      for(const id of p.ids||[])if(byId.get(id)?.set==='INCLUDED')satisfied.add(+id);
    }
    const denominator=items.filter(x=>x.set==='INCLUDED').length;
    DATA.n=denominator;
    const el=document.querySelector('#progress');
    if(el)el.textContent=`${satisfied.size} / ${denominator} · ${(satisfied.size/denominator*100).toFixed(2)}%`;
    window.SHELFCHECK_PROGRESS={satisfied:satisfied.size,denominator,percent:satisfied.size/denominator*100};
  };
  progress=()=>{
    clearTimeout(timer);
    timer=setTimeout(renderStable,350);
  };
})();
