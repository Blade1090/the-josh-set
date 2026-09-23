// ShelfCheck pricing campaign — overnight compilation-product price scan. REPORT ONLY.
//
// Never writes price data, never touches census/dossier/UI/ownership/Reject files. For every
// remaining unresolved multi-identity physical product (i.e. every compilation group not
// already covered by price-product-inherited-v086.js's 3 live entries), searches
// PriceCharting for the product's own CIB price using the same fixed scraping logic verified
// in tools/price-bulk-pricecharting-scan.mjs and tools/price-review-classify.mjs (HTML entity
// decoding, direct-hit-redirect handling, the corrected wide price-cell window). Classifies
// each product; never writes a price anywhere.
//
// Usage:
//   node tools/compilation-price-scan.mjs [--limit=N] [--checkpoint=path] [--out=path] [--log=path] [--delay=ms]
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const REPO = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const m = a.match(/^--([^=]+)=(.*)$/);
  return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true];
}));
const LIMIT = args.limit ? Number(args.limit) : Infinity;
const CHECKPOINT_PATH = path.join(REPO, args.checkpoint || 'audit-out/compilation-price-scan-checkpoint.json');
const OUT_PATH = path.join(REPO, args.out || 'audit-out/compilation-price-scan-report.json');
const LOG_PATH = path.join(REPO, args.log || 'audit-out/compilation-price-scan-log.txt');
const DELAY_MS = args.delay ? Number(args.delay) : 400;

