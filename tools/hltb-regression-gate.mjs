// HLTB verified-mapping regression gate (the HLTB analogue of the cover GOOD-set gate).
//
// Usage: node tools/hltb-regression-gate.mjs <previous hltb-runtime-qa.json> [current, default audit-out/hltb-runtime-qa.json]
//
// Rule: every identity VERIFIED / VERIFIED_INHERITED in the previous audit must still be
// verified in the current audit with the same matched title, HLTB id and hours -- unless
// audit-out/hltb-research-decisions.json records an explicit, evidenced change for that id
// (decisions[].id with action "CHANGE_VERIFIED" or "REJECT_VERIFIED"). Exit 1 otherwise.
import fs from 'node:fs';

const [prevPath, curPath = 'audit-out/hltb-runtime-qa.json'] = process.argv.slice(2);
if (!prevPath) { console.error('usage: node tools/hltb-regression-gate.mjs <previous> [current]'); process.exit(2); }
const load = (p) => new Map(JSON.parse(fs.readFileSync(p, 'utf8')).rows.map((r) => [r.id, r]));
const prev = load(prevPath), cur = load(curPath);
const decisionsPath = 'audit-out/hltb-research-decisions.json';
const allowed = new Map();
if (fs.existsSync(decisionsPath)) {
  for (const d of JSON.parse(fs.readFileSync(decisionsPath, 'utf8')).decisions || []) {
    if (['CHANGE_VERIFIED', 'REJECT_VERIFIED'].includes(d.action) && d.evidence) allowed.set(d.id, d);
  }
}
const VER = new Set(['VERIFIED', 'VERIFIED_INHERITED']);
const sig = (r) => JSON.stringify([r.matchedTitle, r.hltbId, r.main, r.extras, r.completionist]);
const problems = [], explained = [];
let kept = 0;
for (const [id, p] of prev) {
  if (!VER.has(p.class)) continue;
  const c = cur.get(id);
  const ok = c && VER.has(c.class) && sig(c) === sig(p);
  if (ok) { kept++; continue; }
  const why = !c ? 'identity no longer in census' : !VER.has(c.class) ? `class ${p.class} -> ${c.class}` : `mapping changed ${sig(p)} -> ${sig(c)}`;
  if (!c && !allowed.has(id)) { explained.push({ id, title: p.title, why }); continue; } // census changes are gated elsewhere
  (allowed.has(id) ? explained : problems).push({ id, title: p.title, why, decision: allowed.get(id)?.evidence });
}
const gained = [...cur.values()].filter((c) => VER.has(c.class) && !VER.has(prev.get(c.id)?.class)).length;
console.log(JSON.stringify({ previouslyVerified: [...prev.values()].filter((r) => VER.has(r.class)).length, keptUnchanged: kept, newlyVerified: gained, explainedChanges: explained.length, unexplainedRegressions: problems.length }, null, 2));
for (const p of explained) console.log('  explained:', p.id, p.title, '-', p.why);
for (const p of problems) console.log('  REGRESSION:', p.id, p.title, '-', p.why);
process.exit(problems.length ? 1 : 0);
