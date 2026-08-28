// ShelfCheck v0.44.1 — post-bootstrap state reconciler.
// Ownership and pricing are independent datasets. Never let a late stale in-memory
// state replace a richer price snapshot that has already been saved to localStorage.
(()=>{
  const KEY='joshSetState';
  const arr=x=>Array.isArray(x)?x:[];
  const uniq=(a,b)=>[...new Set([...arr(a),...arr(b)])];
  function reconcile(){
    let disk={};try{disk=JSON.parse(localStorage.getItem(KEY))||{}}catch{}
    const mem=(typeof stateCache==='object'&&stateCache)||{};
    const owned=uniq(disk.owned,mem.owned);
    const products=uniq(disk.products,mem.products);
    const dp=arr(disk.prices),mp=arr(mem.prices);
    // The online loader can save prices to disk before stateCache is refreshed.
    // In a tie prefer disk as well: it is the latest persisted source of truth.
    const useDisk=dp.length>=mp.length;
    const prices=useDisk?dp:mp;
    const merged={...mem,...disk,owned,products,prices};
    const source=useDisk?disk:mem;
    for(const k of ['priceSource','priceImportedAt','priceBuiltinVersion','priceBuiltinDate','priceOnlineVersion','priceAudit','priceSupplement'])
      if(source[k]!=null)merged[k]=source[k];
    saveState(merged);
    if(typeof progress==='function')progress();
    if(typeof resetBrowse==='function')resetBrowse();
    window.SHELFCHECK_STATE_RECONCILED_V0441={owned:owned.length,products:products.length,prices:prices.length,source:useDisk?'disk':'memory'};
  }
  // Run only after async online pricing has had time to install. pageshow's early
  // reconciliation caused the visible price flash/disappearance on refresh.
  setTimeout(reconcile,1800);
})();