// ShelfCheck My Shelf -- Collection Superlatives rotating-discovery regression test.
//
// Runs the REAL app.js + model-fix.js + dossiers.js + every census-mutating script + census-
// finalize.js + price-fix.js + my-shelf-v001.js in a Node vm -- so this breaks if the real
// timeCategories()/pickSuperlatives()/buildStats() logic regresses, never a reimplemented copy.
//
// Regresses the specific bug reported live: two permanent collection records (a fixed longest-
// known-time game and a fixed shortest-known-time game) getting shown by RESHUFFLE forever. That
// requires a real pool of multiple short and multiple long owned games -- picking exactly one
// real short-HLTB identity would just reproduce the same bug in the test itself.
//
// Usage: node tools/my-shelf-superlatives-test.mjs (exits 1 on failure)
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
  run(readFile('my-shelf-v001.js'), 'my-shelf-v001.js');

  let waited = 0;
  while (!run('dossiersReady && hltbReady') && waited < 5000) { await new Promise((r) => setTimeout(r, 100)); waited += 100; }
  if (!run('dossiersReady && hltbReady')) throw new Error('Test setup error: dossiersReady/hltbReady never became true');

  return { run };
}

function csvOf(titles) {
  const rows = titles.map((t) => `"${t.replace(/"/g, '""')}",PlayStation 4,Games,Owned`).join('\n');
  return `Title,Platform,Category,UserRecordType\n${rows}\n`;
}

const ALLOWED_LABELS = new Set(['QUICK HIT', 'DEEP DIVE', 'UNPLAYED QUICK HIT', 'UNPLAYED DEEP DIVE', 'BEATEN QUICK WIN', "TONIGHT'S WILDCARD"]);
const FORBIDDEN_LABELS = [/shortest/i, /longest/i, /\bbest\b/i, /hidden gem/i, /\bmonster\b/i];

