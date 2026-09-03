// ShelfCheck census integrity pass v0.02 — closes the final two curator-review cases left open
// by census-integrity-pass-v001.js (audit-out/final-census-open-cases.json has full reasoning).
// Same pattern as v001/ownership-reconcile-v071.js: nothing is deleted, duplicates are excluded
// with an alias pointing at the surviving canonical identity, eligibility exclusions get an
// explicit reason.
(()=>{let tries=0;const apply=()=>{tries++;if(typeof norm!=='function'||!Array.isArray(items)||!items.length||!DATA||typeof byId==='undefined'){if(tries<120)setTimeout(apply,100);return;}
const find=t=>items.find(x=>norm(x.title)===norm(t));
const addAlias=(target,alias)=>{const x=find(target);if(!x)return false;const a=norm(alias);if(!aliasesById.has(x.id))aliasesById.set(x.id,[]);if(!aliasesById.get(x.id).includes(a))aliasesById.get(x.id).push(a);x.search=(x.search||norm(x.title))+' '+a;return true;};
const excludeDuplicate=(title,reason)=>{const x=find(title);if(!x||x.set!=='INCLUDED')return false;x.set='EXCLUDED';x.cleanupReason=reason;return true;};

// Pool Nation FX: digital-only PS4 PSN release. Confirmed via the game's own official
// PlayStation Store product page (product code contains "POOLNATIONFX"; publisher/developer
// credited as "Cherry Pop Games Limited" with no physical-edition branding). Exhaustive retail
// and PriceCharting checks found zero physical evidence specifically for "FX" -- every physical
// listing found belongs to the differently-published base "Pool Nation" (#922, Wired
// Productions, already its own separate qualifying identity, untouched by this change).
excludeDuplicate('Pool Nation FX','DIGITAL-ONLY — confirmed via the official PlayStation Store listing (self-published by Cherry Pop Games Limited, product code POOLNATIONFX, no physical-edition branding); no physical PS4 evidence found despite exhaustive retail/PriceCharting checks. Distinct from "Pool Nation" (#922), which has its own separately-confirmed physical release from a different publisher (Wired Productions).');

// 3D Mini Golf / 3D MiniGolf: same underlying Z-Software GmbH game, republished under two
// separate publisher deals (familyplay vs Merge Games) -- a common budget-shovelware pattern.
// Confirmed via matching official PS Store descriptions for BOTH listings: identical 54 holes
// (18 modeled on real courses), identical three scenarios (park/camping site/beach), identical
// Challenge + Tournament modes and 1-4 player multiplayer. Canonical identity kept is "3D
// MiniGolf" (#10), which already carries its own automated IGDB cover match; the prior
// cover-overrides.js entry for #9 (added when this was still an open question) is removed as
// part of this fix since #9 is no longer a rendered/completion identity.
if(excludeDuplicate('3D Mini Golf','DUPLICATE — same underlying Z-Software GmbH minigolf game as "3D MiniGolf" (#10), republished under a different publisher label (familyplay vs Merge Games); confirmed via matching official PS Store descriptions (identical 54 holes/18 official courses, identical park/camping/beach scenarios, identical game modes) for both listings. Canonical identity is "3D MiniGolf".')){addAlias('3D MiniGolf','3D Mini Golf');}

DATA.n=items.filter(x=>x.set==='INCLUDED').length;if(typeof mergedProductIndex!=='undefined')mergedProductIndex=null;if(typeof progress==='function')progress();if(typeof resetBrowse==='function')resetBrowse();
window.SHELFCHECK_CENSUS_INTEGRITY_PASS_V002=true;
console.info('ShelfCheck census integrity pass v0.02 applied; denominator',DATA.n);
};apply();})();
