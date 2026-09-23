// ShelfCheck periodic price refresh — report + safe import pack generator.
//
// Workflow:
//   1) ShelfCheck hamburger -> EXPORT PRICE AUDIT
//   2) Copy that JSON into the repo (or point --audit at it)
//   3) node tools/price-refresh.mjs --audit=path/to/audit.json
//   4) Review audit-out/price-refresh-report.json
//   5) ShelfCheck hamburger -> REFRESH PRICES -> choose audit-out/price-refresh-import.json
//
// Conservative by design: exact normalized title + PS4 platform only. It never edits repo
// price files. Large moves are flagged instead of silently imported. Products that do not have
// a clean PriceCharting match simply remain on ShelfCheck's existing manual/product price route.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const args=Object.fromEntries(process.argv.slice(2).map(a=>{const m=a.match(/^--([^=]+)=(.*)$/);return m?[m[1],m[2]]:[a.replace(/^--/,''),true]}));
const auditPath=path.resolve(REPO,args.audit||'audit-out/shelfcheck-price-audit.json');
const outPath=path.resolve(REPO,args.out||'audit-out/price-refresh-report.json');
const importPath=path.resolve(REPO,args.import||'audit-out/price-refresh-import.json');
const delayMs=Number(args.delay||450);
const maxMovePct=Number(args['max-move']||25);
const limit=args.limit?Number(args.limit):Infinity;

if(!fs.existsSync(auditPath)){
  console.error(`Missing audit file: ${auditPath}\nExport one from ShelfCheck: hamburger -> EXPORT PRICE AUDIT`);
  process.exit(1);
}
fs.mkdirSync(path.dirname(outPath),{recursive:true});

const audit=JSON.parse(fs.readFileSync(auditPath,'utf8'));
if(audit.shelfcheckPriceAudit!==1||!Array.isArray(audit.prices))throw new Error('Not a ShelfCheck price-audit JSON.');

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const decode=s=>String(s||'').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(+n)).replace(/&amp;/g,'&').replace(/&#39;|&apos;/g,"'").replace(/&quot;/g,'"');
const norm=s=>decode(s).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/&/g,' and ').replace(/\b(playstation|ps4)\b/g,' ').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();

async function get(url,retries=4){
  for(let i=0;i<retries;i++){
    try{
      const r=await fetch(url,{headers:{'user-agent':'Mozilla/5.0 ShelfCheck periodic pricing maintenance'}});
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
  const map={
    'playstation-4':'US','pal-playstation-4':'PAL','jp-playstation-4':'JP','asian-english-playstation-4':'Asian English'
  };
  return map[m[1]]||null;
}

function parseCib(html){
  const sec=html.match(/id="complete_price"[\s\S]{0,700}?<\/td>/i);
  if(!sec)return null;
  const m=sec[0].match(/\$([0-9,]+\.\d{2})/);
  return m?Number(m[1].replaceAll(',','')):null;
}

async function candidates(title){
  const q='https://www.pricecharting.com/search-products?type=prices&q='+encodeURIComponent(title+' Playstation 4');
  const res=await get(q);
  if(res==='ERROR')return{error:true,rows:[]};
  if(!res)return{rows:[]};
  const finalPath=new URL(res.url).pathname;
  if(/\/game\/[^/]+\/[^/?]+$/.test(finalPath)){
    const t=decode((res.text.match(/<title>([^<]*)<\/title>/i)||[])[1]||'').replace(/\s*Prices[\s\S]*/i,'').trim();
    const region=platform(res.url);
    return{rows:region?[{title:t,url:res.url,region}]:[]};
  }
  const rows=[...res.text.matchAll(/href="([^"]*\/game\/[^"]+)"[^>]*>([\s\S]{0,300}?)<\/a>/gi)]
    .map(m=>{const url=new URL(decode(m[1]),'https://www.pricecharting.com').href;return{url,title:decode(m[2].replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()),region:platform(url)}})
    .filter(r=>r.region&&r.title&&!/^(english|deutsch|español|français|nederlands|italiano)$/i.test(r.title));
  return{rows};
}

async function refreshOne(row){
  const found=await candidates(row.title);
  if(found.error)return{...row,status:'ERROR_RETRY'};
  const exact=found.rows.filter(r=>norm(r.title)===norm(row.title));
  if(exact.length!==1)return{...row,status:exact.length?'REVIEW_AMBIGUOUS':'NO_EXACT_MATCH',candidates:found.rows.slice(0,5)};
  const hit=exact[0],page=await get(hit.url);
  if(page==='ERROR')return{...row,status:'ERROR_RETRY',candidate:hit};
  if(!page)return{...row,status:'NO_DATA',candidate:hit};
  const fresh=parseCib(page.text);
  if(!Number.isFinite(fresh)||fresh<=0)return{...row,status:'NO_CIB_DATA',candidate:hit};
  const old=Number(row.market),move=Number.isFinite(old)&&old>0?(fresh-old)/old*100:null;
  const absMove=move==null?null:Math.abs(move);
  const status=absMove!=null&&absMove>maxMovePct?'REVIEW_LARGE_MOVE':absMove!=null&&absMove<0.5?'UNCHANGED':'SAFE_UPDATE';
  return{...row,status,fresh:+fresh.toFixed(2),old:Number.isFinite(old)?+old.toFixed(2):null,movePct:move==null?null:+move.toFixed(1),candidate:hit};
}

const source=audit.prices.filter(r=>r.market!=null).slice(0,limit);
const results=[];
for(let i=0;i<source.length;i++){
  const r=await refreshOne(source[i]);results.push(r);
  console.log(`[${i+1}/${source.length}] ${r.title} -> ${r.status}${r.fresh?` $${r.fresh}`:''}`);
  if(i<source.length-1)await sleep(delayMs);
}

const safe=results.filter(r=>r.status==='SAFE_UPDATE'||r.status==='UNCHANGED');
const changes=results.filter(r=>r.status==='SAFE_UPDATE');
const review=results.filter(r=>r.status.startsWith('REVIEW_'));
const unresolved=results.filter(r=>!['SAFE_UPDATE','UNCHANGED'].includes(r.status)&&!r.status.startsWith('REVIEW_'));
const generatedAt=new Date().toISOString();
const prices=safe.map(r=>({
  t:r.title,m:r.fresh,s:+(r.fresh*.70).toFixed(2),g:+(r.fresh*.85).toFixed(2),x:+(r.fresh*1.10).toFixed(2),
  pc:r.candidate?.title||r.title,c:r.candidate?.region||'PlayStation 4',source:'PriceCharting periodic refresh',refreshedAt:generatedAt
}));
const summary={generatedAt,scanned:results.length,safeImport:prices.length,changed:changes.length,unchanged:safe.length-changes.length,review:review.length,unresolved:unresolved.length,maxMovePct};
fs.writeFileSync(outPath,JSON.stringify({summary,changes,review,unresolved,results},null,2));
fs.writeFileSync(importPath,JSON.stringify({source:'ShelfCheck periodic PriceCharting refresh',generatedAt,prices},null,2));
console.log('\n'+JSON.stringify(summary,null,2));
console.log(`Report: ${path.relative(REPO,outPath)}`);
console.log(`Import: ${path.relative(REPO,importPath)}`);
