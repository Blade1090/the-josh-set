// ShelfCheck v0.64 — make the shipped/shared PriceCharting snapshot visible on fresh browsers.
// Ownership remains device-local. This only bridges the already-public audited price data
// from joshSetState into the active priceMap used by cards/details/sorting.
(()=>{
  let tries=0,last=0;
  const apply=()=>{
    tries++;
    if(typeof stateCache==='undefined'||typeof priceMap==='undefined'||typeof norm!=='function'){
      if(tries<160)setTimeout(apply,100);return;
    }
    const shipped=Array.isArray(stateCache?.prices)?stateCache.prices:[];
    if(shipped.length && shipped.length!==last){
      last=shipped.length;
      // Preserve a richer explicitly imported local profile if one exists, otherwise
      // expose the shipped public snapshot. Merge by normalized identity title.
      const merged=new Map();
      for(const p of shipped)if(p?.t)merged.set(norm(p.t),p);
      if(priceMap instanceof Map)for(const [k,p] of priceMap)if(p?.t)merged.set(k,p);
      priceMap=merged;
      if(typeof resetBrowse==='function')resetBrowse();
      window.SHELFCHECK_PUBLIC_PRICES={count:priceMap.size,shipped:shipped.length};
    }
    // Pricing layers apply asynchronously during startup; watch long enough to catch
    // the online snapshot plus direct-recovery supplements.
    if(tries<160)setTimeout(apply,100);
  };
  apply();
})();
