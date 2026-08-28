// ShelfCheck v0.50 — large verified PriceCharting recovery pass.
// Title-keyed because PriceCharting often uses alternate edition/region names.
(()=>{
  const DIRECT=[
    ['Aegis Defenders',23.26,'Aegis Defenders','Playstation 4'],
    ['A Hole New World',17.92,'A Hole New World','Playstation 4'],
    ['Black Desert',14.97,'Black Desert [Prestige Edition]','Playstation 4'],
    ['Drive!Drive!Drive!',12.75,'Drive Drive Drive','Playstation 4'],
    ['Deliver Us The Moon',28.75,'Deliver Us the Moon [Deluxe Edition]','Playstation 4'],
    ['Dead or Alive Xtreme 3: Fortune',69.00,'Dead or Alive Xtreme 3 Fortune','Asian English Playstation 4'],
    ['Death Road to Canada',33.50,'Death Road to Canada [Limited Edition]','Playstation 4'],
    ['Final Fantasy XIV Online: A Realm Reborn',9.02,'Final Fantasy XIV: A Realm Reborn','Playstation 4'],
    ['Fighting EX Layer',59.98,'Fighting EX Layer','Asian English Playstation 4'],
    ['Elite: Dangerous',19.25,'Elite Dangerous Legendary Edition','Playstation 4'],
    ['Earthfall',11.29,'Earthfall Deluxe Edition','Playstation 4'],
    ['Hyper Light Drifter',77.72,'Hyper Light Drifter','Playstation 4'],
    ['Iconoclasts',47.02,'Iconoclasts','Playstation 4'],
    ['Horizon Chase Turbo',35.50,'Horizon Chase Turbo','Playstation 4'],
    ["Hellblade: Senua's Sacrifice",27.48,"Hellblade Senua's Sacrifice",'Playstation 4'],
    ['I Am Setsuna',31.85,'I Am Setsuna','JP Playstation 4'],
    ['Iris.Fall',20.99,'Iris Fall','Playstation 4'],
    ['Little Town Hero',38.88,'Little Town Hero [Big Idea Edition]','Playstation 4'],
    ['Jay and Silent Bob: Mall Brawl',32.53,'Jay and Silent Bob Mall Brawl Arcade Edition','Playstation 4'],
    ['Stikbold! A Dodgeball Adventure',20.42,'Stikbold: A Dodge Ball Adventure','Playstation 4'],
    ['The Dark Pictures - Little Hope',14.25,'Dark Pictures Anthology: Little Hope','Playstation 4'],
    ['The Dark Pictures - Man of Medan',15.56,'Dark Pictures Anthology: Man of Medan','Playstation 4'],
    ['SturmFront - The Mutant War: Übel Edition',33.02,'Sturmfront: The Mutant War [Ubel Edition]','PAL Playstation 4'],
    ['Tharsis',12.99,'Tharsis [Limited Edition]','Playstation 4'],
    ['Blue Rider',24.09,'Blue Rider [Limited Edition]','Playstation 4'],
    ['Big Pharma',8.68,'Big Pharma [Special Edition]','PAL Playstation 4'],
    ['Asterix & Obelix XXL 3: The Crystal Menhir',22.31,'Asterix & Obelix XXL 3: The Crystal Menhir [Limited Edition]','PAL Playstation 4'],
    ['DJMax Respect',7.26,'DJMax Respect','Asian English Playstation 4'],
    ["Dragon Quest Heroes: The World Tree's Woe and the Blight Below",17.16,'Dragon Quest Heroes','Playstation 4'],
    ['Dimension Drive',34.95,'Dimension Drive: Limited Edition','Playstation 4'],
    ['Dusk Diver 2',22.45,'Dusk Diver 2 [Launch Edition]','Playstation 4'],
    ['Game Tengoku: Cruisin Mix Special',39.92,'Game Tengoku CruisinMix Special','Playstation 4'],
    ['River City Melee: Battle Royal Special',25.18,'River City Melee','Playstation 4'],
    ['Kingdom Hearts HD I.5 + II.5 Remix',12.49,'Kingdom Hearts HD 1.5 + 2.5 Remix','Playstation 4'],
    ['Minecraft Dungeons',36.00,'Minecraft Dungeons [Ultimate Edition]','Playstation 4'],
    ['Monster Hunter: World - Iceborne',18.85,'Monster Hunter: World Iceborne Master Edition','Playstation 4'],
    ['Risen 3: Titan Lords - Enhanced Edition',23.76,'Risen 3 Titan Lords: Enhanced Edition','PAL Playstation 4'],
    ['Pharaonic',8.15,'Pharaonic Deluxe Edition','Playstation 4'],
    ['theHunter: Call of the Wild',39.99,'The Hunter: Call of the Wild','Playstation 4'],
    ['Umbrella Corps',175.00,'Resident Evil Umbrella Corps','Playstation 4'],
    ['The Mummy Demastered',46.16,'The Mummy Demastered [Limited Run]','Playstation 4'],
    ['XIII (Remake)',16.30,'XIII','Playstation 4'],
    ['Utawarerumono: Prelude to the Fallen',54.50,'Utawarerumono: Prelude to the Fallen [Origins Edition]','Playstation 4'],
    ['Vambrace: Cold Soul',25.91,'Vambrace: Cold Soul','JP Playstation 4']
  ];
  let tries=0;
  const apply=()=>{
    tries++;
    if(typeof byId==='undefined'||typeof stateCache==='undefined'||!stateCache||typeof saveState!=='function'||typeof pcNormTitle!=='function'){if(tries<120)setTimeout(apply,100);return;}
    const map=new Map((stateCache.prices||[]).map(p=>[pcNormTitle(p.t),p]));let added=0;
    const titleMap=new Map();for(const x of byId.values())if(x&&x.title)titleMap.set(pcNormTitle(x.title),x);
    for(const [t,m,pc,c] of DIRECT){const x=titleMap.get(pcNormTitle(t));if(!x||x.set!=='INCLUDED')continue;const k=pcNormTitle(x.title);if(map.has(k))continue;map.set(k,{t:x.title,m,s:+(m*.70).toFixed(2),g:+(m*.85).toFixed(2),x:+(m*1.10).toFixed(2),pc,c,source:'PriceCharting verified direct v050'});added++;}
    if(added){stateCache={...stateCache,version:15,prices:[...map.values()].sort((a,b)=>a.t.localeCompare(b.t)),priceSupplement:'2026-08-28-v050'};saveState(stateCache);if(typeof resetBrowse==='function')resetBrowse();}
    window.SHELFCHECK_PC_V050={verifiedIdentityPrices:DIRECT.length,added,total:(stateCache.prices||[]).length};
  };
  apply();
})();
