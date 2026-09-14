// ShelfCheck Random detail cover-stability regression test.
//
// Runs the REAL app.js + model-fix.js + dossiers.js + every census-mutating script (current
// runtime order, matching tools/census-determinism-test.mjs's MUTATORS list) + census-
// finalize.js + price-fix.js + fun-features-v103.js (the real randomGame()/randomDetailButton())
// + cover-art-v080.js (the real detail()-wrapping cover box) + wishlist-v001.js in a Node vm --
// so this breaks if the real cover/Random logic regresses, not a reimplemented copy of it.
//
// What this proves: cover-art-v080.js's detail() wrap always inserts exactly one
// ".detail-cover-shell" immediately after <h2> -- the same fixed DOM slot -- regardless of
// whether the drawn game has cover art, has no cover art at all, or its cover image fails to
// load. Before the fix, a missing/broken cover removed the element entirely (img.onerror =
// () => img.remove()), collapsing that reserved space and shifting ANOTHER RANDOM GAME/the
// Wishlist toggle (which sit further down, anchored off #v) up by however tall the cover would
// have been. A Node vm can't measure real rendered pixels/aspect ratios, so the actual visual
// stability across differently-shaped cover art is verified manually in the browser (see the PR
// description); this test proves the structural invariant that makes that stability possible.
//
// Usage: node tools/random-cover-stability-test.mjs (exits 1 on failure)
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

