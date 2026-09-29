// Shared ShelfCheck runtime-census loader for Node audits.
//
// Builds the finalized census exactly the way the page does: every <script> in index.html
// that registers a census mutation (registerCensusMutation) runs in index.html order, then
// the real census-finalize.js applies the queue and its final curator repairs. The mutator
// list is derived from index.html, so a newly wired census script is picked up automatically
// instead of silently drifting out of a hand-maintained list.
//
// Usage:
//   import { loadRuntimeCensus, norm } from './lib/runtime-census.mjs';
//   const census = await loadRuntimeCensus();          // repo root = cwd
//   census.included  -> INCLUDED identities, census.aliasesById, census.byId, census.DATA
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import zlib from 'node:zlib';

export const norm = (s) => String(s ?? '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[’'`]/g, '').replaceAll('&', ' and ').match(/[a-z0-9]+/g)?.join(' ') || '';

export function indexScripts(repo = process.cwd()) {
  const html = fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
  return [...html.matchAll(/<script\s+src="([^"?]+)/g)].map((m) => m[1]);
}

// Scripts before census-finalize.js that register census mutations (app.js only defines it).
export function censusMutators(repo = process.cwd()) {
  const out = [];
  for (const f of indexScripts(repo)) {
    if (f === 'census-finalize.js') return out;
    if (f === 'app.js' || !fs.existsSync(path.join(repo, f))) continue;
    if (/registerCensusMutation\s*\(/.test(fs.readFileSync(path.join(repo, f), 'utf8'))) out.push(f);
  }
  throw new Error('census-finalize.js not found in index.html');
}

export function loadCensusData(repo = process.cwd()) {
  const b64 = ['data0.txt', 'data1.txt', 'data2.txt', 'data3a.txt', 'data3b.txt']
    .map((n) => fs.readFileSync(path.join(repo, n), 'utf8')).join('').trim();
  return JSON.parse(zlib.gunzipSync(Buffer.from(b64, 'base64')).toString('utf8'));
}

export async function loadRuntimeCensus({ repo = process.cwd(), quiet = true } = {}) {
  const DATA = loadCensusData(repo);
  const items = DATA.i.map((r) => ({ id: r[0], title: r[1], set: r[2], baseline: r[3], strong: r[4], target: r[5], max: r[6], search: norm(r[1]) }));
  const byId = new Map(items.map((x) => [x.id, x]));
  const aliasesById = new Map();
  for (const [a, id] of DATA.a || []) { if (!aliasesById.has(id)) aliasesById.set(id, []); aliasesById.get(id).push(a); }
  const fakeEl = { textContent: '', dataset: {}, querySelectorAll: () => [], querySelector: () => null, addEventListener: () => {}, appendChild: () => {}, style: {} };
  const document = { querySelector: () => fakeEl, querySelectorAll: () => [], createElement: () => ({ ...fakeEl }), addEventListener: () => {}, readyState: 'complete', head: { appendChild: () => {} }, body: { appendChild: () => {} } };
  const errors = [];
  const log = quiet ? () => {} : console.log;
  const ctx = {
    DATA, items, byId, norm, aliasesById, productMap: new Map(), reverseProducts: new Map(),
    window: {}, document, console: { log, info: log, warn: log, error: (...a) => errors.push(a.join(' ')) },
    ownedSet: new Set(), productSet: new Set(), stateCache: { owned: [], products: [], prices: [] },
    filter: 'ALL', $: () => fakeEl, progress: () => {}, resetBrowse: () => {},
    saveState: (s) => { ctx.stateCache = s; }, loadState: () => ctx.stateCache,
    setTimeout, clearTimeout, setInterval, clearInterval,
    censusFinalized: false, censusQueue: { add: [], exclude: [] }, dataReady: Promise.resolve(),
  };
  ctx.registerCensusMutation = (phase, fn) => {
    if (ctx.censusFinalized) throw new Error(`late census mutation ${phase}`);
    ctx.censusQueue[phase].push(fn);
  };
  vm.createContext(ctx);
  const mutators = censusMutators(repo);
  for (const f of [...mutators, 'census-finalize.js']) {
    try { vm.runInContext(fs.readFileSync(path.join(repo, f), 'utf8'), ctx, { filename: f }); }
    catch (e) { errors.push(`${f}: ${e.message}`); }
  }
  for (let i = 0; i < 200 && !ctx.censusFinalized; i++) await new Promise((r) => setTimeout(r, 5));
  if (!ctx.censusFinalized) throw new Error('census-finalize.js did not complete');
  if (errors.length) throw new Error(`census script errors: ${errors.slice(0, 3).join(' | ')}`);
  const included = ctx.items.filter((x) => x.set === 'INCLUDED');
  return { DATA, items: ctx.items, byId: ctx.byId, aliasesById, included, mutators, norm, ctx };
}
