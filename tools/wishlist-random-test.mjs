// ShelfCheck Random Wishlist Game regression test.
//
// Runs the REAL app.js + model-fix.js + dossiers.js + every census-mutating script + census-
// finalize.js + price-fix.js + wishlist-v001.js in a Node vm -- so this breaks if the real
// randomWishlistGame()/drawWishlistRandomId()/wishlistRandomPool() logic regresses, never a
// reimplemented copy of it. Uses the same minimal-but-real #detail host pattern established for
// the Random Game / GameEye Wishlist seed tests (a real <h2>, a stable #v anchor, genuine
// insertAdjacentElement/before/after/appendChild), so randomWishlistDetailButton()'s own anchor
// logic and window.renderRandomWishlistToggle() exercise real DOM-like elements.
//
// Usage: node tools/wishlist-random-test.mjs (exits 1 on failure)
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

// Same minimal-but-real #detail host used for the Random Game / GameEye Wishlist seed tests: an
// innerHTML setter that synthesizes the one real structural fact detail()'s HTML always has (an
// <h2> first), a stable synthetic "#v" anchor (the real Store Mode verdict div NEEDED dossiers
// render), and genuine appendChild/before/after/insertAdjacentElement wired to one shared child
// list -- because every element detail()/randomWishlistDetailButton() touch really are direct
// siblings under #detail in the real DOM.
function makeDetailHost() {
  let children = [];
  function queryIn(sel) {
    if (sel === '#v') return vAnchor;
    if (sel.startsWith('.')) { const cls = sel.slice(1); return children.find((c) => (c.className || '').split(/\s+/).includes(cls)) || null; }
    return null;
  }
  function makeNode(tagName) {
    const node = {
      tagName, className: '', textContent: '', onclick: null, dataset: {},
      classList: { toggle(c, on) { const has = node.className.split(/\s+/).filter(Boolean).includes(c); const want = on === undefined ? !has : on; const parts = node.className.split(/\s+/).filter(Boolean).filter((x) => x !== c); if (want) parts.push(c); node.className = parts.join(' '); } },
      querySelector: queryIn,
      appendChild(el) { children.push(el); return el; },
      before(el) { const i = children.indexOf(node); children.splice(i < 0 ? children.length : i, 0, el); },
      after(el) { const i = children.indexOf(node); children.splice(i < 0 ? children.length : i + 1, 0, el); },
    };
    return node;
  }
  const vAnchor = makeNode('div');
  const host = {
    _lastRawHTML: '',
    get innerHTML() { return host._lastRawHTML; },
    set innerHTML(html) { host._lastRawHTML = html; children = []; },
    querySelector: queryIn,
    appendChild(el) { children.push(el); return el; },
  };
  return { host, makeNode };
}

