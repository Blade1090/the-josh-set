import fs from 'node:fs';
const BASE='https://www.gameye.app';
const headers={'user-agent':'Mozilla/5.0','accept':'application/json,text/plain,*/*'};
const paths=['/api/deep_search','/api/deep_search/','/deep_search','/deep_search/'];
const bodies=[
 {query:'',page:1,per_page:10},
 {search:'',page:1,limit:10},
 {query:'PlayStation 4',page:1,limit:10},
 {category:'games',page:1,limit:10}
];
const out=[];
for(const p of paths){for(const b of bodies){for(const method of ['POST','GET']){try{
 let u=BASE+p, opt={method,headers};
 if(method==='POST'){opt.headers={...headers,'content-type':'application/json'};opt.body=JSON.stringify(b)}
 else u+='?'+new URLSearchParams(Object.entries(b).map(([k,v])=>[k,String(v)]));
 const r=await fetch(u,opt); const t=await r.text();
 out.push({method,url:u,status:r.status,type:r.headers.get('content-type'),sample:t.slice(0,3000)});
}catch(e){out.push({method,url:BASE+p,error:String(e)})}}}}
fs.mkdirSync('audit-out',{recursive:true});
fs.writeFileSync('audit-out/gameye-bulk-probe.json',JSON.stringify(out,null,2));
console.log(out.map(x=>({method:x.method,url:x.url,status:x.status,type:x.type})));