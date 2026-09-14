// ShelfCheck "Should I Buy This?" v2 price-verdict regression test.
//
// Runs the REAL app.js + model-fix.js + every census-mutating script (current runtime order,
// matching tools/census-determinism-test.mjs's MUTATORS list) + census-finalize.js +
// price-fix.js (the actual, currently-in-effect priceFor(), which falls back through
// user-import > public/audited priceMap > baked x.max) + fun-features-v103.js (the real
// priceVerdict(), exposed via window.SHELFCHECK_FUN.priceVerdict for this test only) in a Node
// vm, then exercises every boundary from the spec directly against it -- so this breaks if the
// real verdict logic regresses, not just a reimplemented copy of it.
//
// Boundaries covered (all in cents-integer terms to avoid float edge bugs, matching how
// priceVerdict itself is implemented):
//   exactly 75%, just over 75%, exactly 115%, just over 115%, exactly 140%, just over 140%,
//   the $2 cheap-game tolerance, $2.01 beyond market where percentage would otherwise be HIGH,
//   missing market price (PRICE UNKNOWN), and an OWNED identity still receiving a real verdict
//   (ownership must never suppress the price tier).
//
// Usage: node tools/buy-tool-verdict-test.mjs (exits 1 on failure)
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
    querySelector: () => fakeEl, querySelectorAll: () => [], createElement: () => ({ ...fakeEl, appendChild: () => {} }),
    addEventListener: () => {}, readyState: 'complete', head: { appendChild: () => {} }, body: { appendChild: () => {} },
    getElementById: () => null,
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
    dlg: { close() {}, showModal() {}, scrollTop: 0 },
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

  run(readFile('price-fix.js'), 'price-fix.js');
  run(readFile('fun-features-v103.js'), 'fun-features-v103.js');

  return { run };
}

