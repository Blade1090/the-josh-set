// ShelfCheck v0.37 PriceCharting CSV pipeline.
// Accepts the native Collector CSV directly, reconciles rows to Josh identities,
// prefers North American PS4 pricing when multiple regional rows exist, and stores
// a canonical local price profile so pricing survives reloads.
function pcNormTitle(s){
  let n=norm(s);
  if(n.startsWith('the '))n=n.slice(4);
  return n;
}
const PC_SUFFIXES=[
  'game of the year edition','game of the year','goty edition','definitive edition',
  'complete edition','deluxe edition','ultimate edition','limited edition',
  'collectors edition','collector s edition','collector edition','day one edition',
  'special edition','anniversary edition','playstation hits','greatest hits',
  'steelbook edition','full house edition'
];
function pcTitleVariants(raw){
  const out=[];
  const add=v=>{const n=pcNormTitle(v);if(n&&!out.includes(n))out.push(n)};
  add(raw);
  add(String(raw||'').replace(/\s*\[[^\]]+\]\s*$/,'').trim());
  for(const seed of [...out])for(const s of PC_SUFFIXES)if(seed.endsWith(' '+s))add(seed.slice(0,-s.length-1));
  return out;
}
function pcIdentityIndex(){
  const idx=new Map();
  const add=(k,id)=>{if(!k)return;let a=idx.get(k);if(!a)idx.set(k,a=[]);if(!a.includes(id))a.push(id)};
  for(const x of items){
    if(x.set!=='INCLUDED')continue;
    add(pcNormTitle(x.title),x.id);
    for(const a of aliasesById.get(x.id)||[])add(pcNormTitle(a),x.id);
  }
  return idx;
}
function pcRegionRank(c){c=String(c||'').toLowerCase();return c==='playstation 4'?0:c==='pal playstation 4'?1:2}
function pcNumberTokens(s){return (pcNormTitle(s).match(/\b\d+\b/g)||[]).join('|')}
function pcEdit(a,b){
  if(a===b)return 0;if(!a.length)return b.length;if(!b.length)return a.length;
  if(Math.abs(a.length-b.length)>3)return 99;
  let prev=Array.from({length:b.length+1},(_,i)=>i),cur=new Array(b.length+1);
  for(let i=1;i<=a.length;i++){
    cur[0]=i;let rowMin=cur[0];
    for(let j=1;j<=b.length;j++){cur[j]=Math.min(cur[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));if(cur[j]<rowMin)rowMin=cur[j]}
    if(rowMin>3)return 99;[prev,cur]=[cur,prev];
  }
  return prev[b.length];
}
function pcFuzzyMatch(raw,idx){
  const q=pcNormTitle(raw);if(q.length<8)return null;
  const qNums=pcNumberTokens(raw);let best=null,second=99;
  for(const [k,ids] of idx){
    if(ids.length!==1)continue;
    if(qNums!==pcNumberTokens(k))continue;
    const compactQ=q.replaceAll(' ',''),compactK=k.replaceAll(' ','');
    const maxEdit=Math.max(compactQ.length,compactK.length)<=14?1:2;
    const d=pcEdit(compactQ,compactK);if(d>maxEdit)continue;
    if(!best||d<best.d){second=best?.d??99;best={id:ids[0],d}}else if(d<second)second=d;
  }
  return best&&best.d<second?best.id:null;
}
function pcMatchRow(raw,idx){
  let hits=new Set();
  for(const v of pcTitleVariants(raw))for(const id of idx.get(v)||[])hits.add(id);
  if(hits.size===1)return{identityId:[...hits][0],method:'title'};
  if(hits.size>1)return{identityId:null,method:'ambiguous'};
  const fuzzy=pcFuzzyMatch(raw,idx);return fuzzy?{identityId:fuzzy,method:'fuzzy'}:{identityId:null,method:'unmatched'};
}
function pcProfileFor(identityId,market,sourceTitle,consoleName){
  const x=byId.get(identityId),m=Number(market);
  if(!x||!Number.isFinite(m)||m<=0)return null;
  return {t:x.title,m:+m.toFixed(2),s:+(m*.70).toFixed(2),g:+(m*.85).toFixed(2),x:+(m*1.10).toFixed(2),pc:sourceTitle,c:consoleName};
}
async function importPrices(f){
  const text=await f.text();
  // Existing ShelfCheck JSON profile remains supported.
  if(f.name.toLowerCase().endsWith('.json')||text.trim().startsWith('{')){
    try{const d=JSON.parse(text);if(!Array.isArray(d.prices))throw 0;saveState({...stateCache,version:12,prices:d.prices,priceSource:d.source||f.name});resetBrowse();$('#syncmsg').textContent=`Prices: ${d.prices.length} verified CIB profiles loaded locally.`;return}catch{}
  }
  try{
    const rows=parseCSV(text),h=rows.shift()||[],ix=Object.fromEntries(h.map((x,i)=>[String(x).trim().toLowerCase(),i]));
    if(ix['product-name']==null||ix['console-name']==null||ix['price-in-pennies']==null)throw 0;
    const idx=pcIdentityIndex(),best=new Map();let ps4Rows=0,unmatched=0,ambiguous=0,fuzzy=0;
    for(const r of rows){
      const consoleName=(r[ix['console-name']]||'').trim();if(!consoleName.toLowerCase().includes('playstation 4'))continue;ps4Rows++;
      const sourceTitle=(r[ix['product-name']]||'').trim(),pennies=Number(r[ix['price-in-pennies']]);if(!sourceTitle||!Number.isFinite(pennies)||pennies<=0)continue;
      const hit=pcMatchRow(sourceTitle,idx);if(!hit.identityId){if(hit.method==='ambiguous')ambiguous++;else unmatched++;continue}if(hit.method==='fuzzy')fuzzy++;
      const score=[pcRegionRank(consoleName),hit.method==='title'?0:1,pcTitleVariants(sourceTitle).includes(pcNormTitle(byId.get(hit.identityId)?.title))?0:1,sourceTitle.length];
      const old=best.get(hit.identityId);if(!old||score.join('|')<old.score.join('|'))best.set(hit.identityId,{score,profile:pcProfileFor(hit.identityId,pennies/100,sourceTitle,consoleName)});
    }
    const prices=[...best.values()].map(v=>v.profile).filter(Boolean).sort((a,b)=>a.t.localeCompare(b.t));
    saveState({...stateCache,version:12,prices,priceSource:f.name,priceImportedAt:new Date().toISOString()});
    resetBrowse();
    $('#syncmsg').textContent=`PriceCharting: ${ps4Rows} PS4 rows → ${prices.length} Josh identities priced · ${fuzzy} typo/format repairs · ${ambiguous} ambiguous · ${unmatched} unmatched.`;
  }catch(e){console.error(e);$('#syncmsg').textContent='Could not read that PriceCharting export.'}
}
function advice(x,p){
  if(status(x)==='OWNED')return['SKIP','Already owned.'];if(x.set!=='INCLUDED')return['SKIP','Not part of the Josh Set.'];
  const pr=priceFor(x),m=Number(pr?.m),price=Number(p);if(!Number.isFinite(price))return['ENTER PRICE','Type the store price first.'];
  if(Number.isFinite(m)&&m>0){
    const delta=price-m,pct=delta/m*100,rel=Math.abs(delta)<.005?'at market':`${money(Math.abs(delta))} · ${Math.abs(pct).toFixed(0)}% ${delta<0?'under':'over'} market`;
    if(price<=m*.70)return['GRAB IT',`${rel}. CIB market ${money(m)}.`];
    if(price<=m*.85)return['GOOD BUY',`${rel}. CIB market ${money(m)}.`];
    if(price<=m*1.05)return['FAIR PRICE',`${rel}. CIB market ${money(m)}.`];
    return['WAIT',`${rel}. CIB market ${money(m)}.`];
  }
  return['NEED IT','You need it; no verified CIB market match yet.'];
}
