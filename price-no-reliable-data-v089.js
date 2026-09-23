// ShelfCheck pricing state — NO_RELIABLE_DATA (grows across pricing-campaign passes; 18
// identities as of the 2026-09-23 larger-batch endgame pass -- see the Batch 2 comment below).
//
// Distinguishes "not yet researched" (PRICE PENDING) from "exact qualifying physical product
// confirmed, but no defensible CIB market value currently exists" (NO_RELIABLE_DATA). This is
// the OUTERMOST priceFor wrap of all -- it only ever fires after every real tier (user import,
// public/priceMap, x.max, Model A product-inherited) has already returned nothing, so any real
// price added later automatically takes precedence with no registry edit needed: the identity
// simply stops reaching this tier.
//
// NEVER fabricates a numeric value: m/x stay explicitly null. This is a static, code-shipped
// registry, not stateCache/localStorage -- it never touches BACKUP/RESTORE or CSV import.
//
// See the pricing-campaign chat report (CONFIRMED_PHYSICAL pricing pass, 2026-09-23) for full
// per-identity sourcing and escalation history.
(()=>{
  const NO_RELIABLE_DATA=[
    {id:393,title:'Double Dragon & Kunio-kun Retro Brawler Bundle',product:'Double Dragon & Kunio-kun Retro Brawler Bundle',region:'JP',reason:"Confirmed genuine JP physical release with English-language support (no NA physical exists), but no PriceCharting listing exists under any slug tried.",researchedAt:'2026-09-23',source:'PriceCharting (no listing found); Kuniokun Wiki; Arc System Works press coverage'},
    {id:985,title:'Resonance of Fate 4K / HD Edition',product:"Resonance of Fate 4K / HD Edition (Standard/Collector's Edition)",region:'Asian-English',reason:"Arc System Works published physical Standard + Collector's editions in Southeast Asia (Dec 2019), but no PriceCharting listing exists under the Asian-English or JP slugs tried.",researchedAt:'2026-09-23',source:'Gematsu; PriceCharting (no listing found)'},
    {id:1647,title:'Katana Kami: A Way of the Samurai Story',product:'Katana Kami: A Way of the Samurai Story (Multi-Language)',region:'JP / Asian-English',reason:'Confirmed genuine JP multi-language physical release with English text support, importable via Play-Asia, but no PriceCharting listing exists under the JP or Asian-English slugs tried.',researchedAt:'2026-09-23',source:'Play-Asia listing; eBay listing; PriceCharting (no listing found)'},
    {id:1682,title:"Now That's What I Call Sing",product:"Now That's What I Call Sing",region:'PAL',reason:"Koch Media published a physical PAL disc (Oct 2015), but PriceCharting has no listing for this exact title -- both slug attempts redirected to an unrelated Wii title (\"Now That's What I Call Music: Dance & Sing\"), which is NOT used as a substitute price.",researchedAt:'2026-09-23',source:'eBay UK/Amazon listings; PriceCharting (wrong product only)'},
    {id:1793,title:'YIIK: A Postmodern RPG',product:'YIIK: A Postmodern RPG (Limited Run Games)',region:'US',reason:'Limited Run Games physical PS4 release confirmed, but no PriceCharting listing exists under the base or Limited Edition slugs tried.',researchedAt:'2026-09-23',source:'Niche Gamer; PriceCharting (no listing found)'},
    {id:1964,title:'Blast Brigade vs. the Evil Legion of Dr. Cread',product:'Blast Brigade vs. the Evil Legion of Dr. Cread (Standard/Special Limited Edition)',region:'PAL',reason:'Strictly Limited Games published Standard (1,000) and Special Limited (500) physical PS4 editions, but PriceCharting tracks only a PS5 edition of this title -- no PS4 listing exists under any slug tried.',researchedAt:'2026-09-23',source:'Existing dossier; PriceCharting (PS5 edition only)'},
    {id:2068,title:'Beyond the Ice Palace 2',product:'Beyond the Ice Palace 2',region:'PAL',reason:'PQube and PixelHeart published physical PS4 editions (March 2025), but no PriceCharting listing exists under any slug tried.',researchedAt:'2026-09-23',source:'Existing dossier; PriceCharting (no listing found)'},
    {id:2098,title:'Underhero',product:"Underhero (Regular/Collector's Edition)",region:'PAL',reason:"First Press Games published Regular (1,500) and Collector's (250) physical PS4 editions, but PriceCharting tracks only a Nintendo Switch Collector's Edition -- no PS4 listing exists under any slug tried.",researchedAt:'2026-09-23',source:"Existing dossier; PriceCharting (Switch edition only)"},
    // Batch 2 -- larger-batch endgame pricing pass (2026-09-23), same-day follow-up to Batch 1
    // above. See the pricing-campaign chat report for the full 25-identity batch and
    // classification reasoning.
    {id:3,title:'101 Ways to Die',product:'101 Ways to Die',region:'PAL',reason:'Existing dossier confirms a PAL physical release, but PriceCharting has no PS4 product page at all under either region slug tried.',researchedAt:'2026-09-23',source:'Existing dossier; PriceCharting (no listing found)'},
    {id:203,title:'Bridge Constructor',product:'Bridge Constructor',region:'US',reason:'PriceCharting tracks the exact product (confirmed by an earlier bulk scan and re-checked live today), but has zero CIB price data on file.',researchedAt:'2026-09-23',source:'PriceCharting (exact product, no price data)'},
    {id:232,title:'CastleStorm: Definitive Edition',product:'CastleStorm: Definitive Edition',region:'US',reason:'A physical disc appears to genuinely exist per a contemporary review site, but PriceCharting tracks the title with zero price data and no sold-price evidence was found.',researchedAt:'2026-09-23',source:'Prior research (physical-legitimacy queue); PriceCharting (no price data)'},
    {id:378,title:'DISTRAINT: Deluxe Edition',product:'DISTRAINT: Deluxe Edition',region:'US',reason:'Existing dossier confirms a limited physical PS4 edition, but no PriceCharting listing exists under the slug tried.',researchedAt:'2026-09-23',source:'Existing dossier; PriceCharting (no listing found)'},
    {id:569,title:'Hard West Ultimate Edition',product:'Hard West Ultimate Edition',region:'US',reason:'Existing dossier confirms a standard physical release (Forever Entertainment S.A., June 2020), but no PriceCharting listing exists under the slug tried.',researchedAt:'2026-09-23',source:'Existing dossier; PriceCharting (no listing found)'},
    {id:945,title:"Qubit's Quest",product:"Qubit's Quest",region:'US',reason:'PriceCharting tracks the exact product (confirmed by an earlier bulk scan and re-checked live today), but has zero CIB price data on file.',researchedAt:'2026-09-23',source:'PriceCharting (exact product, no price data)'},
    {id:1088,title:"Slayaway Camp: Butcher's Cut",product:"Slayaway Camp: Butcher's Cut",region:'US',reason:'Existing dossier confirms a physical release via Physicality Games (Standard/Deluxe, March 2020); PriceCharting tracks the exact product but has zero CIB price data on file.',researchedAt:'2026-09-23',source:'Existing dossier; PriceCharting (exact product, no price data)'},
    {id:1154,title:'Stranded Deep',product:'Stranded Deep',region:'US',reason:'Existing dossier confirms a physical release (Beam Team Games, April 2020); PriceCharting tracks the exact product but has zero CIB price data on file.',researchedAt:'2026-09-23',source:'Existing dossier; PriceCharting (exact product, no price data)'},
    {id:1187,title:'Surgeon Simulator: Anniversary Edition',product:'Surgeon Simulator: Anniversary Edition',region:'US',reason:'Existing dossier confirms a physical Anniversary Edition, but no PriceCharting listing exists under the slug tried.',researchedAt:'2026-09-23',source:'Existing dossier; PriceCharting (no listing found)'},
    {id:1508,title:'Gori: Cuddly Carnage',product:'Gori: Cuddly Carnage',region:'PAL',reason:'Existing dossier confirms a physical release; PriceCharting tracks the exact product (PAL) but has zero CIB price data on file.',researchedAt:'2026-09-23',source:'Existing dossier; PriceCharting (exact product, no price data)'},
  ];
  const byKey=new Map(NO_RELIABLE_DATA.map(r=>[norm(r.title),r]));

  let tries=0;
  const apply=()=>{
    tries++;
    // Wait specifically for price-product-inherited-v086.js to have already wrapped priceFor
    // (it sets this flag right after wrapping) -- guarantees this tier wraps OUTSIDE Model A
    // deterministically, regardless of <script> tag order, instead of racing two independent
    // setTimeout-retry loops against each other (the same reasoning price-product-inherited-
    // v086.js itself documents for wrapping outside public-prices-full-v066.js).
    if(typeof priceFor!=='function'||typeof norm!=='function'||!window.SHELFCHECK_PRODUCT_INHERITED_PRICING){
      if(tries<200)setTimeout(apply,100);
      return;
    }
    if(window.__SHELFCHECK_NO_RELIABLE_DATA_WRAPPED)return;
    window.__SHELFCHECK_NO_RELIABLE_DATA_WRAPPED=true;

    const prev=priceFor;
    priceFor=function(x){
      const p=prev(x);
      if(p)return p; // any real direct or product-inherited price ALWAYS takes precedence
      const rec=byKey.get(norm(x.title));
      if(!rec)return null;
      return {
        t:x.title, m:null, x:null, noReliableData:true,
        product:rec.product, region:rec.region, reason:rec.reason,
        researchedAt:rec.researchedAt, source:rec.source,
      };
    };
    window.SHELFCHECK_NO_RELIABLE_DATA={registered:NO_RELIABLE_DATA.length};
    if(typeof resetBrowse==='function')resetBrowse();
    if(typeof render==='function')render();
  };
  apply();
})();

