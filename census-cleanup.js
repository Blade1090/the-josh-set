// ShelfCheck census cleanup — explicit, auditable identity exclusions.
(()=>{
  const EXCLUDE=new Map([
    ['end of zoe','DLC / add-on for Resident Evil 7; not a standalone game identity.'],
    ['resident evil 7 biohazard end of zoe','DLC / add-on for Resident Evil 7; not a standalone game identity.'],
    ['the forge','DLC / add-on for Shadow of the Tomb Raider; not a standalone game identity.'],
    ['cities skylines parklife','Expansion/add-on for Cities: Skylines; full base game required.'],
    ['one punch man a hero nobody knows suiryu','DLC/add-on character content.'],
    ['diablo iii eternal collection','Physical edition/product of Diablo III: Ultimate Evil Edition; not a second playable identity.'],
    ['just cause 3 xl edition','Content/edition package of Just Cause 3; not a second playable identity.'],
    ['final fantasy xiv online the complete edition','Bundle/product for Final Fantasy XIV; not a distinct playable identity.'],
    ['final fantasy xiv online the complete experience','Bundle/product for Final Fantasy XIV; not a distinct playable identity.'],
    ['final fantasy xiv heavensward','Expansion for Final Fantasy XIV; not a standalone game identity.'],
    ['final fantasy xiv shadowbringers','Expansion for Final Fantasy XIV; not a standalone game identity.'],
    ['final fantasy xiv stormblood','Expansion for Final Fantasy XIV; not a standalone game identity.'],
    ['final fantasy xv royal edition','Content/edition package of Final Fantasy XV; not a second playable identity.'],
    ['xcom 2 collection','Collection/content edition of XCOM 2; not a second playable identity.'],
    ['warriors orochi 4 ultimate','Ultimate content edition of Warriors Orochi 4; not a second playable identity.'],
    ['velocity 2x critical mass edition','Edition/package variant of Velocity 2X.'],
    ['tropico 5 complete collection','Complete/content edition of Tropico 5.'],
    ['sudden strike 4 complete collection','Complete/content edition of Sudden Strike 4; retain as a physical product.'],
    ['railway empire complete collection','Complete/content edition of Railway Empire.'],
    ['mercenary kings reloaded edition','Reloaded content edition of Mercenary Kings.'],
    ['layers of fear masterpiece edition','Content edition of Layers of Fear.'],
    ['hollow knight voidheart edition','Content edition of Hollow Knight.'],
    ['hitman definitive edition','Content edition of Hitman.'],
    ['harvest moon light of hope special edition complete','Complete/content edition of Harvest Moon: Light of Hope.'],
    ['dungeons 3 complete collection','Complete/content edition of Dungeons 3.'],
    ['everspace stellar edition','Content edition of EVERSPACE.'],
    ['bomber crew complete edition','Complete/content edition of Bomber Crew.'],
    ['blood bowl 2 legendary edition','Content edition of Blood Bowl 2.'],
    ['cities skylines premium edition','Content/edition package of Cities: Skylines.'],
    ['minecraft story mode a telltale games series the complete adventure','Complete physical product of Minecraft: Story Mode; not a second identity.'],
    ['naruto shippuden ultimate ninja storm 4 road to boruto','Content edition of Naruto Shippuden: Ultimate Ninja Storm 4.'],
    ['mortal kombat 11 aftermath','Aftermath by itself is DLC, not a standalone game identity.'],
    ['rigs mechanized combat league','PSVR required.'],['robinson the journey','PSVR required.'],['starblood arena','PSVR required.'],['smash hit plunder','PSVR required.'],['moss','PSVR required on PS4.'],['doctor who the edge of time','PSVR required on PS4.'],['astro bot rescue mission','PSVR required on PS4.'],['loading human chapter 1','PSVR required on PS4.'],['ghost giant','PSVR required on PS4.'],['pixel ripped 1989','PSVR required on PS4.'],['red matter','PSVR required on PS4.'],['paper beast','PSVR required on PS4.'],['operation warcade','PSVR required on PS4.'],['radial g racing revolved','PSVR required on PS4.'],['rush vr','PSVR required on PS4.'],['the playroom vr','PSVR required on PS4.'],
    ['here they lie','Physical first pressing is PSVR-required; non-VR play requires patch.'],['light tracer','Physical PS4 release is VR-branded; no disc-level proof of qualifying non-VR build.'],
    ['rocket arena','Required online service permanently shut down.'],['lawbreakers','Required online servers permanently shut down.'],['battleborn','Required servers permanently shut down.'],['overwatch','Original service shut down/replaced; disc no longer preserves original identity.'],
    ['f1 2015','Serialized annual sports release excluded.'],['f1 2016','Serialized annual sports release excluded.'],['f1 2017','Serialized annual sports release excluded.'],['f1 2018','Serialized annual sports release excluded.'],['f1 2019','Serialized annual sports release excluded.'],['f1 2020','Serialized annual sports release excluded.']
  ]);
  const KEEP=new Map([
    ['rocksmith 2014 edition','Peripheral dependency is not an exclusion.'],['rocksmith 2014 edition remastered','Peripheral dependency is not an exclusion.'],['surf world series','Standalone non-annual arcade sports game.'],['super blood hockey','Standalone non-annual arcade sports identity.'],['surgeon simulator anniversary edition','Standard PS4 play is not VR-required.'],['rez infinite','PSVR optional.'],['resident evil 7 biohazard','PSVR optional.'],['megadimension neptunia viir','VR interactions optional.'],['heavy fire red shadow','VR optional.'],['dont knock twice','VR optional.'],['the assembly','VR compatible rather than required.'],['hidden agenda','Companion-phone dependency is preservation metadata.'],['hitman 2','Online limitations do not erase identity.'],['hunt showdown','Online dependence tracked as preservation metadata.'],['dayz','Online dependence tracked as preservation metadata.'],['dead by daylight','Online dependence tracked as preservation metadata.'],['dead alliance','Service condition does not erase physical identity.'],['dissidia final fantasy nt','Online limitations do not erase identity.'],
    ['metal gear solid v the definitive experience','Verified physical package; Ground Zeroes and The Phantom Pain on disc.'],['metal slug anthology','Verified qualifying physical compilation.'],['monster hunter world iceborne','Keep identity; Master Edition is preferred product.'],['monster hunter world iceborne master edition','Verified package containing World plus Iceborne.'],['mortal kombat 11 aftermath kollection','Verified physical package; track as product.'],['the banner saga trilogy','Verified compilation with all three games on disc.'],['bioshock the collection','Verified two-disc compilation.'],['uncharted the nathan drake collection','Verified compilation.'],['marvel vs capcom fighting collection arcade classics','Verified physical compilation.'],['capcom fighting collection 2','Verified physical compilation.'],['aleste collection','Verified physical compilation.'],['pinball arcade','Qualifying physical release.'],['talisman digital edition 40th anniversary collection','Playable physical release.'],['remothered tormented fathers broken porcelain double pack','Verified two-disc double pack.'],['crysis remastered trilogy','Verified trilogy on disc.'],['trine ultimate collection','Verified collection.'],['crash bandicoot n sane trilogy','Physical release contains three remade campaigns.'],['tales from the borderlands','Physical release contains full episodic game.'],['doom slayers collection','Only qualifying disc coverage counts; codes do not.']
  ]);
  let tries=0;
  const apply=()=>{tries++;if(typeof norm!=='function'||!Array.isArray(items)||!items.length||!DATA){if(tries<100)setTimeout(apply,100);return;}const changed=[],kept=[];for(const x of items){const key=norm(x.title),reason=EXCLUDE.get(key),keep=KEEP.get(key);if(reason&&x.set==='INCLUDED'){x.set='EXCLUDED';x.cleanupReason=reason;changed.push(x.title);}else if(keep&&x.set==='INCLUDED'){x.cleanupReviewed=true;x.cleanupReason=keep;kept.push(x.title);}}DATA.n=items.filter(x=>x.set==='INCLUDED').length;if(typeof progress==='function')progress();if(typeof resetBrowse==='function')resetBrowse();console.log(`ShelfCheck census cleanup: ${changed.length} newly excluded; ${kept.length} reviewed/kept; denominator ${DATA.n}`,{excluded:changed,kept});};apply();
})();