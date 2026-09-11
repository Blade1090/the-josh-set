// ShelfCheck GameEye ownership-import regression test.
//
// Runs the REAL app.js + every census-mutating script (current runtime order, matching
// tools/census-determinism-test.mjs's MUTATORS list) + census-finalize.js + model-fix.js +
// ownership-audit-v068.js (the actual, currently-in-effect importCSV) in a Node vm, then feeds
// a synthetic GameEye CSV through the real importCSV -- so this test breaks if the real
// reconciliation logic regresses, not just a reimplemented copy of it.
//
// Regression case: a GameEye/PSN title with a trailing "(...)" edition tag (e.g. "(Day One
// Edition)") that candidates() (app.js) did not used to strip -- only a trailing "[...]"
// bracket group and a small fixed suffix-phrase list were stripped -- so a physical edition
// whose census title has no such tag went silently UNRESOLVED. See "Dragon Quest Heroes: The
// World Tree's Woe and the Blight Below" (census id 406) vs. the unrelated, separately-owned
// "Dragon Quest Heroes II [Explorer's Edition]" (census id 405) for the real-world case this
// reproduces -- both must resolve to their own distinct identity, never to each other.
//
// Usage: node tools/gameeye-import-test.mjs (exits 1 on failure)
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
  'census-v060-integrity-scrub.js', 'census-integrity-pass-v001.js', 'census-integrity-pass-v002.js',
  'ownership-reconcile-v071.js',
  'curation-josh-set-pass-v001.js', 'curation-josh-set-pass-v002.js', 'curation-josh-set-pass-v003.js',
];

function readFile(name) { return fs.readFileSync(path.join(REPO, name), 'utf8'); }

async function buildContext() {
  const fakeEl = { textContent: '', dataset: {}, querySelectorAll: () => [], querySelector: () => null, addEventListener: () => {}, appendChild: () => {}, style: {}, value: '' };
  const fakeDocument = {
    querySelector: () => fakeEl, querySelectorAll: () => [], createElement: () => ({ ...fakeEl }),
    addEventListener: () => {}, readyState: 'complete', head: { appendChild: () => {} }, body: { appendChild: () => {} },
  };
  const ctx = {
    window: { addEventListener: () => {} }, console,
    document: fakeDocument,
    navigator: {},
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
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

  for (const f of CENSUS_MUTATORS) run(readFile(f), f);
  run(readFile('census-finalize.js'), 'census-finalize.js');
  await new Promise((r) => setTimeout(r, 20));

  run(readFile('model-fix.js'), 'model-fix.js');
  run(readFile('ownership-audit-v068.js'), 'ownership-audit-v068.js');

  return { ctx, run };
}

function csvOf(titles) {
  const rows = titles.map((t) => `"${t.replace(/"/g, '""')}",PlayStation 4,Games,Owned`).join('\n');
  return `Title,Platform,Category,UserRecordType\n${rows}\n`;
}

async function main() {
  const { ctx, run } = await buildContext();

  const included = run('items.filter(x=>x.set==="INCLUDED").length');
  console.log(`INCLUDED: ${included}`);

  const titles = [
    'G.I. Joe: Operation Blackout',
    "Dragon Quest Heroes: The World Tree's Woe and the Blight Below (Day One Edition)",
    "Dragon Quest Heroes II [Explorer's Edition]",
  ];
  ctx.__testFile = { name: 'gameeye-import-test.csv', text: () => Promise.resolve(csvOf(titles)) };
  run('stateCache={version:11,owned:[],products:[],prices:[]};ownedSet=new Set();productSet=new Set();');
  await run('importCSV(__testFile)');
  const audit = run('window.SHELFCHECK_OWNERSHIP_AUDIT');

  const byTitle = (t) => audit.ledger.find((r) => r.gameEye === t);
  const giJoe = byTitle('G.I. Joe: Operation Blackout');
  const dqh1 = byTitle("Dragon Quest Heroes: The World Tree's Woe and the Blight Below (Day One Edition)");
  const dqh2 = byTitle("Dragon Quest Heroes II [Explorer's Edition]");

  let failed = false;
  const fail = (msg) => { console.error(`FAIL: ${msg}`); failed = true; };

  if (!giJoe || giJoe.matchType === 'UNRESOLVED') fail(`G.I. Joe: Operation Blackout did not match (got ${JSON.stringify(giJoe)})`);
  else if (!giJoe.identities.includes('G.I. Joe: Operation Blackout')) fail(`G.I. Joe: Operation Blackout matched the wrong identity: ${JSON.stringify(giJoe)}`);

  if (!dqh1 || dqh1.matchType === 'UNRESOLVED') fail(`Dragon Quest Heroes (Day One Edition) went UNRESOLVED -- the edition-suffix fix regressed (got ${JSON.stringify(dqh1)})`);
  else if (!dqh1.identities.includes("Dragon Quest Heroes: The World Tree's Woe and the Blight Below")) fail(`Dragon Quest Heroes (Day One Edition) matched the wrong identity: ${JSON.stringify(dqh1)}`);

  if (!dqh2 || dqh2.matchType === 'UNRESOLVED') fail(`Dragon Quest Heroes II [Explorer's Edition] did not match (got ${JSON.stringify(dqh2)})`);
  else if (!dqh2.identities.includes('Dragon Quest Heroes II')) fail(`Dragon Quest Heroes II [Explorer's Edition] matched the wrong identity: ${JSON.stringify(dqh2)}`);

  // The specific regression this guards against: the two Dragon Quest Heroes identities must
  // never receive each other's ownership credit.
  if (dqh1 && dqh2 && dqh1.ids.some((id) => dqh2.ids.includes(id))) {
    fail(`Dragon Quest Heroes rows share an identity id -- cross-contamination between id 405/406: dqh1.ids=${JSON.stringify(dqh1.ids)} dqh2.ids=${JSON.stringify(dqh2.ids)}`);
  }

  if (audit.unresolvedRows !== 0) fail(`Expected 0 unresolved rows, got ${audit.unresolvedRows}: ${JSON.stringify(audit.unresolved)}`);
  if (!audit.rowAccountingOK || !audit.identityAccountingOK || !audit.bonusAccountingOK) {
    fail(`Ownership audit accounting failed: rowAccountingOK=${audit.rowAccountingOK} identityAccountingOK=${audit.identityAccountingOK} bonusAccountingOK=${audit.bonusAccountingOK}`);
  }

  if (!failed) {
    console.log('PASS: G.I. Joe, Dragon Quest Heroes, and Dragon Quest Heroes II all resolve to their own distinct identity; 0 unresolved; accounting verified.');
  }
  process.exit(failed ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
