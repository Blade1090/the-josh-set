import fs from 'node:fs';
import zlib from 'node:zlib';
import vm from 'node:vm';

const norm=s=>String(s??'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’'`]/g,'').replaceAll('&',' and ').match(/[a-z0-9]+/g)?.join(' ')||'';
const b64=['data0.txt','data1.txt','data2.txt','data3a.txt','data3b.txt'].map(x=>fs.readFileSync(x,'utf8')).join('').trim();
const DATA=JSON.parse(zlib.gunzipSync(Buffer.from(b64,'base64')).toString('utf8'));
const titleById=new Map(DATA.i.map(r=>[String(r[0]),r[1]]));

function runFile(path,seed={}){
  const sandbox={window:{...seed},console};
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path,'utf8'),sandbox,{filename:path});
  return sandbox.window;
}

const manifest=runFile('covers-manifest.js');
const manifestCovers=manifest.SHELFCHECK_COVERS||{};
const overrideWindow=runFile('cover-overrides.js',{SHELFCHECK_COVERS:{...manifestCovers},SHELFCHECK_PRODUCT_COVERS:{...(manifest.SHELFCHECK_PRODUCT_COVERS||{})}});
const overrides=overrideWindow.SHELFCHECK_COVER_OVERRIDES||{};
let titleOverrides={};
if(fs.existsSync('cover-title-overrides.js')) titleOverrides=runFile('cover-title-overrides.js').SHELFCHECK_TITLE_COVERS||{};

const physicalDomains=[
  'limitedrungames.com','strictlylimitedgames.com','shop.nippon1.jp','rarewaves.com',
  'bigcommerce.com','videogamesnewyork.com','play-asia.com','iam8bit.com','redartgames.com',
  'pixnlove.com','fangamer.com','signatureeditiongames.com','superraregames.com'
];
const digitalDomains=['image.api.playstation.com'];
const igdbDomains=['images.igdb.com'];

function host(url){try{return new URL(url).hostname.toLowerCase()}catch{return ''}}
function classify(url,layer){
  const h=host(url);
  if(digitalDomains.some(d=>h===d||h.endsWith('.'+d))) return {bucket:'RED_FLAG_DIGITAL',priority:1,reason:'PlayStation Store/digital artwork; must be verified against a physical PS4 front cover.'};
  if(physicalDomains.some(d=>h===d||h.endsWith('.'+d))) return {bucket:'LIKELY_PHYSICAL',priority:4,reason:'Physical publisher/retailer source; retain unless title/region/edition mismatch is found.'};
  if(igdbDomains.some(d=>h===d||h.endsWith('.'+d))) return {bucket:'REVIEW_IGDB',priority:2,reason:'IGDB art is not proof of physical packaging; audit for PS4 banner/region/edition.'};
  if(layer==='title-override') return {bucket:'CURATED_REVIEW',priority:3,reason:'Curated override from an unclassified source; verify once and keep documented.'};
  return {bucket:'REVIEW_OTHER',priority:2,reason:'Unclassified source; verify that it is a physical PS4 front cover.'};
}

const rows=[];
for(const [id,url] of Object.entries(manifestCovers)){
  const finalUrl=overrides[id]||url;
  const layer=overrides[id]?'manual-override':'manifest';
  const c=classify(finalUrl,layer);
  rows.push({id:Number(id),title:titleById.get(String(id))||`ID ${id}`,layer,url:finalUrl,...c});
}
for(const [id,url] of Object.entries(overrides)){
  if(manifestCovers[id]) continue;
  const c=classify(url,'manual-override');
  rows.push({id:Number(id),title:titleById.get(String(id))||`ID ${id}`,layer:'manual-override',url,...c});
}
for(const [title,url] of Object.entries(titleOverrides)){
  const c=classify(url,'title-override');
  rows.push({id:null,title,layer:'title-override',url,...c});
}
rows.sort((a,b)=>a.priority-b.priority||a.title.localeCompare(b.title));

const counts=Object.fromEntries([...new Set(rows.map(r=>r.bucket))].sort().map(k=>[k,rows.filter(r=>r.bucket===k).length]));
const report={generatedAt:new Date().toISOString(),standard:'Actual physical PS4 front cover > correct regional/edition variant > physical compilation/product cover > COVER NEEDED. Digital/key art is never accepted merely because it exists.',counts,total:rows.length,rows};
fs.mkdirSync('audit-out',{recursive:true});
fs.writeFileSync('audit-out/cover-source-triage.json',JSON.stringify(report,null,2));

const sections=[
  ['RED_FLAG_DIGITAL','RED FLAG — digital/PS Store art'],
  ['REVIEW_IGDB','REVIEW — IGDB art'],
  ['REVIEW_OTHER','REVIEW — other/unclassified sources'],
  ['CURATED_REVIEW','CURATED — verify once'],
  ['LIKELY_PHYSICAL','LIKELY PHYSICAL — lower priority']
];
let md='# Shelf Check Art Department — Cover Source Triage\n\n';
md+=`Generated: ${report.generatedAt}\n\n`;
md+='**Standard:** actual physical PS4 front cover > correct regional/edition variant > physical compilation/product cover > **COVER NEEDED**.\n\n';
md+='## Counts\n\n';
for(const [k,v] of Object.entries(counts)) md+=`- ${k}: **${v}**\n`;
md+=`- TOTAL: **${rows.length}**\n\n`;
for(const [bucket,label] of sections){
  const list=rows.filter(r=>r.bucket===bucket);
  md+=`## ${label} (${list.length})\n\n`;
  if(!list.length){md+='None.\n\n';continue}
  for(const r of list) md+=`- ${r.id??'title'} — **${r.title}** — ${r.layer} — ${r.url}\n`;
  md+='\n';
}
fs.writeFileSync('audit-out/cover-source-triage.md',md);
console.log(JSON.stringify({counts,total:rows.length},null,2));
