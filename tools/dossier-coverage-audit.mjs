// ShelfCheck Dossier Coverage Audit -- MEASUREMENT ONLY.
//
// Determines dossier coverage across the current live INCLUDED census by running the REAL
// runtime resolution/classification pipeline in a Node vm:
//   app.js -> model-fix.js -> every census-mutating script -> census-finalize.js
//     (the actual current INCLUDED set, not the raw baked-in data files)
//   -> dossiers.js (the real dossierFor() / dossierQuality() / auditDossiers())
//   -> all 56 dossier-overrides-N.js files -> dossier-apply.js (the real override-merge logic)
// None of that logic is reimplemented here. In particular, coverage is never judged by mere
// object existence: dossierQuality() already distinguishes good/thin/generic/badSummary/missing,
// exactly the classification dossierHtml() uses to decide what a user actually sees ("RESEARCH
// NEEDED" for missing/generic/badSummary; real content for thin/good).
//
// This script only reads existing repo files and writes one audit JSON under audit-out/. It never
// edits, generates, or repairs a dossier, never touches census/state/app data, and makes no
// network calls beyond the same local file reads the real app performs at runtime.
//
// Every category count is cross-checked two independent ways before the report is written:
//   1) usable + missing + suspicious must equal the live INCLUDED count.
//   2) the per-identity tally computed here must equal dossiers.js's own auditDossiers() tally.
// Either mismatch throws (loud failure, no report written) rather than printing a discrepancy.
//
// Usage: node tools/dossier-coverage-audit.mjs
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const REPO = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT_FILE = path.join(REPO, 'audit-out', 'dossier-coverage-audit.json');

// Same list, same order, as every other test/audit script in this repo (tools/census-
// determinism-test.mjs, tools/wishlist-test.mjs, etc.) -- kept in sync with index.html by hand.
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

// dossier-overrides.js is batch 1 (no numeric suffix); dossier-overrides-2.js..-56.js are 2-56.
// Kept in sync with dossier-apply.js's own DOSSIER_OVERRIDES/_2/../_56 global name list by hand.
const OVERRIDE_BATCHES = Array.from({ length: 56 }, (_, i) => {
  const n = i + 1;
  return { file: n === 1 ? 'dossier-overrides.js' : `dossier-overrides-${n}.js`, global: n === 1 ? 'DOSSIER_OVERRIDES' : `DOSSIER_OVERRIDES_${n}` };
});

function readFile(name) { return fs.readFileSync(path.join(REPO, name), 'utf8'); }

// Builds a Node vm context wired the same way every other test/audit script in this repo does
// (fake DOM sufficient for these scripts to run without touching a real page, real fetch() over
// local files, real gzip/base64 decoding), loads the real runtime pipeline into it, and returns a
// `run` function for executing further code in that same context.
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
  if (!run('dossiersReady')) throw new Error('dossiersReady never became true -- shelfcheck-dossiers.txt failed to load in the vm');

  // Snapshot the BASE dossier objects (shelfcheck-dossiers.txt alone) before any override file
  // loads, stashed directly on the context so later run() calls can reference it by identity --
  // source attribution below is then a plain === search, never a re-derived title match.
  ctx.__baseDossiers = run('[...DOSSIERS.values()]');

  for (const batch of OVERRIDE_BATCHES) run(readFile(batch.file), batch.file);
  run(readFile('dossier-apply.js'), 'dossier-apply.js');
  // dossier-apply.js applies synchronously on its own first check once DOSSIERS/dossiersReady and
  // every DOSSIER_OVERRIDES_N global are already defined (true here, since everything above just
  // loaded synchronously) -- this just gives its internal setTimeout(...,100) retry a real window
  // in case that assumption ever stops holding.
  await new Promise((r) => setTimeout(r, 150));

  return { run };
}

function fail(message) {
  throw new Error(`Dossier coverage audit: ${message}`);
}

