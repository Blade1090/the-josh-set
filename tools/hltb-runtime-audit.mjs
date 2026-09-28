// ShelfCheck HLTB runtime audit.
//
// Resolves every INCLUDED identity of the finalized runtime census through the same
// hltbFor() lookup the app uses (dossiers.js), after every HLTB patch layer wired in
// index.html has been applied in page order. Classifies each identity and writes
// audit-out/hltb-runtime-qa.json.
//
// Classes:
//   VERIFIED            timing present, q in AUTO_OK/WEB_OK/MANUAL_OK (or a curated patch row)
//   VERIFIED_INHERITED  timing present, q=INHERITED_OK (documented same-campaign edition)
//   LIKELY              timing present but q=LIKELY: displayed by the app, not yet verified
//   SUSPICIOUS          timing present but the matched HLTB title looks like a different game
//   EXCEPTION           no timing, documented reason (compilation components, no fixed time, ...)
//   NO_VERIFIED_MATCH   no timing (q=HLTB_NO_VERIFIED_MATCH) or no record at all
//
// Usage: node tools/hltb-runtime-audit.mjs [--out path]
import fs from 'node:fs';
import vm from 'node:vm';
import zlib from 'node:zlib';
import { loadRuntimeCensus, indexScripts, norm } from './lib/runtime-census.mjs';

const OUT = process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1] : 'audit-out/hltb-runtime-qa.json';
const VERIFIED_Q = new Set(['AUTO_OK', 'WEB_OK', 'MANUAL_OK', 'RESEARCH_OK']);
const EXCEPTION_Q = new Set(['COMPILATION_COMPONENT_TIMES', 'NO_FIXED_HLTB_TIME', 'JOSHSET_EXCLUDE_PSVR', 'CONTENT_OR_EDITION_REVIEW', 'NO_HLTB_ENTRY_VERIFIED']);

export function loadHltbRows(file = 'hltb-data.txt') {
  return JSON.parse(zlib.gunzipSync(Buffer.from(fs.readFileSync(file, 'utf8').trim(), 'base64')).toString('utf8'));
}

// Apply every hltb patch layer referenced by index.html, in page order, the way the page does.
export function buildRuntimeHltb() {
  const HLTB = new Map(), layerOf = new Map();
  for (const d of loadHltbRows()) { HLTB.set(norm(d.t), d); layerOf.set(norm(d.t), 'hltb-data.txt'); }
  const layers = indexScripts().filter((f) => /^hltb-.*\.js$/.test(f));
  for (const f of layers) {
    const before = new Map([...HLTB].map(([k, v]) => [k, JSON.stringify(v)]));
    const timers = [];
    const ctx = { HLTB, norm, hltbReady: true, console: { info() {}, log() {}, warn() {} },
      setInterval: (fn) => timers.push(fn), clearInterval() {} };
    vm.createContext(ctx);
    vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: f });
    for (const fn of timers) fn(); // each layer's poll finds HLTB ready on its first tick
    for (const [k, v] of HLTB) if (before.get(k) !== JSON.stringify(v)) layerOf.set(k, f);
  }
  return { HLTB, layerOf, layers };
}

const tokens = (s) => norm(s).split(' ').filter((w) => w.length > 1 && !['the', 'of', 'and', 'a', 'edition', 'remastered', 'hd', 'deluxe', 'complete', 'collection', 'definitive', 'ps4', 'game'].includes(w));
const numbers = (s) => (norm(s).match(/\b(\d+|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii)\b/g) || []).map((n) => ({ ii: '2', iii: '3', iv: '4', v: '5', vi: '6', vii: '7', viii: '8', ix: '9', x: '10', xi: '11', xii: '12' }[n] || n));

export function suspicion(title, matched) {
  if (!matched) return null;
  const a = new Set(tokens(title)), b = new Set(tokens(matched));
  if (!a.size || !b.size) return null;
  const inter = [...a].filter((t) => b.has(t)).length, jac = inter / new Set([...a, ...b]).size;
  const na = numbers(title).sort().join(','), nb = numbers(matched).sort().join(',');
  if (na !== nb && (na || nb)) return `sequel/number mismatch (${na || '-'} vs ${nb || '-'})`;
  if (jac < 0.34) return `low title overlap (${jac.toFixed(2)})`;
  return null;
}

export async function runAudit() {
  const census = await loadRuntimeCensus();
  const { HLTB, layerOf, layers } = buildRuntimeHltb();
  const hltbFor = (x) => {
    let d = HLTB.get(norm(x.title)); if (d) return [d, 'exact_title', norm(x.title)];
    for (const a of census.aliasesById.get(x.id) || []) { d = HLTB.get(a); if (d) return [d, 'shelfcheck_alias', a]; }
    return [null, null, null];
  };
  const rows = [];
  for (const x of [...census.included].sort((p, q) => p.title.localeCompare(q.title))) {
    const [d, rule, key] = hltbFor(x);
    const has = d && [d.a, d.e, d.c].some((v) => v != null && Number.isFinite(Number(v)));
    const q = d?.q || null, layer = key ? layerOf.get(key) : null;
    let cls, note = null;
    if (!d) { cls = 'NO_VERIFIED_MATCH'; note = 'no HLTB record resolves for title or aliases'; }
    else if (!has) { cls = EXCEPTION_Q.has(q) ? 'EXCEPTION' : 'NO_VERIFIED_MATCH'; note = q; }
    else {
      const sus = suspicion(x.title, d.m);
      if (q === 'INHERITED_OK') cls = 'VERIFIED_INHERITED';
      else if (q === 'LIKELY') cls = 'LIKELY';
      else if (VERIFIED_Q.has(q) || (layer && layer !== 'hltb-data.txt')) cls = 'VERIFIED';
      else cls = 'LIKELY';
      if (sus && cls !== 'VERIFIED_INHERITED' && !d.verifiedNote) { note = sus; if (cls === 'VERIFIED' && q === 'AUTO_OK') cls = 'SUSPICIOUS'; }
    }
    rows.push({ id: x.id, title: x.title, class: cls, matchedTitle: d?.m ?? null, hltbId: d?.i ?? null,
      main: d?.a ?? null, extras: d?.e ?? null, completionist: d?.c ?? null, q, source: layer, rule, confidence:
      cls === 'VERIFIED' || cls === 'VERIFIED_INHERITED' ? 'high' : cls === 'LIKELY' ? 'medium' : cls === 'SUSPICIOUS' ? 'low' : null, note });
  }
  const summary = { included: rows.length, byClass: {}, layers };
  for (const r of rows) summary.byClass[r.class] = (summary.byClass[r.class] || 0) + 1;
  summary.withTiming = rows.filter((r) => ['VERIFIED', 'VERIFIED_INHERITED', 'LIKELY', 'SUSPICIOUS'].includes(r.class)).length;
  return { generatedAt: new Date().toISOString(), summary, rows };
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/').replace(/^([A-Za-z]):/, '/$1:')}` || process.argv[1]?.endsWith('hltb-runtime-audit.mjs')) {
  const out = await runAudit();
  fs.mkdirSync('audit-out', { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out.summary, null, 2));
}
