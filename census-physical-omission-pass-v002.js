// ShelfCheck physical-omission pass v0.02 -- targeted, evidence-based addition found by a
// narrow recent-release (2024-2026) PS4 physical sanity check triggered by a confirmed
// missing release (Tony Hawk's Pro Skater 3 + 4). Full evidence/reasoning:
// audit-out/recent-ps4-omission-check.json. Same registration pattern as every other
// census-mutating script: registers into the 'add' phase, applied once by census-finalize.js
// after every add-phase script has registered and before any exclude-phase rule runs.
(()=>{
  registerCensusMutation('add',()=>{
    const added=[];

    // Tony Hawk's Pro Skater 3 + 4 -- confirmed physical PS4 release (Activision, July 11,
    // 2025, North America/ESRB). Target.com's own product listing confirms format "Physical"
    // disc, UPC 196388575534, $39.99 launch price. The digital-only "Cross-Gen Edition"/
    // "Digital Deluxe Edition" PS Store bundles are separate cross-buy SKUs; this identity
    // represents the standalone physical PS4 disc, matching the existing convention of one
    // playable identity per game (not one per edition/bundle). No verified secondary-market
    // CIB price source exists yet (PriceCharting refuses this session's fetch tool with HTTP
    // 403, same tooling limitation as every prior pricing pass this engagement) -- left
    // PRICE PENDING (max stays null) rather than guessing from a current retail/MSRP figure.
    if(!byId.has(2784)){
      const x={
        id:2784,
        title:"Tony Hawk's Pro Skater 3 + 4",
        set:'INCLUDED',
        baseline:'NEEDED',
        strong:null,
        target:null,
        max:null,
        search:norm("Tony Hawk's Pro Skater 3 + 4"),
        auditSource:'Confirmed physical PS4 disc (Activision, July 11, 2025, North America/ESRB): Target.com product listing (UPC 196388575534) explicitly states format "Physical", $39.99. Not a digital-only cross-gen bundle -- this is the standalone physical PS4 SKU.'
      };
      items.push(x);
      byId.set(x.id,x);
      // GameEye/search alias for the plain-ampersand title variant. app.js's norm() already
      // maps "&" to " and ", so "Tony Hawk's Pro Skater 3 & 4" and "... 3 + 4" both normalize
      // identically -- this alias is a defensive safety net for a GameEye export that spells
      // out "and" or uses a different separator than the official "+".
      const aliases=[...new Set(["Tony Hawk's Pro Skater 3 and 4",'Tony Hawk Pro Skater 3 4'].map(a=>norm(a)))];
      aliasesById.set(x.id,aliases);
      x.search+=' '+aliases.join(' ');
      added.push(x.title);
    }

    window.SHELFCHECK_PHYSICAL_OMISSION_PASS_V002={added};
    console.info(`ShelfCheck physical omission pass v0.02 applied: ${added.length} identity added`,added);
  });
})();
