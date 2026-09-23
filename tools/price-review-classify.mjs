// ShelfCheck pricing campaign — REVIEW-bucket classification. REPORT ONLY.
//
// Never writes price data, never touches census/dossier/UI/ownership/Reject files. Reads the
// REVIEW bucket from a prior tools/price-bulk-pricecharting-scan.mjs run (already-scraped
// candidate lists -- no need to re-search PriceCharting for most identities) plus the live
// census+dossier runtime (same harness as tools/price-pending-queue-audit.mjs) for
// compilation-component flags and dossier physical-release notes. Classifies each REVIEW
// identity into a concrete reason bucket using that local metadata first; only escalates to
// one extra live PriceCharting fetch per identity when local signals are genuinely
// inconclusive. This tool explains *why* each REVIEW case is stuck -- it does not resolve
// prices, even when an escalation happens to turn one up (that's flagged in `notes` for a
// future targeted batch, never auto-classified as resolved).
//
// Usage:
//   node tools/price-review-classify.mjs [--limit=N] [--checkpoint=path] [--out=path] [--log=path] [--scan=path] [--delay=ms]
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
const CHECKPOINT_PATH = path.join(REPO, args.checkpoint || 'audit-out/price-review-classify-checkpoint.json');
const OUT_PATH = path.join(REPO, args.out || 'audit-out/price-review-classify-report.json');
const LOG_PATH = path.join(REPO, args.log || 'audit-out/price-review-classify-log.txt');
const SCAN_PATH = path.join(REPO, args.scan || 'audit-out/price-bulk-scan-report.json');
const DELAY_MS = args.delay ? Number(args.delay) : 400;

function ts() { return new Date().toISOString(); }
function log(msg) {
  const line = `[${ts()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_PATH, line + '\n');
}

// ---------- live census + dossier runtime, same convention as tools/price-pending-queue-audit.mjs ----------
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
const OVERRIDE_BATCHES = Array.from({ length: 63 }, (_, i) => {
  const n = i + 1;
  return { file: n === 1 ? 'dossier-overrides.js' : `dossier-overrides-${n}.js`, global: n === 1 ? 'DOSSIER_OVERRIDES' : `DOSSIER_OVERRIDES_${n}` };
});
function readFile(name) { return fs.readFileSync(path.join(REPO, name), 'utf8'); }

async function buildCensusContext() {
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
  for (const batch of OVERRIDE_BATCHES) run(readFile(batch.file), batch.file);
  run(readFile('dossier-apply.js'), 'dossier-apply.js');
  await new Promise((r) => setTimeout(r, 150));
  for (const f of PRICE_FILES) run(readFile(f), f);
  await new Promise((r) => setTimeout(r, 1600));
  return { run };
}

async function currentCensusMeta() {
  const { run } = await buildCensusContext();
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
          compilationComponent: compIds.has(x.id),
          dossierPhysicalNote: (d && typeof usefulText === 'function' ? usefulText(d.b) : (d?.b || '')) || null,
        };
      });
    })()
  `);
  return new Map(rows.map((r) => [r.id, r]));
}

// ---------- classification helpers ----------
function decodeEntities(s) {
  return String(s || '')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}
