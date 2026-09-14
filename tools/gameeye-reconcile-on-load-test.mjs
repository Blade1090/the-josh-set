// ShelfCheck GameEye reconciliation-on-load regression test.
//
// Reproduces the ACTUAL reported failure, not just a synthetic fresh-import unit case: a real
// user's browser can have a PERSISTED stateCache (localStorage) from a GameEye import that ran
// BEFORE a product/identity mapping existed, so that row went UNRESOLVED and was saved that
// way. A later page load re-runs the census mutators (so the census/product data itself is
// current immediately), but the user's own already-saved ownedSet/productSet do not
// automatically refresh -- nothing previously re-checked stateCache.ownershipAudit.
// unresolvedTitles against the new data. tools/gameeye-import-test.mjs alone cannot catch this
// class of bug: it always starts from a blank stateCache and imports fresh, which exercises a
// completely different code path (importCSV itself) than what actually failed for Josh (a
// SECOND page load with STALE persisted state, and no automatic reconciliation ever running).
//
// This test drives two separate, realistic page loads sharing one real (in-memory,
// Map-backed) localStorage, exactly like reloading a real browser:
//
//  Load 1 -- simulates the census as it stood BEFORE the Shenmue product mapping existed
//  (every current census-mutating script EXCEPT ownership-reconcile-v072.js) and runs the real
//  importCSV against a GameEye CSV containing "Shenmue I & II". This reproduces the original
//  failure genuinely (not a hand-crafted fixture): the row goes UNRESOLVED, gets persisted to
//  localStorage exactly as it would in a real browser, and Shenmue I/II are confirmed NEEDED.
//
//  Load 2 -- simulates a fresh page load with the CURRENT, complete script list (including
//  ownership-reconcile-v072.js, the product-mapping fix, and gameeye-reconcile-v001.js, the
//  reconciliation-on-load fix) against that SAME persisted localStorage, WITHOUT ever calling
//  importCSV again -- exactly what happens when a user just reopens the app. Asserts both
//  Shenmue I and Shenmue II finish with effectiveStatus() === 'OWNED' and that progress()
//  reflects both identities, with no title-specific code anywhere in the fix.
//
// Usage: node tools/gameeye-reconcile-on-load-test.mjs (exits 1 on failure)
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import zlib from 'node:zlib';
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

