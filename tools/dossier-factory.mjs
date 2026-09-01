import fs from 'node:fs';
import zlib from 'node:zlib';

const passes=Math.max(1,Number(process.env.PASSES||10));
const batchSize=Math.max(1,Number(process.env.BATCH_SIZE||100));

const dossierText=fs.readFileSync('shelfcheck-dossiers.txt','utf8').trim();
const dossiers=JSON.parse(zlib.gunzipSync(Buffer.from(dossierText,'base64')).toString('utf8'));
const existing=new Set(dossiers.map(d=>norm(d.t)));

// ShelfCheck's live census is split across five base64 chunks, then gzip-compressed.
// Mirror app.js loadData() exactly instead of trying to scrape a DATA literal from app.js.
const dataFiles=['data0.txt','data1.txt','data2.txt','data3a.txt','data3b.txt'];
const censusB64=dataFiles.map(f=>fs.readFileSync(f,'utf8').trim()).join('');
const DATA=JSON.parse(zlib.gunzipSync(Buffer.from(censusB64,'base64')).toString('utf8'));

// The live app also layers researched override batches over shelfcheck-dossiers.txt.
// Treat every title already present in those batches as covered so the factory does not regenerate them.
for(const file of fs.readdirSync('.').filter(f=>/^dossier-overrides(?:-\d+)?\.js$/.test(f))){
  const src=fs.readFileSync(file,'utf8');
  for(const match of src.matchAll(/^\s*\[\s*(["'])(.*?)\1\s*,/gm)) existing.add(norm(unescapeJsString(match[2])));
}

const included=(DATA.i||[])
  .filter(x=>x && x[2]==='INCLUDED')
  .map(x=>({id:x[0],title:x[1]}));

const missing=included.filter(x=>!existing.has(norm(x.title)));
const limit=Math.min(missing.length,passes*batchSize);
const selected=missing.slice(0,limit);
const batches=[];
for(let i=0;i<selected.length;i+=batchSize){
  const games=selected.slice(i,i+batchSize);
  batches.push({batch:Math.floor(i/batchSize)+1,count:games.length,games});
}

fs.mkdirSync('audit-out',{recursive:true});
fs.writeFileSync('audit-out/dossier-factory-queue.json',JSON.stringify({
  generatedAt:new Date().toISOString(),
  existingDossiers:dossiers.length,
  includedIdentities:included.length,
  coveredAfterOverrides:included.length-missing.length,
  missing:missing.length,
  requestedPasses:passes,
  batchSize,
  queued:selected.length,
  batches
},null,2));
console.log(`Dossier factory: ${included.length} included identities; ${missing.length} missing after overrides; queued ${selected.length} across ${batches.length} passes.`);

function norm(s){
  return String(s||'')
    .normalize('NFKD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase().replace(/[’'`]/g,'').replaceAll('&',' and ')
    .match(/[a-z0-9]+/g)?.join(' ')||'';
}
function unescapeJsString(s){
  return s.replace(/\\([\\"'])/g,'$1');
}
