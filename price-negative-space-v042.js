// ShelfCheck v0.49 — verified negative-space + direct PriceCharting recovery.
// Identity-safe prices only. Compilation/product prices are retained as product mappings
// and are never copied onto component identities.
(()=>{
  const EXTRA=[
    {id:758,m:28.99,pc:'Mega Man Zero/ZX Legacy Collection',c:'Playstation 4'},
    {id:2051,m:40.00,pc:'Metaphor Refantazio',c:'Asian English Playstation 4'},
    {id:525,m:9.90,pc:'Geometry Wars 3: Dimensions Evolved',c:'Playstation 4'},
    {id:1660,m:38.63,pc:'LocoRoco 2',c:'Asian English Playstation 4'},
    {id:2239,m:35.74,pc:'Breakers Collection',c:'PAL Playstation 4'},
    {id:2240,m:25.00,pc:'Zero Tolerance Collection',c:'Playstation 4'},
    {id:2242,m:25.57,pc:'JaJaMaru Legendary Ninja Collection',c:'PAL Playstation 4'},
    {id:2243,m:26.65,pc:'Irem Collection Volume 1',c:'PAL Playstation 4'},
    {id:2244,m:22.00,pc:'Puzzle Bobble 3D Vacation Odyssey',c:'Playstation 4'},
    {id:2245,m:51.23,pc:'Eschatos',c:'PAL Playstation 4'},
    {id:2247,m:23.13,pc:'Warhammer 40,000: Shootas, Blood & Teef',c:'Playstation 4'},
    {id:2248,m:52.50,pc:'Cotton Guardian Force: Saturn Tribute',c:'PAL Playstation 4'},
    {id:2249,m:20.68,pc:'Shadow Of The Ninja Reborn',c:'PAL Playstation 4'},
    {id:2250,m:19.99,pc:'Cotton Fantasy',c:'Playstation 4'},
    {id:2251,m:15.27,pc:'Star Renegades',c:'Playstation 4'},
    {id:2252,m:13.42,pc:'Umihara Kawase Bazooka',c:'Playstation 4'},
    {id:2253,m:35.00,pc:'Clockwork Aquario',c:'Playstation 4'},
    {id:2254,m:28.96,pc:'Bubble Bobble 4 Friends: The Baron is Back',c:'Playstation 4'},
    {id:2255,m:45.82,pc:'Wonder Boy Anniversary Collection',c:'PAL Playstation 4'},
    {id:2258,m:24.26,pc:'Spelunker HD Deluxe',c:'PAL Playstation 4'},
    {id:2259,m:51.04,pc:'DeathSmiles I & II',c:'Playstation 4'},
    {id:2260,m:18.95,pc:'Asterix & Obelix Slap Them All',c:'PAL Playstation 4'},
    {id:2261,m:19.99,pc:'Cotton Reboot',c:'Playstation 4'},
    {id:2262,m:23.94,pc:'Turrican Anthology Vol. 1',c:'PAL Playstation 4'},
    {id:2263,m:27.12,pc:'Turrican Anthology Vol. 2',c:'PAL Playstation 4'}
  ];
  const DIRECT=[
    ['2Dark',30.94,'2Dark [Limited Edition]','PAL Playstation 4'],
    ['3D MiniGolf',29.99,'3D Mini Golf','Playstation 4'],
    ['9th Dawn III',27.70,'9th Dawn III: Shadow of Erthil','Playstation 4'],
    ['Another World: 20th Anniversary Edition',26.27,'Another World','Playstation 4'],
    ['Aokana - Four Rhythms Across the Blue',44.00,'Aokana Ao no Kanata no Four Rhythm Across the Blue','JP Playstation 4'],
    ['Aqua Kitty: Milk Mine Defender DX',20.60,'Aqua Kitty DX','Playstation 4'],
    ['Armello',11.63,'Armello [Special Edition]','Playstation 4'],
    ['Bit.Trip Presents...Runner2: Future Legend of Rhythm Alien',17.63,'Runner2','Playstation 4'],
    ['BLACKHOLE: Complete Edition',19.99,'Black Hole','Playstation 4'],
    ['Below',22.24,'Below [SteelBook Edition]','Playstation 4'],
    ['Chaos;Child',20.00,'Chaos Child','Playstation 4'],
    ["Chocobo's Mystery Dungeon: Every Buddy!",28.57,"Chocobo's Mystery Dungeon: Every Buddy",'JP Playstation 4'],
    ['Clannad',47.61,'Clannad','JP Playstation 4'],
    ['Marvel’s Avengers',11.12,'Marvel Avengers','Playstation 4'],
    ["Marvel's Avengers",11.12,'Marvel Avengers','Playstation 4'],
    ['Marvel’s Spider-Man',13.20,'Marvel Spiderman','Playstation 4'],
    ["Marvel's Spider-Man",13.20,'Marvel Spiderman','Playstation 4'],
    ['Mighty Gunvolt Burst',24.84,'Gal Gunvolt Burst','Playstation 4'],
    ['Minecraft: Story Mode - Season Two: The Telltale Series',46.00,'Minecraft: Story Mode Season Two','Playstation 4'],
    ['MISTOVER',26.84,'Mistover','Asian English Playstation 4'],
    ['Momodora: Reverie Under the Moonlight',35.00,'Momodora','Playstation 4'],
    ['N++',15.28,'N++','Playstation 4'],
    ['NeuroVoider',17.92,'Neuro Voider','Playstation 4'],
    ['Alienation',20.68,'Alienation','JP Playstation 4'],
    ['AereA',10.77,"Aerea [Collector's Edition]",'Playstation 4'],
    ['Among Us',26.34,'Among Us [Imposter Edition]','Playstation 4'],
    ['Mutant Football League',13.76,'Mutant Football League Dynasty Edition','Playstation 4'],
    ['Furwind',29.27,'Furwind [Limited Edition]','Playstation 4'],
    ['Gearshifters',14.97,'Gear Shifters','Playstation 4'],
    ['Ground Zero: Texas',40.00,'Ground Zero Texas: Nuclear Edition','Playstation 4'],
    ['Habroxia 2',46.03,'Habroxia 2 [Limited Edition]','Playstation 4'],
    ['Steins;Gate 0',19.93,'Steins Gate 0','Playstation 4'],
    ['Steins;Gate Elite',23.00,'Steins Gate Elite','Playstation 4'],
    ['8-Bit Adventure Anthology: Volume One',32.47,'8-Bit Adventure Anthology','Playstation 4'],
    ["Agatha Christie's The ABC Murders",12.26,'Agatha Christie: The ABC Murders','Playstation 4'],
    ['Aces of the Luftwaffe',19.99,'Aces of The Luftwaffe Squadron','Playstation 4'],
    ['Romancing SaGa 2',36.21,'Romancing SaGa 2','Asian English Playstation 4'],
    ['Romancing SaGa 3',37.50,'Romancing SaGa 3','Asian English Playstation 4'],
    ['RollerCoaster Tycoon Joyride',15.63,'Roller Coaster Tycoon Joyride','Playstation 4'],
    ['Runbow',10.27,'Runbow Deluxe Edition','Playstation 4'],
    ['Samurai Maiden',37.29,'Samurai Maiden','JP Playstation 4'],
    ['Warhammer 40,000: Mechanicus',29.99,'Warhammer 40000 Mechanicus','Playstation 4'],
    ['Weird West',34.95,'Weird West [Reserve Edition]','Playstation 4'],
    ['Back to the Future: The Game',89.35,'Back to the Future: The Game 30th Anniversary','Playstation 4'],
    ['Asterix & Obelix XXL 2',11.59,'Asterix & Obelix XXL2','PAL Playstation 4'],
    ['Batman: The Enemy Within - The Telltale Series',27.06,'Batman: The Enemy Within','PAL Playstation 4'],
    ['Verdun',19.74,'WWI Verdun Western Front','PAL Playstation 4'],
    ['Wattam',44.63,'Wattam [Sushi Variant]','Playstation 4']
  ];
  const PRODUCT_ONLY=[
    ['Galak-Z: The Void','Galak-Z: The Void & Skulls of the Shogun: Bone-A-Fide',10.15,'Playstation 4'],
    ['Ara Fell: Enhanced Edition','Ara Fell & Rise of the Third Power',39.78,'Playstation 4'],
    ["OK K.O.! Let's Play Heroes",'Steven Universe: Save The Light & OK KO Lets Play Heroes',26.36,'Playstation 4'],
    ['Monopoly Plus','Monopoly Plus & Monopoly Madness',11.01,'Playstation 4'],
    ['Robotics;Notes DaSH','Robotics Notes Elite and Dash Double Pack',19.99,'Playstation 4'],
    ['Robotics;Notes Elite','Robotics Notes Elite and Dash Double Pack',19.99,'Playstation 4'],
    ['Pac-Man Championship Edition 2','Pac-Man Championship Edition 2 + Arcade Game Series',11.39,'Playstation 4'],
    ['Planescape: Torment: Enhanced Edition','Planescape: Torment & Icewind Dale Enhanced Editions',18.85,'Playstation 4'],
    ['The Journey Down: Chapter One','The Journey Down Trilogy',51.15,'PAL Playstation 4'],
    ['The Journey Down: Chapter Two','The Journey Down Trilogy',51.15,'PAL Playstation 4'],
    ['The Journey Down: Chapter Three','The Journey Down Trilogy',51.15,'PAL Playstation 4']
  ];
  let tries=0;
  const apply=()=>{
    tries++;
    if(typeof byId==='undefined'||typeof stateCache==='undefined'||!stateCache||typeof saveState!=='function'||typeof pcNormTitle!=='function'){if(tries<120)setTimeout(apply,100);return;}
    const map=new Map((stateCache.prices||[]).map(p=>[pcNormTitle(p.t),p]));let added=0;
    const put=(x,m,pc,c)=>{if(!x||x.set!=='INCLUDED')return;const k=pcNormTitle(x.title);if(map.has(k))return;map.set(k,{t:x.title,m,s:+(m*.70).toFixed(2),g:+(m*.85).toFixed(2),x:+(m*1.10).toFixed(2),pc,c,source:'PriceCharting verified direct audit'});added++;};
    for(const e of EXTRA)put(byId.get(e.id),e.m,e.pc,e.c);
    const titleMap=new Map();for(const x of byId.values())if(x&&x.title)titleMap.set(pcNormTitle(x.title),x);
    for(const [t,m,pc,c] of DIRECT)put(titleMap.get(pcNormTitle(t)),m,pc,c);
    if(added){stateCache={...stateCache,version:14,prices:[...map.values()].sort((a,b)=>a.t.localeCompare(b.t)),priceSupplement:'2026-08-28-v049'};saveState(stateCache);if(typeof resetBrowse==='function')resetBrowse();}
    window.SHELFCHECK_PC_V049={verifiedIdentityPrices:EXTRA.length+DIRECT.length,added,total:(stateCache.prices||[]).length,productOnly:PRODUCT_ONLY.map(([identity,product,m,c])=>({identity,product,m,c})),noReliablePriceYet:[]};
  };
  apply();
})();