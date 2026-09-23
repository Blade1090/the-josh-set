// ShelfCheck pricing campaign — Phase 3 batch 006 (54 verified identities).
// Sourced from the bulk PriceCharting scan (tools/price-bulk-pricecharting-scan.mjs,
// audit-out/price-bulk-scan-report.json, bucket HIGH_CONFIDENCE_US_PAL) run 2026-09-22, then
// individually verified: exact-title match construction, cross-checked against every prior
// REVIEW/NO_DATA/MODEL_REVIEW flag and every compilation-component id, price-range sanity
// across all 54, and 12 direct live re-checks (including two flagged items resolved clean --
// see audit-out/pricing-batch-006.md for the full verification writeup). CIB preferred
// throughout; no loose/sealed substitution.
//
// Guarded exactly like every prior batch file: only fills a title with no existing price,
// never overwrites -- if a price appeared for any of these from other work since
// verification, that existing value is preserved untouched.
(()=>{
  const DIRECT=[
    ["Bluey's Quest for the Gold Pen",46.12,"Bluey's Quest For The Gold Pen","Playstation 4"],
    ["Gigabash",52.49,"Gigabash","Playstation 4"],
    ["Mystik Belle",27.50,"Mystik Belle","Playstation 4"],
    ["Ruinverse",14.99,"Ruinverse","Playstation 4"],
    ["Sheepo",14.23,"Sheepo","Playstation 4"],
    ["Skabma Snowfall",20.09,"Skabma Snowfall","PAL Playstation 4"],
    ["Supraland",27.51,"Supraland","Playstation 4"],
    ["The Infectious Madness of Doctor Dekker",30.94,"The Infectious Madness of Doctor Dekker","Playstation 4"],
    ["Distrust",52.31,"Distrust","PAL Playstation 4"],
    ["Indiecalypse",81.18,"Indiecalypse","PAL Playstation 4"],
    ["Nippon Marathon",14.83,"Nippon Marathon","PAL Playstation 4"],
    ["Protodroid Delta",16.51,"Protodroid Delta","Playstation 4"],
    ["Animal Hospital",29.60,"Animal Hospital","PAL Playstation 4"],
    ["Do Not Open",36.44,"Do Not Open","PAL Playstation 4"],
    ["Drawfighters",16.52,"Drawfighters","PAL Playstation 4"],
    ["Malnazidos",40.85,"Malnazidos","PAL Playstation 4"],
    ["Memorrha",9.29,"Memorrha","PAL Playstation 4"],
    ["Adam Wolfe",15.99,"Adam Wolfe","PAL Playstation 4"],
    ["Akiba's Trip: Hellbound & Debriefed",22.00,"Akiba's Trip: Hellbound & Debriefed","Playstation 4"],
    ["Asdivine Cross",20.18,"Asdivine Cross","Playstation 4"],
    ["Asdivine Saga",20.33,"Asdivine Saga","Playstation 4"],
    ["Ash of Gods: Redemption",5.94,"Ash of Gods: Redemption","PAL Playstation 4"],
    ["Asterix & Obelix: Heroes",9.88,"Asterix & Obelix: Heroes","PAL Playstation 4"],
    ["Atari Mania",22.51,"Atari Mania","Playstation 4"],
    ["Atelier Ryza 2: Lost Legends & the Secret Fairy",38.02,"Atelier Ryza 2: Lost Legends & The Secret Fairy","Playstation 4"],
    ["Atelier Ryza 3: Alchemist of the End & the Secret Key",36.50,"Atelier Ryza 3: Alchemist of the End & the Secret Key","Playstation 4"],
    ["Baby Shark: Sing & Swim Party",8.83,"Baby Shark: Sing & Swim Party","Playstation 4"],
    ["Barbie Project Friendship",19.95,"Barbie Project Friendship","Playstation 4"],
    ["Battle Of Rebels",17.95,"Battle Of Rebels","Playstation 4"],
    ["Beyond Enemy Lines 2: Enhanced Edition",14.92,"Beyond Enemy Lines 2: Enhanced Edition","PAL Playstation 4"],
    ["Beyond Good & Evil: 20th Anniversary Edition",49.94,"Beyond Good & Evil: 20th Anniversary Edition","Playstation 4"],
    ["Black Book",47.99,"Black Book","Playstation 4"],
    ["Bleach: Rebirth Of Souls",40.31,"Bleach: Rebirth Of Souls","PAL Playstation 4"],
    ["Bounty Battle",3.97,"Bounty Battle","PAL Playstation 4"],
    ["Bratz Rhythm & Style",18.22,"Bratz Rhythm & Style","PAL Playstation 4"],
    ["Broken Pieces",18.84,"Broken Pieces","PAL Playstation 4"],
    ["Bunny Park",18.48,"Bunny Park","Playstation 4"],
    ["Charon's Staircase",16.66,"Charon's Staircase","Playstation 4"],
    ["Dariusburst: Another Chronicle EX+",18.99,"Dariusburst: Another Chronicle EX+","Playstation 4"],
    ["Hentai Vs. Evil",16.35,"Hentai Vs. Evil","PAL Playstation 4"],
    ["JoJo's Bizarre Adventure: All-Star Battle R",16.09,"JoJo's Bizarre Adventure: All-Star Battle R","Playstation 4"],
    ["Justice Chronicles",27.31,"Justice Chronicles","Playstation 4"],
    ["King's Bounty II",9.99,"King's Bounty II","Playstation 4"],
    ["Naught: Extended Edition",19.23,"Naught: Extended Edition","PAL Playstation 4"],
    ["Outbreak Contagious Memories",32.10,"Outbreak Contagious Memories","Playstation 4"],
    ["Sam & Max: Beyond Time And Space",42.50,"Sam & Max: Beyond Time And Space","Playstation 4"],
    ["Sam & Max: Save the World",31.23,"Sam & Max: Save the World","Playstation 4"],
    ["Tales Of Graces F Remastered",24.84,"Tales Of Graces F Remastered","PAL Playstation 4"],
    ["Unruly Heroes",68.38,"Unruly Heroes","PAL Playstation 4"],
    ["Valiant Hearts: Coming Home",57.52,"Valiant Hearts: Coming Home","Playstation 4"],
    ["Visions Of Mana",22.12,"Visions Of Mana","PAL Playstation 4"],
    ["Yuppie Psycho: Executive Edition",50.92,"Yuppie Psycho: Executive Edition","PAL Playstation 4"],
    ["Made in Abyss: Binary Star Falling into Darkness",23.99,"Made In Abyss: Binary Star Falling Into Darkness","Playstation 4"],
    ["OlliOlli2: Welcome to Olliwood",7.45,"OlliOlli2: Welcome to Olliwood","PAL Playstation 4"]
  ];
  let tries=0;
  const apply=()=>{
    tries++;
    if(typeof byId==="undefined"||typeof stateCache==="undefined"||!stateCache||typeof saveState!=="function"||typeof pcNormTitle!=="function"){if(tries<120)setTimeout(apply,100);return;}
    const map=new Map((stateCache.prices||[]).map(p=>[pcNormTitle(p.t),p]));let added=0;
    const titleMap=new Map();for(const x of byId.values())if(x&&x.title)titleMap.set(pcNormTitle(x.title),x);
    for(const [t,m,pc,c] of DIRECT){const x=titleMap.get(pcNormTitle(t));if(!x||x.set!=="INCLUDED")continue;const k=pcNormTitle(x.title);if(map.has(k))continue;map.set(k,{t:x.title,m,s:+(m*.70).toFixed(2),g:+(m*.85).toFixed(2),x:+(m*1.10).toFixed(2),pc,c,source:"PriceCharting verified — pricing campaign batch 006 (bulk scan + verification pass)"});added++;}
    if(added){stateCache={...stateCache,version:21,prices:[...map.values()].sort((a,b)=>a.t.localeCompare(b.t)),priceSupplement:"2026-09-22-batch-006"};saveState(stateCache);if(typeof resetBrowse==="function")resetBrowse();}
    window.SHELFCHECK_PRICE_BATCH_006={verifiedIdentityPrices:DIRECT.length,added,total:(stateCache.prices||[]).length};
  };
  apply();
})();
