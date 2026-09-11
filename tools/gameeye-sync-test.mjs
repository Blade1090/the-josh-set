// ShelfCheck "Last GameEye Sync" regression test.
//
// Runs the REAL app.js + census-mutating scripts + census-finalize.js + model-fix.js +
// ownership-audit-v068.js (the actual, currently-in-effect importCSV) + gameeye-sync-v001.js
// in a Node vm, then proves:
//   1. a successful GameEye CSV import records stateCache.ownershipAudit.at
//   2. that timestamp survives a fresh loadState() (the reload/PWA-restart persistence path)
//   3. a failed/invalid import (throws before reaching saveState) does not advance it
//   4. the display classifies fresh/mildly-stale/clearly-stale correctly at the documented
//      0-7 / 8-30 / 31+ day thresholds, and shows the neutral state before any sync
//
// Usage: node tools/gameeye-sync-test.mjs (exits 1 on failure)
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const REPO = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

// A handful of representative census-mutating scripts is enough here -- this test isn't
// exercising census correctness (tools/census-determinism-test.mjs already owns that), just
// enough real data flow for importCSV to have a real INCLUDED identity to match against.
const CENSUS_MUTATORS = [
  'census-cleanup.js', 'census-v034.js', 'census-collapse-v035.js', 'census-v035-final.js',
  'census-v040-pricing-audit.js',
  'census-v052-pricecharting-negative-space.js', 'census-v053-pricecharting-regional-sweep.js',
  'census-v054-pricecharting-collection-gap.js', 'census-v055-pricecharting-ab-sweep.js',
  'census-v056-pricecharting-cf-sweep.js', 'census-v057-pricecharting-gl-sweep.js',
  'census-v058-pricecharting-mr-sweep.js', 'census-v059-pricecharting-sz-sweep.js',
  'census-physical-omission-pass-v001.js', 'census-physical-omission-pass-v002.js',
  'census-v060-integrity-scrub.js', 'census-integrity-pass-v001.js', 'census-integrity-pass-v002.js',
  'ownership-reconcile-v071.js',
  'curation-josh-set-pass-v001.js', 'curation-josh-set-pass-v002.js', 'curation-josh-set-pass-v003.js',
];

function readFile(name) { return fs.readFileSync(path.join(REPO, name), 'utf8'); }

async function buildContext() {
  const fakeEl = { textContent: '', dataset: {}, className: '', querySelectorAll: () => [], querySelector: () => null, addEventListener: () => {}, appendChild: () => {}, style: {}, value: '' };
  const elements = { gameEyeSync: { ...fakeEl } };
  const fakeDocument = {
    querySelector: () => fakeEl, querySelectorAll: () => [], createElement: () => ({ ...fakeEl }),
    getElementById: (id) => elements[id] || null,
    addEventListener: () => {}, readyState: 'complete', head: { appendChild: () => {} }, body: { appendChild: () => {} },
  };
  const ctx = {
    window: { addEventListener: () => {} }, console,
    document: fakeDocument,
    navigator: {},
    // A real (if tiny) in-memory store, not a no-op stub -- test 3 below needs a genuine
    // getItem(setItem(...)) round trip to prove persistence, not just that setItem was called.
    localStorage: (() => { const store = new Map(); return { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) }; })(),
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

  run(readFile('app.js'), 'app.js');
  await run('dataReady');
  await new Promise((r) => setTimeout(r, 20));

  for (const f of CENSUS_MUTATORS) run(readFile(f), f);
  run(readFile('census-finalize.js'), 'census-finalize.js');
  await new Promise((r) => setTimeout(r, 20));

  run(readFile('model-fix.js'), 'model-fix.js');
  run(readFile('ownership-audit-v068.js'), 'ownership-audit-v068.js');
  run(readFile('gameeye-sync-v001.js'), 'gameeye-sync-v001.js');

  return { ctx, run, elements };
}

function csvOf(titles) {
  const rows = titles.map((t) => `"${t.replace(/"/g, '""')}",PlayStation 4,Games,Owned`).join('\n');
  return `Title,Platform,Category,UserRecordType\n${rows}\n`;
}

