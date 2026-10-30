// ShelfCheck — GameEye reconciliation of three physical PS4 releases, 2026-10-29.
// These are distinct game identities absent from the base census (not bonus editions).
// Keep the normal physical-product / game-identity separation. Existing INCLUDED or
// EXCLUDED decisions win; never overwrite them, and refuse ambiguous title/ID collisions.
// The existing saved-unresolved reconciliation fixes the three owned rows on next load,
// without asking Josh to re-import the same GameEye CSV.
(()=>{
  registerCensusMutation('add',()=>{
    const missing=[
      {
        id:2800,title:"Babylon's Fall",
        evidence:'Official physical PS4 release (Square Enix/PlatinumGames, 2022). The online-only game became unplayable when its servers closed on 2023-02-27 PT. Physical ownership still represents one historical PS4 identity; no standalone edition bonus. Sources: platinumgames.com/works/babylons-fall and platinumgames.com/official-blog/article/12242.'
      },
      {
        id:2801,title:'Curse of the Sea Rats',
        evidence:'Verified official PQube PS4 physical retail copy; GameStop PS4 listing 355887. GameEye owned CIB row from 2026-10-29 export.'
      },
      {
        id:2802,title:'Willy Morgan and the Curse of Bone Town',
        evidence:'Verified official GS2 Games PS4 physical retail copy; GameStop PS4 listing 349185. GameEye owned CIB row from 2026-10-29 export.'
      }
    ];
    const results=[];
    for(const s of missing){
      const key=norm(s.title),matching=items.filter(x=>norm(x.title)===key);
      if(matching.length>1){
        console.warn('ShelfCheck Oct 29: duplicate identity title, skipped',s.title,matching);
        results.push({title:s.title,status:'AMBIGUOUS_TITLE'});continue;
      }
      let x=matching[0];
      if(x&&x.set!=='INCLUDED'){
        console.warn('ShelfCheck Oct 29: existing exclusion requires curator review',s.title,x);
        results.push({title:s.title,status:'EXCLUDED_REVIEW'});continue;
      }
      if(!x){
        if(byId.has(s.id)){
          console.error('ShelfCheck Oct 29: reserved identity ID occupied',s.id,s.title);
          results.push({title:s.title,status:'ID_COLLISION'});continue;
        }
        x={id:s.id,title:s.title,set:'INCLUDED',baseline:'NEEDED',
           strong:null,target:null,max:null,search:key,auditSource:s.evidence};
        items.push(x);byId.set(x.id,x);
      }
      // An owned game is a physical product satisfying exactly one identity.
      // The canonical product makes the GameEye audit traceable and prevents
      // the importer from treating a game as a compilation or bonus edition.
      if(!DATA.p.some(p=>norm(p?.[0])===key||norm(p?.[1])===key))
        DATA.p.push([s.title,s.title,[x.id]]);
      const p={key,title:s.title,ids:[x.id]};
      if(!productMap.has(key))productMap.set(key,p);
      if(!reverseProducts.has(x.id))reverseProducts.set(x.id,[s.title]);
      results.push({title:s.title,status:matching.length?'EXISTING_INCLUDED':'ADDED',id:x.id});
    }
    window.SHELFCHECK_GAMEEYE_OCT29_REPAIR=results;
    console.info('ShelfCheck Oct 29 GameEye missing-identity repair',results);
  });
})();