function ts() { return new Date().toISOString(); }
function log(msg) {
  const line = `[${ts()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_PATH, line + '\n');
}

// ---------- live census context (same convention as every other tool this campaign built) ----------
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
  'price-batch-003-v082.js', 'price-batch-004-v083.js', 'price-batch-005-v084.js',
  'price-batch-006-v085.js', 'price-fix.js', 'price-product-inherited-v086.js',
];
function readFile(name) { return fs.readFileSync(path.join(REPO, name), 'utf8'); }

async function currentUnresolvedGroups() {
  const names = ['data0.txt', 'data1.txt', 'data2.txt', 'data3a.txt', 'data3b.txt'];
  const b64 = names.map((n) => fs.readFileSync(path.join(REPO, n), 'utf8')).join('').trim();
  const DATA = JSON.parse(zlib.gunzipSync(Buffer.from(b64, 'base64')).toString('utf8'));
  const norm = (s) => String(s ?? '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[’'`]/g, '').replaceAll('&', ' and ').match(/[a-z0-9]+/g)?.join(' ') || '';
  const items = DATA.i.map((r) => ({ id: r[0], title: r[1], set: r[2], max: r[6], search: norm(r[1]) }));
  const byId = new Map(items.map((x) => [x.id, x]));

  const fakeEl = { textContent: '', dataset: {}, querySelectorAll: () => [], querySelector: () => null, addEventListener: () => {}, appendChild: () => {}, style: {} };
  const fakeDocument = { querySelector: () => fakeEl, querySelectorAll: () => [], createElement: () => ({ ...fakeEl }), addEventListener: () => {}, readyState: 'complete', head: { appendChild: () => {} }, body: { appendChild: () => {} } };
  let stateCache = { owned: [], products: [], prices: [] };
  let dataReadyResolveFn;
  const ctx = {
    DATA, items, byId, norm, aliasesById: new Map(), productMap: new Map(), reverseProducts: new Map(),
    priceMap: new Map(), window: {}, console, document: fakeDocument,
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    atob: (s) => Buffer.from(s, 'base64').toString('binary'), btoa: (s) => Buffer.from(s, 'binary').toString('base64'),
    DecompressionStream, Response, Blob, Uint8Array, setTimeout, clearTimeout, setInterval, clearInterval,
    progress: () => {}, resetBrowse: () => {},
    get stateCache() { return stateCache; }, set stateCache(v) { stateCache = v; },
    saveState: (s) => { stateCache = s; ctx.priceMap = new Map(); for (const p of stateCache?.prices || []) if (p?.t) ctx.priceMap.set(norm(p.t), p); },
    loadState: () => stateCache, ownedSet: new Set(), productSet: new Set(), filter: 'ALL', visibleLimit: 70,
    $: () => fakeEl, status: () => 'NEEDED', effectiveStatus: () => 'NEEDED', render: function () {},
    censusFinalized: false, censusQueue: { add: [], exclude: [] },
  };
  ctx.registerCensusMutation = (phase, fn) => { if (ctx.censusFinalized) throw new Error('after finalization'); ctx.censusQueue[phase].push(fn); };
  ctx.dataReady = new Promise((r) => { dataReadyResolveFn = r; });
  vm.createContext(ctx);
  for (const f of CENSUS_MUTATORS) vm.runInContext(readFile(f), ctx, { filename: f });
  for (const fn of ctx.censusQueue.add) fn();
  for (const fn of ctx.censusQueue.exclude) fn();
  ctx.DATA.n = ctx.items.filter((x) => x.set === 'INCLUDED').length;
  ctx.censusFinalized = true;
  dataReadyResolveFn();
  for (const f of PRICE_FILES) vm.runInContext(readFile(f), ctx, { filename: f });
  await new Promise((r) => setTimeout(r, 1800));

  const modelFixSrc = readFile('model-fix.js');
  function extractLine(marker) {
    const startIdx = modelFixSrc.indexOf(marker);
    const endIdx = modelFixSrc.indexOf('\n', startIdx);
    return modelFixSrc.slice(startIdx, endIdx === -1 ? undefined : endIdx);
  }
  const mergeFnSrc = extractLine('function productKeys(') + '\n' + extractLine('function ensureMergedProducts(){');
  const mergedIndex = vm.runInContext('(function(){let mergedProductIndex=null;' + mergeFnSrc + ';return ensureMergedProducts();})()', ctx, { filename: 'model-fix-extract.js' });

  const isUsable = (v) => v != null && Number.isFinite(Number(v)) && Number(v) > 0;
  const priceVal = (x) => { const p = typeof ctx.priceFor === 'function' ? ctx.priceFor(x) : null; return p?.m ?? p?.x ?? x.max; };

  const seen = new Set();
  const groups = [];
  for (const g of mergedIndex.values()) {
    if (seen.has(g)) continue;
    seen.add(g);
    const covered = [...new Set(g.ids)].map((id) => byId.get(id)).filter((x) => x?.set === 'INCLUDED');
    if (covered.length < 2) continue;
    const anyPending = covered.some((x) => !isUsable(priceVal(x)));
    if (!anyPending) continue; // fully resolved already -- skip
    groups.push({
      productTitle: g.title,
      registered: true,
      coveredIds: covered.map((x) => x.id),
      coveredTitles: covered.map((x) => x.title),
      pendingIds: covered.filter((x) => !isUsable(priceVal(x))).map((x) => x.id),
    });
  }

  // The 2 known compilations with no registered DATA.p product row (per the Model A report) --
  // included so the scan still covers them and reports the mapping problem explicitly, using
  // the product title and covered identities already established by prior manual research.
  groups.push({
    productTitle: 'Ara Fell & Rise of the Third Power', registered: false,
    coveredIds: [82], coveredTitles: ['Ara Fell: Enhanced Edition'], pendingIds: [82],
    mappingNote: 'Not registered as a multi-identity product in DATA.p (per pricing-model-a-implementation.md). Price research here is still useful for when that census fix lands, but cannot resolve PRICE PENDING today.',
  });
  groups.push({
    productTitle: "Capcom Beat 'Em Up Bundle", registered: false,
    coveredIds: [226], coveredTitles: ["Capcom Beat 'Em Up Bundle"], pendingIds: [226],
    mappingNote: 'Not registered as a multi-identity product in DATA.p -- dossier questions whether this is even meant to be a wrapper for separately-tracked constituent games or its own identity. Flagged, not resolved, by this scan.',
  });

  return groups;
}

// ---------- scraping (verbatim-equivalent to the fixed logic in the prior two tools) ----------
function decodeEntities(s) {
  return String(s || '')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}
