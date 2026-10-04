// ShelfCheck physical-omission pass v0.05 — Diablo IV PS4 physical identity.
//
// Josh's 2026-10-03 owned copy is a North-American ESRB PS4 "Cross-Gen Bundle" physical
// release. ShelfCheck had no Diablo IV identity at all, so GameEye could not reconcile the
// owned row and search returned only Diablo III. This adds the playable identity once; the
// Cross-Gen Bundle wording is packaging for the same game, not a second completion identity.
(()=>{
  registerCensusMutation('add',()=>{
    const added=[];
    const existing=items.find(x=>norm(x.title)===norm('Diablo IV'));
    let x=existing||null;

    if(!x){
      if(byId.has(2790)){
        console.error('ShelfCheck physical omission v0.05: id 2790 already exists; refusing to add Diablo IV.');
        return;
      }
      x={
        id:2790,
        title:'Diablo IV',
        set:'INCLUDED',
        baseline:'NEEDED',
        strong:null,
        target:null,
        max:null,
        search:norm('Diablo IV'),
        auditSource:'Confirmed qualifying physical PS4 release from Josh\'s owned North-American ESRB copy photographed 2026-10-03: PS4 Cross-Gen Bundle box, physical disc release, PS5 upgrade supported. One playable Diablo IV identity; Cross-Gen Bundle is packaging, not a separate identity.'
      };
      items.push(x);
      byId.set(x.id,x);
      added.push(x.title);
    }

    const aliases=[
      'Diablo IV: Cross-Gen Bundle',
      'Diablo IV - Cross-Gen Bundle',
      'Diablo IV [Cross-Gen Bundle]',
      'Diablo IV Cross-Gen Bundle',
      'Diablo 4',
      'Diablo 4: Cross-Gen Bundle',
      'Diablo 4 [Cross-Gen Bundle]'
    ];
    if(!aliasesById.has(x.id))aliasesById.set(x.id,[]);
    const bucket=aliasesById.get(x.id);
    for(const alias of aliases){
      const a=norm(alias);
      if(!bucket.includes(a))bucket.push(a);
      if(Array.isArray(DATA?.a)&&!DATA.a.some(r=>r?.[1]===x.id&&norm(r?.[0])===a))DATA.a.push([alias,x.id]);
    }
    x.search=(x.search||norm(x.title))+' '+bucket.join(' ');

    window.SHELFCHECK_PHYSICAL_OMISSION_PASS_V005={added,id:x.id,aliases};
    console.info('ShelfCheck physical omission pass v0.05 applied',window.SHELFCHECK_PHYSICAL_OMISSION_PASS_V005);
  });
})();
