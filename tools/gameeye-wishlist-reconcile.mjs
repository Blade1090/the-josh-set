// ShelfCheck one-time GameEye Wishlist migration -- final reconciliation with Josh's explicit
// overrides applied on top of tools/gameeye-wishlist-audit.mjs's automatic (exact-match-only)
// result. Prints the pre-commit report and, with --emit, writes the final reconciled id list as
// JSON so migrations/2026-09-14-gameeye-wishlist-seed.js can hardcode it verbatim.
//
// This file makes NO change to production normalization/matching logic (candidates()/norm()/
// productKeys()/ensureMergedProducts() are used completely unmodified, exactly as in the audit).
// The 13 EXPLICIT_OVERRIDES below are one-time, human-decided migration mappings for THIS export
// only -- not a new fuzzy-matching rule.
//
// Usage: node tools/gameeye-wishlist-reconcile.mjs <path-to-ge-export.csv> [--emit out.json]
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

// Josh's explicit, one-time judgment calls on the 13 titles the automatic exact-match pass
// (candidates()/productKeys()/direct identity+alias match) left as UNMATCHED/EXCLUDED. Keyed by
// the literal GameEye Title field; each maps to exactly one ShelfCheck identity id, pinned to
// its expected title as a safety check (the reconciliation aborts if the id's current title
// doesn't match, rather than silently seeding the wrong thing).
const EXPLICIT_OVERRIDES = {
  'Way Out': { id: 23, title: 'A Way Out' },
  'Tearaway Unfolded: Crafted Edition': { id: 1205, title: 'Tearaway Unfolded' },
  '25th Ward: The Silver Case': { id: 1214, title: 'The 25th Ward: The Silver Case' },
  'Council': { id: 1230, title: 'The Council' },
  'End is Nigh': { id: 1242, title: 'The End Is Nigh' },
  'House in Fata Morgana': { id: 1250, title: 'The House in Fata Morgana' },
  'Last of Us Part II': { id: 1261, title: 'The Last of Us Part II' },
  'Messenger': { id: 1276, title: 'The Messenger' },
  'Swapper': { id: 1297, title: 'The Swapper' },
  'Swindle': { id: 1298, title: 'The Swindle' },
  'Talos Principle: Deluxe Edition': { id: 1300, title: 'The Talos Principle: Deluxe Edition' },
  'Silver Case': { id: 1290, title: 'The Silver Case' },
  'Count Lucanor [Signature Edition]': { id: 1750, title: 'The Count Lucanor' },
};

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

const csvPath = process.argv[2];
const emitIx = process.argv.indexOf('--emit');
const emitPath = emitIx >= 0 ? process.argv[emitIx + 1] : null;
if (!csvPath) { console.error('Usage: node tools/gameeye-wishlist-reconcile.mjs <path-to-ge-export.csv> [--emit out.json]'); process.exit(1); }
const csvText = fs.readFileSync(csvPath, 'utf8');

const { run } = await buildContext();

run(`globalThis.__csv = ${JSON.stringify(csvText)};`);

// Ground truth OWNED set, exactly as in the audit: real importCSV() against this export's own
// Owned rows.
run(`globalThis.__fakeOwnedFile = { name: ${JSON.stringify(path.basename(csvPath))}, text: () => Promise.resolve(__csv) };`);
await run('importCSV(__fakeOwnedFile)');

// Automatic exact-match reconciliation, identical cascade to the audit script.
const auto = run(`(() => {
  const rows = parseCSV(__csv).slice(1);
  const ix = Object.fromEntries(parseCSV(__csv)[0].map((x,i)=>[x,i]));
  const idx = ensureMergedProducts();
  const out = [];
  for (const r of rows) {
    const typ=(r[ix.UserRecordType]||'').trim().toLowerCase();
    if (typ!=='wishlist') continue;
    const platform=(r[ix.Platform]||'').trim().toLowerCase();
    const cat=(r[ix.Category]||'').trim().toLowerCase();
    if (!['sony playstation 4','playstation 4','ps4'].includes(platform) || cat!=='games') continue;
    const title = r[ix.Title]||'';
    const cs = candidates(title);
    const productHits = new Map();
    for (const c of cs) for (const k of productKeys(c,c)) { const p = idx.get(k); if (p) productHits.set(p.key, p); }
    const identityHits = new Map();
    for (const c of cs) for (const x of items) if (x.set==='INCLUDED' && (norm(x.title)===c || (aliasesById.get(x.id)||[]).includes(c))) identityHits.set(x.id, x.title);
    const distinctKeys = new Set([...[...productHits.keys()].map(k=>'p:'+k), ...[...identityHits.keys()].map(k=>'i:'+k)]);
    let ids = [];
    if (distinctKeys.size === 1) {
      if (productHits.size === 1) { const p=[...productHits.values()][0]; ids=[...new Set(p.ids)].filter(id=>byId.get(id)?.set==='INCLUDED'); }
      else { ids=[...identityHits.keys()]; }
    }
    out.push({ title, ids });
  }
  return out;
})()`);

