import fs from 'node:fs';
const BASE='https://www.gameye.app';
const H={'user-agent':'Mozilla/5.0','accept':'application/json,text/plain,*/*'};
const known=[164308,123537,183474,163491,147995,163378,178468,154948];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const report={at:new Date().toISOString(),known,tests:[]};
async function grab(url){try{const r=await fetch(url,{headers:H});const text=await r.text();return {status:r.status,type:r.headers.get('content-type')||'',text:text.slice(0,200000)}}catch(e){return {status:0,error:String(e),text:''}}}
for(const id of known){
  for(const url of [`${BASE}/api/encyclopedia/${id}`,`${BASE}/api/encyclopedia?id=${id}`,`${BASE}/api/deep_search?id=${id}`,`${BASE}/api/deep_search?query=${id}`,`${BASE}/api/deep_search?search=${id}`]){
    const x=await grab(url);let json=null;try{json=JSON.parse(x.text)}catch{}
    report.tests.push({id,url,status:x.status,type:x.type,json,preview:json?undefined:x.text.slice(0,500)});
    await sleep(150);
  }
}
fs.mkdirSync('audit-out',{recursive:true});fs.writeFileSync('audit-out/gameye-known-ps4-probe.json',JSON.stringify(report,null,2));
console.log('wrote probe',report.tests.length);
