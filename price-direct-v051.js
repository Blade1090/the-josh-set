// ShelfCheck v0.51 — PriceCharting full-catalog recovery batch.
// Mappings were discovered from the user's full PriceCharting PS4 catalog export,
// then CIB values were verified against the matching PriceCharting product pages.
(()=>{
  const DIRECT=[
    ['99Vidas',68.70,'99 Vidas','PAL Playstation 4'],
    ['ADK Tamashii',40.21,'ADK Damashii','Playstation 4'],
    ['Damascus Gear: Operation Osaka',26.00,'Damascus Gear Operation Osaka HD Edition','Playstation 4'],
    ['Deer Simulator',23.80,'DEEEER Simulator','Playstation 4'],
    ['Dragon Sinker',23.93,'Dragon Sinker: Descendants of Legend','Playstation 4'],
    ['Earth Defense Force: Iron Rain',87.98,'Earth Defense Force: Iron Rain','Asian English Playstation 4'],
    ['Earthlock',24.90,'Earthlock Festival of Magic','Playstation 4'],
    ['Ghost 1.0',74.00,'Ghost 1.0 [Limited Edition]','Playstation 4'],
    ['Giraffe and Annika',32.95,'Giraffe and Annika [Musical Mayhem Edition]','Playstation 4'],
    ['Hatsune Miku: Project Diva Future Tone',42.04,'Hatsune Miku Project Diva Future Tone DX','JP Playstation 4'],
    ['Helldivers',24.99,'Helldivers: Super-Earth [Ultimate Edition]','Playstation 4'],
    ['Human: Fall Flat',13.50,'Human Fall Flat [Anniversary Edition]','Playstation 4'],
    ['LocoRoco',31.17,'LocoRoco','Asian English Playstation 4'],
    ['PAWARUMI',57.91,'Pawarumi [Limited Edition]','Playstation 4'],
    ['Phantom Breaker: Battle Grounds Overdrive',27.49,'Phantom Breaker Battlegrounds Overdrive','Playstation 4'],
    ['Romancing SaGa 2: Revenge of the Seven',47.85,'Romancing SaGa 2: Revenge Of The Seven','JP Playstation 4'],
    ['Semispheres',17.50,'Semispheres [Blue]','Playstation 4'],
    ['Shadow of the Beast',48.98,'Shadow of the Beast','Asian English Playstation 4'],
    ['Smashing the Battle: Ghost Soul',54.99,'Smashing the Battle: Ghost Soul [Limited Edition]','Playstation 4'],
    ['SOL CRESTA',36.99,'Sol Cresta: Dramatic Edition','Playstation 4'],
    ['The Coma: Recut',89.99,'The Coma: Recut [Limited Edition]','Playstation 4'],
    ['The Crew: Wild Run',8.44,'The Crew Wild Run Edition','Playstation 4'],
    ['The Girl and the Robot',13.97,'The Girl and the Robot Deluxe Edition','Playstation 4'],
    ['Trouble Witches Final: Episode 1 - Daughters of Amalgam',33.68,'Trouble Witches Final! Episode 01: Daughters Of Amalgam','PAL Playstation 4'],
    ['Undead Darlings ~no cure for love~',23.50,'Undead Darlings: No Cure For Love','Playstation 4'],
    ['Velocity 2X',14.74,'Velocity 2X: Critical Mass Edition','Playstation 4'],
    ["Baldur's Gate and Baldur's Gate II: Enhanced Editions",59.99,"Baldur's Gate 1 & 2 Enhanced Edition",'Playstation 4'],
    ['Dying Light: The Following',11.28,'Dying Light The Following Enhanced Edition','Playstation 4'],
    ['Space Hulk: Deathwing',12.22,'Space Hulk Deathwing Enhanced Edition','Playstation 4'],
    ['The Walking Dead: A Telltale Games Series - The Complete First Season',13.41,'The Walking Dead: Complete First Season','PAL Playstation 4'],
    ['The Walking Dead: The Telltale Series - A New Frontier',9.05,'The Walking Dead: A New Frontier','Playstation 4'],
    ['The Walking Dead: The Telltale Series - The Final Season',13.51,'The Walking Dead: Final Season','Playstation 4'],
    ['Ys: Memories of Celceta - Kai',27.45,'Ys: Memories of Celceta','Playstation 4'],
    ['Diablo III: Ultimate Evil Edition',11.99,'Diablo III Reaper of Souls [Ultimate Evil Edition]','Playstation 4'],
    ['Forgotten City',13.96,'The Forgotten City','JP Playstation 4'],
    ['Skylanders Swap Force',113.46,'Skylanders Swap Force [Game Only]','Playstation 4'],
    ['Unravel',50.00,"Unravel [Collector's Edition]",'Playstation 4'],
    ['Ys X: Nordics',45.08,'Ys X: Nordics [Limited Edition]','Playstation 4']
  ];
  let tries=0;
  const apply=()=>{
    tries++;
    if(typeof byId==='undefined'||typeof stateCache==='undefined'||!stateCache||typeof saveState!=='function'||typeof pcNormTitle!=='function'){if(tries<120)setTimeout(apply,100);return;}
    const map=new Map((stateCache.prices||[]).map(p=>[pcNormTitle(p.t),p]));let added=0;
    const titleMap=new Map();for(const x of byId.values())if(x&&x.title)titleMap.set(pcNormTitle(x.title),x);
    for(const [t,m,pc,c] of DIRECT){const x=titleMap.get(pcNormTitle(t));if(!x||x.set!=='INCLUDED')continue;const k=pcNormTitle(x.title);if(map.has(k))continue;map.set(k,{t:x.title,m,s:+(m*.70).toFixed(2),g:+(m*.85).toFixed(2),x:+(m*1.10).toFixed(2),pc,c,source:'PriceCharting full-catalog verified v051'});added++;}
    if(added){stateCache={...stateCache,version:16,prices:[...map.values()].sort((a,b)=>a.t.localeCompare(b.t)),priceSupplement:'2026-08-28-v051'};saveState(stateCache);if(typeof resetBrowse==='function')resetBrowse();}
    window.SHELFCHECK_PC_V051={verifiedIdentityPrices:DIRECT.length,added,total:(stateCache.prices||[]).length};
  };
  apply();
})();
