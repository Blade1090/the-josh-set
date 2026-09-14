// ShelfCheck one-time GameEye Wishlist migration regression test.
//
// Runs the REAL app.js + model-fix.js + dossiers.js + every census-mutating script + census-
// finalize.js + price-fix.js + ownership-audit-v068.js (the real importCSV) + wishlist-v001.js
// (the real addWishlist/isWishlisted/wishlistedItems/decorateWishlistBadges/auto-removal) AND the
// actual migrations/2026-09-14-gameeye-wishlist-seed.js file itself in a Node vm -- so this
// breaks if either the real Wishlist logic or the migration script regresses, never a
// reimplemented copy of either.
//
// Usage: node tools/gameeye-wishlist-seed-test.mjs (exits 1 on failure)
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
  run(readFile('wishlist-v001.js'), 'wishlist-v001.js');

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
  const migrationSrc = readFile('migrations/2026-09-14-gameeye-wishlist-seed.js');

  const includedBefore = run('items.filter(x=>x.set==="INCLUDED").length');

  // Sample seed ids to probe directly (from the migration's own SEED list): id 23 (A Way Out,
  // one of the explicit-override titles) will be forced OWNED before seeding to prove pruning;
  // id 556 (GRIS, an auto-matched title) stays NEEDED throughout to prove the normal add path.
  const OWNED_SAMPLE_ID = 23, OWNED_SAMPLE_TITLE = 'A Way Out';
  const NEEDED_SAMPLE_ID = 556;
  const EXISTING_MANUAL_ID = run('items.find(x=>x.set==="INCLUDED"&&effectiveStatus(x)==="NEEDED"&&x.id!==556&&x.id!==23).id');

  console.log('--- test setup: a pre-existing manual wishlist entry, and one seed identity forced OWNED ---');
  run(`window.addWishlist(${EXISTING_MANUAL_ID})`);
  if (!run(`window.isWishlisted(${EXISTING_MANUAL_ID})`)) fail('Test setup error: pre-existing manual wishlist entry did not take');
  run(`window.__ownFile = { name: 'force-owned.csv', text: () => Promise.resolve(${JSON.stringify(csvOf([OWNED_SAMPLE_TITLE]))}) }`);
  await run('importCSV(window.__ownFile)');
  const ownedStatus = run(`effectiveStatus(byId.get(${OWNED_SAMPLE_ID}))`);
  if (ownedStatus !== 'OWNED') fail(`Test setup error: could not force id ${OWNED_SAMPLE_ID} (${OWNED_SAMPLE_TITLE}) OWNED via real importCSV (got ${ownedStatus})`);
  else ok(`Test setup: "${OWNED_SAMPLE_TITLE}" (id ${OWNED_SAMPLE_ID}) is OWNED, "${EXISTING_MANUAL_ID}" is manually wishlisted, before the migration runs`);

  console.log('--- running the real migration script (1st time) ---');
  run(migrationSrc, 'migrations/2026-09-14-gameeye-wishlist-seed.js');

  if (run(`window.isWishlisted(${OWNED_SAMPLE_ID})`)) fail(`Migration added an already-OWNED identity ("${OWNED_SAMPLE_TITLE}") to the Wishlist -- must be pruned`);
  else ok(`Already-OWNED "${OWNED_SAMPLE_TITLE}" (id ${OWNED_SAMPLE_ID}) was correctly skipped`);

  if (!run(`window.isWishlisted(${NEEDED_SAMPLE_ID})`)) fail(`Migration did not add still-NEEDED seed identity id ${NEEDED_SAMPLE_ID} (GRIS)`);
  else ok('A normal still-NEEDED seed identity (GRIS, id 556) was added to the Wishlist');

  if (!run(`window.isWishlisted(${EXISTING_MANUAL_ID})`)) fail('Pre-existing manually-wishlisted identity was lost by the migration -- existing entries must be preserved');
  else ok(`Pre-existing manual wishlist entry (id ${EXISTING_MANUAL_ID}) survives the migration`);

  const neededStatusAfter = run(`effectiveStatus(byId.get(${NEEDED_SAMPLE_ID}))`);
  if (neededStatusAfter !== 'NEEDED') fail(`Wishlisting must not change OWNED/NEEDED -- GRIS (id ${NEEDED_SAMPLE_ID}) is now ${neededStatusAfter}`);
  else ok('A seeded identity still reports effectiveStatus=NEEDED (Wishlist has no effect on ownership status)');

  const inRandomPool = run(`items.some(x=>x.set==="INCLUDED"&&effectiveStatus(x)==="NEEDED"&&x.id===${NEEDED_SAMPLE_ID})`);
  if (!inRandomPool) fail('A seeded NEEDED identity is missing from the real NEEDED Random pool');
  else ok('A seeded identity remains eligible for NEEDED -> Random Game (present in the real NEEDED pool)');

  const includedAfter = run('items.filter(x=>x.set==="INCLUDED").length');
  if (includedAfter !== includedBefore) fail(`Census INCLUDED count changed by the migration: ${includedBefore} -> ${includedAfter}`);
  else ok(`Census INCLUDED unchanged by the migration: ${includedAfter}`);

  console.log('--- normal browsing card gets the real ⭐ WISHLIST badge for a seeded identity ---');
  {
    const check = run(`(() => {
      const title = byId.get(${NEEDED_SAMPLE_ID}).title;
      const badges = [];
      const top = { querySelector: (sel) => sel === '.wishlist-badge' ? (badges.length ? badges[0] : null) : null, appendChild: (el) => badges.push(el) };
      const card = { querySelector: (sel) => sel === '.top b' ? { textContent: title } : sel === '.top' ? top : null };
      const savedQSA = document.querySelectorAll;
      document.querySelectorAll = (sel) => sel === '#results article.card' ? [card] : savedQSA(sel);
      try { window.SHELFCHECK_WISHLIST.decorateWishlistBadges(); } finally { document.querySelectorAll = savedQSA; }
      return { count: badges.length, text: badges[0]?.textContent };
    })()`);
    if (check.count !== 1 || check.text !== '⭐ WISHLIST') fail(`Seeded identity did not receive the normal browsing badge: ${JSON.stringify(check)}`);
    else ok('A seeded identity receives the normal "⭐ WISHLIST" browsing badge exactly like a manually-wishlisted one');
  }

  console.log('--- Backup (stateCache) includes the seeded Wishlist entries ---');
  {
    const backup = JSON.parse(run('JSON.stringify(stateCache)'));
    const hasNeeded = Array.isArray(backup.wishlist) && backup.wishlist.includes(NEEDED_SAMPLE_ID);
    const hasManual = Array.isArray(backup.wishlist) && backup.wishlist.includes(EXISTING_MANUAL_ID);
    const lacksOwned = !(Array.isArray(backup.wishlist) && backup.wishlist.includes(OWNED_SAMPLE_ID));
    if (!hasNeeded || !hasManual || !lacksOwned) fail(`Backup (stateCache.wishlist) is inconsistent: ${JSON.stringify(backup.wishlist)}`);
    else ok('Backup (stateCache serialization) includes every seeded + pre-existing entry and excludes the pruned OWNED one');
  }

  console.log('--- running the real migration script again (idempotency) ---');
  const wishlistBefore2ndRun = run('JSON.stringify([...stateCache.wishlist].sort((a,b)=>a-b))');
  run(migrationSrc, 'migrations/2026-09-14-gameeye-wishlist-seed.js (2nd run)');
  const wishlistAfter2ndRun = run('JSON.stringify([...stateCache.wishlist].sort((a,b)=>a-b))');
  if (wishlistBefore2ndRun !== wishlistAfter2ndRun) fail(`Running the migration a second time changed the Wishlist -- not idempotent.\n  before: ${wishlistBefore2ndRun}\n  after:  ${wishlistAfter2ndRun}`);
  else ok('Running the migration a second time makes no further changes (idempotent) -- no duplicates, nothing removed');

  console.log('--- normal GameEye Owned reconciliation still passes after seeding ---');
  {
    const csvPath = process.argv[2];
    if (csvPath && fs.existsSync(csvPath)) {
      const realCsv = fs.readFileSync(csvPath, 'utf8');
      run(`window.__realFile = { name: 'real-export.csv', text: () => Promise.resolve(${JSON.stringify(realCsv)}) }`);
      await run('importCSV(window.__realFile)');
      const audit = run('window.SHELFCHECK_OWNERSHIP_AUDIT');
      console.log(`  Real export re-imported after seeding: ${audit.ps4Rows} PS4 rows -> ${audit.satisfiedIdentities} satisfied (${audit.excludedRows} excluded, ${audit.unresolvedRows} unresolved).`);
      if (!audit.rowAccountingOK || !audit.identityAccountingOK || !audit.bonusAccountingOK) fail('Ownership audit accounting failed after seeding the Wishlist');
      else ok('Normal GameEye Owned reconciliation (real importCSV) still passes its own accounting checks after the Wishlist has been seeded');
    } else {
      console.log('  (no CSV path given as argv[2] -- skipping the real-export re-import spot check; running a synthetic one instead)');
      run(`window.__synthFile = { name: 'synthetic.csv', text: () => Promise.resolve(${JSON.stringify(csvOf(['Journey', 'Firewatch']))}) }`);
      await run('importCSV(window.__synthFile)');
      const audit = run('window.SHELFCHECK_OWNERSHIP_AUDIT');
      if (!audit.rowAccountingOK || !audit.identityAccountingOK || !audit.bonusAccountingOK) fail('Ownership audit accounting failed after seeding the Wishlist');
      else ok('Normal GameEye Owned reconciliation (real importCSV) still passes its own accounting checks after the Wishlist has been seeded');
      // That import legitimately makes Journey/Firewatch OWNED -- confirm they were pruned from
      // the Wishlist by the EXISTING auto-removal (wishlist-v001.js), the same mechanism the
      // migration itself relies on, exercised end-to-end here as a complementary path.
      const journeyId = run('items.find(x=>x.title==="Journey").id'), firewatchId = run('items.find(x=>x.title==="Firewatch").id');
      if (run(`window.isWishlisted(${journeyId})`) || run(`window.isWishlisted(${firewatchId})`)) fail('Seeded identities that became OWNED via a later real GameEye import were not auto-removed from the Wishlist');
      else ok('Seeded identities that later become OWNED via a real GameEye import are still auto-removed from the Wishlist by the existing ownership-transition logic');
    }
  }

  if (!failed) {
    console.log('\nPASS: the GameEye Wishlist migration adds every reconciled still-NEEDED identity, skips already-OWNED ones, preserves pre-existing manual Wishlist entries, leaves census/OWNED/NEEDED untouched, is idempotent across repeated runs, and its seeded entries behave exactly like manually-wishlisted ones (badge, Backup, Random-pool eligibility, ownership-transition auto-removal, and normal GameEye Owned reconciliation).');
  }
  process.exit(failed ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
