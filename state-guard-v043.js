// ShelfCheck v0.45 — atomic state merge guard.
// Every save preserves whichever side already has collection/pricing data. This
// removes startup-order dependence instead of trying to repair state afterward.
(()=>{
  const KEY='joshSetState',rawSave=saveState,arr=x=>Array.isArray(x)?x:[];
  function disk(){try{return JSON.parse(localStorage.getItem(KEY))||{}}catch{return{}}}
  saveState=function(next){
    const old=disk(),n=next||{};
    const s={...old,...n};
    // Ownership/products: explicit non-empty data wins. Empty bootstrap arrays may
    // never erase a populated collection already persisted on the device.
    s.owned=arr(n.owned).length?arr(n.owned):arr(old.owned);
    s.products=arr(n.products).length?arr(n.products):arr(old.products);
    // Prices: keep the richer snapshot. Online/bootstrap/import paths can finish in
    // any order, but a stale/empty state can never shrink the active price table.
    const np=arr(n.prices),op=arr(old.prices);
    s.prices=np.length>=op.length?np:op;
    if(s.prices===op){
      for(const k of ['priceSource','priceImportedAt','priceBuiltinVersion','priceBuiltinDate','priceOnlineVersion','priceAudit','priceSupplement'])
        if(old[k]!=null)s[k]=old[k];
    }
    return rawSave(s);
  };
  window.SHELFCHECK_STATE_GUARD_V045=true;
})();