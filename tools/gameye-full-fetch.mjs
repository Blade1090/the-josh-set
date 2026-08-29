import fs from 'node:fs';
const BASE='https://www.gameye.app';
const H={'user-agent':'Mozilla/5.0','accept':'application/json,text/plain,*/*'};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const getJSON=async u=>{const r=await fetch(u,{headers:H});if(!r.ok)throw new Error(`${r.status} ${u}`);return r.json()};
const parseTime=v=>{if(v==null)return null;if(typeof v==='number')return v;const m=String(v).match(/([0-9]+(?:\.[0-9]+)?)/);return m?Number(m[1]):null};

// GAMEYE browse URLs prove platform is filter type 1. Discover the PS4 filter ID by
// asking the rendered browse page which platform a candidate represents. Never infer it
// from deep_search's unfiltered first record.
let ps4FilterId=null;
for(let fid=1;fid<=160;fid++){
  try{
    const resp=await fetch(`${BASE}/category/all?f=1-${fid}`,{headers:{...H,accept:'text/html'}});
    if(!resp.ok) continue;
    const html=await resp.text();
    if(/Platform[\s\S]{0,300}Sony\s+PlayStation\s+4/i.test(html) || /Sony\s+PlayStation\s+4/i.test(html)){
      ps4FilterId=fid; console.log('Discovered PS4 browse filter',fid); break;
    }
  }catch{}
  await sleep(25);
}
if(ps4FilterId==null) throw new Error('Could not discover GAMEYE PS4 browse filter');

// IMPORTANT: keep f=1-<id> on EVERY request. Previous run accidentally scanned the
// unfiltered catalog and deep_search ignored our per_page=1000 assumption.
let page=1, full=Infinity, ps4Records=[];
while(ps4Records.length<full){
  const j=await getJSON(`${BASE}/api/deep_search?f=${encodeURIComponent(`1-${ps4FilterId}`)}&page=${page}`);
  full=Number(j.full_count||0); const recs=j.records||[];
  if(!recs.length) break;
  for(const r of recs) if(r.category_id===0) ps4Records.push(r);
  console.log(`PS4 filtered page ${page}; ${ps4Records.length}/${full}`);
  page++; await sleep(75);
}
ps4Records=[...new Map(ps4Records.map(r=>[r.id,r])).values()];
if(!ps4Records.length) throw new Error('GAMEYE PS4 filtered scan returned zero records');
// Verify several records are genuinely PS4 before harvesting details.
let verified=0;
for(const r of ps4Records.slice(0,Math.min(10,ps4Records.length))){
  const resp=await fetch(`${BASE}/encyclopedia/${r.id}`,{headers:{...H,accept:'text/html'}});
  if(resp.ok && /Sony\s+PlayStation\s+4/i.test(await resp.text())) verified++;
}
if(!verified) throw new Error(`Filter 1-${ps4FilterId} returned ${ps4Records.length} records but PS4 verification failed`);
console.log(`Verified PS4 filter 1-${ps4FilterId}; products=${ps4Records.length}; samples=${verified}`);

const out=[]; let n=0;
for(const r of ps4Records){
 let avg=null,comp=null,region=null;
 for(const u of [`${BASE}/api/encyclopedia/${r.id}`,`${BASE}/encyclopedia/${r.id}`]){try{
   const resp=await fetch(u,{headers:H}); if(!resp.ok)continue; const type=resp.headers.get('content-type')||''; const text=await resp.text();
   if(type.includes('json')){const j=JSON.parse(text);const x=j.record||j.item||j;avg=parseTime(x.averagePlaytime??x.average_playtime??x.hltb?.average??x.hltb?.main);comp=parseTime(x.completionist??x.completionist_playtime??x.hltb?.completionist);region=x.region??x.country??region;}
   else {const ma=text.match(/Average(?: Playtime)?[^0-9]{0,160}([0-9]+(?:\.[0-9]+)?)/i);const mc=text.match(/Completionist[^0-9]{0,160}([0-9]+(?:\.[0-9]+)?)/i);if(ma)avg=Number(ma[1]);if(mc)comp=Number(mc[1]);}
   if(avg!=null||comp!=null)break;
 }catch{}}
 if(avg!=null||comp!=null) out.push({id:r.id,gameyeId:r.id,title:r.title,platform:'Sony PlayStation 4',region,averagePlaytime:avg,completionist:comp});
 if(++n%100===0) console.log(`details ${n}/${ps4Records.length}; HLTB=${out.length}`); await sleep(75);
}
if(!out.length) throw new Error(`Found ${ps4Records.length} verified PS4 products but extracted zero HLTB records`);
fs.writeFileSync('gameye-hltb.json',JSON.stringify(out,null,2)+'\n');
fs.mkdirSync('audit-out',{recursive:true});
fs.writeFileSync('audit-out/gameye-full-fetch-report.json',JSON.stringify({at:new Date().toISOString(),ps4Filter:`1-${ps4FilterId}`,ps4Products:ps4Records.length,hltbProducts:out.length},null,2));
console.log(JSON.stringify({ps4Filter:`1-${ps4FilterId}`,ps4Products:ps4Records.length,hltbProducts:out.length},null,2));
