import fs from 'node:fs';
const BASE='https://www.gameye.app';
const H={'user-agent':'Mozilla/5.0','accept':'application/json,text/plain,*/*'};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const getJSON=async u=>{const r=await fetch(u,{headers:H});if(!r.ok)throw new Error(`${r.status} ${u}`);return r.json()};
const parseTime=v=>{if(v==null)return null;if(typeof v==='number')return v;const m=String(v).match(/([0-9]+(?:\.[0-9]+)?)/);return m?Number(m[1]):null};

// GAMEYE's browse filter IDs are not the same thing as record platform_id values.
// Discover PS4 safely: probe nearby platform browse filters, inspect one returned encyclopedia page,
// and accept a candidate only when that page explicitly says Sony PlayStation 4.
let ps4Filter=null, ps4PlatformId=null;
for(let fid=25;fid<=50 && ps4PlatformId==null;fid++){
  for(const param of ['f','filter','filters']){
    try{
      const u=`${BASE}/api/deep_search?${param}=${encodeURIComponent(`1-${fid}`)}&page=1&per_page=10`;
      const j=await getJSON(u); const rec=(j.records||[]).find(x=>x.category_id===0);
      if(!rec) continue;
      const page=await fetch(`${BASE}/encyclopedia/${rec.id}`,{headers:H});
      if(!page.ok) continue; const html=await page.text();
      if(/Sony\s+PlayStation\s+4/i.test(html)){
        ps4Filter={param,fid}; ps4PlatformId=Number(rec.platform_id);
        console.log('Discovered PS4', {filter:ps4Filter,platform_id:ps4PlatformId,sample:rec.title,id:rec.id});
        break;
      }
    }catch{}
    await sleep(50);
  }
}
if(ps4PlatformId==null) throw new Error('Could not discover GAMEYE PS4 platform_id from public browse filters');

// Full public catalog scan. We deliberately filter by the verified record platform_id, not title text.
let page=1, per=1000, full=Infinity, ps4Records=[];
while((page-1)*per<full){
 const j=await getJSON(`${BASE}/api/deep_search?page=${page}&per_page=${per}`); full=Number(j.full_count||0);
 for(const r of j.records||[]) if(r.category_id===0 && Number(r.platform_id)===ps4PlatformId) ps4Records.push(r);
 console.log(`catalog page ${page}; total=${full}; PS4=${ps4Records.length}`);
 if(!(j.records||[]).length) break;
 page++; await sleep(75);
}
ps4Records=[...new Map(ps4Records.map(r=>[r.id,r])).values()];
if(!ps4Records.length) throw new Error(`PS4 platform_id ${ps4PlatformId} discovered but catalog scan returned zero PS4 records`);

// Pull HLTB fields. Try JSON endpoint first, then public encyclopedia HTML. Keep only records with playtime.
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
if(!out.length) throw new Error(`Found ${ps4Records.length} PS4 products but extracted zero HLTB records`);
fs.writeFileSync('gameye-hltb.json',JSON.stringify(out,null,2)+'\n');
fs.mkdirSync('audit-out',{recursive:true});
fs.writeFileSync('audit-out/gameye-full-fetch-report.json',JSON.stringify({at:new Date().toISOString(),ps4Filter,platformId:ps4PlatformId,catalogTotal:full,ps4Products:ps4Records.length,hltbProducts:out.length},null,2));
console.log(JSON.stringify({ps4Filter,platformId:ps4PlatformId,ps4Products:ps4Records.length,hltbProducts:out.length},null,2));
