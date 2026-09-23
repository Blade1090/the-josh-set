// ShelfCheck pricing campaign -- Phase 1 PRICE PENDING queue builder. MEASUREMENT ONLY.
//
// Runs the real runtime pipeline (app.js -> model-fix.js -> every census-mutating script ->
// census-finalize.js -> dossiers.js -> all dossier-overrides-N.js -> dossier-apply.js -> every
// price-*.js patch, in the same order as index.html) in one deterministic Node vm pass, then
// reports every currently-INCLUDED identity with no usable price (PRICE PENDING), enriched with:
//   - the exact lookup key priceFor()/priceMap use (norm(title))
//   - whether a dossier exists and its physical-coverage text (dossierFor(x).b), when useful
//   - whether the identity is a component of a multi-identity physical product/compilation
//   - a first-pass EASY/MODERATE/HARD/MODEL REVIEW difficulty heuristic (structural signals
//     only -- title-language/region cues and dossier presence -- NOT a substitute for the real
//     per-identity research Phase 3 must still do)
//
// This never edits census/dossier/price data. It only reads existing repo files and writes one
// report under audit-out/.
//
// Usage: node tools/price-pending-queue-audit.mjs [--json out.json] [--md out.md]
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const REPO = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

// Kept in sync BY HAND with index.html's actual <script> order -- see tools/price-runtime-
// audit.mjs and tools/dossier-coverage-audit.mjs for the same convention (and the same risk:
// a new census-mutating script landing in index.html without a matching entry here silently
// goes stale). Verified against index.html on 2026-09-22 -- includes curation-josh-set-pass-
// v005.js/v006.js, which tools/census-determinism-test.mjs and tools/dossier-coverage-audit.mjs
// do NOT yet include (flagged separately; out of scope for this pricing pass to fix).
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
  'curation-josh-set-pass-v004.js', 'curation-josh-set-pass-v005.js', 'curation-josh-set-pass-v006.js',
];
const PRICE_FILES = [
  'price-import-v037.js', 'price-alias-v039.js', 'price-alias-v040.js', 'price-final-v041.js',
  'price-online-v041.js', 'price-negative-space-v042.js', 'price-direct-v050.js', 'price-direct-v051.js',
  'public-prices-full-v066.js', 'price-new-games-v073.js', 'price-new-games-v074.js',
  'price-new-games-v075.js', 'price-whole-census-v077.js', 'price-batch-001-v079.js',
  'price-batch-003-v082.js', 'price-batch-004-v083.js', 'price-batch-005-v084.js', 'price-batch-006-v085.js', 'price-fix.js',
  'price-product-inherited-v086.js',
];
const OVERRIDE_BATCHES = Array.from({ length: 63 }, (_, i) => {
  const n = i + 1;
  return { file: n === 1 ? 'dossier-overrides.js' : `dossier-overrides-${n}.js`, global: n === 1 ? 'DOSSIER_OVERRIDES' : `DOSSIER_OVERRIDES_${n}` };
});

function readFile(name) { return fs.readFileSync(path.join(REPO, name), 'utf8'); }

