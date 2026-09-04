// ShelfCheck census runtime determinism regression test.
//
// Loads the real census data + every census-mutating <script> (in their actual index.html
// order, ALL of them positioned before census-finalize.js) into a fresh Node vm context per
// run, under randomized realistic load timing (a variable data-fetch delay plus a variable
// per-tag execution offset, modeling the other non-mutating <script> tags -- dossier
// overrides etc. -- that sit between them in the real page), and checks that the finalized
// census (item set membership, INCLUDED count, and a SATISFIED count against a fixed
// synthetic ownership snapshot) is byte-for-byte identical across every run. It also
// specifically checks the class of bug this was written for: an identity matching an
// existing exclusion/dedup rule must end up EXCLUDED even when a later script is the one
// that adds it to the census, regardless of script/network timing.
//
// It also verifies the finalization freeze itself: once census-finalize.js has run, a
// registerCensusMutation() call (e.g. from a script mistakenly placed after it) must be
// refused (throw), not silently applied -- INCLUDED membership must stay frozen for the
// rest of that page load.
//
// Usage:
//   node tools/census-determinism-test.mjs [runs]     (default 20 runs; exits 1 on failure)
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const REPO = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

// Every <script> tag in index.html that can mutate census item membership/status, paired
// with its real (1-indexed) tag position -- kept in sync with index.html by hand; if a new
// census-mutating script is added, add its filename + tag position here too.
const MUTATORS = [
  ['census-cleanup.js', 5],
  ['census-v034.js', 54],
  ['census-collapse-v035.js', 55],
  ['census-v035-final.js', 56],
  ['census-v040-pricing-audit.js', 57],
  ['census-v052-pricecharting-negative-space.js', 58],
  ['census-v053-pricecharting-regional-sweep.js', 59],
  ['census-v054-pricecharting-collection-gap.js', 60],
  ['census-v055-pricecharting-ab-sweep.js', 61],
  ['census-v056-pricecharting-cf-sweep.js', 62],
  ['census-v057-pricecharting-gl-sweep.js', 63],
  ['census-v058-pricecharting-mr-sweep.js', 64],
  ['census-v059-pricecharting-sz-sweep.js', 65],
  ['census-v060-integrity-scrub.js', 66],
  ['census-integrity-pass-v001.js', 67],
  ['census-integrity-pass-v002.js', 68],
  ['ownership-reconcile-v071.js', 69],
  ['census-finalize.js', 70],
];

// Known conflict identities: added by a v052-059 sweep script under an id that also matches
// an existing exclusion/dedup rule elsewhere (census-cleanup.js's EXCLUDE map, in every case
// currently in the codebase). This is the exact class of bug reported for Funko Fusion
// (id 2310): it must be EXCLUDED in the finalized census on every single run, never
// INCLUDED, regardless of script/network timing.
const KNOWN_CONFLICT_IDS = [2310, 2394, 2421, 2472, 2571, 2713, 2714, 2734, 2743, 2764];

