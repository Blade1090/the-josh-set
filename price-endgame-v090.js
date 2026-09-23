// ShelfCheck pricing — endgame staging pass v0.90 (ChatGPT, 2026-09-23).
//
// Consolidates the externally-adjudicated remainder without rewriting earlier campaign files.
// Loaded OUTSIDE price-no-reliable-data-v089.js. Existing real prices always win; this
// pass only replaces null/NO_RELIABLE_DATA with a newly verified direct/product route,
// or marks a newly-researched identity NO_RELIABLE_DATA. No stateCache/localStorage writes.
(()=>{
  const DIRECT=new Map([
    [1525,{m:38.6,product:"Like A Dragon Gaiden: The Man Who Erased His Name",region:"Asian English"}],
    [1761,{m:27.5,product:"Swords Of Ditto: Mormo's Curse",region:"US"}],
    [1770,{m:15.45,product:"Transference",region:"JP"}],
    [1796,{m:61.58,product:"Aleste Collection",region:"JP"}],
    [1846,{m:20.02,product:"Skautfold: Into The Fray",region:"PAL"}],
    [2049,{m:47.45,product:"The Legend of Heroes: Trails through Daybreak II",region:"PAL"}],
    [2058,{m:38.48,product:"ENDER MAGNOLIA: Bloom in the Mist",region:"JP"}],
    [2313,{m:37.82,product:"GYLT",region:"PAL"}],
    [2329,{m:45.0,product:"NeverAwake",region:"JP"}],
    [2330,{m:28.95,product:"Neversong",region:"PAL"}],
    [2342,{m:42.78,product:"Scourge Bringer",region:"PAL"}],
    [2348,{m:28.56,product:"Souldiers",region:"PAL"}],
    [2363,{m:49.38,product:"Unicorn Overlord",region:"JP"}],
    [2385,{m:57.99,product:"Headliner: NoviNews",region:"JP"}],
    [2389,{m:31.0,product:"Liberated",region:"JP"}],
    [2390,{m:29.69,product:"Loopers",region:"JP"}],
    [2392,{m:37.24,product:"Marchen Forest",region:"JP"}],
    [2397,{m:42.57,product:"Obduction",region:"JP"}],
    [2399,{m:16.44,product:"Puyo Puyo eSports",region:"JP"}],
    [2409,{m:37.58,product:"Trailmakers",region:"JP"}],
    [2410,{m:30.94,product:"Touhou Genso: Wanderer Reloaded",region:"Western/localized physical"}],
    [2443,{m:23.24,product:"Zapling Bygone",region:"PAL"}],
    [2465,{m:57.33,product:"Rolling Gunner + Over Power",region:"PAL"}],
    [2497,{m:15.92,product:"Asterix & Obelix XXXL: The Ram from Hibernia",region:"PAL"}],
    [2504,{m:37.32,product:"Atelier Yumia: The Alchemist Of Memories & The Envisioned Land",region:"PAL"}],
    [2523,{m:36.25,product:"Blade Arcus Rebellion from Shining",region:"JP"}],
    [2524,{m:27.78,product:"Blade Arcus from Shining EX",region:"JP"}],
    [2538,{m:43.61,product:"Bullet Girls Phantasia",region:"Asian English"}],
    [2539,{m:44.38,product:"Bunny Must Die! Chelsea and the 7 Devils",region:"PAL"}],
    [2590,{m:75.0,product:"Gene Rain",region:"Asian English"}],
    [2598,{m:13.28,product:"Hand Of Fate 2",region:"Asian English"}],
    [2607,{m:63.43,product:"Hishou Same! Same! Same",region:"JP"}],
    [2613,{m:27.08,product:"Infinity Strash: Dragon Quest The Adventure of Dai",region:"JP"}],
    [2649,{m:29.5,product:"Legend Of Legacy HD Remastered Deluxe Edition",region:"US"}],
    [2650,{m:23.95,product:"Legend of Mana",region:"Asian English"}],
    [2652,{m:3.41,product:"Mad Games Tycoon",region:"PAL"}],
    [2666,{m:55.27,product:"Octopath Traveler 0",region:"JP"}],
    [2710,{m:39.94,product:"SD Gundam Battle Alliance",region:"Asian English"}],
    [2763,{m:19.62,product:"The Cruel King and the Great Hero",region:"Localized physical"}],
    [2766,{m:91.48,product:"Xuan-Yuan Sword: The Gate of Firmament",region:"Asian English"}],
    [2778,{m:45.97,product:"Zero Fire Toaplan Arcade Garage",region:"JP"}],
  ]);
  const PRODUCT=new Map([
    [226,{m:49.17,product:"Capcom Belt Action Collection",region:"JP/Asia"}],
    [1635,{m:17.78,product:"Heavy Rain & Beyond: Two Souls",region:"PAL"}],
    [2111,{m:17.78,product:"Heavy Rain & Beyond: Two Souls",region:"PAL"}],
    [1675,{m:8.81,product:"Monopoly Plus & Monopoly Madness",region:"US"}],
    [1697,{m:109.99,product:"Prototype Biohazard Bundle",region:"US"}],
    [1747,{m:14.95,product:"Banner Saga Trilogy: Bonus Edition",region:"US"}],
    [2220,{m:14.95,product:"Banner Saga Trilogy: Bonus Edition",region:"US"}],
    [2221,{m:14.95,product:"Banner Saga Trilogy: Bonus Edition",region:"US"}],
    [1762,{m:12.99,product:"The Walking Dead: The Telltale Definitive Series",region:"US"}],
    [1778,{m:35.38,product:"The New York Bundle",region:"US/PAL"}],
    [1799,{m:51.47,product:"Don't Starve Mega Pack",region:"US/PAL"}],
    [2205,{m:32.5,product:"Apollo Justice: Ace Attorney Trilogy",region:"Asian English"}],
    [2206,{m:32.5,product:"Apollo Justice: Ace Attorney Trilogy",region:"Asian English"}],
    [2207,{m:32.5,product:"Apollo Justice: Ace Attorney Trilogy",region:"Asian English"}],
    [2214,{m:12.68,product:"Commandos 2 & Praetorians HD Remaster Double Pack",region:"PAL"}],
    [2215,{m:12.68,product:"Commandos 2 & Praetorians HD Remaster Double Pack",region:"PAL"}],
    [2475,{m:61.47,product:"Shadowrun Trilogy (LRG #481)",region:"US"}],
  ]);
  const NORD=new Map([
    [1586,{product:"Capcom Arcade Stadium",region:"",reason:"Known physical product context; no defensible CIB."}],
    [1638,{product:"Hidden Through Time",region:"",reason:"Physical route: Hidden Through Time: Definitive Edition (EU/ININ; barcode 4260650744198). Same base identity/edition."}],
    [1644,{product:"Infinite: Beyond the Mind",region:"",reason:"Confirmed PAL physical; no defensible CIB."}],
    [1845,{product:"Romancing SaGa -Minstrel Song- Remastered",region:"",reason:"Asian English physical; no usable CIB."}],
    [1848,{product:"Itorah",region:"",reason:"Red Art PS4 physical; exact product has no usable market data."}],
    [1970,{product:"Vesper: Zero Light Edition",region:"",reason:"Strictly Limited PS4 physical; no PS4 CIB market."}],
    [2057,{product:"River City Saga: Three Kingdoms Next",region:"",reason:"Asian English physical confirmed; current retail exists but no defensible used/CIB secondary market."}],
    [2063,{product:"Guns N' Runs",region:"",reason:"PixelHeart PS4 physical; zero market data."}],
    [2338,{product:"Ravenswatch",region:"",reason:"Legendary Edition PAL PS4 physical; zero CIB."}],
    [2370,{product:"Dogfighter WW2",region:"",reason:"JP physical confirmed; no CIB."}],
    [2378,{product:"Everyone Spelunker",region:"",reason:"JP physical; no market values."}],
    [2408,{product:"Tetsudou Nippon! Rosen Tabi: Eizan Densha-Hen",region:"",reason:"JP physical; no market values."}],
    [2424,{product:"Marooners",region:"",reason:"PAL physical; no CIB."}],
    [2429,{product:"Noob: Les Sans-Factions",region:"",reason:"PAL physical; no CIB."}],
    [2431,{product:"PlateUp",region:"",reason:"PS4 Standard/Collector physical; tracked pages have no market."}],
    [2541,{product:"Buried Stars",region:"",reason:"Korean physical with English; no clean CIB."}],
    [2566,{product:"Dead Craft",region:"",reason:"Asian English physical; no market values."}],
    [2568,{product:"Earth Defense Force: World Brothers",region:"",reason:"Asian English physical; no reliable CIB. Do not substitute JP price."}],
    [2669,{product:"Offroad Racing - Buggy x ATV x Moto",region:"",reason:"PAL product page; zero market."}],
    [2696,{product:"The Quintessential Quintuplets: Five Memories Spent With You",region:"",reason:"English-localized PS4 physical exists; safest no-data classification rather than substituting JP/sequel values."}],
    [2707,{product:"Raidou Remastered: The Mystery of the Soulless Army",region:"",reason:"US exact product known; zero market data."}],
    [2767,{product:"Yasha: Legends of the Demon Blade",region:"",reason:"Asian English physical; no CIB."}],
    [2773,{product:"Your Toy",region:"",reason:"JP physical retail confirmed; no resale CIB."}],
    [2779,{product:"Zero: Tsukihami No Kamen",region:"",reason:"JP PS4 physical; no market values."}],
    [2782,{product:"Russian Subway Dogs",region:"",reason:"US/LRG physical page; zero market data."}],
  ]);

  let tries=0;
  const apply=()=>{
    tries++;
    if(typeof priceFor!=='function'||typeof norm!=='function'||!window.SHELFCHECK_NO_RELIABLE_DATA){if(tries<200)setTimeout(apply,100);return;}
    if(window.__SHELFCHECK_ENDGAME_V090_WRAPPED)return;
    window.__SHELFCHECK_ENDGAME_V090_WRAPPED=true;
    const prev=priceFor;
    const real=p=>p&&Number.isFinite(Number(p.m??p.x))&&Number(p.m??p.x)>0;
    const priced=(x,rec,kind)=>{const m=Number(rec.m);return {t:x.title,m,s:+(m*.70).toFixed(2),g:+(m*.85).toFixed(2),x:+(m*1.10).toFixed(2),pc:rec.product,c:rec.region,source:`PriceCharting verified — endgame ${kind}`,productInherited:kind==='product-inherited',productTitle:kind==='product-inherited'?rec.product:undefined};};
    priceFor=function(x){
      const prior=prev(x);
      if(real(prior))return prior; // user/import/public/earlier direct/product price always wins
      const d=DIRECT.get(x.id); if(d)return priced(x,d,'direct');
      const pr=PRODUCT.get(x.id); if(pr)return priced(x,pr,'product-inherited');
      const n=NORD.get(x.id); if(n)return {t:x.title,m:null,x:null,noReliableData:true,product:n.product,region:n.region,reason:n.reason,researchedAt:'2026-09-23',source:'ShelfCheck endgame adjudication; exact physical route confirmed, no defensible CIB market value'};
      return prior||null;
    };
    window.SHELFCHECK_ENDGAME_V090={direct:DIRECT.size,productInherited:PRODUCT.size,noReliableData:NORD.size,heldManualIds:[237,1627,2224,2225,2226,2665]};
    if(typeof resetBrowse==='function')resetBrowse(); if(typeof render==='function')render();
  }; apply();
})();