async function buildContext() {
  const fakeEl = { textContent: '', dataset: {}, querySelectorAll: () => [], querySelector: () => null, addEventListener: () => {}, appendChild: () => {}, style: {}, value: '' };
  const fakeDocument = {
    querySelector: () => fakeEl, querySelectorAll: () => [], createElement: () => ({ ...fakeEl, appendChild: () => {}, classList: { toggle() {}, add() {} } }),
    addEventListener: () => {}, readyState: 'complete', head: { appendChild: () => {} }, body: { appendChild: () => fakeEl },
    getElementById: () => null,
  };
  const ctx = {
    window: { addEventListener: () => {} }, console,
    document: fakeDocument, navigator: {},
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    atob: (s) => Buffer.from(s, 'base64').toString('binary'), btoa: (s) => Buffer.from(s, 'binary').toString('base64'),
    DecompressionStream, Response, Blob, Uint8Array,
    fetch: (name) => { const p = path.join(REPO, name); return Promise.resolve({ ok: fs.existsSync(p), text: () => Promise.resolve(fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '') }); },
    setTimeout, clearTimeout, setInterval, clearInterval,
    dlg: { close() {}, showModal() {}, open: false, scrollTop: 0 },
  };
  vm.createContext(ctx);
  const run = (code, filename) => vm.runInContext(code, ctx, { filename: filename || '<eval>', displayErrors: true });

  run(readFile('app.js'), 'app.js');
  await run('dataReady');
  await new Promise((r) => setTimeout(r, 20));
  run(readFile('model-fix.js'), 'model-fix.js');
  for (const f of CENSUS_MUTATORS) run(readFile(f), f);
  run(readFile('census-finalize.js'), 'census-finalize.js');
  await new Promise((r) => setTimeout(r, 20));
  run(readFile('dossiers.js'), 'dossiers.js');

  let waited = 0;
  while (!run('dossiersReady && hltbReady') && waited < 8000) { await new Promise((r) => setTimeout(r, 100)); waited += 100; }
  if (!run('dossiersReady')) throw new Error('dossiersReady never became true');

  for (const batch of OVERRIDE_BATCHES) run(readFile(batch.file), batch.file);
  run(readFile('dossier-apply.js'), 'dossier-apply.js');
  await new Promise((r) => setTimeout(r, 150));

  // Now run the price pipeline on top of the same finalized census + dossiers.
  for (const f of PRICE_FILES) run(readFile(f), f);
  await new Promise((r) => setTimeout(r, 1600)); // let price-online-v041 async decompression + public-prices-full-v066 polling settle

  return { run };
}

function regionHint(text) {
  if (!text) return null;
  const t = text.toLowerCase();
  if (/\bpal\b/.test(t)) return 'PAL/EU';
  if (/\basian english\b/.test(t)) return 'Asian English';
  if (/\bjapan(ese)?\b|\bjp\b/.test(t)) return 'Japan';
  if (/\blimited run\b/.test(t)) return 'Limited Run Games';
  if (/\bstrictly limited\b/.test(t)) return 'Strictly Limited Games';
  if (/\beastasiasoft\b/.test(t)) return 'eastasiasoft';
  if (/\bplay-?asia\b/.test(t)) return 'Play-Asia';
  if (/\bred art\b/.test(t)) return 'Red Art Games';
  if (/\bsuper rare\b/.test(t)) return 'Super Rare Games';
  return null;
}

