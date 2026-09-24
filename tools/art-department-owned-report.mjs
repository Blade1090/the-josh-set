import fs from 'node:fs';

const audit=JSON.parse(fs.readFileSync('audit-out/art-department-audit.json','utf8'));
const rows=(audit.rows||[]).filter(r=>r.owned);
const candidates=new Map((audit.candidates||[]).map(r=>[String(r.id),r]));
const MIN_W=500,MIN_H=700,MIN_BYTES=45000;

function webpSize(b){
  if(b.length<30||b.toString('ascii',0,4)!=='RIFF'||b.toString('ascii',8,12)!=='WEBP')return null;
  const type=b.toString('ascii',12,16);
  if(type==='VP8X')return{width:1+b.readUIntLE(24,3),height:1+b.readUIntLE(27,3)};
  if(type==='VP8L'&&b[20]===0x2f){const b1=b[21],b2=b[22],b3=b[23],b4=b[24];return{width:1+(b1|((b2&0x3f)<<8)),height:1+((b2>>6)|(b3<<2)|((b4&0x0f)<<10))};}
  if(type==='VP8 '){for(let i=20;i+9<b.length&&i<80;i++){if(b[i+3]===0x9d&&b[i+4]===0x01&&b[i+5]===0x2a)return{width:b.readUInt16LE(i+6)&0x3fff,height:b.readUInt16LE(i+8)&0x3fff};}}
  return null;
}
async function inspect(url){
  try{
    const r=await fetch(url,{headers:{'User-Agent':'ShelfCheck-ArtDepartment-Owned/1.0','Accept':'image/webp,image/*,*/*;q=0.8'}});
    if(!r.ok)return{ok:false,status:r.status};
    const b=Buffer.from(await r.arrayBuffer()),size=webpSize(b);
    return{ok:true,status:r.status,bytes:b.length,width:size?.width||null,height:size?.height||null,contentType:r.headers.get('content-type')||''};
  }catch(e){return{ok:false,status:0,error:String(e)}}
}

const gameyeOwned=rows.filter(r=>r.bucket==='GAMEYE_RETAIL'&&r.url);
const checks=new Map();let next=0;
await Promise.all(Array.from({length:10},async()=>{while(true){const i=next++;if(i>=gameyeOwned.length)return;const r=gameyeOwned[i];checks.set(String(r.id),await inspect(r.url));if((i+1)%25===0)console.log(`owned scan check ${i+1}/${gameyeOwned.length}`)}}));

const assessed=rows.map(r=>{
  const check=checks.get(String(r.id))||null,cand=candidates.get(String(r.id))||null;
  let quality='OK',reason='';
  if(r.bucket==='COVER_NEEDED'){quality='FIX_FIRST';reason='No cover art';}
  else if(r.bucket==='PS_STORE_LEGACY'){quality='FIX_FIRST';reason='PlayStation Store/key art, not a verified physical front';}
  else if(r.bucket==='IGDB_LEGACY'){quality='REVIEW';reason='Legacy IGDB art has not been retail-front verified';}
  else if(r.bucket==='UNKNOWN_SOURCE'){quality='REVIEW';reason='Unclassified source';}
  else if(r.bucket==='GAMEYE_RETAIL'&&check){
    if(!check.ok){quality='FIX_FIRST';reason=`Retail scan failed to load (${check.status||'network'})`;}
    else if((check.width&&check.width<MIN_W)||(check.height&&check.height<MIN_H)||check.bytes<MIN_BYTES){quality='LOW_RES';reason=`Retail front is soft/undersized (${check.width||'?'}×${check.height||'?'}, ${Math.round(check.bytes/1024)} KB)`;}
    else reason=`Verified retail front (${check.width||'?'}×${check.height||'?'}, ${Math.round(check.bytes/1024)} KB)`;
  } else if(r.bucket==='CURATED_RETAIL') reason='Curator-approved physical front';
  const lowCandidate=cand?.gameye?.[0]?.quality==='REVIEW_LOW_RES';
  return{...r,quality,qualityReason:reason,scan:check,lowCandidate};
});

const priority={FIX_FIRST:0,LOW_RES:1,REVIEW:2,OK:3};
assessed.sort((a,b)=>(priority[a.quality]-priority[b.quality])||a.title.localeCompare(b.title));
const count=q=>assessed.filter(x=>x.quality===q).length;
const buckets={};for(const r of assessed)buckets[r.bucket]=(buckets[r.bucket]||0)+1;
const summary={generatedAt:new Date().toISOString(),owned:assessed.length,fixFirst:count('FIX_FIRST'),lowRes:count('LOW_RES'),review:count('REVIEW'),ok:count('OK'),buckets};

const md=['# ShelfCheck Art Department — Owned Shelf','',`Generated: ${summary.generatedAt}`,'','## Summary','',`- Owned identities audited: **${summary.owned}**`,`- Fix first: **${summary.fixFirst}**`,`- Low-resolution retail scans: **${summary.lowRes}**`,`- Legacy/source review: **${summary.review}**`,`- Currently OK: **${summary.ok}**`,'','### Source mix','',...Object.entries(buckets).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`- ${k}: ${v}`),'','## Action queue',''];
for(const r of assessed.filter(x=>x.quality!=='OK')){
  md.push(`### ${r.title} (#${r.id})`,`- Priority: **${r.quality}**`,`- Source bucket: ${r.bucket}`,`- Reason: ${r.qualityReason||r.reason}`,`- Current art: ${r.url||'COVER NEEDED'}`);
  if(r.scan)md.push(`- Scan check: ${r.scan.ok?'loaded':'failed'} · ${r.scan.width||'?'}×${r.scan.height||'?'} · ${r.scan.bytes?Math.round(r.scan.bytes/1024)+' KB':'size unknown'}`);
  const g=candidates.get(String(r.id))?.gameye?.[0];if(g)md.push(`- Best current GameEye candidate: ${g.title} · ${g.quality} · ${g.matchType||'match'} · ${g.image?`${g.image.width}×${g.image.height}`:'no image'}`);
  md.push('');
}
fs.mkdirSync('audit-out',{recursive:true});
fs.writeFileSync('audit-out/art-department-owned.md',md.join('\n'));
fs.writeFileSync('audit-out/art-department-owned.json',JSON.stringify({summary,rows:assessed},null,2));
console.log(JSON.stringify(summary,null,2));