// A real, shared, in-memory localStorage backing store -- persists across separate vm contexts
// exactly like a real browser's localStorage persists across page loads/reloads.
function makeSharedLocalStorage() {
  const store = new Map();
  return {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
}

async function buildContext(mutatorFiles, sharedLocalStorage, extraScripts = []) {
  const fakeEl = { textContent: '', dataset: {}, querySelectorAll: () => [], querySelector: () => null, addEventListener: () => {}, appendChild: () => {}, style: {}, value: '' };
  const fakeDocument = {
    querySelector: () => fakeEl, querySelectorAll: () => [], createElement: () => ({ ...fakeEl }),
    addEventListener: () => {}, readyState: 'complete', head: { appendChild: () => {} }, body: { appendChild: () => {} },
  };
  const ctx = {
    window: { addEventListener: () => {} }, console,
    document: fakeDocument,
    navigator: {},
    localStorage: sharedLocalStorage,
    atob: (s) => Buffer.from(s, 'base64').toString('binary'),
    btoa: (s) => Buffer.from(s, 'binary').toString('base64'),
    DecompressionStream, Response, Blob, Uint8Array,
    fetch: (name) => {
      const p = path.join(REPO, name);
      return Promise.resolve({ ok: fs.existsSync(p), text: () => Promise.resolve(fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '') });
    },
    setTimeout, clearTimeout, setInterval, clearInterval,
    dlg: { close() {} },
  };
  vm.createContext(ctx);
  const run = (code, filename) => vm.runInContext(code, ctx, { filename: filename || '<eval>', displayErrors: true });

  // Top-level let/const bindings from a vm-run script are not exposed as own-properties on
  // the context object, so every read/write below goes through run(<expr>), not ctx.<name>.
  run(readFile('app.js'), 'app.js');
  await run('dataReady');
  await new Promise((r) => setTimeout(r, 20));

  for (const f of mutatorFiles) run(readFile(f), f);
  run(readFile('census-finalize.js'), 'census-finalize.js');
  await new Promise((r) => setTimeout(r, 20));

  run(readFile('model-fix.js'), 'model-fix.js');
  run(readFile('ownership-audit-v068.js'), 'ownership-audit-v068.js');
  for (const f of extraScripts) run(readFile(f), f);
  // gameeye-reconcile-v001.js polls on censusFinalized via setTimeout(100ms) internally.
  await new Promise((r) => setTimeout(r, 400));

  return { ctx, run };
}

function csvOf(titles) {
  const rows = titles.map((t) => `"${t.replace(/"/g, '""')}",PlayStation 4,Games,Owned`).join('\n');
  return `Title,Platform,Category,UserRecordType\n${rows}\n`;
}

async function main() {
  const sharedLocalStorage = makeSharedLocalStorage();
  let failed = false;
  const fail = (msg) => { console.error(`FAIL: ${msg}`); failed = true; };

  // --- Load 1: the census as it stood BEFORE the Shenmue product mapping existed ---
  const load1Mutators = CENSUS_MUTATORS.filter((f) => f !== 'ownership-reconcile-v072.js');
  const { ctx: ctx1, run: run1 } = await buildContext(load1Mutators, sharedLocalStorage);

  const shenmueIId = run1('items.find(x=>norm(x.title)==="shenmue i").id');
  const shenmueIIId = run1('items.find(x=>norm(x.title)==="shenmue ii").id');

  ctx1.__testFile = { name: 'josh-gameeye-sep12.csv', text: () => Promise.resolve(csvOf(['Shenmue I & II'])) };
  await run1('importCSV(__testFile)');
  const audit1 = run1('window.SHELFCHECK_OWNERSHIP_AUDIT');
  const shenmueRow1 = audit1.ledger.find((r) => r.gameEye === 'Shenmue I & II');

  console.log('Load 1 (pre-fix census) import result:', JSON.stringify(shenmueRow1));
  if (!shenmueRow1 || shenmueRow1.matchType !== 'UNRESOLVED') {
    fail(`Expected Load 1 to reproduce the original UNRESOLVED failure for "Shenmue I & II" (got ${JSON.stringify(shenmueRow1)}) -- if this no longer reproduces, the test fixture itself needs updating`);
  }
  const statusI_load1 = run1(`effectiveStatus(byId.get(${shenmueIId}))`);
  const statusII_load1 = run1(`effectiveStatus(byId.get(${shenmueIIId}))`);
  console.log(`Load 1: Shenmue I=${statusI_load1}, Shenmue II=${statusII_load1}`);
  if (statusI_load1 !== 'NEEDED' || statusII_load1 !== 'NEEDED') {
    fail(`Expected Load 1 to show both Shenmue identities as NEEDED (reproducing the reported bug), got I=${statusI_load1} II=${statusII_load1}`);
  }

  // The persisted localStorage now holds exactly what Josh's real browser would have saved:
  // Shenmue I & II went UNRESOLVED, so ownedSet lacks both ids.

  // --- Load 2: a fresh page load with the CURRENT full script list (product-mapping fix +
  // reconciliation-on-load fix), against that SAME persisted state, WITHOUT re-importing ---
  const { run: run2 } = await buildContext(CENSUS_MUTATORS, sharedLocalStorage, ['gameeye-reconcile-v001.js']);

  const reconcileResult = run2('window.SHELFCHECK_GAMEEYE_RECONCILE_ON_LOAD');
  console.log('Load 2 reconciliation-on-load result:', JSON.stringify(reconcileResult));
  if (!reconcileResult || !reconcileResult.reconciled?.length) {
    fail(`Expected gameeye-reconcile-v001.js to reconcile the previously-unresolved "Shenmue I & II" row on Load 2 (got ${JSON.stringify(reconcileResult)})`);
  }

  const statusI_load2 = run2(`effectiveStatus(byId.get(${shenmueIId}))`);
  const statusII_load2 = run2(`effectiveStatus(byId.get(${shenmueIIId}))`);
  console.log(`Load 2: Shenmue I=${statusI_load2}, Shenmue II=${statusII_load2}`);
  if (statusI_load2 !== 'OWNED') fail(`Shenmue I did not finish OWNED after reconciliation-on-load (got ${statusI_load2})`);
  if (statusII_load2 !== 'OWNED') fail(`Shenmue II did not finish OWNED after reconciliation-on-load (got ${statusII_load2})`);

  const ownedIncludesBoth = run2(`ownedSet.has(${shenmueIId}) && ownedSet.has(${shenmueIIId})`);
  if (!ownedIncludesBoth) fail(`ownedSet does not contain both Shenmue I and Shenmue II ids after reconciliation`);

  const stillUnresolved = run2('stateCache?.ownershipAudit?.unresolvedTitles || []');
  if (stillUnresolved.includes('Shenmue I & II')) fail(`"Shenmue I & II" is still listed as unresolved in persisted state after reconciliation: ${JSON.stringify(stillUnresolved)}`);

  const includedOwnedCount = run2('[...ownedSet].filter(id=>byId.get(id)?.set==="INCLUDED").length');
  console.log(`Load 2: owned INCLUDED count = ${includedOwnedCount}`);
  if (includedOwnedCount < 2) fail(`Expected progress/owned count to reflect both reconciled Shenmue identities, got owned INCLUDED count ${includedOwnedCount}`);

  if (!failed) {
    console.log('PASS: the real Load-1-then-Load-2 lifecycle reproduces the reported failure (Load 1: both NEEDED, UNRESOLVED) and confirms the fix (Load 2: reconciliation-on-load runs with no re-import, both Shenmue I and Shenmue II finish OWNED, progress reflects both, no title-specific code involved).');
  }
  process.exit(failed ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
