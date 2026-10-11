// ShelfCheck physical GameEye reconciliation — October 11, 2026.
// These are two separately owned NA physical PS4 games. The GameEye packaging
// titles differ from the playable identity titles. Reuse an existing INCLUDED
// identity when available, adding an identity only if the census omitted it.
// The existing gameeye-reconcile-v001.js then repairs persisted unresolved rows
// on the next page load: no second CSV upload is required.
(()=>{
  registerCensusMutation('add',()=>{
    const sources=[
      {
        source:'Roman Rumble in Las Vegum - Asterix & Obelix XXL 2',
        canonical:'Asterix & Obelix XXL 2',
        fallbackId:2796,
        isMatch:title=>{
          const n=norm(title);
          return n.includes('asterix and obelix')&&/\bxxl ?2\b/.test(n);
        },
        evidence:'GameEye CIB row, 2026-10-11: United States, Official, Anuman Interactive / OSome Studio.'
      },
      {
        source:'Zombie Vikings: Ragnarök Edition',
        canonical:'Zombie Vikings',
        fallbackId:2797,
        isMatch:title=>{
          const n=norm(title);
          return n==='zombie vikings'||n.startsWith('zombie vikings ');
        },
        evidence:'GameEye CIB row, 2026-10-11: United States, Official, Rising Star Games / Zoink!; physical Ragnarök Edition.'
      }
    ];
    const results=[];
    for(const s of sources){
      const matching=items.filter(x=>s.isMatch(x.title));
      const eligible=matching.filter(x=>x.set==='INCLUDED');
      let x;
      if(eligible.length===1){
        x=eligible[0];
      }else if(eligible.length>1){
        console.warn('ShelfCheck Oct 11: ambiguous playable identities, review required',s.source,eligible.map(y=>y.title));
        results.push({source:s.source,status:'AMBIGUOUS'});
        continue;
      }else if(matching.length){
        // Preserve deliberate EXCLUDED decisions. Do not silently reinstate them.
        console.warn('ShelfCheck Oct 11: matching identity is EXCLUDED, curator review required',s.source,matching.map(y=>y.title));
        results.push({source:s.source,status:'EXCLUDED_REVIEW'});
        continue;
      }else{
        if(byId.has(s.fallbackId)){
          console.error('ShelfCheck Oct 11: reserved identity ID already taken',s.fallbackId,s.source);
          results.push({source:s.source,status:'ID_COLLISION'});
          continue;
        }
        x={
          id:s.fallbackId,title:s.canonical,set:'INCLUDED',baseline:'NEEDED',
          strong:null,target:null,max:null,search:norm(s.canonical),
          auditSource:s.evidence
        };
        items.push(x);
        byId.set(x.id,x);
      }
      const a=norm(s.source);
      if(!aliasesById.has(x.id))aliasesById.set(x.id,[]);
      const aliases=aliasesById.get(x.id);
      if(!aliases.includes(a))aliases.push(a);
      if(Array.isArray(DATA?.a)&&!DATA.a.some(r=>r?.[1]===x.id&&norm(r?.[0])===a)){
        DATA.a.push([s.source,x.id]);
      }
      if(!(x.search||'').includes(a))x.search=(x.search||norm(x.title))+' '+a;
      results.push({source:s.source,status:matching.length?'ALIASED':'ADDED',id:x.id,identity:x.title});
    }
    window.SHELFCHECK_GAMEEYE_OCT11_REPAIR=results;
    console.info('ShelfCheck Oct 11 GameEye ownership repair',results);
  });
})();
