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
    ['Tharsis',12.99,'Tharsis [Limited Edition]','Playstation 4']
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
