// GameEye HLTB bridge, per-title fetch (replaces the broken bulk path in gameye-full-fetch.mjs).
//
// Why: GameEye's /api/deep_search ignores platform filters (returns every platform), and item
// details expose HLTB as hltb:{main_story, main_sides, completionist} in SECONDS -- the old
// fetcher looked for averagePlaytime/h.main and treated values as hours, so it produced an
// empty bridge. This tool searches by title, keeps PlayStation 4 records (platform_id 46,
// verified from known PS4 anchors) whose edition-stripped title exactly matches the identity
// title or a ShelfCheck alias, and reads the HLTB block from each item detail.
//
// Usage: node tools/gameye-hltb-title-fetch.mjs <audit-out/hltb-runtime-qa.json> [out]
// Output (default audit-out/gameye-hltb-candidates.json): per identity, every exact PS4 match
// with its HLTB hours. Resumable: completed identities are skipped on re-run.
import fs from 'node:fs';
import { loadRuntimeCensus, norm } from './lib/runtime-census.mjs';

const BASE = 'https://www.gameye.app/api', PS4 = 46;
const H = { 'user-agent': 'Mozilla/5.0 ShelfCheck HLTB audit', accept: 'application/json' };
const qaPath = process.argv[2] || 'audit-out/hltb-runtime-qa.json';
const outPath = process.argv[3] || 'audit-out/gameye-hltb-candidates.json';
const TARGET = new Set(['NO_VERIFIED_MATCH', 'LIKELY', 'SUSPICIOUS']);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const strip = (s) => String(s ?? '').replace(/\s*\[[^\]]+\]\s*/g, ' ').replace(/\s*\((?:ps4|playstation 4)\)\s*$/i, '').trim();
const hours = (s) => (Number.isFinite(Number(s)) && Number(s) > 0 ? Math.round(Number(s) / 36) / 100 : null);

async function json(url) {
  for (let i = 0; i < 4; i++) {
    const r = await fetch(url, { headers: H });
    if (r.ok) return r.json();
    if (r.status !== 429 && r.status < 500) throw new Error(`${r.status} ${url}`);
    await sleep(2000 * (i + 1));
  }
  throw new Error(`retries exhausted ${url}`);
}

const qa = JSON.parse(fs.readFileSync(qaPath, 'utf8'));
const census = await loadRuntimeCensus();
const out = fs.existsSync(outPath) ? JSON.parse(fs.readFileSync(outPath, 'utf8')) : {};
const targets = qa.rows.filter((r) => TARGET.has(r.class));
let n = 0;
for (const t of targets) {
  if (out[t.id]?.done) continue;
  const names = [t.title, ...(census.aliasesById.get(t.id) || [])];
  const want = new Set(names.map((x) => norm(strip(x))));
  const seen = new Map(); let error = null;
  for (const q of [...new Set([strip(t.title), ...names.slice(1)])].slice(0, 3)) {
    try {
      const j = await json(`${BASE}/deep_search?title=${encodeURIComponent(q)}&limit=40&offset=0`);
      for (const r of j.records || []) if (r.platform_id === PS4 && want.has(norm(strip(r.title)))) seen.set(r.id, r.title);
    } catch (e) { error = String(e).slice(0, 120); }
    await sleep(300);
    if (seen.size) break;
  }
  const matches = [];
  for (const [id, title] of seen) {
    try {
      const d = await json(`${BASE}/items/${id}`); const x = d.item_detail || d.item || d, h = x.hltb || {};
      matches.push({ gameyeId: id, gameyeTitle: title, main: hours(h.main_story), extras: hours(h.main_sides), completionist: hours(h.completionist), allStyles: hours(h.all_styles) });
    } catch (e) { error = String(e).slice(0, 120); }
    await sleep(300);
  }
  out[t.id] = { id: t.id, title: t.title, auditClass: t.class, matches, error, done: !error || matches.length > 0 };
  if (++n % 20 === 0) { fs.writeFileSync(outPath, JSON.stringify(out, null, 1)); console.log(`${n}/${targets.length}`); }
}
fs.writeFileSync(outPath, JSON.stringify(out, null, 1));
const v = Object.values(out);
console.log(JSON.stringify({ targets: targets.length, withExactPs4Match: v.filter((x) => x.matches.length).length, withHltbMain: v.filter((x) => x.matches.some((m) => m.main)).length }, null, 2));
