// ShelfCheck v0.35 structural collapse pass.
// These rows are confirmed physical PRODUCTS / EDITIONS / COMPILATIONS that were
// accidentally promoted into the playable-identity census during older repair passes.
// Product coverage remains in DATA.p; this only removes the extra identity count.
(()=>{
  const COLLAPSE=new Map([
    // Confirmed duplicate editions / variants from the reconciliation Product Variants audit.
    ['aces of the luftwaffe squadron extended edition','Edition of Aces of the Luftwaffe: Squadron.'],
    ['anima gate of memories arcane edition','Edition of Anima: Gate of Memories.'],
    ['aragami shadow edition','Edition of Aragami.'],
    ['assetto corsa ultimate edition','Edition of Assetto Corsa.'],
    ['atv drift and tricks definitive edition','Edition of ATV Drift & Tricks.'],
    ['battlefield 4 premium edition','Edition of Battlefield 4.'],
    ['battlezone gold edition','Edition of Battlezone.'],
    ['blazblue cross tag battle special edition','Edition of BlazBlue: Cross Tag Battle.'],
    ['bloodborne complete edition','Edition of Bloodborne.'],
    ['call of duty black ops iii gold edition','Edition of Call of Duty: Black Ops III.'],
    ['call of duty ghosts gold edition','Edition of Call of Duty: Ghosts.'],
    ['call of duty wwii gold edition','Edition of Call of Duty: WWII.'],
    ['defenders of ekron definitive edition','Edition of Defenders of Ekron.'],
    ['evolve ultimate edition','Edition of Evolve.'],
    ['fallout 4 game of the year edition','Edition of Fallout 4.'],
    ['far cry 4 complete edition','Edition of Far Cry 4.'],
    ['farming simulator 15 complete edition','Edition of Farming Simulator 15.'],
    ['hitman game of the year edition','Edition of Hitman.'],
    ['horizon zero dawn complete edition','Edition of Horizon Zero Dawn.'],
    ['industry giant ii gold edition','Edition of Industry Giant II.'],
    ['journey collectors edition','Edition of Journey.'],
    ['kerbal space program enhanced edition','Edition of Kerbal Space Program.'],
    ['little nightmares complete edition','Edition of Little Nightmares.'],
    ['lords of the fallen complete edition','Edition of Lords of the Fallen.'],
    ['mafia iii definitive edition','Edition of Mafia III.'],
    ['middle earth shadow of mordor game of the year edition','Edition of Middle-earth: Shadow of Mordor.'],
    ['middle earth shadow of war definitive edition','Edition of Middle-earth: Shadow of War.'],
    ['mutant year zero road to eden deluxe edition','Edition of Mutant Year Zero: Road to Eden.'],
    ['mx vs atv all out anniversary edition','Edition of MX vs. ATV All Out.'],
    ['need for speed rivals complete edition','Edition of Need for Speed: Rivals.'],
    ['nioh complete edition','Edition of Nioh.'],
    ['one piece burning blood gold edition','Edition of One Piece: Burning Blood.'],
    ['one piece unlimited world red deluxe edition','Edition of One Piece: Unlimited World Red.'],
    ['pillars of eternity ii deadfire ultimate edition','Edition of Pillars of Eternity II: Deadfire.'],
    ['professional farmer 2017 gold edition','Edition of Professional Farmer 2017.'],
    ['project cars game of the year edition','Edition of Project CARS.'],
    ['resident evil 7 biohazard gold edition','Edition of Resident Evil 7: biohazard.'],
    ['rocket league game of the year edition','Edition of Rocket League.'],
    ['rocket league ultimate edition','Edition of Rocket League.'],
    ['shadow of the tomb raider definitive edition','Edition of Shadow of the Tomb Raider.'],
    ['shantae half genie hero ultimate edition','Edition of Shantae: Half-Genie Hero.'],
    ['slime rancher deluxe edition','Edition of Slime Rancher.'],
    ['sniper elite iii ultimate edition','Edition of Sniper Elite III.'],
    ['star wars battlefront ultimate edition','Edition of Star Wars Battlefront.'],
    ['super mega baseball 2 ultimate edition','Edition of Super Mega Baseball 2.'],
    ['sword art online fatal bullet complete edition','Edition of Sword Art Online: Fatal Bullet.'],
    ['the crew ultimate edition','Edition of The Crew.'],
    ['the golf club collectors edition','Edition of The Golf Club.'],
    ['the witcher 3 wild hunt complete edition','Edition of The Witcher 3: Wild Hunt.'],
    ['world war z game of the year edition','Edition of World War Z.'],

    // Confirmed product wrappers that cover existing game identities.
    ['the walking dead the telltale definitive series','Compilation product covering the individual Walking Dead seasons.'],
    ['bioshock the collection','Compilation product covering the BioShock identities.'],
    ['dark souls trilogy','Compilation product covering the three Dark Souls identities.'],
    ['lego marvel collection','Compilation product covering the three LEGO Marvel identities.'],
    ['mafia trilogy','Compilation product covering the three Mafia identities.'],
    ['the yakuza remastered collection','Compilation product covering Yakuza 3/4/5 Remastered.'],
    ['air conflicts double pack','Double-pack product, not an extra game identity.'],
    ['danganronpa trilogy','Compilation product covering Danganronpa 1-2 Reload and V3.'],
    ['darkest dungeon ancestral edition','Edition/product of Darkest Dungeon.'],
    ['dead cells return to castlevania edition','Edition/product of Dead Cells.'],
    ['hotline miami collection','Compilation product covering Hotline Miami 1 and 2.'],
    ['kingdom hearts the story so far','Compilation product covering the Kingdom Hearts collection identities.'],
    ['kingdom hearts all in one package','Compilation product covering the Kingdom Hearts collection identities and III.'],
    ['mega man x legacy collection 1 2','Compilation product covering Mega Man X Legacy Collection 1 and 2.'],
    ['quantic dream collection','Compilation product covering Detroit, Heavy Rain and Beyond: Two Souls.'],
    ['spyro reignited trilogy crash bandicoot n sane trilogy','Double-pack product, not an extra identity.'],
    ['the king of fighters collection the orochi saga','Compilation product covering represented King of Fighters identities.'],
    ['batman arkham collection','Collection product; represented games remain the identities.'],
    ['bayonetta and vanquish','Double-pack product, not an extra identity.'],
    ['cat quest cat quest ii pawsome pack','Double-pack product, not an extra identity.'],
    ['grip combat racing airblades vs rollers ultimate edition','Edition/product of GRIP: Combat Racing.'],
    ['guacamelee one two punch collection','Compilation product, not an extra identity.'],
    ['inside limbo double pack','Double-pack product, not an extra identity.'],
    ['la mulana 1 2 hidden treasures edition','Compilation product, not an extra identity.'],
    ['oniken odallus collection','Compilation product, not an extra identity.'],
    ['pac man championship edition 2 arcade game series','Compilation/product wrapper, not an extra identity.'],
    ['star wars racer commando combo','Double-pack product, not an extra identity.'],
    ['stardew valley collectors edition','Edition of Stardew Valley.'],
    ['street fighter v arcade edition','Edition of Street Fighter V.'],
    ['trials fusion the awesome max edition','Edition of Trials Fusion.'],
    ['wargroove deluxe edition','Edition of Wargroove.'],
    ['worms battleground worms w m d','Double-pack product, not an extra identity.'],

    // Multi-game physical products already modeled in ShelfCheck coverage.
    ['metal gear solid v the definitive experience','Physical product covering Ground Zeroes and The Phantom Pain; not a third identity.'],
    ['mortal kombat 11 aftermath kollection','Physical edition/product of Mortal Kombat 11.'],
    ['the banner saga trilogy','Compilation product covering Banner Saga 1, 2 and 3.'],
    ['uncharted the nathan drake collection','Compilation product covering Uncharted 1, 2 and 3.'],
    ['remothered tormented fathers broken porcelain double pack','Double-pack product covering the two Remothered games.'],
    ['crysis remastered trilogy','Compilation product covering Crysis Remastered 1, 2 and 3.'],
    ['trine ultimate collection','Compilation product covering Trine 1-4.'],
    ['crash bandicoot n sane trilogy','Compilation/remake package whose component identities are already modeled.'],

    // Earlier explicit cleanup decisions, repeated here so this late pass is authoritative.
    ['diablo iii eternal collection','Edition/product of Diablo III: Ultimate Evil Edition.'],
    ['just cause 3 xl edition','Edition/product of Just Cause 3.'],
    ['final fantasy xiv online the complete edition','Bundle/product for Final Fantasy XIV.'],
    ['final fantasy xiv online the complete experience','Bundle/product for Final Fantasy XIV.'],
    ['final fantasy xiv heavensward','Expansion for Final Fantasy XIV.'],
    ['final fantasy xiv stormblood','Expansion for Final Fantasy XIV.'],
    ['final fantasy xiv shadowbringers','Expansion for Final Fantasy XIV.'],
    ['final fantasy xv royal edition','Edition/product of Final Fantasy XV.'],
    ['xcom 2 collection','Edition/product of XCOM 2.'],
    ['warriors orochi 4 ultimate','Edition/product of Warriors Orochi 4.'],
    ['velocity 2x critical mass edition','Edition/product of Velocity 2X.'],
    ['tropico 5 complete collection','Edition/product of Tropico 5.'],
    ['sudden strike 4 complete collection','Edition/product of Sudden Strike 4.'],
    ['railway empire complete collection','Edition/product of Railway Empire.'],
    ['mercenary kings reloaded edition','Edition/product of Mercenary Kings.'],
    ['layers of fear masterpiece edition','Edition/product of Layers of Fear.'],
    ['hollow knight voidheart edition','Edition/product of Hollow Knight.'],
    ['hitman definitive edition','Edition/product of Hitman.'],
    ['harvest moon light of hope special edition complete','Edition/product of Harvest Moon: Light of Hope.'],
    ['dungeons 3 complete collection','Edition/product of Dungeons 3.'],
    ['everspace stellar edition','Edition/product of EVERSPACE.'],
    ['bomber crew complete edition','Edition/product of Bomber Crew.'],
    ['blood bowl 2 legendary edition','Edition/product of Blood Bowl 2.'],
    ['cities skylines premium edition','Edition/product of Cities: Skylines.'],
    ['minecraft story mode a telltale games series the complete adventure','Complete physical product of Minecraft: Story Mode.'],
    ['naruto shippuden ultimate ninja storm 4 road to boruto','Edition/product of Naruto Shippuden: Ultimate Ninja Storm 4.']
  ]);

  let tries=0;
  const apply=()=>{
    tries++;
    if(typeof norm!=='function'||!Array.isArray(items)||!items.length||!DATA){if(tries<120)setTimeout(apply,100);return;}
    const changed=[];
    for(const x of items){
      const reason=COLLAPSE.get(norm(x.title));
      if(reason&&x.set==='INCLUDED'){
        x.set='EXCLUDED';
        x.cleanupReason='PRODUCT / EDITION COLLAPSE: '+reason;
        changed.push(x.title);
      }
    }
    DATA.n=items.filter(x=>x.set==='INCLUDED').length;
    if(typeof progress==='function')progress();
    if(typeof resetBrowse==='function')resetBrowse();
    window.SHELFCHECK_V035_COLLAPSE={changed,denominator:DATA.n};
    console.info(`ShelfCheck v0.35 collapse: ${changed.length} identity rows retired; live denominator ${DATA.n}`,changed);
  };
  apply();
})();