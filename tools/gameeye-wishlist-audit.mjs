// ShelfCheck one-time GameEye Wishlist migration -- AUDIT ONLY, no state is written anywhere.
//
// Reconciles the Wishlist rows of a combined GameEye export (Owned + Wishlist in one CSV)
// against the current finalized ShelfCheck census, using the exact same real production
// pieces ownership-audit-v068.js's real importCSV() uses for Owned rows (candidates(), norm(),
// productKeys()/ensureMergedProducts(), productMap, aliasesById) -- run inside a Node vm on the
// REAL app.js + model-fix.js + every census mutator + census-finalize.js + ownership-audit-v068.js,
// never a reimplemented copy of the matching logic.
//
// Ground truth for "already-OWNED": rather than guessing at browser localStorage, the SAME
// export's own Owned rows are run through the REAL importCSV() to compute the current owned
// identity set -- self-contained and reproducible from this one file.
//
// Unlike importCSV's Owned-row matching (which is fine to take the first candidate match, since
// that's already a well-established, low-stakes path), this Wishlist reconciliation is
// deliberately stricter: for every row it collects EVERY distinct match across every normalized
// candidate string (not just the first), and flags a row AMBIGUOUS rather than silently picking
// one if more than one distinct product/identity resolution is found.
//
// Usage: node tools/gameeye-wishlist-audit.mjs <path-to-ge-export.csv>
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

