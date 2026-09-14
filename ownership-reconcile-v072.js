// ShelfCheck v0.72 — Shenmue I & II compilation ownership fix.
//
// Bug: importing a GameEye CSV with the owned physical CIB product "Shenmue I & II" left both
// Shenmue I and Shenmue II showing NEEDED. Traced the full path (GameEye CSV -> candidates() ->
// product lookup via ensureMergedProducts()/productKeys() (model-fix.js) -> importCSV
// (ownership-audit-v068.js, the actually-in-effect importCSV) -> ownedSet -> status()/
// effectiveStatus()): the product-lookup step found nothing, because DATA.p (the compilation
// table) had NO row at all for "Shenmue I & II" -- not a normalization or matching bug. With no
// product match, importCSV fell through to its single-identity fallback, which also found
// nothing (no census identity is literally titled "Shenmue I & II"), so the whole CSV row went
// UNRESOLVED and neither identity's ownership was ever touched.
//
// This is exactly the class of gap the existing compilation data model is meant to cover (see
// the 49 other real multi-identity products already in DATA.p, e.g. Yakuza Remastered
// Collection, BioShock: The Collection) -- it was simply missing this one real physical
// product. Fixing it as a title-specific ownedSet/effectiveStatus hack would bypass that model
// instead of using it, so this reuses the exact ensureProduct() registration pattern already
// established in ownership-reconcile-v071.js to add the missing DATA.p row the normal way.
(()=>{registerCensusMutation('exclude',()=>{
const find=t=>items.find(x=>norm(x.title)===norm(t));
const ensureProduct=(title,coveredTitles)=>{const ids=coveredTitles.map(t=>find(t)).filter(x=>x?.set==='INCLUDED').map(x=>x.id);if(!ids.length)return false;const key=norm(title);let row=DATA.p.find(p=>norm(p[1])===key||norm(p[0])===key);if(row)row[2]=[...new Set([...(row[2]||[]),...ids])];else DATA.p.push([title,title,ids]);const p={key,title,ids:[...new Set(ids)]};productMap.set(key,p);if(key.startsWith('the '))productMap.set(key.slice(4),p);return true;};
ensureProduct('Shenmue I & II',['Shenmue I','Shenmue II']);
window.SHELFCHECK_OWNERSHIP_RECONCILE_V072=true;console.info('ShelfCheck v0.72 ownership reconciliation applied');});})();
