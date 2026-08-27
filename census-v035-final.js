// ShelfCheck v0.35 final structural repair.
// A physical compilation is a product; its separately playable games are identities.
(()=>{
 let tries=0;
 const apply=()=>{
  tries++;
  if(typeof norm!=='function'||!Array.isArray(items)||!items.length||!DATA||typeof byId==='undefined'||typeof productMap==='undefined'){if(tries<120)setTimeout(apply,100);return;}
  const findTitle=t=>items.find(x=>norm(x.title)===norm(t)&&x.set==='INCLUDED');
  // Find the legacy two-game identity wrapper, but never mistake the three-game Quantic Dream Collection for it.
  const wrapper=items.find(x=>{const k=norm(x.title);return x.set==='INCLUDED'&&k.includes('heavy rain')&&k.includes('beyond')&&!k.includes('quantic dream')&&!k.includes('detroit');});
  let heavy=findTitle('Heavy Rain'),beyond=findTitle('Beyond: Two Souls');
  const inheritedOwned=!!(wrapper&&typeof ownedSet!=='undefined'&&ownedSet.has(wrapper.id));
  const add=(id,title)=>{let x=byId.get(id)||findTitle(title);if(!x){x={id,title,set:'INCLUDED',baseline:'NEEDED',strong:null,target:null,max:null,search:norm(title)};items.push(x);byId.set(id,x);}return x;};
  heavy=heavy||add(2264,'Heavy Rain');
  beyond=beyond||add(2265,'Beyond: Two Souls');
  if(wrapper){
    wrapper.set='EXCLUDED';wrapper.cleanupReason='Compilation/product wrapper; Heavy Rain and Beyond: Two Souls are separate playable identities.';
    // Keep the box searchable as a product, but remove the retired wrapper identity from search/results.
    const ptitle=wrapper.title;
    const p={key:norm(ptitle),title:ptitle,ids:[heavy.id,beyond.id]};productMap.set(p.key,p);if(p.key.startsWith('the '))productMap.set(p.key.slice(4),p);
    for(const id of p.ids){if(!reverseProducts.has(id))reverseProducts.set(id,[]);if(!reverseProducts.get(id).includes(ptitle))reverseProducts.get(id).push(ptitle);}
    if(inheritedOwned&&typeof stateCache!=='undefined'&&stateCache){const s=new Set(stateCache.owned||[]);s.delete(wrapper.id);s.add(heavy.id);s.add(beyond.id);stateCache.owned=[...s];if(typeof saveState==='function')saveState(stateCache);}
  }
  // If the physical product itself is marked owned, both identities are satisfied even when the old wrapper ID was already retired by another cleanup pass.
  if(typeof productSet!=='undefined'&&typeof stateCache!=='undefined'&&stateCache){
    const ownedProduct=[...productSet].some(k=>{const n=norm(k);return n.includes('heavy rain')&&n.includes('beyond')&&!n.includes('quantic dream')&&!n.includes('detroit');});
    if(ownedProduct){const s=new Set(stateCache.owned||[]);s.add(heavy.id);s.add(beyond.id);stateCache.owned=[...s];if(typeof saveState==='function')saveState(stateCache);}
  }
  DATA.n=items.filter(x=>x.set==='INCLUDED').length;
  if(typeof progress==='function')progress();if(typeof resetBrowse==='function')resetBrowse();
  console.info(`ShelfCheck v0.35 final structural repair applied; denominator ${DATA.n}`);
 };
 apply();
})();