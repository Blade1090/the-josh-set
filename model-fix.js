// ShelfCheck model repair: physical products are not identities, and duplicate/variant
// product rows must be merged before deciding what a box satisfies.
let mergedProductIndex=null;
function productKeys(raw,title){
  const out=[];
  const add=v=>{const n=norm(v);if(n&&!out.includes(n))out.push(n);if(n.startsWith('the ')&&!out.includes(n.slice(4)))out.push(n.slice(4));};
  add(title||'');add(String(title||'').replace(/\s*\[[^\]]+\]\s*$/,'').trim());add(raw||'');return out;
}
function ensureMergedProducts(){
  if(mergedProductIndex||!DATA)return mergedProductIndex;
  const groups=new Map(),aliases=new Map();
  for(const [raw,title,ids] of DATA.p){const keys=productKeys(raw,title),canonical=keys.find(k=>!k.includes(' not for resale'))||keys[0];if(!canonical)continue;let g=groups.get(canonical);if(!g){g={key:canonical,title,ids:[],titles:[]};groups.set(canonical,g)}g.ids.push(...(ids||[]));g.titles.push(title);for(const k of keys)aliases.set(k,canonical)}
  for(const [raw,title] of DATA.p){const base=norm(String(title||'').replace(/\s*\[[^\]]+\]\s*$/,'').trim()),exact=norm(title||'');if(base&&exact!==base){const target=aliases.get(base)||base,source=aliases.get(exact);if(source&&source!==target&&groups.has(source)){let t=groups.get(target)||{key:target,title:String(title).replace(/\s*\[[^\]]+\]\s*$/,'').trim(),ids:[],titles:[]},s=groups.get(source);t.ids.push(...s.ids);t.titles.push(...s.titles);groups.set(target,t);groups.delete(source);for(const[k,v]of aliases)if(v===source)aliases.set(k,target)}aliases.set(exact,target);aliases.set(base,target)}}
  mergedProductIndex=new Map();for(const[key,g]of groups){g.ids=[...new Set(g.ids)];mergedProductIndex.set(key,g)}for(const[alias,key]of aliases)if(groups.has(key))mergedProductIndex.set(alias,groups.get(key));return mergedProductIndex;
}
function findProduct(title){const idx=ensureMergedProducts();if(!idx)return null;for(const k of productKeys('',title)){const p=idx.get(k);if(p)return p}return null}
function collectionInfo(x){const p=findProduct(x.title);if(!p)return null;const covered=[...new Set(p.ids)].map(id=>byId.get(id)).filter(g=>g?.set==='INCLUDED');if(covered.length<2)return null;return{product:p,covered,owned:productSet.has(p.key)}}
function acquisitionRank(x,q){const c=collectionInfo(x),st=effectiveStatus(x);if(c&&!c.owned)return 0;if(st==='NEEDED'&&x.set==='INCLUDED')return 1;if(c&&c.owned)return 2;if(st==='OWNED')return 3;return 4}
function preferredCollectionFor(x){
  const idx=ensureMergedProducts(),seen=new Set(),choices=[];
  for(const p of idx.values()){if(seen.has(p.key))continue;seen.add(p.key);const ids=[...new Set(p.ids)].filter(id=>byId.get(id)?.set==='INCLUDED');if(ids.length>1&&ids.includes(x.id))choices.push({p,count:ids.length,owned:productSet.has(p.key)})}
  choices.sort((a,b)=>(a.owned-b.owned)||(b.count-a.count)||a.p.title.localeCompare(b.p.title));return choices[0]||null;
}
function matchingCollectionProducts(q){
  if(!q||filter==='EXCLUDED'||filter==='HUNT')return[];const idx=ensureMergedProducts(),seen=new Set(),out=[];
  for(const p of idx.values()){if(seen.has(p.key))continue;seen.add(p.key);const covered=[...new Set(p.ids)].map(id=>byId.get(id)).filter(x=>x?.set==='INCLUDED');if(covered.length<2)continue;const owned=productSet.has(p.key);if(filter==='OWNED'&&!owned)continue;if(filter==='NEEDED'&&owned)continue;if(!covered.some(x=>x.search.includes(q))&&!norm(p.title).includes(q))continue;out.push({p,covered,owned});}
  return out.sort((a,b)=>(a.owned-b.owned)||(b.covered.length-a.covered.length)||a.p.title.localeCompare(b.p.title));
}
function huntSub(x){const p=priceFor(x),h=typeof hltbFor==='function'?hltbFor(x):null,parts=[];if(p){parts.push(`STRONG ${money(p.s)}`);parts.push(`TARGET ${money(p.g)}`);parts.push(`CIB ${money(p.m)}`)}const hrs=h&&(h.a??h.e??h.c);if(hrs!=null)parts.push(`~${Number(hrs).toFixed(1)}h`);const pref=preferredCollectionFor(x);if(pref&&!pref.owned)parts.push(`collection covers ${pref.count}`);return parts.join(' · ')}
// Default ALL is the actionable shelf. Excluded records only appear when explicitly requested.
// HUNT is the priced acquisition queue: needed games ordered by the cheapest target price.
function render(){
  const q=norm($('#q').value);let all=items.filter(x=>{
    if(q&&!x.search.includes(q))return false;const st=effectiveStatus(x);
    if(filter==='HUNT')return x.set==='INCLUDED'&&st==='NEEDED'&&!!priceFor(x);
    if(filter==='EXCLUDED')return x.set==='EXCLUDED';if(filter==='ALL')return x.set!=='EXCLUDED';return x.set!=='EXCLUDED'&&st===filter;
  });
  if(filter==='HUNT')all.sort((a,b)=>{const pa=priceFor(a),pb=priceFor(b),ta=pa?.g??pa?.m??Infinity,tb=pb?.g??pb?.m??Infinity;return ta-tb||a.title.localeCompare(b.title)});
  else if(q)all.sort((a,b)=>acquisitionRank(a,q)-acquisitionRank(b,q)||a.title.localeCompare(b.title));
  const rows=all.slice(0,visibleLimit),products=matchingCollectionProducts(q),shownProducts=new Set(products.map(c=>c.p.key));
  const productHtml=products.map(c=>`<article class="card"><div class="top"><b>${esc(c.p.title)}</b><span class="badge ${c.owned?'OWNED':'NEEDED'}">${c.owned?'OWNED · COLLECTION':'BEST WAY TO BUY'}</span></div><div class="sub">${c.owned?'On your shelf · ':''}Covers ${c.covered.length} game identities</div></article>`).join('');
  const rowHtml=rows.filter(x=>{const c=collectionInfo(x);return !c||!shownProducts.has(c.product.key)}).map(x=>{const c=collectionInfo(x),st=effectiveStatus(x),pref=!c&&st==='NEEDED'?preferredCollectionFor(x):null;let label,sub;
    if(c){label=c.owned?'OWNED · COLLECTION':'BEST WAY TO BUY';sub=`${c.owned?'On your shelf · ':''}Covers ${c.covered.length} game identities`;}
    else if(filter==='HUNT'){label='TARGET';sub=huntSub(x)}
    else{label=st;sub=st==='OWNED'?'On your shelf':x.set==='EXCLUDED'?'Outside Josh Set':pref?`Look for ${pref.p.title} first · covers ${pref.count}`:'Tap for details';}
    return `<article class="card" onclick="detail(${x.id})"><div class="top"><b>${esc(x.title)}</b><span class="badge ${st}">${label}</span></div><div class="sub">${esc(sub)}</div></article>`}).join('');
  const more=all.length>rows.length?`<button id="loadMore" style="width:100%;margin:14px 0;padding:14px">LOAD MORE · ${rows.length} / ${all.length}</button>`:all.length?`<p class="muted" style="text-align:center">${filter==='HUNT'?'Showing all priced hunt targets.':`Showing all ${all.length} results.`}</p>`:'';
  $('#results').innerHTML=productHtml+rowHtml+more||'<p class="muted">Nothing matched.</p>';const b=$('#loadMore');if(b)b.onclick=()=>{visibleLimit+=100;render()};
}
async function importCSV(f){
  const rows=parseCSV(await f.text()),h=rows.shift()||[],ix=Object.fromEntries(h.map((x,i)=>[x,i]));const owned=new Set(),ownedProducts=new Set(),unmatched=[];let titles=0,excluded=0;const idx=ensureMergedProducts();
  for(const r of rows){const platform=(r[ix.Platform]||'').trim().toLowerCase(),cat=(r[ix.Category]||'').trim().toLowerCase(),typ=(r[ix.UserRecordType]||'Owned').trim().toLowerCase();if(!['sony playstation 4','playstation 4','ps4'].includes(platform)||cat!=='games'||typ!=='owned')continue;titles++;const title=r[ix.Title]||'',cs=candidates(title);let hit=false;
    for(const c of cs){const keys=productKeys(c,c);let p=null;for(const k of keys){p=idx?.get(k);if(p)break}if(!p)continue;const includedIds=[...new Set(p.ids)].filter(id=>byId.get(id)?.set==='INCLUDED');if(includedIds.length){includedIds.forEach(id=>owned.add(id));ownedProducts.add(p.key);hit=true;break}}
    if(!hit)for(const c of cs){const ids=items.filter(x=>x.set==='INCLUDED'&&(norm(x.title)===c||(aliasesById.get(x.id)||[]).includes(c))).map(x=>x.id);if(ids.length){owned.add(ids[0]);hit=true;break}}
    if(!hit){const isExcluded=cs.some(c=>items.some(x=>x.set==='EXCLUDED'&&(norm(x.title)===c||(aliasesById.get(x.id)||[]).includes(c))));if(isExcluded){excluded++;hit=true}}if(!hit)unmatched.push(title)}
  saveState({...stateCache,version:11,owned:[...owned],products:[...ownedProducts],source:f.name});progress();resetBrowse();$('#syncmsg').textContent=`GameEye: ${titles} PS4 rows → ${[...owned].filter(id=>byId.get(id)?.set==='INCLUDED').length} satisfied · ${ownedProducts.size} collection products · ${excluded} excluded · ${unmatched.length} unresolved.`;if(unmatched.length)console.warn('Unmatched',unmatched);
}