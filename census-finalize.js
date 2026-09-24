// ShelfCheck census finalization -- the single deterministic point where every
// census-mutating script's queued change is applied, in a fixed two-phase order
// (every addition/reinstatement first, then every eligibility/dedup exclusion rule),
// exactly once per load.
//
// This tag is placed after every census-mutating <script> tag above it, so by the time
// it runs, all of them have already synchronously registered into censusQueue (see
// app.js) regardless of how far the census data fetch has progressed. The only real
// wait left is for that fetch/decompress to finish, which this awaits directly via
// dataReady instead of polling -- so the result no longer depends on script or network
// timing: the exclude phase always sees the complete candidate set the add phase built,
// so a later script can never leave a should-be-excluded identity INCLUDED just because
// it happened to be added after cleanup already ran.
(async()=>{
  await dataReady;
  for(const fn of censusQueue.add)fn();
  for(const fn of censusQueue.exclude)fn();
  censusQueue.add.length=0;
  censusQueue.exclude.length=0;

  // Final 2026-09-23 curator language-accessibility decisions. These five PS4 identities
  // have physical routes, but the qualifying releases are not English-accessible enough
  // for the Josh Set. Keep the identities in the census history; exclude them from the
  // active denominator rather than deleting them.
  const languageCuts=[
    'God Eater Resurrection',
    'Atelier Ayesha: The Alchemist of Dusk DX',
    'Atelier Escha & Logy: Alchemists of the Dusk Sky DX',
    'Atelier Shallie: Alchemists of the Dusk Sea DX',
    'Occultic;Nine'
  ];
  const appliedLanguageCuts=[];
  for(const title of languageCuts){
    const x=items.find(v=>norm(v.title)===norm(title));
    if(!x){console.warn(`ShelfCheck final language cut: identity not found: ${title}`);continue;}
    x.set='EXCLUDED';
    x.cleanupReason='LANGUAGE_BARRIER — qualifying PS4 physical route is not English-accessible enough for the Josh Set; curator decision 2026-09-23.';
    appliedLanguageCuts.push(x.title);
  }
  window.SHELFCHECK_FINAL_LANGUAGE_CUTS={excluded:appliedLanguageCuts};

  // Catlateral model repair: the original Catlateral Damage PS4 identity is digital-only.
  // The qualifying physical PS4 product is the rebuilt Catlateral Damage: Remeowstered,
  // which is a distinct playable identity. Keep the old row as excluded history, add the
  // physical identity separately, and seed its verified CIB value so it is never pending.
  const oldCat=byId.get(237)||items.find(v=>norm(v.title)===norm('Catlateral Damage'));
  if(oldCat){
    oldCat.set='EXCLUDED';
    oldCat.cleanupReason='DIGITAL_ONLY_ORIGINAL — original Catlateral Damage PS4 release is digital-only; physical PS4 coverage belongs to the distinct rebuilt Catlateral Damage: Remeowstered identity.';
  }
  const REMEOWSTERED_ID=2787;
  let cat=byId.get(REMEOWSTERED_ID)||items.find(v=>norm(v.title)===norm('Catlateral Damage: Remeowstered'));
  if(!cat){
    const title='Catlateral Damage: Remeowstered';
    cat={
      id:REMEOWSTERED_ID,title,set:'INCLUDED',baseline:'NEEDED',strong:null,target:null,max:24.99,
      search:norm(`${title} Catlateral Damage`),
      auditSource:'Identity-model repair 2026-09-23: physical PS4 release is Catlateral Damage: Remeowstered, distinct from the digital-only original; verified CIB $24.99.'
    };
    items.push(cat);byId.set(cat.id,cat);
  }else{
    cat.set='INCLUDED';
    if(!(Number(cat.max)>0))cat.max=24.99;
  }
  if(Array.isArray(DATA?.a)&&!DATA.a.some(r=>r?.[1]===REMEOWSTERED_ID&&norm(r?.[0])===norm('Catlateral Damage'))){
    DATA.a.push(['Catlateral Damage',REMEOWSTERED_ID]);
  }
  if(typeof aliasesById!=='undefined'){
    if(!aliasesById.has(REMEOWSTERED_ID))aliasesById.set(REMEOWSTERED_ID,[]);
    const aliases=aliasesById.get(REMEOWSTERED_ID);
    if(!aliases.includes(norm('Catlateral Damage')))aliases.push(norm('Catlateral Damage'));
  }
  const productTitle='Catlateral Damage: Remeowstered';
  if(Array.isArray(DATA?.p)&&!DATA.p.some(r=>norm(r?.[0])===norm(productTitle)||norm(r?.[1])===norm(productTitle))){
    DATA.p.push([productTitle,productTitle,[REMEOWSTERED_ID]]);
  }
  if(typeof productMap!=='undefined'&&typeof reverseProducts!=='undefined'){
    const key=norm(productTitle),p={key,title:productTitle,ids:[REMEOWSTERED_ID]};
    productMap.set(key,p);
    reverseProducts.set(REMEOWSTERED_ID,[productTitle]);
  }
  window.SHELFCHECK_CATLATERAL_REPAIR={excludedOriginal:!!oldCat,addedIdentity:cat.title,id:cat.id,price:cat.max};

  DATA.n=items.filter(x=>x.set==="INCLUDED").length;
  censusFinalized=true;
  if(typeof mergedProductIndex!=="undefined")mergedProductIndex=null;
  if(typeof progress==="function")progress();
  if(typeof resetBrowse==="function")resetBrowse();
  window.SHELFCHECK_CENSUS_FINALIZED={included:DATA.n,at:Date.now()};
  console.info(`ShelfCheck census finalized deterministically; denominator ${DATA.n}`);
})();
