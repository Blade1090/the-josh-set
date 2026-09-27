// ShelfCheck GameEye ownership-import regression test.
//
// Runs the REAL app.js + current census-mutating scripts + census-finalize.js + model-fix.js +
// ownership-audit-v068.js (the actual importCSV) in a Node vm, then feeds a synthetic GameEye
// CSV through the real importer. This breaks if runtime reconciliation regresses rather than
// merely testing a duplicate implementation of the matcher.
//
// Usage: node tools/gameeye-import-test.mjs (exits 1 on failure)
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import zlib from 'node:zlib';
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
  'census-physical-omission-pass-v003.js', 'census-physical-omission-pass-v004.js',
  'census-v060-integrity-scrub.js', 'census-integrity-pass-v001.js', 'census-integrity-pass-v002.js',
  'ownership-reconcile-v071.js', 'ownership-reconcile-v072.js', 'ownership-reconcile-v073.js',
  'curation-josh-set-pass-v001.js', 'curation-josh-set-pass-v002.js', 'curation-josh-set-pass-v003.js',
  'curation-josh-set-pass-v004.js', 'curation-josh-set-pass-v005.js', 'curation-josh-set-pass-v006.js',
];

function readFile(name) { return fs.readFileSync(path.join(REPO, name), 'utf8'); }

async function buildContext() {
  const fakeEl = { textContent: '', dataset: {}, querySelectorAll: () => [], querySelector: () => null, addEventListener: () => {}, appendChild: () => {}, style: {}, value: '' };
  const fakeDocument = {
    querySelector: () => fakeEl, querySelectorAll: () => [], createElement: () => ({ ...fakeEl }),
    addEventListener: () => {}, readyState: 'complete', head: { appendChild: () => {} }, body: { appendChild: () => {} },
  };
  const ctx = {
    window: { addEventListener: () => {} }, console,
    document: fakeDocument,
    navigator: {},
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    atob: (s) => Buffer.from(s, 'base64').toString('binary'),
    btoa: (s) => Buffer.from(s, 'binary').toString('base64'),
    DecompressionStream, Response, Blob, Uint8Array,
    fetch: (name) => {
      const p = path.join(REPO, name);
      return Promise.resolve({ ok: fs.existsSync(p), text: () => Promise.resolve(fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '') });
    },
    setTimeout, clearTimeout, setInterval, clearInterval,
    dlg: { close() {} },
  };
  vm.createContext(ctx);
  const run = (code, filename) => vm.runInContext(code, ctx, { filename: filename || '<eval>', displayErrors: true });

  run(readFile('app.js'), 'app.js');
  await run('dataReady');
  await new Promise((r) => setTimeout(r, 20));

  for (const f of CENSUS_MUTATORS) run(readFile(f), f);
  run(readFile('census-finalize.js'), 'census-finalize.js');
  await new Promise((r) => setTimeout(r, 20));

  run(readFile('model-fix.js'), 'model-fix.js');
  run(readFile('ownership-audit-v068.js'), 'ownership-audit-v068.js');

  return { ctx, run };
}

function csvOf(entries) {
  const quote=(v)=>`"${String(v??'').replace(/"/g, '""')}"`;
  const rows=entries.map((entry)=>{
    const x=typeof entry==='string'?{title:entry}:entry;
    return [x.title,'PlayStation 4','Games','Owned',x.publisher||'',x.developer||'',x.createdAt||''].map(quote).join(',');
  }).join('\n');
  return `Title,Platform,Category,UserRecordType,Publisher,Developer,CreatedAt\n${rows}\n`;
}

