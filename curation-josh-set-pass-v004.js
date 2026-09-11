// ShelfCheck curation — Josh Set language accessibility pass #4.
//
// Josh named 5 CUT candidates from Claude's prior-turn dossier-text scan: 428: Shibuya
// Scramble (11), Hakoniwa Company Works (2383), Tantei Bokumetsu (2407), Aikano: Yukizora No
// Triangle (2478), Buried Stars (2541). Before applying any exclusion, each was independently
// re-verified against external sources (not just the in-repo dossier text, which turned out to
// be stale/incomplete for three of the five). Only 2 of the 5 held up:
//
//   EXCLUDED (confirmed no English release exists anywhere):
//     - Hakoniwa Company Works (2383): Nippon Ichi Software tactical RPG, Japan-only,
//       no official English localization for the PS4 version (confirmed via GameFAQs release
//       data and retailer listings -- Japanese-only import).
//     - Aikano: Yukizora No Triangle (2478): Entergram romance visual novel, Japan-only
//       physical PS4 release (Oct 29, 2020), no English localization announced or released.
//
//   NOT excluded -- reversed from Claude's prior-turn recommendation, verified English exists:
//     - 428: Shibuya Scramble (11): Spike Chunsoft released a full English-localized PS4
//       physical retail release in North America Sept 4, 2018 (Amazon/GameStop listings,
//       published by Sega of America). The census dossier's ambiguous "import and region
//       differences matter" phrasing was misread as a language gap in the prior pass; it was
//       not one.
//     - Tantei Bokumetsu (2407): Localized in English by NIS America as "Process of
//       Elimination," released physically on PS4 in North America April 11, 2023 (Standard +
//       Deluxe Edition, confirmed for sale at GameStop/NISA store/Rarewaves). This matches
//       audit-out/language-accessibility-pass-3.json's own prior identityRuleNote on this exact
//       identity, which already concluded KEEP -- the prior-turn dossier scan re-flagged it
//       without checking that existing research.
//     - Buried Stars (2541): The Korea-exclusive physical PS4 disc supports selectable English
//       subtitles alongside Korean/Japanese/Chinese (Gematsu, Amazon "English Supports"
//       listing, multiple retailer listings). Also already KEEP in
//       audit-out/language-accessibility-pass-3.json for the same reason.
//
// Sengoku Basara: Sanada Yukimura-Den (2403) was named by Josh as "move to research pile, not
// excluded yet." It was already resolved KEEP once before, in pass 3's MANUAL_REVIEW (see
// audit-out/language-accessibility-pass-3.json), on the reasoning that it's still fundamentally
// a hack-and-slash musou game even though its distinguishing narrative content is
// Japanese-only. Fresh research this pass (GameFAQs player report: "as I don't know Japanese I
// wont be able to follow the story") confirms the story is inaccessible but did not turn up any
// evidence that menu navigation or core combat play is blocked -- only that the story is. That
// is not new/stronger evidence than what pass 3 already had, so no exclusion is applied here;
// it remains INCLUDED pending either stronger play-blocking evidence or a direct judgment call
// from Josh on narrative-only inaccessibility. See audit-out/language-accessibility-pass-4.json.
//
// Also resolved this pass (see audit-out/language-accessibility-pass-4.json for full sourcing):
// Venus Vacation Prism: Dead Or Alive Xtreme (2754) confirmed KEEP -- the Asian-region PS4/PS5
// physical release has a selectable English text option (Noisy Pixel, PlayStation Store
// listing, Amazon "English in Game" listing). Utawarerumono Zan (1388) confirmed KEEP -- a
// legitimate NISA-published English PS4 release (Sept 10, 2019), and independently an
// action/musou game under the existing genre carve-out; its dossier is fixed separately in
// dossier-overrides-50.js. Quintessential Quintuplets Fives Memories With You (2696) and
// Get Star / Guardian (2471) remain unresolved -- insufficient evidence either way -- and stay
// INCLUDED without a decision, per "wrong cut is worse than no cut."
//
// Reuses the existing set='EXCLUDED' + cleanupReason convention and the same
// registerCensusMutation('exclude', ...) pipeline as curation-josh-set-pass-v001/002/003.js.
(()=>{
  registerCensusMutation('exclude',()=>{
    const find=t=>items.find(x=>norm(x.title)===norm(t));
    const excluded=[];
    const exclude=(title,id,reason)=>{
      const x=find(title);
      if(!x){console.warn(`ShelfCheck curation pass v0.04: expected identity not found, skipped: "${title}" (id ${id})`);return;}
      if(x.id!==id){console.warn(`ShelfCheck curation pass v0.04: id mismatch for "${title}" -- expected ${id}, found ${x.id}. Excluding by title match anyway.`);}
      x.set='EXCLUDED';
      x.cleanupReason=reason;
      excluded.push(x.title);
    };

    // LANGUAGE_BARRIER -- applies only to these 2 individually-verified identities. Both
    // confirmed to have no English release anywhere via external sourcing, not just dossier
    // text. See audit-out/language-accessibility-pass-4.json.
    exclude('Hakoniwa Company Works',2383,'LANGUAGE_BARRIER — excluded by Josh Set language accessibility pass #4. Verified: Nippon Ichi Software tactical RPG, Japan-only PS4 release (July 13, 2017) with no official English localization anywhere; comprehension of its tactical-RPG systems and story requires Japanese fluency. See audit-out/language-accessibility-pass-4.json.');
    exclude('Aikano: Yukizora No Triangle',2478,'LANGUAGE_BARRIER — excluded by Josh Set language accessibility pass #4. Verified: Entergram romance visual novel, Japan-only PS4 release (Oct 29, 2020) with no English localization announced or released; the entire game is text-driven visual-novel gameplay. See audit-out/language-accessibility-pass-4.json.');

    window.SHELFCHECK_CURATION_JOSH_SET_PASS_V004={excluded};
    console.info(`ShelfCheck Josh Set language accessibility curation pass #4 applied: ${excluded.length} identities excluded`,excluded);
  });
})();