async function buildContext() {
  const fakeEl = { textContent: '', dataset: {}, querySelectorAll: () => [], querySelector: () => null, addEventListener: () => {}, appendChild: () => {}, style: {}, value: '' };
  const fakeDocument = {
    querySelector: () => fakeEl, querySelectorAll: () => [], createElement: () => ({ ...fakeEl, appendChild: () => {}, classList: { toggle() {}, add() {} } }),
    addEventListener: () => {}, readyState: 'complete', head: { appendChild: () => {} }, body: { appendChild: () => {} },
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
  run(readFile('dossiers.js'), 'dossiers.js');
  for (const f of CENSUS_MUTATORS) run(readFile(f), f);
  run(readFile('census-finalize.js'), 'census-finalize.js');
  await new Promise((r) => setTimeout(r, 20));
  run(readFile('price-fix.js'), 'price-fix.js');
  run(readFile('ownership-audit-v068.js'), 'ownership-audit-v068.js');

  return { run };
}

function main() {
  const csvPath = process.argv[2];
  if (!csvPath) { console.error('Usage: node tools/gameeye-wishlist-audit.mjs <path-to-ge-export.csv>'); process.exit(1); }
  const csvText = fs.readFileSync(csvPath, 'utf8');
  return { csvText, csvPath };
}

const { csvText, csvPath } = main();

const { run } = await buildContext();

const includedCount = run('items.filter(x=>x.set==="INCLUDED").length');
console.log(`ShelfCheck census currently finalized: INCLUDED=${includedCount}`);

// --- Raw row counts, using the REAL parseCSV (quote-aware, matches production exactly) ---
run(`globalThis.__csv = ${JSON.stringify(csvText)};`);
const parsed = run(`(() => {
  const rows = parseCSV(__csv);
  const header = rows[0];
  const ix = Object.fromEntries(header.map((x,i)=>[x,i]));
  const data = rows.slice(1);
  return { header, ix, totalRows: data.length };
})()`);
console.log('CSV header:', parsed.header);
console.log(`Total GameEye records (excluding header): ${parsed.totalRows}`);

const counts = run(`(() => {
  const rows = parseCSV(__csv).slice(1);
  const ix = Object.fromEntries(parseCSV(__csv)[0].map((x,i)=>[x,i]));
  let owned=0, wishlist=0, ps4Wishlist=0;
  for (const r of rows) {
    const typ=(r[ix.UserRecordType]||'').trim().toLowerCase();
    if (typ==='owned') owned++;
    if (typ==='wishlist') {
      wishlist++;
      const platform=(r[ix.Platform]||'').trim().toLowerCase();
      const cat=(r[ix.Category]||'').trim().toLowerCase();
      if (['sony playstation 4','playstation 4','ps4'].includes(platform) && cat==='games') ps4Wishlist++;
    }
  }
  return { owned, wishlist, ps4Wishlist };
})()`);
console.log(`Owned records: ${counts.owned}`);
console.log(`Wishlist records: ${counts.wishlist}`);
console.log(`PS4 Wishlist records: ${counts.ps4Wishlist}`);

const expected = { wishlist: 161, ps4Wishlist: 141 };
if (counts.wishlist !== expected.wishlist || counts.ps4Wishlist !== expected.ps4Wishlist) {
  console.error(`\nSTOP: counted Wishlist=${counts.wishlist} (expected ${expected.wishlist}), PS4 Wishlist=${counts.ps4Wishlist} (expected ${expected.ps4Wishlist}). Not proceeding.`);
  process.exit(1);
}
console.log('Counts match the independently-reported expectation (161 Wishlist / 141 PS4 Wishlist).\n');

// --- Ground truth OWNED set: run the REAL importCSV() against this export's own Owned rows ---
run(`globalThis.__fakeOwnedFile = { name: ${JSON.stringify(path.basename(csvPath))}, text: () => Promise.resolve(__csv) };`);
await run('importCSV(__fakeOwnedFile)');
const ownedAudit = run('window.SHELFCHECK_OWNERSHIP_AUDIT');
console.log(`Real importCSV() ground truth from this export's Owned rows: ${ownedAudit.ps4Rows} PS4 Owned rows -> ${ownedAudit.satisfiedIdentities} satisfied identities (${ownedAudit.excludedRows} excluded, ${ownedAudit.unresolvedRows} unresolved).`);

// --- Wishlist reconciliation: same real helpers (candidates/norm/productKeys/ensureMergedProducts
// /productMap/aliasesById), same matching cascade as importCSV, but never stops at the first
// candidate -- collects every distinct resolution and flags >1 as ambiguous instead of choosing. ---
const reconciliation = run(`(() => {
  const rows = parseCSV(__csv).slice(1);
  const ix = Object.fromEntries(parseCSV(__csv)[0].map((x,i)=>[x,i]));
  const idx = ensureMergedProducts();
  const results = [];
  for (const r of rows) {
    const typ=(r[ix.UserRecordType]||'').trim().toLowerCase();
    if (typ!=='wishlist') continue;
    const platform=(r[ix.Platform]||'').trim().toLowerCase();
    const cat=(r[ix.Category]||'').trim().toLowerCase();
    if (!['sony playstation 4','playstation 4','ps4'].includes(platform) || cat!=='games') continue;

    const title = r[ix.Title]||'';
    const cs = candidates(title);

    // Collect every distinct PRODUCT resolution across every candidate.
    const productHits = new Map(); // key -> product
    for (const c of cs) for (const k of productKeys(c,c)) { const p = idx.get(k); if (p) productHits.set(p.key, p); }

    // Collect every distinct DIRECT IDENTITY resolution across every candidate.
    const identityHits = new Map(); // id -> title
    for (const c of cs) {
      for (const x of items) {
        if (x.set==='INCLUDED' && (norm(x.title)===c || (aliasesById.get(x.id)||[]).includes(c))) identityHits.set(x.id, x.title);
      }
    }

    // Collect every distinct EXCLUDED-identity resolution (for reporting, not for inclusion).
    const excludedHits = new Map();
    for (const c of cs) {
      for (const x of items) {
        if (x.set==='EXCLUDED' && (norm(x.title)===c || (aliasesById.get(x.id)||[]).includes(c))) excludedHits.set(x.id, x.title);
      }
    }

    const distinctResolutionKeys = new Set([
      ...[...productHits.keys()].map(k=>'p:'+k),
      ...[...identityHits.keys()].map(k=>'i:'+k),
    ]);

    let outcome, ids=[], matched=null, matchType=null;
    if (distinctResolutionKeys.size > 1) {
      outcome = 'AMBIGUOUS';
      matched = [...productHits.values()].map(p=>p.title).concat([...identityHits.values()]);
    } else if (productHits.size === 1) {
      const p = [...productHits.values()][0];
      ids = [...new Set(p.ids)].filter(id => byId.get(id)?.set==='INCLUDED');
      if (!ids.length) { outcome = excludedHits.size ? 'EXCLUDED' : 'UNMATCHED'; matched = excludedHits.size ? [...excludedHits.values()][0] : null; }
      else { outcome = 'MATCHED'; matchType = ids.length>1?'MULTI_IDENTITY_PRODUCT':'PRODUCT'; matched = p.title; }
    } else if (identityHits.size === 1) {
      const [id, t] = [...identityHits.entries()][0];
      ids = [id]; outcome = 'MATCHED'; matchType = 'IDENTITY'; matched = t;
    } else if (excludedHits.size >= 1) {
      outcome = 'EXCLUDED'; matched = [...new Set(excludedHits.values())].join(' / ');
    } else {
      outcome = 'UNMATCHED'; matched = null;
    }

    results.push({ title, outcome, matchType, matched, ids });
  }
  return results;
})()`);

const matched = reconciliation.filter(r => r.outcome === 'MATCHED');
const ambiguous = reconciliation.filter(r => r.outcome === 'AMBIGUOUS');
const excluded = reconciliation.filter(r => r.outcome === 'EXCLUDED');
const unmatched = reconciliation.filter(r => r.outcome === 'UNMATCHED');

const idOwners = new Map(); // id -> [titles]
for (const m of matched) for (const id of m.ids) { if (!idOwners.has(id)) idOwners.set(id, []); idOwners.get(id).push(m.title); }
const distinctIds = [...idOwners.keys()];
const duplicateGroups = [...idOwners.entries()].filter(([,titles]) => titles.length > 1);

const idStatuses = run(`(${JSON.stringify(distinctIds)}).map(id => ({ id, title: byId.get(id)?.title, status: effectiveStatus(byId.get(id)) }))`);
const alreadyOwned = idStatuses.filter(s => s.status === 'OWNED');
const stillNeeded = idStatuses.filter(s => s.status !== 'OWNED');

console.log('='.repeat(78));
console.log('AUDIT SUMMARY');
console.log('='.repeat(78));
console.log(`Total GameEye records:          ${parsed.totalRows}`);
console.log(`Owned records:                  ${counts.owned}`);
console.log(`Wishlist records:               ${counts.wishlist}`);
console.log(`PS4 Wishlist records:           ${counts.ps4Wishlist}`);
console.log(`Exact/safely reconciled rows:   ${matched.length}`);
console.log(`  -> distinct ShelfCheck ids:   ${distinctIds.length}`);
console.log(`  -> already-OWNED identities:  ${alreadyOwned.length}`);
console.log(`  -> still-NEEDED identities:   ${stillNeeded.length}`);
console.log(`Duplicate wishlist rows -> same identity: ${duplicateGroups.length} identity(ies)`);
console.log(`Ambiguous matches:              ${ambiguous.length}`);
console.log(`Excluded/not-INCLUDED titles:   ${excluded.length}`);
console.log(`Unmatched titles:               ${unmatched.length}`);
console.log('='.repeat(78));

if (duplicateGroups.length) {
  console.log('\n--- Duplicate Wishlist rows resolving to the same identity ---');
  for (const [id, titles] of duplicateGroups) console.log(`  id ${id} (${byId_title(id)}): ${JSON.stringify(titles)}`);
}
function byId_title(id) { return run(`byId.get(${id})?.title`); }

if (alreadyOwned.length) {
  console.log('\n--- Already-OWNED identities (would be skipped by the seed) ---');
  for (const s of alreadyOwned) console.log(`  id ${s.id}: ${s.title}`);
}

if (ambiguous.length) {
  console.log('\n--- AMBIGUOUS matches (need your judgment, NOT auto-resolved) ---');
  for (const r of ambiguous) console.log(`  "${r.title}" -> candidates: ${JSON.stringify(r.matched)}`);
}

if (excluded.length) {
  console.log('\n--- Excluded / not-INCLUDED titles ---');
  for (const r of excluded) console.log(`  "${r.title}" -> ${r.matched || '(excluded identity match)'}`);
}

if (unmatched.length) {
  console.log('\n--- Unmatched titles ---');
  for (const r of unmatched) console.log(`  "${r.title}"`);
}

console.log(`\n${ambiguous.length ? 'STOP: ambiguous matches require review before seeding.' : 'No ambiguous matches found.'}`);