async function main() {
  let failed = false;
  const fail = (msg) => { console.error(`FAIL: ${msg}`); failed = true; };
  const ok = (msg) => console.log(`OK  ${msg}`);

  const { run } = await buildContext();
  const includedBefore = run('items.filter(x=>x.set==="INCLUDED").length');

  // 6 real short-HLTB (<=8h) identities and 6 real long-HLTB (>15h) identities -- exactly the
  // shape of the reported bug (a whole collection with only one true global min and one true
  // global max, but MANY games that qualify as "short" or "long" more broadly).
  const withTimes = run(`items.filter(x=>x.set==='INCLUDED').map(x=>{
    const h = typeof hltbFor==='function'?hltbFor(x):null;
    return { id:x.id, title:x.title, main: h?Number(h.a):null };
  })`);
  const shorts = withTimes.filter((x) => Number.isFinite(x.main) && x.main > 0 && x.main <= 8).slice(0, 6);
  const deeps = withTimes.filter((x) => Number.isFinite(x.main) && x.main > 15).slice(0, 6);
  if (shorts.length < 6 || deeps.length < 6) throw new Error(`Test setup error: need 6+6 real short/deep HLTB identities, got ${shorts.length}/${deeps.length}`);

  const allTitles = [...shorts, ...deeps].map((x) => x.title);
  run(`window.__ownFile = { name: 'my-shelf-test.csv', text: () => Promise.resolve(${JSON.stringify(csvOf(allTitles))}) }`);
  await run('importCSV(window.__ownFile)');

  // Mark 2 of the shorts BEATEN (populates BEATEN QUICK WIN) -- the rest of both groups stay
  // UNPLAYED (the real default for a freshly-imported game), populating UNPLAYED QUICK HIT /
  // UNPLAYED DEEP DIVE too.
  const beatenShortIds = shorts.slice(0, 2).map((x) => x.id);
  for (const id of beatenShortIds) run(`window.SHELFCHECK_MY_SHELF.setStatus(${id}, 'BEATEN')`);

  console.log('--- categories are derived correctly from real OWNED + HLTB + played/beaten data ---');
  {
    const poolSizes = run(`(() => {
      const owned = window.SHELFCHECK_MY_SHELF.buildStats().owned;
      const cats = window.SHELFCHECK_MY_SHELF.timeCategories(owned);
      return Object.fromEntries(cats.map(c => [c.key, c.pool.length]));
    })()`);
    if (poolSizes.quick !== 6) fail(`QUICK HIT pool should be all 6 short games regardless of play state, got ${poolSizes.quick}`);
    else ok('QUICK HIT pool includes all 6 short-HLTB owned games regardless of play state');
    if (poolSizes.deep !== 6) fail(`DEEP DIVE pool should be all 6 long games, got ${poolSizes.deep}`);
    else ok('DEEP DIVE pool includes all 6 long-HLTB owned games');
    if (poolSizes.unplayedQuick !== 4) fail(`UNPLAYED QUICK HIT should exclude the 2 marked beaten (4 left), got ${poolSizes.unplayedQuick}`);
    else ok('UNPLAYED QUICK HIT correctly excludes the 2 short games marked BEATEN (4 remain)');
    if (poolSizes.unplayedDeep !== 6) fail(`UNPLAYED DEEP DIVE should still be all 6 (none marked beaten), got ${poolSizes.unplayedDeep}`);
    else ok('UNPLAYED DEEP DIVE includes all 6 long games (none marked beaten)');
    if (poolSizes.beatenQuick !== 2) fail(`BEATEN QUICK WIN should be exactly the 2 marked beaten, got ${poolSizes.beatenQuick}`);
    else ok('BEATEN QUICK WIN correctly contains exactly the 2 short games marked BEATEN');
    if (poolSizes.wildcard !== 10) fail(`WILDCARD (unfinished) should be 10 (12 owned minus 2 beaten), got ${poolSizes.wildcard}`);
    else ok('WILDCARD (not marked beaten) correctly excludes the 2 beaten games (10 remain)');
  }

  console.log('--- a category with zero eligible games is omitted entirely ---');
  {
    // A fresh context with only long games owned -- no short games exist at all, so QUICK HIT/
    // UNPLAYED QUICK HIT/BEATEN QUICK WIN must not appear.
    const { run: run2 } = await buildContext();
    run2(`window.__deepOnlyFile = { name: 'deep-only.csv', text: () => Promise.resolve(${JSON.stringify(csvOf(deeps.map((x) => x.title)))}) }`);
    await run2('importCSV(window.__deepOnlyFile)');
    const keys = run2(`window.SHELFCHECK_MY_SHELF.timeCategories(window.SHELFCHECK_MY_SHELF.buildStats().owned).map(c=>c.key)`);
    if (keys.includes('quick') || keys.includes('unplayedQuick') || keys.includes('beatenQuick')) fail(`Short-game categories should be omitted with zero short games owned, got categories: ${JSON.stringify(keys)}`);
    else ok(`With no short games owned, QUICK HIT/UNPLAYED QUICK HIT/BEATEN QUICK WIN are correctly omitted: ${JSON.stringify(keys)}`);
  }

  console.log('--- only approved, factually-honest category labels are ever used ---');
  {
    const seenLabels = new Set();
    for (let i = 0; i < 15; i++) {
      const sup = run('window.SHELFCHECK_MY_SHELF.buildStats().superlatives');
      for (const s of sup) seenLabels.add(s.label);
    }
    for (const label of seenLabels) {
      if (!ALLOWED_LABELS.has(label)) fail(`Unapproved superlative label appeared: "${label}"`);
      if (FORBIDDEN_LABELS.some((re) => re.test(label))) fail(`A forbidden fabricated/absolute label appeared: "${label}"`);
    }
    if (!failed) ok(`Only approved, honest category labels appeared across 15 reshuffles: ${JSON.stringify([...seenLabels])}`);
  }

  console.log('--- THE reported bug: repeated RESHUFFLE must not show the same 2 permanent records forever ---');
  {
    const quickIdsSeen = new Set();
    const deepIdsSeen = new Set();
    for (let i = 0; i < 25; i++) {
      const sup = run('window.SHELFCHECK_MY_SHELF.buildStats().superlatives');
      const quickCard = sup.find((s) => s.key === 'quick');
      const deepCard = sup.find((s) => s.key === 'deep');
      if (quickCard) quickIdsSeen.add(quickCard.x.id);
      if (deepCard) deepIdsSeen.add(deepCard.x.id);
    }
    if (quickIdsSeen.size <= 1) fail(`QUICK HIT showed only ${quickIdsSeen.size} distinct game(s) across 25 reshuffles -- still pinned like the reported bug (ids: ${JSON.stringify([...quickIdsSeen])})`);
    else ok(`QUICK HIT showed ${quickIdsSeen.size} distinct games across 25 reshuffles, not pinned to one permanent record`);
    if (deepIdsSeen.size <= 1) fail(`DEEP DIVE showed only ${deepIdsSeen.size} distinct game(s) across 25 reshuffles -- still pinned like the reported bug (ids: ${JSON.stringify([...deepIdsSeen])})`);
    else ok(`DEEP DIVE showed ${deepIdsSeen.size} distinct games across 25 reshuffles, not pinned to one permanent record`);
  }

  console.log('--- consecutive reshuffles never immediately repeat the same game within the same category ---');
  {
    let prev = null;
    let violation = null;
    for (let i = 0; i < 20 && !violation; i++) {
      const sup = run('window.SHELFCHECK_MY_SHELF.buildStats().superlatives');
      if (prev) {
        for (const cur of sup) {
          const prior = prev.find((p) => p.key === cur.key);
          if (prior && prior.x.id === cur.x.id) {
            const poolLen = run(`window.SHELFCHECK_MY_SHELF.timeCategories(window.SHELFCHECK_MY_SHELF.buildStats().owned).find(c=>c.key===${JSON.stringify(cur.key)})?.pool.length`);
            if (poolLen > 1) { violation = { key: cur.key, id: cur.x.id, poolLen }; break; }
          }
        }
      }
      prev = sup;
    }
    if (violation) fail(`Category "${violation.key}" repeated the same game (id ${violation.id}) on back-to-back reshuffles despite ${violation.poolLen} eligible alternatives`);
    else ok('20 consecutive reshuffles never repeat the same game within the same category when an alternative exists');
  }

  console.log('--- reshuffling never changes OWNED/PLAYED/BEATEN state or census ---');
  {
    const before = run('JSON.stringify({owned:[...stateCache.owned].sort((a,b)=>a-b), played:stateCache.played, beaten:[...stateCache.beaten].sort((a,b)=>a-b)})');
    for (let i = 0; i < 5; i++) run('window.SHELFCHECK_MY_SHELF.buildStats()');
    const after = run('JSON.stringify({owned:[...stateCache.owned].sort((a,b)=>a-b), played:stateCache.played, beaten:[...stateCache.beaten].sort((a,b)=>a-b)})');
    if (before !== after) fail(`Reshuffling changed persistent OWNED/PLAYED/BEATEN state.\n  before: ${before}\n  after:  ${after}`);
    else ok('Owned/played/beaten state is byte-identical before and after 5 reshuffles');
    const includedAfter = run('items.filter(x=>x.set==="INCLUDED").length');
    if (includedAfter !== includedBefore) fail(`Census INCLUDED changed by reshuffling: ${includedBefore} -> ${includedAfter}`);
    else ok(`Census INCLUDED unchanged by reshuffling: ${includedAfter}`);
  }

  console.log('--- the deterministic YOUR SHELF record stats (quick/monster) remain factually correct and untouched ---');
  {
    const globalShortest = [...shorts, ...deeps].reduce((min, x) => (x.main < min.main ? x : min));
    const globalLongest = [...shorts, ...deeps].reduce((max, x) => (x.main > max.main ? x : max));
    const stats = run('window.SHELFCHECK_MY_SHELF.buildStats()');
    if (stats.quick.x.id !== globalShortest.id) fail(`buildStats().quick (the YOUR SHELF record stat) should be the true global shortest (${globalShortest.title}), got id ${stats.quick.x.id}`);
    else ok(`buildStats().quick still correctly identifies the true single shortest-known-time owned game (${globalShortest.title}) for the YOUR SHELF stat tile`);
    if (stats.monster.x.id !== globalLongest.id) fail(`buildStats().monster (the YOUR SHELF record stat) should be the true global longest (${globalLongest.title}), got id ${stats.monster.x.id}`);
    else ok(`buildStats().monster still correctly identifies the true single longest-known-time owned game (${globalLongest.title}) for the YOUR SHELF stat tile`);
  }

  if (!failed) {
    console.log('\nPASS: Collection Superlatives categories are derived correctly from real OWNED/HLTB/played/beaten data, empty categories are omitted, only approved honest labels are used, repeated RESHUFFLE genuinely rotates through multiple games per category (the exact reported bug is fixed), consecutive reshuffles never immediately repeat a game when an alternative exists, no persistent state or census is touched by reshuffling, and the separate YOUR SHELF single-record stats remain factually correct and untouched.');
  }
  process.exit(failed ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