async function main() {
  const { ctx, run } = await buildContext();

  const included = run('items.filter(x=>x.set==="INCLUDED").length');
  console.log(`INCLUDED: ${included}`);

  const guardiansSource="Marvel's Guardians of the Galaxy";
  const entries = [
    'G.I. Joe: Operation Blackout',
    "Dragon Quest Heroes: The World Tree's Woe and the Blight Below (Day One Edition)",
    "Dragon Quest Heroes II [Explorer's Edition]",
    'Shenmue I & II',
    'Yakuza Remastered Collection',
    "Made in Abyss: Binary Star Falling into Darkness (Collector's Edition)",
    'Double Dragon Gaiden: Rise of the Dragons',
    {title:guardiansSource,publisher:'Square Enix',developer:'Eidos Montreal',createdAt:'Sep 19, 2026'},
    'Streets of Rage 4: Anniversary Edition',
    "Streets of Red: Devil's Dare Deluxe",
    'Tearaway Unfolded: Crafted Edition',
  ];
  ctx.__testFile = { name: 'gameeye-import-test.csv', text: () => Promise.resolve(csvOf(entries)) };
  run('stateCache={version:11,owned:[],products:[],prices:[]};ownedSet=new Set();productSet=new Set();');
  await run('importCSV(__testFile)');
  const audit = run('window.SHELFCHECK_OWNERSHIP_AUDIT');

  const byTitle = (t) => audit.ledger.find((r) => r.gameEye === t);
  const giJoe = byTitle('G.I. Joe: Operation Blackout');
  const dqh1 = byTitle("Dragon Quest Heroes: The World Tree's Woe and the Blight Below (Day One Edition)");
  const dqh2 = byTitle("Dragon Quest Heroes II [Explorer's Edition]");
  const shenmue = byTitle('Shenmue I & II');
  const yakuza = byTitle('Yakuza Remastered Collection');
  const madeInAbyss = byTitle("Made in Abyss: Binary Star Falling into Darkness (Collector's Edition)");
  const doubleDragon = byTitle('Double Dragon Gaiden: Rise of the Dragons');
  const guardians = byTitle(guardiansSource);
  const rage4 = byTitle('Streets of Rage 4: Anniversary Edition');
  const streetsRed = byTitle("Streets of Red: Devil's Dare Deluxe");
  const tearaway = byTitle('Tearaway Unfolded: Crafted Edition');

  let failed = false;
  const fail = (msg) => { console.error(`FAIL: ${msg}`); failed = true; };
  const requireIdentity=(row,source,target)=>{
    if(!row||row.matchType==='UNRESOLVED')fail(`${source} did not match (got ${JSON.stringify(row)})`);
    else if(!row.identities.includes(target))fail(`${source} matched the wrong identity: ${JSON.stringify(row)}`);
  };

  requireIdentity(giJoe,'G.I. Joe: Operation Blackout','G.I. Joe: Operation Blackout');
  requireIdentity(dqh1,'Dragon Quest Heroes (Day One Edition)',"Dragon Quest Heroes: The World Tree's Woe and the Blight Below");
  requireIdentity(dqh2,'Dragon Quest Heroes II [Explorer\'s Edition]','Dragon Quest Heroes II');

  if (dqh1 && dqh2 && dqh1.ids.some((id) => dqh2.ids.includes(id))) {
    fail(`Dragon Quest Heroes rows share an identity id -- cross-contamination between id 405/406: dqh1.ids=${JSON.stringify(dqh1.ids)} dqh2.ids=${JSON.stringify(dqh2.ids)}`);
  }

  if (!shenmue || shenmue.matchType !== 'MULTI_IDENTITY_PRODUCT') fail(`Shenmue I & II did not resolve as a multi-identity product (got ${JSON.stringify(shenmue)})`);
  else if (shenmue.identities.length !== 2 || !shenmue.identities.includes('Shenmue I') || !shenmue.identities.includes('Shenmue II')) fail(`Shenmue I & II did not cover exactly Shenmue I + Shenmue II: ${JSON.stringify(shenmue)}`);

  if (!yakuza || yakuza.matchType !== 'MULTI_IDENTITY_PRODUCT') fail(`Yakuza Remastered Collection did not resolve as a multi-identity product (got ${JSON.stringify(yakuza)})`);
  else if (yakuza.identities.length !== 3) fail(`Yakuza Remastered Collection did not cover all 3 identities: ${JSON.stringify(yakuza)}`);

  requireIdentity(madeInAbyss,"Made in Abyss (Collector's Edition)",'Made in Abyss: Binary Star Falling into Darkness');
  requireIdentity(doubleDragon,'Double Dragon Gaiden: Rise of the Dragons','Double Dragon Gaiden: Rise of the Dragons');
  requireIdentity(rage4,'Streets of Rage 4: Anniversary Edition','Streets of Rage 4');
  requireIdentity(streetsRed,"Streets of Red: Devil's Dare Deluxe",'Streets of Red');
  requireIdentity(tearaway,'Tearaway Unfolded: Crafted Edition','Tearaway Unfolded');

  // Josh's Sep 19 GameEye row selected the 2021 Eidos game even though the physical pickup was
  // the 2017 Telltale disc. The metadata-qualified correction must fix this one row while the
  // newly-added 2021 game remains a separate INCLUDED identity and does not receive ownership.
  requireIdentity(guardians,guardiansSource,"Marvel's Guardians of the Galaxy: The Telltale Series");
  if (!guardians?.correction) fail(`Known Sep 19 Guardians row was not recorded as a correction: ${JSON.stringify(guardians)}`);
  const actionGuardiansId=run(`items.find(x=>norm(x.title)===norm(${JSON.stringify(guardiansSource)}))?.id`);
  if (!actionGuardiansId) fail('2021 Marvel\'s Guardians of the Galaxy identity is missing from the census');
  else if (run(`ownedSet.has(${actionGuardiansId})`)) fail('Known Sep 19 Telltale pickup incorrectly granted ownership to the separate 2021 Guardians game');

  if (audit.unresolvedRows !== 0) fail(`Expected 0 unresolved rows, got ${audit.unresolvedRows}: ${JSON.stringify(audit.unresolved)}`);
  if (!audit.rowAccountingOK || !audit.identityAccountingOK || !audit.bonusAccountingOK) {
    fail(`Ownership audit accounting failed: rowAccountingOK=${audit.rowAccountingOK} identityAccountingOK=${audit.identityAccountingOK} bonusAccountingOK=${audit.bonusAccountingOK}`);
  }

  if (!failed) {
    console.log('PASS: current GameEye reconciliation cases resolve correctly; compilation accounting remains valid; Sep 19 Guardians correction maps only to Telltale; 0 unresolved; accounting verified.');
  }
  process.exit(failed ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