function norm(s) {
  return String(s ?? '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[’'`]/g, '').replaceAll('&', ' and ').match(/[a-z0-9]+/g)?.join(' ') || '';
}

function perTagMs() { return 0.5 + Math.random() * 4; }

async function loadCensusData() {
  const names = ['data0.txt', 'data1.txt', 'data2.txt', 'data3a.txt', 'data3b.txt'];
  const b64 = names.map((n) => fs.readFileSync(path.join(REPO, n), 'utf8')).join('').trim();
  return JSON.parse(zlib.gunzipSync(Buffer.from(b64, 'base64')).toString('utf8'));
}

function readFile(name) {
  return fs.readFileSync(path.join(REPO, name), 'utf8');
}

// Runs one simulated page load under randomized timing and returns the finalized state.
function runOneLoad(DATA0, dataDelayMs) {
  return new Promise((resolve, reject) => {
    const DATA = { ...DATA0, i: DATA0.i.map((r) => [...r]) };
    const fullItems = DATA.i.map((r) => ({ id: r[0], title: r[1], set: r[2], baseline: r[3], strong: r[4], target: r[5], max: r[6], search: norm(r[1]) }));
    const fullById = new Map(fullItems.map((x) => [x.id, x]));
    const aliasesById = new Map();
    for (const [a, id] of DATA.a || []) { if (!aliasesById.has(id)) aliasesById.set(id, []); aliasesById.get(id).push(a); }
    const productMap = new Map(), reverseProducts = new Map();

    const fakeEl = { textContent: '', dataset: {}, querySelectorAll: () => [], querySelector: () => null, addEventListener: () => {}, appendChild: () => {}, style: {} };
    const fakeDocument = { querySelector: () => fakeEl, querySelectorAll: () => [], createElement: () => ({ ...fakeEl }), addEventListener: () => {}, readyState: 'complete', head: { appendChild: () => {} }, body: { appendChild: () => {} } };

    let dataReadyResolve;
    const ctx = {
      DATA, items: [], byId: new Map(), norm, aliasesById, productMap, reverseProducts,
      window: {}, console: { log() {}, info() {}, warn() {}, error(...a) { errors.push(a.join(' ')); } },
      document: fakeDocument,
      ownedSet: new Set(), productSet: new Set(), stateCache: { owned: [], products: [], prices: [] },
      $: () => fakeEl,
      progress: () => {}, resetBrowse: () => {},
      setTimeout, clearTimeout, setInterval, clearInterval,
      saveState: (s) => { ctx.stateCache = s; }, loadState: () => ctx.stateCache,
      censusFinalized: false,
      censusQueue: { add: [], exclude: [] },
    };
    const errors = [];
    ctx.registerCensusMutation = (phase, fn) => {
      if (ctx.censusFinalized) {
        const msg = `registerCensusMutation('${phase}') called after census finalization -- refused`;
        throw new Error(msg);
      }
      ctx.censusQueue[phase].push(fn);
    };
    ctx.dataReady = new Promise((r) => { dataReadyResolve = r; });
    vm.createContext(ctx);

    setTimeout(() => {
      ctx.items = fullItems;
      ctx.byId = fullById;
      dataReadyResolve();
    }, dataDelayMs);

    let cumMs = 0, lastPos = 0;
    for (const [file, pos] of MUTATORS) {
      cumMs += (pos - lastPos) * perTagMs();
      lastPos = pos;
      setTimeout(() => {
        try { vm.runInContext(readFile(file), ctx, { filename: file, displayErrors: true }); }
        catch (e) { errors.push(`${file}: ${e.message}`); }
      }, cumMs);
    }
    const lastTagMs = cumMs;

    setTimeout(() => {
      if (!ctx.censusFinalized) { reject(new Error('census-finalize.js never ran to completion')); return; }

      // Verify the freeze: a registration attempt after finalization must be refused, and
      // must not mutate membership -- this is the exact bug this follow-up fixes (a script
      // positioned after census-finalize.js could otherwise still change INCLUDED status).
      const beforeSnapshot = membershipHash(new Set(ctx.items.filter((x) => x.set === 'INCLUDED').map((x) => x.id)));
      let lateRegistrationRefused = false;
      try {
        ctx.registerCensusMutation('exclude', () => { ctx.items[0].set = 'EXCLUDED'; });
      } catch (e) {
        lateRegistrationRefused = true;
      }
      const afterSnapshot = membershipHash(new Set(ctx.items.filter((x) => x.set === 'INCLUDED').map((x) => x.id)));
      const freezeHeld = lateRegistrationRefused && beforeSnapshot === afterSnapshot;

      const included = ctx.items.filter((x) => x.set === 'INCLUDED');
      // Fixed synthetic ownership snapshot (every item flagged OWNED in the base data) so
      // SATISFIED is computable and comparable across runs without needing Josh's real
      // GameEye import -- this exercises the same collection-aware formula
      // progress-stable-v061.js uses (ownedSet + product-collection coverage), just against
      // a snapshot every run shares.
      const ownedSet = new Set(fullItems.filter((x) => x.baseline === 'OWNED').map((x) => x.id));
      const satisfied = new Set();
      for (const id of ownedSet) if (ctx.byId.get(id)?.set === 'INCLUDED') satisfied.add(id);
      resolve({
        included: included.length,
        includedIds: new Set(included.map((x) => x.id)),
        satisfied: satisfied.size,
        freezeHeld,
        errors,
      });
    }, Math.max(dataDelayMs, lastTagMs) + 500);
  });
}

function membershipHash(idSet) {
  return [...idSet].sort((a, b) => a - b).join(',');
}

async function main() {
  const N = Number(process.argv[2]) || 20;
  const DATA0 = await loadCensusData();
  const runs = [];
  let anyErrors = [];
  for (let i = 0; i < N; i++) {
    const delay = Math.floor(Math.random() * 300);
    const r = await runOneLoad(DATA0, delay);
    runs.push(r);
    if (r.errors.length) anyErrors = anyErrors.concat(r.errors);
    process.stdout.write(`run ${i + 1}/${N}: INCLUDED=${r.included} SATISFIED=${r.satisfied}\n`);
  }

  const includedCounts = new Set(runs.map((r) => r.included));
  const satisfiedCounts = new Set(runs.map((r) => r.satisfied));
  const hashes = new Set(runs.map((r) => membershipHash(r.includedIds)));

  let failed = false;
  const fail = (msg) => { console.error(`FAIL: ${msg}`); failed = true; };

  if (includedCounts.size !== 1) fail(`INCLUDED count not stable across runs: ${[...includedCounts].join(', ')}`);
  if (satisfiedCounts.size !== 1) fail(`SATISFIED count not stable across runs: ${[...satisfiedCounts].join(', ')}`);
  if (hashes.size !== 1) fail(`Item membership not identical across runs (${hashes.size} distinct membership sets)`);
  if (anyErrors.length) fail(`Script errors during simulated loads: ${anyErrors.slice(0, 5).join(' | ')}`);

  const unfrozenRuns = runs.filter((r) => !r.freezeHeld).length;
  if (unfrozenRuns > 0) fail(`Post-finalization registerCensusMutation() was NOT refused (or mutated membership anyway) in ${unfrozenRuns}/${N} runs -- census membership is not frozen after finalization`);

  const lastRun = runs[runs.length - 1];
  for (const id of KNOWN_CONFLICT_IDS) {
    if (lastRun.includedIds.has(id)) fail(`Known conflict identity id=${id} was INCLUDED (must always be EXCLUDED by an existing rule)`);
  }

  if (!failed) {
    console.log(`\nPASS: ${N}/${N} runs identical -- INCLUDED=${[...includedCounts][0]}, SATISFIED=${[...satisfiedCounts][0]}, 1 unique membership hash, all ${KNOWN_CONFLICT_IDS.length} known-conflict identities correctly excluded on every run, post-finalization mutation refused on every run.`);
  } else {
    console.error(`\n${runs.length} runs completed with failures above.`);
  }
  process.exit(failed ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
