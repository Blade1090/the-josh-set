// Physical PS4 Risk of Rain 2 includes both games (Gearbox retail release, Nov 2019).
// https://pressreleases.triplepointpr.com/2019/11/15/risk-of-rain-2-physical-edition-now-storming-retailers-across-north-america-and-europe/
// Keep both existing identities and the standalone original product. Do not change census size.
(()=>{
  registerCensusMutation('exclude',()=>{
    const title='Risk of Rain 2',key=norm(title);
    const exact=t=>items.filter(x=>x.set==='INCLUDED'&&norm(x.title)===norm(t));
    const first=exact('Risk of Rain'),second=exact(title);
    if(first.length!==1||second.length!==1)return;
    const a=first[0],b=second[0],ids=[b.id,a.id];
    const rows=DATA.p.filter(r=>norm(r[0])===key||norm(r[1])===key);
    // Fail closed if the existing product refers to an unexpected identity.
    if(rows.some(r=>(r[2]||[]).some(id=>!ids.includes(id))))return;
    if(rows.length)for(const r of rows)r[2]=[...ids];
    else DATA.p.push([title,title,ids]);
    const product={key,title,ids};
    productMap.set(key,product);
    for(const r of rows)productMap.set(norm(r[0]),product);
    for(const id of ids)reverseProducts.set(id,[...new Set([...(reverseProducts.get(id)||[]),title])]);
    mergedProductIndex=null;
    // Existing local physical collection imports may already have matched the sequel
    // as an identity only. Backfill the newly recognized coverage, idempotently.
    if(!stateCache||!ownedSet.has(b.id))return;
    const owned=new Set(ownedSet),products=new Set(productSet);
    const missing=!owned.has(a.id),missingProduct=!products.has(key);
    if(!missing&&!missingProduct)return;
    owned.add(a.id);products.add(key);
    const audit=stateCache.ownershipAudit;
    const next={...stateCache,owned:[...owned],products:[...products]};
    if(audit){
      next.ownershipAudit={...audit,satisfied:owned.size};
      if(Number.isFinite(audit.matchedRows))next.ownershipAudit.netCompilationGain=owned.size-audit.matchedRows;
    }
    saveState(next);
  });
})();
