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
    ['dissidia final fantasy nt','Online ecosystem limitations do not erase its qualifying physical PS4 identity.'],
    ['metal gear solid v the definitive experience','Verified physical PS4 package. Ground Zeroes and The Phantom Pain are both on disc; no download required. Treat as an efficient compilation/product covering both MGSV identities.'],
    ['metal slug anthology','Verified Limited Run physical PS4 disc. Qualifying compilation product; use its included Metal Slug games for coverage rather than treating the package as suspicious.'],
    ['monster hunter world iceborne','Keep the game identity, but prefer/track the Master Edition physical product: Monster Hunter World plus Iceborne. Do not treat expansion-only DLC as a separate physical SKU.'],
    ['monster hunter world iceborne master edition','Verified package containing Monster Hunter World plus Iceborne; valid physical product/coverage target.'],
    ['mortal kombat 11 aftermath kollection','Verified Americas physical PS4 release with data disc + play disc; voucher is only for three later skin packs. Valid MK11 physical product/edition, not a separate game identity from Mortal Kombat 11.'],
    ['sudden strike 4 complete collection','Verified complete physical build: base game and all DLC are on disc; no download required.'],
    ['the banner saga trilogy','Verified compilation: Banner Saga 1, 2 and 3 are all on one PS4 disc and playable offline; valid coverage for all three identities.'],
    ['bioshock the collection','Verified two-disc compilation containing BioShock, BioShock 2 and BioShock Infinite campaigns plus substantial DLC on disc; no download required. Valid coverage for all three identities.'],
    ['uncharted the nathan drake collection','Verified PS4 disc compilation: Uncharted 1, 2 and 3 campaigns are all on one disc and playable offline. Valid coverage for all three identities.'],
    ['marvel vs capcom fighting collection arcade classics','Verified physical compilation; all advertised games are complete on disc with no download required. Valid component-game coverage.'],
    ['capcom fighting collection 2','Verified physical compilation; all advertised games are on disc. The included download code is only an extra museum song and does not affect game coverage.'],
    ['aleste collection','Verified physical PS4 compilation; all five advertised Aleste/Power Strike game entries are playable from disc with no download required.'],
    ['pinball arcade','Verified physical disc includes the base table plus Season 1 paid table content on disc; later/pro upgrades are not fully represented, so coverage is limited to disc-contained tables/content.'],
    ['talisman digital edition 40th anniversary collection','Verified playable physical PS4 release with major expansions on disc, but not every DLC pack is included. Keep identity; do not infer coverage for omitted DLC.'],
    ['remothered tormented fathers broken porcelain double pack','Verified two-disc physical double pack containing both games. Both identities receive physical coverage, but Broken Porcelain has serious unpatched disc-build issues and a patch is recommended.'],
    ['crysis remastered trilogy','Physical PS4 trilogy verified as containing all three remastered games on disc; valid coverage for Crysis Remastered, Crysis 2 Remastered and Crysis 3 Remastered.'],
    ['trine ultimate collection','Physical PS4 collection is reported with Trine 1-4 on disc; soundtrack/artbook codes are extras, not games. Valid four-game coverage, with evidence quality below publisher/verified-disc tier.'],
    ['crash bandicoot n sane trilogy','Physical PS4 release contains the three remade Crash campaigns on disc. Valid coverage for Crash Bandicoot, Cortex Strikes Back and Warped remake identities as modeled by the census.'],
    ['tales from the borderlands','Physical PS4 release contains the full five-episode game; keep as one episodic game identity rather than splitting episodes.'],
    ['doom slayers collection','Physical package is NOT multi-game physical coverage under Josh Set rules when Doom 1/2/3 are supplied via digital redemption rather than as qualifying physical games. Keep only the qualifying disc game/product relationship; do not mark the download-code titles owned from this box.']
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