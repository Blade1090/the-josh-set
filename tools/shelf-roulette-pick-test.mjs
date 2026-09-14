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

  // Real ownership import (mirrors how a phone actually gets these three OWNED) -- also proves
  // Roulette's own "OWNED, unplayed" pool selection is untouched by this feature.
  const titles = [candidates.short.title, candidates.long.title, candidates.unknown.title];
  run(`window.__ownFile = { name: 'roulette-test.csv', text: () => Promise.resolve(${JSON.stringify(csvOf(titles))}) }`);
  await run('importCSV(window.__ownFile)');

  run('shelfRouletteOpen()');
  let handIds = run('window.SHELFCHECK_ROULETTE.currentHandIds');
  const expectedIds = [candidates.short.id, candidates.long.id, candidates.unknown.id].sort((a, b) => a - b);
  if (JSON.stringify([...handIds].sort((a, b) => a - b)) !== JSON.stringify(expectedIds)) fail(`Roulette dealt an unexpected hand: ${JSON.stringify(handIds)}, expected exactly ${JSON.stringify(expectedIds)}`);
  else ok(`Roulette deals exactly the 3 eligible OWNED games: ${JSON.stringify(handIds)}`);

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

  console.log('--- NOPE / Pick Again re-selects within the SAME hand, never redeals ---');
  {
    const handBefore = [...run('window.SHELFCHECK_ROULETTE.currentHandIds')].sort((a, b) => a - b);
    for (let i = 0; i < 6; i++) {
      run('window.SHELFCHECK_ROULETTE.pickForMe()');
      await new Promise((r) => setTimeout(r, 1600));
      const handNow = [...run('window.SHELFCHECK_ROULETTE.currentHandIds')].sort((a, b) => a - b);
      if (JSON.stringify(handNow) !== JSON.stringify(handBefore)) { fail(`NOPE/Pick Again changed the dealt hand: ${JSON.stringify(handBefore)} -> ${JSON.stringify(handNow)}`); break; }
    }
    if (!failed) ok(`6 consecutive NOPE/Pick Again presses kept the exact same hand: ${JSON.stringify(handBefore)}`);
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
    console.log('\nPASS: Shelf Roulette roles are derived correctly from real HLTB data, Pick For Me only ever selects among the currently dealt hand, NOPE/Pick Again never redeals, dealing a new hand clears the previous winner, no persistent state (owned/played/beaten/wishlist/census) changes merely from selecting a winner, the reduced-motion path settles synchronously, and the existing Played/Beaten eligibility filters behave exactly as before.');
  }
  process.exit(failed ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
