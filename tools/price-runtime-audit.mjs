// ShelfCheck price-vs-census runtime audit.
//
// Runs the REAL census-mutating scripts through the actual runtime pipeline
// (registerCensusMutation -> census-finalize.js, exactly as shipped in index.html) followed
// by the real price-*.js scripts, in one deterministic Node vm pass, and reports price
// coverage against the resulting finalized INCLUDED set. The denominator always comes from
// the live runtime finalization, never a hardcoded number -- if a future census change moves
// the INCLUDED count, this tool's output moves with it automatically.
//
// Ownership: this stateless harness has no access to Josh's real GameEye-imported
// ownership (localStorage), so OWNED/NEEDED here use the same baseline:'OWNED' snapshot
// census-determinism-test.mjs uses -- clearly not Josh's real owned-collection count, but a
// fixed, reproducible substitute that still separates "would matter to what Josh owns" from
// "would matter to what Josh is hunting" in the pending breakdown.
//
// Usage:
//   node tools/price-runtime-audit.mjs [--json out.json]
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
  'census-physical-omission-pass-v001.js',
  'census-v060-integrity-scrub.js', 'census-integrity-pass-v001.js', 'census-integrity-pass-v002.js',
  'ownership-reconcile-v071.js',
];
const PRICE_FILES = [
  'price-import-v037.js', 'price-alias-v039.js', 'price-alias-v040.js', 'price-final-v041.js',
  'price-online-v041.js', 'price-negative-space-v042.js', 'price-direct-v050.js', 'price-direct-v051.js',
  'public-prices-full-v066.js', 'price-new-games-v073.js', 'price-new-games-v074.js',
  'price-new-games-v075.js', 'price-whole-census-v077.js', 'price-fix.js',
];

