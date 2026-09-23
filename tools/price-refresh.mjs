// ShelfCheck periodic price refresh v2 — conservative, merge-safe, reusable.
//
// Normal workflow:
//   node tools/price-refresh.mjs --audit=path/to/shelfcheck-price-audit.json
//
// Reuse a completed v1/v2 report without redoing the whole 2,384-title search:
//   node tools/price-refresh.mjs --reuse-report=audit-out/price-refresh-report.json
//
// v2 improvements:
// - Uses the audit's existing PriceCharting product + region as tie-breakers.
// - Same-title multi-region hits are no longer automatically ambiguous.
// - Manual/retailer-priced oddballs remain untouched when PriceCharting has no clean CIB route.
// - Import pack contains CHANGES ONLY and is marked mode=merge so ShelfCheck never wipes other prices.
// - Large price moves remain review-only.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const args=Object.fromEntries(process.argv.slice(2).map(a=>{const m=a.match(/^--([^=]+)=(.*)$/);return m?[m[1],m[2]]:[a.replace(/^--/,''),true]}));
const auditPath=path.resolve(REPO,args.audit||'audit-out/shelfcheck-price-audit.json');
const reusePath=args['reuse-report']?path.resolve(REPO,args['reuse-report']):null;
const outPath=path.resolve(REPO,args.out||'audit-out/price-refresh-report.json');
const importPath=path.resolve(REPO,args.import||'audit-out/price-refresh-import.json');
const delayMs=Number(args.delay||300);
const maxMovePct=Number(args['max-move']||25);
const limit=args.limit?Number(args.limit):Infinity;

