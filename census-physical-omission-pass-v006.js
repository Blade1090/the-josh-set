// ShelfCheck physical-omission pass v0.06 — Oct 3 GameEye census repairs.
//
// Josh's 2026-10-03 GameEye export exposed two genuine census omissions:
// 1) Demon Slayer -Kimetsu no Yaiba- The Hinokami Chronicles — a standalone PS4 physical.
// 2) RayStorm x RayCrisis HD Collection — one physical PS4 product containing two distinct
//    playable game identities, RayStorm and RayCrisis. The box is a product, not a third identity.
(()=>{
  registerCensusMutation('add',()=>{
    const added=[];

    const ensureIdentity=(id,title,auditSource,aliases=[])=>{
      let x=items.find(v=>norm(v.title)===norm(title));
      if(!x){
        if(byId.has(id)){
          console.error(`ShelfCheck physical omission v0.06: id ${id} already exists; refusing to add ${title}.`);
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

    const demon=ensureIdentity(
      2791,
      'Demon Slayer -Kimetsu no Yaiba- The Hinokami Chronicles',
      'Confirmed qualifying physical PS4 release. SEGA official product/FAQ and PlayStation Store documentation explicitly describe the PS4 physical version and disc-based PS5 upgrade. Josh GameEye row dated Oct 1 2026 exposed the census omission.',
      ['Demon Slayer: Kimetsu no Yaiba - The Hinokami Chronicles','Demon Slayer: The Hinokami Chronicles']
    );

    const rayStorm=ensureIdentity(
      2792,
      'RayStorm',
      'Playable identity physically satisfied on PS4 by RayStorm x RayCrisis HD Collection (ININ Games). Play-Asia documents the PS4 physical collection and identifies RayStorm as one of the two included Taito shoot-em-ups.',
      ['RayStorm HD']
    );
    const rayCrisis=ensureIdentity(
      2793,
      'RayCrisis',
      'Playable identity physically satisfied on PS4 by RayStorm x RayCrisis HD Collection (ININ Games). Play-Asia documents the PS4 physical collection and identifies RayCrisis as one of the two included Taito shoot-em-ups.',
      ['RayCrisis HD']
    );

    if(rayStorm&&rayCrisis){
      const raw='RayStorm x RayCrisis HD Collection',title=raw,ids=[rayStorm.id,rayCrisis.id],key=norm(raw);
      let row=DATA.p.find(p=>norm(p?.[0])===key||norm(p?.[1])===key);
      if(row)row[2]=[...new Set([...(row[2]||[]),...ids])];
      else DATA.p.push([raw,title,ids]);

      const p={key,title,ids};
      productMap.set(key,p);
      for(const id of ids){
        if(!reverseProducts.has(id))reverseProducts.set(id,[]);
        if(!reverseProducts.get(id).includes(title))reverseProducts.get(id).push(title);
      }
      if(typeof mergedProductIndex!=='undefined')mergedProductIndex=null;
    }

    window.SHELFCHECK_PHYSICAL_OMISSION_PASS_V006={added};
    console.info('ShelfCheck physical omission pass v0.06 applied',window.SHELFCHECK_PHYSICAL_OMISSION_PASS_V006);
  });
})();