// ShelfCheck pricing — endgame staging pass v0.90 (ChatGPT, 2026-09-23).
// Consolidates the externally-adjudicated remainder without rewriting earlier campaign files.
// Existing real prices always win; this pass only replaces null/NO_RELIABLE_DATA with a newly
// verified direct/product route, or marks a newly-researched identity NO_RELIABLE_DATA.
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
  const applyEndgame=()=>{
    tries++;
    if(typeof priceFor!=='function'||typeof norm!=='function'||!window.SHELFCHECK_NO_RELIABLE_DATA){if(tries<200)setTimeout(applyEndgame,100);return;}
    if(window.__SHELFCHECK_ENDGAME_V090_WRAPPED)return;
    window.__SHELFCHECK_ENDGAME_V090_WRAPPED=true;
    const prev=priceFor;
    const real=p=>p&&Number.isFinite(Number(p.m??p.x))&&Number(p.m??p.x)>0;
    const priced=(x,rec,kind)=>{const m=Number(rec.m);return {t:x.title,m,s:+(m*.70).toFixed(2),g:+(m*.85).toFixed(2),x:+(m*1.10).toFixed(2),pc:rec.product,c:rec.region,source:`PriceCharting verified — endgame ${kind}`,productInherited:kind==='product-inherited',productTitle:kind==='product-inherited'?rec.product:undefined};};
    priceFor=function(x){
      const prior=prev(x);
      if(real(prior))return prior;
      const d=DIRECT.get(x.id); if(d)return priced(x,d,'direct');
      const pr=PRODUCT.get(x.id); if(pr)return priced(x,pr,'product-inherited');
      const n=NORD.get(x.id); if(n)return {t:x.title,m:null,x:null,noReliableData:true,product:n.product,region:n.region,reason:n.reason,researchedAt:'2026-09-23',source:'ShelfCheck endgame adjudication; exact physical route confirmed, no defensible CIB market value'};
      return prior||null;
    };
    window.SHELFCHECK_ENDGAME_V090={direct:DIRECT.size,productInherited:PRODUCT.size,noReliableData:NORD.size,heldManualIds:[237,1627,2224,2225,2226,2665]};
    if(typeof resetBrowse==='function')resetBrowse();
    if(typeof render==='function')render();
  };
  applyEndgame();
})();
