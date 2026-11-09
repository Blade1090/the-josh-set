// ShelfCheck Random Game no-repeat regression test.
//
// Loads the REAL random-cycle-v001.js (the cycle behind RANDOM GAME / ANOTHER RANDOM GAME) in a
// Node vm with a seeded RNG and an in-memory localStorage, and checks:
//   1. repeated clicks on a large pool never repeat until every eligible game has been shown;
//   2. small pools (3, 2, 1) cycle through every game before repeating, never the same game twice
//      in a row across cycle boundaries; an empty pool returns null;
//   3. filter changes mid-cycle (narrowing and widening the eligible pool) never re-show a game
//      already seen this cycle until the current pool is exhausted, and never show ineligible ids;
//   4. NEEDED and OWNED keep independent cycles;
//   5. the shown set survives a page reload (same storage);
//   6. fun-features-v103.js and index.html actually use this cycle.
//
// Usage: node tools/random-no-repeat-test.mjs (exits 1 on failure)
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const REPO = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const read = (f) => fs.readFileSync(path.join(REPO, f), 'utf8');
let failures = 0;
const check = (ok, msg) => { if (!ok) { failures++; console.error('FAIL:', msg); } };

function seeded(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function memoryStorage() { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }; }
function loadCycle() {
  const ctx = { window: {}, Math, JSON, Set, Map, Array, Object };
  vm.createContext(ctx);
  vm.runInContext(read('random-cycle-v001.js'), ctx, { filename: 'random-cycle-v001.js' });
  return ctx.window.SHELFCHECK_RANDOM_CYCLE;
}
const range = (a, b) => Array.from({ length: b - a }, (_, i) => a + i);
const R = loadCycle();
check(R && typeof R.create === 'function' && R.shared, 'random-cycle-v001.js exposes SHELFCHECK_RANDOM_CYCLE.create/shared');

// 1. Large pool: 500 clicks over 500 games are all distinct, then a new cycle starts.
{
  const c = R.create({ random: seeded(1) }), pool = range(1, 501), shown = [];
  for (let i = 0; i < 500; i++) shown.push(c.draw(pool, 'NEEDED'));
  check(new Set(shown).size === 500, `large pool: 500 clicks should show 500 distinct games, got ${new Set(shown).size}`);
  const next = c.draw(pool, 'NEEDED');
  check(pool.includes(next) && next !== shown.at(-1), 'large pool: first draw of the next cycle is eligible and not the last game shown');
}

// 2. Small pools: each block of n draws is a permutation; never the same game twice in a row.
for (const n of [3, 2]) {
  for (let seed = 1; seed <= 40; seed++) {
    const c = R.create({ random: seeded(seed) }), pool = range(1, n + 1), shown = [];
    for (let i = 0; i < n * 30; i++) shown.push(c.draw(pool, 'NEEDED'));
    for (let b = 0; b < shown.length; b += n) check(new Set(shown.slice(b, b + n)).size === n, `pool of ${n} (seed ${seed}): cycle ${b / n} repeated a game before exhausting the pool: ${shown.slice(b, b + n)}`);
    for (let i = 1; i < shown.length; i++) check(shown[i] !== shown[i - 1], `pool of ${n} (seed ${seed}): same game twice in a row at click ${i}`);
  }
}
{
  const c = R.create({ random: seeded(7) });
  check([1, 2, 3].map(() => c.draw([42], 'NEEDED')).every((id) => id === 42), 'pool of 1 always returns that game');
  check(c.draw([], 'NEEDED') === null, 'empty pool returns null');
}

