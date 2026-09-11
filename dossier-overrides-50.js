// ShelfCheck dossier fix — batch 50. Corrects a dossier-matching bug found during the Josh
// Set language accessibility pass #4: id 1388 "Utawarerumono Zan" was resolving (via alias
// fallback in dossierFor()) to the dossier for the unrelated base visual novel "Utawarerumono:
// Prelude to the Fallen" (id 1391). Zan is a distinct census identity -- a Musou-style action
// spin-off, not the original tactical-RPG visual novel -- so it needs its own dossier entry.
// Adding a direct entry keyed to its exact census title here makes dossierFor() match it
// directly, bypassing the incorrect alias fallback (see dossiers.js's dossierFor: a direct
// DOSSIERS.get(norm(x.title)) hit is always checked before any alias lookup).
const DOSSIER_OVERRIDES_50 = [
{t:"Utawarerumono Zan",s:"A Musou-style action spin-off set in the Utawarerumono world: playing as Haku and other series characters, you cut through massed battlefield enemies with Dynasty Warriors-style combat rather than the main series' tactical-RPG/visual-novel format.",w:"A legitimate, well-received genre pivot for the series -- large-scale battlefield action with real production values, developed by Tamsoft (the Senran Kagura/Onechanbara action specialists) under Aquaplus's supervision.",c:"The story content leans on prior knowledge of Mask of Deception/Mask of Truth, and as a Musou title the mission structure and enemy variety can grow repetitive over a full playthrough.",r:"BUY / MAYBE. A solid pickup for Utawarerumono fans wanting a different, more action-focused take on the setting.",b:"NIS America published a physical PS4 release in North America and Europe (Sept 10, 2019); fully English, reusing English dialogue from Mask of Deception.",p:"MAYBE — good action spin-off for series fans, fully playable in English."},
];
