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
    ['moss','PSVR required on PS4.'],
    ['doctor who the edge of time','PSVR required on PS4.'],
    ['rocket arena','Required online service was permanently shut down; physical disc can no longer function as its game identity.']
  ]);
  // Reviewed flags that remain INCLUDED. These are explicit so future passes do not
  // repeatedly treat them as unresolved just because their dossiers contain warnings.
  const KEEP=new Map([
    ['rocksmith 2014 edition','Physical PS4 game exists; requires compatible guitar/bass input hardware/cable, but peripheral dependency alone is not a Josh Set exclusion.'],
    ['rocksmith 2014 edition remastered','Physical PS4 game exists; hardware/cable dependency is tracked as a playability note, not an exclusion.'],
    ['surf world series','Standalone non-annual arcade surfing game with a qualifying physical PS4 release; keep as a sports-rule exception.'],
    ['super blood hockey','Standalone non-annual arcade hockey identity; sports rule itself does not exclude it, but product-level physical proof remains required.'],
    ['surgeon simulator anniversary edition','Standard PS4 play is not VR-required; VR support/content does not trigger the PSVR exclusion.'],
    ['rez infinite','Standard PS4 play is not VR-required; PSVR is optional.'],
    ['resident evil 7 biohazard','Standard PS4 play is not VR-required; PSVR is optional.'],
    ['megadimension neptunia viir','Main game is playable without PSVR; VR interactions are optional.'],
    ['heavy fire red shadow','Standard-screen play is supported; VR is optional.'],
    ['dont knock twice','Standard-screen play is supported; VR is optional.'],
    ['hidden agenda','Companion-phone dependence is a preservation warning, not a game-identity exclusion.'],
    ['hitman 2','Online/progression dependence is tracked as preservation metadata; qualifying physical game identity remains included.'],
    ['hunt showdown','Online/service dependence is tracked as preservation metadata rather than silently deleting an otherwise qualifying physical identity.'],
    ['dayz','Online/service dependence is tracked as preservation metadata rather than silently deleting an otherwise qualifying physical identity.'],
    ['dead by daylight','Online/service dependence is tracked as preservation metadata rather than silently deleting an otherwise qualifying physical identity.'],
    ['dead alliance','Multiplayer population/service condition affects usefulness, not physical identity qualification by itself.'],
    ['dissidia final fantasy nt','Online ecosystem limitations do not erase its qualifying physical PS4 identity.']
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
    DATA.n=items.filter(x=>x.set==='INCLUDED').length;
    if(typeof progress==='function')progress();
    if(typeof resetBrowse==='function')resetBrowse();
    console.log(`ShelfCheck census cleanup: ${changed.length} newly excluded; ${kept.length} reviewed/kept; denominator ${DATA.n}`,{excluded:changed,kept});
  };
  apply();
})();