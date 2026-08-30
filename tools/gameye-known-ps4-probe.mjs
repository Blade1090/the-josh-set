import fs from 'node:fs';
const BASE='https://www.gameye.app';
const H={'user-agent':'Mozilla/5.0','accept':'*/*'};
const known=[164308,123537,183474,163491,147995,163378,178468,154948];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function grab(url){try{const r=await fetch(url,{headers:H});const text=await r.text();return {url,status:r.status,type:r.headers.get('content-type')||'',text}}catch(e){return {url,status:0,error:String(e),text:''}}}
const report={at:new Date().toISOString(),known,assets:[],tests:[]};
const root=await grab(BASE+'/');
const assets=[...root.text.matchAll(/(?:src|href)=["']([^"']+\.js[^"']*)/g)].map(m=>new URL(m[1],BASE).href);
for(const url of [...new Set(assets)]){
 const x=await grab(url); const hits=[];
 for(const needle of ['deep_search','SearchFilters','encyclopedia','platform_id','averagePlaytime','completionist','howlongtobeat']) if(x.text.includes(needle)) hits.push(needle);
 report.assets.push({url,status:x.status,bytes:x.text.length,hits});
 if(hits.length){
   for(const needle of hits){let at=x.text.indexOf(needle); report.tests.push({kind:'asset-context',url,needle,context:x.text.slice(Math.max(0,at-1200),at+2200)});}
   const imports=[...x.text.matchAll(/["'](\.\/[^"']+\.js|\/assets\/[^"']+\.js)["']/g)].map(m=>new URL(m[1],url).href);
   for(const u of [...new Set(imports)].slice(0,100)){const y=await grab(u);const hh=['deep_search','platform_id','averagePlaytime','completionist','howlongtobeat'].filter(n=>y.text.includes(n));if(hh.length){report.assets.push({url:u,status:y.status,bytes:y.text.length,hits:hh});for(const n of hh){const a=y.text.indexOf(n);report.tests.push({kind:'chunk-context',url:u,needle:n,context:y.text.slice(Math.max(0,a-1500),a+3000)});}} await sleep(50);}
 }
}
for(const id of known){const x=await grab(`${BASE}/encyclopedia/${id}`);report.tests.push({kind:'known-page',id,status:x.status,bytes:x.text.length,context:x.text.slice(0,5000)});await sleep(100);}
fs.mkdirSync('audit-out',{recursive:true});fs.writeFileSync('audit-out/gameye-known-ps4-probe.json',JSON.stringify(report,null,2));
console.log('probe assets',report.assets.length,'tests',report.tests.length);