const norm = (s) => decodeEntities(String(s || '')).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .replace(/&/g, ' and ').replace(/\b(playstation|ps4)\b/g, ' ').replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
const toks = (s) => new Set(norm(s).split(' ').filter((x) => x.length > 1 && !['the', 'and', 'of', 'a', 'an', 'in', 'on', 'for', 'to'].includes(x)));
const overlap = (a, b) => { const A = toks(a), B = toks(b); if (!A.size || !B.size) return 0; let n = 0; for (const x of A) if (B.has(x)) n++; return n / Math.max(A.size, B.size); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url, retries = 4) {
  for (let a = 0; a < retries; a++) {
    try {
      const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 ShelfCheck pricing research (contact: local campaign tool)' } });
      if (r.ok) return { text: await r.text(), finalUrl: r.url };
      if (r.status >= 500 || r.status === 429) { await sleep(1000 * Math.pow(2, a)); continue; }
      return null;
    } catch { await sleep(1000 * Math.pow(2, a)); }
  }
  return 'ERROR';
}
const PLATFORM_SLUGS = {
  'playstation-4': { platform: 'PS4', region: 'US/NTSC' },
  'pal-playstation-4': { platform: 'PS4', region: 'PAL' },
  'jp-playstation-4': { platform: 'PS4', region: 'JP' },
  'asian-english-playstation-4': { platform: 'PS4', region: 'Asian English' },
};
function platformFromUrl(url) {
  const m = new URL(url).pathname.match(/^\/(?:[a-z]{2}\/)?game\/([a-z0-9-]+)\//);
  return m ? PLATFORM_SLUGS[m[1]] || null : null;
}
async function search(title) {
  const res = await get('https://www.pricecharting.com/search-products?type=prices&q=' + encodeURIComponent(title + ' Playstation 4'));
  if (res === 'ERROR') return 'ERROR';
  if (!res) return { rows: [], directHit: null };
  if (/\/game\/[^/]+\/[^/?]+$/.test(new URL(res.finalUrl).pathname)) {
    const titleMatch = res.text.match(/<title>([^<]*)<\/title>/i);
    const cleanTitle = titleMatch ? decodeEntities(titleMatch[1]).trim().replace(/\s*Prices[\s\S]*/i, '').trim() : '';
    return { rows: [], directHit: { url: res.finalUrl, title: cleanTitle } };
  }
  const rows = [...res.text.matchAll(/href="([^"]*\/game\/playstation-4\/[^"]+)"[^>]*>([\s\S]{0,300}?)<\/a>/gi)]
    .map((m) => ({ url: new URL(decodeEntities(m[1]), 'https://www.pricecharting.com').href, title: decodeEntities(m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()) }))
    .filter((r) => r.title && !/^(english|deutsch|español|français|nederlands|italiano)$/i.test(r.title));
  return { rows, directHit: null };
}
function parsePrice(html) {
  const section = html.match(/id="complete_price"[\s\S]{0,600}?<\/td>/i);
  if (section) { const m = section[0].match(/\$([0-9,]+\.\d{2})/); if (m) return { cents: Math.round(Number(m[1].replaceAll(',', '')) * 100), kind: 'CIB' }; }
  return null;
}

async function scanOne(group) {
  const searchResult = await search(group.productTitle);
  if (searchResult === 'ERROR') return { bucket: 'ERROR_RETRY', notes: 'Search request failed after retries.' };

  const candidates = [];
  if (searchResult.directHit) {
    const plat = platformFromUrl(searchResult.directHit.url);
    if (plat) candidates.push({ ...searchResult.directHit, ...plat });
  } else {
    for (const r of searchResult.rows) {
      const plat = platformFromUrl(r.url);
      if (plat) candidates.push({ ...r, ...plat });
    }
  }
  if (!candidates.length) return { bucket: 'NO_MATCH', notes: 'No PS4-platform product page found for this compilation title.' };

  const exact = candidates.filter((c) => norm(c.title) === norm(group.productTitle));
  if (!exact.length) {
    const relevant = candidates.filter((c) => overlap(group.productTitle, c.title) >= 0.4);
    if (!relevant.length) return { bucket: 'NO_MATCH', notes: `${candidates.length} PS4 candidate(s) found, none topically related to "${group.productTitle}".` };
    return { bucket: 'REVIEW', notes: `No exact title match; ${relevant.length} plausibly-related candidate(s) found, needs human judgment.`, candidates: relevant.slice(0, 6) };
  }

  const usPal = exact.find((c) => c.region === 'US/NTSC') || exact.find((c) => c.region === 'PAL');
  const chosen = usPal || exact[0];
  const otherExact = exact.filter((c) => c !== chosen);

  const priceRes = await get(chosen.url);
  if (priceRes === 'ERROR' || !priceRes) return { bucket: 'ERROR_RETRY', notes: `Price page request to ${chosen.url} failed after retries.`, matchedTitle: chosen.title, url: chosen.url, region: chosen.region };

  const price = parsePrice(priceRes.text);
  if (!price) return { bucket: 'NO_DATA', notes: `Exact product matched ("${chosen.title}", ${chosen.region}) but no CIB price on file.`, matchedTitle: chosen.title, url: chosen.url, region: chosen.region };

  return {
    bucket: 'HIGH_CONFIDENCE_PRODUCT_PRICE',
    matchedTitle: chosen.title, url: chosen.url, platform: chosen.platform, region: chosen.region,
    cibCents: price.cents, cibPrice: (price.cents / 100).toFixed(2),
    notes: `Exact title match, PS4, CIB price found.${otherExact.length ? ` (${otherExact.length} other exact-title region variant(s) also tracked: ${otherExact.map((c) => `${c.title} [${c.region}]`).join('; ')})` : ''}`,
  };
}

// ---------- checkpoint ----------
function loadCheckpoint() {
  if (!fs.existsSync(CHECKPOINT_PATH)) return { done: {} };
  try { return JSON.parse(fs.readFileSync(CHECKPOINT_PATH, 'utf8')); } catch { return { done: {} }; }
}
function saveCheckpoint(cp) {
  const tmp = CHECKPOINT_PATH + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(cp, null, 2));
  fs.renameSync(tmp, CHECKPOINT_PATH);
}

