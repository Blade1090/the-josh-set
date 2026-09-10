// ShelfCheck curation — Josh Set pass #1. Applies exactly the 18 identities Josh reviewed
// and confirmed in audit-out/curation-verification-pass-1.json (all CONFIRMED, 0 questionable,
// 0 rejected) -- no additional exclusions are inferred here from category, franchise,
// publisher, genre, title, region, or similarity to these 18.
//
// These are personal Josh Set curation calls, not census-eligibility corrections: every one
// of these identities is a real, physical PS4 release that would otherwise stay INCLUDED.
// Same registration pattern as every other census-mutating script: registers into the
// 'exclude' phase, applied once by census-finalize.js after every add-phase script has
// registered and after every other exclude-phase rule in tag order.
//
// HORSE_GAME is an explicit personal preference rule ("Josh has essentially no interest in
// horse-focused games") -- it is not a claim that these games are shovelware or objectively
// low quality. LANGUAGE_BARRIER applies ONLY to the 3 identities below, individually
// verified (no official English text support + the game is materially text/language
// dependent to play); this is not an automatic region/language exclusion mechanism, and
// other Japanese/import titles remain eligible exactly as before this pass.
//
// Reuses the existing set='EXCLUDED' + cleanupReason convention (same fields census-cleanup.js
// and ownership-reconcile-v071.js already use) so existing UI/search/ownership code that reads
// x.set/x.cleanupReason needs no changes. Does not delete any source identity.
(()=>{
  registerCensusMutation('exclude',()=>{
    const find=t=>items.find(x=>norm(x.title)===norm(t));
    const excluded=[];
    const exclude=(title,id,reason)=>{
      const x=find(title);
      if(!x){console.warn(`ShelfCheck curation pass v0.01: expected identity not found, skipped: "${title}" (id ${id})`);return;}
      if(x.id!==id){console.warn(`ShelfCheck curation pass v0.01: id mismatch for "${title}" -- expected ${id}, found ${x.id}. Excluding by title match anyway.`);}
      x.set='EXCLUDED';
      x.cleanupReason=reason;
      excluded.push(x.title);
    };

    // VERY_YOUNG_LICENSED
    exclude('Peppa Pig World Adventures',2694,'VERY_YOUNG_LICENSED — excluded by Josh Set curation pass #1. Josh\'s own hands-on Random Game review found no practical play/collecting value for an adult collector. See audit-out/curation-verification-pass-1.json.');
    exclude('Big Bobby Car: The Big Race',2520,'VERY_YOUNG_LICENSED — excluded by Josh Set curation pass #1. Josh\'s own hands-on Random Game review found no practical play/collecting value for an adult collector. See audit-out/curation-verification-pass-1.json.');
    exclude('PAW Patrol: On a Roll',2678,'VERY_YOUNG_LICENSED — excluded by Josh Set curation pass #1. Verified via multiple critic reviews: targeted at ages 4-6, "repetitive gameplay loop which doesn\'t offer any challenge," and the game literally has no ending. See audit-out/curation-verification-pass-1.json.');

    // GENERIC_SIM
    exclude('Airport Simulator 2019',58,'GENERIC_SIM — excluded by Josh Set curation pass #1. ShelfCheck\'s own existing dossier already concludes "LEAN IGNORE": slow, repetitive work-sim loop with little traditional gameplay payoff. See audit-out/curation-verification-pass-1.json.');
    exclude('Firefighters: The Simulation',494,'GENERIC_SIM — excluded by Josh Set curation pass #1. Josh\'s own hands-on Random Game review found no practical play/collecting value (this identity\'s dossier Quick Summary is separately contaminated and was NOT used as evidence -- see audit-out/curation-verification-pass-1.json).');
    exclude('YouTubers Life 2',2771,'GENERIC_SIM — excluded by Josh Set curation pass #1. Josh\'s own hands-on Random Game review found no practical play/collecting value. See audit-out/curation-verification-pass-1.json.');

    // LOW_VALUE_ACTIVITY
    exclude('Just Sing',2627,'LOW_VALUE_ACTIVITY — excluded by Josh Set curation pass #1. Josh\'s own hands-on Random Game review found no practical play/collecting value. See audit-out/curation-verification-pass-1.json.');
    exclude('WordHunters',1447,'LOW_VALUE_ACTIVITY — excluded by Josh Set curation pass #1. Josh\'s own hands-on Random Game review found no practical play/collecting value (this identity\'s dossier Quick Summary is separately contaminated and was NOT used as evidence -- see audit-out/curation-verification-pass-1.json).');
    exclude('Party Arcade',2689,'LOW_VALUE_ACTIVITY — excluded by Josh Set curation pass #1. Verified via multiple critic reviews: minigames described as "too tedious, too repetitive, or too frustrating," with a grind structure built to push microtransactions. See audit-out/curation-verification-pass-1.json.');

    // LANGUAGE_BARRIER -- applies only to these 3 individually-verified identities.
    exclude('Higurashi no Naku Koro ni Hou',2606,'LANGUAGE_BARRIER — excluded by Josh Set curation pass #1. Verified: no official English text support exists for the PS4 release; the developer has stated the script is too long to feasibly translate. A pure-text visual novel where reading the narrative is the entire game. See audit-out/curation-verification-pass-1.json.');
    exclude('Yoru, Tomosu',2411,'LANGUAGE_BARRIER — excluded by Josh Set curation pass #1. Verified: no official English localization found anywhere; only an unofficial fan translation project exists, confirming the absence of an official one. A horror visual novel where reading the narrative is the entire game. See audit-out/curation-verification-pass-1.json.');
    exclude('Natsuiro High School: Seisyun Hakusyo',2396,'LANGUAGE_BARRIER — excluded by Josh Set curation pass #1. Verified: no official English support; sources confirm a strong grasp of Japanese is necessary to understand the game at all. A narrative/dialogue-driven high-school adventure where text comprehension is materially necessary to play as designed. See audit-out/curation-verification-pass-1.json.');

    // HORSE_GAME -- personal Josh Set preference rule, not a quality judgment.
    exclude('Bibi & Tina at the horse farm',160,'HORSE_GAME — excluded by Josh Set curation pass #1 (personal preference, not a quality judgment: Josh has essentially no interest in horse-focused games). Verified core gameplay: riding 10 named horses across 18 riding missions plus horse-care minigames. See audit-out/curation-verification-pass-1.json.');
    exclude('Barbie: Horse Trails',2512,'HORSE_GAME — excluded by Josh Set curation pass #1 (personal preference, not a quality judgment). Verified core gameplay: riding and caring for an equine companion, grooming and exploring on horseback. See audit-out/curation-verification-pass-1.json.');
    exclude('My Fantastic Ranch',2426,'HORSE_GAME — excluded by Josh Set curation pass #1 (personal preference, not a quality judgment). Verified core gameplay: training and riding horses/unicorns/dragons, giving riding lessons. See audit-out/curation-verification-pass-1.json.');
    exclude('Windstorm',2440,'HORSE_GAME — excluded by Josh Set curation pass #1 (personal preference, not a quality judgment). Verified core gameplay: bonding with, grooming, and riding a horse (Ostwind film franchise). See audit-out/curation-verification-pass-1.json.');
    exclude('Windstorm: An Unexpected Arrival',2441,'HORSE_GAME — excluded by Josh Set curation pass #1 (personal preference, not a quality judgment). Same franchise/reasoning as Windstorm. See audit-out/curation-verification-pass-1.json.');
    exclude('Unicorn Princess',2749,'HORSE_GAME — excluded by Josh Set curation pass #1 (personal preference, not a quality judgment). Verified core gameplay: riding one of six horses; the unicorn/princess framing is a fantasy skin over horse-riding gameplay. See audit-out/curation-verification-pass-1.json.');

    window.SHELFCHECK_CURATION_JOSH_SET_PASS_V001={excluded};
    console.info(`ShelfCheck Josh Set curation pass #1 applied: ${excluded.length} identities excluded`,excluded);
  });
})();
