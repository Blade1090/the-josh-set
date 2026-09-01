import fs from 'node:fs';
import zlib from 'node:zlib';

const passes=Math.max(1,Number(process.env.PASSES||10));
const batchSize=Math.max(1,Number(process.env.BATCH_SIZE||100));
const text=fs.readFileSync('shelfcheck-dossiers.txt','utf8').trim();
const dossiers=JSON.parse(zlib.gunzipSync(Buffer.from(text,'base64')).toString('utf8'));
const existing=new Set(dossiers.map(d=>norm(d.t)));

// Census source is embedded in app.js as DATA. Evaluate only the DATA literal in a sandbox-like Function.
const app=fs.readFileSync('app.js','utf8');
const m=app.match(/const DATA=(\{[\s\S]*?\});/);
if(!m) throw new Error('Could not locate DATA in app.js');
const DATA=Function(`"use strict";return (${m[1]})`)();

const included=(DATA.g||[]).filter(x=>x && x[2]==='INCLUDED').map(x=>({id:x[0],title:x[1]}));
const missing=included.filter(x=>!existing.has(norm(x.title)));
const limit=Math.min(missing.length,passes*batchSize);
const selected=missing.slice(0,limit);
const batches=[];
for(let i=0;i<selected.length;i+=batchSize){batches.push({batch:i/batchSize+1,count:selected.slice(i,i+batchSize).length,games:selected.slice(i,i+batchSize)});}
fs.mkdirSync('audit-out',{recursive:true});
fs.writeFileSync('audit-out/dossier-factory-queue.json',JSON.stringify({generatedAt:new Date().toISOString(),existingDossiers:dossiers.length,includedIdentities:included.length,missing:missing.length,requestedPasses:passes,batchSize,queued:selected.length,batches},null,2));
console.log(`Dossier factory: ${missing.length} missing; queued ${selected.length} across ${batches.length} passes.`);

function norm(s){return String(s||'').toLowerCase().normalize('NFKD').replace(/[’‘]/g,"'").replace(/[^a-z0-9]+/g,' ').trim();}
