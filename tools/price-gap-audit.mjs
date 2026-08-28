import fs from 'fs';import zlib from 'zlib';
const chunks=['data0.txt','data1.txt','data2.txt','data3a.txt','data3b.txt'].map(f=>fs.readFileSync(f,'utf8').trim()).join('');
const DATA=JSON.parse(zlib.gunzipSync(Buffer.from(chunks,'base64')).toString());
const po=fs.readFileSync('price-online-v041.js','utf8');const m=po.match(/,B='([^']+)'/);if(!m)throw Error('online price blob not found');
const pairs=JSON.parse(zlib.inflateSync(Buffer.from(m[1],'base64')).toString());const priced=new Set(pairs.map(x=>+x[0]));
const neg=fs.readFileSync('price-negative-space-v042.js','utf8');for(const x of neg.matchAll(/\{id:(\d+),m:/g))priced.add(+x[1]);
let rows=DATA.i.map(r=>({id:+r[0],title:r[1],set:r[2]}));
// Runtime census additions.
for(const f of ['census-v034.js','census-v040-pricing-audit.js']){const s=fs.readFileSync(f,'utf8');for(const x of s.matchAll(/\[(\d+),["']([^"']+)["']\]/g)){const id=+x[1];if(!rows.some(r=>r.id===id))rows.push({id,title:x[2],set:'INCLUDED'});}}
// Runtime retirements/collapses: detect explicit byId.get(ID).set assignments where possible.
for(const f of ['census-collapse-v035.js','census-v035-final.js','census-v040-pricing-audit.js']){const s=fs.readFileSync(f,'utf8');for(const x of s.matchAll(/byId\.get\((\d+)\)[^;]{0,120}\.set\s*=\s*["'](EXCLUDED|PRODUCT)["']/g)){const r=rows.find(r=>r.id===+x[1]);if(r)r.set=x[2];}}
const live=rows.filter(r=>r.set==='INCLUDED');const missing=live.filter(r=>!priced.has(r.id)).sort((a,b)=>a.title.localeCompare(b.title));
fs.mkdirSync('audit-out',{recursive:true});fs.writeFileSync('audit-out/price-gap.json',JSON.stringify({generated:new Date().toISOString(),live:live.length,priced:live.length-missing.length,missing:missing.length,rows:missing},null,2));
fs.writeFileSync('audit-out/price-gap.txt',missing.map(x=>`${x.id}\t${x.title}`).join('\n')+'\n');console.log({live:live.length,priced:live.length-missing.length,missing:missing.length});