async function main() {
  fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
  log(`=== compilation-price-scan starting (limit=${LIMIT === Infinity ? 'none' : LIMIT}, checkpoint=${path.relative(REPO, CHECKPOINT_PATH)}) ===`);

  const groups = await currentUnresolvedGroups();
  log(`Live census: ${groups.length} remaining unresolved compilation products (${groups.filter((g) => g.registered).length} registered, ${groups.filter((g) => !g.registered).length} unregistered/mapping-problem).`);

  const checkpoint = loadCheckpoint();
  const doneKeys = new Set(Object.keys(checkpoint.done));
  const currentKeys = new Set(groups.map((g) => g.productTitle));
  for (const k of Object.keys(checkpoint.done)) if (!currentKeys.has(k)) delete checkpoint.done[k]; // resolved elsewhere since -- drop

  const todo = groups.filter((g) => !doneKeys.has(g.productTitle)).slice(0, LIMIT === Infinity ? undefined : LIMIT);
  log(`Already checkpointed: ${doneKeys.size}. To process this run: ${todo.length}.`);

  const startTime = Date.now();
  let processed = 0;
  for (const group of todo) {
    let result;
    try {
      result = await scanOne(group);
    } catch (e) {
      result = { bucket: 'ERROR_RETRY', notes: 'Unhandled error: ' + e.message };
    }
    checkpoint.done[group.productTitle] = { ...group, ...result };
    saveCheckpoint(checkpoint);
    processed++;
    const elapsed = (Date.now() - startTime) / 1000;
    const rate = processed / elapsed;
    const remaining = todo.length - processed;
    const etaMin = rate > 0 ? (remaining / rate / 60).toFixed(1) : '?';
    log(`${processed}/${todo.length} ("${group.productTitle}") -> ${result.bucket}${result.cibPrice ? ' $' + result.cibPrice : ''} | ETA ~${etaMin} min`);
    await sleep(DELAY_MS);
  }

  const all = Object.values(checkpoint.done);
  const buckets = {};
  for (const r of all) (buckets[r.bucket] ||= []).push(r);
  const summary = Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, v.length]));
  const report = {
    generatedAt: new Date().toISOString(),
    unresolvedGroupsAtStart: groups.length,
    totalCheckpointed: all.length,
    summary,
    buckets,
  };
  fs.writeFileSync(OUT_PATH, JSON.stringify(report, null, 2));
  log(`=== Run complete. Processed ${processed} this run; ${all.length} total checkpointed. Summary: ${JSON.stringify(summary)} ===`);
  log(`Report written to ${path.relative(REPO, OUT_PATH)}`);
  console.log(JSON.stringify({ processedThisRun: processed, totalCheckpointed: all.length, summary }, null, 2));
}

main().catch((e) => { log('FATAL: ' + e.stack); process.exit(1); });
