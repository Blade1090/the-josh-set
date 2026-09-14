// ShelfCheck TEMPORARY one-tap GameEye Wishlist migration button regression test.
//
// Runs the REAL app.js + model-fix.js + dossiers.js + every census-mutating script + census-
// finalize.js + price-fix.js + ownership-audit-v068.js (the real importCSV) + wishlist-v001.js +
// the actual gameeye-wishlist-seed-ui-2026-09-14.js in a Node vm, wiring a fake but real
// #gameeyeWishlistSeedBtn/#syncmsg so the button's own onclick handler (not a reimplementation)
// is exercised exactly as a tap on the real page would.
//
// Usage: node tools/gameeye-wishlist-seed-ui-test.mjs (exits 1 on failure)
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
  const syncmsgEl = { textContent: '' };
  const btnEl = { id: 'gameeyeWishlistSeedBtn', onclick: null };
  const inertEl = { textContent: '', dataset: {}, querySelectorAll: () => [], querySelector: () => null, addEventListener: () => {}, appendChild: () => {}, style: {}, value: '' };
  const fakeDocument = {
    querySelector: (sel) => (sel === '#syncmsg' ? syncmsgEl : inertEl),
    querySelectorAll: () => [],
    createElement: () => ({ ...inertEl, appendChild: () => {}, classList: { toggle() {}, add() {} } }),
    addEventListener: () => {}, readyState: 'complete', head: { appendChild: () => {} }, body: { appendChild: () => {} },
    getElementById: (id) => (id === 'gameeyeWishlistSeedBtn' ? btnEl : null),
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
  run(readFile('gameeye-wishlist-seed-ui-2026-09-14.js'), 'gameeye-wishlist-seed-ui-2026-09-14.js');

  return { run, syncmsgEl, btnEl };
}

function csvOf(titles) {
  const rows = titles.map((t) => `"${t.replace(/"/g, '""')}",PlayStation 4,Games,Owned`).join('\n');
  return `Title,Platform,Category,UserRecordType\n${rows}\n`;
}

