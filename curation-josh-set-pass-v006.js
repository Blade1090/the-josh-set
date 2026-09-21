// ShelfCheck curation — Josh Set pass #6. Applies exactly 1 identity: The Walking Dead:
// Saints & Sinners.
//
// Targeted PSVR rule review of 3 identities flagged by the prior diagnostic (Tetris Effect,
// The Persistence, The Walking Dead: Saints & Sinners). Independently researched; Josh
// adopted all 3 proposed results as-is:
//
//   KEEP (no census action -- remain INCLUDED as before this pass):
//     - Tetris Effect (1213): PSVR OPTIONAL/SUPPORTED from original 2018 launch. Sony's own
//       announcement: "...Coming Fall 2018 to PlayStation4 With Optional PlayStation VR
//       Support" -- fully playable on a standard display, VR never required.
//     - The Persistence (1283): PSVR OPTIONAL/SUPPORTED as the software stands today.
//       Originally launched PSVR-exclusive (2018), but a free "Complete Edition" update
//       (May 2019, PlayStation Blog) patched flatscreen/TV play into the same game identity
//       for all existing owners, including physical disc owners. Not a separate SKU.
//
//   CUT (excluded by this pass):
//     - The Walking Dead: Saints & Sinners (1304): PSVR REQUIRED. VR-native first-person
//       game built entirely around PS Move physics interactions (two-handed grip, melee,
//       body-worn inventory); no flatscreen/non-VR mode has ever shipped on any platform
//       (PC, PSVR, Quest, PSVR2), unlike The Persistence's later patch. Confirmed via
//       Wikipedia's platform/gameplay description and corroborated by player community
//       discussion explicitly asking how to mod flatscreen play in (confirming none exists
//       officially).
//
// Reuses the existing set='EXCLUDED' + cleanupReason convention and the same
// registerCensusMutation('exclude', ...) pipeline as curation-josh-set-pass-v001-005.js.
(()=>{
  registerCensusMutation('exclude',()=>{
    const find=t=>items.find(x=>norm(x.title)===norm(t));
    const excluded=[];
    const exclude=(title,id,reason)=>{
      const x=find(title);
      if(!x){console.warn(`ShelfCheck curation pass v0.06: expected identity not found, skipped: "${title}" (id ${id})`);return;}
      if(x.id!==id){console.warn(`ShelfCheck curation pass v0.06: id mismatch for "${title}" -- expected ${id}, found ${x.id}. Excluding by title match anyway.`);}
      x.set='EXCLUDED';
      x.cleanupReason=reason;
      excluded.push(x.title);
    };

    // PSVR_REQUIRED -- applies only to this individually-verified identity. Tetris Effect
    // and The Persistence were reviewed in the same pass and confirmed PSVR optional/
    // supported, so they remain INCLUDED with no action here.
    exclude('The Walking Dead: Saints & Sinners',1304,'PSVR_REQUIRED — excluded by Josh Set curation pass #6. Verified: VR-native first-person game built around PS Move physics interactions (two-handed weapon grip, melee, body-worn inventory); no flatscreen/non-VR mode has ever shipped on any platform. Curator decision by Josh following a targeted 3-identity PSVR rule review (also covering Tetris Effect and The Persistence, both confirmed PSVR optional/supported and left INCLUDED).');

    window.SHELFCHECK_CURATION_JOSH_SET_PASS_V006={excluded};
    console.info(`ShelfCheck Josh Set curation pass #6 applied: ${excluded.length} identities excluded`,excluded);
  });
})();
