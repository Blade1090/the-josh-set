// ShelfCheck v0.68 — auditable GameEye ownership reconciliation.
// Replaces the opaque importer with a row-by-row ledger so every satisfied identity
// can be traced back to a GameEye title and every compilation bonus is visible.
(()=>{
  const originalImport=typeof importCSV==='function'?importCSV:null;
  if(!originalImport)return;

  importCSV=async function(f){
    const rows=parseCSV(await f.text()),h=rows.shift()||[],ix=Object.fromEntries(h.map((x,i)=>[x,i]));
    const owned=new Set(),ownedProducts=new Set(),ledger=[],unmatched=[];
    let titles=0,excluded=0;

    for(const r of rows){
      const platform=(r[ix.Platform]||'').trim().toLowerCase(),cat=(r[ix.Category]||'').trim().toLowerCase(),typ=(r[ix.UserRecordType]||'Owned').trim().toLowerCase();
      if(!['sony playstation 4','playstation 4','ps4'].includes(platform)||cat!=='games'||typ!=='owned')continue;
      titles++;
      const title=r[ix.Title]||'',cs=candidates(title);
      let hit=false;

      for(const c of cs){
        const p=productMap.get(c)||productMap.get(c.startsWith('the ')?c.slice(4):'the '+c);
        if(!p)continue;
        const ids=[...new Set(p.ids||[])].filter(id=>byId.get(id)?.set==='INCLUDED');
        ids.forEach(id=>owned.add(id));ownedProducts.add(p.key);hit=true;
        ledger.push({gameEye:title,matchType:ids.length>1?'MULTI_IDENTITY_PRODUCT':'PRODUCT',matched:p.title,ids,identities:ids.map(id=>byId.get(id)?.title).filter(Boolean),bonus:Math.max(0,ids.length-1)});
        break;
      }

      if(!hit)for(const c of cs){
        const ids=items.filter(x=>x.set==='INCLUDED'&&(norm(x.title)===c||(aliasesById.get(x.id)||[]).includes(c))).map(x=>x.id);
        if(ids.length){owned.add(ids[0]);hit=true;ledger.push({gameEye:title,matchType:'IDENTITY',matched:byId.get(ids[0])?.title,ids:[ids[0]],identities:[byId.get(ids[0])?.title],bonus:0});break;}
      }

      if(!hit){
        const ex=cs.map(c=>items.find(x=>x.set==='EXCLUDED'&&(norm(x.title)===c||(aliasesById.get(x.id)||[]).includes(c))).filter(Boolean)[0];
        if(ex){excluded++;hit=true;ledger.push({gameEye:title,matchType:'EXCLUDED',matched:ex.title,ids:[],identities:[],bonus:0});}
      }
      if(!hit){unmatched.push(title);ledger.push({gameEye:title,matchType:'UNRESOLVED',matched:null,ids:[],identities:[],bonus:0});}
    }

    const multi=ledger.filter(x=>x.matchType==='MULTI_IDENTITY_PRODUCT');
    const singleProducts=ledger.filter(x=>x.matchType==='PRODUCT');
    const direct=ledger.filter(x=>x.matchType==='IDENTITY');
    const bonus=multi.reduce((n,x)=>n+x.bonus,0);
    const matchedRows=direct.length+singleProducts.length+multi.length;

    saveState({...stateCache,version:11,owned:[...owned],products:[...ownedProducts],source:f.name});
    progress();resetBrowse();
    window.SHELFCHECK_OWNERSHIP_AUDIT={file:f.name,ps4Rows:titles,matchedRows,directIdentityRows:direct.length,singleIdentityProductRows:singleProducts.length,multiIdentityProductRows:multi.length,compilationBonusIdentities:bonus,satisfiedIdentities:owned.size,excludedRows:excluded,unresolvedRows:unmatched.length,unresolved:unmatched,multiIdentityProducts:multi,ledger};
    const msg=`GameEye: ${titles} PS4 rows → ${owned.size} satisfied · ${multi.length} multi-game products (+${bonus} identities) · ${excluded} excluded · ${unmatched.length} unresolved.`;
    $('#syncmsg').textContent=msg;
    console.group('ShelfCheck GameEye ownership audit');console.log(msg);console.table(multi);if(unmatched.length)console.warn('Unresolved',unmatched);console.log('Full reconciliation ledger',ledger);console.groupEnd();
  };

  window.SHELFCHECK_OWNERSHIP_AUDIT_V068=true;
})();
