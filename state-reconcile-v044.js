// ShelfCheck v0.44 — post-bootstrap state reconciler.
// Ownership and shared pricing are independent datasets. Startup helpers may finish
// in either order, so reconcile both after bootstrap instead of letting one win.
(()=>{
  const KEY='joshSetState';
  const arr=x=>Array.isArray(x)?x:[];
  const uniq=(a,b)=>[...new Set([...arr(a),...arr(b)])];
  function reconcile(){
    let disk={};try{disk=JSON.parse(localStorage.getItem(KEY))||{}}catch{}
    const mem=(typeof stateCache==='object'&&stateCache)||{};
    const owned=uniq(disk.owned,mem.owned);
    const products=uniq(disk.products,mem.products);
    // Price snapshots are replacements, not additive identity IDs. Keep whichever
    // side has the richer completed snapshot; negative-space patches run afterward.
    const dp=arr(disk.prices),mp=arr(mem.prices),prices=dp.length>=mp.length?dp:mp;
    const merged={...disk,...mem,owned,products,prices};
    if(dp.length>mp.length){
      for(const k of ['priceSource','priceImportedAt','priceBuiltinVersion','priceBuiltinDate','priceAudit'])
        if(disk[k]!=null)merged[k]=disk[k];
    }
    saveState(merged);
    if(typeof progress==='function')progress();
    if(typeof resetBrowse==='function')resetBrowse();
    window.SHELFCHECK_STATE_RECONCILED_V044=true;
  }
  setTimeout(reconcile,750);
  window.addEventListener('pageshow',()=>setTimeout(reconcile,150));
})();
