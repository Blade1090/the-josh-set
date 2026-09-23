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
//       no official English localization for the PS4 version.
//     - Aikano: Yukizora No Triangle (2478): Entergram romance visual novel, Japan-only
//       physical PS4 release, no English localization.
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
    exclude('Hakoniwa Company Works',2383,'LANGUAGE_BARRIER — excluded by Josh Set language accessibility pass #4. Verified: Nippon Ichi Software tactical RPG, Japan-only PS4 release with no official English localization anywhere; comprehension of its tactical-RPG systems and story requires Japanese fluency.');
    exclude('Aikano: Yukizora No Triangle',2478,'LANGUAGE_BARRIER — excluded by Josh Set language accessibility pass #4. Verified: Entergram romance visual novel, Japan-only PS4 release with no English localization announced or released; the entire game is text-driven visual-novel gameplay.');
    window.SHELFCHECK_CURATION_JOSH_SET_PASS_V004={excluded};
    console.info(`ShelfCheck Josh Set language accessibility curation pass #4 applied: ${excluded.length} identities excluded`,excluded);
  });
})();

// ShelfCheck curation — physical-legitimacy correction pass #13 (2026-09-23).
(()=>{
  registerCensusMutation('exclude',()=>{
    const find=t=>items.find(x=>norm(x.title)===norm(t));
    const excluded=[];
    const exclude=(title,id,reason)=>{
      const x=find(title);
      if(!x){console.warn(`ShelfCheck physical correction pass #13: expected identity not found, skipped: "${title}" (id ${id})`);return;}
      if(x.id!==id)console.warn(`ShelfCheck physical correction pass #13: id mismatch for "${title}" -- expected ${id}, found ${x.id}. Excluding by title match anyway.`);
      x.set='EXCLUDED';
      x.cleanupReason=reason;
      excluded.push(x.title);
    };
    exclude('101 Ways to Die',3,'NO_QUALIFYING_PHYSICAL — corrected from NO_RELIABLE_DATA after fresh physical-legitimacy re-audit. Sony PlayStation Blog listed the PS4 launch explicitly as DIGITAL and GameFAQs release data lists PlayStation Store distribution only; no qualifying PS4 disc SKU was verified.');
    exclude('CastleStorm: Definitive Edition',232,'NO_QUALIFYING_PHYSICAL — corrected from NO_RELIABLE_DATA after fresh physical-legitimacy re-audit. Official PlayStation Blog launch coverage directs the PS4 release to PlayStation Store; no manufactured PS4 disc SKU was verified.');
    exclude('DISTRAINT: Deluxe Edition',378,'NO_QUALIFYING_PHYSICAL — corrected from NO_RELIABLE_DATA after fresh physical-legitimacy re-audit. Official PS Store identifies the PS4/Vita release as Cross-Buy download software and no manufactured PS4 disc SKU was verified; known physical DISTRAINT releases are on other platforms.');
    window.SHELFCHECK_CURATION_PHYSICAL_CORRECTION_V013={excluded};
    console.info(`ShelfCheck physical-legitimacy correction pass #13 applied: ${excluded.length} identities excluded`,excluded);
  });
})();

// ShelfCheck curation — physical-legitimacy correction pass #14 (2026-09-23).
(()=>{
  registerCensusMutation('exclude',()=>{
    const find=t=>items.find(x=>norm(x.title)===norm(t));
    const excluded=[];
    const exclude=(title,id,reason)=>{
      const x=find(title);
      if(!x){console.warn(`ShelfCheck physical correction pass #14: expected identity not found, skipped: "${title}" (id ${id})`);return;}
      if(x.id!==id)console.warn(`ShelfCheck physical correction pass #14: id mismatch for "${title}" -- expected ${id}, found ${x.id}. Excluding by title match anyway.`);
      x.set='EXCLUDED';
      x.cleanupReason=reason;
      excluded.push(x.title);
    };
    exclude('Hard West Ultimate Edition',569,'NO_QUALIFYING_PHYSICAL — corrected from NO_RELIABLE_DATA after fresh physical-legitimacy re-audit. GameFAQs release data lists PS4 distribution through PlayStation Store in US/EU/AU; no manufactured PS4 disc SKU was verified.');
    exclude("Qubit's Quest",945,'NO_QUALIFYING_PHYSICAL — corrected from NO_RELIABLE_DATA after fresh physical-legitimacy re-audit. Sony PlayStation Blog explicitly listed Qubit’s Quest as PS4 Digital; no qualifying PS4 disc SKU was verified.');
    exclude("Slayaway Camp: Butcher's Cut",1088,'NO_QUALIFYING_PHYSICAL — corrected from NO_RELIABLE_DATA after fresh physical-legitimacy re-audit. PS4 release data lists PlayStation Store distribution and the proposed Physicality Games physical release as canceled.');
    exclude('Stranded Deep',1154,'NO_QUALIFYING_PHYSICAL — corrected from NO_RELIABLE_DATA after fresh physical-legitimacy re-audit. Developer/community confirmation states the PS4 version is digital only; later physical retail announcements are for Switch.');
    exclude('Surgeon Simulator: Anniversary Edition',1187,'NO_QUALIFYING_PHYSICAL — corrected from NO_RELIABLE_DATA after fresh physical-legitimacy re-audit. PS4 Anniversary Edition release data lists PlayStation Store distribution in US/EU/AU; no qualifying PS4 disc SKU was verified.');
    window.SHELFCHECK_CURATION_PHYSICAL_CORRECTION_V014={excluded};
    console.info(`ShelfCheck physical-legitimacy correction pass #14 applied: ${excluded.length} identities excluded`,excluded);
  });
})();

// ShelfCheck curation — physical-legitimacy correction pass #15 (2026-09-23).
// Final two false-NRD rows from the full bucket re-audit.
(()=>{
  registerCensusMutation('exclude',()=>{
    const find=t=>items.find(x=>norm(x.title)===norm(t));
    const excluded=[];
    const exclude=(title,id,reason)=>{
      const x=find(title);
      if(!x){console.warn(`ShelfCheck physical correction pass #15: expected identity not found, skipped: "${title}" (id ${id})`);return;}
      if(x.id!==id)console.warn(`ShelfCheck physical correction pass #15: id mismatch for "${title}" -- expected ${id}, found ${x.id}. Excluding by title match anyway.`);
      x.set='EXCLUDED';
      x.cleanupReason=reason;
      excluded.push(x.title);
    };
    exclude('Tetsudou Nippon! Rosen Tabi: Eizan Densha-Hen',2408,'NO_QUALIFYING_PHYSICAL — corrected from NO_RELIABLE_DATA after full physical-legitimacy re-audit. The PS4 route resolves to digital software; physical packaging found for this title/series is on other platforms, and no manufactured qualifying PS4 disc SKU was verified.');
    exclude('Marooners',2424,'NO_QUALIFYING_PHYSICAL — corrected from NO_RELIABLE_DATA after full physical-legitimacy re-audit. PS4 release resolves to PlayStation Store distribution and no manufactured qualifying PS4 disc SKU was verified.');
    window.SHELFCHECK_CURATION_PHYSICAL_CORRECTION_V015={excluded};
    console.info(`ShelfCheck physical-legitimacy correction pass #15 applied: ${excluded.length} identities excluded`,excluded);
  });
})();
