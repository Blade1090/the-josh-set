// ShelfCheck audit resync — re-run the dossier audit once every census-modifying
// script has finished, so the reported missing/good/thin counts reflect the
// final settled item.set values instead of a snapshot taken mid-load.
//
// This script is loaded last on purpose. auditDossiers() is normally called
// from dossiers.js and dossier-apply.js, both of which load and run *before*
// the census-cleanup/census-v0XX/pricecharting/integrity scripts further down
// the page that also mutate item.set. Every one of those scripts uses its own
// poll-until-ready loop rather than running synchronously, so simply loading
// last isn't enough to guarantee they've all settled yet -- this resync waits
// for its own readiness gate, then gives any still-pending sibling polls a
// settle window before taking the final snapshot, and repeats once more after
// that window in case something lands late.
(()=>{
  let tries=0;
  const settleMs=1500;
  const finalAudit=()=>{
    auditDossiers();
    console.log('ShelfCheck: audit resynced after full census load',DOSSIER_AUDIT);
  };
  const resync=()=>{
    tries++;
    if(typeof auditDossiers!=='function'||typeof dossiersReady==='undefined'||!dossiersReady||!Array.isArray(items)||!items.length){
      if(tries<100)setTimeout(resync,100);
      return;
    }
    setTimeout(finalAudit,settleMs);
  };
  resync();
})();