const norm = (s) => decodeEntities(String(s || '')).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .replace(/&/g, ' and ').replace(/\b(playstation|ps4)\b/g, ' ').replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
// Generic connector words inflate token overlap between genuinely unrelated titles (e.g.
// "Candleman: The Complete Journey" vs "Hitman The Complete First Season" share only "the"
// and "complete" -- neither identifying) -- stripped before scoring or base-matching.
const STOPWORDS = new Set(['the', 'and', 'of', 'a', 'an', 'in', 'on', 'for', 'to']);
const toks = (s) => new Set(norm(s).split(' ').filter((x) => x.length > 1 && !STOPWORDS.has(x)));
const overlap = (a, b) => { const A = toks(a), B = toks(b); if (!A.size || !B.size) return 0; let n = 0; for (const x of A) if (B.has(x)) n++; return n / Math.max(A.size, B.size); };
const EDITION_WORDS = /\b(edition|remaster(ed)?|definitive|deluxe|enhanced|ultimate|extended|goty|game of the year|complete|collector s|day one|special|limited|steelbook|launch|standard|anniversary|redux|revival|reboot|director s cut)\b/i;
function stripEdition(title) {
  const raw = String(title || '');
  // A trailing bracketed group is PriceCharting's own SKU-variant convention -- strip the
  // whole group first, even when its qualifier isn't a recognized edition word (e.g. "Apex
  // Legends [Lifeline Edition]" vs "[Bloodhound Edition]": "Lifeline"/"Bloodhound" aren't in
  // EDITION_WORDS, but stripping the whole bracket still correctly collapses both to the same
  // base title -- checking this first avoids the word-level regex below stripping only the
  // literal word "edition" and leaving "lifeline" attached).
  if (/\[[^\]]*\]\s*$/.test(raw)) return norm(raw.replace(/\s*\[[^\]]*\]\s*$/, ''));
  const n = norm(title);
  const wordStripped = n.replace(new RegExp(`\\s*(${EDITION_WORDS.source.replace(/\\b/g, '')}).*$`, 'i'), '').trim();
  return wordStripped || n;
}
function hasEditionSuffix(title) { return EDITION_WORDS.test(title) || /\[[^\]]*\]\s*$/.test(String(title || '').trim()); }

