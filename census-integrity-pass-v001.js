// ShelfCheck census integrity pass v0.01 — targeted, evidence-based corrections found by the
// census integrity attack audit (audit-out/census-integrity-audit.json has full reasoning).
// Same pattern as ownership-reconcile-v071.js: identities keep their row (nothing is deleted),
// duplicates are excluded with an alias pointing GameEye/search matching at the surviving
// canonical identity, and eligibility exclusions are recorded with an explicit reason.
(()=>{let tries=0;const apply=()=>{tries++;if(typeof norm!=='function'||!Array.isArray(items)||!items.length||!DATA||typeof byId==='undefined'){if(tries<120)setTimeout(apply,100);return;}
const find=t=>items.find(x=>norm(x.title)===norm(t));
const addAlias=(target,alias)=>{const x=find(target);if(!x)return false;const a=norm(alias);if(!aliasesById.has(x.id))aliasesById.set(x.id,[]);if(!aliasesById.get(x.id).includes(a))aliasesById.get(x.id).push(a);x.search=(x.search||norm(x.title))+' '+a;return true;};
const excludeDuplicate=(title,reason)=>{const x=find(title);if(!x||x.set!=='INCLUDED')return false;x.set='EXCLUDED';x.cleanupReason=reason;return true;};

// PSVR-required eligibility exclusions (Josh Set rule: PSVR-REQUIRED games are EXCLUDED).
// Each confirmed via the game's own official PlayStation Store product page text
// ("PlayStation VR and PlayStation Camera are required to play the PS4 version of this game.")
excludeDuplicate('ARK Park','PSVR REQUIRED — confirmed via official PlayStation Store listing ("PlayStation VR and PlayStation Camera are required to play the PS4 version of this game").');
excludeDuplicate('Werewolves Within','PSVR REQUIRED — confirmed via official PlayStation Store listing ("PlayStation VR and PlayStation Camera are required to play the PS4 version of this game").');
excludeDuplicate('Wolfenstein: Cyberpilot','PSVR REQUIRED — confirmed via official PlayStation Store listing ("PlayStation VR and PlayStation Camera are required to play the PS4 version of this game").');
excludeDuplicate('Deracine','PSVR REQUIRED — FromSoftware/Sony Interactive Entertainment exclusive PSVR title, confirmed via official PlayStation Blog and PS Store listing. The identity’s own dossier already flagged this for exclusion review.');
excludeDuplicate('The American Dream','PSVR REQUIRED — confirmed via official PlayStation Store listing and Limited Run Games #430 branding ("PSVR Required"). The identity’s own dossier already flagged this for exclusion review.');

// Same-disc / alternate-title duplicate identities: the SAME physical PS4 game counted twice
// under two title renderings. Canonical identity kept; duplicate excluded with an alias so
// existing/future GameEye ownership matching still resolves to the survivor.
if(excludeDuplicate('River City Melee','DUPLICATE — same Limited Run Games #103 physical PS4 disc as "River City Melee: Battle Royal Special" (confirmed via Limited Run Games’ own store listing and eStarland/VideoGamesNewYork cataloging the identical LRG #103 as "Battle Royal Special"); canonical identity is "River City Melee: Battle Royal Special".')){addAlias('River City Melee: Battle Royal Special','River City Melee');}
if(excludeDuplicate('The Dark Pictures - Man of Medan','DUPLICATE — same single 2019 game as "Dark Pictures Anthology: Man of Medan" (confirmed via matching official IGDB/Amazon/PS Store title and an identical automated cover match); canonical identity is "Dark Pictures Anthology: Man of Medan", consistent with sibling "Dark Pictures Anthology: House of Ashes".')){addAlias('Dark Pictures Anthology: Man of Medan','The Dark Pictures - Man of Medan');}
if(excludeDuplicate('TMNT: Mutants Unleashed','DUPLICATE — "TMNT" is the standard abbreviation of "Teenage Mutant Ninja Turtles"; same single 2024 game (confirmed via matching official IGDB/Wikipedia title and an identical automated cover match); canonical identity is the full "Teenage Mutant Ninja Turtles: Mutants Unleashed".')){addAlias('Teenage Mutant Ninja Turtles: Mutants Unleashed','TMNT: Mutants Unleashed');}
if(excludeDuplicate('JoJo: Eyes of Heaven','DUPLICATE — same single arena-fighter game as "JoJo’s Bizarre Adventure: Eyes of Heaven" (both identities’ own dossiers independently describe identical content/physical evidence); canonical identity is the full "JoJo’s Bizarre Adventure: Eyes of Heaven", matching its official IGDB title.')){addAlias("JoJo's Bizarre Adventure: Eyes of Heaven",'JoJo: Eyes of Heaven');}

DATA.n=items.filter(x=>x.set==='INCLUDED').length;if(typeof mergedProductIndex!=='undefined')mergedProductIndex=null;if(typeof progress==='function')progress();if(typeof resetBrowse==='function')resetBrowse();
window.SHELFCHECK_CENSUS_INTEGRITY_PASS_V001=true;
console.info('ShelfCheck census integrity pass v0.01 applied; denominator',DATA.n);
};apply();})();
