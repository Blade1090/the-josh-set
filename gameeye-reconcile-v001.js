// ShelfCheck GameEye reconciliation-on-load v0.01.
//
// Bug: PR #64 fixed the missing "Shenmue I & II" product mapping, and the deterministic census
// test proved the product now exists and a FRESH CSV import resolves it correctly. But Josh's
// real browser still showed Shenmue I/II as NEEDED after that fix shipped. Root cause: his
// GameEye row for "Shenmue I & II" was imported BEFORE the product mapping existed, so it went
// UNRESOLVED at that time -- and importCSV (ownership-audit-v068.js) persists that outcome into
// stateCache.ownershipAudit.unresolvedTitles, but NOTHING ever reads that list back. A later
// page load re-runs the CENSUS mutators (so DATA.p/items pick up the new product immediately),
// but it does NOT re-run the user's own already-saved GameEye import -- ownedSet/productSet
// stay exactly as stale as they were at the moment of the original failed import. The user
// would have to manually re-upload the exact same CSV file to ever get credit for a title that
// ShelfCheck itself later became able to resolve, with no indication that doing so would help.
//
// This is a general lifecycle gap, not specific to Shenmue or any other title: it will recur
// every time a future product/identity addition retroactively resolves a previously-unresolved
// row. Fixed generally, once, here: on every page load, once the census has finalized, retry
// every title in stateCache.ownershipAudit.unresolvedTitles (if any) against the CURRENT
// product/identity data, using the exact same matching primitives importCSV itself uses
// (candidates() + ensureMergedProducts()/productKeys(), falling back to direct identity/alias
// lookup) -- not a reimplementation, and no title-specific logic anywhere in this file.
(()=>{
  let tries=0;
  const apply=()=>{
    tries++;
    if(typeof censusFinalized==='undefined'||!censusFinalized||typeof ensureMergedProducts!=='function'||typeof candidates!=='function'){
      if(tries<120)setTimeout(apply,100);
      return;
    }
    const unresolved=stateCache?.ownershipAudit?.unresolvedTitles;
    if(!Array.isArray(unresolved)||!unresolved.length)return;

    const idx=ensureMergedProducts();
    const owned=new Set(ownedSet),ownedProducts=new Set(productSet);
    const stillUnresolved=[],reconciled=[];

    for(const title of unresolved){
      const cs=candidates(title);
      let hit=false;
      for(const c of cs){
        let p=null;
        if(idx&&typeof productKeys==='function')for(const k of productKeys(c,c)){p=idx.get(k);if(p)break;}
        if(!p)p=productMap.get(c)||productMap.get(c.startsWith('the ')?c.slice(4):'the '+c);
        if(!p)continue;
        const ids=[...new Set(p.ids||[])].filter(id=>byId.get(id)?.set==='INCLUDED');
        if(!ids.length)continue;
        ids.forEach(id=>owned.add(id));
        ownedProducts.add(p.key);
        hit=true;
        reconciled.push({gameEye:title,matched:p.title,identities:ids.map(id=>byId.get(id)?.title).filter(Boolean)});
        break;
      }
      if(!hit)for(const c of cs){
        const ids=items.filter(x=>x.set==='INCLUDED'&&(norm(x.title)===c||(aliasesById.get(x.id)||[]).includes(c))).map(x=>x.id);
        if(ids.length){owned.add(ids[0]);hit=true;reconciled.push({gameEye:title,matched:byId.get(ids[0])?.title,identities:[byId.get(ids[0])?.title]});break;}
      }
      if(!hit)stillUnresolved.push(title);
    }

    if(!reconciled.length)return;

    saveState({...stateCache,owned:[...owned],products:[...ownedProducts],ownershipAudit:{...stateCache.ownershipAudit,unresolved:stillUnresolved.length,unresolvedTitles:stillUnresolved,satisfied:owned.size}});
    if(typeof progress==='function')progress();
    if(typeof resetBrowse==='function')resetBrowse();
    const msgEl=typeof $==='function'?$('#syncmsg'):null;
    if(msgEl)msgEl.textContent=`ShelfCheck: reconciled ${reconciled.length} previously unresolved GameEye title(s) against updated data -- ${reconciled.map(r=>r.gameEye).join(' · ')}.`;
    console.info('ShelfCheck GameEye reconciliation-on-load applied',reconciled);
    window.SHELFCHECK_GAMEEYE_RECONCILE_ON_LOAD={reconciled,stillUnresolved};
  };
  apply();
})();
