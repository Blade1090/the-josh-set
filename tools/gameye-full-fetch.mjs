import fs from 'node:fs';
const BASE='https://www.gameye.app/api';
const H={'user-agent':'Mozilla/5.0','accept':'application/json,text/plain,*/*'};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function fetchRetry(u,tries=7){for(let i=0;i<tries;i++){const r=await fetch(u,{headers:H});if(r.ok)return r;if(r.status!==429&&r.status<500)throw new Error(`${r.status} ${u}`);const s=Number(r.headers.get('retry-after'));await sleep(Number.isFinite(s)&&s>0?s*1000:Math.min(60000,1000*2**i));}throw new Error(`retries exhausted ${u}`)}
const json=async u=>(await fetchRetry(u)).json();
const norm=s=>String(s??'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’'`]/g,'').replace(/&/g,' and ').match(/[a-z0-9]+/g)?.join(' ')||'';
const stripEdition=s=>String(s??'').replace(/\s*\[[^\]]+\]\s*$/,'').replace(/\s*\((?:ps4|playstation 4)\)\s*$/i,'').trim();
const known=[164308,123537,183474,163491,147995,163378,178468];

// Build the canonical target set BEFORE making expensive item-detail requests.
const canonicalPath=process.argv[2]||'audit-out/canonical-live.json';
if(!fs.existsSync(canonicalPath)) throw new Error(`Missing canonical snapshot: ${canonicalPath}`);
const canonical=JSON.parse(fs.readFileSync(canonicalPath,'utf8')).filter(x=>x.set==='INCLUDED');
const canonicalNorms=new Set(canonical.map(x=>norm(x.title)).filter(Boolean));
console.log('Canonical INCLUDED targets:',canonicalNorms.size);

// GAMEYE frontend source proves the real API contracts are:
//   GET /deep_search with axios config {params:{title,limit,offset,...}}
//   GET /items/:id for detail data.
const details=[];
for(const id of known){const x=await json(`${BASE}/items/${id}`);const d=x.item_detail||x.item||x;details.push({id,d});await sleep(150)}
const platformIds=[...new Set(details.map(x=>Number(x.d.platform_id)).filter(Number.isFinite))];
if(platformIds.length!==1) throw new Error(`Known PS4 anchors disagree on platform_id: ${platformIds.join(',')}`);
const PS4=platformIds[0];
console.log('Verified PS4 platform_id from known anchors:',PS4);

const candidates=['platform_id','platform','platforms']; let filterParam=null, first=null;
for(const p of candidates){const u=new URL(`${BASE}/deep_search`);u.searchParams.set(p,String(PS4));u.searchParams.set('limit','100');u.searchParams.set('offset','0');const j=await json(u);const rec=j.records||[];const ok=rec.length>=10&&rec.every(r=>Number(r.platform_id)===PS4)&&Number(j.full_count)>1000&&Number(j.full_count)<20000;if(ok){filterParam=p;first=j;break}console.log('Rejected filter param',p,'full_count=',j.full_count,'rows=',rec.length,'platforms=',[...new Set(rec.map(r=>r.platform_id))].slice(0,8));await sleep(200)}
if(!filterParam) throw new Error('GAMEYE deep_search PS4 filter syntax not yet verified; refusing to overwrite bridge');
console.log('Verified deep_search filter:',filterParam,'PS4=',PS4,'count=',first.full_count);

const total=Number(first.full_count);if(!(total>1000&&total<20000))throw new Error(`Implausible PS4 count ${total}`);
let records=[],offset=0,limit=100;
while(offset<total){const u=new URL(`${BASE}/deep_search`);u.searchParams.set(filterParam,String(PS4));u.searchParams.set('limit',String(limit));u.searchParams.set('offset',String(offset));const j=offset===0?first:await json(u);const rec=j.records||[];if(!rec.length)break;if(!rec.every(r=>Number(r.platform_id)===PS4))throw new Error(`Platform contamination at offset ${offset}`);records.push(...rec);offset+=rec.length;console.log(`catalog ${Math.min(offset,total)}/${total}`);await sleep(250)}
records=[...new Map(records.map(r=>[r.id,r])).values()];
if(records.length<1000)throw new Error(`Only ${records.length} verified PS4 products; refusing publish`);

// The downstream importer only accepts exact normalized canonical titles, so do that
// inexpensive title test here and avoid thousands of detail calls that can never publish.
const targetRecords=records.filter(r=>canonicalNorms.has(norm(stripEdition(r.title))));
const targetNorms=new Set(targetRecords.map(r=>norm(stripEdition(r.title))));
console.log(`Prefiltered ${records.length} PS4 products -> ${targetRecords.length} candidate products covering ${targetNorms.size}/${canonicalNorms.size} canonical titles`);
if(targetRecords.length<100) throw new Error(`Only ${targetRecords.length} canonical GAMEYE candidates; refusing publish`);

// Resume cache. Successful detail responses survive later runs and are never requested again.
fs.mkdirSync('audit-out',{recursive:true});
const cachePath='audit-out/gameye-detail-cache.json';
let cache={};
if(fs.existsSync(cachePath)){try{const parsed=JSON.parse(fs.readFileSync(cachePath,'utf8'));cache=parsed&&typeof parsed==='object'&&!Array.isArray(parsed)?parsed:{};}catch{cache={};}}
let cachedHits=0, fetched=0, failed=0;
const out=[];let n=0;
for(const r of targetRecords){
  let d=cache[String(r.id)]||null;
  if(d){cachedHits++;}
  else {
    try{const x=await json(`${BASE}/items/${r.id}`);d=x.item_detail||x.item||x;cache[String(r.id)]=d;fetched++;if(fetched%25===0)fs.writeFileSync(cachePath,JSON.stringify(cache));}
    catch(e){failed++;console.log('detail fail',r.id,String(e));}
    await sleep(250);
  }
  if(d){const h=d.hltb||d.howlongtobeat||d.game_specific?.hltb||{};const avg=Number(d.averagePlaytime??d.average_playtime??h.average??h.main);const comp=Number(d.completionist??d.completionist_playtime??h.completionist);if(Number.isFinite(avg)||Number.isFinite(comp))out.push({id:r.id,gameyeId:r.id,title:r.title,platform:'Sony PlayStation 4',region:d.region??d.country??null,averagePlaytime:Number.isFinite(avg)?avg:null,completionist:Number.isFinite(comp)?comp:null});}
  if(++n%100===0)console.log(`details ${n}/${targetRecords.length}; HLTB=${out.length}; cache=${cachedHits}; fetched=${fetched}; failed=${failed}`);
}
fs.writeFileSync(cachePath,JSON.stringify(cache));
if(out.length<100)throw new Error(`Only ${out.length} canonical-candidate PS4 HLTB products; sanity gate requires >=100; refusing publish`);
fs.writeFileSync('gameye-hltb.json',JSON.stringify(out,null,2)+'\n');
const report={at:new Date().toISOString(),platformId:PS4,filterParam,ps4Products:records.length,canonicalTargets:canonicalNorms.size,candidateProducts:targetRecords.length,candidateCanonicalTitles:targetNorms.size,cachedDetails:cachedHits,fetchedDetails:fetched,failedDetails:failed,hltbProducts:out.length};
fs.writeFileSync('audit-out/gameye-full-fetch-report.json',JSON.stringify(report,null,2));console.log(report);
