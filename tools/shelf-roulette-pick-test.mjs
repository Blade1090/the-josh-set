// ShelfCheck Shelf Roulette "Pick What I Play" v1 regression test.
//
// Runs the REAL app.js + model-fix.js + dossiers.js + every census-mutating script + census-
// finalize.js + price-fix.js + shelf-roulette-v001.js in a Node vm -- so this breaks if the real
// role/pick-for-me/reroll logic regresses, never a reimplemented copy of it. Uses a minimal-but-
// real fake #detail host that extracts the actual .roulette-card / #roulettePickBtn elements
// straight out of paintHand()'s real HTML output (by locating the exact literal markup
// shelf-roulette-v001.js emits), so pickForMe()'s own DOM reads/writes exercise real elements
// rather than a reimplemented state machine.
//
// Usage: node tools/shelf-roulette-pick-test.mjs (exits 1 on failure)
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const REPO = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const CENSUS_MUTATORS = [
  'census-cleanup.js', 'census-v034.js', 'census-collapse-v035.js', 'census-v035-final.js',
  'census-v040-pricing-audit.js',
  'census-v052-pricecharting-negative-space.js', 'census-v053-pricecharting-regional-sweep.js',
  'census-v054-pricecharting-collection-gap.js', 'census-v055-pricecharting-ab-sweep.js',
  'census-v056-pricecharting-cf-sweep.js', 'census-v057-pricecharting-gl-sweep.js',
  'census-v058-pricecharting-mr-sweep.js', 'census-v059-pricecharting-sz-sweep.js',
  'census-physical-omission-pass-v001.js', 'census-physical-omission-pass-v002.js',
  'census-physical-omission-pass-v003.js',
  'census-v060-integrity-scrub.js', 'census-integrity-pass-v001.js', 'census-integrity-pass-v002.js',
  'ownership-reconcile-v071.js', 'ownership-reconcile-v072.js',
  'curation-josh-set-pass-v001.js', 'curation-josh-set-pass-v002.js', 'curation-josh-set-pass-v003.js',
  'curation-josh-set-pass-v004.js',
];

function readFile(name) { return fs.readFileSync(path.join(REPO, name), 'utf8'); }

