// ShelfCheck pricing cleanup v0.91 — 2026-09-23
// Re-audit of the old NO_RELIABLE_DATA bucket using a practical acquisition-value rule:
// an exact qualifying PS4 physical product with a defensible live retail / marketplace /
// recent complete-copy value is PRICEABLE even when PriceCharting has no clean CIB history.
//
// This wrapper runs after the old NRD tier. Existing real numeric prices still win. It only
// replaces a noReliableData result (or null) for the audited IDs below. Currency-denominated
// live retailer prices were converted to USD using 2026-09-23 spot rates where noted.
(()=>{
  const FIX=new Map([
    [393,{m:39.99,product:'Kunio-kun: The World Classics Collection / Double Dragon & Kunio-kun Retro Brawler Bundle',source:'Current physical acquisition listing / product-map re-audit'}],
    [985,{m:119.99,product:'Resonance of Fate 4K / HD Edition',source:'Current complete/VG physical listing'}],
    [1647,{m:33.99,product:'Katana Kami: A Way of the Samurai Story',source:'Current physical acquisition listing'}],
    [1682,{m:18.90,product:"Now That's What I Call Sing",source:'Current PAL physical acquisition listing'}],
    [203,{m:10.86,product:'Bridge Constructor Compilation',source:'Current compilation CIB acquisition value'}],
    [1508,{m:26.46,product:'Gori: Cuddly Carnage PS4 Physical',source:'Wired Productions £19.99 live retail converted at 1 GBP = 1.32357 USD on 2026-09-23'}],
    [1586,{m:94.95,product:'Capcom Arcade Stadium Vol. 1 (LRG #591)',source:'Current sealed acquisition listing; original LRG MSRP $59.99'}],
    [1638,{m:29.99,product:'Hidden Through Time: Definitive Edition',source:'Live PS4 retailer listing in stock at $29.99'}],
    [1644,{m:29.99,product:'Infinite: Beyond the Mind',source:'Live Strictly Limited PS4 listing at $29.99'}],
    [1845,{m:39.99,product:'Romancing SaGa -Minstrel Song- Remastered',source:'Current PS4 physical acquisition listing'}],
    [1848,{m:34.99,product:'Itorah',source:'Current PS4 physical retail listing'}],
    [2057,{m:35.99,product:'River City Saga: Three Kingdoms Next',source:'Current Asian-English PS4 physical listing'}],
    [2063,{m:16.96,product:"Guns N' Runs",source:'PixelHeart €14.90 live retail converted at 1 EUR = 1.13797 USD on 2026-09-23'}],
    [2068,{m:39.82,product:'Beyond the Ice Palace 2',source:'PixelHeart €34.99 physical retail converted at 1 EUR = 1.13797 USD on 2026-09-23'}],
    [2098,{m:81.93,product:'Underhero',source:'Current sealed physical listing €72 converted at 1 EUR = 1.13797 USD on 2026-09-23'}],
    [2338,{m:33.97,product:'Ravenswatch - Legendary Edition',source:'Live PS4 retailer listing at $33.97'}],
    [2370,{m:42.99,product:'Dogfighter: World War 2',source:'Current multi-language PS4 physical listing'}],
    [2378,{m:23.99,product:'Everyone Spelunker',source:'Current English PS4 physical listing'}],
    [2429,{m:25.04,product:'Noob: Les Sans-Factions',source:'Current €22 physical acquisition listing converted at 1 EUR = 1.13797 USD on 2026-09-23'}],
    [2431,{m:14.99,product:'PlateUp!',source:'Current PS4 physical listing'}],
    [2541,{m:53.99,product:'Buried Stars',source:'Current English-support Korean PS4 physical listing'}],
    [2566,{m:38.72,product:'Deadcraft',source:'Current PS4 physical acquisition listing'}],
    [2568,{m:40.57,product:'Earth Defense Force: World Brothers',source:'Current Asian-English PS4 physical acquisition listing'}],
    [2669,{m:15.19,product:'Offroad Racing - Buggy x ATV x Moto',source:'Current PAL PS4 physical CIB acquisition value'}],
    [2696,{m:45.99,product:'The Quintessential Quintuplets: Five Memories Spent With You',source:'Current English-localized PS4 physical listing'}],
    [2707,{m:54.99,product:'Raidou Remastered: The Mystery of the Soulless Army',source:'Current PS4 physical listing'}],
    [2767,{m:32.99,product:'Yasha: Legends of the Demon Blade',source:'Current English-cover PS4 physical listing'}],
    [2773,{m:21.98,product:'Your Toy',source:'Current Very Good PS4 physical acquisition listing'}],
    [2779,{m:59.00,product:'Fatal Frame: Mask of the Lunar Eclipse / Zero: Tsukihami No Kamen',source:'Current mapped PS4 physical acquisition value'}],
    [2782,{m:53.99,product:'Russian Subway Dogs',source:'Current PS4 physical acquisition listing'}],
  ]);

  let tries=0;
  const apply=()=>{
    tries++;
    if(typeof priceFor!=='function'){
      if(tries<200)setTimeout(apply,100);
      return;
    }
    if(window.__SHELFCHECK_NRD_CLEANUP_V091)return;
    window.__SHELFCHECK_NRD_CLEANUP_V091=true;
    const prev=priceFor;
    const real=p=>p&&Number.isFinite(Number(p.m??p.x))&&Number(p.m??p.x)>0&&!p.noReliableData;
    priceFor=function(x){
      const prior=prev(x);
      if(real(prior))return prior;
      const rec=FIX.get(x.id);
      if(!rec)return prior||null;
      const m=Number(rec.m);
      return {
        t:x.title,m,
        s:+(m*.70).toFixed(2),
        g:+(m*.85).toFixed(2),
        x:+(m*1.10).toFixed(2),
        pc:rec.product,
        source:rec.source,
        nrdCleanup:true,
        researchedAt:'2026-09-23'
      };
    };
    window.SHELFCHECK_NRD_CLEANUP_V091={priced:FIX.size,heldManufacturingStatusIds:[1793,1964,1970]};
    if(typeof resetBrowse==='function')resetBrowse();
    if(typeof render==='function')render();
  };
  apply();
})();