const KNOWN_REBRANDS = [
  ['process of elimination', 'tantei bokumetsu'],
  ['neptunia riders vs dogoos', 'neptunia vs titan dogoo'],
  ['lapis x labyrinth', 'lapis re abyss'],
];
function isKnownRebrand(title) {
  const n = norm(title);
  return KNOWN_REBRANDS.some(([a, b]) => n === a || n === b);
}
const REBRAND_NOTE_PATTERN = /rebrand|localiz|localis|also (released|known) as|renamed|international title|western title|japanese title/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(url, retries = 3) {
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
function parsePrice(html) {
  const section = html.match(/id="complete_price"[\s\S]{0,600}?<\/td>/i);
  if (section) { const m = section[0].match(/\$([0-9,]+\.\d{2})/); if (m) return { cents: Math.round(Number(m[1].replaceAll(',', '')) * 100), kind: 'CIB' }; }
  return null;
}

// Reuse prior manual research from batches 1-5 (audit-out/physical-legitimacy-census-review-
// queue.json) instead of re-deriving it or escalating blind -- this file already records,
// per id, exactly why a title was held back, with real evidence gathered at the time.
function loadPriorResearch() {
  const p = path.join(REPO, 'audit-out/physical-legitimacy-census-review-queue.json');
  const byId = new Map();
  if (!fs.existsSync(p)) return byId;
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  for (const item of data.items || []) byId.set(item.id, { bucket: 'PHYSICAL_LEGITIMACY_LIKELY_DIGITAL_ONLY', notes: `Prior research (physical-legitimacy queue): ${item.evidence}` });
  const CATEGORY_MAP = { NO_RELIABLE_DATA: 'EXACT_PRODUCT_NO_PRICE_DATA' };
  for (const item of data.alsoUnresolvedButDifferentCategory?.items || []) {
    let bucket = CATEGORY_MAP[item.category];
    // The old generic "REVIEW" category doesn't map directly, but the reason text captured at
    // the time often already says exactly which of the current buckets applies -- reuse that
    // instead of re-deriving it or, worse, silently discarding it.
    if (!bucket && item.category === 'REVIEW') {
      if (/compilation|bundl(e|ing)|wrapper|2.in.1|share one disc|constituent/i.test(item.reason)) bucket = 'COMPILATION_COMPONENT';
      else if (/differently.named|only a .*edition|edition.*ambigu/i.test(item.reason)) bucket = 'EDITION_AMBIGUITY';
    }
    if (bucket) byId.set(item.id, { bucket, notes: `Prior research (batch queue): ${item.reason}` });
    else if (item.reason) byId.set(item.id, { priorContextOnly: `Prior research (batch queue, category ${item.category}): ${item.reason}` });
  }
  return byId;
}

function classifyLocal(record, meta, priorResearch) {
  const dossierNote = meta?.dossierPhysicalNote || '';
  if (meta?.compilationComponent) {
    return { bucket: 'COMPILATION_COMPONENT', notes: 'Flagged as a component of a multi-identity physical product by the live runtime product index.' };
  }
  const prior = priorResearch?.get(record.id);
  if (prior?.bucket) return prior;
  if (isKnownRebrand(record.title) || REBRAND_NOTE_PATTERN.test(dossierNote)) {
    return { bucket: 'REBRAND_OR_LOCALIZED_TITLE', notes: dossierNote ? `Dossier note suggests a rebrand/localization: "${dossierNote}"` : 'Title matches a known rebrand/localized-title pair.' };
  }

  const candidates = record.candidates || [];
  const relevant = candidates.filter((c) => overlap(record.title, c.title) >= 0.4);
  const base = stripEdition(record.title);
  const sameBase = candidates.filter((c) => stripEdition(c.title) === base);

  if (sameBase.length >= 2) {
    const allEdition = sameBase.every((c) => hasEditionSuffix(c.title));
    return allEdition
      ? { bucket: 'EDITION_AMBIGUITY', notes: `${sameBase.length} tracked SKUs share the base title, differing only by edition: ${sameBase.map((c) => c.title).join('; ')}` }
      : { bucket: 'MULTIPLE_PHYSICAL_SKUS', notes: `${sameBase.length} tracked products share the base title without a clear single edition/standard SKU: ${sameBase.map((c) => c.title).join('; ')}` };
  }
  if (sameBase.length === 1 && hasEditionSuffix(sameBase[0].title)) {
    return { bucket: 'EDITION_AMBIGUITY', notes: `Only a single edition-qualified SKU is tracked ("${sameBase[0].title}"), no plain/standard edition found.` };
  }

  if (relevant.length && relevant.every((c) => c.region === 'JP' || c.region === 'Asian English')) {
    return { bucket: 'IMPORT_ONLY_AMBIGUITY', notes: `Only import-region candidates found: ${relevant.map((c) => `${c.title} (${c.region})`).join('; ')}` };
  }

  if (relevant.length === 0) {
    return { bucket: 'PHYSICAL_LEGITIMACY_LIKELY_DIGITAL_ONLY', notes: `No candidate found is topically related to "${record.title}" -- the ${candidates.length} candidate(s) PriceCharting returned appear to be unrelated titles, suggesting no tracked PS4 physical product exists.` };
  }

  return null; // inconclusive locally -- escalate
}

async function classifyWithEscalation(record, meta, priorResearch) {
  // Context from an earlier batch's research that didn't resolve to a specific bucket on its
  // own (a generic old "REVIEW" note) -- never discarded, always appended to whatever this
  // pass concludes so the earlier legwork stays visible even when the bucket comes from here.
  const priorContext = priorResearch?.get(record.id)?.priorContextOnly;
  const withPriorContext = (result) => priorContext ? { ...result, notes: `${result.notes} | ${priorContext}` } : result;

  const local = classifyLocal(record, meta, priorResearch);
  if (local) return withPriorContext({ ...local, escalated: false });

  // One lightweight escalation: check the single most-relevant candidate's own product page
  // for a price, to distinguish "exact-ish product just has no price" from "needs a human."
  const candidates = record.candidates || [];
  const best = candidates.map((c) => ({ ...c, score: overlap(record.title, c.title) })).sort((a, b) => b.score - a.score)[0];
  if (!best) return withPriorContext({ bucket: 'OTHER_MANUAL_REVIEW', notes: 'No relevant candidates and no local classification matched.', escalated: false });

  const res = await get(best.url);
  if (res === 'ERROR' || !res) {
    return withPriorContext({ bucket: 'OTHER_MANUAL_REVIEW', notes: `Escalation request to ${best.url} failed; needs manual look.`, escalated: true });
  }
  const price = parsePrice(res.text);
  const closeTitle = stripEdition(best.title) === stripEdition(record.title) || overlap(record.title, best.title) >= 0.7;
  if (price && closeTitle) {
    return withPriorContext({ bucket: 'OTHER_MANUAL_REVIEW', notes: `Escalation found a plausible match with a live price ($${(price.cents / 100).toFixed(2)}) at ${best.url} -- title similarity ${Math.round(best.score * 100)}%, not exact enough to auto-accept; worth a human look for a future batch.`, escalated: true });
  }
  if (!price && closeTitle) {
    return withPriorContext({ bucket: 'EXACT_PRODUCT_NO_PRICE_DATA', notes: `Closest candidate "${best.title}" (similarity ${Math.round(best.score * 100)}%) has no price data at ${best.url}.`, escalated: true });
  }
  return withPriorContext({ bucket: 'OTHER_MANUAL_REVIEW', notes: `Best candidate "${best.title}" (similarity ${Math.round(best.score * 100)}%) is not a confident enough match; needs manual judgment.`, escalated: true });
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
  log(`=== price-review-classify starting (limit=${LIMIT === Infinity ? 'none' : LIMIT}, checkpoint=${path.relative(REPO, CHECKPOINT_PATH)}) ===`);

  const scan = JSON.parse(fs.readFileSync(SCAN_PATH, 'utf8'));
  const reviewRecords = scan.buckets.REVIEW || [];
  log(`Loaded ${reviewRecords.length} REVIEW identities from ${path.relative(REPO, SCAN_PATH)}.`);

  log('Building live census + dossier context to check compilation-component / dossier-note metadata...');
  const censusMeta = await currentCensusMeta();
  const priorResearch = loadPriorResearch();
  log(`Loaded ${priorResearch.size} prior-research entries from earlier batches' physical-legitimacy queue.`);
  const stillPendingIds = new Set([...censusMeta.values()].filter((x) => !x.priced).map((x) => x.id));
  const toClassify = reviewRecords.filter((r) => stillPendingIds.has(r.id));
  log(`Of those, ${toClassify.length} are still PRICE PENDING right now (rest were priced by other work since the scan).`);

  const checkpoint = loadCheckpoint();
  const doneIds = new Set(Object.keys(checkpoint.done).map(Number));
  for (const idStr of Object.keys(checkpoint.done)) {
    if (!stillPendingIds.has(Number(idStr))) delete checkpoint.done[idStr];
  }

  const todo = toClassify.filter((x) => !doneIds.has(x.id)).slice(0, LIMIT === Infinity ? undefined : LIMIT);
  log(`Already checkpointed: ${doneIds.size}. To process this run: ${todo.length}.`);

  const startTime = Date.now();
  let processed = 0;
  for (const record of todo) {
    const meta = censusMeta.get(record.id);
    let result;
    try {
      result = await classifyWithEscalation(record, meta, priorResearch);
    } catch (e) {
      result = { bucket: 'OTHER_MANUAL_REVIEW', notes: 'Unhandled error during classification: ' + e.message, escalated: false };
    }
    checkpoint.done[record.id] = { id: record.id, title: record.title, ...result, dossierPhysicalNote: meta?.dossierPhysicalNote || null };
    saveCheckpoint(checkpoint);
    processed++;
    const elapsed = (Date.now() - startTime) / 1000;
    const rate = processed / elapsed;
    const remaining = todo.length - processed;
    const etaMin = rate > 0 ? (remaining / rate / 60).toFixed(1) : '?';
    log(`${processed}/${todo.length} (id ${record.id} "${record.title}") -> ${result.bucket}${result.escalated ? ' [escalated]' : ''} | ETA ~${etaMin} min`);
    if (result.escalated) await sleep(DELAY_MS);
  }

  const all = Object.values(checkpoint.done);
  const buckets = {};
  for (const r of all) (buckets[r.bucket] ||= []).push(r);
  const summary = Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, v.length]));
  const report = {
    generatedAt: new Date().toISOString(),
    reviewIdentitiesAtStart: reviewRecords.length,
    stillPendingAtStart: toClassify.length,
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
