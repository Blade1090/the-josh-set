// ShelfCheck v0.60 — final rule/integrity scrub after PriceCharting A-Z negative-space audit.
// Evidence-backed removals only: PSVR-required, DLC/add-on identity, or no qualifying PS4 physical SKU.
(()=>{const DROP=new Map([
  ["after the fall","PSVR required on PS4; excluded by Josh Set VR rule"],
  ["shadow of the tomb raider the forge","DLC challenge tomb; not a standalone game identity"],
  ["final fantasy vii","Original FFVII PS4 release is digital-only; no qualifying PS4 physical SKU"],
  ["escape plan directors cut","Director's Cut is DLC/add-on for Escape Plan; no standalone PS4 physical SKU"],
  ["destroy all humans 2","Original PS2-classic PS4 port has no qualifying PS4 physical release; do not confuse with Reprobed"]
]);registerCensusMutation('exclude',()=>{const removed=[];for(const x of items){const k=norm(x.title);const why=DROP.get(k);if(why&&x.set==='INCLUDED'){x.set='EXCLUDED';x.auditSource=`v0.60 integrity scrub · ${why}`;removed.push({id:x.id,title:x.title,reason:why});}}window.SHELFCHECK_V060={removed};console.info(`ShelfCheck v0.60 integrity scrub: ${removed.length} removed`);});})();
