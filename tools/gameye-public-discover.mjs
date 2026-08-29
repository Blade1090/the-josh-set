import fs from 'node:fs';
const BASE='https://www.gameye.app';
const ua={'user-agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/131 Safari/537.36'};
const get=async u=>{const r=await fetch(u,{headers:ua});if(!r.ok)throw new Error(`${r.status} ${u}`);return r.text()};
const html=await get(`${BASE}/category/all`);
const scripts=[...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map(m=>new URL(m[1],BASE).href);
const css=[...html.matchAll(/<link[^>]+href=["']([^"']+\.css[^"']*)["']/gi)].map(m=>new URL(m[1],BASE).href);
let blobs=[];
for(const u of scripts){try{blobs.push({u,t:await get(u)})}catch(e){console.warn(e.message)}}
const needles=/https?:\\?\/\\?\/[A-Za-z0-9._~:/?#\[\]@!$&'()*+,;=%-]+|\/[A-Za-z0-9._~/-]*(?:api|search|entries|encyclopedia|category)[A-Za-z0-9._~/?=&%-]*/gi;
const candidates=new Set();
for(const {t} of blobs) for(const m of t.matchAll(needles)){const s=m[0].replaceAll('\\/','/');if(/api|search|entr|encycl|category/i.test(s))candidates.add(s)}
fs.mkdirSync('audit-out',{recursive:true});
fs.writeFileSync('audit-out/gameye-public-discovery.json',JSON.stringify({at:new Date().toISOString(),scripts,css,candidates:[...candidates].slice(0,2000)},null,2));
console.log(JSON.stringify({scripts:scripts.length,candidates:candidates.size},null,2));