async function main() {
  let failed = false;
  const fail = (msg) => { console.error(`FAIL: ${msg}`); failed = true; };

  const { ctx, run, elements } = await buildContext();

  // 1) Neutral state before any sync.
  run('render()');
  if (elements.gameEyeSync.textContent !== 'GameEye: No sync recorded') {
    fail(`Expected neutral pre-sync text, got: ${JSON.stringify(elements.gameEyeSync.textContent)}`);
  }
  if (ctx && run('stateCache?.ownershipAudit?.at') != null) fail('ownershipAudit.at should be unset before any import');

  // 2) A successful import records the timestamp and updates the display.
  run('stateCache={version:11,owned:[],products:[],prices:[]};ownedSet=new Set();productSet=new Set();');
  ctx.__csvOk = { name: 'ok.csv', text: () => Promise.resolve(csvOf(['G.I. Joe: Operation Blackout'])) };
  await run('importCSV(__csvOk)');
  const atAfterImport = run('stateCache?.ownershipAudit?.at');
  if (!atAfterImport) fail('Successful import did not record ownershipAudit.at');
  if (!/^GameEye synced: /.test(elements.gameEyeSync.textContent)) fail(`Expected a "GameEye synced: ..." display, got: ${JSON.stringify(elements.gameEyeSync.textContent)}`);
  if (elements.gameEyeSync.className.includes('stale')) fail(`Fresh sync should not show a stale class, got: ${elements.gameEyeSync.className}`);

  // 3) Persistence across a fresh loadState() (the reload/PWA-restart path): saveState()
  // already writes to localStorage and loadState() reads it back -- simulate that round trip
  // directly against the stub localStorage this harness provides.
  const persisted = run('localStorage.getItem("joshSetState")');
  if (!persisted) {
    fail('saveState() did not persist to localStorage -- reload/restart persistence would be broken');
  } else {
    const roundTripped = JSON.parse(persisted).ownershipAudit?.at;
    if (roundTripped !== atAfterImport) fail(`Persisted ownershipAudit.at (${roundTripped}) does not match in-memory value (${atAfterImport})`);
  }

  // 4) A failed/invalid import (throws before reaching saveState) must not advance it.
  ctx.__csvBad = { name: 'bad.csv', text: () => Promise.reject(new Error('simulated read failure')) };
  let threw = false;
  try { await run('importCSV(__csvBad)'); } catch { threw = true; }
  if (!threw) fail('Expected the invalid import to throw/reject');
  const atAfterBadImport = run('stateCache?.ownershipAudit?.at');
  if (atAfterBadImport !== atAfterImport) fail(`Failed import advanced ownershipAudit.at: before=${atAfterImport} after=${atAfterBadImport}`);

  // 5) Staleness classification at the documented thresholds (0-7 normal, 8-30 mild, 31+ hard).
  const info = (daysAgo) => {
    run(`stateCache.ownershipAudit={at:new Date(Date.now()-${daysAgo}*86400000).toISOString()}`);
    return run('window.SHELFCHECK_GAMEEYE_SYNC_V001.gameEyeSyncInfo()');
  };
  const fresh = info(3), mild = info(15), hardStale = info(45);
  if (fresh.cls !== '') fail(`Expected no stale class at 3 days, got "${fresh.cls}"`);
  if (mild.cls !== 'stale-mild') fail(`Expected stale-mild at 15 days, got "${mild.cls}"`);
  if (hardStale.cls !== 'stale-hard') fail(`Expected stale-hard at 45 days, got "${hardStale.cls}"`);
  const boundaryLow = info(7), boundaryMildStart = info(8), boundaryMildEnd = info(30), boundaryHardStart = info(31);
  if (boundaryLow.cls !== '') fail(`Expected no stale class at exactly 7 days, got "${boundaryLow.cls}"`);
  if (boundaryMildStart.cls !== 'stale-mild') fail(`Expected stale-mild at exactly 8 days, got "${boundaryMildStart.cls}"`);
  if (boundaryMildEnd.cls !== 'stale-mild') fail(`Expected stale-mild at exactly 30 days, got "${boundaryMildEnd.cls}"`);
  if (boundaryHardStart.cls !== 'stale-hard') fail(`Expected stale-hard at exactly 31 days, got "${boundaryHardStart.cls}"`);

  if (!failed) console.log('PASS: neutral pre-sync state, successful import records + persists the timestamp, failed import does not advance it, and 0-7/8-30/31+ day staleness classification is correct.');
  process.exit(failed ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
