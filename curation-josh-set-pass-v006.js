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
//       (PC, PSVR, Quest, PSVR2), unlike The Persistence's later patch.
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

    exclude('The Walking Dead: Saints & Sinners',1304,'PSVR_REQUIRED — excluded by Josh Set curation pass #6. Verified: VR-native first-person game built around PS Move physics interactions (two-handed weapon grip, melee, body-worn inventory); no flatscreen/non-VR mode has ever shipped on any platform. Curator decision by Josh following a targeted 3-identity PSVR rule review (also covering Tetris Effect and The Persistence, both confirmed PSVR optional/supported and left INCLUDED).');

    window.SHELFCHECK_CURATION_JOSH_SET_PASS_V006={excluded};
    console.info(`ShelfCheck Josh Set curation pass #6 applied: ${excluded.length} identities excluded`,excluded);
  });
})();

// ShelfCheck curation — Josh Set pass #7.
// Final dossier-era physical-format cleanup. This is appended here so it executes in the
// already-wired synchronous curation slot before census-finalize.js.
//
// KEEP after curator review: Warhammer 40,000: Space Wolf (1414) — qualifying PS4 disc exists.
// Additional no-action keeps: World End Syndrome (1448) — EU physical; World of Warships:
// Legends (1450) — Firepower Deluxe Edition is a legitimate physical PS4 SKU.
(()=>{
  registerCensusMutation('exclude',()=>{
    const find=t=>items.find(x=>norm(x.title)===norm(t));
    const excluded=[];
    const exclude=(title,id,reason)=>{
      const x=find(title);
      if(!x){console.warn(`ShelfCheck curation pass v0.07: expected identity not found, skipped: "${title}" (id ${id})`);return;}
      if(x.id!==id){console.warn(`ShelfCheck curation pass v0.07: id mismatch for "${title}" -- expected ${id}, found ${x.id}. Excluding by title match anyway.`);}
      x.set='EXCLUDED';
      x.cleanupReason=reason;
      excluded.push(x.title);
    };

    const reason='NO_QUALIFYING_PHYSICAL — excluded by Josh Set curation pass #7 after curator review of the final borderline-dossier physical-format queue. PS4 version exists, but no qualifying physical PS4 release was verified; digital-only software does not count toward the physical-only Josh Set.';
    exclude('Aces of the Luftwaffe',33,reason);
    exclude('Assault Gunners HD Edition',106,reason);
    exclude('BADLAND: Game of the Year Edition',128,reason);
    exclude('Bear With Me: The Complete Collection',151,reason);
    exclude('Construction Simulator 3: Console Edition',263,reason);
    exclude('Edna & Harvey: The Breakout - 10th Anniversary Edition',433,reason);
    exclude('The Last Remnant Remastered',1263,reason);
    exclude('The Walking Vegetables: Radical Edition',1309,reason);
    exclude('Unexplored: Unlocked Edition',1384,reason);
    exclude('Warhammer Quest',1415,reason);
    exclude('Warhammer Quest 2: The End Times',1416,reason);

    window.SHELFCHECK_CURATION_JOSH_SET_PASS_V007={excluded};
    console.info(`ShelfCheck Josh Set curation pass #7 applied: ${excluded.length} identities excluded`,excluded);
  });
})();
