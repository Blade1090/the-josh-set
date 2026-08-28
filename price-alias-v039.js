// ShelfCheck v0.39 — reviewed PriceCharting pass-2 reconciliation.
// Normalize legacy reviewed keys (apostrophes/punctuation) and add only aliases
// that resolve to one specific Josh identity. Generic PriceCharting matches such
// as Saints Row, Wonder Boy, Construction Simulator, Minecraft, Dusk and Risen
// are intentionally left unmatched rather than guessing.
(()=>{
  if(typeof PC_REVIEWED_ALIASES==='undefined'||typeof pcNormTitle!=='function')return;
  // Some older reviewed keys were written in human-normalized form (e.g. "snoopy s")
  // while lookup uses pcNormTitle ("snoopys"). Make every existing repair canonical.
  for(const [k,id] of [...PC_REVIEWED_ALIASES]) PC_REVIEWED_ALIASES.set(pcNormTitle(k),id);
  const safe={
    "Don't Starve":386,
    "Snoopy's Grand Adventure":1759,
    "DeathSmiles I & II":2259,
    "Teenage Mutant Ninja Turtles: Mutants Unleashed":1330,
    "No More Heroes 3":851,
    "Borderlands [Game of the Year]":198,
    "The Flame in the Flood":1247,
    "Rock of Ages III: Make & Break":1712,
    "Rainbow Six Siege [Advanced Edition]":1336,
    "The Walking Dead: Season Two":1305,
    "Double Switch":395,
    "Slaps and Beans 2":2246,
    "Cities Skylines":248
  };
  for(const [title,id] of Object.entries(safe))PC_REVIEWED_ALIASES.set(pcNormTitle(title),id);
  window.SHELFCHECK_PC_V039={reviewedAliases:PC_REVIEWED_ALIASES.size,unsafeGeneric:['Saints Row','Wonder Boy','Construction Simulator','Minecraft','Dusk','Risen']};
})();