function norm(s) {
  return String(s ?? '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[’'`]/g, '').replaceAll('&', ' and ').match(/[a-z0-9]+/g)?.join(' ') || '';
}
function readFile(name) { return fs.readFileSync(path.join(REPO, name), 'utf8'); }

async function loadCensusData() {
  const names = ['data0.txt', 'data1.txt', 'data2.txt', 'data3a.txt', 'data3b.txt'];
  const b64 = names.map((n) => fs.readFileSync(path.join(REPO, n), 'utf8')).join('').trim();
  return JSON.parse(zlib.gunzipSync(Buffer.from(b64, 'base64')).toString('utf8'));
}

function productKeys(raw, title) {
  const out = [];
  const add = (v) => { const n = norm(v); if (n && !out.includes(n)) out.push(n); if (n.startsWith('the ') && !out.includes(n.slice(4))) out.push(n.slice(4)); };
  add(title || ''); add(String(title || '').replace(/\s*\[[^\]]+\]\s*$/, '').trim()); add(raw || '');
  return out;
}
function mergedProducts(DATA) {
  const groups = new Map(), aliases = new Map();
  for (const [raw, title, ids] of DATA.p) {
    const keys = productKeys(raw, title), canonical = keys.find((k) => !k.includes(' not for resale')) || keys[0];
    if (!canonical) continue;
    let g = groups.get(canonical);
    if (!g) { g = { key: canonical, title, ids: [], titles: [] }; groups.set(canonical, g); }
    g.ids.push(...(ids || [])); g.titles.push(title);
    for (const k of keys) aliases.set(k, canonical);
  }
  for (const [raw, title] of DATA.p) {
    const base = norm(String(title || '').replace(/\s*\[[^\]]+\]\s*$/, '').trim()), exact = norm(title || '');
    if (base && exact !== base) {
      const target = aliases.get(base) || base, source = aliases.get(exact);
      if (source && source !== target && groups.has(source)) {
        let t = groups.get(target) || { key: target, title: String(title).replace(/\s*\[[^\]]+\]\s*$/, '').trim(), ids: [], titles: [] };
        const s = groups.get(source);
        t.ids.push(...s.ids); t.titles.push(...s.titles);
        groups.set(target, t); groups.delete(source);
        for (const [k, v] of aliases) if (v === source) aliases.set(k, target);
      }
      aliases.set(exact, target); aliases.set(base, target);
    }
  }
  return [...groups.values()].map((g) => ({ ...g, ids: [...new Set(g.ids)] }));
}

async function main() {
  const DATA = await loadCensusData();
  const items = DATA.i.map((r) => ({ id: r[0], title: r[1], set: r[2], baseline: r[3], strong: r[4], target: r[5], max: r[6], search: norm(r[1]) }));
  const byId = new Map(items.map((x) => [x.id, x]));
  const aliasesById = new Map();
  for (const [a, id] of DATA.a || []) { if (!aliasesById.has(id)) aliasesById.set(id, []); aliasesById.get(id).push(a); }
  const productMap = new Map(), reverseProducts = new Map();

  const fakeEl = { textContent: '', dataset: {}, querySelectorAll: () => [], querySelector: () => null, addEventListener: () => {}, appendChild: () => {}, style: {} };
  const fakeDocument = { querySelector: () => fakeEl, querySelectorAll: () => [], createElement: () => ({ ...fakeEl }), addEventListener: () => {}, readyState: 'complete', head: { appendChild: () => {} }, body: { appendChild: () => {} } };
  let stateCache = { owned: [], products: [], prices: [] };

  const ctx = {
    DATA, items, byId, norm, aliasesById, productMap, reverseProducts,
    window: {}, console,
    document: fakeDocument,
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    atob: (s) => Buffer.from(s, 'base64').toString('binary'),
    btoa: (s) => Buffer.from(s, 'binary').toString('base64'),
    DecompressionStream, Response, Blob, Uint8Array,
    setTimeout, clearTimeout, setInterval, clearInterval,
    progress: () => {}, resetBrowse: () => {},
    get stateCache() { return stateCache; }, set stateCache(v) { stateCache = v; },
    saveState: (s) => { stateCache = s; }, loadState: () => stateCache,
    ownedSet: new Set(), productSet: new Set(), filter: 'ALL',
    visibleLimit: 70,
    $: () => fakeEl,
    status: () => 'NEEDED', effectiveStatus: () => 'NEEDED',
    render: function () {},
    censusFinalized: false,
    censusQueue: { add: [], exclude: [] },
  };
  ctx.registerCensusMutation = (phase, fn) => {
    if (ctx.censusFinalized) throw new Error(`registerCensusMutation('${phase}') called after finalization`);
    ctx.censusQueue[phase].push(fn);
  };
  vm.createContext(ctx);

  // Run every census-mutating script (real runtime order), then finalize exactly like
  // census-finalize.js does -- add phase, then exclude phase, exactly once.
  for (const f of CENSUS_MUTATORS) vm.runInContext(readFile(f), ctx, { filename: f, displayErrors: true });
  for (const fn of ctx.censusQueue.add) fn();
  for (const fn of ctx.censusQueue.exclude) fn();
  ctx.DATA.n = ctx.items.filter((x) => x.set === 'INCLUDED').length;
  ctx.censusFinalized = true;

  const includedCount = ctx.items.filter((x) => x.set === 'INCLUDED').length;

  // Price pipeline, in real runtime order.
  for (const f of PRICE_FILES) vm.runInContext(readFile(f), ctx, { filename: f, displayErrors: true });
  // price-online-v041.js decompresses a real (local, deterministic-outcome) compressed
  // snapshot asynchronously -- let that settle before measuring.
  await new Promise((r) => setTimeout(r, 1500));
  if (typeof ctx.loadLocalPrices === 'function') ctx.loadLocalPrices();

  const included = ctx.items.filter((x) => x.set === 'INCLUDED');
  const isUsable = (v) => v != null && Number.isFinite(Number(v)) && Number(v) > 0;
  const priceVal = (x) => { const p = typeof ctx.priceFor === 'function' ? ctx.priceFor(x) : null; return p?.m ?? p?.x ?? x.max; };
  const stats = (list) => { const priced = list.filter((x) => isUsable(priceVal(x))).length; return { total: list.length, priced, pending: list.length - priced, coveragePercent: +(100 * priced / list.length).toFixed(2) }; };

  const owned = included.filter((x) => x.baseline === 'OWNED');
  const needed = included.filter((x) => x.baseline !== 'OWNED');

  const products = mergedProducts(DATA);
  const compIds = new Set();
  let multiIdentityProductCount = 0, productsAllPriced = 0, productsSomePriced = 0, productsNonePriced = 0;
  for (const p of products) {
    const comps = p.ids.filter((id) => byId.get(id)?.set === 'INCLUDED');
    if (comps.length > 1) {
      multiIdentityProductCount++;
      for (const id of comps) compIds.add(id);
      const pricedCount = comps.filter((id) => isUsable(priceVal(byId.get(id)))).length;
      if (pricedCount === comps.length) productsAllPriced++;
      else if (pricedCount > 0) productsSomePriced++;
      else productsNonePriced++;
    }
  }
  const productsStats = {
    total: multiIdentityProductCount,
    priced: productsAllPriced,
    pending: multiIdentityProductCount - productsAllPriced,
    somePriced: productsSomePriced,
    nonePriced: productsNonePriced,
    coveragePercent: +(100 * productsAllPriced / multiIdentityProductCount).toFixed(2),
  };

  const pendingFull = included.filter((x) => !isUsable(priceVal(x))).map((x) => ({ id: x.id, title: x.title }));
  const ownedPending = owned.filter((x) => !isUsable(priceVal(x))).map((x) => ({ id: x.id, title: x.title, compilationComponent: compIds.has(x.id) }));

  const result = {
    generatedAt: new Date().toISOString(),
    included: includedCount,
    overall: stats(included),
    owned: stats(owned),
    needed: stats(needed),
    products: productsStats,
    ownedPending,
    neededPendingCount: pendingFull.length - ownedPending.length,
    pendingFull,
    compilationComponentCount: compIds.size,
    note: 'OWNED/NEEDED use a synthetic baseline:\'OWNED\' snapshot (this stateless harness has no access to real GameEye-imported ownership), not Josh\'s real owned-collection state. included/overall are computed from the live finalized runtime census, never hardcoded.',
  };

  const jsonFlagIdx = process.argv.indexOf('--json');
  if (jsonFlagIdx !== -1 && process.argv[jsonFlagIdx + 1]) {
    fs.writeFileSync(process.argv[jsonFlagIdx + 1], JSON.stringify(result, null, 2));
  }

  console.log(`INCLUDED: ${result.included}`);
  console.log(`priced: ${result.overall.priced} / pending: ${result.overall.pending} / coverage: ${result.overall.coveragePercent}%`);
  console.log(`OWNED: ${JSON.stringify(result.owned)}`);
  console.log(`NEEDED: ${JSON.stringify(result.needed)}`);
  console.log(`OWNED pending: ${ownedPending.length} (${ownedPending.filter((x) => x.compilationComponent).length} compilation components)`);
  console.log(`products: ${JSON.stringify(result.products)}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
