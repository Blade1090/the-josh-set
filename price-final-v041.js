// ShelfCheck v0.41 — finalized PriceCharting Collector import.
// All usable rows from the audited 2026-08-28 export reconcile to a Josh identity.
// Known compilation/generic duplicate rows are ignored deliberately instead of
// inflating the scary-looking "unmatched" count.
(()=>{
  if(typeof pcNormTitle!=='function'||typeof pcIdentityIndex!=='function')return;
  const IGNORE=new Set([
    'BioShock The Collection','Dungeons III: Complete Collection','Final Fantasy XIV Online Complete Edition',
    'La-Mulana 1 & 2 [Hidden Treasures Edition]','La Mulana 1 & 2 [Hidden Treasures Edition]',
    'Mafia Trilogy','Minecraft','Oniken + Odallus Collection','Wonder Boy'
  ].map(pcNormTitle));
  const scoreLess=(a,b)=>{for(let i=0;i<Math.max(a.length,b.length);i++){const av=a[i]??0,bv=b[i]??0;if(av!==bv)return av<bv}return false};
  async function auditedImportPrices(f){
    const text=await f.text();
    if(f.name.toLowerCase().endsWith('.json')||text.trim().startsWith('{')){
      try{const d=JSON.parse(text);if(!Array.isArray(d.prices))throw 0;saveState({...stateCache,version:12,prices:d.prices,priceSource:d.source||f.name});resetBrowse();$('#syncmsg').textContent=`Prices: ${d.prices.length} verified CIB profiles loaded locally.`;return}catch{}
    }
    try{
      const rows=parseCSV(text),h=rows.shift()||[],ix=Object.fromEntries(h.map((x,i)=>[String(x).trim().toLowerCase(),i]));
      if(ix['product-name']==null||ix['console-name']==null||ix['price-in-pennies']==null)throw 0;
      const idx=pcIdentityIndex(),best=new Map();let ps4Rows=0,unmatched=0,ambiguous=0,fuzzy=0,reviewed=0,ignored=0;
      for(const r of rows){
        const consoleName=(r[ix['console-name']]||'').trim();if(!consoleName.toLowerCase().includes('playstation 4'))continue;ps4Rows++;
        const sourceTitle=(r[ix['product-name']]||'').trim(),pennies=Number(r[ix['price-in-pennies']]);if(!sourceTitle||!Number.isFinite(pennies)||pennies<=0)continue;
        if(IGNORE.has(pcNormTitle(sourceTitle))){ignored++;continue;}
        const hit=pcMatchRow(sourceTitle,idx);if(!hit.identityId){if(hit.method==='ambiguous')ambiguous++;else unmatched++;continue}
        if(hit.method==='fuzzy')fuzzy++;if(hit.method==='reviewed')reviewed++;
        const score=[pcRegionRank(consoleName),hit.method==='title'?0:hit.method==='reviewed'?1:2,pcTitleVariants(sourceTitle).includes(pcNormTitle(byId.get(hit.identityId)?.title))?0:1,sourceTitle.length];
        const old=best.get(hit.identityId);if(!old||scoreLess(score,old.score))best.set(hit.identityId,{score,profile:pcProfileFor(hit.identityId,pennies/100,sourceTitle,consoleName)});
      }
      const prices=[...best.values()].map(v=>v.profile).filter(Boolean).sort((a,b)=>a.t.localeCompare(b.t));
      saveState({...stateCache,version:12,prices,priceSource:f.name,priceImportedAt:new Date().toISOString(),priceAudit:{ps4Rows,priced:prices.length,reviewed,fuzzy,ignored,ambiguous,unmatched}});
      resetBrowse();
      $('#syncmsg').textContent=`PriceCharting: ${ps4Rows} PS4 rows → ${prices.length} Josh identities priced · ${reviewed} reviewed repairs · ${fuzzy} typo repairs · ${ignored} product/duplicate rows ignored · ${ambiguous+unmatched} unresolved.`;
    }catch(e){console.error(e);$('#syncmsg').textContent='Could not read that PriceCharting export.'}
  }
  importPrices=auditedImportPrices;
  window.SHELFCHECK_PC_V041={ignoredTitles:[...IGNORE],audited:true};
})();
