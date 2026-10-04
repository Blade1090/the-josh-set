// ShelfCheck v0.75 — one-time ownership repair for Josh's 2026-10-03 physical haul.
//
// The four GameEye rows were reconciled after the census/alias fixes, but two identities still
// failed to land in the persisted owned set on Josh's phone. This is a Josh-specific one-time
// state migration, not a global ownership rule: it unions the four confirmed physical pickups
// into the CURRENT saved shelf exactly once, records a marker, and never re-adds them after any
// future GameEye import if Josh later sells one.
(()=>{
  const MIGRATION='oct3-2026-confirmed-physical-haul-v1';
  let tries=0;
  const apply=()=>{
    tries++;
    if(typeof censusFinalized==='undefined'||!censusFinalized||typeof saveState!=='function'||!Array.isArray(items)){
      if(tries<120)setTimeout(apply,100);
      return;
    }

    setTimeout(()=>{
      let current={};
      try{current=JSON.parse(localStorage.getItem('joshSetState'))||stateCache||{};}catch{current=stateCache||{};}
      const migrations={...(current.ownershipMigrations||{})};
      if(migrations[MIGRATION])return;

      const confirmed=[
        'Diablo IV',
        'Destiny 2',
        'Human: Fall Flat',
        'Minecraft: Story Mode - A Telltale Games Series'
      ];
      const owned=new Set(current.owned||[]);
      const added=[],missing=[];

      for(const title of confirmed){
        const x=items.find(v=>v.set==='INCLUDED'&&norm(v.title)===norm(title));
        if(!x){missing.push(title);continue;}
        if(!owned.has(x.id)){owned.add(x.id);added.push({id:x.id,title:x.title});}
      }

      migrations[MIGRATION]={at:new Date().toISOString(),confirmed,added:added.map(x=>x.title),missing};
      const audit=current.ownershipAudit||{};
      saveState({
        ...current,
        owned:[...owned],
        ownershipMigrations:migrations,
        ownershipAudit:{...audit,satisfied:owned.size}
      });
      if(typeof progress==='function')progress();
      if(typeof resetBrowse==='function')resetBrowse();

      console.info('ShelfCheck v0.75 one-time Oct 3 ownership migration applied',{added,missing,owned:owned.size});
      window.SHELFCHECK_OWNERSHIP_RECONCILE_V075={migration:MIGRATION,added,missing,owned:owned.size};
    },900);
  };
  apply();
})();