// 3. Filter changes mid-cycle.
{
  const c = R.create({ random: seeded(3) }), all = range(1, 21), seen = new Set();
  for (let i = 0; i < 8; i++) seen.add(c.draw(all, 'NEEDED'));
  // Narrow (e.g. a price band or search): 10 eligible, some of which were already shown.
  const narrow = range(1, 11), unseenNarrow = narrow.filter((id) => !seen.has(id));
  const afterNarrow = [];
  for (let i = 0; i < unseenNarrow.length; i++) afterNarrow.push(c.draw(narrow, 'NEEDED'));
  check(afterNarrow.every((id) => narrow.includes(id)), 'narrowed filter: only eligible games are drawn');
  check(afterNarrow.every((id) => !seen.has(id)), `narrowed filter: an already-shown game repeated before the pool was exhausted: ${afterNarrow.filter((id) => seen.has(id))}`);
  check(new Set(afterNarrow).size === afterNarrow.length, 'narrowed filter: no repeats while unseen games remain');
  afterNarrow.forEach((id) => seen.add(id));
  // Widen back to the full pool: only games not yet shown this cycle come up until it is exhausted.
  const unseenAll = all.filter((id) => !seen.has(id)), afterWiden = [];
  for (let i = 0; i < unseenAll.length; i++) afterWiden.push(c.draw(all, 'NEEDED'));
  check(afterWiden.every((id) => !seen.has(id)) && new Set(afterWiden).size === unseenAll.length, 'widened filter: every remaining unseen game is shown before any repeat');
  // Exclusion: an identity removed from eligibility (e.g. Josh Set reject) is never drawn.
  const c2 = R.create({ random: seeded(9) }), pool = range(1, 11);
  c2.draw(pool, 'NEEDED');
  const excluded = 5, withoutExcluded = pool.filter((id) => id !== excluded), drawn = [];
  for (let i = 0; i < 40; i++) drawn.push(c2.draw(withoutExcluded, 'NEEDED'));
  check(!drawn.includes(excluded), 'an excluded game is never drawn after it leaves the pool');
}

// 4. NEEDED and OWNED are independent cycles.
{
  const c = R.create({ random: seeded(11) }), needed = range(1, 6), owned = range(100, 106), n = [], o = [];
  for (let i = 0; i < 5; i++) { n.push(c.draw(needed, 'NEEDED')); o.push(c.draw(owned, 'OWNED')); }
  check(new Set(n).size === 5 && new Set(o).size === 5, 'interleaved NEEDED/OWNED clicks each complete a full no-repeat cycle');
}

// 5. Reload: a fresh cycle on the same storage continues instead of reshuffling everything.
{
  const storage = memoryStorage(), pool = range(1, 31), seen = new Set();
  const a = R.create({ storage, random: seeded(5) });
  for (let i = 0; i < 12; i++) seen.add(a.draw(pool, 'NEEDED'));
  const b = R.create({ storage, random: seeded(6) }), after = [];
  for (let i = 0; i < 18; i++) after.push(b.draw(pool, 'NEEDED'));
  check(after.every((id) => !seen.has(id)) && new Set(after).size === 18, 'after a reload the remaining 18 unseen games come up before any repeat');
  const broken = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  const c = R.create({ storage: broken, random: seeded(8) });
  check(new Set([1, 2, 3].map(() => c.draw([1, 2, 3], 'NEEDED'))).size === 3, 'blocked storage falls back to an in-memory cycle');
}

// 6. The app uses this cycle.
{
  const ff = read('fun-features-v103.js'), html = read('index.html');
  check(/SHELFCHECK_RANDOM_CYCLE\.shared\.draw\(/.test(ff), 'fun-features-v103.js draws Random games from SHELFCHECK_RANDOM_CYCLE');
  check(!/randomCycle\s*=/.test(ff), 'fun-features-v103.js no longer keeps its own reset-on-change bag');
  const ci = html.indexOf('random-cycle-v001.js'), fi = html.indexOf('fun-features-v103.js');
  check(ci > 0 && ci < fi, 'index.html loads random-cycle-v001.js before fun-features-v103.js');
}

if (failures) { console.error(`${failures} failure(s)`); process.exit(1); }
console.log('random no-repeat test: all checks passed');