async function buildContext() {
  const { host: detailHost, makeNode } = makeDetailHost();
  const inertEl = { textContent: '', dataset: {}, querySelectorAll: () => [], querySelector: () => null, addEventListener: () => {}, appendChild: () => {}, style: {}, value: '' };
  const uiDoc = {
    querySelector: (sel) => (sel === '#detail' ? detailHost : inertEl),
    querySelectorAll: () => [],
    createElement: (tag) => makeNode(tag),
    addEventListener: () => {}, readyState: 'complete', head: { appendChild: () => {} }, body: { appendChild: () => {} }, getElementById: () => null,
  };
  const dlgStub = { open: false, scrollTop: 0, close() { this.open = false; }, showModal() { this.open = true; } };
  const ctx = {
    window: { addEventListener: () => {} }, console,
    document: uiDoc, navigator: {},
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    atob: (s) => Buffer.from(s, 'base64').toString('binary'), btoa: (s) => Buffer.from(s, 'binary').toString('base64'),
    DecompressionStream, Response, Blob, Uint8Array,
    fetch: (name) => { const p = path.join(REPO, name); return Promise.resolve({ ok: fs.existsSync(p), text: () => Promise.resolve(fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '') }); },
    setTimeout, clearTimeout, setInterval, clearInterval,
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
  run(readFile('wishlist-v001.js'), 'wishlist-v001.js');

  let waited = 0;
  while (!run('dossiersReady && hltbReady') && waited < 5000) { await new Promise((r) => setTimeout(r, 100)); waited += 100; }
  if (!run('dossiersReady && hltbReady')) throw new Error('Test setup error: dossiersReady/hltbReady never became true');

  return { run };
}

async function main() {
  let failed = false;
  const fail = (msg) => { console.error(`FAIL: ${msg}`); failed = true; };
  const ok = (msg) => console.log(`OK  ${msg}`);

  const { run } = await buildContext();
  const includedBefore = run('items.filter(x=>x.set==="INCLUDED").length');

  console.log('--- an empty Wishlist is handled cleanly, no error ---');
  {
    run('window.SHELFCHECK_WISHLIST.randomWishlistGame()');
    const msg = run(`$('#syncmsg').textContent`);
    const winner = run('window.SHELFCHECK_WISHLIST.lastWishlistRandomId');
    if (winner != null) fail(`randomWishlistGame() on an empty Wishlist should not draw anything, got id ${winner}`);
    else if (!msg) fail('An empty Wishlist should show a friendly message, got none');
    else ok(`Random Wishlist Game on an empty Wishlist shows a friendly message instead of throwing: "${msg}"`);
  }

  // 8 real distinct NEEDED identities, wishlisted via the real addWishlist().
  const eight = run('items.filter(x=>x.set==="INCLUDED"&&status(x)==="NEEDED").slice(0,8).map(x=>x.id)');
  for (const id of eight) run(`window.addWishlist(${id})`);

  console.log('--- Random Wishlist Game only ever draws from the actual Wishlist, and opens the real detail()/dossier ---');
  {
    run('window.__detailCalls=[];const _d=detail;detail=function(id){window.__detailCalls.push(id);return _d(id)}');
    run('window.SHELFCHECK_WISHLIST.randomWishlistGame()');
    const winner = run('window.SHELFCHECK_WISHLIST.lastWishlistRandomId');
    const calls = run('window.__detailCalls');
    if (!eight.includes(winner)) fail(`Drew id ${winner}, which is not one of the wishlisted ids ${JSON.stringify(eight)}`);
    else ok(`Random Wishlist Game drew a real wishlisted id: ${winner}`);
    if (JSON.stringify(calls) !== JSON.stringify([winner])) fail(`Expected the real detail() to be called exactly once with the drawn id, got calls=${JSON.stringify(calls)}`);
    else ok('Random Wishlist Game opens the real, normal detail()/dossier view (no special Wishlist screen)');
    const hasAnother = run(`!!document.querySelector('#detail').querySelector('.another-wishlist-thumb')`);
    const hasToggle = run(`!!document.querySelector('#detail').querySelector('.wishlist-toggle')`);
    if (!hasAnother) fail('ANOTHER WISHLIST GAME control missing after the draw');
    else ok('ANOTHER WISHLIST GAME control renders synchronously, same pattern as Random Game');
    if (!hasToggle) fail('The Wishlist toggle is missing from the Wishlist-opened dossier');
    else ok('The normal ⭐ WISHLIST toggle also renders on a Wishlist-opened dossier (same reusable control)');
  }

  console.log('--- repeated presses walk through every wishlisted game exactly once before any repeat (shuffle-bag) ---');
  {
    // The previous section's draw already consumed one game from the bag -- seed with it and
    // only draw the remaining (eight.length - 1) presses to complete this same first pass,
    // rather than assuming a fresh, unconsumed bag here.
    const alreadyDrawn = run('window.SHELFCHECK_WISHLIST.lastWishlistRandomId');
    const seen = new Set([alreadyDrawn]);
    let sawRepeatBeforeExhaustion = false;
    for (let i = 0; i < eight.length - 1; i++) {
      run('window.SHELFCHECK_WISHLIST.randomWishlistGame()');
      const id = run('window.SHELFCHECK_WISHLIST.lastWishlistRandomId');
      if (seen.has(id)) sawRepeatBeforeExhaustion = true;
      seen.add(id);
    }
    if (sawRepeatBeforeExhaustion) fail('A wishlisted game repeated before all 8 had been drawn once');
    else if (seen.size !== eight.length) fail(`Expected all ${eight.length} wishlisted games to be drawn exactly once, saw ${seen.size}: ${JSON.stringify([...seen])}`);
    else ok(`All ${eight.length} wishlisted games were drawn exactly once with zero repeats before the bag was exhausted`);

    // Once exhausted, the bag must reshuffle and keep working (not error, not get stuck) rather
    // than requiring a manual reset.
    run('window.SHELFCHECK_WISHLIST.randomWishlistGame()');
    const nextId = run('window.SHELFCHECK_WISHLIST.lastWishlistRandomId');
    if (!eight.includes(nextId)) fail(`After the bag was exhausted and reshuffled, drew an invalid id ${nextId}`);
    else ok(`After exhausting the bag, it reshuffles and keeps drawing valid wishlisted games (drew ${nextId})`);
  }

  console.log('--- removing the currently-displayed game from the Wishlist makes it ineligible for later draws ---');
  {
    // Force a specific game to be the "currently displayed" one, then un-wishlist it exactly like
    // tapping its own ⭐ WISHLISTED toggle would (toggleWishlist is the same real function that
    // toggle uses).
    const target = eight[0];
    run(`window.toggleWishlist(${target})`);
    if (run(`window.isWishlisted(${target})`)) throw new Error('Test setup error: toggleWishlist did not remove the target');

    const remaining = eight.filter((id) => id !== target);
    const seenAfterRemoval = new Set();
    for (let i = 0; i < remaining.length * 2; i++) {
      run('window.SHELFCHECK_WISHLIST.randomWishlistGame()');
      const id = run('window.SHELFCHECK_WISHLIST.lastWishlistRandomId');
      seenAfterRemoval.add(id);
    }
    if (seenAfterRemoval.has(target)) fail(`The removed game (id ${target}) was still drawn after being taken off the Wishlist`);
    else ok(`The removed game (id ${target}) never reappears in subsequent draws; remaining pool cycles normally: ${JSON.stringify([...seenAfterRemoval].sort((a, b) => a - b))}`);
  }

  console.log('--- the current search filter narrows the random draw pool, same as Random Game ---');
  {
    const remaining = eight.slice(1); // target from the previous section was removed
    const oneTitle = run(`byId.get(${remaining[0]}).title`);
    run(`$('#q').value = ${JSON.stringify(oneTitle)}`);
    const narrowedPool = run('window.SHELFCHECK_WISHLIST.wishlistRandomPool()').map((x) => x.id);
    run(`$('#q').value = ''`);
    if (narrowedPool.length !== 1 || narrowedPool[0] !== remaining[0]) fail(`Searching for "${oneTitle}" should narrow the Wishlist random pool to exactly that one game, got ${JSON.stringify(narrowedPool)}`);
    else ok(`The current search query correctly narrows the Random Wishlist Game pool, matching Random Game's own neededPool()/ownedPool() behavior`);
  }

  console.log('--- drawing never changes OWNED/NEEDED/wishlist persistence or census ---');
  {
    const before = run('JSON.stringify({owned:[...ownedSet].sort((a,b)=>a-b), wishlist:[...stateCache.wishlist].sort((a,b)=>a-b)})');
    for (let i = 0; i < 5; i++) run('window.SHELFCHECK_WISHLIST.randomWishlistGame()');
    const after = run('JSON.stringify({owned:[...ownedSet].sort((a,b)=>a-b), wishlist:[...stateCache.wishlist].sort((a,b)=>a-b)})');
    if (before !== after) fail(`Drawing changed persistent state.\n  before: ${before}\n  after:  ${after}`);
    else ok('Owned set and Wishlist contents are byte-identical before and after repeated draws');
    const includedAfter = run('items.filter(x=>x.set==="INCLUDED").length');
    if (includedAfter !== includedBefore) fail(`Census INCLUDED changed: ${includedBefore} -> ${includedAfter}`);
    else ok(`Census INCLUDED unchanged: ${includedAfter}`);
  }

  if (!failed) {
    console.log('\nPASS: Random Wishlist Game handles an empty Wishlist cleanly, only ever draws real wishlisted identities and opens the real detail()/dossier (no special screen), walks through every wishlisted game exactly once before repeating and correctly reshuffles once exhausted, immediately excludes a game removed from the Wishlist, respects the current search filter like Random Game does, and never touches OWNED/NEEDED/Wishlist persistence or census.');
  }
  process.exit(failed ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
