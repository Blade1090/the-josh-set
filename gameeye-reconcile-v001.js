// ShelfCheck GameEye reconciliation-on-load v0.02.
//
// A GameEye import stores unresolved title text in stateCache.ownershipAudit. When ShelfCheck
// later learns a missing identity, alias, or product mapping, those old rows should repair
// themselves without making Josh upload the same CSV again. This pass retries the saved queue
// against the CURRENT finalized model on every load.
//
// ownership-reconcile-v073.js can also register a narrowly-scoped stale-title migration for a
// known historical bad GameEye selection. Fresh CSV imports do not use this title-only path;
// they use the metadata-qualified row correction in ownership-audit-v068.js instead.
(()=>{
  let tries=0;
  const ownershipCandidates=title=>{
    const base=candidates(title),out=[...base];
    for(const c of base){
      const alt=c.startsWith('the ')?c.slice(4):`the ${c}`;
      if(alt&&!out.includes(alt))out.push(alt);
    }
    return out;
  };
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

    for(const sourceTitle of unresolved){
      const staleCorrection=window.SHELFCHECK_GAMEEYE_STALE_TITLE_CORRECTIONS?.[norm(sourceTitle)]||null;
      const matchTitle=staleCorrection?.title||sourceTitle;
      const cs=ownershipCandidates(matchTitle);
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
        reconciled.push({gameEye:sourceTitle,matchInput:matchTitle,correction:staleCorrection?.reason||null,matched:p.title,identities:ids.map(id=>byId.get(id)?.title).filter(Boolean)});
        break;
      }
      if(!hit)for(const c of cs){
        const ids=items.filter(x=>x.set==='INCLUDED'&&(norm(x.title)===c||(aliasesById.get(x.id)||[]).includes(c))).map(x=>x.id);
        if(ids.length){owned.add(ids[0]);hit=true;reconciled.push({gameEye:sourceTitle,matchInput:matchTitle,correction:staleCorrection?.reason||null,matched:byId.get(ids[0])?.title,identities:[byId.get(ids[0])?.title]});break;}
      }
      if(!hit)stillUnresolved.push(sourceTitle);
    }

    if(!reconciled.length){
      const msgEl=typeof $==='function'?$('#syncmsg'):null;
      if(msgEl)msgEl.textContent=stillUnresolved.length
        ?`GameEye sync needs review: ${stillUnresolved.length} title${stillUnresolved.length===1?'':'s'} unresolved — ${stillUnresolved.join(' · ')}`
        :'';
      window.SHELFCHECK_GAMEEYE_RECONCILE_ON_LOAD={reconciled:[],stillUnresolved};
      return;
    }

    const prevAudit=stateCache?.ownershipAudit||{};
    const prevMatched=Number(prevAudit.matchedRows)||0;
    const matchedRows=prevMatched+reconciled.length;
    const netCompilationGain=owned.size-matchedRows;
    const ps4Rows=Number(prevAudit.ps4Rows),excluded=Number(prevAudit.excluded)||0;
    const rowAccountingOK=Number.isFinite(ps4Rows)?ps4Rows===matchedRows+excluded+stillUnresolved.length:prevAudit.rowAccountingOK;
    saveState({...stateCache,owned:[...owned],products:[...ownedProducts],ownershipAudit:{...prevAudit,matchedRows,unresolved:stillUnresolved.length,unresolvedTitles:stillUnresolved,satisfied:owned.size,netCompilationGain,rowAccountingOK}});
    if(typeof progress==='function')progress();
    if(typeof resetBrowse==='function')resetBrowse();
    const msgEl=typeof $==='function'?$('#syncmsg'):null;
    if(msgEl)msgEl.textContent=stillUnresolved.length
      ?`GameEye sync needs review: ${stillUnresolved.length} title${stillUnresolved.length===1?'':'s'} unresolved — ${stillUnresolved.join(' · ')}`
      :'';
    console.info('ShelfCheck GameEye reconciliation-on-load applied',reconciled,{stillUnresolved,matchedRows,netCompilationGain,rowAccountingOK});
    window.SHELFCHECK_GAMEEYE_RECONCILE_ON_LOAD={reconciled,stillUnresolved,matchedRows,netCompilationGain,rowAccountingOK};
  };
  apply();
})();