// A minimal-but-real #detail host for shelf-roulette-v001.js's paintHand()/pickForMe(): rather
// than a generic HTML parser, this extracts exactly the literal structures paintHand()/cardHtml()
// are known to emit (the .roulette-card articles, keyed by their real data-id, and the
// #roulettePickBtn), so pickForMe()'s real classList.toggle()/dataset.id/hidden reads and writes
// operate on genuine (if small) DOM-like objects instead of a reimplemented model.
function makeRouletteHost() {
  let cardsById = new Map();
  let pickBtn = null;
  const inertToggle = () => ({ checked: false, onchange: null });

  function parse(html) {
    cardsById = new Map();
    const articleRe = /<article class="roulette-card" data-id="(\d+)"[^>]*>([\s\S]*?)<\/article>/g;
    let m;
    while ((m = articleRe.exec(html))) {
      const id = Number(m[1]);
      const inner = m[2];
      const badge = { hidden: /roulette-winner-badge"\s+hidden/.test(inner) };
      const classSet = new Set(['roulette-card']);
      const card = {
        dataset: { id: String(id) },
        classList: {
          toggle(c, on) { const has = classSet.has(c); const want = on === undefined ? !has : on; if (want) classSet.add(c); else classSet.delete(c); },
          contains(c) { return classSet.has(c); },
          add(c) { classSet.add(c); },
          remove(c) { classSet.delete(c); },
        },
        querySelector(sel) { return sel === '.roulette-winner-badge' ? badge : null; },
      };
      cardsById.set(id, card);
    }
    pickBtn = /id="roulettePickBtn"/.test(html) ? { textContent: '🎰 PICK FOR ME', disabled: false, onclick: null } : null;
  }

  const host = {
    set innerHTML(html) { host._html = html; parse(html); },
    get innerHTML() { return host._html || ''; },
    querySelector(sel) {
      if (sel === '#roulettePickBtn') return pickBtn;
      if (sel === '#rouletteShortNight' || sel === '#rouletteIncludePlayed' || sel === '#rouletteIncludeBeaten') return inertToggle();
      if (sel === '.roulette-card') return cardsById.size ? [...cardsById.values()][0] : null;
      return null;
    },
    querySelectorAll(sel) { return sel === '.roulette-card' ? [...cardsById.values()] : []; },
    get _cardIds() { return [...cardsById.keys()]; },
  };
  return host;
}

async function buildContext() {
  const detailHost = makeRouletteHost();
  const inertEl = { textContent: '', dataset: {}, querySelectorAll: () => [], querySelector: () => null, addEventListener: () => {}, appendChild: () => {}, style: {}, value: '' };
  const fakeDocument = {
    querySelector: (sel) => (sel === '#detail' ? detailHost : inertEl),
    querySelectorAll: () => [],
    createElement: () => ({ ...inertEl, appendChild: () => {}, classList: { toggle() {}, add() {} } }),
    addEventListener: () => {}, readyState: 'complete', head: { appendChild: () => {} }, body: { appendChild: () => {} },
    getElementById: () => null,
  };
  const dlgStub = { open: true, scrollTop: 0, close() { this.open = false; }, showModal() { this.open = true; }, scrollTo() {} };
  const ctx = {
    window: { addEventListener: () => {} }, console,
    matchMedia: () => ({ matches: false }),
    document: fakeDocument, navigator: {},
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    atob: (s) => Buffer.from(s, 'base64').toString('binary'), btoa: (s) => Buffer.from(s, 'binary').toString('base64'),
    DecompressionStream, Response, Blob, Uint8Array,
    fetch: (name) => { const p = path.join(REPO, name); return Promise.resolve({ ok: fs.existsSync(p), text: () => Promise.resolve(fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '') }); },
    setTimeout, clearTimeout, setInterval, clearInterval,
    requestAnimationFrame: (fn) => fn(),
    dlg: dlgStub,
  };
  vm.createContext(ctx);
  const run = (code, filename) => vm.runInContext(code, ctx, { filename: filename || '<eval>', displayErrors: true });

  run(readFile('app.js'), 'app.js');
  await run('dataReady');
  await new Promise((r) => setTimeout(r, 20));
  run(readFile('model-fix.js'), 'model-fix.js');
  run(readFile('dossiers.js'), 'dossiers.js');
  for (const f of CENSUS_MUTATORS) run(readFile(f), f);
  run(readFile('census-finalize.js'), 'census-finalize.js');
  await new Promise((r) => setTimeout(r, 20));
  run(readFile('price-fix.js'), 'price-fix.js');
  run(readFile('shelf-roulette-v001.js'), 'shelf-roulette-v001.js');

  let waited = 0;
  while (!run('dossiersReady && hltbReady') && waited < 5000) { await new Promise((r) => setTimeout(r, 100)); waited += 100; }
  if (!run('dossiersReady && hltbReady')) throw new Error('Test setup error: dossiersReady/hltbReady never became true');

  return { run, detailHost };
}

function csvOf(titles) {
  const rows = titles.map((t) => `"${t.replace(/"/g, '""')}",PlayStation 4,Games,Owned`).join('\n');
  return `Title,Platform,Category,UserRecordType\n${rows}\n`;
}

async function main() {
  let failed = false;
  const fail = (msg) => { console.error(`FAIL: ${msg}`); failed = true; };
  const ok = (msg) => console.log(`OK  ${msg}`);

  const { run, detailHost } = await buildContext();

  const includedBefore = run('items.filter(x=>x.set==="INCLUDED").length');

  // Pick three specific real INCLUDED identities with known distinct HLTB signatures (short/
  // long/unknown) via the real ownership-audit CSV path, matching how the app actually learns
  // ownership -- not a synthetic stateCache write.
  const candidates = run(`(() => {
    const withTimes = items.filter(x=>x.set==='INCLUDED').map(x=>{
      const h = typeof hltbFor==='function'?hltbFor(x):null;
      return { id:x.id, title:x.title, main: h?Number(h.a):null };
    });
    const short = withTimes.find(x=>Number.isFinite(x.main)&&x.main>0&&x.main<=8);
    const long = withTimes.find(x=>Number.isFinite(x.main)&&x.main>15);
    const unknown = withTimes.find(x=>x.main==null);
    return { short, long, unknown };
  })()`);
  if (!candidates.short || !candidates.long || !candidates.unknown) throw new Error('Test setup error: could not find short/long/unknown HLTB sample identities');

  console.log('--- roles are derived correctly from real HLTB data ---');
  {
    const roleShort = run(`window.SHELFCHECK_ROULETTE.roleFor(byId.get(${candidates.short.id}))`);
    const roleLong = run(`window.SHELFCHECK_ROULETTE.roleFor(byId.get(${candidates.long.id}))`);
    const roleUnknown = run(`window.SHELFCHECK_ROULETTE.roleFor(byId.get(${candidates.unknown.id}))`);
    if (roleShort.label !== 'QUICK HIT') fail(`Short-HLTB identity "${candidates.short.title}" (${candidates.short.main}h) got role ${roleShort.label}, expected QUICK HIT`);
    else ok(`Short-HLTB identity "${candidates.short.title}" (${candidates.short.main}h) gets QUICK HIT`);
    if (roleLong.label !== 'DEEP DIVE') fail(`Long-HLTB identity "${candidates.long.title}" (${candidates.long.main}h) got role ${roleLong.label}, expected DEEP DIVE`);
    else ok(`Long-HLTB identity "${candidates.long.title}" (${candidates.long.main}h) gets DEEP DIVE`);
    if (roleUnknown.label !== 'WILDCARD') fail(`Unknown-HLTB identity "${candidates.unknown.title}" got role ${roleUnknown.label}, expected WILDCARD`);
    else ok(`Unknown-HLTB identity "${candidates.unknown.title}" gets WILDCARD`);
  }

  // Nine distinct eligible identities (the short/long/unknown trio above, plus 6 more) -- enough
  // for exactly 3 non-overlapping hands, so the session no-repeat bag's walk-forward AND its
  // exhaustion/reset behavior are both meaningfully observable, not just trivially true because
  // the pool happens to equal one hand's worth of games.
  const extra = run(`items.filter(x=>x.set==='INCLUDED'&&effectiveStatus(x)!=='OWNED'&&![${candidates.short.id},${candidates.long.id},${candidates.unknown.id}].includes(x.id)).slice(0,6).map(x=>({id:x.id,title:x.title}))`);
  if (extra.length < 6) throw new Error('Test setup error: could not find 6 additional distinct identities to own');
  const nineIds = [candidates.short.id, candidates.long.id, candidates.unknown.id, ...extra.map((x) => x.id)].sort((a, b) => a - b);
  const titles = [candidates.short.title, candidates.long.title, candidates.unknown.title, ...extra.map((x) => x.title)];

  // Real ownership import (mirrors how a phone actually gets these nine OWNED) -- also proves
  // Roulette's own "OWNED, unplayed" pool selection is untouched by this feature.
  run(`window.__ownFile = { name: 'roulette-test.csv', text: () => Promise.resolve(${JSON.stringify(csvOf(titles))}) }`);
  await run('importCSV(window.__ownFile)');

  run('shelfRouletteOpen()');
  let handIds = run('window.SHELFCHECK_ROULETTE.currentHandIds');
  if (handIds.length !== 3 || !handIds.every((id) => nineIds.includes(id))) fail(`Roulette dealt an unexpected hand: ${JSON.stringify(handIds)}, expected 3 ids drawn from the 9 eligible OWNED games`);
  else ok(`Roulette deals exactly 3 of the 9 eligible OWNED games: ${JSON.stringify(handIds)}`);

  console.log('--- Pick For Me only ever chooses among the currently dealt three ---');
  {
    const seen = new Set();
    for (let i = 0; i < 10; i++) {
      run('window.SHELFCHECK_ROULETTE.pickForMe()'); // matchMedia stubbed to reduced-motion:false, but no interval exists in this vm (setInterval/clearInterval are real Node timers) -- settle happens on the real interval below
      await new Promise((r) => setTimeout(r, 1600));
      const winner = run('window.SHELFCHECK_ROULETTE.winnerId');
      if (winner == null) { fail(`pickForMe() left winnerId null after settling (attempt ${i})`); break; }
      if (!handIds.includes(winner)) { fail(`pickForMe() picked id ${winner}, which is not one of the dealt hand ${JSON.stringify(handIds)}`); break; }
      seen.add(winner);
    }
    if (!failed) ok(`Pick For Me only ever selected ids from the dealt hand across 10 tries (saw: ${JSON.stringify([...seen].sort((a, b) => a - b))})`);
  }

  console.log('--- no game state changes merely from being selected ---');
  {
    const before = run('JSON.stringify({owned:[...stateCache.owned].sort((a,b)=>a-b), played:stateCache.played, beaten:stateCache.beaten, wishlist:stateCache.wishlist||[]})');
    run('window.SHELFCHECK_ROULETTE.pickForMe()');
    await new Promise((r) => setTimeout(r, 1600));
    const after = run('JSON.stringify({owned:[...stateCache.owned].sort((a,b)=>a-b), played:stateCache.played, beaten:stateCache.beaten, wishlist:stateCache.wishlist||[]})');
    if (before !== after) fail(`Selecting a winner changed persistent state.\n  before: ${before}\n  after:  ${after}`);
    else ok('Owned/played/beaten/wishlist state is byte-identical before and after Pick For Me selects a winner');
    const includedAfter = run('items.filter(x=>x.set==="INCLUDED").length');
    if (includedAfter !== includedBefore) fail(`Census INCLUDED changed from picking a winner: ${includedBefore} -> ${includedAfter}`);
    else ok(`Census INCLUDED unchanged by Pick For Me: ${includedAfter}`);
  }

  console.log('--- NOPE -- PICK AGAIN rejects the whole hand and walks through NEW games, not the same three ---');
  {
    // Drive this entirely through the REAL button's own onclick, exactly like a real tap --
    // calling window.SHELFCHECK_ROULETTE.nopeRejectHand() directly would miss the actual bug,
    // which lived in whether the button gets rewired to that action at all after a pick.
    const pressPickButton = () => run(`document.querySelector('#detail').querySelector('#roulettePickBtn').onclick()`);

    // Fresh session bag, fresh first hand.
    run('shelfRouletteOpen()');
    const hand1 = run('window.SHELFCHECK_ROULETTE.currentHandIds');
    if (hand1.length !== 3) fail(`Test setup error: expected a fresh 3-card hand, got ${JSON.stringify(hand1)}`);

    // First press = "PICK FOR ME" on the freshly dealt hand -- must NOT change the hand.
    pressPickButton();
    await new Promise((r) => setTimeout(r, 1600));
    if (run('window.SHELFCHECK_ROULETTE.winnerId') == null) fail('Test setup error: first button press did not produce a winner');
    const handAfterFirstPress = run('window.SHELFCHECK_ROULETTE.currentHandIds');
    if (JSON.stringify([...handAfterFirstPress].sort((a, b) => a - b)) !== JSON.stringify([...hand1].sort((a, b) => a - b))) fail('The initial PICK FOR ME press (before any NOPE) changed the dealt hand -- it should only mark a winner among it');
    else ok('The initial PICK FOR ME press only marks a winner within the dealt hand, same three as before');

    // Second press on the SAME button is now "NOPE -- PICK AGAIN" -- this is the actual bug: it
    // must deal 3 DIFFERENT games (none of hand1), not just re-pick a winner among the same three.
    pressPickButton();
    await new Promise((r) => setTimeout(r, 1600));
    const hand2 = run('window.SHELFCHECK_ROULETTE.currentHandIds');
    const overlap12 = hand2.filter((id) => hand1.includes(id));
    if (overlap12.length) fail(`Pressing the button a second time (NOPE) redealt a game from the just-rejected hand instead of walking to new ones: overlap ${JSON.stringify(overlap12)} (hand1=${JSON.stringify(hand1)}, hand2=${JSON.stringify(hand2)})`);
    else ok(`Pressing NOPE deals 3 entirely new games via the real button: ${JSON.stringify(hand1)} -> ${JSON.stringify(hand2)}`);
    if (run('window.SHELFCHECK_ROULETTE.winnerId') == null) fail('NOPE did not immediately offer a new recommendation on the fresh hand');
    else ok('NOPE immediately re-offers a recommendation (winner set) on the freshly dealt hand');

    // Third press: the 9-game pool has exactly 3 left unseen (9 - 3 - 3) -- must be exactly those,
    // with zero overlap against EITHER prior hand.
    pressPickButton();
    await new Promise((r) => setTimeout(r, 1600));
    const hand3 = run('window.SHELFCHECK_ROULETTE.currentHandIds');
    const overlap123 = hand3.filter((id) => hand1.includes(id) || hand2.includes(id));
    if (overlap123.length) fail(`A further NOPE press repeated an already-rejected game: overlap ${JSON.stringify(overlap123)}`);
    else ok(`A further NOPE press again deals 3 entirely new games, completing all 9 with zero repeats: ${JSON.stringify(hand3)}`);
    const seenSoFar = [...run('window.SHELFCHECK_ROULETTE.sessionSeenIds')].sort((a, b) => a - b);
    if (JSON.stringify(seenSoFar) !== JSON.stringify(nineIds)) fail(`Session bag should now contain exactly all 9 eligible ids, got ${JSON.stringify(seenSoFar)}`);
    else ok('Session bag has now recorded all 9 eligible games across the 3 hands dealt so far');

    // Fourth press: the bag is exhausted (all 9 already seen) -- dealHand() must reset and
    // recycle rather than error or return an empty hand.
    pressPickButton();
    await new Promise((r) => setTimeout(r, 1600));
    const hand4 = run('window.SHELFCHECK_ROULETTE.currentHandIds');
    const bagAfterReset = run('window.SHELFCHECK_ROULETTE.sessionSeenIds');
    if (hand4.length !== 3 || !hand4.every((id) => nineIds.includes(id))) fail(`Bag-exhaustion NOPE press did not deal a valid 3-card hand from the 9 eligible games: ${JSON.stringify(hand4)}`);
    else ok(`Once the bag is exhausted, NOPE resets it and deals again from the full pool: ${JSON.stringify(hand4)}`);
    if (bagAfterReset.length !== 3) fail(`Session bag should have been reset and repopulated with only the new hand (3), got ${bagAfterReset.length}: ${JSON.stringify(bagAfterReset)}`);
    else ok('Session bag was actually reset (not accumulated past the pool size) once exhausted');

    // Repeated presses (5 more) must never throw and must always land on a valid winner within
    // whatever hand is currently showing -- proves the button stays correctly wired to NOPE
    // across many consecutive presses, not just the first one.
    for (let i = 0; i < 5; i++) {
      pressPickButton();
      await new Promise((r) => setTimeout(r, 1600));
      const hand = run('window.SHELFCHECK_ROULETTE.currentHandIds');
      const winner = run('window.SHELFCHECK_ROULETTE.winnerId');
      if (hand.length !== 3 || winner == null || !hand.includes(winner)) { fail(`Repeated NOPE press ${i + 1} left an invalid state: hand=${JSON.stringify(hand)} winner=${winner}`); break; }
    }
    if (!failed) ok('5 further consecutive NOPE presses each keep producing a valid fresh hand + winner');
  }

  console.log('--- DEAL AGAIN respects the same no-repeat session bag ---');
  {
    run('shelfRouletteOpen()');
    const hand1 = run('window.SHELFCHECK_ROULETTE.currentHandIds');
    run('shelfRouletteDeal()');
    const hand2 = run('window.SHELFCHECK_ROULETTE.currentHandIds');
    const overlap = hand2.filter((id) => hand1.includes(id));
    if (overlap.length) fail(`DEAL AGAIN repeated a just-dealt game: overlap ${JSON.stringify(overlap)} (hand1=${JSON.stringify(hand1)}, hand2=${JSON.stringify(hand2)})`);
    else ok(`DEAL AGAIN also draws from the same no-repeat session bag: ${JSON.stringify(hand1)} -> ${JSON.stringify(hand2)}`);
  }

  console.log('--- closing/reopening Shelf Roulette resets the session bag ---');
  {
    // Bag currently holds 6 ids (two hands) from the DEAL AGAIN test above.
    const bagBeforeReopen = run('window.SHELFCHECK_ROULETTE.sessionSeenIds');
    if (bagBeforeReopen.length < 6) fail(`Test setup error: expected an accumulated bag before reopening, got ${JSON.stringify(bagBeforeReopen)}`);
    run('shelfRouletteOpen()');
    const bagAfterReopen = run('window.SHELFCHECK_ROULETTE.sessionSeenIds');
    if (bagAfterReopen.length !== 3) fail(`Reopening Shelf Roulette should reset the session bag to just the freshly dealt hand (3), got ${bagAfterReopen.length}: ${JSON.stringify(bagAfterReopen)}`);
    else ok('Reopening Shelf Roulette resets the accumulated session bag (starts fresh with only the new hand)');
  }

  console.log('--- dealing a new hand clears the previous winner ---');
  {
    run('window.SHELFCHECK_ROULETTE.pickForMe()');
    await new Promise((r) => setTimeout(r, 1600));
    if (run('window.SHELFCHECK_ROULETTE.winnerId') == null) fail('Test setup error: expected a winner to be set before dealing again');
    run('shelfRouletteDeal()');
    const winnerAfterDeal = run('window.SHELFCHECK_ROULETTE.winnerId');
    if (winnerAfterDeal != null) fail(`Dealing a new hand did not clear the previous winner (winnerId=${winnerAfterDeal})`);
    else ok('Dealing a new hand (DEAL AGAIN) clears the previous winner');
  }

  console.log('--- reduced-motion path settles immediately, without the cycling interval ---');
  {
    run('shelfRouletteDeal()');
    const t0 = Date.now();
    run(`matchMedia = () => ({ matches: true })`); // simulate prefers-reduced-motion: reduce
    run('window.SHELFCHECK_ROULETTE.pickForMe()');
    const elapsedSync = Date.now() - t0;
    const winner = run('window.SHELFCHECK_ROULETTE.winnerId');
    const picking = run('window.SHELFCHECK_ROULETTE.picking');
    run(`matchMedia = () => ({ matches: false })`);
    if (winner == null || picking !== false) fail(`Reduced-motion pickForMe() did not settle synchronously (winnerId=${winner}, picking=${picking})`);
    else ok(`Reduced-motion path settles synchronously (no interval): winner set within ${elapsedSync}ms, picking=false immediately`);
  }

  console.log('--- existing Played/Beaten Roulette filters still behave correctly ---');
  {
    run('shelfRouletteMarkPlayed(' + candidates.short.id + ')');
    const stillEligible = run('window.SHELFCHECK_ROULETTE.eligiblePool().some(x=>x.id===' + candidates.short.id + ')');
    if (stillEligible) fail('Marking a game PLAYED did not remove it from the default (played-excluded) eligible pool');
    else ok('Marking a game PLAYED removes it from the default eligible pool, exactly as before this feature');
    const isPlayedNow = run('window.SHELFCHECK_ROULETTE.isPlayed(byId.get(' + candidates.short.id + '))');
    if (!isPlayedNow) fail('isPlayed() does not report the marked game as played');
    else ok('isPlayed() correctly reports the marked game');
    // Marking played deals a fresh hand (existing behavior) -- confirm the winner reset applies there too.
    if (run('window.SHELFCHECK_ROULETTE.winnerId') != null) fail('Marking PLAYED (which re-deals) left a stale winner set');
    else ok('Marking PLAYED (existing reroll-on-mark behavior) also clears any previous winner');
  }

  if (!failed) {
    console.log('\nPASS: Shelf Roulette roles are derived correctly from real HLTB data, Pick For Me only ever selects among the currently dealt hand, NOPE -- PICK AGAIN rejects the whole hand and walks through genuinely new games (never the same three) until the session bag is exhausted and resets, DEAL AGAIN respects that same bag, reopening Shelf Roulette resets it, dealing a new hand clears the previous winner, no persistent state (owned/played/beaten/wishlist/census) changes merely from selecting a winner, the reduced-motion path settles synchronously, and the existing Played/Beaten eligibility filters behave exactly as before.');
  }
  process.exit(failed ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
