// ShelfCheck physical omission pass v0.10 — Persona 5 Tactica (PS4), October 24, 2026.
// Verified retail North-American PS4 disc, NOT a PS5-only or digital-only release:
// GameStop PS4 Launch Edition, UPC 730865220618; Sega/Atlus, Nov 17, 2023.
// PriceCharting PS4 product 5864129 records a CIB market snapshot of $15.01
// on 2026-10-24. Launch Edition is packaging of the same playable identity.
(()=>{
  registerCensusMutation('add',()=>{
    const title='Persona 5 Tactica', id=2799, key=norm(title);
    const existing=items.filter(x=>norm(x.title)===key);
    if(existing.length>1){
      console.error('ShelfCheck Persona 5 Tactica: duplicate canonical identities; refusing additional entry',existing);
      window.SHELFCHECK_PERSONA_5_TACTICA_REPAIR={status:'AMBIGUOUS'};
      return;
    }
    let x=existing[0];
    if(!x){
      if(byId.has(id)){
        console.error('ShelfCheck Persona 5 Tactica: reserved id 2799 already occupied; refusing overwrite');
        window.SHELFCHECK_PERSONA_5_TACTICA_REPAIR={status:'ID_COLLISION'};
        return;
      }
      x={
        id,title,set:'INCLUDED',baseline:'NEEDED',strong:null,target:null,max:15.01,
        search:key,
        priceSource:'PriceCharting PS4 product 5864129 — CIB $15.01 on 2026-10-24 (market snapshot; imported/updated verified prices take priority).',
        auditSource:'Verified North-American physical PS4 retail release, 2023-11-17; Sega/Atlus Persona 5 Tactica Launch Edition, UPC 730865220618. GameStop lists PS4 disc SKU and PriceCharting lists the PS4 physical product.'
      };
      items.push(x);
      byId.set(id,x);
    }else if(x.set==='EXCLUDED'){
      // A confirmed retail PS4 disc qualifies under the Josh Set's physical rule.
      x.set='INCLUDED';
      x.cleanupReason=undefined;
      x.auditSource='Reinstated 2026-10-24: verified NA physical PS4 retail disc (GameStop UPC 730865220618; PriceCharting product 5864129).';
    }
    if(!(Number(x.max)>0)){
      x.max=15.01;
      x.priceSource='PriceCharting PS4 product 5864129 — CIB $15.01 on 2026-10-24.';
    }
    // GameEye may label the retail box "Launch Edition"; never count it separately.
    const aliases=['Persona 5 Tactica Launch Edition','Persona 5 Tactica [Launch Edition]'];
    if(!aliasesById.has(x.id))aliasesById.set(x.id,[]);
    for(const alias of aliases){
      const a=norm(alias);
      if(!aliasesById.get(x.id).includes(a))aliasesById.get(x.id).push(a);
      if(!DATA.a.some(r=>r?.[1]===x.id&&norm(r?.[0])===a))DATA.a.push([alias,x.id]);
      if(!(x.search||'').includes(a))x.search=(x.search||key)+' '+a;
    }
    const status=existing.length?'REINSTATED_OR_VERIFIED':'ADDED';
    window.SHELFCHECK_PERSONA_5_TACTICA_REPAIR={status,id:x.id,title:x.title,aliases,priceCib:x.max};
    console.info('ShelfCheck Persona 5 Tactica physical PS4 reconciliation',window.SHELFCHECK_PERSONA_5_TACTICA_REPAIR);
  });
})();