const overrideTitles = new Set(Object.keys(EXPLICIT_OVERRIDES));
const autoMatched = auto.filter(r => r.ids.length && !overrideTitles.has(r.title));
const autoUnresolvedButOverridden = auto.filter(r => overrideTitles.has(r.title));

// Sanity: every override title must actually appear as a PS4 Wishlist row in this export, and
// every id it points to must currently carry the expected title (aborts rather than silently
// seeding the wrong identity if the census title has since changed).
const problems = [];
for (const r of auto) {
  if (overrideTitles.has(r.title) && r.ids.length) problems.push(`Override "${r.title}" is no longer needed -- the automatic exact-match pass now resolves it to id(s) ${JSON.stringify(r.ids)} on its own. Re-run the audit.`);
}
for (const title of overrideTitles) {
  if (!auto.some(r => r.title === title)) problems.push(`Override "${title}" does not match any PS4 Wishlist row in this export -- title text changed?`);
}
for (const [title, { id, title: expectedTitle }] of Object.entries(EXPLICIT_OVERRIDES)) {
  const actualTitle = run(`byId.get(${id})?.title`);
  const actualSet = run(`byId.get(${id})?.set`);
  if (actualTitle !== expectedTitle) problems.push(`Override "${title}" -> id ${id}: expected title "${expectedTitle}", census currently has "${actualTitle}". ABORTING.`);
  if (actualSet !== 'INCLUDED') problems.push(`Override "${title}" -> id ${id} ("${actualTitle}") is currently ${actualSet}, not INCLUDED. ABORTING.`);
}
if (problems.length) { console.error('PROBLEMS FOUND:\n' + problems.map(p=>'  - '+p).join('\n')); process.exit(1); }

const finalRows = [
  ...autoMatched.map(r => ({ title: r.title, ids: r.ids, source: 'auto' })),
  ...Object.entries(EXPLICIT_OVERRIDES).map(([title, o]) => ({ title, ids: [o.id], source: 'override' })),
];

if (finalRows.length !== 141) { console.error(`Expected exactly 141 reconciled rows (128 auto + 13 override), got ${finalRows.length}. ABORTING.`); process.exit(1); }

const idOwners = new Map();
for (const r of finalRows) for (const id of r.ids) { if (!idOwners.has(id)) idOwners.set(id, []); idOwners.get(id).push(r.title); }
const dupGroups = [...idOwners.entries()].filter(([,titles]) => titles.length > 1);
const distinctIds = [...idOwners.keys()].sort((a,b)=>a-b);

const statuses = run(`(${JSON.stringify(distinctIds)}).map(id => ({ id, title: byId.get(id)?.title, status: effectiveStatus(byId.get(id)) }))`);
const alreadyOwned = statuses.filter(s => s.status === 'OWNED');
const eligible = statuses.filter(s => s.status !== 'OWNED');

console.log('='.repeat(78));
console.log('FINAL RECONCILIATION (auto + explicit overrides)');
console.log('='.repeat(78));
console.log(`Total reconciled PS4 Wishlist rows: ${finalRows.length} (128 auto + 13 override)`);
console.log(`Distinct ShelfCheck identity ids:   ${distinctIds.length}`);
console.log(`Duplicate rows -> same identity:    ${dupGroups.length}`);
if (dupGroups.length) for (const [id, titles] of dupGroups) console.log(`  id ${id}: ${JSON.stringify(titles)}`);
console.log(`Already-OWNED (pruned from seed):   ${alreadyOwned.length}`);
for (const s of alreadyOwned) console.log(`  id ${s.id}: ${s.title}`);
console.log(`Eligible to seed after OWNED prune: ${eligible.length}`);
console.log('='.repeat(78));

if (emitPath) {
  fs.writeFileSync(emitPath, JSON.stringify({ generatedAt: new Date().toISOString(), source: path.basename(csvPath), eligibleIds: eligible.map(s=>s.id).sort((a,b)=>a-b), eligible, alreadyOwned }, null, 2));
  console.log(`Wrote ${emitPath}`);
}
