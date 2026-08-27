// ShelfCheck census cleanup — confirmed flags found during dossier research.
// Keep this explicit/auditable instead of silently mutating the compressed source census.
(()=>{
  const EXCLUDE=new Map([
    ['end of zoe','DLC / add-on for Resident Evil 7; not a standalone game identity.'],
    ['resident evil 7 biohazard end of zoe','DLC / add-on for Resident Evil 7; not a standalone game identity.'],
    ['the forge','DLC / add-on for Shadow of the Tomb Raider; not a standalone game identity.'],
    ['rigs mechanized combat league','PSVR required.'],
    ['robinson the journey','PSVR required.'],
    ['starblood arena','PSVR required (and online-dependent).'],
    ['smash hit plunder','PSVR required.'],
    ['rocket arena','Required online service was permanently shut down; physical disc can no longer function as its game identity.']
  ]);
  // Reviewed flags that remain INCLUDED. These are explicit so future passes do not
  // repeatedly treat them as unresolved just because their dossiers contain warnings.
  const KEEP=new Map([
    ['rocksmith 2014 edition','Physical PS4 game exists; requires compatible guitar/bass input hardware/cable, but peripheral dependency alone is not a Josh Set exclusion.'],
    ['rocksmith 2014 edition remastered','Physical PS4 game exists; hardware/cable dependency is tracked as a playability note, not an exclusion.'],
    ['surf world series','Standalone non-annual arcade surfing game with a qualifying physical PS4 release; keep as a sports-rule exception.'],
    ['super blood hockey','Standalone non-annual arcade hockey identity; keep as a sports-rule exception if/when a qualifying PS4 physical SKU is product-verified.'],
    ['surgeon simulator anniversary edition','Standard PS4 play is not VR-required; VR support/content does not trigger the PSVR exclusion.'],
    ['rez infinite','Standard PS4 play is not VR-required; PSVR is optional.'],
    ['resident evil 7 biohazard','Standard PS4 play is not VR-required; PSVR is optional.']
  ]);
  let tries=0;
  const apply=()=>{
    tries++;
    if(typeof norm!=='function'||!Array.isArray(items)||!items.length||!DATA){if(tries<100)setTimeout(apply,100);return;}
    const changed=[],kept=[];
    for(const x of items){
      const key=norm(x.title),reason=EXCLUDE.get(key),keep=KEEP.get(key);
      if(reason&&x.set==='INCLUDED'){
        x.set='EXCLUDED';x.cleanupReason=reason;changed.push(x.title);
      }else if(keep&&x.set==='INCLUDED'){
        x.cleanupReviewed=true;x.cleanupReason=keep;kept.push(x.title);
      }
    }
    // The denominator is identities actually admitted by current Josh Set rules.
    DATA.n=items.filter(x=>x.set==='INCLUDED').length;
    if(typeof progress==='function')progress();
    if(typeof resetBrowse==='function')resetBrowse();
    console.log(`ShelfCheck census cleanup: ${changed.length} newly excluded; ${kept.length} reviewed/kept; denominator ${DATA.n}`,{excluded:changed,kept});
  };
  apply();
})();