// ShelfCheck pricing campaign — bulk PriceCharting candidate scan. REPORT ONLY.
//
// This tool NEVER writes price data into ShelfCheck. It never touches any price-*.js file,
// index.html, census/dossier/ownership/Reject/wishlist data, or any pricing value already in
// the app. It only reads the live runtime pending list and writes report/log/checkpoint files
// under audit-out/. Turning its findings into an actual price-batch-NNN.js file (with the
// same guarded-write pattern as every prior batch) is a separate, deliberate step that must
// verify each candidate first -- this tool produces candidates, not commits.
//
// Origin: this repairs 4 real bugs found (2026-09-22) in tools/price-whole-census-final.mjs
// when tested against the current PriceCharting.com HTML: unhandled HTML entities in scraped
// titles/URLs, a single-match search-redirect case misread as "zero candidates," a too-narrow
// price-cell text window, and stricter platform/match-confidence rules than that script had
// (which had let a wrong-platform and a wrong-product match through as "resolved").
//
// Usage:
//   node tools/price-bulk-pricecharting-scan.mjs [--limit=N] [--checkpoint=path] [--out=path] [--log=path] [--delay=ms]
//
// Resuming: re-running with the same --checkpoint path picks up where it left off. On every
// run (including resumes) the current PRICE PENDING list is regenerated live from the real
// runtime pipeline, so any identity priced by other work since the checkpoint was started is
// automatically dropped rather than reprocessed or reported stale.
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
const CHECKPOINT_PATH = path.join(REPO, args.checkpoint || 'audit-out/price-bulk-scan-checkpoint.json');
const OUT_PATH = path.join(REPO, args.out || 'audit-out/price-bulk-scan-report.json');
const LOG_PATH = path.join(REPO, args.log || 'audit-out/price-bulk-scan-log.txt');
const DELAY_MS = args.delay ? Number(args.delay) : 400;

// ---------- logging ----------
function ts() { return new Date().toISOString(); }
function log(msg) {
  const line = `[${ts()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_PATH, line + '\n');
}

// ---------- live runtime pending-list generation (same convention as tools/price-runtime-audit.mjs) ----------
// Kept in sync BY HAND with index.html's actual <script> order. Verified 2026-09-22.
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

async function currentPendingList() {
  const names = ['data0.txt', 'data1.txt', 'data2.txt', 'data3a.txt', 'data3b.txt'];
  const b64 = names.map((n) => fs.readFileSync(path.join(REPO, n), 'utf8')).join('').trim();
  const DATA = JSON.parse(zlib.gunzipSync(Buffer.from(b64, 'base64')).toString('utf8'));
  const norm = (s) => String(s ?? '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[’'`]/g, '').replaceAll('&', ' and ').match(/[a-z0-9]+/g)?.join(' ') || '';
  const items = DATA.i.map((r) => ({ id: r[0], title: r[1], set: r[2], baseline: r[3], strong: r[4], target: r[5], max: r[6], search: norm(r[1]) }));
  const byId = new Map(items.map((x) => [x.id, x]));
  const aliasesById = new Map();
  for (const [a, id] of DATA.a || []) { if (!aliasesById.has(id)) aliasesById.set(id, []); aliasesById.get(id).push(a); }

  const fakeEl = { textContent: '', dataset: {}, querySelectorAll: () => [], querySelector: () => null, addEventListener: () => {}, appendChild: () => {}, style: {} };
  const fakeDocument = { querySelector: () => fakeEl, querySelectorAll: () => [], createElement: () => ({ ...fakeEl }), addEventListener: () => {}, readyState: 'complete', head: { appendChild: () => {} }, body: { appendChild: () => {} } };
  let stateCache = { owned: [], products: [], prices: [] };
  let dataReadyResolveFn;
  const ctx = {
    DATA, items, byId, norm, aliasesById, productMap: new Map(), reverseProducts: new Map(),
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
  ctx.registerCensusMutation = (phase, fn) => { if (ctx.censusFinalized) throw new Error('registerCensusMutation after finalization'); ctx.censusQueue[phase].push(fn); };
  ctx.dataReady = new Promise((r) => { dataReadyResolveFn = r; });
  vm.createContext(ctx);
  for (const f of CENSUS_MUTATORS) vm.runInContext(readFile(f), ctx, { filename: f });
  for (const fn of ctx.censusQueue.add) fn();
  for (const fn of ctx.censusQueue.exclude) fn();
  ctx.DATA.n = ctx.items.filter((x) => x.set === 'INCLUDED').length;
  ctx.censusFinalized = true;
  dataReadyResolveFn();

  for (const f of PRICE_FILES) vm.runInContext(readFile(f), ctx, { filename: f });
  await new Promise((r) => setTimeout(r, 1600));

  const isUsable = (v) => v != null && Number.isFinite(Number(v)) && Number(v) > 0;
  const included = ctx.items.filter((x) => x.set === 'INCLUDED');
  return included.filter((x) => {
    const p = typeof ctx.priceFor === 'function' ? ctx.priceFor(x) : null;
    const v = p?.m ?? p?.x ?? x.max;
    return !isUsable(v);
  }).map((x) => ({ id: x.id, title: x.title }));
}