async function main() {
  const { run } = await buildContext();

  const includedCount = run('items.filter(x=>x.set==="INCLUDED").length');

  const rows = run(`
    (() => {
      const isUsable = v => v != null && Number.isFinite(Number(v)) && Number(v) > 0;
      const idx = typeof ensureMergedProducts === 'function' ? ensureMergedProducts() : null;
      const compIds = new Set();
      if (idx) {
        const seen = new Set();
        for (const p of idx.values()) {
          if (seen.has(p.key)) continue; seen.add(p.key);
          const comps = [...new Set(p.ids || [])].filter(id => byId.get(id)?.set === 'INCLUDED');
          if (comps.length > 1) for (const id of comps) compIds.add(id);
        }
      }
      return items.filter(x => x.set === 'INCLUDED').map(x => {
        const p = typeof priceFor === 'function' ? priceFor(x) : null;
        const v = p?.m ?? p?.x ?? x.max;
        const priced = isUsable(v);
        const d = typeof dossierFor === 'function' ? dossierFor(x) : null;
        return {
          id: x.id, title: x.title, priced,
          lookupKey: norm(x.title),
          compilationComponent: compIds.has(x.id),
          baseline: x.baseline,
          dossierPhysicalNote: (d && typeof usefulText === 'function' ? usefulText(d.b) : (d?.b || '')) || null,
        };
      });
    })()
  `);

  const pending = rows.filter((r) => !r.priced);
  const priced = rows.length - pending.length;

  for (const r of pending) {
    r.region = regionHint(r.dossierPhysicalNote) || regionHint(r.title);
    r.hasDossierContext = !!(r.dossierPhysicalNote && r.dossierPhysicalNote.trim().length > 0);
    // First-pass structural difficulty heuristic ONLY -- not a research verdict.
    if (r.compilationComponent) r.difficulty = 'MODEL REVIEW';
    else if (r.region && r.region !== 'PAL/EU') r.difficulty = 'HARD';
    else if (r.region === 'PAL/EU') r.difficulty = 'MODERATE';
    else if (r.hasDossierContext) r.difficulty = 'EASY';
    else r.difficulty = 'MODERATE';
    delete r.priced;
  }
  pending.sort((a, b) => a.id - b.id);

  const summary = {
    generatedAt: new Date().toISOString(),
    included: includedCount,
    priced,
    pending: pending.length,
    coveragePercent: +(100 * priced / includedCount).toFixed(2),
    difficultyBreakdown: pending.reduce((acc, r) => { acc[r.difficulty] = (acc[r.difficulty] || 0) + 1; return acc; }, {}),
    compilationComponentPendingCount: pending.filter((r) => r.compilationComponent).length,
    withDossierContextCount: pending.filter((r) => r.hasDossierContext).length,
    withoutDossierContextCount: pending.filter((r) => !r.hasDossierContext).length,
  };

  // Integrity checks over the live-merged stateCache.prices (the priceMap tier): duplicate
  // normalized keys, suspicious zero/negative/non-finite values, and orphan records that no
  // longer resolve to any currently-INCLUDED identity (e.g. left behind by a census dedup/
  // exclusion pass after the price entry was recorded under the old id/title).
  const integrity = run(`
    (() => {
      const includedTitles = new Set(items.filter(x => x.set === 'INCLUDED').map(x => norm(x.title)));
      const includedAliasKeys = new Set();
      for (const [alias, id] of (DATA.a || [])) if (byId.get(id)?.set === 'INCLUDED') includedAliasKeys.add(norm(alias));
      const prices = stateCache?.prices || [];
      const byKey = new Map();
      for (const p of prices) {
        const k = norm(p.t);
        if (!byKey.has(k)) byKey.set(k, []);
        byKey.get(k).push(p);
      }
      const duplicateKeys = [...byKey.entries()].filter(([, list]) => list.length > 1)
        .map(([key, list]) => ({ key, entries: list.map(p => ({ t: p.t, m: p.m, pc: p.pc })) }));
      const suspicious = prices.filter(p => {
        const m = Number(p.m ?? p.x);
        return !Number.isFinite(m) || m <= 0;
      }).map(p => ({ t: p.t, m: p.m, x: p.x, pc: p.pc }));
      const orphans = prices.filter(p => !includedTitles.has(norm(p.t)) && !includedAliasKeys.has(norm(p.t)))
        .map(p => ({ t: p.t, m: p.m, pc: p.pc }));
      return { totalPriceMapEntries: prices.length, duplicateKeys, suspiciousValues: suspicious, orphanRecords: orphans };
    })()
  `);
  summary.integrity = {
    totalPriceMapEntries: integrity.totalPriceMapEntries,
    duplicateKeyCount: integrity.duplicateKeys.length,
    suspiciousValueCount: integrity.suspiciousValues.length,
    orphanRecordCount: integrity.orphanRecords.length,
  };

  const jsonIdx = process.argv.indexOf('--json');
  if (jsonIdx !== -1 && process.argv[jsonIdx + 1]) {
    fs.writeFileSync(process.argv[jsonIdx + 1], JSON.stringify({ summary, pending, integrity }, null, 2));
  }

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });
