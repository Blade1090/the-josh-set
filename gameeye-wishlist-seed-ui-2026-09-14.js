// TEMPORARY one-tap control for the already-vetted one-time GameEye Wishlist migration
// (migrations/2026-09-14-gameeye-wishlist-seed.js, reconciled + tested in PR #72). Lets Josh
// apply the seed directly on his phone's real local ShelfCheck state without Android
// DevTools/remote debugging -- wires the "⭐ IMPORT GAMEEYE WISHLIST ONCE" button already
// present in #maintMenu (index.html) to the same logic that file runs, using ShelfCheck's
// existing Wishlist APIs only (window.addWishlist/window.isWishlisted from wishlist-v001.js,
// plus the top-level effectiveStatus()/byId). This is NOT permanent GameEye Wishlist
// sync/import architecture -- once Josh has tapped it once, delete this file, its
// index.html/sw.js references, and the button markup in a follow-up cleanup PR.
//
// The SEED list below is copied verbatim from migrations/2026-09-14-gameeye-wishlist-seed.js
// (same 141 ids, same source-title comments) rather than re-derived, so the two files cannot
// silently drift apart.
(() => {
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

  function runSeed() {
    if (typeof window.addWishlist !== 'function' || typeof window.isWishlisted !== 'function' || typeof effectiveStatus !== 'function' || typeof byId === 'undefined') {
      $('#syncmsg').textContent = 'GameEye Wishlist seed: ShelfCheck has not finished loading yet. Wait a moment and try again.';
      return;
    }
    let added = 0, already = 0, skippedOwned = 0, unknown = 0;
    for (const [id] of SEED) {
      const x = byId.get(id);
      if (!x) { unknown++; continue; }
      if (effectiveStatus(x) === 'OWNED') { skippedOwned++; continue; }
      if (window.isWishlisted(id)) { already++; continue; }
      window.addWishlist(id);
      added++;
    }
    $('#syncmsg').textContent = `${added} added · ${already} already wishlisted · ${skippedOwned} skipped because owned` + (unknown ? ` · ${unknown} unknown id(s)` : '');
    resetBrowse();
  }

  function install() {
    const btn = document.getElementById('gameeyeWishlistSeedBtn');
    if (!btn) return;
    btn.onclick = runSeed;
    // The global `button{white-space:nowrap}` rule (app.css) otherwise overflows this longer
    // label past the fixed-width #maintMenu instead of wrapping it -- same class of fix as
    // .shelf-actions>button in my-shelf-v001.js. Scoped to this one temporary button so nothing
    // in app.css itself needs touching for a control that's getting deleted shortly.
    const style = document.createElement('style');
    style.textContent = '#gameeyeWishlistSeedBtn{white-space:normal}';
    document.head.appendChild(style);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install); else install();
})();
