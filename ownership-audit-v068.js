// ShelfCheck v0.70 — exact, auditable GameEye ownership reconciliation.
// Every satisfied identity is traceable to one GameEye row. Product matching uses the
// same merged-product model as ShelfCheck. Full accounting remains available in the console
// and window.SHELFCHECK_OWNERSHIP_AUDIT; the normal UI only surfaces actionable problems.
(()=>{
  if(typeof importCSV!=='function')return;

  // GameEye occasionally omits a leading "The" that ShelfCheck keeps in its canonical title
  // (and vice versa). Keep the exact candidates first, then add article-toggled fallbacks so an
  // exact title/product always wins before this compatibility path is considered.
  const ownershipCandidates=title=>{
    const base=candidates(title),out=[...base];
    for(const c of base){
      const alt=c.startsWith('the ')?c.slice(4):`the ${c}`;
      if(alt&&!out.includes(alt))out.push(alt);
    }
    return out;
  };

  importCSV=async function(f){
    const rows=parseCSV(await f.text()),h=rows.shift()||[],ix=Object.fromEntries(h.map((x,i)=>[x,i]));
    const owned=new Set(),excludedOwned=new Set(),ownedProducts=new Set(),ledger=[],unmatched=[];
    const idx=typeof ensureMergedProducts==='function'?ensureMergedProducts():null;
    let titles=0,excluded=0;

    for(const r of rows){
      const platform=(r[ix.Platform]||'').trim().toLowerCase(),cat=(r[ix.Category]||'').trim().toLowerCase(),typ=(r[ix.UserRecordType]||'Owned').trim().toLowerCase();
      if(!['sony playstation 4','playstation 4','ps4'].includes(platform)||cat!=='games'||typ!=='owned')continue;
      titles++;
      const sourceTitle=r[ix.Title]||'';
      const correction=typeof window.SHELFCHECK_GAMEEYE_ROW_CORRECTION==='function'
        ? window.SHELFCHECK_GAMEEYE_ROW_CORRECTION(sourceTitle,r,ix)
        : {title:sourceTitle,reason:null};
      const title=correction?.title||sourceTitle,correctionReason=correction?.reason||null,cs=ownershipCandidates(title);
      let hit=false;
      for(const c of cs){
        let p=null;
        if(idx&&typeof productKeys==='function')for(const k of productKeys(c,c)){p=idx.get(k);if(p)break;}
        if(!p)p=productMap.get(c)||productMap.get(c.startsWith('the ')?c.slice(4):'the '+c);
        if(!p)continue;
        const ids=[...new Set(p.ids||[])].filter(id=>byId.get(id)?.set==='INCLUDED');
        if(!ids.length)continue;
        const before=owned.size;ids.forEach(id=>owned.add(id));const addedUnique=owned.size-before;
        ownedProducts.add(p.key);hit=true;
        ledger.push({gameEye:sourceTitle,matchInput:title,correction:correctionReason,matchType:ids.length>1?'MULTI_IDENTITY_PRODUCT':'PRODUCT',matched:p.title,ids,identities:ids.map(id=>byId.get(id)?.title).filter(Boolean),coverageCount:ids.length,grossBonus:Math.max(0,ids.length-1),addedUnique,overlap:ids.length-addedUnique});break;
      }
      if(!hit)for(const c of cs){
        const ids=items.filter(x=>x.set==='INCLUDED'&&(norm(x.title)===c||(aliasesById.get(x.id)||[]).includes(c))).map(x=>x.id);
        if(ids.length){const before=owned.size;owned.add(ids[0]);const addedUnique=owned.size-before;hit=true;ledger.push({gameEye:sourceTitle,matchInput:title,correction:correctionReason,matchType:'IDENTITY',matched:byId.get(ids[0])?.title,ids:[ids[0]],identities:[byId.get(ids[0])?.title],coverageCount:1,grossBonus:0,addedUnique,overlap:1-addedUnique});break;}
      }
      if(!hit){const ex=cs.map(c=>items.find(x=>x.set==='EXCLUDED'&&(norm(x.title)===c||(aliasesById.get(x.id)||[]).includes(c)))).filter(Boolean)[0];if(ex){excludedOwned.add(ex.id);excluded++;hit=true;ledger.push({gameEye:sourceTitle,matchInput:title,correction:correctionReason,matchType:'EXCLUDED',matched:ex.title,ids:[ex.id],identities:[ex.title],coverageCount:0,grossBonus:0,addedUnique:0,overlap:0,ownedExcluded:true});}}
      if(!hit){unmatched.push(sourceTitle);ledger.push({gameEye:sourceTitle,matchInput:title,correction:correctionReason,matchType:'UNRESOLVED',matched:null,ids:[],identities:[],coverageCount:0,grossBonus:0,addedUnique:0,overlap:0});}
    }

    const multi=ledger.filter(x=>x.matchType==='MULTI_IDENTITY_PRODUCT'),singleProducts=ledger.filter(x=>x.matchType==='PRODUCT'),direct=ledger.filter(x=>x.matchType==='IDENTITY'),matched=ledger.filter(x=>['IDENTITY','PRODUCT','MULTI_IDENTITY_PRODUCT'].includes(x.matchType)),corrections=ledger.filter(x=>x.correction);
    const matchedRows=matched.length,grossBonus=multi.reduce((n,x)=>n+x.grossBonus,0),overlap=matched.reduce((n,x)=>n+x.overlap,0),netCompilationGain=owned.size-matchedRows;
    const rowAccountingOK=titles===matchedRows+excluded+unmatched.length,identityAccountingOK=owned.size===matched.reduce((n,x)=>n+x.addedUnique,0),bonusAccountingOK=netCompilationGain===grossBonus-overlap;
    saveState({...stateCache,version:13,owned:[...owned],excludedOwned:[...excludedOwned],products:[...ownedProducts],source:f.name,ownershipAudit:{at:new Date().toISOString(),ps4Rows:titles,matchedRows,satisfied:owned.size,excluded,excludedOwned:[...excludedOwned],excludedOwnedTitles:ledger.filter(x=>x.ownedExcluded).map(x=>x.matched),unresolved:unmatched.length,unresolvedTitles:unmatched,netCompilationGain,rowAccountingOK,identityAccountingOK,bonusAccountingOK}});
    progress();resetBrowse();
    const audit={file:f.name,ps4Rows:titles,matchedRows,directIdentityRows:direct.length,singleIdentityProductRows:singleProducts.length,multiIdentityProductRows:multi.length,grossCompilationBonus:grossBonus,overlapIdentities:overlap,netCompilationGain,satisfiedIdentities:owned.size,excludedRows:excluded,ownedExcludedRows:excludedOwned.size,ownedExcludedTitles:ledger.filter(x=>x.ownedExcluded).map(x=>x.matched),unresolvedRows:unmatched.length,unresolved:unmatched,rowAccountingOK,identityAccountingOK,bonusAccountingOK,multiIdentityProducts:multi,corrections,ledger};window.SHELFCHECK_OWNERSHIP_AUDIT=audit;
    const proof=rowAccountingOK&&identityAccountingOK&&bonusAccountingOK?'ACCOUNTING VERIFIED':'AUDIT WARNING';
    const unresolvedText=unmatched.length?` Unresolved: ${unmatched.join(' · ')}.`:'';
    const auditSummary=`GameEye: ${titles} PS4 rows → ${owned.size} satisfied · +${netCompilationGain} net compilation identities · ${excluded} excluded · ${unmatched.length} unresolved · ${proof}.${unresolvedText}`;
    const msgEl=$('#syncmsg');
    if(msgEl)msgEl.textContent=proof==='AUDIT WARNING'
      ?'GameEye audit warning — reconciliation accounting needs review.'
      :unmatched.length
        ?`GameEye sync needs review: ${unmatched.length} title${unmatched.length===1?'':'s'} unresolved — ${unmatched.join(' · ')}`
        :'';
    console.group('ShelfCheck GameEye ownership audit');console.log(auditSummary);console.log('Accounting',audit);if(corrections.length)console.table(corrections);console.table(multi);if(unmatched.length)console.warn('Unresolved',unmatched);console.log('Full reconciliation ledger',ledger);console.groupEnd();
  };
  window.SHELFCHECK_OWNERSHIP_AUDIT_V070=true;
})();