async function main() {
  let failed = false;
  const fail = (msg) => { console.error(`FAIL: ${msg}`); failed = true; };
  const ok = (msg) => console.log(`OK  ${msg}`);

  const { run, syncmsgEl, btnEl } = await buildContext();

  if (typeof btnEl.onclick !== 'function') { console.error('FATAL: install() did not wire #gameeyeWishlistSeedBtn.onclick'); process.exit(1); }
  ok('The real button is wired to a click handler on page load');

  const includedBefore = run('items.filter(x=>x.set==="INCLUDED").length');
  const OWNED_SAMPLE_ID = 23, OWNED_SAMPLE_TITLE = 'A Way Out';
  const EXISTING_MANUAL_ID = run(`items.find(x=>x.set==="INCLUDED"&&effectiveStatus(x)==="NEEDED"&&x.id!==${OWNED_SAMPLE_ID}).id`);

  console.log('--- setup: one pre-existing manual wishlist entry, one seed identity forced OWNED ---');
  run(`window.addWishlist(${EXISTING_MANUAL_ID})`);
  run(`window.__ownFile = { name: 'force-owned.csv', text: () => Promise.resolve(${JSON.stringify(csvOf([OWNED_SAMPLE_TITLE]))}) }`);
  await run('importCSV(window.__ownFile)');
  if (run(`effectiveStatus(byId.get(${OWNED_SAMPLE_ID}))`) !== 'OWNED') { console.error('Test setup error: could not force sample id OWNED'); process.exit(1); }
  ok('Test setup complete');

  console.log('--- 1st tap ---');
  btnEl.onclick();
  const msg1 = syncmsgEl.textContent;
  console.log(`  message: "${msg1}"`);
  const m1 = msg1.match(/^(\d+) added · (\d+) already wishlisted · (\d+) skipped because owned$/);
  if (!m1) fail(`Result message does not match the required exact format "X added · Y already wishlisted · Z skipped because owned": "${msg1}"`);
  else {
    const [, added, already, skippedOwned] = m1.map(Number);
    if (added !== 140) fail(`Expected 140 added (141 reconciled - 1 forced OWNED), got ${added}`);
    if (already !== 0) fail(`Expected 0 already-wishlisted on a fresh state, got ${already}`);
    if (skippedOwned !== 1) fail(`Expected exactly 1 skipped-because-owned, got ${skippedOwned}`);
    if (added === 140 && already === 0 && skippedOwned === 1) ok(`Exact result format and correct counts on first tap: "${msg1}"`);
  }

  if (run(`window.isWishlisted(${OWNED_SAMPLE_ID})`)) fail(`Already-OWNED "${OWNED_SAMPLE_TITLE}" was added to the Wishlist`);
  else ok(`Already-OWNED "${OWNED_SAMPLE_TITLE}" correctly skipped`);
  if (!run(`window.isWishlisted(${EXISTING_MANUAL_ID})`)) fail('Pre-existing manual wishlist entry was lost');
  else ok('Pre-existing manual wishlist entry survives the migration');
  if (!run(`window.isWishlisted(556)`)) fail('A normal still-NEEDED seed identity (GRIS, id 556) was not added');
  else ok('A normal still-NEEDED seed identity (GRIS, id 556) was added');

  const includedAfter = run('items.filter(x=>x.set==="INCLUDED").length');
  if (includedAfter !== includedBefore) fail(`Census INCLUDED changed: ${includedBefore} -> ${includedAfter}`);
  else ok(`Census INCLUDED unchanged: ${includedAfter}`);

  console.log('--- normal browsing badge + Wishlist view reflect the result immediately (no reload needed) ---');
  {
    const badgeCheck = run(`(() => {
      const title = byId.get(556).title;
      const badges = [];
      const top = { querySelector: (sel) => sel === '.wishlist-badge' ? (badges.length?badges[0]:null) : null, appendChild: (el) => badges.push(el) };
      const card = { querySelector: (sel) => sel === '.top b' ? { textContent: title } : sel === '.top' ? top : null };
      const savedQSA = document.querySelectorAll;
      document.querySelectorAll = (sel) => sel === '#results article.card' ? [card] : savedQSA(sel);
      try { window.SHELFCHECK_WISHLIST.decorateWishlistBadges(); } finally { document.querySelectorAll = savedQSA; }
      return { count: badges.length, text: badges[0]?.textContent };
    })()`);
    if (badgeCheck.count !== 1 || badgeCheck.text !== '⭐ WISHLIST') fail(`Seeded identity missing the normal browsing badge immediately after the tap: ${JSON.stringify(badgeCheck)}`);
    else ok('A seeded identity has the "⭐ WISHLIST" browsing badge immediately after the tap');

    const wishlisted = run('window.SHELFCHECK_WISHLIST.wishlistedItems().some(x=>x.id===556)');
    if (!wishlisted) fail('wishlistedItems() (the ⭐ WISHLIST view) does not include a seeded identity immediately after the tap');
    else ok('The ⭐ WISHLIST view (wishlistedItems()) includes a seeded identity immediately after the tap');
  }

  console.log('--- 2nd tap (idempotency) ---');
  const wishlistBefore2nd = run('JSON.stringify([...stateCache.wishlist].sort((a,b)=>a-b))');
  btnEl.onclick();
  const msg2 = syncmsgEl.textContent;
  const wishlistAfter2nd = run('JSON.stringify([...stateCache.wishlist].sort((a,b)=>a-b))');
  console.log(`  message: "${msg2}"`);
  const m2 = msg2.match(/^(\d+) added · (\d+) already wishlisted · (\d+) skipped because owned$/);
  if (!m2) fail(`2nd-tap result message malformed: "${msg2}"`);
  else {
    const [, added2, already2, skippedOwned2] = m2.map(Number);
    if (added2 !== 0) fail(`2nd tap must add 0, got ${added2}`);
    if (already2 !== 140) fail(`2nd tap should report all 140 previously-added as already wishlisted, got ${already2}`);
    if (skippedOwned2 !== 1) fail(`2nd tap should still report the 1 OWNED skip, got ${skippedOwned2}`);
    if (added2 === 0 && already2 === 140 && skippedOwned2 === 1) ok(`2nd tap is a correct no-op: "${msg2}"`);
  }
  if (wishlistBefore2nd !== wishlistAfter2nd) fail('Wishlist state changed on the 2nd tap -- not idempotent');
  else ok('Wishlist state is byte-identical before and after the 2nd tap (idempotent)');

  if (!failed) {
    console.log('\nPASS: the real #gameeyeWishlistSeedBtn click handler adds every eligible reconciled identity, skips already-OWNED and already-wishlisted ones with the exact required result format, preserves pre-existing manual entries, leaves census untouched, immediately reflects in the normal browsing badge and the ⭐ WISHLIST view, and a second tap is a fully idempotent no-op.');
  }
  process.exit(failed ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