async function main() {
  const { run } = await buildContext();
  let failed = false;
  const fail = (msg) => { console.error(`FAIL: ${msg}`); failed = true; };

  const hasVerdictFn = run('typeof window.SHELFCHECK_FUN?.priceVerdict === "function"');
  if (!hasVerdictFn) { console.error('FATAL: window.SHELFCHECK_FUN.priceVerdict is not exposed'); process.exit(1); }

  // Pick one real, arbitrary INCLUDED item and inject a controlled public/audited price into
  // priceMap (tier 2 of the real priceFor()) -- this exercises the REAL priceFor() lookup path,
  // not a mock, while keeping the market value deterministic regardless of that item's actual
  // baked price.
  const setMarket = (marketDollars) => {
    run(`(() => {
      const x = items.find(g => g.set === 'INCLUDED');
      priceMap.set(norm(x.title), { t: x.title, m: ${marketDollars} });
    })()`);
    return run("items.find(g => g.set === 'INCLUDED')");
  };
  const verdictFor = (marketDollars, askedDollars) => {
    setMarket(marketDollars);
    return run(`(() => {
      const x = items.find(g => g.set === 'INCLUDED');
      return window.SHELFCHECK_FUN.priceVerdict(x, ${askedDollars});
    })()`);
  };

  const expectTier = (label, market, asked, expectedTier) => {
    const v = verdictFor(market, asked);
    if (!v || v.tier !== expectedTier) fail(`${label}: market $${market} / asked $${asked} -> expected ${expectedTier}, got ${JSON.stringify(v)}`);
    else console.log(`OK  ${label}: market $${market} / asked $${asked} -> ${v.tier}`);
  };

  console.log('--- Spec examples ---');
  expectTier('spec market $20/store $10', 20, 10, 'GREAT_DEAL');
  expectTier('spec market $20/store $15', 20, 15, 'GREAT_DEAL');
  expectTier('spec market $20/store $20', 20, 20, 'FAIR');
  expectTier('spec market $15/store $17', 15, 17, 'FAIR');
  expectTier('spec market $5/store $6 ($2 tolerance)', 5, 6, 'FAIR');
  expectTier('spec market $15/store $18', 15, 18, 'HIGH');
  expectTier('spec market $20/store $27', 20, 27, 'HIGH');
  expectTier('spec market $20/store $30', 20, 30, 'OVERPRICED');

  console.log('--- Boundary tests ---');
  expectTier('exactly 75%', 20, 15, 'GREAT_DEAL');
  expectTier('just over 75%', 20, 15.01, 'FAIR');
  expectTier('exactly 115%', 20, 23, 'FAIR');
  expectTier('just over 115% (diff > $2, stays HIGH)', 20, 23.01, 'HIGH');
  expectTier('exactly 140%', 20, 28, 'HIGH');
  expectTier('just over 140% (diff > $2, stays OVERPRICED)', 20, 28.01, 'OVERPRICED');
  expectTier('$2.00 tolerance exactly (diff == $2)', 5, 7, 'FAIR');
  expectTier('$2.01 beyond market, pct would be HIGH, tolerance does NOT apply', 10, 12.01, 'HIGH');

  console.log('--- Missing market price ---');
  {
    const noPriceItem = run("items.find(x => x.set === 'INCLUDED' && !priceFor(x))");
    if (!noPriceItem) {
      console.warn('WARN: could not find a currently-unpriced INCLUDED identity to test PRICE UNKNOWN against -- skipping (not a failure, just nothing to test with right now)');
    } else {
      const v = run(`window.SHELFCHECK_FUN.priceVerdict(items.find(x=>x.id===${noPriceItem.id}), 20)`);
      if (!v || v.tier !== 'UNKNOWN') fail(`Missing-price identity "${noPriceItem.title}" did not return UNKNOWN: ${JSON.stringify(v)}`);
      else console.log(`OK  missing market price ("${noPriceItem.title}") -> UNKNOWN`);
    }
  }

  console.log('--- OWNED still receives a real verdict ---');
  {
    const ownedItem = run("items.find(x => x.set === 'INCLUDED' && x.baseline === 'OWNED')");
    if (!ownedItem) {
      fail('Could not find any baseline-OWNED INCLUDED identity to test against');
    } else {
      const st = run(`effectiveStatus(items.find(x=>x.id===${ownedItem.id}))`);
      if (st !== 'OWNED') fail(`Expected test fixture "${ownedItem.title}" to be OWNED, got ${st}`);
      run(`priceMap.set(norm(items.find(x=>x.id===${ownedItem.id}).title), { t: '${ownedItem.title.replace(/'/g, "\\'")}', m: 20 })`);
      const v = run(`window.SHELFCHECK_FUN.priceVerdict(items.find(x=>x.id===${ownedItem.id}), 10)`);
      if (!v || v.tier !== 'GREAT_DEAL') fail(`OWNED identity "${ownedItem.title}" did not receive a real price verdict (expected GREAT_DEAL at $10 vs $20 market): ${JSON.stringify(v)}`);
      else console.log(`OK  OWNED identity "${ownedItem.title}" still receives a real verdict (${v.tier}) -- ownership did not suppress it`);
    }
  }

  console.log('--- Display line sanity (spec example) ---');
  {
    const v = verdictFor(17, 9.99);
    // verdictPriceLine/verdictDiffLine are internal to the fun-features IIFE closure, not
    // exposed globally (by design, matching this file's existing scoping convention) -- verify
    // the underlying numbers the spec's worked example depends on instead.
    if (v.tier !== 'GREAT_DEAL') fail(`Display sanity: market $17/asked $9.99 expected GREAT_DEAL, got ${v.tier}`);
    if (Math.round(Math.abs(v.diffCents)) !== 701) fail(`Display sanity: expected diffCents magnitude 701 ($7.01), got ${v.diffCents}`);
    if (v.pctDiff !== 41) fail(`Display sanity: expected pctDiff 41, got ${v.pctDiff}`);
    console.log(`OK  market $17/asked $9.99 -> ${v.tier}, diff $${(Math.abs(v.diffCents)/100).toFixed(2)}, ${v.pctDiff}% (matches the spec's worked example)`);
  }

  if (!failed) console.log('\nPASS: all spec examples, percentage boundaries, the $2 tolerance, missing-price, and OWNED-still-verdicts cases behave exactly as specified.');
  process.exit(failed ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
