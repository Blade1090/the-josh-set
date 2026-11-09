// ShelfCheck pricing — batch 010 (GameStop discovery Batch 06, 2026-11-09).
//
// 30 Batch 06 identities priced from the same opened PriceCharting PS4 / PAL PS4 product pages used as
// their physical evidence (CIB / complete price). Guarded exactly like every prior batch file: only fills a
// title with no existing price, never overwrites.
(()=>{
  const DIRECT=[
    ["Pure Pool",14.57,"Pure Pool","Playstation 4"],
    ["Disney Dreamlight Valley",45,"Disney's Dreamlight Valley: Cozy Edition","Playstation 4"],
    ["Skull Island: Rise of Kong",16.13,"Skull Island: Rise of Kong","Playstation 4"],
    ["AEW: Fight Forever",13.07,"AEW: Fight Forever","Playstation 4"],
    ["NASCAR Arcade Rush",13.48,"NASCAR Arcade Rush","Playstation 4"],
    ["Big Buck Hunter Arcade",10.4,"Big Buck Hunter Arcade","Playstation 4"],
    ["The Quest for Excalibur: Puy du Fou",10,"The Quest For Excalibur: Puy Du Fou","Playstation 4"],
    ["Werewolf: The Apocalypse - Heart of the Forest",14.99,"Werewolf The Apocalypse: Heart of the Forest","Playstation 4"],
    ["World Quiz",10.99,"World Quiz","Playstation 4"],
    ["My Universe: Fashion Boutique",11.99,"My Universe Fashion Boutique","Playstation 4"],
    ["My Universe: Puppies & Kittens",14.58,"My Universe: Puppies and Kittens","Playstation 4"],
    ["My Universe: My Baby",12.85,"My Universe My Baby","Playstation 4"],
    ["My Universe: Cooking Star Restaurant",14.56,"My Universe Cooking Star Restaurant","Playstation 4"],
    ["My Universe: School Teacher",8.18,"My Universe School Teacher","Playstation 4"],
    ["My Universe: Doctors & Nurses",8,"My Universe: Doctors & Nurses","Playstation 4"],
    ["My Universe: Pet Clinic Cats & Dogs",12.95,"My Universe: Pet Clinic: Cats & Dogs","Playstation 4"],
    ["Santa's Xmas Adventure",5.93,"Santa's Xmas Adventure","Playstation 4"],
    ["Cry Babies Magic Tears: The Big Game",13.98,"Cry Babies Magic Tears: The Big Game","Playstation 4"],
    ["Pickleball: Smash",5,"Pickleball: Smash","Playstation 4"],
    ["Worms Rumble",10.64,"Worms Rumble: Fully Loaded Edition","Playstation 4"],
    ["Spike Volleyball",22.1,"Spike Volleyball","Playstation 4"],
    ["The Outbound Ghost",16.99,"The Outbound Ghost","Playstation 4"],
    ["Mars Odyssey",13,"Mars Odyssey","Playstation 4"],
    ["Ninja Kidz: Time Masters",13.2,"Ninja Kidz: Time Masters","Playstation 4"],
    ["Doki Doki Literature Club Plus!",25.75,"Doki Doki Literature Club Plus","Playstation 4"],
    ["Crazy Chicken Xtreme",12.65,"Crazy Chicken Xtreme","Playstation 4"],
    ["RiffTrax: The Game",25.95,"Rifftrax: The Game","Playstation 4"],
    ["Professor Rubik's Brain Fitness",12.95,"Professor Rubik's Brain Fitness","Playstation 4"],
    ["Firefighting Simulator: The Squad",16.56,"Firefighting Simulator - The Squad","PAL Playstation 4"],
    ["Postal 4: No Regerts",44.23,"Postal 4: No Regerts","Playstation 4"]
  ];
  let tries=0;
  const apply=()=>{
    tries++;
    if(typeof byId==='undefined'||typeof stateCache==='undefined'||!stateCache||typeof saveState!=='function'||typeof pcNormTitle!=='function'){if(tries<120)setTimeout(apply,100);return;}
    const map=new Map((stateCache.prices||[]).map(p=>[pcNormTitle(p.t),p]));let added=0;
    const titleMap=new Map();for(const x of byId.values())if(x&&x.title)titleMap.set(pcNormTitle(x.title),x);
    for(const [t,m,pc,c] of DIRECT){const x=titleMap.get(pcNormTitle(t));if(!x||x.set!=='INCLUDED')continue;const k=pcNormTitle(x.title);if(map.has(k))continue;map.set(k,{t:x.title,m,s:+(m*.70).toFixed(2),g:+(m*.85).toFixed(2),x:+(m*1.10).toFixed(2),pc,c,source:'PriceCharting verified — GameStop discovery batch 010'});added++;}
    if(added){stateCache={...stateCache,version:19,prices:[...map.values()].sort((a,b)=>a.t.localeCompare(b.t)),priceSupplement:'2026-11-09-batch-010'};saveState(stateCache);if(typeof resetBrowse==='function')resetBrowse();}
    window.SHELFCHECK_PRICE_BATCH_010={verifiedIdentityPrices:DIRECT.length,added,total:(stateCache.prices||[]).length};
  };
  apply();
})();