async function main() {
  const { run } = await buildContext();

  const includedCount = run('items.filter(x=>x.set==="INCLUDED").length');

  // The real, authoritative runtime tally dossiers.js itself computes (and would expose as
  // window.SHELFCHECK_DOSSIER_AUDIT on a real page load) -- kept as an independent cross-check
  // against the per-identity pass below, not as the source of the per-identity rows themselves.
  const liveAudit = run('auditDossiers()');

  // Per-identity detail, built entirely from real dossiers.js functions (dossierFor,
  // dossierQuality, usefulText, summaryLooksWrong) -- this assembles diagnostic context around an
  // already-correct real classification, it never re-decides good/thin/generic/badSummary/missing
  // itself. `d` (the resolved dossier object reference, or null) is carried through so source
  // attribution below can match it by identity; it is stripped before the report is written.
  const rows = run(`
    items.filter(x => x.set === 'INCLUDED').map(x => {
      const d = dossierFor(x);
      const q = dossierQuality(d, x);
      const summaryBad = d ? summaryLooksWrong(d, x) : false;
      const fieldsUseful = {
        summary: d ? usefulText(summaryBad ? '' : d.s) !== '' : false,
        whyItBelongs: d ? usefulText(d.w) !== '' : false,
        watchOutFor: d ? usefulText(d.c) !== '' : false,
        curatorTake: d ? usefulText(d.r) !== '' : false,
        physicalCoverage: d ? usefulText(d.b) !== '' : false,
      };
      const usefulFieldsText = d ? [summaryBad ? '' : d.s, d.w, d.c, d.r, d.b].map(usefulText).filter(Boolean) : [];
      const words = usefulFieldsText.join(' ').split(/\\s+/).filter(Boolean).length;
      let matchedVia = null, matchedAlias = null;
      if (d) {
        if (norm(x.title) === norm(d.t || '')) matchedVia = 'title';
        else {
          const hit = (aliasesById.get(x.id) || []).find(a => DOSSIERS.get(a) === d);
          matchedVia = hit ? 'alias' : 'unknown';
          matchedAlias = hit || null;
        }
      }
      return {
        id: x.id, title: x.title,
        kind: q.kind, score: q.score,
        dossierTitleField: d ? d.t : null,
        matchedVia, matchedAlias,
        summaryBad, fieldsUseful, fieldsUsefulCount: usefulFieldsText.length, wordsAcrossUsefulFields: words,
        d,
      };
    })
  `);

  // Source attribution by real object identity: which exact array (a specific override batch, or
  // the base shelfcheck-dossiers.txt snapshot) literally contains the object dossierFor()
  // resolved. Later-loaded batches overwrite earlier ones for the same title in DOSSIERS
  // (dossier-apply.js's own Map.set), so a resolved object can only be === one specific source
  // array's entry -- walking highest-numbered batch first finds that one true source directly,
  // with no re-derivation of the precedence rule or any title-string matching.
  const sourceArrays = [
    { file: 'shelfcheck-dossiers.txt', arr: run('__baseDossiers') },
    ...OVERRIDE_BATCHES.map((b) => ({ file: b.file, arr: run(`typeof ${b.global}!=='undefined' ? ${b.global} : null`) })),
  ].reverse(); // highest-precedence (last-applied) batch first; base file last.

  for (const r of rows) {
    if (r.d == null) { r.source = null; continue; }
    const hit = sourceArrays.find((s) => Array.isArray(s.arr) && s.arr.includes(r.d));
    r.source = hit ? hit.file : 'unknown';
    delete r.d; // drop the raw cross-realm object reference; source/kind/fields above already capture what matters
  }

  const usable = rows.filter((r) => r.kind === 'good');
  const missing = rows.filter((r) => r.kind === 'missing');
  const suspicious = rows.filter((r) => r.kind === 'thin' || r.kind === 'generic' || r.kind === 'badSummary');
  const suspiciousByKind = {
    thin: suspicious.filter((r) => r.kind === 'thin').length,
    generic: suspicious.filter((r) => r.kind === 'generic').length,
    badSummary: suspicious.filter((r) => r.kind === 'badSummary').length,
  };

  // Cross-check 1: this script's own per-identity tally must equal dossiers.js's own
  // auditDossiers() tally -- any disagreement means this script's row-building has drifted from
  // the real classification, and the report would be misleading.
  const ownTally = { good: usable.length, thin: suspiciousByKind.thin, generic: suspiciousByKind.generic, missing: missing.length, badSummary: suspiciousByKind.badSummary };
  for (const kind of Object.keys(ownTally)) {
    if (ownTally[kind] !== liveAudit[kind]) fail(`per-identity tally disagrees with the live auditDossiers() tally for "${kind}": computed ${ownTally[kind]}, live ${liveAudit[kind]}`);
  }

  // Cross-check 2: the three reported categories must reconcile exactly to the live INCLUDED
  // count -- every identity is counted in exactly one category, nothing dropped or double-counted.
  const total = usable.length + missing.length + suspicious.length;
  if (total !== includedCount) fail(`categories reconcile to ${total}, expected the live INCLUDED count ${includedCount}`);

  function whyText(r) {
    if (r.kind === 'missing') return 'No dossier object resolves for this identity (dossierFor() returned null, including alias fallback).';
    if (r.kind === 'generic') return 'A dossier object exists, but every field is empty or matched a known generic/boilerplate pattern (0 useful fields).';
    if (r.kind === 'badSummary') return `Summary text looks mismatched to a video game (matches a real-person-biography pattern, or shares no title words while reading like an actor/TV bio), and only ${r.fieldsUsefulCount} other useful field(s) exist to compensate (need 2+).`;
    // thin: dossierQuality()'s own condition is (fields<3 || words<55 || summaryBad); report
    // whichever of those already-computed real sub-signals actually applied for this identity.
    const reasons = [];
    if (r.fieldsUsefulCount < 3) reasons.push(`only ${r.fieldsUsefulCount} useful field(s) (need 3+)`);
    if (r.wordsAcrossUsefulFields < 55) reasons.push(`only ${r.wordsAcrossUsefulFields} words across useful fields (need 55+)`);
    if (r.summaryBad) reasons.push('summary looks mismatched to a video game, but kept as thin rather than badSummary because enough other fields exist');
    return `Technically resolves and is shown, but is extremely thin: ${reasons.join('; ')}.`;
  }
  for (const r of [...missing, ...suspicious]) r.why = whyText(r);

  // Deterministic grouping of the missing population by first letter (digits/symbols bucket into
  // "0-9/Other"), sorted A-Z with that bucket last -- a simple, reproducible way to plan batches.
  function firstLetterBucket(title) {
    const c = title.trim()[0]?.toUpperCase() || '';
    return /[A-Z]/.test(c) ? c : '0-9/Other';
  }
  const missingByLetter = {};
  for (const r of missing) missingByLetter[firstLetterBucket(r.title)] = (missingByLetter[firstLetterBucket(r.title)] || 0) + 1;
  const missingByLetterSorted = Object.fromEntries(
    Object.entries(missingByLetter).sort(([a], [b]) => (a === '0-9/Other' ? 1 : b === '0-9/Other' ? -1 : a.localeCompare(b)))
  );

  const pct = (n) => `${((n / includedCount) * 100).toFixed(2)}%`;
  const report = {
    generatedAt: new Date().toISOString(),
    method: 'Runtime resolution trace: app.js -> model-fix.js -> full census-mutator pipeline -> census-finalize.js -> dossiers.js (dossierFor/dossierQuality/auditDossiers, real) -> all 56 dossier-overrides-N.js -> dossier-apply.js (real override merge). Coverage is never judged by object existence alone.',
    includedCensusCount: includedCount,
    liveRuntimeDossierAudit: liveAudit,
    categories: {
      usable: { count: usable.length, pct: pct(usable.length), definition: 'dossierQuality().kind === "good": 3+ useful fields, 55+ words, summary not flagged mismatched. The only tier dossierHtml() shows with a RESEARCHED/confidence badge rather than "NEEDS ENRICHMENT" or a hidden "RESEARCH NEEDED" state.' },
      missing: { count: missing.length, pct: pct(missing.length), definition: 'dossierQuality().kind === "missing": dossierFor() (including alias fallback) resolves to no object at all.' },
      suspicious: {
        count: suspicious.length, pct: pct(suspicious.length),
        definition: 'dossierQuality().kind is "thin", "generic", or "badSummary": an object exists (a naive existence check would call this "covered"), but the real quality gate treats it as unsuitable for purchase research. thin = shown but extremely sparse. generic = every field empty/boilerplate, hidden behind "RESEARCH NEEDED". badSummary = summary text looks mismatched to a video game, also hidden behind "RESEARCH NEEDED".',
        byKind: suspiciousByKind,
      },
    },
    reconciliation: { usable: usable.length, missing: missing.length, suspicious: suspicious.length, total, includedCensusCount: includedCount, matches: true },
    missingByFirstLetter: missingByLetterSorted,
    sampleMissing: missing.slice(0, 25).map((r) => ({ id: r.id, title: r.title, why: r.why })),
    sampleSuspicious: suspicious.slice(0, 25).map((r) => ({ id: r.id, title: r.title, kind: r.kind, score: r.score, source: r.source, why: r.why })),
    rows,
  };

  const json = JSON.stringify(report, null, 2);
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, json);

  console.log('='.repeat(78));
  console.log('DOSSIER COVERAGE AUDIT');
  console.log('='.repeat(78));
  console.log(`Included census identities:      ${includedCount}`);
  console.log(`Usable dossiers:                 ${usable.length}  (${pct(usable.length)})`);
  console.log(`Missing dossiers:                ${missing.length}  (${pct(missing.length)})`);
  console.log(`Suspicious/incomplete dossiers:  ${suspicious.length}  (${pct(suspicious.length)})`);
  console.log(`  - thin:       ${suspiciousByKind.thin}`);
  console.log(`  - generic:    ${suspiciousByKind.generic}`);
  console.log(`  - badSummary: ${suspiciousByKind.badSummary}`);
  console.log(`Reconciliation: ${usable.length} + ${missing.length} + ${suspicious.length} = ${total} == ${includedCount} INCLUDED (verified above; both cross-checks passed).`);
  console.log('\nMissing, by first letter:');
  for (const [letter, n] of Object.entries(missingByLetterSorted)) console.log(`  ${letter}: ${n}`);
  console.log(`\nWrote ${path.relative(REPO, OUT_FILE)} (${Buffer.byteLength(json, 'utf8').toLocaleString()} bytes)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
