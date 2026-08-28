// ShelfCheck v0.43 — persistence guard.
// Shared pricing boots asynchronously and can finish before census loadState().
// Never allow a pricing-only save to erase persisted GameEye ownership/products.
(()=>{
  const rawSave=saveState;
  function persisted(){try{return JSON.parse(localStorage.getItem('joshSetState'))||{}}catch{return{}}}
  saveState=function(next){
    const old=persisted();
    const s={...(old||{}),...(next||{})};
    // Pricing/bootstrap callers may run before stateCache exists. In that case
    // preserve the collection arrays already on disk instead of replacing them.
    if(!Array.isArray(next?.owned)&&Array.isArray(old.owned))s.owned=old.owned;
    if(!Array.isArray(next?.products)&&Array.isArray(old.products))s.products=old.products;
    if(!Array.isArray(next?.prices)&&Array.isArray(old.prices))s.prices=old.prices;
    return rawSave(s);
  };
  window.SHELFCHECK_STATE_GUARD_V043=true;
})();
