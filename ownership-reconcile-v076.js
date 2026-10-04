// ShelfCheck v0.76 — final one-time Oct 3 ownership repair.
//
// v0.75 proved one of the four confirmed pickups could still be lost/missed on startup.
// This pass is deliberately more defensive: it resolves each target by normalized title
// patterns, unions any missing IDs twice (after startup settles), and only then records a
// new migration marker. Future imports remain authoritative because the marker prevents
// this from running again after this one successful repair.
(()=>{
  const MIGRATION='oct3-2026-confirmed-physical-haul-v2';
  let tries=0;

  const resolveTargets=()=>{
    const included=items.filter(x=>x?.set==='INCLUDED');
    const byNorm=t=>included.find(x=>norm(x.title)===norm(t))||null;

    const diablo=byNorm('Diablo IV')||
      included.find(x=>norm(x.title)==='diablo 4')||null;

    const destiny=byNorm('Destiny 2')||null;

    const human=byNorm('Human: Fall Flat')||
      byNorm('Human Fall Flat')||
      included.find(x=>norm(x.title).includes('human fall flat'))||null;

    const minecraft=byNorm('Minecraft: Story Mode - A Telltale Games Series')||
      included.find(x=>{
        const n=norm(x.title);
        return n.includes('minecraft story mode')&&
          !n.includes('season two')&&!n.includes('season 2')&&
          (n.includes('telltale')||n.includes('complete first season'));
      })||null;

    return [
      ['Diablo IV',diablo],
      ['Destiny 2',destiny],
      ['Human: Fall Flat',human],
      ['Minecraft: Story Mode - The Complete Adventure',minecraft]
    ];
  };

  const enforce=(finalPass=false)=>{
    let current={};
    try{current=JSON.parse(localStorage.getItem('joshSetState'))||stateCache||{};}catch{current=stateCache||{};}
    const migrations={...(current.ownershipMigrations||{})};
    if(migrations[MIGRATION])return;

    const owned=new Set(current.owned||[]);
    const targets=resolveTargets();
    const added=[],resolved=[],missing=[];

    for(const [label,x] of targets){
      if(!x){missing.push(label);continue;}
      resolved.push({label,id:x.id,title:x.title});
      if(!owned.has(x.id)){owned.add(x.id);added.push({id:x.id,title:x.title});}
    }

    if(finalPass){
      migrations[MIGRATION]={
        at:new Date().toISOString(),
        resolved:resolved.map(x=>x.title),
        added:added.map(x=>x.title),
        missing
      };
    }

    const audit=current.ownershipAudit||{};
    saveState({
      ...current,
      owned:[...owned],
      ownershipMigrations:migrations,
      ownershipAudit:{...audit,satisfied:owned.size}
    });

    if(typeof progress==='function')progress();
    if(typeof resetBrowse==='function')resetBrowse();

    const snapshot={finalPass,added,resolved,missing,owned:owned.size};
    console.info('ShelfCheck v0.76 Oct 3 ownership enforcement',snapshot);
    window.SHELFCHECK_OWNERSHIP_RECONCILE_V076=snapshot;
  };

  const start=()=>{
    tries++;
    if(typeof censusFinalized==='undefined'||!censusFinalized||typeof saveState!=='function'||!Array.isArray(items)){
      if(tries<120)setTimeout(start,100);
      return;
    }
    let current={};
    try{current=JSON.parse(localStorage.getItem('joshSetState'))||stateCache||{};}catch{current=stateCache||{};}
    if(current?.ownershipMigrations?.[MIGRATION])return;

    setTimeout(()=>enforce(false),1500);
    setTimeout(()=>enforce(true),5000);
  };

  start();
})();
