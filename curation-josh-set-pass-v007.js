// ShelfCheck curation — Josh Set pass #7.
// Final dossier-era physical-format cleanup.
//
// Curator review of the 12 NO_QUALIFYING_PHYSICAL flags raised by the
// borderline dossier repair campaign. Josh adopted the independently
// verified results below:
//
//   KEEP (no census action):
//     - Warhammer 40,000: Space Wolf (1414): qualifying PS4 physical disc exists.
//
//   CUT (11 identities): no qualifying PS4 physical release found.
//
// Additional campaign ambiguities resolved with no census action:
//   - World End Syndrome (1448): qualifying European PS4 physical exists; imports count.
//   - World of Warships: Legends (1450): Firepower Deluxe Edition is a legitimate
//     PS4 physical SKU with disc/full-game packaging; online dependency does not by
//     itself violate the Josh Set physical-media rules.
//
// Uses the established set='EXCLUDED' + cleanupReason convention and
// registerCensusMutation('exclude', ...) pipeline.
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
