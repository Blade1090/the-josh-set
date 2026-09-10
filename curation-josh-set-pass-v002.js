// ShelfCheck curation — Josh Set language barrier pass #2. Applies exactly the 9 identities
// Josh reviewed and approved from audit-out/curation-language-barrier-pass-2.json's
// CUT_CANDIDATE list -- no additional exclusions are inferred here from region, Japanese
// title, absence of English metadata, genre, or similarity to these 9.
//
// This is an individually-verified curation list, NOT an automatic rule. Every one of these
// 9 identities was checked for its own specific physical PS4 release's actual language
// support (via direct store-page fetches, boutique/import retailer listings, or credible
// firsthand evidence) and found to have no usable English option while requiring substantial
// language comprehension to meaningfully play (visual novels, narrative-heavy adventures, or
// menu/text-dependent RPGs/sims). Other Japanese/import titles in the census -- including
// ones with Japanese-only physical SKUs that are language-light enough to remain playable, or
// whose identity is satisfied by a sibling English release, or that turned out on
// re-verification to already have a qualifying English physical PS4 product -- are explicitly
// NOT touched by this pass. See audit-out/curation-language-barrier-pass-2.json and its
// correction addendum for the full evidence trail, including why ids 2410, 2645, 2763, and
// 2779 remain INCLUDED.
//
// Reuses the existing set='EXCLUDED' + cleanupReason convention and the same
// registerCensusMutation('exclude', ...) pipeline as curation-josh-set-pass-v001.js and every
// other census-mutating script in this repo. Does not delete any source identity -- each of
// the 9 stays a real row with its real id, just flipped to EXCLUDED with a reason.
(()=>{
  registerCensusMutation('exclude',()=>{
    const find=t=>items.find(x=>norm(x.title)===norm(t));
    const excluded=[];
    const exclude=(title,id,reason)=>{
      const x=find(title);
      if(!x){console.warn(`ShelfCheck curation pass v0.02: expected identity not found, skipped: "${title}" (id ${id})`);return;}
      if(x.id!==id){console.warn(`ShelfCheck curation pass v0.02: id mismatch for "${title}" -- expected ${id}, found ${x.id}. Excluding by title match anyway.`);}
      x.set='EXCLUDED';
      x.cleanupReason=reason;
      excluded.push(x.title);
    };

    // LANGUAGE_BARRIER -- applies only to these 9 individually-verified identities.
    exclude('Dokyusei: Bangin\' Summer CSver',2376,'LANGUAGE_BARRIER — excluded by Josh Set language barrier pass #2. Verified: the physical PS4 CSver disc (catalog PLJM-17345) is Japanese-only -- its own Japan-market product listing describes it plainly as the Japan version with no English mentioned, and independent research confirms no English or Chinese text options exist on this release. A separate, later, digital-only Western "Home Edition" release does include English but is not established to share the CSver disc\'s build. A dating-sim visual novel where reading the narrative is the entire game. See audit-out/curation-language-barrier-pass-2.json.');
    exclude('Hakuouki: Shinkai Fukaden',2384,'LANGUAGE_BARRIER — excluded by Josh Set language barrier pass #2. Verified via direct fetch of the Japanese PS Store product page: no supported languages listed other than Japanese; no western release exists. An otome visual novel where reading branching dialogue is the entire game. See audit-out/curation-language-barrier-pass-2.json.');
    exclude('Shinigami: Shibito Magire',2404,'LANGUAGE_BARRIER — excluded by Josh Set language barrier pass #2. Verified: this identity\'s Japanese PS4 physical release has no English option, and the game\'s western localization ("Spirit Hunter: Death Mark II") exists only on PS5, Switch, and PC -- not PS4 -- so no qualifying English physical PS4 product exists for this identity. A horror visual novel where reading dialogue and clues is the entire game. See audit-out/curation-language-barrier-pass-2.json.');
    exclude('Jinrui No Minasama E',2619,'LANGUAGE_BARRIER — excluded by Josh Set language barrier pass #2. Verified: no English release, store listing, or localization announcement exists anywhere for this Japanese PS4 physical release. A narrative adventure where story comprehension is the core experience. See audit-out/curation-language-barrier-pass-2.json.');
    exclude('Kaleidoscope Of Phantom Prison',2629,'LANGUAGE_BARRIER — excluded by Josh Set language barrier pass #2. Verified: no English localization exists for this 07th Expansion visual novel\'s Japanese PS4 physical release (confirmed distinct from its also-unlocalized sequel). Reading narrative text is the entire gameplay loop. See audit-out/curation-language-barrier-pass-2.json.');
    exclude('Kangokutou Mary Skelter 2',2631,'LANGUAGE_BARRIER — excluded by Josh Set language barrier pass #2. Verified via direct fetch of the Hong Kong PS Store product page: this Asian-region physical release is explicitly Chinese/Korean only, with English not mentioned anywhere. No sibling ShelfCheck identity satisfies this game in English (the only other tracked "Mary Skelter" identity is "Mary Skelter Finale," a different, later game). A dungeon-crawler RPG whose menus, item text, and story require reading comprehension. See audit-out/curation-language-barrier-pass-2.json.');
    exclude('Umineko no Naku Koro ni: Nekobako to Musou no Koukyoukyoku',2744,'LANGUAGE_BARRIER — excluded by Josh Set language barrier pass #2. Verified: no official English localization exists for this Japanese PS4 physical release; the English fan-translation team has stated an official release would require a publisher and is considered very unlikely. A 07th Expansion visual novel where reading branching mystery narrative is the entire game. See audit-out/curation-language-barrier-pass-2.json.');
    exclude('Yo-Kai Watch Jam: Yo-Kai Academy Y',2768,'LANGUAGE_BARRIER — excluded by Josh Set language barrier pass #2. Verified: no English localization has ever been announced for this Japanese PS4 physical release. A narrative school-life RPG whose relationship, quest, and dialogue systems require reading comprehension. See audit-out/curation-language-barrier-pass-2.json.');
    exclude('Idolm@ster Platinum Stars',2610,'LANGUAGE_BARRIER — excluded by Josh Set language barrier pass #2. Verified: no English language option exists for this Japanese PS4 physical release; only unofficial fan translations/guides exist. The core producing/scheduling/relationship-management loop is text- and dialogue-driven -- the rhythm-game segments alone are only part of the experience, so the language-light action/rhythm carve-out does not cover the full title. See audit-out/curation-language-barrier-pass-2.json.');

    window.SHELFCHECK_CURATION_JOSH_SET_PASS_V002={excluded};
    console.info(`ShelfCheck Josh Set language barrier curation pass #2 applied: ${excluded.length} identities excluded`,excluded);
  });
})();
