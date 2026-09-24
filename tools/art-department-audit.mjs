import fs from 'node:fs';
import zlib from 'node:zlib';
import vm from 'node:vm';

const norm=s=>String(s??'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’'`]/g,'').replaceAll('&',' and ').match(/[a-z0-9]+/g)?.join(' ')||'';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

function loadData(){
  const b64=['data0.txt','data1.txt','data2.txt','data3a.txt','data3b.txt'].map(x=>fs.readFileSync(x,'utf8')).join('').trim();
  const DATA=JSON.parse(zlib.gunzipSync(Buffer.from(b64,'base64')).toString('utf8'));
  let items=DATA.i.map(r=>({id:r[0],title:r[1],set:r[2],baseline:r[3],strong:r[4],target:r[5],max:r[6],search:norm(r[1])}));
  let byId=new Map(items.map(x=>[x.id,x]));
  const ctx={DATA,items,byId,norm,window:{},console,setTimeout:(f)=>{f();return 1},clearTimeout:()=>{},setInterval:(f)=>{for(let i=0;i<8;i++)f();return 1},clearInterval:()=>{},progress:()=>{},resetBrowse:()=>{},stateCache:{owned:[],products:[],prices:[]},ownedSet:new Set(),productSet:new Set(),filter:'ALL',aliasesById:new Map(),productMap:new Map(),reverseProducts:new Map()};
  vm.createContext(ctx);
  const censusScripts=['census-cleanup.js','census-v034.js','census-collapse-v035.js','census-v035-final.js','census-v040-pricing-audit.js','census-v052-pricecharting-negative-space.js','census-v053-pricecharting-regional-sweep.js','census-v054-pricecharting-collection-gap.js','census-v055-pricecharting-ab-sweep.js','census-v056-pricecharting-cf-sweep.js','census-v057-pricecharting-gl-sweep.js','census-v058-pricecharting-mr-sweep.js','census-v059-pricecharting-sz-sweep.js','census-v060-integrity-scrub.js'];
  for(const f of censusScripts)if(fs.existsSync(f))vm.runInContext(fs.readFileSync(f,'utf8'),ctx,{filename:f});
  items=ctx.items;byId=ctx.byId;
  return {DATA,items,byId};
}

function parseObject(text,re){
  const m=text.match(re);if(!m)return{};
  try{return JSON.parse(m[1])}catch{return{}}
}

function loadLegacy(){
  const manifest=fs.readFileSync('covers-manifest.js','utf8');
  const covers=parseObject(manifest,/window\.SHELFCHECK_COVERS=(\{.*?\});\n/s);
  const products=parseObject(manifest,/window\.SHELFCHECK_PRODUCT_COVERS=(\{.*?\});\n/s);
  return {covers,products};
}

function loadOverrides(DATA,items,byId){
  const ctx={window:{},DATA,items,byId,norm,console};
  vm.createContext(ctx);
  for(const f of ['cover-overrides.js','cover-title-overrides.js']){
    if(fs.existsSync(f))vm.runInContext(fs.readFileSync(f,'utf8'),ctx,{filename:f});
  }
  return {
    id:ctx.window.SHELFCHECK_COVER_OVERRIDES||{},
    product:ctx.window.SHELFCHECK_PRODUCT_COVER_OVERRIDES||{},
    title:ctx.window.SHELFCHECK_TITLE_COVERS||{}
  };
}

function sourceClass(url,{curated=false,product=false}={}){
  if(!url)return {bucket:'COVER_NEEDED',score:100,reason:'No cover URL'};
  const u=String(url).toLowerCase();
  if(curated)return {bucket:'CURATED_RETAIL',score:0,reason:'Art Department curated override'};
  if(product)return {bucket:'PRODUCT_INHERITANCE',score:10,reason:'Compilation/product-level cover'};
  if(u.includes('image.api.playstation.com'))return {bucket:'PS_STORE_LEGACY',score:90,reason:'PlayStation Store image; audit for physical package front'};
  if(u.includes('images.igdb.com'))return {bucket:'IGDB_LEGACY',score:70,reason:'IGDB cover; may be key art or wrong edition/region'};
  if(/limitedrungames|strictlylimitedgames|rarewaves|bigcommerce|nippon1|play-asia|videogamesnewyork|vgnysoft|bestbuy|gamestop|target|amazon/.test(u))return {bucket:'RETAIL_OR_PUBLISHER',score:20,reason:'Retailer/publisher-style source; visually verify'};
  return {bucket:'UNKNOWN_SOURCE',score:60,reason:'Unclassified source; review'};
}

async function gameyeLookup(title,country=1){
  const qs=new URLSearchParams({offset:'0',limit:'12',title,platforms:'46',country:String(country),order:'0',asc:'1',cat:'0'});
  const url='https://www.gameye.app/api/deep_search?'+qs;
  try{
    const r=await fetch(url,{headers:{'Accept':'application/json','User-Agent':'ShelfCheck-ArtDepartment/1.0'}});
    if(!r.ok)return {ok:false,status:r.status,records:[]};
    const j=await r.json();
    const records=(j.records||[]).map(x=>({
      id:x.id,title:x.title,country_id:x.country_id,platform_id:x.platform_id,release_type:x.release_type,
      image:x.image?{id:x.image.ID,width:x.image.Width,height:x.image.Height,file:x.image.File}:null
    }));
    return {ok:true,status:r.status,records};
  }catch(e){return {ok:false,status:0,error:String(e),records:[]}}
}

function exactish(title,row){
  const a=norm(title),b=norm(row.title);
  if(a===b)return 100;
  const strip=s=>s.replace(/\b(the|a|an|edition|remastered|collection|complete|limited|deluxe|special|day one|launch)\b/g,' ').replace(/\s+/g,' ').trim();
  return strip(a)===strip(b)?90:0;
}

const {DATA,items,byId}=loadData();
const included=items.filter(x=>x.set==='INCLUDED');
const legacy=loadLegacy(),over=loadOverrides(DATA,items,byId);
const rows=[];
for(const x of included){
  const n=norm(x.title);
  const curatedTitle=over.title[n];
  const curatedId=over.id[x.id];
  const url=curatedTitle||curatedId||legacy.covers[x.id]||null;
  const curated=Boolean(curatedTitle||curatedId);
  const cls=sourceClass(url,{curated});
  rows.push({id:x.id,title:x.title,owned:x.baseline==='OWNED',url,curated,...cls});
}

rows.sort((a,b)=>b.score-a.score||Number(b.owned)-Number(a.owned)||a.title.localeCompare(b.title));
const suspect=rows.filter(r=>r.score>=60);
const limit=Number(process.env.ART_AUDIT_LIMIT||250);
const candidates=[];
for(let i=0;i<Math.min(limit,suspect.length);i++){
  const r=suspect[i];
  const lookups=[];
  for(const country of [1,34,3]){
    const res=await gameyeLookup(r.title,country);
    lookups.push({country,...res});
    if(res.ok&&res.records.some(x=>exactish(r.title,x)>=90))break;
    await sleep(120);
  }
  const scored=lookups.flatMap(l=>l.records.map(x=>({...x,queryCountry:l.country,matchScore:exactish(r.title,x)}))).filter(x=>x.matchScore>0).sort((a,b)=>b.matchScore-a.matchScore);
  candidates.push({...r,gameye:scored.slice(0,5),gameyeQueried:lookups.map(l=>({country:l.country,ok:l.ok,status:l.status,count:l.records.length}))});
  if((i+1)%25===0)console.log(`audited ${i+1}/${Math.min(limit,suspect.length)}`);
  await sleep(120);
}

fs.mkdirSync('audit-out',{recursive:true});
const summary={
  generatedAt:new Date().toISOString(),included:included.length,
  curated:rows.filter(r=>r.bucket==='CURATED_RETAIL').length,
  psStoreLegacy:rows.filter(r=>r.bucket==='PS_STORE_LEGACY').length,
  igdbLegacy:rows.filter(r=>r.bucket==='IGDB_LEGACY').length,
  unknown:rows.filter(r=>r.bucket==='UNKNOWN_SOURCE').length,
  missing:rows.filter(r=>r.bucket==='COVER_NEEDED').length,
  suspect:suspect.length,candidateQueries:candidates.length
};
fs.writeFileSync('audit-out/art-department-audit.json',JSON.stringify({summary,rows,candidates},null,2));

const md=[];
md.push('# ShelfCheck Art Department Audit','',`Generated: ${summary.generatedAt}`,'');
md.push('## Summary','',`- Included identities: ${summary.included}`,`- Curated retail overrides: ${summary.curated}`,`- PS Store legacy art: ${summary.psStoreLegacy}`,`- IGDB legacy art: ${summary.igdbLegacy}`,`- Unknown-source art: ${summary.unknown}`,`- Missing art: ${summary.missing}`,`- Suspect/review queue: ${summary.suspect}`,'');
md.push('## High-priority queue','');
for(const r of candidates){
  const g=r.gameye?.[0];
  md.push(`### ${r.title} (#${r.id})`,`- Current bucket: **${r.bucket}**`,`- Current source: ${r.url||'COVER NEEDED'}`,`- Reason: ${r.reason}`);
  if(g){md.push(`- GameEye candidate: **${g.title}** · country ${g.country_id} · ${g.image?`${g.image.width}×${g.image.height} · \`${g.image.file}\``:'no front image'}`)}
  else md.push('- GameEye candidate: none confidently title-matched');
  md.push('');
}
fs.writeFileSync('audit-out/art-department-audit.md',md.join('\n'));
console.log(JSON.stringify(summary,null,2));
