import fs from 'node:fs';

const input=process.argv[2]||'gameye-hltb.json';
const canonicalPath=process.argv[3]||'audit-out/canonical-live.json';
const outPath=process.argv[4]||'hltb-gameye-v067.js';
const reviewPath=process.argv[5]||'audit-out/gameye-hltb-review.json';

const norm=s=>String(s??'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’'`]/g,'').replace(/&/g,' and ').match(/[a-z0-9]+/g)?.join(' ')||'';
const stripEdition=s=>String(s??'').replace(/\s*\[[^\]]+\]\s*$/,'').replace(/\s*\((?:ps4|playstation 4)\)\s*$/i,'').trim();
const canonical=JSON.parse(fs.readFileSync(canonicalPath,'utf8')).filter(x=>x.set==='INCLUDED');
const source=JSON.parse(fs.readFileSync(input,'utf8'));
const byNorm=new Map();
for(const x of canonical){const k=norm(x.title);if(!byNorm.has(k))byNorm.set(k,[]);byNorm.get(k).push(x)}

const accepted=[],review=[];
for(const g of source){
  const platform=String(g.platform||'');
  if(platform && !/(sony )?playstation 4|\bps4\b/i.test(platform)){review.push({...g,reason:'NON_PS4'});continue}
  const title=stripEdition(g.title);
  const hits=byNorm.get(norm(title))||[];
  const avg=Number(g.averagePlaytime ?? g.average ?? g.main);
  const comp=Number(g.completionist ?? g.complete);
  if(!Number.isFinite(avg) && !Number.isFinite(comp)){review.push({...g,reason:'NO_PLAYTIME'});continue}
  if(hits.length!==1){review.push({...g,reason:hits.length?'AMBIGUOUS_CANONICAL':'NO_CANONICAL_MATCH',canonical:hits.map(x=>x.title)});continue}
  const x=hits[0];
  accepted.push({id:x.id,title:x.title,a:Number.isFinite(avg)?avg:null,c:Number.isFinite(comp)?comp:null,gameyeId:g.gameyeId??g.id??null,gameyeTitle:g.title,region:g.region??null,confidence:'EXACT_NORMALIZED_PS4'});
}

accepted.sort((a,b)=>a.id-b.id);
fs.mkdirSync('audit-out',{recursive:true});
fs.writeFileSync(reviewPath,JSON.stringify(review,null,2));
fs.writeFileSync('audit-out/gameye-hltb-accepted.json',JSON.stringify(accepted,null,2));
const rows=accepted.map(x=>[x.title,x.a,null,x.c,`GAMEYE:${x.gameyeId??'PUBLIC'}:EXACT_PS4`]);
const js=`// ShelfCheck v0.67 GAMEYE-backed HLTB bridge. Generated; exact normalized PS4 matches only.\n(()=>{const rows=${JSON.stringify(rows)};let tries=0,t=setInterval(()=>{if(typeof HLTB==='undefined'||typeof norm!=='function'||!hltbReady){if(++tries>200)clearInterval(t);return}clearInterval(t);let n=0;for(const [title,a,e,c,q] of rows){const k=norm(title),old=HLTB.get(k)||{},d={...old,t:title};if(old.a==null&&a!=null)d.a=a;if(old.e==null&&e!=null)d.e=e;if(old.c==null&&c!=null)d.c=c;d.gameye=q;HLTB.set(k,d);n++}console.info('ShelfCheck GAMEYE HLTB v0.67 applied:',n,'records');},50)})();\n`;
fs.writeFileSync(outPath,js);
console.log(JSON.stringify({source:source.length,accepted:accepted.length,review:review.length,outPath,reviewPath},null,2));
