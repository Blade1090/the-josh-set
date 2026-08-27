// ShelfCheck census cleanup — confirmed flags found during dossier research.
// Keep this explicit/auditable instead of silently mutating the compressed source census.
(()=>{
  const EXCLUDE=new Map([
    ['end of zoe','DLC / add-on for Resident Evil 7; not a standalone game identity.'],
    ['the forge','DLC / add-on for Shadow of the Tomb Raider; not a standalone game identity.'],
    ['rigs mechanized combat league','PSVR required.'],
    ['robinson the journey','PSVR required.'],
    ['starblood arena','PSVR required (and online-dependent).'],
    ['smash hit plunder','PSVR required.']
  ]);
  let tries=0;
  const apply=()=>{
    tries++;
    if(typeof norm!=='function'||!Array.isArray(items)||!items.length||!DATA){if(tries<100)setTimeout(apply,100);return;}
    const changed=[];
    for(const x of items){
      const reason=EXCLUDE.get(norm(x.title));
      if(reason&&x.set==='INCLUDED'){
        x.set='EXCLUDED';
        x.cleanupReason=reason;
        changed.push(x.title);
      }
    }
    // The denominator is identities actually admitted by current Josh Set rules.
    DATA.n=items.filter(x=>x.set==='INCLUDED').length;
    if(typeof progress==='function')progress();
    if(typeof resetBrowse==='function')resetBrowse();
    console.log(`ShelfCheck census cleanup: ${changed.length} newly excluded; denominator ${DATA.n}`,changed);
  };
  apply();
})();