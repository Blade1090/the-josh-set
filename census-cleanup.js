// ShelfCheck census cleanup — confirmed flags found during dossier research and final integrity audit.
// Keep this explicit/auditable instead of silently mutating the compressed source census.
(()=>{
  const EXCLUDE=new Map([
    ['end of zoe','DLC / add-on for Resident Evil 7; not a standalone game identity.'],
    ['resident evil 7 biohazard end of zoe','DLC / add-on for Resident Evil 7; not a standalone game identity.'],
    ['the forge','DLC / add-on for Shadow of the Tomb Raider; not a standalone game identity.'],
    ['cities skylines parklife','Expansion/add-on for Cities: Skylines; full base game required, so it is not a standalone game identity.'],
    ['one punch man a hero nobody knows suiryu','Suiryu is DLC/add-on character content for One Punch Man: A Hero Nobody Knows, not a standalone game identity.'],
    ['rigs mechanized combat league','PSVR required.'],
    ['robinson the journey','PSVR required.'],
    ['starblood arena','PSVR required (and online-dependent).'],
    ['smash hit plunder','PSVR required.'],
    ['moss','PSVR required on PS4.'],
    ['doctor who the edge of time','PSVR required on PS4.'],
    ['astro bot rescue mission','PSVR and PS Camera required on PS4.'],
    ['loading human chapter 1','PSVR and PS Camera required on PS4.'],
    ['ghost giant','PSVR and PS Camera required on PS4.'],
    ['pixel ripped 1989','PSVR and PS Camera required on PS4.'],
    ['red matter','PSVR required on PS4.'],
    ['paper beast','PSVR required on PS4.'],
    ['operation warcade','PSVR and PS Camera required on PS4.'],
    ['radial g racing revolved','PSVR required on PS4.'],
    ['rush vr','PSVR and PS Camera required on PS4.'],
    ['the playroom vr','PSVR and PS Camera required on PS4.'],
    ['here they lie','Physical first pressing is PSVR-required; standard-screen play was added later by downloadable patch, so the qualifying physical data does not satisfy the non-PSVR rule.'],
    ['light tracer','Physical Limited Run PS4 release is a PSVR-branded/VR build; modern Regular Mode listing is insufficient evidence that non-VR play is contained on the physical disc. Exclude unless disc-level evidence proves otherwise.'],
    ['rocket arena','Required online service was permanently shut down; physical disc can no longer function as its game identity.'],
    ['lawbreakers','Required online servers were permanently shut down; physical PS4 disc no longer functions as the game.'],
    ['battleborn','Required servers were permanently shut down, including access to the single-player campaign; physical disc is no longer playable.'],
    ['overwatch','Original Overwatch service was shut down and replaced by Overwatch 2; the PS4 disc no longer preserves or launches the original game identity as released.'],
    ['mortal kombat 11 aftermath','Aftermath by itself is DLC, not a standalone game identity. Track the physical Aftermath Kollection as a product/edition of Mortal Kombat 11 instead.'],
    ['f1 2015','Serialized annual sports release excluded by Josh Set curation rule.'],
    ['f1 2016','Serialized annual sports release excluded by Josh Set curation rule.'],
    ['f1 2017','Serialized annual sports release excluded by Josh Set curation rule.'],
    ['f1 2018','Serialized annual sports release excluded by Josh Set curation rule.'],
    ['f1 2019','Serialized annual sports release excluded by Josh Set curation rule.'],
    ['f1 2020','Serialized annual sports release excluded by Josh Set curation rule.']
  ]);
  const KEEP=new Map([
    ['rocksmith 2014 edition','Physical PS4 game exists; requires compatible guitar/bass input hardware/cable, but peripheral dependency alone is not an exclusion.'],
    ['rocksmith 2014 edition remastered','Physical PS4 game exists; hardware/cable dependency is tracked as a playability note, not an exclusion.'],
    ['surf world series','Standalone non-annual arcade surfing game with a qualifying physical PS4 release; keep as a sports-rule exception.'],
    ['super blood hockey','Standalone non-annual arcade hockey identity; sports rule itself does not exclude it, but product-level physical proof remains required.'],
    ['surgeon simulator anniversary edition','Standard PS4 play is not VR-required; VR support/content does not trigger the PSVR exclusion.'],
    ['rez infinite','Standard PS4 play is not VR-required; PSVR is optional.'],
    ['resident evil 7 biohazard','Standard PS4 play is not VR-required; PSVR is optional.'],
    ['megadimension neptunia viir','Main game is playable without PSVR; VR interactions are optional.'],
    ['heavy fire red shadow','Standard-screen play is supported; VR is optional.'],
    ['dont knock twice','Standard-screen play is supported; VR is optional.'],
    ['the assembly','PSVR features exist, but official PlayStation listing labels VR/Camera as compatible rather than required; keep unless disc evidence contradicts this.'],
    ['hidden agenda','Companion-phone dependence is a preservation warning, not a game-identity exclusion.'],
    ['hitman 2','Online/progression dependence is tracked as preservation metadata; qualifying physical game identity remains included.'],
    ['hunt showdown','Online/service dependence is tracked as preservation metadata rather than silently deleting an otherwise qualifying physical identity.'],
    ['dayz','Online/service dependence is tracked as preservation metadata rather than silently deleting an otherwise qualifying physical identity.'],
    ['dead by daylight','Online/service dependence is tracked as preservation metadata rather than silently deleting an otherwise qualifying physical identity.'],
    ['dead alliance','Multiplayer population/service condition affects usefulness, not physical identity qualification by itself.'],
    ['dissidia final fantasy nt','Online ecosystem limitations do not erase its qualifying physical PS4 identity.'],
    ['metal gear solid v the definitive experience','Verified physical PS4 package. Ground Zeroes and The Phantom Pain are both on disc; no download required.'],
    ['metal slug anthology','Verified Limited Run physical PS4 disc. Qualifying compilation product.'],
    ['monster hunter world iceborne','Keep identity; prefer/track Master Edition physical product containing World plus Iceborne.'],
    ['monster hunter world iceborne master edition','Verified package containing Monster Hunter World plus Iceborne.'],
    ['mortal kombat 11 aftermath kollection','Verified Americas physical PS4 release with data disc + play disc; voucher only covers later skin packs.'],
    ['sudden strike 4 complete collection','Verified complete physical build: base game and all DLC on disc.'],
    ['the banner saga trilogy','Verified compilation: Banner Saga 1, 2 and 3 all on one PS4 disc.'],
    ['bioshock the collection','Verified two-disc compilation containing all three campaigns and substantial DLC on disc.'],
    ['uncharted the nathan drake collection','Verified PS4 disc compilation: Uncharted 1, 2 and 3 campaigns on disc.'],
    ['marvel vs capcom fighting collection arcade classics','Verified physical compilation; advertised games complete on disc.'],
    ['capcom fighting collection 2','Verified physical compilation; advertised games on disc; code is only an extra museum song.'],
    ['aleste collection','Verified physical PS4 compilation; five advertised game entries playable from disc.'],
    ['pinball arcade','Physical disc includes base table plus Season 1 content; later/pro upgrades not inferred.'],
    ['talisman digital edition 40th anniversary collection','Playable physical release with major expansions on disc, but not every DLC pack.'],
    ['remothered tormented fathers broken porcelain double pack','Verified two-disc physical double pack containing both games; Broken Porcelain disc build has serious issues.'],
    ['crysis remastered trilogy','Physical PS4 trilogy contains all three remastered games on disc.'],
    ['trine ultimate collection','Physical PS4 collection reported with Trine 1-4 on disc; soundtrack/artbook codes are extras.'],
    ['crash bandicoot n sane trilogy','Physical PS4 release contains the three remade Crash campaigns on disc.'],
    ['tales from the borderlands','Physical PS4 release contains the full five-episode game.'],
    ['doom slayers collection','Do not infer Doom 1/2/3 physical coverage when supplied via digital redemption; only qualifying disc coverage counts.']
  ]);
  let tries=0;
  const apply=()=>{
    tries++;
    if(typeof norm!=='function'||!Array.isArray(items)||!items.length||!DATA){if(tries<100)setTimeout(apply,100);return;}
    const changed=[],kept=[];
    for(const x of items){const key=norm(x.title),reason=EXCLUDE.get(key),keep=KEEP.get(key);if(reason&&x.set==='INCLUDED'){x.set='EXCLUDED';x.cleanupReason=reason;changed.push(x.title);}else if(keep&&x.set==='INCLUDED'){x.cleanupReviewed=true;x.cleanupReason=keep;kept.push(x.title);}}
    DATA.n=items.filter(x=>x.set==='INCLUDED').length;
    if(typeof progress==='function')progress();if(typeof resetBrowse==='function')resetBrowse();
    console.log(`ShelfCheck census cleanup: ${changed.length} newly excluded; ${kept.length} reviewed/kept; denominator ${DATA.n}`,{excluded:changed,kept});
  };apply();
})();