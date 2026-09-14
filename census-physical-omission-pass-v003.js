// ShelfCheck physical-omission pass v0.03 -- targeted, evidence-based addition.
// Josh reported Made in Abyss: Binary Star Falling into Darkness missing while using the app.
// Verified first (not assumed): no census identity, alias, or product row exists anywhere for
// this title under any name/region/edition (checked raw census data, DATA.a aliases, DATA.p
// products, and the finalized post-mutation item list). Genuinely absent, not a duplicate.
//
// Confirmed qualifying physical PS4 release: Spike Chunsoft published Made in Abyss: Binary
// Star Falling into Darkness for PS4 in North America/Europe on September 2, 2022 (Japan Sept
// 1, 2022). Standard physical PS4 disc confirmed via GameStop's own product listing (both new
// and pre-owned); a Collector's Edition physical SKU also exists (Amazon). A 3D action RPG with
// no VR requirement -- not PSVR-required, satisfies existing Josh Set physical-release rules.
// One playable identity covers both the standard disc and the Collector's Edition (same game,
// not a separate product/compilation) -- matching the existing one-identity-per-game convention
// (see census-physical-omission-pass-v002.js's Tony Hawk's Pro Skater 3 + 4 precedent).
//
// GameEye ownership matching needs no title-specific alias/hack: candidates() (app.js) already
// strips a trailing "(...)"/"[...]" edition tag (e.g. a GameEye row for the Collector's Edition
// SKU), and norm() already strips the colon and all other punctuation uniformly, so ordinary
// title/edition variants resolve through the existing generic mechanism.
//
// No cover, price, or HLTB/dossier data exists yet in any existing runtime source (checked
// covers-manifest.js/cover-overrides.js, every price-*.js file, hltb-data.txt, and
// shelfcheck-dossiers.txt/dossier-overrides-*.js -- zero matches for this title in any of
// them), so all of that is left pending/absent rather than guessed, per existing convention
// (see Tony Hawk's Pro Skater 3 + 4's PRICE PENDING precedent for the same reasoning).
//
// Same registration pattern as every other census-mutating script: registers into the 'add'
// phase, applied once by census-finalize.js after every add-phase script has registered and
// before any exclude-phase rule runs.
(()=>{
  registerCensusMutation('add',()=>{
    const added=[];

    if(!byId.has(2785)){
      const x={
        id:2785,
        title:'Made in Abyss: Binary Star Falling into Darkness',
        set:'INCLUDED',
        baseline:'NEEDED',
        strong:null,
        target:null,
        max:null,
        search:norm('Made in Abyss: Binary Star Falling into Darkness'),
        auditSource:'Confirmed physical PS4 release (Spike Chunsoft, Sept 2, 2022, North America/Europe; Japan Sept 1, 2022): GameStop product listing (new and pre-owned) confirms a standard physical PS4 disc; a Collector\'s Edition physical SKU also exists (Amazon). 3D action RPG, no VR requirement. Reported missing by Josh; verified genuinely absent (no existing identity/alias/product row under any title/region/edition) before adding.'
      };
      items.push(x);
      byId.set(x.id,x);
      added.push(x.title);
    }

    window.SHELFCHECK_PHYSICAL_OMISSION_PASS_V003={added};
    console.info(`ShelfCheck physical omission pass v0.03 applied: ${added.length} identity added`,added);
  });
})();
