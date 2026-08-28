// ShelfCheck v0.40 — pricing audit census repair.
// PriceCharting negative-space review exposed six legitimate PS4 physical identities
// missing from the census. This pass adds them with product-level corroboration and
// retires the duplicate Sexy Brutale physical-edition identity.
(()=>{
  let tries=0;
  const ADD=[
    [2266,'DUSK','https://newbloodstore.com/products/dusk-for-ps4-physical-edition'],
    [2267,'Hot Wheels Unleashed','https://www.bestbuy.com/product/hot-wheels-unleashed-playstation-4/J3LZT8T3Y4'],
    [2268,'In Nightmare','https://www.bestbuy.com/product/in-nightmare-playstation-4/J3LPLGSC8Q'],
    [2269,'Risen','https://thqnordic.com/news/the-time-has-come-risen-is-out-now-on-playstation-4-xbox-one-and-nintendo-switch'],
    [2270,'Saints Row','https://www.bestbuy.com/product/saints-row-standard-edition-playstation-4/6478100'],
    [2271,'Construction Simulator','https://www.doesitplay.org/game/Construction%20Simulator/ps4/PS4%20Pro?region=PAL&version=Day+One+Edition']
  ];
  const apply=()=>{
    tries++;
    if(typeof norm!=='function'||!Array.isArray(items)||!items.length||!DATA||typeof byId==='undefined'){if(tries<120)setTimeout(apply,100);return;}
    const added=[];
    for(const [id,title,source] of ADD){
      let x=byId.get(id)||items.find(g=>norm(g.title)===norm(title));
      if(!x){x={id,title,set:'INCLUDED',baseline:'NEEDED',strong:null,target:null,max:null,search:norm(title),auditSource:source};items.push(x);byId.set(id,x);added.push(title);}
      else if(x.set!=='INCLUDED'){x.set='INCLUDED';x.auditSource=source;added.push(title);}
    }
    // Full House Edition is the physical edition of The Sexy Brutale, not a second playable identity.
    const base=items.find(x=>norm(x.title)===norm('The Sexy Brutale'));
    const edition=items.find(x=>norm(x.title)===norm('Sexy Brutale: Full House Edition'));
    if(base&&edition&&edition.set==='INCLUDED'){
      const inherited=typeof ownedSet!=='undefined'&&ownedSet.has(edition.id);
      edition.set='EXCLUDED';edition.cleanupReason='Physical edition/product of The Sexy Brutale; not a separate playable identity.';
      if(inherited&&typeof stateCache!=='undefined'&&stateCache){const s=new Set(stateCache.owned||[]);s.delete(edition.id);s.add(base.id);stateCache.owned=[...s];if(typeof saveState==='function')saveState(stateCache);}
      // Keep the physical edition searchable/importable as a product satisfying the base identity.
      if(Array.isArray(DATA.p)&&!DATA.p.some(p=>norm(p?.[1])===norm('The Sexy Brutale: Full House Edition')))DATA.p.push(['the sexy brutale full house edition','The Sexy Brutale: Full House Edition',[base.id]]);
      if(typeof reverseProducts!=='undefined'){if(!reverseProducts.has(base.id))reverseProducts.set(base.id,[]);if(!reverseProducts.get(base.id).includes('The Sexy Brutale: Full House Edition'))reverseProducts.get(base.id).push('The Sexy Brutale: Full House Edition');}
      if(typeof mergedProductIndex!=='undefined')mergedProductIndex=null;
    }
    DATA.n=items.filter(x=>x.set==='INCLUDED').length;
    if(typeof progress==='function')progress();if(typeof resetBrowse==='function')resetBrowse();
    window.SHELFCHECK_V040_CENSUS={added,denominator:DATA.n,retiredEdition:edition?.title||null};
    console.info(`ShelfCheck v0.40 pricing audit: ${added.length} missing identities added; denominator ${DATA.n}`);
  };
  apply();
})();