// ---------- scraping ----------
function decodeEntities(s) {
  return String(s || '')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}
const norm = (s) => decodeEntities(String(s || '')).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .replace(/&/g, ' and ').replace(/\b(playstation|ps4)\b/g, ' ').replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url, retries = 4) {
  for (let a = 0; a < retries; a++) {
    try {
      const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 ShelfCheck pricing research (contact: local campaign tool)' } });
      if (r.ok) return { text: await r.text(), finalUrl: r.url };
      if (r.status >= 500 || r.status === 429) { await sleep(1000 * Math.pow(2, a)); continue; }
      return null; // 4xx other than 429: don't retry, treat as no-result
    } catch {
      await sleep(1000 * Math.pow(2, a));
    }
  }
  return 'ERROR';
}

// Platform slug -> {platform, region}. Anything not matching one of these is NOT PlayStation 4
// and must be rejected outright, regardless of title similarity.
const PLATFORM_SLUGS = {
  'playstation-4': { platform: 'PS4', region: 'US/NTSC' },
  'pal-playstation-4': { platform: 'PS4', region: 'PAL' },
  'jp-playstation-4': { platform: 'PS4', region: 'JP' },
  'asian-english-playstation-4': { platform: 'PS4', region: 'Asian English' },
};
function platformFromUrl(url) {
  const m = new URL(url).pathname.match(/^\/(?:[a-z]{2}\/)?game\/([a-z0-9-]+)\//);
  if (!m) return null;
  return PLATFORM_SLUGS[m[1]] || null; // null = wrong platform (PS1/PS5/Xbox/Switch/etc.) -- reject
}

async function search(censusTitle) {
  const res = await get('https://www.pricecharting.com/search-products?type=prices&q=' + encodeURIComponent(censusTitle + ' Playstation 4'));
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
  return null; // deliberately no loose fallback here -- CIB-only per campaign rule; NO_DATA if absent
}

async function resolveOne(x) {
  // Gather every PS4-platform candidate for this identity, from either a direct redirect
  // (single unambiguous PriceCharting match) or a search-results list.
  const searchResult = await search(x.title);
  if (searchResult === 'ERROR') return { ...x, bucket: 'ERROR_RETRY', reason: 'search request failed after retries' };

  const candidates = [];
  if (searchResult.directHit) {
    const plat = platformFromUrl(searchResult.directHit.url);
    if (plat) candidates.push({ ...searchResult.directHit, ...plat });
    // A direct hit on a non-PS4 platform means PriceCharting itself decided this is the single
    // best match for the query, and it isn't PS4 -- that's a strong NO_MATCH signal, not review.
  } else {
    for (const r of searchResult.rows) {
      const plat = platformFromUrl(r.url);
      if (plat) candidates.push({ ...r, ...plat });
    }
  }

  if (!candidates.length) return { ...x, bucket: 'NO_MATCH', reason: 'no PS4-platform product found' };

  // Exact normalized-title match ONLY counts toward high confidence. Token-overlap/fuzzy
  // matches are demoted to REVIEW no matter how close -- this is the fix for both the
  // wrong-platform and wrong-product false positives found in the prior scraper.
  const exact = candidates.filter((c) => norm(c.title) === norm(x.title));
  const distinctExactTitles = new Set(exact.map((c) => norm(c.title) + '|' + c.region));
  if (exact.length === 0) {
    return { ...x, bucket: 'REVIEW', reason: 'candidates found but none exactly title-match', candidates: candidates.slice(0, 6) };
  }
  if (distinctExactTitles.size > 1 || exact.length > 1 && new Set(exact.map(e=>e.region)).size > 1 && !exact.every(e=>e.region===exact[0].region)) {
    // Same exact title tracked under genuinely different products/regions in a way we can't
    // safely collapse (rare, but region price divergence should still be reviewed by a human
    // when more than one platform variant exists) -- fall through to per-region selection below
    // instead of blindly picking one; this branch mainly guards future edge cases.
  }

  // Prefer US/NTSC, then PAL, for the "official" match; track JP/Asian English separately.
  const usPal = exact.find((c) => c.region === 'US/NTSC') || exact.find((c) => c.region === 'PAL');
  const importMatch = exact.find((c) => c.region === 'JP' || c.region === 'Asian English');
  const chosen = usPal || importMatch;

  const priceRes = await get(chosen.url);
  if (priceRes === 'ERROR') return { ...x, bucket: 'ERROR_RETRY', reason: 'price page request failed after retries', matchedTitle: chosen.title, url: chosen.url };
  const price = priceRes ? parsePrice(priceRes.text) : null;
  if (!price) {
    return { ...x, bucket: 'NO_DATA', reason: 'exact product matched but no CIB price on file', matchedTitle: chosen.title, url: chosen.url, platform: chosen.platform, region: chosen.region };
  }

  const bucket = chosen.region === 'US/NTSC' || chosen.region === 'PAL' ? 'HIGH_CONFIDENCE_US_PAL' : 'HIGH_CONFIDENCE_IMPORT';
  return {
    ...x, bucket, reason: 'exact normalized title match, PS4, CIB price found',
    matchedTitle: chosen.title, url: chosen.url, platform: chosen.platform, region: chosen.region,
    cibCents: price.cents, cibPrice: (price.cents / 100).toFixed(2),
    alsoImportAvailable: usPal && importMatch ? { title: importMatch.title, url: importMatch.url } : undefined,
  };
}

// ---------- checkpoint (atomic write: tmp file + rename, so a kill mid-write can't corrupt it) ----------
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
  log(`=== price-bulk-pricecharting-scan starting (limit=${LIMIT === Infinity ? 'none' : LIMIT}, checkpoint=${path.relative(REPO, CHECKPOINT_PATH)}) ===`);

  const pending = await currentPendingList();
  log(`Live runtime PRICE PENDING count: ${pending.length}`);

  const checkpoint = loadCheckpoint();
  const doneIds = new Set(Object.keys(checkpoint.done).map(Number));
  // Requirement 2: auto-exclude anything the checkpoint has recorded whose id is no longer in
  // the live pending list at all (it got priced by other work since) -- drop it silently.
  for (const idStr of Object.keys(checkpoint.done)) {
    if (!pending.some((p) => p.id === Number(idStr))) delete checkpoint.done[idStr];
  }

  const todo = pending.filter((x) => !doneIds.has(x.id)).slice(0, LIMIT === Infinity ? undefined : LIMIT);
  log(`Already checkpointed: ${doneIds.size}. To process this run: ${todo.length}.`);

  const startTime = Date.now();
  let processed = 0;
  for (const x of todo) {
    let result;
    try {
      result = await resolveOne(x);
    } catch (e) {
      result = { ...x, bucket: 'ERROR_RETRY', reason: 'unhandled error: ' + e.message };
    }
    checkpoint.done[x.id] = result;
    saveCheckpoint(checkpoint);
    processed++;
    const elapsed = (Date.now() - startTime) / 1000;
    const rate = processed / elapsed; // items/sec
    const remaining = todo.length - processed;
    const etaMin = rate > 0 ? (remaining / rate / 60).toFixed(1) : '?';
    log(`${processed}/${todo.length} (id ${x.id} "${x.title}") -> ${result.bucket}${result.cibPrice ? ' $' + result.cibPrice : ''} | ETA ~${etaMin} min`);
    await sleep(DELAY_MS);
  }

  // Final report, grouped by bucket.
  const all = Object.values(checkpoint.done);
  const buckets = {};
  for (const r of all) (buckets[r.bucket] ||= []).push(r);
  const summary = Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, v.length]));
  const report = {
    generatedAt: new Date().toISOString(),
    livePendingAtStart: pending.length,
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
