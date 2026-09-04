// ShelfCheck physical-omission pass v0.01 -- targeted, evidence-based addition(s) found by a
// bounded negative-space check triggered by a confirmed missing PS4 physical release
// (Dragon Ball: The Breakers). Full evidence/reasoning: audit-out/physical-omission-check.json.
// Same registration pattern as every other census-mutating script: registers into the 'add'
// phase, applied once by census-finalize.js after every add-phase script has registered and
// before any exclude-phase rule runs.
(()=>{
  registerCensusMutation('add',()=>{
    const added=[];

    // Dragon Ball: The Breakers -- confirmed physical PS4 Special Edition (Bandai Namco,
    // October 14, 2022, UPC 722674127578, PriceCharting product 4175899). Bandai Namco's own
    // launch information distinguishes the digital-only Standard Edition from the physical
    // Special Edition (full game + extras) and the physical Limited Edition Bundle; only the
    // physical editions qualify. The game requires an internet connection, but ShelfCheck does
    // not exclude physical games merely for requiring online service, so it qualifies under
    // existing rules. One playable identity is added (not one per edition) -- the Special/
    // Limited Edition names are physical-product variants of the same game, matching how
    // ShelfCheck already treats edition-of-the-same-game cases elsewhere (e.g. census-v040's
    // Sexy Brutale: Full House Edition).
    if(!byId.has(2781)){
      const x={
        id:2781,
        title:'Dragon Ball: The Breakers',
        set:'INCLUDED',
        baseline:'NEEDED',
        strong:null,
        target:null,
        max:8.99,
        search:norm('Dragon Ball: The Breakers'),
        priceSource:'PriceCharting product 4175899 (Dragon Ball: The Breakers [Special Edition], PS4, UPC 722674127578) -- CIB market snapshot at time of addition (loose ~$8.02, CIB ~$8.99, new ~$10.95).',
        auditSource:'Confirmed physical PS4 Special Edition (Bandai Namco, October 14, 2022, North America/ESRB, UPC 722674127578, PriceCharting product 4175899); Standard Edition is digital-only and not represented as a separate identity or SKU.'
      };
      items.push(x);
      byId.set(x.id,x);
      // GameEye/search aliases for the physical edition title. app.js's candidates() already
      // strips a trailing "[...]" bracket group, so a GameEye row titled "Dragon Ball: The
      // Breakers [Special Edition]" resolves to this identity's exact title automatically;
      // these extra aliases are a defensive safety net for other plausible GameEye/PriceCharting
      // title formats so ownership reconciliation still recognizes the physical edition.
      const aliases=[...new Set(['Dragon Ball: The Breakers [Special Edition]','Dragon Ball: The Breakers - Special Edition','Dragon Ball: The Breakers Special Edition'].map(a=>norm(a)))];
      aliasesById.set(x.id,aliases);
      x.search+=' '+aliases.join(' ');
      added.push(x.title);
    }

    // Russian Subway Dogs -- confirmed physical PS4 release (Limited Run Games #555).
    // Limited Run Games' own official product page ("Limited Run #555: Russian Subway Dogs
    // (PS4)") states directly: "Russian Subway Dogs is on a region-free physical disc for the
    // PlayStation 4." First-party publisher/manufacturer confirmation of a physical PS4 disc is
    // sufficient without a PriceCharting ID. No verified price source exists yet -- left
    // PRICE PENDING (max stays null) rather than guessed.
    if(!byId.has(2782)){
      const x={
        id:2782,
        title:'Russian Subway Dogs',
        set:'INCLUDED',
        baseline:'NEEDED',
        strong:null,
        target:null,
        max:null,
        search:norm('Russian Subway Dogs'),
        auditSource:'Confirmed physical PS4 release: Limited Run Games #555 ("Russian Subway Dogs is on a region-free physical disc for the PlayStation 4" -- Limited Run Games\' own official product page).'
      };
      items.push(x);
      byId.set(x.id,x);
      added.push(x.title);
    }

    // Prince of Persia: The Lost Crown -- confirmed physical PS4 release (Ubisoft, January 18,
    // 2024). Sony's own official PlayStation listing states that owners of the PS4 disc copy
    // must insert that disc into a PS5 to use the PS5 digital upgrade -- direct first-party
    // confirmation that a physical PS4 disc exists (a disc-based cross-gen upgrade check has no
    // meaning unless the PS4 disc is real). No verified price source exists yet -- left
    // PRICE PENDING (max stays null) rather than guessed.
    if(!byId.has(2783)){
      const x={
        id:2783,
        title:'Prince of Persia: The Lost Crown',
        set:'INCLUDED',
        baseline:'NEEDED',
        strong:null,
        target:null,
        max:null,
        search:norm('Prince of Persia: The Lost Crown'),
        auditSource:'Confirmed physical PS4 release (Ubisoft, January 18, 2024): Sony\'s own official PlayStation listing states PS4 disc owners must insert the physical disc into a PS5 to claim the PS5 digital upgrade -- first-party confirmation of a real PS4 disc.'
      };
      items.push(x);
      byId.set(x.id,x);
      added.push(x.title);
    }

    window.SHELFCHECK_PHYSICAL_OMISSION_PASS_V001={added};
    console.info(`ShelfCheck physical omission pass v0.01 applied: ${added.length} identity added`,added);
  });
})();