fs.mkdirSync(path.dirname(outPath),{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const decode=s=>String(s||'').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(+n)).replace(/&amp;/g,'&').replace(/&#39;|&apos;/g,"'").replace(/&quot;/g,'"');
const norm=s=>decode(s).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/&/g,' and ').replace(/\b(playstation|ps4)\b/g,' ').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();

async function get(url,retries=4){
  for(let i=0;i<retries;i++){
    try{
      const r=await fetch(url,{headers:{'user-agent':'Mozilla/5.0 ShelfCheck periodic pricing maintenance v2'}});
      if(r.ok)return{text:await r.text(),url:r.url};
      if(r.status===429||r.status>=500){await sleep(1000*Math.pow(2,i));continue}
      return null;
    }catch{await sleep(1000*Math.pow(2,i))}
  }
  return 'ERROR';
}

function platform(url){
  const m=new URL(url).pathname.match(/^\/(?:[a-z]{2}\/)?game\/([a-z0-9-]+)\//);
  if(!m)return null;
  return ({'playstation-4':'US','pal-playstation-4':'PAL','jp-playstation-4':'JP','asian-english-playstation-4':'Asian English'})[m[1]]||null;
}
function desiredRegion(row){
  const s=String(row.region||row.c||'').toLowerCase();
  if(/asian/.test(s))return'Asian English';
  if(/\bjp\b|japan/.test(s))return'JP';
  if(/pal|europe|uk|pegi/.test(s))return'PAL';
  if(/\bus\b|north america|playstation 4/.test(s))return'US';
  return null;
}
function regionRank(candidateRegion,target){
  if(target)return candidateRegion===target?0:candidateRegion==='US'?2:candidateRegion==='PAL'?3:candidateRegion==='Asian English'?4:5;
  return candidateRegion==='US'?0:candidateRegion==='PAL'?1:candidateRegion==='Asian English'?2:3;
}
function parseCib(html){
  const sec=html.match(/id="complete_price"[\s\S]{0,700}?<\/td>/i);
  if(!sec)return null;
  const m=sec[0].match(/\$([0-9,]+\.\d{2})/);
  return m?Number(m[1].replaceAll(',','')):null;
}

async function candidates(query){
  const q='https://www.pricecharting.com/search-products?type=prices&q='+encodeURIComponent(query+' Playstation 4');
  const res=await get(q);
  if(res==='ERROR')return{error:true,rows:[]};
  if(!res)return{rows:[]};
  const finalPath=new URL(res.url).pathname;
  if(/\/game\/[^/]+\/[^/?]+$/.test(finalPath)){
    const t=decode((res.text.match(/<title>([^<]*)<\/title>/i)||[])[1]||'').replace(/\s*Prices[\s\S]*/i,'').trim();
    const region=platform(res.url);
    return{rows:region?[{title:t,url:res.url,region}]:[]};
  }
  const seen=new Set();
  const rows=[...res.text.matchAll(/href="([^"]*\/game\/[^"]+)"[^>]*>([\s\S]{0,300}?)<\/a>/gi)]
    .map(m=>{const url=new URL(decode(m[1]),'https://www.pricecharting.com').href;return{url,title:decode(m[2].replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()),region:platform(url)}})
    .filter(r=>r.region&&r.title&&!/^(english|deutsch|español|français|nederlands|italiano)$/i.test(r.title))
    .filter(r=>{if(seen.has(r.url))return false;seen.add(r.url);return true});
  return{rows};
}

function chooseCandidate(row,rows){
  const wanted=[row.product,row.title].filter(Boolean).map(norm);
  const exact=rows.filter(r=>wanted.includes(norm(r.title)));
  if(!exact.length)return{hit:null,status:'NO_EXACT_MATCH',candidates:rows.slice(0,8)};
  const target=desiredRegion(row);
  const scored=exact.map(r=>{
    const productExact=row.product&&norm(r.title)===norm(row.product)?0:1;
    const titleExact=norm(r.title)===norm(row.title)?0:1;
    return{r,score:[productExact,regionRank(r.region,target),titleExact]};
  }).sort((a,b)=>a.score.join('|').localeCompare(b.score.join('|')));
  if(scored.length>1&&scored[0].score.join('|')===scored[1].score.join('|'))return{hit:null,status:'REVIEW_AMBIGUOUS',candidates:exact.slice(0,8)};
  return{hit:scored[0].r,status:'MATCHED',selection:{targetRegion:target,score:scored[0].score}};
}

async function finishMatch(row,hit,selection){
  const page=await get(hit.url);
  if(page==='ERROR')return{...row,status:'ERROR_RETRY',candidate:hit,selection};
  if(!page)return{...row,status:'NO_DATA',candidate:hit,selection};
  const fresh=parseCib(page.text);
  if(!Number.isFinite(fresh)||fresh<=0)return{...row,status:'NO_CIB_DATA',candidate:hit,selection};
  const old=Number(row.market),move=Number.isFinite(old)&&old>0?(fresh-old)/old*100:null;
  const absMove=move==null?null:Math.abs(move);
  const status=absMove!=null&&absMove>maxMovePct?'REVIEW_LARGE_MOVE':absMove!=null&&absMove<0.5?'UNCHANGED':'SAFE_UPDATE';
  return{...row,status,fresh:+fresh.toFixed(2),old:Number.isFinite(old)?+old.toFixed(2):null,movePct:move==null?null:+move.toFixed(1),candidate:hit,selection};
}

async function refreshOne(row){
  const primary=(row.source&&/pricecharting/i.test(row.source)&&row.product)?row.product:row.title;
  let found=await candidates(primary);
  if(found.error)return{...row,status:'ERROR_RETRY'};
  let chosen=chooseCandidate(row,found.rows);
  // If an old PriceCharting product name differs from the identity title, it is valuable evidence.
  // Conversely, manual retailer product strings can be noisy, so only retry with product when needed.
  if(chosen.status==='NO_EXACT_MATCH'&&row.product&&norm(row.product)!==norm(primary)){
    found=await candidates(row.product);
    if(found.error)return{...row,status:'ERROR_RETRY'};
    chosen=chooseCandidate(row,found.rows);
  }
  if(!chosen.hit)return{...row,status:chosen.status,candidates:chosen.candidates};
  return finishMatch(row,chosen.hit,chosen.selection);
}

async function refineExisting(r){
  if(r.status==='SAFE_UPDATE'||r.status==='UNCHANGED'||r.status==='REVIEW_LARGE_MOVE')return r;
  if(r.status==='REVIEW_AMBIGUOUS'&&Array.isArray(r.candidates)){
    const chosen=chooseCandidate(r,r.candidates);
    if(chosen.hit)return finishMatch(r,chosen.hit,chosen.selection);
    return{...r,status:chosen.status,candidates:chosen.candidates};
  }
  if(r.status==='NO_EXACT_MATCH'&&r.product&&norm(r.product)!==norm(r.title))return refreshOne(r);
  return r;
}

let source,results=[];
if(reusePath){
  if(!fs.existsSync(reusePath)){console.error(`Missing report file: ${reusePath}`);process.exit(1)}
  const old=JSON.parse(fs.readFileSync(reusePath,'utf8'));
  if(!Array.isArray(old.results))throw new Error('Reuse file has no results array.');
  source=old.results.slice(0,limit);
  console.log(`Reusing ${source.length} existing scan results. Only ambiguous/product-name cases will need new lookups.\n`);
  for(let i=0;i<source.length;i++){
    const before=source[i],r=await refineExisting(before);results.push(r);
    if(r.status!==before.status||['REVIEW_AMBIGUOUS','NO_EXACT_MATCH'].includes(before.status))console.log(`[${i+1}/${source.length}] ${r.title} -> ${r.status}${r.fresh?` $${r.fresh}`:''}`);
    if(i<source.length-1&&r!==before)await sleep(delayMs);
  }
}else{
  if(!fs.existsSync(auditPath)){console.error(`Missing audit file: ${auditPath}\nExport one from ShelfCheck: hamburger -> EXPORT PRICE AUDIT`);process.exit(1)}
  const audit=JSON.parse(fs.readFileSync(auditPath,'utf8'));
  if(audit.shelfcheckPriceAudit!==1||!Array.isArray(audit.prices))throw new Error('Not a ShelfCheck price-audit JSON.');
  source=audit.prices.filter(r=>r.market!=null).slice(0,limit);
  for(let i=0;i<source.length;i++){
    const r=await refreshOne(source[i]);results.push(r);
    console.log(`[${i+1}/${source.length}] ${r.title} -> ${r.status}${r.fresh?` $${r.fresh}`:''}`);
    if(i<source.length-1)await sleep(delayMs);
  }
}

const safe=results.filter(r=>r.status==='SAFE_UPDATE'||r.status==='UNCHANGED');
const changes=results.filter(r=>r.status==='SAFE_UPDATE');
const review=results.filter(r=>r.status.startsWith('REVIEW_'));
const unresolved=results.filter(r=>!['SAFE_UPDATE','UNCHANGED'].includes(r.status)&&!r.status.startsWith('REVIEW_'));
const generatedAt=new Date().toISOString();
const prices=changes.map(r=>({
  t:r.title,m:r.fresh,s:+(r.fresh*.70).toFixed(2),g:+(r.fresh*.85).toFixed(2),x:+(r.fresh*1.10).toFixed(2),
  pc:r.candidate?.title||r.product||r.title,c:r.candidate?.region||r.region||'PlayStation 4',source:'PriceCharting periodic refresh v2',refreshedAt:generatedAt
}));
const summary={generatedAt,scanned:results.length,verified:safe.length,safeImport:prices.length,changed:changes.length,unchanged:safe.length-changes.length,review:review.length,unresolved:unresolved.length,maxMovePct,reused:!!reusePath};
fs.writeFileSync(outPath,JSON.stringify({summary,changes,review,unresolved,results},null,2));
fs.writeFileSync(importPath,JSON.stringify({shelfcheckPriceRefresh:2,mode:'merge',source:'ShelfCheck periodic PriceCharting refresh v2',generatedAt,prices},null,2));
console.log('\n'+JSON.stringify(summary,null,2));
console.log(`Report: ${path.relative(REPO,outPath)}`);
console.log(`Import (merge-only changes): ${path.relative(REPO,importPath)}`);
