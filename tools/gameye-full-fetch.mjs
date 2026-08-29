import fs from 'node:fs';
const BASE='https://www.gameye.app';
const H={'user-agent':'Mozilla/5.0','accept':'application/json,text/plain,*/*'};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const getJSON=async u=>{const r=await fetch(u,{headers:H});if(!r.ok)throw new Error(`${r.status} ${u}`);return r.json()};
// GAMEYE deep_search is public. Pull catalog pages, keep game records, identify PS4 platform IDs from known seed records/pages,
// then fetch encyclopedia pages for HLTB fields. Conservative: output only records where PS4 can be established.
const seed=JSON.parse(fs.readFileSync('gameye-hltb.json','utf8'));
const knownIds=new Set(seed.map(x=>Number(x.gameyeId??x.id)).filter(Number.isFinite));
const knownPlatformIds=new Set();
// Discover platform_id for seed IDs by scanning deep_search in large pages until all are seen or catalog exhausted.
let page=1, per=1000, full=Infinity, ps4Records=[];
while((page-1)*per<full){
 const j=await getJSON(`${BASE}/api/deep_search?page=${page}&per_page=${per}`); full=Number(j.full_count||0); const recs=j.records||[];
 for(const r of recs) if(knownIds.has(Number(r.id))) knownPlatformIds.add(Number(r.platform_id));
 page++; if(knownPlatformIds.size && page>3) break;
}
if(!knownPlatformIds.size) throw new Error('Could not infer GAMEYE PS4 platform_id from seed records');
console.log('PS4 platform ids', [...knownPlatformIds]);
// Full catalog scan, retaining game category records on inferred PS4 platform.
page=1; full=Infinity;
while((page-1)*per<full){
 const j=await getJSON(`${BASE}/api/deep_search?page=${page}&per_page=${per}`); full=Number(j.full_count||0);
 for(const r of j.records||[]) if(r.category_id===0 && knownPlatformIds.has(Number(r.platform_id))) ps4Records.push(r);
 console.log(`catalog ${Math.min(page*per,full)}/${full}; PS4=${ps4Records.length}`); page++; await sleep(75);
}
// Deduplicate products by GAMEYE id. Encyclopedia API/page is probed in a few public forms; parse JSON or rendered HTML.
const out=[]; let n=0;
const parseTime=v=>{if(v==null)return null;if(typeof v==='number')return v;const s=String(v);const m=s.match(/([0-9]+(?:\.[0-9]+)?)/);return m?Number(m[1]):null};
for(const r of ps4Records){
 let avg=null,comp=null,region=null,platform='Sony PlayStation 4';
 const urls=[`${BASE}/api/encyclopedia/${r.id}`,`${BASE}/encyclopedia/${r.id}`];
 for(const u of urls){try{const resp=await fetch(u,{headers:H});if(!resp.ok)continue;const type=resp.headers.get('content-type')||'';const text=await resp.text();
   if(type.includes('json')){const j=JSON.parse(text);const x=j.record||j.item||j;avg=parseTime(x.averagePlaytime??x.average_playtime??x.hltb?.average??x.hltb?.main);comp=parseTime(x.completionist??x.completionist_playtime??x.hltb?.completionist);region=x.region??x.country??region;}
   else {const ma=text.match(/Average(?: Playtime)?[^0-9]{0,100}([0-9]+(?:\.[0-9]+)?)/i);const mc=text.match(/Completionist[^0-9]{0,100}([0-9]+(?:\.[0-9]+)?)/i);if(ma)avg=Number(ma[1]);if(mc)comp=Number(mc[1]);}
   if(avg!=null||comp!=null)break;
 }catch{}}
 if(avg!=null||comp!=null) out.push({id:r.id,gameyeId:r.id,title:r.title,platform,region,averagePlaytime:avg,completionist:comp});
 if(++n%100===0) console.log(`details ${n}/${ps4Records.length}; HLTB=${out.length}`); await sleep(90);
}
fs.writeFileSync('gameye-hltb.json',JSON.stringify(out,null,2)+'\n');
fs.mkdirSync('audit-out',{recursive:true});fs.writeFileSync('audit-out/gameye-full-fetch-report.json',JSON.stringify({at:new Date().toISOString(),platformIds:[...knownPlatformIds],catalogTotal:full,ps4Products:ps4Records.length,hltbProducts:out.length},null,2));
console.log(JSON.stringify({platformIds:[...knownPlatformIds],ps4Products:ps4Records.length,hltbProducts:out.length},null,2));
