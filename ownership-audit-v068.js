// ShelfCheck v0.70 — exact, auditable GameEye ownership reconciliation.
// Every satisfied identity is traceable to one GameEye row. Product matching uses the
// same merged-product model as ShelfCheck, and unresolved titles are surfaced in the UI.
(()=>{
  if(typeof importCSV!=='function')return;

  importCSV=async function(f){
    const rows=parseCSV(await f.text()),h=rows.shift()||[],ix=Object.fromEntries(h.map((x,i)=>[x,i]));
    const owned=new Set(),ownedProducts=new Set(),ledger=[],unmatched=[];
    const idx=typeof ensureMergedProducts==='function'?ensureMergedProducts():null;
    let titles=0,excluded=0;

    for(const r of rows){
      const platform=(r[ix.Platform]||'').trim().toLowerCase(),cat=(r[ix.Category]||'').trim().toLowerCase(),typ=(r[ix.UserRecordType]||'Owned').trim().toLowerCase();
      if(!['sony playstation 4','playstation 4','ps4'].includes(platform)||cat!=='games'||typ!=='owned')continue;
      titles++;
      const title=r[ix.Title]||'',cs=candidates(title);
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
        ledger.push({gameEye:title,matchType:ids.length>1?'MULTI_IDENTITY_PRODUCT':'PRODUCT',matched:p.title,ids,identities:ids.map(id=>byId.get(id)?.title).filter(Boolean),coverageCount:ids.length,grossBonus:Math.max(0,ids.length-1),addedUnique,overlap:ids.length-addedUnique});break;
      }
      if(!hit)for(const c of cs){
        const ids=items.filter(x=>x.set==='INCLUDED'&&(norm(x.title)===c||(aliasesById.get(x.id)||[]).includes(c))).map(x=>x.id);
        if(ids.length){const before=owned.size;owned.add(ids[0]);const addedUnique=owned.size-before;hit=true;ledger.push({gameEye:title,matchType:'IDENTITY',matched:byId.get(ids[0])?.title,ids:[ids[0]],identities:[byId.get(ids[0])?.title],coverageCount:1,grossBonus:0,addedUnique,overlap:1-addedUnique});break;}
      }
      if(!hit){const ex=cs.map(c=>items.find(x=>x.set==='EXCLUDED'&&(norm(x.title)===c||(aliasesById.get(x.id)||[]).includes(c)))).filter(Boolean)[0];if(ex){excluded++;hit=true;ledger.push({gameEye:title,matchType:'EXCLUDED',matched:ex.title,ids:[],identities:[],coverageCount:0,grossBonus:0,addedUnique:0,overlap:0});}}
      if(!hit){unmatched.push(title);ledger.push({gameEye:title,matchType:'UNRESOLVED',matched:null,ids:[],identities:[],coverageCount:0,grossBonus:0,addedUnique:0,overlap:0});}
    }

    const multi=ledger.filter(x=>x.matchType==='MULTI_IDENTITY_PRODUCT'),singleProducts=ledger.filter(x=>x.matchType==='PRODUCT'),direct=ledger.filter(x=>x.matchType==='IDENTITY'),matched=ledger.filter(x=>['IDENTITY','PRODUCT','MULTI_IDENTITY_PRODUCT'].includes(x.matchType));
    const matchedRows=matched.length,grossBonus=multi.reduce((n,x)=>n+x.grossBonus,0),overlap=matched.reduce((n,x)=>n+x.overlap,0),netCompilationGain=owned.size-matchedRows;
    const rowAccountingOK=titles===matchedRows+excluded+unmatched.length,identityAccountingOK=owned.size===matched.reduce((n,x)=>n+x.addedUnique,0),bonusAccountingOK=netCompilationGain===grossBonus-overlap;
    saveState({...stateCache,version:12,owned:[...owned],products:[...ownedProducts],source:f.name,ownershipAudit:{at:new Date().toISOString(),ps4Rows:titles,matchedRows,satisfied:owned.size,excluded,unresolved:unmatched.length,unresolvedTitles:unmatched,netCompilationGain,rowAccountingOK,identityAccountingOK,bonusAccountingOK}});
    progress();resetBrowse();
    const audit={file:f.name,ps4Rows:titles,matchedRows,directIdentityRows:direct.length,singleIdentityProductRows:singleProducts.length,multiIdentityProductRows:multi.length,grossCompilationBonus:grossBonus,overlapIdentities:overlap,netCompilationGain,satisfiedIdentities:owned.size,excludedRows:excluded,unresolvedRows:unmatched.length,unresolved:unmatched,rowAccountingOK,identityAccountingOK,bonusAccountingOK,multiIdentityProducts:multi,ledger};window.SHELFCHECK_OWNERSHIP_AUDIT=audit;
    const proof=rowAccountingOK&&identityAccountingOK&&bonusAccountingOK?'ACCOUNTING VERIFIED':'AUDIT WARNING';
    const unresolvedText=unmatched.length?` Unresolved: ${unmatched.join(' · ')}.`:'';
    $('#syncmsg').textContent=`GameEye: ${titles} PS4 rows → ${owned.size} satisfied · +${netCompilationGain} net compilation identities · ${excluded} excluded · ${unmatched.length} unresolved · ${proof}.${unresolvedText}`;
    console.group('ShelfCheck GameEye ownership audit');console.log($('#syncmsg').textContent);console.log('Accounting',audit);console.table(multi);if(unmatched.length)console.warn('Unresolved',unmatched);console.log('Full reconciliation ledger',ledger);console.groupEnd();
  };
  window.SHELFCHECK_OWNERSHIP_AUDIT_V070=true;
})();