// A minimal-but-real #detail host: real (if small) DOM semantics for exactly the operations the
// production code under test performs -- innerHTML replace, tag/class querySelector,
// appendChild (genuinely nested, for the cover shell's own img/fallback child),
// before/after/insertAdjacentElement (siblings within #detail's own flat child list, matching
// the real dossier markup where h2/the cover/the badge/Store Mode/the Random controls are all
// direct children of #detail).
function makeDetailHost() {
  let children = [];
  function queryAmong(list, sel) {
    if (sel.startsWith('.')) { const cls = sel.slice(1); return list.find((c) => (c.className || '').split(/\s+/).includes(cls)) || null; }
    return list.find((c) => c.tagName === sel) || null;
  }
  function makeNode(tagName) {
    const kids = [];
    const node = {
      tagName, className: '', textContent: '', onclick: null, onerror: null, dataset: {}, src: '', alt: '',
      classList: {
        toggle(c, on) {
          const parts = node.className.split(/\s+/).filter(Boolean);
          const has = parts.includes(c), want = on === undefined ? !has : on;
          const kept = parts.filter((x) => x !== c);
          if (want) kept.push(c);
          node.className = kept.join(' ');
        },
      },
      querySelector: (sel) => queryAmong(kids, sel),
      appendChild(el) { kids.push(el); return el; },
      get innerHTML() { return node._html || ''; },
      set innerHTML(html) {
        node._html = html; kids.length = 0;
        if (String(html).includes('cover-fallback')) kids.push({ tagName: 'div', className: 'cover-fallback', textContent: 'PS4 COVER' });
      },
      before(el) { const i = children.indexOf(node); children.splice(i < 0 ? children.length : i, 0, el); },
      after(el) { const i = children.indexOf(node); children.splice(i < 0 ? children.length : i + 1, 0, el); },
      insertAdjacentElement(pos, el) {
        const i = children.indexOf(node);
        if (pos === 'afterend') children.splice(i < 0 ? children.length : i + 1, 0, el);
        else children.splice(i < 0 ? 0 : i, 0, el);
        return el;
      },
    };
    return node;
  }
  const vAnchor = makeNode('div');
  const host = {
    get innerHTML() { return host._lastRawHTML || ''; },
    set innerHTML(html) {
      // A fresh detail() call always starts with a literal <h2> as its first element (see
      // dossiers.js's `top` string) -- synthesize that one real structural fact rather than a
      // full HTML parser, exactly like the rest of this test suite's DOM fakes do.
      host._lastRawHTML = html;
      const h2 = makeNode('h2');
      children = [h2];
    },
    querySelector: (sel) => (sel === '#v' ? vAnchor : queryAmong(children, sel)),
    appendChild(el) { children.push(el); return el; },
    get _children() { return children.slice(); },
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
  run(readFile('fun-features-v103.js'), 'fun-features-v103.js');
  run(readFile('cover-art-v080.js'), 'cover-art-v080.js');
  run(readFile('wishlist-v001.js'), 'wishlist-v001.js');

  let waited = 0;
  while (!run('dossiersReady && hltbReady') && waited < 5000) { await new Promise((r) => setTimeout(r, 100)); waited += 100; }
  if (!run('dossiersReady && hltbReady')) throw new Error('Test setup error: dossiersReady/hltbReady never became true');

  return { run, detailHost };
}

async function main() {
  let failed = false;
  const fail = (msg) => { console.error(`FAIL: ${msg}`); failed = true; };
  const ok = (msg) => console.log(`OK  ${msg}`);

  const { run } = await buildContext();

  const neededIds = run('items.filter(x=>x.set==="INCLUDED"&&effectiveStatus(x)==="NEEDED").map(x=>x.id)');
  if (neededIds.length < 4) throw new Error('Test setup error: not enough NEEDED identities to exercise this test meaningfully');

  // Simulate real-world cover coverage: roughly every other NEEDED identity has cover art, the
  // rest don't -- the exact split census-derived data happens to have doesn't matter, only that
  // this sweep is guaranteed to exercise both branches. Cycle 3 distinct fake URLs standing in
  // for genuinely different intrinsic image dimensions (portrait/square/landscape); a Node vm
  // can't measure rendered pixels, so real aspect-ratio geometry is confirmed manually in-browser.
  const fakeCovers = ['cover-portrait.jpg', 'cover-square.jpg', 'cover-landscape.jpg'];
  const coverMap = {};
  neededIds.forEach((id, i) => { if (i % 2 === 0) coverMap[id] = fakeCovers[i % fakeCovers.length]; });
  run(`window.SHELFCHECK_COVERS = ${JSON.stringify(coverMap)};`);

  console.log(`--- sweeping all ${neededIds.length} NEEDED identities via the real shuffle-bag (every id drawn exactly once) ---`);
  run('filter="NEEDED"');
  const seen = new Set();
  let sawCovered = false, sawUncovered = false, testedBrokenImage = false;
  for (let i = 0; i < neededIds.length; i++) {
    run('window.SHELFCHECK_FUN.randomGame()');
    const id = run('window.SHELFCHECK_FUN.lastRandomWishlistId');
    seen.add(id);
    const expectedUrl = coverMap[id] || null;

    const state = run(`(() => {
      const kids = document.querySelector('#detail')._children;
      const h2Index = kids.findIndex(c => c.tagName === 'h2');
      const shell = kids.find(c => (c.className||'').split(/\\s+/).includes('detail-cover-shell'));
      const img = shell ? shell.querySelector('img') : null;
      const fallback = shell ? shell.querySelector('.cover-fallback') : null;
      return {
        h2Index, shellIndex: shell ? kids.indexOf(shell) : -1,
        hasImg: !!img, imgSrc: img ? img.src : null, hasFallback: !!fallback,
        hasAnotherRandom: !!document.querySelector('#detail').querySelector('.another-random-thumb'),
        hasToggle: !!document.querySelector('#detail').querySelector('.wishlist-toggle'),
      };
    })()`);

    if (state.h2Index !== 0) { fail(`id ${id}: <h2> was not the first element under #detail (index ${state.h2Index})`); continue; }
    if (state.shellIndex !== 1) { fail(`id ${id}: .detail-cover-shell must always sit immediately after <h2> (got index ${state.shellIndex}) -- its position must not depend on cover presence`); continue; }
    if (!state.hasAnotherRandom) fail(`id ${id}: ANOTHER RANDOM GAME missing (PR #70 regression)`);
    if (!state.hasToggle) fail(`id ${id}: Wishlist toggle missing (PR #70 regression)`);

    if (expectedUrl) {
      sawCovered = true;
      if (!state.hasImg || state.hasFallback) fail(`id ${id}: expected a cover <img> (${expectedUrl}) inside the shell, got hasImg=${state.hasImg} hasFallback=${state.hasFallback}`);
      else if (state.imgSrc !== expectedUrl) fail(`id ${id}: cover shell rendered the wrong image (${state.imgSrc}, expected ${expectedUrl})`);

      if (!testedBrokenImage) {
        testedBrokenImage = true;
        run(`document.querySelector('#detail')._children.find(c=>(c.className||'').split(/\\s+/).includes('detail-cover-shell')).querySelector('img').onerror()`);
        const afterError = run(`(() => {
          const kids = document.querySelector('#detail')._children;
          const shell = kids.find(c => (c.className||'').split(/\\s+/).includes('detail-cover-shell'));
          return { shellIndex: shell ? kids.indexOf(shell) : -1, hasImg: shell && !!shell.querySelector('img'), hasFallback: shell && !!shell.querySelector('.cover-fallback') };
        })()`);
        if (afterError.shellIndex !== 1) fail(`id ${id}: a broken cover image must not remove/relocate the reserved shell (got index ${afterError.shellIndex})`);
        else if (afterError.hasImg || !afterError.hasFallback) fail(`id ${id}: a broken cover image must fall back to the placeholder in place, not disappear (hasImg=${afterError.hasImg} hasFallback=${afterError.hasFallback})`);
        else ok(`id ${id}: a broken cover image swaps to the "PS4 COVER" placeholder in place -- the shell stays at the same fixed position`);
      }
    } else {
      sawUncovered = true;
      if (!state.hasFallback || state.hasImg) fail(`id ${id}: identity has no cover art -- expected the fallback placeholder in the reserved shell, got hasImg=${state.hasImg} hasFallback=${state.hasFallback}`);
    }
  }

  if (seen.size !== neededIds.length) fail(`Shuffle-bag did not draw every NEEDED identity exactly once over a full sweep -- saw ${seen.size} distinct ids, expected ${neededIds.length}`);
  else ok(`Every one of the ${neededIds.length} NEEDED identities was drawn exactly once (shuffle-bag/no-repeat intact) and kept the cover shell at a fixed position`);
  if (!sawCovered) fail('Test setup error: swept zero identities with a cover URL -- adjust the coverMap split');
  if (!sawUncovered) fail('Test setup error: swept zero identities without a cover URL -- adjust the coverMap split');
  if (!testedBrokenImage) fail('Test setup error: never exercised the broken-image (onerror) path');
  if (sawCovered && sawUncovered) ok('Both covered and cover-less identities keep ANOTHER RANDOM GAME/the Wishlist toggle present and the cover shell at the same fixed slot');

  if (!failed) {
    console.log('\nPASS: the Random detail cover shell always occupies the same fixed DOM slot immediately after <h2> -- for identities with cover art, without any cover art, and when a cover image fails to load -- so ANOTHER RANDOM GAME and the Wishlist toggle never shift position because of a game\'s cover.');
  }
  process.exit(failed ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
