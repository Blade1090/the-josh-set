// ShelfCheck curation — Josh Set language accessibility pass #3. Applies exactly the 31
// identities Josh reviewed and approved from audit-out/language-accessibility-pass-3.json's
// CUT_CANDIDATE list (29) plus the two MANUAL_REVIEW identities Josh resolved as CUT
// (Genkai Tokki: Castle Panzers, Kyoei Toshi) -- no additional exclusions are inferred here
// from region, Japanese title, genre, or similarity to these 31. The third MANUAL_REVIEW
// identity, Sengoku Basara: Sanada Yukimura-Den, was explicitly resolved KEEP and is not
// touched by this pass.
//
// This is an individually-verified curation list, NOT an automatic rule. Every one of these
// 31 identities was checked for its own specific physical PS4 release's actual language
// support (via existing researched dossier evidence, cross-checked externally where the
// dossier text was ambiguous) and found to have no usable English option while requiring
// substantial language comprehension to meaningfully play (visual novels, narrative/detective
// adventures, RPGs with heavy text systems, TCG card-battlers, a rules-heavy board game, or --
// for the two manual-review cases -- action/survival games where menu/story comprehension was
// judged to matter enough to cut). Other Japanese/import titles investigated in this same pass
// remain eligible exactly as documented in audit-out/language-accessibility-pass-3.json,
// including false positives where an English physical PS4 release already exists (e.g. Final
// Fantasy Type-0 HD, Like a Dragon: Ishin!), genre-carve-out keeps (fighters, shmups, vehicle
// action), and confirmed-English imports (Headliner: NoviNews, Tantei Bokumetsu / Process of
// Elimination, Bullet Girls Phantasia, Buried Stars).
//
// Reuses the existing set='EXCLUDED' + cleanupReason convention and the same
// registerCensusMutation('exclude', ...) pipeline as curation-josh-set-pass-v001.js and
// curation-josh-set-pass-v002.js. Does not delete any source identity -- each of the 31 stays
// a real row with its real id, just flipped to EXCLUDED with a reason.
(()=>{
  registerCensusMutation('exclude',()=>{
    const find=t=>items.find(x=>norm(x.title)===norm(t));
    const excluded=[];
    const exclude=(title,id,reason)=>{
      const x=find(title);
      if(!x){console.warn(`ShelfCheck curation pass v0.03: expected identity not found, skipped: "${title}" (id ${id})`);return;}
      if(x.id!==id){console.warn(`ShelfCheck curation pass v0.03: id mismatch for "${title}" -- expected ${id}, found ${x.id}. Excluding by title match anyway.`);}
      x.set='EXCLUDED';
      x.cleanupReason=reason;
      excluded.push(x.title);
    };

    // LANGUAGE_BARRIER -- applies only to these 31 individually-verified identities.
    exclude('Jinki Resurrection',2056,'LANGUAGE_BARRIER — excluded by Josh Set language accessibility pass #3. Verified: Japanese-only PS4 release with no confirmed English text or subtitle option. A mech-piloting visual novel where reading is the entire game. See audit-out/language-accessibility-pass-3.json.');
    exclude('Akatsuki Yureru Koi Akari',2372,'LANGUAGE_BARRIER — excluded by Josh Set language accessibility pass #3. Verified: entirely in Japanese with no official English localization. A romance visual novel where reading the narrative is the entire game. See audit-out/language-accessibility-pass-3.json.');
    exclude('Ambitious Mission',2373,'LANGUAGE_BARRIER — excluded by Josh Set language accessibility pass #3. Verified: no English localization exists; playable only by those able to read Japanese text throughout its scenario. A Saga Planets romance visual novel. See audit-out/language-accessibility-pass-3.json.');
    exclude('Asatsugutori',2374,'LANGUAGE_BARRIER — excluded by Josh Set language accessibility pass #3. Verified: Japanese-only text with no official English patch. A narrative time-loop puzzle-adventure where comprehension is materially necessary. See audit-out/language-accessibility-pass-3.json.');
    exclude('Everlasting Flowers',2377,'LANGUAGE_BARRIER — excluded by Josh Set language accessibility pass #3. Verified: no English localization exists for this Japanese-only release. A cinematic visual novel where reading the text is the entire game. See audit-out/language-accessibility-pass-3.json.');
    exclude('Fuyu Kiss',2379,'LANGUAGE_BARRIER — excluded by Josh Set language accessibility pass #3. Verified: Japanese-only text despite region-free hardware compatibility. A bishoujo romance visual novel. See audit-out/language-accessibility-pass-3.json.');
    exclude('GoHELLgo',2382,'LANGUAGE_BARRIER — excluded by Josh Set language accessibility pass #3. Verified: Japanese-only text release requiring reading fluency. A syndicate-management sim/tactics hybrid where running the business and reading tactical text is core. See audit-out/language-accessibility-pass-3.json.');
    exclude('Maitetsu: Pure Station',2391,'LANGUAGE_BARRIER — excluded by Josh Set language accessibility pass #3. Verified: Japanese-only release with no Western localization. A railway-restoration romance adventure where narrative comprehension is core. See audit-out/language-accessibility-pass-3.json.');
    exclude('Megaton Musashi',2393,'LANGUAGE_BARRIER — excluded by Josh Set language accessibility pass #3. Verified: Japanese-only release with no Western localization; its free-to-play spin-off reached the West only digitally, which does not satisfy the physical-release identity rule. A mecha RPG. See audit-out/language-accessibility-pass-3.json.');
    exclude('Musicus',2395,'LANGUAGE_BARRIER — excluded by Josh Set language accessibility pass #3. Verified: neither this PS4 port nor the original PC release received English localization. A music-themed visual novel. See audit-out/language-accessibility-pass-3.json.');
    exclude('PriministAr',2398,'LANGUAGE_BARRIER — excluded by Josh Set language accessibility pass #3. Verified: Japanese-only release with no Western localization. A school romance visual novel. See audit-out/language-accessibility-pass-3.json.');
    exclude('Raspberry Cube',2400,'LANGUAGE_BARRIER — excluded by Josh Set language accessibility pass #3. Verified: no official English localization for Western players. A slice-of-life romance visual novel. See audit-out/language-accessibility-pass-3.json.');
    exclude('Rewrite',2401,'LANGUAGE_BARRIER — excluded by Josh Set language accessibility pass #3. Verified: Japanese-only release with no Western localization; full engagement with its dense branching narrative requires Japanese fluency. A Key visual novel. See audit-out/language-accessibility-pass-3.json.');
    exclude('Saiaku Naru Saiyaku Ningen Ni Sasagu',2402,'LANGUAGE_BARRIER — excluded by Josh Set language accessibility pass #3. Verified: Japanese-only release with no Western localization. A 40-50 hour tragic novel-adventure where reading is the entire game. See audit-out/language-accessibility-pass-3.json.');
    exclude('Strawberry Nauts',2405,'LANGUAGE_BARRIER — excluded by Josh Set language accessibility pass #3. Verified: Japanese-only text release with no official English localization. A romance visual novel. See audit-out/language-accessibility-pass-3.json.');
    exclude('Sugar Style',2406,'LANGUAGE_BARRIER — excluded by Josh Set language accessibility pass #3. Verified: Japanese-only text with no Western localization. A bishoujo romance visual novel. See audit-out/language-accessibility-pass-3.json.');
    exclude('Aerial Life',2477,'LANGUAGE_BARRIER — excluded by Josh Set language accessibility pass #3. Verified: all in-game text is in Japanese, limiting accessibility for non-Japanese-reading players. A slice-of-life simulation. See audit-out/language-accessibility-pass-3.json.');
    exclude('Battle Spirits: Connected Battlers',2514,'LANGUAGE_BARRIER — excluded by Josh Set language accessibility pass #3. Verified: no English localization; a trading-card battler requiring reading card text/effects to play meaningfully. See audit-out/language-accessibility-pass-3.json.');
    exclude('Bokuhime Project',2531,'LANGUAGE_BARRIER — excluded by Josh Set language accessibility pass #3. Verified: no English found in any source. An adventure/visual novel with dating-sim stat-raising mechanics (not primarily a rhythm game, despite ShelfCheck\'s own dossier framing -- flagged separately as a future dossier-accuracy correction, not addressed by this pass). See audit-out/language-accessibility-pass-3.json.');
    exclude('Cardfight Vanguard EX',2547,'LANGUAGE_BARRIER — excluded by Josh Set language accessibility pass #3. Verified: Japan-only release with no official English localization, requiring comfort navigating Japanese-language menus. A trading-card battler. See audit-out/language-accessibility-pass-3.json.');
    exclude('Itadaki Street: Dragon Quest and Final Fantasy 30th Anniversary',2618,'LANGUAGE_BARRIER — excluded by Josh Set language accessibility pass #3. Verified: Japan-only release with heavy text-based menus requiring Japanese fluency for its board-game rules and dialogue. See audit-out/language-accessibility-pass-3.json.');
    exclude('Karumaruka Circle',2632,'LANGUAGE_BARRIER — excluded by Josh Set language accessibility pass #3. Verified: Japanese-only release with no official English localization. A romance visual novel. See audit-out/language-accessibility-pass-3.json.');
    exclude('Kin\'Iro Loveriche',2635,'LANGUAGE_BARRIER — excluded by Josh Set language accessibility pass #3. Verified: Japanese-only PS4 release with no official English localization. A romance visual novel. See audit-out/language-accessibility-pass-3.json.');
    exclude('Kin\'iro Loveriche: Golden Time',2636,'LANGUAGE_BARRIER — excluded by Josh Set language accessibility pass #3. Verified: Japanese-only release with no official English localization. A romance visual novel fandisc. See audit-out/language-accessibility-pass-3.json.');
    exclude('Laid-Back Camp: Have A Nice Day!',2644,'LANGUAGE_BARRIER — excluded by Josh Set language accessibility pass #3. Verified: Japan-only release; a largely text-driven visual novel with light simulation elements. See audit-out/language-accessibility-pass-3.json.');
    exclude('Omega Labyrinth Z',2670,'LANGUAGE_BARRIER — excluded by Josh Set language accessibility pass #3. Verified: Western release was cancelled outright and no English exists anywhere; a dungeon-crawler RPG whose item/stat/dialogue systems require reading. See audit-out/language-accessibility-pass-3.json.');
    exclude('Parfait Remake',2688,'LANGUAGE_BARRIER — excluded by Josh Set language accessibility pass #3. Verified: Japan-only text release. A dating-adventure visual novel. See audit-out/language-accessibility-pass-3.json.');
    exclude('Satsujin Tantei Jack The Ripper',2721,'LANGUAGE_BARRIER — excluded by Josh Set language accessibility pass #3. Verified: Japanese-only release with no official English localization; full comprehension of its mystery plotting requires Japanese fluency. A detective adventure. See audit-out/language-accessibility-pass-3.json.');
    exclude('Yo-kai Watch 4++',2769,'LANGUAGE_BARRIER — excluded by Josh Set language accessibility pass #3. Verified: remains a Japanese-only import with no official English localization anywhere. A mainline narrative RPG. See audit-out/language-accessibility-pass-3.json.');
    exclude('Genkai Tokki: Castle Panzers',2380,'LANGUAGE_BARRIER — excluded by Josh Set language accessibility pass #3 (resolved from MANUAL REVIEW). Verified: Japanese-language release with no official English patch; despite some English-friendly menus, full story comprehension requires Japanese fluency. A mech-and-heroine action game. See audit-out/language-accessibility-pass-3.json.');
    exclude('Kyoei Toshi',2388,'LANGUAGE_BARRIER — excluded by Josh Set language accessibility pass #3 (resolved from MANUAL REVIEW). Verified: Japanese-only release with no English menu option; meaningful play of its disaster-survival resource-management loop requires navigating Japanese menus. See audit-out/language-accessibility-pass-3.json.');

    window.SHELFCHECK_CURATION_JOSH_SET_PASS_V003={excluded};
    console.info(`ShelfCheck Josh Set language accessibility curation pass #3 applied: ${excluded.length} identities excluded`,excluded);
  });
})();
