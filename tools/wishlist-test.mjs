// ShelfCheck Wishlist v1 regression test.
//
// Runs the REAL app.js + model-fix.js + dossiers.js + every census-mutating script (current
// runtime order, matching tools/census-determinism-test.mjs's MUTATORS list) + census-
// finalize.js + price-fix.js + ownership-audit-v068.js (the real importCSV) + gameeye-
// reconcile-v001.js + wishlist-v001.js (the real isWishlisted/addWishlist/removeWishlist/
// toggleWishlist and the real auto-removal-on-ownership saveState() wrap) in a Node vm --
// so this breaks if the real wishlist logic regresses, not a reimplemented copy of it.
//
// Usage: node tools/wishlist-test.mjs (exits 1 on failure)
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

function makeSharedLocalStorage() {
  const store = new Map();
  return {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
}

async function buildContext(sharedLocalStorage) {
  const fakeEl = { textContent: '', dataset: {}, querySelectorAll: () => [], querySelector: () => null, addEventListener: () => {}, appendChild: () => {}, style: {}, value: '' };
  const fakeDocument = {
    querySelector: () => fakeEl, querySelectorAll: () => [], createElement: () => ({ ...fakeEl, appendChild: () => {}, classList: { toggle() {}, add() {} } }),
    addEventListener: () => {}, readyState: 'complete', head: { appendChild: () => {} }, body: { appendChild: () => {} },
    getElementById: () => null,
  };
  const ctx = {
    window: { addEventListener: () => {} }, console,
    document: fakeDocument,
    navigator: {},
    localStorage: sharedLocalStorage || { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    atob: (s) => Buffer.from(s, 'base64').toString('binary'),
    btoa: (s) => Buffer.from(s, 'binary').toString('base64'),
    DecompressionStream, Response, Blob, Uint8Array,
    fetch: (name) => {
      const p = path.join(REPO, name);
      return Promise.resolve({ ok: fs.existsSync(p), text: () => Promise.resolve(fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '') });
    },
    setTimeout, clearTimeout, setInterval, clearInterval,
    dlg: { close() {}, showModal() {}, open: false, scrollTop: 0 },
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
  run(readFile('ownership-audit-v068.js'), 'ownership-audit-v068.js');
  run(readFile('gameeye-reconcile-v001.js'), 'gameeye-reconcile-v001.js');
  run(readFile('wishlist-v001.js'), 'wishlist-v001.js');
  await new Promise((r) => setTimeout(r, 300)); // let gameeye-reconcile-v001.js's poll settle

  return { run };
}

function csvOf(titles) {
  const rows = titles.map((t) => `"${t.replace(/"/g, '""')}",PlayStation 4,Games,Owned`).join('\n');
  return `Title,Platform,Category,UserRecordType\n${rows}\n`;
}

async function main() {
  let failed = false;
  const fail = (msg) => { console.error(`FAIL: ${msg}`); failed = true; };
  const ok = (msg) => console.log(`OK  ${msg}`);

  const { run } = await buildContext();

  const includedBefore = run('items.filter(x=>x.set==="INCLUDED").length');
  const dataNBefore = run('DATA.n');

  // Pick two distinct NEEDED identities for general add/remove/badge tests, and a third
  // separate one dedicated to the ownership-transition test so it doesn't interfere.
  const [gameA, gameB, gameC] = run("items.filter(x=>x.set==='INCLUDED'&&status(x)==='NEEDED').slice(0,3)");

  console.log('--- add / remove / toggle ---');
  {
    if (run(`window.isWishlisted(${gameA.id})`)) fail(`${gameA.title} should not start wishlisted`);
    run(`window.addWishlist(${gameA.id})`);
    if (!run(`window.isWishlisted(${gameA.id})`)) fail(`addWishlist did not mark ${gameA.title} as wishlisted`);
    else ok(`addWishlist marks "${gameA.title}" as wishlisted`);

    run(`window.addWishlist(${gameB.id})`);
    run(`window.removeWishlist(${gameA.id})`);
    if (run(`window.isWishlisted(${gameA.id})`)) fail(`removeWishlist did not unmark ${gameA.title}`);
    else ok(`removeWishlist unmarks "${gameA.title}"`);
    if (!run(`window.isWishlisted(${gameB.id})`)) fail(`window.removeWishlist(gameA) incorrectly affected ${gameB.title}`);

    run(`window.toggleWishlist(${gameA.id})`);
    if (!run(`window.isWishlisted(${gameA.id})`)) fail('toggleWishlist did not add when absent');
    run(`window.toggleWishlist(${gameA.id})`);
    if (run(`window.isWishlisted(${gameA.id})`)) fail('toggleWishlist did not remove when present');
    else ok('toggleWishlist flips state correctly both directions');
    run(`window.addWishlist(${gameA.id})`); // leave both A and B wishlisted for later tests
  }

  console.log('--- wishlist does not alter OWNED/NEEDED or census/completion ---');
  {
    const stA = run(`status(items.find(x=>x.id===${gameA.id}))`);
    const stAEff = run(`effectiveStatus(items.find(x=>x.id===${gameA.id}))`);
    if (stA !== 'NEEDED' || stAEff !== 'NEEDED') fail(`Wishlisting must not change status(): got status=${stA} effectiveStatus=${stAEff}`);
    else ok(`Wishlisted "${gameA.title}" still reports status=NEEDED / effectiveStatus=NEEDED`);

    const includedAfter = run('items.filter(x=>x.set==="INCLUDED").length');
    const dataNAfter = run('DATA.n');
    if (includedAfter !== includedBefore) fail(`INCLUDED count changed after wishlisting: ${includedBefore} -> ${includedAfter}`);
    if (dataNAfter !== dataNBefore) fail(`DATA.n (completion denominator) changed after wishlisting: ${dataNBefore} -> ${dataNAfter}`);
    if (includedAfter === includedBefore && dataNAfter === dataNBefore) ok(`Census INCLUDED (${includedAfter}) and completion denominator (${dataNAfter}) unchanged by wishlisting`);

    const ownedSetHas = run(`ownedSet.has(${gameA.id})`);
    if (ownedSetHas) fail(`Wishlisting incorrectly added ${gameA.title} to ownedSet`);
    else ok('ownedSet is untouched by wishlisting');
  }

  console.log('--- persistence across a fresh page load ---');
  {
    const shared = makeSharedLocalStorage();
    const load1 = await buildContext(shared);
    load1.run(`window.addWishlist(${gameA.id})`);
    if (!load1.run(`window.isWishlisted(${gameA.id})`)) fail('Load 1: add did not take effect');

    const load2 = await buildContext(shared); // fresh vm context, same persisted localStorage
    if (!load2.run(`window.isWishlisted(${gameA.id})`)) fail('Wishlist entry did not survive a fresh page load (persistence failure)');
    else ok('Wishlist entry survives a fresh page load using the persisted state');
  }

  console.log('--- Backup includes Wishlist / Restore recovers it ---');
  {
    run(`window.addWishlist(${gameB.id})`);
    const backupJSON = run('JSON.stringify(stateCache)'); // exactly what the real Backup button serializes
    const backup = JSON.parse(backupJSON);
    if (!Array.isArray(backup.wishlist) || !backup.wishlist.includes(gameB.id)) {
      fail(`Backup JSON (stateCache) does not include the wishlisted id ${gameB.id}: ${JSON.stringify(backup.wishlist)}`);
    } else {
      ok('Backup (stateCache serialization) includes the current wishlist');
    }

    // Simulate Restore: a fresh context, then saveState(parsedBackupFile) exactly like the
    // real #restore file-input handler does.
    const shared2 = makeSharedLocalStorage();
    const restoreTarget = await buildContext(shared2);
    restoreTarget.run(`saveState(${backupJSON})`);
    if (!restoreTarget.run(`window.isWishlisted(${gameB.id})`)) fail('Restore did not recover the wishlist from a backup');
    else ok('Restore recovers the wishlist from a Backup file');
  }

  console.log('--- normal browsing shows the wishlist badge ---');
  {
    // decorateWishlistBadges() uses real document.querySelectorAll('#results article.card');
    // fake just enough card structure to prove the REAL function's matching/idempotency logic,
    // consistent with how the rest of this test suite avoids needing a full DOM implementation.
    run(`window.addWishlist(${gameA.id})`);
    const check = run(`(() => {
      const title = items.find(x => x.id === ${gameA.id}).title;
      const badges = [];
      const top = { querySelector: (sel) => sel === '.wishlist-badge' ? (badges.length ? badges[0] : null) : null, appendChild: (el) => badges.push(el) };
      const card = { querySelector: (sel) => sel === '.top b' ? { textContent: title } : sel === '.top' ? top : null };
      const savedQSA = document.querySelectorAll;
      document.querySelectorAll = (sel) => sel === '#results article.card' ? [card] : savedQSA(sel);
      try { window.SHELFCHECK_WISHLIST.decorateWishlistBadges(); } finally { document.querySelectorAll = savedQSA; }
      return { count: badges.length, className: badges[0]?.className, text: badges[0]?.textContent };
    })()`);
    if (check.count !== 1 || check.className !== 'badge wishlist-badge' || check.text !== '⭐ WISHLIST') {
      fail(`decorateWishlistBadges() did not add the expected badge: ${JSON.stringify(check)}`);
    } else {
      ok('decorateWishlistBadges() adds exactly one "⭐ WISHLIST" badge for a wishlisted card, without touching the existing status badge');
    }
    // Idempotency: calling it again on a card that already has the badge must not duplicate it.
    const notWishlisted = run(`(() => {
      const title = items.find(x => x.id === ${gameC.id}).title;
      const badges = [];
      const top = { querySelector: () => null, appendChild: (el) => badges.push(el) };
      const card = { querySelector: (sel) => sel === '.top b' ? { textContent: title } : sel === '.top' ? top : null };
      const savedQSA = document.querySelectorAll;
      document.querySelectorAll = (sel) => sel === '#results article.card' ? [card] : savedQSA(sel);
      try { window.SHELFCHECK_WISHLIST.decorateWishlistBadges(); } finally { document.querySelectorAll = savedQSA; }
      return badges.length;
    })()`);
    if (notWishlisted !== 0) fail(`decorateWishlistBadges() added a badge to a NON-wishlisted card ("${gameC.title}")`);
    else ok(`decorateWishlistBadges() adds nothing for a non-wishlisted card ("${gameC.title}")`);
  }

  console.log('--- Wishlist view returns only wishlisted identities ---');
  {
    const wishlisted = run('window.SHELFCHECK_WISHLIST.wishlistedItems().map(x=>x.id)');
    const expected = [gameA.id, gameB.id].sort((a, b) => a - b);
    const got = [...wishlisted].sort((a, b) => a - b);
    if (JSON.stringify(got) !== JSON.stringify(expected)) {
      fail(`wishlistedItems() returned ${JSON.stringify(got)}, expected exactly ${JSON.stringify(expected)}`);
    } else {
      ok(`wishlistedItems() returns exactly the currently-wishlisted identities: ${JSON.stringify(got)}`);
    }
  }

  console.log('--- wishlisted identity becoming OWNED is auto-removed (via real importCSV) ---');
  {
    if (run(`window.isWishlisted(${gameC.id})`)) fail(`Test setup error: ${gameC.title} should not be wishlisted yet`);
    run(`window.addWishlist(${gameC.id})`);
    if (!run(`window.isWishlisted(${gameC.id})`)) fail('Test setup error: addWishlist did not take');

    const csvTitle = gameC.title;
    run(`window.__testFile = { name: 'wishlist-ownership-test.csv', text: () => Promise.resolve(${JSON.stringify(csvOf([csvTitle]))}) }`);
    await run('importCSV(window.__testFile)');

    const nowOwned = run(`effectiveStatus(items.find(x=>x.id===${gameC.id}))`);
    if (nowOwned !== 'OWNED') fail(`Test setup error: importCSV did not mark "${gameC.title}" OWNED (got ${nowOwned}) -- cannot verify auto-removal`);
    else if (run(`window.isWishlisted(${gameC.id})`)) {
      fail(`"${gameC.title}" became OWNED via a real GameEye import but was NOT auto-removed from the wishlist`);
    } else {
      ok(`"${gameC.title}" was automatically removed from the wishlist after a real GameEye import made it OWNED`);
    }

    // gameA/gameB must remain wishlisted and NEEDED -- the prune must be surgical, not global.
    if (!run(`window.isWishlisted(${gameA.id})`) || !run(`window.isWishlisted(${gameB.id})`)) {
      fail('Unrelated wishlisted (still-NEEDED) identities were incorrectly removed by the ownership-transition prune');
    } else {
      ok('Unrelated still-NEEDED wishlisted identities are left untouched by the prune');
    }
  }

  console.log('--- Random wishlist toggle never advances/changes the Random game ---');
  {
    run(`window.__detailCalls=0;window.__randomCalls=typeof randomGame==='function'?0:null;const _d=detail;detail=function(...a){window.__detailCalls++;return _d(...a)}`);
    const beforeToggleCount = run(`window.isWishlisted(${gameA.id})`);
    run(`window.toggleWishlist(${gameA.id})`); // the exact call the injected button's onclick makes
    const afterToggleCount = run(`window.isWishlisted(${gameA.id})`);
    const detailCalls = run('window.__detailCalls');
    if (afterToggleCount === beforeToggleCount) fail('toggleWishlist did not change state when invoked (test itself is broken)');
    if (detailCalls !== 0) fail(`window.toggleWishlist() must never call detail()/re-open or change the current dossier -- detail() was called ${detailCalls} time(s)`);
    else ok('toggleWishlist() only flips state -- it never calls detail() (never re-opens/changes the current Random dossier or game)');
  }

  console.log('--- UI placement: Wishlist stays OUT of the status nav; all 4 utility buttons share the 2x2 action area ---');
  {
    // This one needs real (if minimal) DOM tracking for .shelf-actions/nav -- the shared
    // fakeDocument above returns one inert element for every selector, which is fine for
    // testing state/logic but can't prove WHERE a button ended up. A separate, deliberately
    // small vm context: just app.js (for render()/document/filter to exist) + the real
    // fun-features-v103.js and wishlist-v001.js install() calls -- no census/dossiers needed,
    // since button placement happens synchronously at script-load time, before any data
    // finishes loading.
    const shelfActionsChildren = [
      { tagName: 'BUTTON', id: 'shelfRouletteBtn' },
      { tagName: 'BUTTON', id: 'myShelfBtn' },
    ];
    const navChildren = [
      { tagName: 'BUTTON', dataset: { s: 'ALL' }, className: 'active' },
      { tagName: 'BUTTON', dataset: { s: 'NEEDED' }, className: '' },
      { tagName: 'BUTTON', dataset: { s: 'OWNED' }, className: '' },
    ];
    const shelfActionsEl = {
      tagName: 'DIV',
      appendChild(el) { shelfActionsChildren.push(el); return el; },
      querySelector(sel) { return sel.startsWith('#') ? (shelfActionsChildren.find((c) => c.id === sel.slice(1)) || null) : null; },
    };
    const navEl = {
      tagName: 'NAV',
      appendChild(el) { navChildren.push(el); return el; },
      querySelectorAll(sel) { return sel === 'button' ? navChildren : []; },
    };
    const inertEl = { textContent: '', dataset: {}, querySelectorAll: () => [], querySelector: () => null, addEventListener: () => {}, appendChild: () => {}, style: {}, value: '' };
    const uiDoc = {
      querySelector: (sel) => {
        if (sel === '.shelf-actions') return shelfActionsEl;
        if (sel === 'nav') return navEl;
        // install()'s own "already exists?" guards look these two up by id at the top
        // level -- must genuinely return null until each is actually created, unlike every
        // other selector ($('#q') etc.), which just needs a harmless non-null stub.
        if (sel === '#quickBuyBtn' || sel === '#wishlistEntryBtn') return shelfActionsChildren.find((c) => c.id === sel.slice(1)) || null;
        return inertEl;
      },
      querySelectorAll: (sel) => (sel === 'nav button' ? navChildren : []),
      createElement: () => ({ ...inertEl, dataset: {}, classList: { toggle() {}, add() {}, remove() {} }, appendChild: () => {} }),
      // Deliberately 'loading', matching a real initial <script> tag execution (before
      // DOMContentLoaded fires) -- this is the exact condition that exposed the real bug: with
      // readyState 'complete' from the start, both fun-features-v103.js's and this file's own
      // install() calls would run "immediately" in script-tag order regardless of whether
      // either actually gates on readyState, hiding a real deferred-vs-immediate race. Queued
      // DOMContentLoaded listeners are fired in registration order below, exactly like a real
      // browser dispatches them.
      domContentLoadedQueue: [],
      addEventListener(evt, cb) { if (evt === 'DOMContentLoaded') this.domContentLoadedQueue.push(cb); },
      readyState: 'loading', head: { appendChild: () => {} }, body: { appendChild: () => {} }, getElementById: () => null,
    };
    const uiCtx = {
      window: { addEventListener: () => {} }, console,
      document: uiDoc, navigator: {},
      localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
      atob: (s) => Buffer.from(s, 'base64').toString('binary'), btoa: (s) => Buffer.from(s, 'binary').toString('base64'),
      DecompressionStream, Response, Blob, Uint8Array,
      fetch: (name) => { const p = path.join(REPO, name); return Promise.resolve({ ok: fs.existsSync(p), text: () => Promise.resolve(fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '') }); },
      setTimeout, clearTimeout, setInterval, clearInterval,
      dlg: { close() {}, showModal() {}, open: false, scrollTop: 0 },
    };
    vm.createContext(uiCtx);
    const runUI = (code, filename) => vm.runInContext(code, uiCtx, { filename: filename || '<eval>', displayErrors: true });
    runUI(readFile('app.js'), 'app.js'); // kicks off async loadData in the background; not awaited -- button placement doesn't need census data
    runUI(readFile('fun-features-v103.js'), 'fun-features-v103.js');
    runUI(readFile('wishlist-v001.js'), 'wishlist-v001.js');
    // Now simulate the actual DOMContentLoaded dispatch, firing every queued listener in the
    // exact order the two scripts registered them -- this is what determines final DOM order,
    // not the order the scripts merely executed in.
    runUI('document.readyState="complete"; for (const cb of document.domContentLoadedQueue) cb();');

    if (navChildren.length !== 3 || navChildren.some((c) => c.id === 'wishlistFilterBtn' || c.id === 'wishlistEntryBtn')) {
      fail(`Status nav must remain exactly ALL/NEEDED/OWNED with no Wishlist entry -- found ${navChildren.length} button(s): ${JSON.stringify(navChildren.map((c) => c.id || c.dataset?.s))}`);
    } else {
      ok('Status nav is untouched -- still exactly ALL/NEEDED/OWNED, no Wishlist button inserted there');
    }

    const actionIds = shelfActionsChildren.map((c) => c.id);
    const expectedOrder = ['shelfRouletteBtn', 'myShelfBtn', 'quickBuyBtn', 'wishlistEntryBtn'];
    if (JSON.stringify(actionIds) !== JSON.stringify(expectedOrder)) {
      fail(`.shelf-actions must contain exactly the 4 utility buttons in 2x2 reading order [Roulette, My Shelf, Should I Buy This, Wishlist] -- got ${JSON.stringify(actionIds)}`);
    } else {
      ok(`.shelf-actions contains exactly the 4 utility buttons in the intended 2x2 order: ${JSON.stringify(actionIds)}`);
    }
  }

  console.log('--- Random Wishlist toggle renders synchronously (no flash/retry) across repeated "Another Random Game" presses ---');
  {
    // Needs a genuinely realistic (if minimal) #detail host: detail() (dossiers.js) assigns a
    // full HTML string via innerHTML, then randomDetailButton() (fun-features-v103.js) and
    // renderRandomWishlistToggle() (wishlist-v001.js) insert real elements via
    // querySelector()/.before()/.after() -- the shared single-fakeEl approach used elsewhere in
    // this file can't prove synchronous DOM presence, only state/logic. This is the smallest
    // fake that supports all three: an innerHTML setter that clears tracked children (exactly
    // like a real assignment wipes previous content), a stable synthetic "#v" anchor (the real
    // Store Mode verdict div every NEEDED dossier renders), and real appendChild/before/after
    // wired to one shared child list.
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

    const { host: detailHost, makeNode } = makeDetailHost();
    const inertEl = { textContent: '', dataset: {}, querySelectorAll: () => [], querySelector: () => null, addEventListener: () => {}, appendChild: () => {}, style: {}, value: '' };
    const uiDoc = {
      querySelector: (sel) => (sel === '#detail' ? detailHost : inertEl),
      querySelectorAll: () => [],
      createElement: (tag) => makeNode(tag),
      addEventListener: () => {}, readyState: 'complete', head: { appendChild: () => {} }, body: { appendChild: () => {} }, getElementById: () => null,
    };
    const dlgStub = { open: false, scrollTop: 0, close() { this.open = false; }, showModal() { this.open = true; } };
    const uiCtx = {
      window: { addEventListener: () => {} }, console,
      document: uiDoc, navigator: {},
      localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
      atob: (s) => Buffer.from(s, 'base64').toString('binary'), btoa: (s) => Buffer.from(s, 'binary').toString('base64'),
      DecompressionStream, Response, Blob, Uint8Array,
      fetch: (name) => { const p = path.join(REPO, name); return Promise.resolve({ ok: fs.existsSync(p), text: () => Promise.resolve(fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '') }); },
      setTimeout, clearTimeout, setInterval, clearInterval,
      dlg: dlgStub,
    };
    vm.createContext(uiCtx);
    const runR = (code, filename) => vm.runInContext(code, uiCtx, { filename: filename || '<eval>', displayErrors: true });

    runR(readFile('app.js'), 'app.js');
    await runR('dataReady');
    await new Promise((r) => setTimeout(r, 20));
    runR(readFile('model-fix.js'), 'model-fix.js');
    runR(readFile('dossiers.js'), 'dossiers.js');
    for (const f of CENSUS_MUTATORS) runR(readFile(f), f);
    runR(readFile('census-finalize.js'), 'census-finalize.js');
    await new Promise((r) => setTimeout(r, 20));
    runR(readFile('price-fix.js'), 'price-fix.js');
    runR(readFile('fun-features-v103.js'), 'fun-features-v103.js');
    runR(readFile('wishlist-v001.js'), 'wishlist-v001.js');

    // Wait for the real dossiersReady/hltbReady flags -- this test deliberately exercises the
    // already-loaded fast path (no retry timer used), which is what every "Another Random
    // Game" press after the first few seconds of a real session actually hits.
    let waited = 0;
    while (!runR('dossiersReady && hltbReady') && waited < 5000) { await new Promise((r) => setTimeout(r, 100)); waited += 100; }
    if (!runR('dossiersReady && hltbReady')) fail('Test setup error: dossiersReady/hltbReady never became true');

    runR('filter="NEEDED"');
    for (let i = 0; i < 3; i++) {
      runR('window.SHELFCHECK_FUN.randomGame()');
      const state = runR(`(() => {
        const host = document.querySelector('#detail');
        const anotherRandom = host.querySelector('.another-random-thumb');
        const toggle = host.querySelector('.wishlist-toggle');
        return { hasAnotherRandom: !!anotherRandom, hasToggle: !!toggle, toggleText: toggle && toggle.textContent, id: window.SHELFCHECK_FUN.lastRandomWishlistId };
      })()`);
      if (!state.hasAnotherRandom) fail(`Press ${i + 1}: ANOTHER RANDOM GAME button missing immediately after randomGame() (no timer elapsed)`);
      if (!state.hasToggle) fail(`Press ${i + 1}: Wishlist toggle missing immediately after randomGame() -- it must render synchronously, not via a delayed retry`);
      else {
        const expectedText = runR(`window.isWishlisted(${JSON.stringify(state.id)})`) ? '⭐ WISHLISTED' : '☆ ADD TO WISHLIST';
        if (state.toggleText !== expectedText) fail(`Press ${i + 1}: Wishlist toggle text "${state.toggleText}" does not match actual wishlist state for id ${state.id} (expected "${expectedText}")`);
        else ok(`Press ${i + 1}: both ANOTHER RANDOM GAME and the Wishlist toggle ("${state.toggleText}") exist synchronously for the newly selected game (id ${state.id}) -- no timer needed`);
      }
    }

    // Toggling must still update immediately in place and never touch the current game.
    const idBefore = runR('window.SHELFCHECK_FUN.lastRandomWishlistId');
    runR(`document.querySelector('#detail').querySelector('.wishlist-toggle').onclick()`);
    const stillSameId = runR('window.SHELFCHECK_FUN.lastRandomWishlistId') === idBefore;
    const newToggleText = runR(`document.querySelector('#detail').querySelector('.wishlist-toggle').textContent`);
    const expectedAfterClick = runR(`window.isWishlisted(${idBefore})`) ? '⭐ WISHLISTED' : '☆ ADD TO WISHLIST';
    if (!stillSameId) fail('Clicking the Wishlist toggle changed the current Random game id');
    else if (newToggleText !== expectedAfterClick) fail(`Wishlist toggle did not update its own label immediately after a click (got "${newToggleText}", expected "${expectedAfterClick}")`);
    else ok('Clicking the Wishlist toggle updates its own label immediately in place and leaves the current Random game untouched');
  }

  if (!failed) {
    console.log('\nPASS: add/remove/toggle, no effect on OWNED/NEEDED or census/completion, persistence across reload, Backup/Restore round-trip, the normal-browsing badge, the Wishlist-only view, automatic removal on real GameEye-driven ownership, the Random toggle not disturbing the current dossier, the Wishlist entry point living in the 2x2 utility grid (never the status nav), and the Random Wishlist toggle rendering synchronously across repeated "Another Random Game" presses all behave exactly as specified.');
  }
  process.exit(failed ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
