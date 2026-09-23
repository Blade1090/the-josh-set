// ShelfCheck price maintenance v1 — occasional maintenance lives behind the hamburger.
// Reuses the existing #priceBtn/#prices PriceCharting import pipeline, adds a live status
// summary + current-price audit export, and keeps the normal browse/store UI uncluttered.
(()=>{
  const BASELINE_DATE='2026-09-23T18:24:00-04:00';
  const money=v=>Number.isFinite(Number(v))?`$${Number(v).toFixed(2)}`:'—';
  const fmtDate=v=>{try{return new Date(v).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'})}catch{return 'Unknown'}};

  function snapshot(){
    const included=(typeof items!=='undefined'?items:[]).filter(x=>x.set==='INCLUDED');
    let priced=0,pending=0,noData=0;
    for(const x of included){
      const p=typeof priceFor==='function'?priceFor(x):null;
      const n=Number(p?.m??p?.x??x.max);
      if(Number.isFinite(n)&&n>0)priced++;
      else if(p?.noReliableData)noData++;
      else pending++;
    }
    return {included:included.length,priced,pending,noData,coverage:included.length?+(priced/included.length*100).toFixed(2):0};
  }

  function lastRefresh(){
    return stateCache?.priceImportedAt||stateCache?.priceRefreshImportedAt||BASELINE_DATE;
  }

  function makeAudit(){
    const rows=(typeof items!=='undefined'?items:[]).filter(x=>x.set==='INCLUDED').map(x=>{
      const p=typeof priceFor==='function'?priceFor(x):null;
      const m=Number(p?.m??p?.x??x.max);
      return {
        id:x.id,title:x.title,
        market:Number.isFinite(m)&&m>0?+m.toFixed(2):null,
        source:p?.source||null,
        product:p?.pc||p?.productTitle||p?.product||null,
        region:p?.c||p?.region||null,
        productInherited:!!p?.productInherited,
        noReliableData:!!p?.noReliableData,
      };
    });
    const s=snapshot();
    return {shelfcheckPriceAudit:1,generatedAt:new Date().toISOString(),lastRefresh:lastRefresh(),summary:s,prices:rows};
  }

  function downloadAudit(){
    const data=makeAudit();
    const stamp=new Date().toISOString().slice(0,10);
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);a.download=`shelfcheck-price-audit-${stamp}.json`;
    document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1500);
    const msg=document.getElementById('syncmsg');if(msg)msg.textContent=`Price audit exported: ${data.summary.priced}/${data.summary.included} priced.`;
  }

  function paint(){
    const host=document.getElementById('priceMaintenanceStatus');if(!host)return;
    const s=snapshot();
    host.innerHTML=`<b>PRICE MAINTENANCE</b><small>Last refresh: ${fmtDate(lastRefresh())}</small><small>${s.priced.toLocaleString()} / ${s.included.toLocaleString()} priced · ${s.coverage.toFixed(2)}% coverage${s.pending?` · ${s.pending} pending`:''}${s.noData?` · ${s.noData} no-data`:''}</small>`;
  }

  function install(){
    const menu=document.getElementById('maintMenu'),priceBtn=document.getElementById('priceBtn'),prices=document.getElementById('prices');
    if(!menu||!priceBtn||!prices||document.getElementById('priceMaintenanceStatus'))return;
    priceBtn.textContent='REFRESH PRICES';
    const status=document.createElement('div');
    status.id='priceMaintenanceStatus';
    status.style.cssText='display:grid;gap:2px;padding:9px 11px;margin:2px 0 6px;border:1px solid #29303a;border-radius:10px;background:#10151d;color:#d9e0ea;font-size:.78rem';
    status.innerHTML='<b>PRICE MAINTENANCE</b><small>Loading…</small>';
    priceBtn.before(status);

    const audit=document.createElement('button');
    audit.id='priceAuditExportBtn';audit.type='button';audit.textContent='EXPORT PRICE AUDIT';audit.onclick=downloadAudit;
    priceBtn.after(audit);

    prices.addEventListener('change',()=>setTimeout(()=>{paint();if(stateCache?.priceImportedAt){stateCache.priceRefreshImportedAt=stateCache.priceImportedAt}},900));
    setTimeout(paint,1200);
    window.SHELFCHECK_PRICE_MAINTENANCE={version:1,snapshot,makeAudit,paint,lastRefresh};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
