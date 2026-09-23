// ShelfCheck curation — Josh Set pass #13 (ChatGPT endgame staging pass, 2026-09-23).
//
// Applies only high-confidence canonical exclusions already adjudicated outside Claude:
//   - 16 identities with no qualifying PS4 physical release
//   - 4 previously-established language-rule cuts (Japanese-only, no qualifying English route)
//
// Deliberately HELD OUT of this pass: Catlateral Damage identity replacement, God Eater
// Resurrection, the 3 Atelier Dusk DX identities, and Occultic;Nine. Those remain for
// final curator/model review rather than being forced to zero pending on uncertain evidence.
(()=>{
  registerCensusMutation('exclude',()=>{
    const excluded=[];
    const excludeById=(id,expected,reason)=>{
      const x=byId.get(id);
      if(!x){console.warn(`ShelfCheck curation pass v0.13: expected id ${id} (${expected}) not found; skipped.`);return;}
      if(norm(x.title)!==norm(expected))console.warn(`ShelfCheck curation pass v0.13: id ${id} title changed; expected "${expected}", found "${x.title}". Excluding by audited stable id.`);
      x.set='EXCLUDED'; x.cleanupReason=reason; excluded.push(x.title);
    };
    excludeById(493,"Firefighters: Plant Fire Department","NO_QUALIFYING_PHYSICAL_PS4 — excluded by Josh Set curation pass #13 after endgame adjudication. PS4 release records are PlayStation Store-only; no boxed PS4 SKU.");
    excludeById(560,"Guilty Gear","NO_QUALIFYING_PHYSICAL_PS4 — excluded by Josh Set curation pass #13 after endgame adjudication. Original Guilty Gear PS4 port is Store-only; physical PS4 Guilty Gear boxes are other games.");
    excludeById(566,"Gunman Clive HD Collection","NO_QUALIFYING_PHYSICAL_PS4 — excluded by Josh Set curation pass #13 after endgame adjudication. Sony PlayStation Blog launch explicitly labels PS4 release Digital; no physical.");
    excludeById(571,"Harvest Moon: A Wonderful Life Special Edition","NO_QUALIFYING_PHYSICAL_PS4 — excluded by Josh Set curation pass #13 after endgame adjudication. PS4 is PS2 Classic Store release; physical copies are legacy platforms.");
    excludeById(606,"How to Survive: Storm Warning Edition","NO_QUALIFYING_PHYSICAL_PS4 — excluded by Josh Set curation pass #13 after endgame adjudication. PS4 Store-only; physical evidence belongs to Xbox One.");
    excludeById(833,"Never Alone: Arctic Collection","NO_QUALIFYING_PHYSICAL_PS4 — excluded by Josh Set curation pass #13 after endgame adjudication. PS4 Store distribution; no qualifying PS4 box.");
    excludeById(935,"Project Nimbus: Complete Edition","NO_QUALIFYING_PHYSICAL_PS4 — excluded by Josh Set curation pass #13 after endgame adjudication. PS4 Store-only; physical commonly found is Switch.");
    excludeById(1007,"Roarr! Jurassic Edition","NO_QUALIFYING_PHYSICAL_PS4 — excluded by Josh Set curation pass #13 after endgame adjudication. PS4 digital; no PS4 physical SKU; Switch physical exists.");
    excludeById(1126,"Squareboy vs. Bullies: Arena Edition","NO_QUALIFYING_PHYSICAL_PS4 — excluded by Josh Set curation pass #13 after endgame adjudication. PS4 digital/cross-buy; no manufactured PS4 disc found.");
    excludeById(1190,"Sword Art Online Re: Hollow Fragment","NO_QUALIFYING_PHYSICAL_PS4 — excluded by Josh Set curation pass #13 after endgame adjudication. English PS4 release digital; Game Director's Edition contains Re:Hollow Fragment as a download code, not on disc.");
    excludeById(1718,"SaGa: Scarlet Grace - Ambitions","NO_QUALIFYING_PHYSICAL_PS4 — excluded by Josh Set curation pass #13 after endgame adjudication. Western PS4 version digital-only; no qualifying English PS4 physical.");
    excludeById(1749,"The Bug Butcher","NO_QUALIFYING_PHYSICAL_PS4 — excluded by Josh Set curation pass #13 after endgame adjudication. PS4 release data is PlayStation Store only; no manufactured disc.");
    excludeById(2119,"Hitman: Blood Money","NO_QUALIFYING_PHYSICAL_PS4 — excluded by Josh Set curation pass #13 after endgame adjudication. Only PS4 route is digital-only Hitman HD Enhanced Collection.");
    excludeById(2120,"Hitman: Absolution","NO_QUALIFYING_PHYSICAL_PS4 — excluded by Josh Set curation pass #13 after endgame adjudication. Only PS4 route is digital-only Hitman HD Enhanced Collection.");
    excludeById(2464,"MOP: Operation Cleanup","NO_QUALIFYING_PHYSICAL_PS4 — excluded by Josh Set curation pass #13 after endgame adjudication. PS4 release data shows Store only; no manufactured disc.");
    excludeById(2735,"Talisman: Digital Edition","NO_QUALIFYING_PHYSICAL_PS4 — excluded by Josh Set curation pass #13 after endgame adjudication. Digital storefront PS4 release; no qualifying physical.");
    excludeById(2381,"Ginsei Shogi: Aun Toushin Kongou Raizan","NO_QUALIFYING_ENGLISH_PHYSICAL_PS4 — excluded by Josh Set curation pass #13 under Josh's language rule. Prior language adjudication: text/menu-heavy Japanese; no qualifying English route.");
    excludeById(2403,"Sengoku Basara: Sanada Yukimura-Den","NO_QUALIFYING_ENGLISH_PHYSICAL_PS4 — excluded by Josh Set curation pass #13 under Josh's language rule. Prior language adjudication: no qualifying English route.");
    excludeById(2630,"Kamen Rider: Battride War Creation","NO_QUALIFYING_ENGLISH_PHYSICAL_PS4 — excluded by Josh Set curation pass #13 under Josh's language rule. Prior language adjudication: no qualifying English route.");
    excludeById(2726,"Sengoku Basara 4 Sumeragi","NO_QUALIFYING_ENGLISH_PHYSICAL_PS4 — excluded by Josh Set curation pass #13 under Josh's language rule. Prior language adjudication: no qualifying English route.");
    window.SHELFCHECK_CURATION_JOSH_SET_PASS_V013={excluded,expectedIncluded:2424};
    console.info(`ShelfCheck Josh Set curation pass #13 applied: ${excluded.length} identities excluded; expected denominator 2424 before any later Catlateral replacement decision.`,excluded);
  });
})();
