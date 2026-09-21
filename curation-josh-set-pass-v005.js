// ShelfCheck curation — Josh Set pass #5. Applies exactly 1 identity: Voyage of the Dead.
//
// Josh's curator decision after reviewing the Batch 64 dossier repair: CUT. Voyage of the
// Dead's physical PS4 release requires the proprietary MARS Lightcon + IR Station hardware
// for its core shooting-gallery gameplay -- confirmed during Batch 64 research (see the
// "CRITICAL CAVEAT" note preserved in that identity's dossier, dossier-overrides-64.js). A
// standard PS4/controller setup cannot meaningfully play the game.
//
// New rule this pass introduces: REQUIRED_PROPRIETARY_HARDWARE. Exclude a physical PS4
// release only when its core gameplay requires specialized proprietary hardware beyond
// standard PS4 equipment/controllers, and the game cannot meaningfully be played without
// that hardware. This is intentionally narrow -- it is NOT a blanket peripheral exclusion,
// and does not apply to games that merely optionally support accessories (light guns,
// wheels, etc.) while remaining fully playable on a standard controller. PSVR-required
// remains its own separate, pre-existing exclusion path and is unaffected by this rule.
//
// This is an additive census decision only. Voyage of the Dead's Batch 64 dossier text is
// untouched -- dossier-overrides-64.js is not modified by this pass, per completed-batch
// immutability. Reuses the existing set='EXCLUDED' + cleanupReason convention and the same
// registerCensusMutation('exclude', ...) pipeline as curation-josh-set-pass-v001-004.js.
(()=>{
  registerCensusMutation('exclude',()=>{
    const find=t=>items.find(x=>norm(x.title)===norm(t));
    const excluded=[];
    const exclude=(title,id,reason)=>{
      const x=find(title);
      if(!x){console.warn(`ShelfCheck curation pass v0.05: expected identity not found, skipped: "${title}" (id ${id})`);return;}
      if(x.id!==id){console.warn(`ShelfCheck curation pass v0.05: id mismatch for "${title}" -- expected ${id}, found ${x.id}. Excluding by title match anyway.`);}
      x.set='EXCLUDED';
      x.cleanupReason=reason;
      excluded.push(x.title);
    };

    // REQUIRED_PROPRIETARY_HARDWARE -- applies only to this individually-verified identity.
    exclude('Voyage of the Dead',1407,'REQUIRED_PROPRIETARY_HARDWARE — excluded by Josh Set curation pass #5. Verified: core shooting-gallery gameplay requires the proprietary MARS LIGHTCON + IR STATION peripheral (sold separately); the game cannot be meaningfully played on a standard PS4 controller alone. Curator decision by Josh following the Batch 64 dossier repair. Not a blanket peripheral exclusion -- games that merely optionally support accessories remain unaffected.');

    window.SHELFCHECK_CURATION_JOSH_SET_PASS_V005={excluded};
    console.info(`ShelfCheck Josh Set curation pass #5 applied: ${excluded.length} identities excluded`,excluded);
  });
})();
