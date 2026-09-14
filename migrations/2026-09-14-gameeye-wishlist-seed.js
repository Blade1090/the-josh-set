// ShelfCheck ONE-TIME migration: seed the existing Wishlist feature (wishlist-v001.js) from
// Josh's GameEye combined export dated 2026-09-14 (2026_09_14_ge_collection.csv).
//
// This is NOT a GameEye Wishlist importer and is NOT wired into index.html/sw.js -- it is never
// fetched, precached, or loaded by the running app. It is meant to be run exactly once, by hand,
// in the browser console on the live ShelfCheck page (after the page has finished loading, so
// wishlist-v001.js's addWishlist/isWishlisted/window.SHELFCHECK_WISHLIST already exist): paste
// this whole file into DevTools console and press Enter. It is safe to paste more than once --
// see idempotency notes below -- but there is no reason to keep it around afterward; delete this
// file (and stop referencing it) once it has been run against the real browser state it targets.
//
// Reconciliation of the 141 PS4 Wishlist rows in that export against the current ShelfCheck
// INCLUDED census was performed with tools/gameeye-wishlist-audit.mjs (automatic, exact-match
// only -- 128 rows) plus 13 titles Josh explicitly resolved by hand where the automatic exact
// match found nothing safe to assume (see tools/gameeye-wishlist-reconcile.mjs's
// EXPLICIT_OVERRIDES for the full paper trail of GameEye title -> chosen identity id/title).
// Nothing here changes census membership, OWNED/NEEDED status, or normal GameEye ownership
// reconciliation -- it only ever calls the real, existing addWishlist(id).
(() => {
  // isWishlisted/addWishlist are private to wishlist-v001.js's own IIFE and only reachable via
  // window.* (the same cross-file convention every other add-on in this codebase uses to call
  // into wishlist-v001.js, e.g. fun-features-v103.js's window.renderRandomWishlistToggle) --
  // effectiveStatus/byId are true top-level globals (model-fix.js/app.js), so those are fine bare.
  if (typeof window === 'undefined' || typeof window.addWishlist !== 'function' || typeof window.isWishlisted !== 'function' || typeof effectiveStatus !== 'function' || typeof byId === 'undefined') {
    console.error('GameEye Wishlist seed: ShelfCheck has not finished loading yet (window.addWishlist/window.isWishlisted/effectiveStatus/byId not found). Reload the page, wait for it to finish loading, then paste this again.');
    return;
  }

  // id -> GameEye title, for the audit trail. Skipping an OWNED identity is expected and correct
  // (Wishlist is "want to hunt", not ownership) -- see ownership-transition auto-removal in
  // wishlist-v001.js, which this migration deliberately mirrors instead of duplicating.
  const SEED = [
    [7, '2064: Read Only Memories'], [11, '428: Shibuya Scramble'], [23, 'A Way Out'],
    [49, 'Aggelos'], [51, 'AI: The Somnium Files'], [64, 'Alien: Isolation'], [65, 'Alienation'],
    [75, 'Anima: Gate of Memories'], [107, 'Assault Suit Leynos'], [175, 'Blair Witch'],
    [188, 'Bloodroots'], [189, 'Bloodstained: Curse of the Moon'], [190, 'Bloodstained: Curse of the Moon 2'],
    [205, 'Broforce'], [211, 'Bug Fables: The Everlasting Sapling'], [214, 'Caladrius Blaze'],
    [252, 'Cloudpunk'], [284, 'Crystar'], [293, 'Danganronpa Another Episode: Ultra Despair Girls'],
    [313, 'Darkwood'], [317, 'Days Gone'], [347, 'Deliver Us The Moon'],
    [370, 'Disaster Report 4: Summer Memories'], [419, 'Dusk Diver'], [426, 'Earth Defense Force 5'],
    [437, 'Elliot Quest'], [474, "Fell Seal: Arbiter's Mark"], [476, "Fight'N Rage"],
    [501, 'For the King'], [532, "Giana Sisters: Twisted Dreams - Director's Cut"], [549, 'Gravity Rush 2'],
    [556, 'GRIS'], [610, 'Hyper Light Drifter'], [613, 'Iconoclasts'], [645, 'Journey'],
    [647, 'Judgment'], [657, 'Kentucky Route Zero: TV Edition'], [714, 'Lethal League'],
    [717, 'Life is Strange'], [718, 'Life is Strange 2'], [732, 'Lovers in a Dangerous Spacetime'],
    [741, 'Maid of Sker'], [790, 'Monster Boy and the Cursed Kingdom'], [801, 'Mothergunship'],
    [876, 'ONRUSH'], [882, 'Outer Wilds'], [889, 'Owlboy'], [947, 'Rabi-Ribi'], [957, 'Rain World'],
    [975, 'Republique'], [987, 'Return of the Obra Dinn'], [1006, 'Road Redemption'],
    [1016, 'Rogue Legacy'], [1030, 'Sakura Wars'], [1040, 'Sayonara Wild Hearts'],
    [1054, 'Shadow Complex Remastered'], [1081, 'Skully'], [1092, 'Slime-san: Superslime Edition'],
    [1164, 'Streets of Rage 4'], [1166, 'Styx: Shards of Darkness'],
    [1205, 'Tearaway Unfolded: Crafted Edition'], [1207, 'Tekken 7'],
    [1214, '25th Ward: The Silver Case'], [1230, 'Council'], [1242, 'End is Nigh'],
    [1250, 'House in Fata Morgana'], [1261, 'Last of Us Part II'], [1276, 'Messenger'],
    [1288, 'The Sexy Brutale'], [1290, 'Silver Case'], [1297, 'Swapper'], [1298, 'Swindle'],
    [1300, 'Talos Principle: Deluxe Edition'], [1322, 'Thomas Was Alone'], [1355, 'Transistor'],
    [1404, 'Void Bastards'], [1408, 'Wandersong'], [1425, 'Wasteland 3'], [1466, 'Yaga'],
    [1473, 'Yakuza Kiwami 2'], [1487, 'Ziggurat'], [1492, 'ANNO: Mutationem'],
    [1493, 'Apsulov: End of Gods'], [1494, 'Astalon: Tears of the Earth'], [1495, 'Ayo the Clown'],
    [1496, 'Blacksea Odyssey'], [1497, 'Chants of Sennaar'], [1498, "Deadlight: Director's Cut"],
    [1499, 'Dex'], [1500, 'Eternights'], [1501, 'Evil West'],
    [1502, 'F.I.S.T.: Forged In Shadow Torch'], [1503, 'Firewatch'], [1504, 'Frogun'],
    [1506, 'Ghost Trick: Phantom Detective'], [1507, 'Ghostrunner'], [1508, 'Gori: Cuddly Carnage'],
    [1509, 'Gundam Breaker 3'], [1510, 'Headlander'], [1511, 'Hue'], [1512, 'Ikenfell'],
    [1513, 'It Takes Two'], [1514, 'Kholat'], [1515, 'Late Shift'], [1516, 'Lies of P'],
    [1517, 'Like a Dragon: Ishin!'], [1518, 'Like A Dragon: Pirate Yakuza in Hawaii'],
    [1519, 'Martha Is Dead'], [1520, 'NEO: The World Ends With You'], [1521, 'Nex Machina'],
    [1522, 'Paradise Killer'], [1523, 'Promenade'], [1524, 'Romancing SaGa 2: Revenge of the Seven'],
    [1525, 'Ryuu ga Gotoku 7 Gaiden: Na o Keshita Otoko'], [1526, 'Samurai Jack: Battle Through Time'],
    [1527, 'Seven: Enhanced Edition'], [1528, 'Sifu [Vengeance Edition]'], [1529, 'Signalis'],
    [1530, 'Slain: Back from Hell'], [1531, 'Source of Madness'], [1532, 'Steel Rats'],
    [1533, 'Sword And Fairy: Together Forever'], [1534, 'Ascent'], [1535, 'Caligula Effect 2'],
    [1536, 'DioField Chronicle'], [1537, 'Forgotten City'], [1538, 'Wild at Heart'],
    [1539, 'This War of Mine: The Little Ones'], [1540, 'Tokyo 42'], [1541, 'Typoman: Revised'],
    [1542, 'Unsighted'], [1543, 'VA-11 Hall-A: Cyberpunk Bartender Action'], [1544, 'Weird West'],
    [1545, 'West of Dead'], [1546, 'World of Horror'], [1547, 'Wuppo'], [1548, 'Yakuza: Like A Dragon'],
    [1549, 'Yomawari: Lost in the Dark [Deluxe Edition]'], [1609, 'Dusk Diver 2'],
    [1750, 'Count Lucanor [Signature Edition]'], [1955, 'Ghost 1.0'],
  ];

  let added = 0, alreadyWishlisted = 0, skippedOwned = 0, unknownId = 0;
  const addedTitles = [], skippedOwnedTitles = [], unknownIds = [];
  for (const [id, gameEyeTitle] of SEED) {
    const x = byId.get(id);
    if (!x) { unknownId++; unknownIds.push([id, gameEyeTitle]); continue; }
    if (effectiveStatus(x) === 'OWNED') { skippedOwned++; skippedOwnedTitles.push(x.title); continue; }
    if (window.isWishlisted(id)) { alreadyWishlisted++; continue; }
    window.addWishlist(id);
    added++; addedTitles.push(x.title);
  }

  console.log(`GameEye Wishlist seed (2026-09-14): ${SEED.length} reconciled identities -> ${added} added, ${alreadyWishlisted} already wishlisted, ${skippedOwned} skipped (already OWNED), ${unknownId} unknown id(s).`);
  if (added) console.log('Added:', addedTitles);
  if (skippedOwned) console.log('Skipped (already OWNED):', skippedOwnedTitles);
  if (unknownId) console.warn('Unknown id(s) -- census may have changed since this migration was written:', unknownIds);
})();
