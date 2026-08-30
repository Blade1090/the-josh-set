import fs from 'node:fs';
const BASE='https://www.gameye.app/api';
const H={'user-agent':'Mozilla/5.0','accept':'application/json,text/plain,*/*'};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function fetchRetry(u,tries=7){for(let i=0;i<tries;i++){const r=await fetch(u,{headers:H});if(r.ok)return r;if(r.status!==429&&r.status<500)throw new Error(`${r.status} ${u}`);const s=Number(r.headers.get('retry-after'));await sleep(Number.isFinite(s)&&s>0?s*1000:Math.min(60000,1000*2**i));}throw new Error(`retries exhausted ${u}`)}
const json=async u=>(await fetchRetry(u)).json();
const known=[164308,123537,183474,163491,147995,163378,178468];

// GAMEYE frontend source proves the real API contracts are:
//   GET /deep_search with axios config {params:{title,limit,offset,...}}
//   GET /items/:id for detail data.
// Never infer platform from SPA HTML again.
const details=[];
for(const id of known){const x=await json(`${BASE}/items/${id}`);const d=x.item_detail||x.item||x;details.push({id,d});await sleep(150)}
const platformIds=[...new Set(details.map(x=>Number(x.d.platform_id)).filter(Number.isFinite))];
if(platformIds.length!==1) throw new Error(`Known PS4 anchors disagree on platform_id: ${platformIds.join(',')}`);
const PS4=platformIds[0];
console.log('Verified PS4 platform_id from known anchors:',PS4);

// Probe likely deep_search platform parameter names, accepting only a genuinely filtered response.
const candidates=['platform_id','platform','platforms']; let filterParam=null, first=null;
for(const p of candidates){const u=new URL(`${BASE}/deep_search`);u.searchParams.set(p,String(PS4));u.searchParams.set('limit','100');u.searchParams.set('offset','0');const j=await json(u);const rec=j.records||[];const ok=rec.length>=10&&rec.every(r=>Number(r.platform_id)===PS4)&&Number(j.full_count)>1000&&Number(j.full_count)<20000;if(ok){filterParam=p;first=j;break}console.log('Rejected filter param',p,'full_count=',j.full_count,'rows=',rec.length,'platforms=',[...new Set(rec.map(r=>r.platform_id))].slice(0,8));await sleep(200)}
if(!filterParam) throw new Error('GAMEYE deep_search PS4 filter syntax not yet verified; refusing to overwrite bridge');
console.log('Verified deep_search filter:',filterParam,'PS4=',PS4,'count=',first.full_count);

const total=Number(first.full_count);if(!(total>1000&&total<20000))throw new Error(`Implausible PS4 count ${total}`);
let records=[],offset=0,limit=100;
while(offset<total){const u=new URL(`${BASE}/deep_search`);u.searchParams.set(filterParam,String(PS4));u.searchParams.set('limit',String(limit));u.searchParams.set('offset',String(offset));const j=offset===0?first:await json(u);const rec=j.records||[];if(!rec.length)break;if(!rec.every(r=>Number(r.platform_id)===PS4))throw new Error(`Platform contamination at offset ${offset}`);records.push(...rec);offset+=rec.length;console.log(`catalog ${Math.min(offset,total)}/${total}`);await sleep(250)}
records=[...new Map(records.map(r=>[r.id,r])).values()];
if(records.length<1000)throw new Error(`Only ${records.length} verified PS4 products; refusing publish`);

const out=[];let n=0;
for(const r of records){try{const x=await json(`${BASE}/items/${r.id}`);const d=x.item_detail||x.item||x;const h=d.hltb||d.howlongtobeat||d.game_specific?.hltb||{};const avg=Number(d.averagePlaytime??d.average_playtime??h.average??h.main);const comp=Number(d.completionist??d.completionist_playtime??h.completionist);if(Number.isFinite(avg)||Number.isFinite(comp))out.push({id:r.id,gameyeId:r.id,title:r.title,platform:'Sony PlayStation 4',region:d.region??d.country??null,averagePlaytime:Number.isFinite(avg)?avg:null,completionist:Number.isFinite(comp)?comp:null});}catch(e){console.log('detail fail',r.id,String(e))}if(++n%100===0)console.log(`details ${n}/${records.length}; HLTB=${out.length}`);await sleep(150)}
if(out.length<500)throw new Error(`Only ${out.length} PS4 HLTB products; sanity gate requires >=500; refusing publish`);
fs.writeFileSync('gameye-hltb.json',JSON.stringify(out,null,2)+'\n');fs.mkdirSync('audit-out',{recursive:true});fs.writeFileSync('audit-out/gameye-full-fetch-report.json',JSON.stringify({at:new Date().toISOString(),platformId:PS4,filterParam,ps4Products:records.length,hltbProducts:out.length},null,2));console.log({platformId:PS4,filterParam,ps4Products:records.length,hltbProducts:out.length});
