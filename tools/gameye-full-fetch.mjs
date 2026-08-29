import fs from 'node:fs';
const BASE='https://www.gameye.app';
const H={'user-agent':'Mozilla/5.0','accept':'application/json,text/plain,*/*'};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function fetchRetry(u,opt={},tries=8){
  for(let attempt=0;attempt<tries;attempt++){
    const r=await fetch(u,opt);
    if(r.ok) return r;
    if(r.status!==429 && r.status<500) throw new Error(`${r.status} ${u}`);
    const retry=Number(r.headers.get('retry-after'));
    const wait=Number.isFinite(retry)&&retry>0 ? retry*1000 : Math.min(60000,1500*(2**attempt));
    console.log(`GAMEYE ${r.status}; waiting ${Math.round(wait/1000)}s then retry ${attempt+1}/${tries}: ${u}`);
    await sleep(wait);
  }
  throw new Error(`GAMEYE retries exhausted: ${u}`);
}
const getJSON=async u=>(await fetchRetry(u,{headers:H})).json();
const getText=async(u,accept='text/html')=>(await fetchRetry(u,{headers:{...H,accept}})).text();
const parseTime=v=>{if(v==null)return null;if(typeof v==='number')return v;const m=String(v).match(/([0-9]+(?:\.[0-9]+)?)/);return m?Number(m[1]):null};

let ps4FilterId=null;
for(let fid=1;fid<=160;fid++){
  try{
    const html=await getText(`${BASE}/category/all?f=1-${fid}`);
    if(/Sony\s+PlayStation\s+4/i.test(html)){ps4FilterId=fid;console.log('Discovered PS4 browse filter',fid);break;}
  }catch{}
  await sleep(150);
}
if(ps4FilterId==null) throw new Error('Could not discover GAMEYE PS4 browse filter');

// GAMEYE's full_count is global even when f= is supplied. Therefore never use it as
// the filtered pagination bound. Stop on an empty page, a repeated page, or a short page.
let page=1, ps4Records=[], previousIds=null, pageSize=null;
while(true){
  const j=await getJSON(`${BASE}/api/deep_search?f=${encodeURIComponent(`1-${ps4FilterId}`)}&page=${page}`);
  const recs=(j.records||[]).filter(r=>r.category_id===0);
  if(!recs.length){console.log(`PS4 pagination ended at empty page ${page}`);break;}
  const ids=recs.map(r=>r.id).join(',');
  if(ids===previousIds){console.log(`PS4 pagination repeated at page ${page}; stopping safely`);break;}
  previousIds=ids;
  if(pageSize==null) pageSize=recs.length;
  ps4Records.push(...recs);
  console.log(`PS4 filtered page ${page}; products=${ps4Records.length}`);
  if(recs.length<pageSize){console.log(`PS4 pagination ended on short page ${page} (${recs.length}/${pageSize})`);break;}
  page++;
  if(page>10000) throw new Error('Safety stop: PS4 pagination exceeded 10,000 pages');
  await sleep(500);
}
ps4Records=[...new Map(ps4Records.map(r=>[r.id,r])).values()];
if(!ps4Records.length) throw new Error('GAMEYE PS4 filtered scan returned zero records');

let verified=0;
for(const r of ps4Records.slice(0,Math.min(10,ps4Records.length))){
  try{if(/Sony\s+PlayStation\s+4/i.test(await getText(`${BASE}/encyclopedia/${r.id}`))) verified++;}catch{}
  await sleep(250);
}
if(!verified) throw new Error(`Filter 1-${ps4FilterId} returned ${ps4Records.length} records but PS4 verification failed`);
console.log(`Verified PS4 filter 1-${ps4FilterId}; products=${ps4Records.length}; samples=${verified}`);

const out=[]; let n=0;
for(const r of ps4Records){
  let avg=null,comp=null,region=null;
  try{
    const resp=await fetchRetry(`${BASE}/api/encyclopedia/${r.id}`,{headers:H});
    const type=resp.headers.get('content-type')||''; const text=await resp.text();
    if(type.includes('json')){const j=JSON.parse(text);const x=j.record||j.item||j;avg=parseTime(x.averagePlaytime??x.average_playtime??x.hltb?.average??x.hltb?.main);comp=parseTime(x.completionist??x.completionist_playtime??x.hltb?.completionist);region=x.region??x.country??region;}
  }catch{}
  if(avg==null&&comp==null){
    try{const text=await getText(`${BASE}/encyclopedia/${r.id}`);const ma=text.match(/Average(?: Playtime)?[^0-9]{0,160}([0-9]+(?:\.[0-9]+)?)/i);const mc=text.match(/Completionist[^0-9]{0,160}([0-9]+(?:\.[0-9]+)?)/i);if(ma)avg=Number(ma[1]);if(mc)comp=Number(mc[1]);}catch{}
  }
  if(avg!=null||comp!=null) out.push({id:r.id,gameyeId:r.id,title:r.title,platform:'Sony PlayStation 4',region,averagePlaytime:avg,completionist:comp});
  if(++n%100===0) console.log(`details ${n}/${ps4Records.length}; HLTB=${out.length}`);
  await sleep(500);
}
if(!out.length) throw new Error(`Found ${ps4Records.length} verified PS4 products but extracted zero HLTB records`);
fs.writeFileSync('gameye-hltb.json',JSON.stringify(out,null,2)+'\n');
fs.mkdirSync('audit-out',{recursive:true});
fs.writeFileSync('audit-out/gameye-full-fetch-report.json',JSON.stringify({at:new Date().toISOString(),ps4Filter:`1-${ps4FilterId}`,ps4Products:ps4Records.length,hltbProducts:out.length,pages:page},null,2));
console.log(JSON.stringify({ps4Filter:`1-${ps4FilterId}`,ps4Products:ps4Records.length,hltbProducts:out.length,pages:page},null,2));
