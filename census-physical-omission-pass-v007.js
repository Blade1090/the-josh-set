// ShelfCheck physical-omission pass v0.07 — Oct 4 GameEye census repairs.
//
// Josh's 2026-10-04 GameEye export exposed two genuine North-American physical PS4 omissions:
// Persona 5 Strikers and Riders Republic. Both are standalone playable identities and should
// count once in the Josh Set.
(()=>{
  registerCensusMutation('add',()=>{
    const added=[];
    const ensureIdentity=(id,title,auditSource,aliases=[])=>{
      let x=items.find(v=>norm(v.title)===norm(title));
      if(!x){
        if(byId.has(id)){
          console.error(`ShelfCheck physical omission v0.07: id ${id} already exists; refusing to add ${title}.`);
          return null;
        }
        x={id,title,set:'INCLUDED',baseline:'NEEDED',strong:null,target:null,max:null,search:norm(title),auditSource};
        items.push(x);byId.set(id,x);added.push(title);
      }
      if(!aliasesById.has(x.id))aliasesById.set(x.id,[]);
      const bucket=aliasesById.get(x.id);
      for(const alias of aliases){
        const a=norm(alias);
        if(!bucket.includes(a))bucket.push(a);
        if(Array.isArray(DATA?.a)&&!DATA.a.some(r=>r?.[1]===x.id&&norm(r?.[0])===a))DATA.a.push([alias,x.id]);
      }
      x.search=(x.search||norm(x.title))+' '+bucket.join(' ');
      return x;
    };

    ensureIdentity(
      2794,
      'Persona 5 Strikers',
      "Confirmed qualifying physical PS4 release from Josh's 2026-10-04 GameEye row: United States, Official, Sega of America, CIB. Distinct playable identity from Persona 5 and Persona 5 Royal.",
      ['P5S','Persona 5 Scramble: The Phantom Strikers']
    );
    ensureIdentity(
      2795,
      'Riders Republic',
      "Confirmed qualifying physical PS4 release from Josh's 2026-10-04 GameEye row: United States, Official, Ubisoft, CIB. Standalone playable identity.",
      []
    );

    window.SHELFCHECK_PHYSICAL_OMISSION_PASS_V007={added};
    console.info('ShelfCheck physical omission pass v0.07 applied',window.SHELFCHECK_PHYSICAL_OMISSION_PASS_V007);
  });
})();
