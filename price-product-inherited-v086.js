// ShelfCheck pricing model — Model A: Shared Product Price Reference (controlled first pass).
//
// Adds ONE new priceFor() fallback tier, below every existing direct/public price tier: when
// an identity has no price of its own, but is a registered component of a multi-identity
// physical product (the same product relationship model-fix.js's collectionInfo()/
// productCoverage() already use for ownership -- never re-derived here), and that product has
// a verified CIB price on file, show that product's price instead of leaving PRICE PENDING.
//
// Batch 1 (2026-09-22) used ONLY the 8 already-verified compilation prices sitting unused in
// price-negative-space-v042.js's PRODUCT_ONLY array -- no new research; 3 of those 8 matched a
// product registered in the census's DATA.p (Robotics;Notes Double Pack, Planescape/Icewind
// Dale, Steven Universe/OK K.O.), the other 5 (Ara Fell & Rise of the Third Power, Galak-Z &
// Skulls of the Shogun, Monopoly Plus & Madness, Pac-Man Championship Edition 2 + Arcade Game
// Series, The Journey Down Trilogy) have no registered multi-identity product to attach to --
// verified by direct inspection of DATA.p, not assumed -- so they remain inert until a census
// curation pass registers the relationship. Nothing here invents that relationship.
//
// Batch 2 (2026-09-22) added 23 more products found by tools/compilation-price-scan.mjs and
// individually re-verified (audit-out/compilation-verification-26.md) -- 22 US/PAL products
// plus 1 import-only (S.T.A.L.K.E.R.: Legends of the Zone Trilogy, JP-only, no US/PAL SKU
// exists). Ara Fell was excluded again (still unregistered). Two exact-duplicate-coverage
// pairs were found (Danganronpa 1-2 Reload/Trilogy; Batman: Return to Arkham/Arkham
// Collection) -- only the cheaper product of each pair was loaded, by curator decision, rather
// than loading both and relying on the lowest-price selection below to discard the pricier one.
//
// Returned price objects are tagged productInherited:true, productTitle, and region/source,
// and are NEVER represented as the covered identity's own standalone market value -- see the
// pricing-model design report (audit-out/compilation-pricing-model-design.md) for the
// (not-yet-made) minimal UI change this metadata is meant to support.
(()=>{
  // Prices are verbatim from price-negative-space-v042.js's PRODUCT_ONLY array (2026-08-28
  // verified audit) -- not re-researched. `productTitle` here is the identity-bearing
  // product's REAL registered title in the census's own product data (DATA.p), verified by
  // direct inspection (not assumed) since PRODUCT_ONLY's own free-text product names don't
  // always match the registered title exactly -- `sourceTitle` keeps PRODUCT_ONLY's original
  // wording for traceability back to where the price was verified.
  const PRODUCT_PRICES=[
    {productTitle:'Ara Fell & Rise of the Third Power',sourceTitle:'Ara Fell & Rise of the Third Power',m:39.78,c:'Playstation 4',verifiedSingleIdentityProduct:true}, // registered in DATA.p by curation pass #12 (2026-09-23) -- covers 82 only; Rise of the Third Power is not a separate census identity
    {productTitle:'GALAK-Z: The Void & Skulls of the Shogun: Bone-A-Fide',sourceTitle:'Galak-Z: The Void & Skulls of the Shogun: Bone-A-Fide',m:10.15,c:'Playstation 4'}, // registered in DATA.p by curation pass #11 (2026-09-23) -- covers 1625, 1731
    {productTitle:"Steven Universe: Save the Light / OK K.O.! Let's Play Heroes 2 Games in 1",sourceTitle:'Steven Universe: Save The Light & OK KO Lets Play Heroes',m:26.36,c:'Playstation 4'},
    {productTitle:'Monopoly Plus & Monopoly Madness',sourceTitle:'Monopoly Plus & Monopoly Madness',m:11.01,c:'Playstation 4'}, // not registered in DATA.p -- inert
    {productTitle:'Robotics;Notes Double Pack',sourceTitle:'Robotics Notes Elite and Dash Double Pack',m:19.99,c:'Playstation 4'},
    {productTitle:'Pac-Man Championship Edition 2 + Arcade Game Series',sourceTitle:'Pac-Man Championship Edition 2 + Arcade Game Series',m:11.39,c:'Playstation 4'}, // not registered as a multi-identity product in DATA.p (this edition was collapsed into a single identity, id 890) -- inert here
    {productTitle:'Planescape: Torment: Enhanced Edition / Icewind Dale: Enhanced Edition',sourceTitle:'Planescape: Torment & Icewind Dale Enhanced Editions',m:18.85,c:'Playstation 4'},
    {productTitle:'The Journey Down Trilogy',sourceTitle:'The Journey Down Trilogy',m:51.15,c:'PAL Playstation 4'}, // registered in DATA.p by curation pass #11 (2026-09-23) -- covers 1754, 1755, 1756
    // Batch 2 -- verified 2026-09-22 via tools/compilation-price-scan.mjs, then individually
    // re-checked (see audit-out/compilation-verification-26.md). Two exact-duplicate-coverage
    // pairs were found (same identities, two qualifying products) -- only the cheaper of each
    // pair is loaded here per curator decision, rather than loading both and relying on the
    // lowest-price-wins logic below to discard the pricier one:
    //   - loaded 'Danganronpa 1-2 Reload' ($32.20), NOT 'Danganronpa Trilogy' ($47.45)
    //   - loaded 'Batman: Return to Arkham' ($14.00), NOT 'Batman: Arkham Collection' ($18.54)
    {productTitle:"S.T.A.L.K.E.R.: Legends of the Zone Trilogy",sourceTitle:"S.T.A.L.K.E.R.: Legends of the Zone Trilogy",m:48.9,c:"JP Playstation 4"}, // import-only, no US/PAL SKU exists -- verified
    {productTitle:"NINJA GAIDEN: Master Collection",sourceTitle:"NINJA GAIDEN: Master Collection",m:48.49,c:"Playstation 4"},
    {productTitle:"Assassin's Creed: The Ezio Collection",sourceTitle:"Assassin's Creed: The Ezio Collection",m:16.33,c:"Playstation 4"},
    {productTitle:"BioShock: The Collection",sourceTitle:"BioShock: The Collection",m:15,c:"Playstation 4"},
    {productTitle:"Mafia: Trilogy",sourceTitle:"Mafia: Trilogy",m:21.5,c:"PAL Playstation 4"},
    {productTitle:"Crash Bandicoot N. Sane Trilogy",sourceTitle:"Crash Bandicoot N. Sane Trilogy",m:11.61,c:"Playstation 4"},
    {productTitle:"Spyro Reignited Trilogy",sourceTitle:"Spyro Reignited Trilogy",m:14.48,c:"Playstation 4"},
    {productTitle:"La-Mulana 1 & 2: Hidden Treasures Edition",sourceTitle:"La-Mulana 1 & 2: Hidden Treasures Edition",m:40.25,c:"Playstation 4"},
    {productTitle:"Oniken + Odallus Collection",sourceTitle:"Oniken + Odallus Collection",m:77.29,c:"Playstation 4"},
    {productTitle:"Scribblenauts Mega Pack",sourceTitle:"Scribblenauts Mega Pack",m:9.97,c:"Playstation 4"},
    {productTitle:"SteamWorld Collection",sourceTitle:"SteamWorld Collection",m:20.96,c:"Playstation 4"},
    {productTitle:"Resident Evil: Origins Collection",sourceTitle:"Resident Evil: Origins Collection",m:17.44,c:"Playstation 4"},
    {productTitle:"Trine: Ultimate Collection",sourceTitle:"Trine: Ultimate Collection",m:27.49,c:"Playstation 4"},
    {productTitle:"Tomb Raider I-III Remastered",sourceTitle:"Tomb Raider I-III Remastered",m:25.84,c:"Playstation 4"},
    {productTitle:"Tomb Raider IV-VI Remastered",sourceTitle:"Tomb Raider IV-VI Remastered",m:26.63,c:"Playstation 4"},
    {productTitle:"Danganronpa 1-2 Reload",sourceTitle:"Danganronpa 1-2 Reload",m:32.2,c:"Playstation 4"},
    {productTitle:"Phoenix Wright: Ace Attorney Trilogy",sourceTitle:"Phoenix Wright: Ace Attorney Trilogy",m:39.99,c:"Playstation 4"},
    {productTitle:"Guacamelee! One-Two Punch Collection",sourceTitle:"Guacamelee! One-Two Punch Collection",m:58.63,c:"Playstation 4"},
    {productTitle:"INSIDE / LIMBO Double Pack",sourceTitle:"INSIDE / LIMBO Double Pack",m:28.96,c:"Playstation 4"},
    {productTitle:"Batman: Return to Arkham",sourceTitle:"Batman: Return to Arkham",m:14,c:"Playstation 4"},
    {productTitle:"Cat Quest + Cat Quest II: Pawsome Pack",sourceTitle:"Cat Quest + Cat Quest II: Pawsome Pack",m:49.25,c:"Playstation 4"},
    {productTitle:"Saints Row IV: Re-Elected & Gat Out of Hell",sourceTitle:"Saints Row IV: Re-Elected & Gat Out of Hell",m:11.95,c:"Playstation 4"},
    {productTitle:"Shenmue I & II",sourceTitle:"Shenmue I & II",m:21.14,c:"Playstation 4"},
    // Batch 3 -- COMPILATION_ONLY salvage from the physical-legitimacy adjudication
    // (2026-09-23). All 3 registered in DATA.p by curation pass #11 in the same commit.
    {productTitle:"Epics of Hammerwatch: Heroes' Edition",sourceTitle:"Epics of Hammerwatch: Heroes' Edition",m:27.84,c:"PAL Playstation 4"}, // covers 2256, 2257
    {productTitle:"Toaplan Arcade Garage: Kyukyoku Tiger-Heli",sourceTitle:"Toaplan Arcade Garage: Kyukyoku Tiger-Heli",m:34.33,c:"Playstation 4"}, // covers 2469, 2470, 2471 (already-INCLUDED coverage; Teki-Paki/2472 is also on this disc but stays EXCLUDED); price reused from 2469/2470's existing direct-price entries (same PriceCharting product 8576642)
    // DOOM: The Classics Collection genuinely covers only 1 currently-INCLUDED identity (389,
    // DOOM 3) -- its other disc contents (1993 DOOM, DOOM II) have no separate census identity.
    // verifiedSingleIdentityProduct explicitly opts this ONE entry into qualifyingProducts()'s
    // single-identity exception above; no other entry in this array carries this flag.
    {productTitle:"DOOM: The Classics Collection",sourceTitle:"DOOM: The Classics Collection",m:67.5,c:"Playstation 4",verifiedSingleIdentityProduct:true}, // covers 389 only, by design
    // Batch 4 -- larger-batch endgame pricing pass (2026-09-23). Bayonetta & Vanquish was
    // already registered in DATA.p (covers 149, 1779 -- no mapping fix needed, just this
    // price). The other 2 are registered in DATA.p by curation pass #12 in the same commit.
    {productTitle:'Bayonetta & Vanquish',sourceTitle:'Bayonetta & Vanquish 10th Anniversary Bundle',m:28.81,c:'Playstation 4'}, // covers 149, 1779
    {productTitle:'Minecraft: Story Mode Complete Adventure',sourceTitle:'Minecraft: Story Mode Complete Adventure',m:79.99,c:'Playstation 4',verifiedSingleIdentityProduct:true}, // covers 783 only; Season Two is not a separate census identity
  ];

  let tries=0;
  const apply=()=>{
    tries++;
    // Wait not just for priceFor to exist, but for public-prices-full-v066.js to have already
    // wrapped it (it sets this flag right after wrapping) -- guarantees this tier wraps
    // OUTSIDE that one deterministically, regardless of <script> tag order, instead of racing
    // two independent setTimeout-retry loops against each other.
    if(typeof priceFor!=='function'||typeof norm!=='function'||typeof byId==='undefined'||!window.SHELFCHECK_FULL_PUBLIC_PRICES){
      if(tries<200)setTimeout(apply,100);
      return;
    }
    if(window.__SHELFCHECK_PRODUCT_INHERITED_WRAPPED)return;
    window.__SHELFCHECK_PRODUCT_INHERITED_WRAPPED=true;

    const priceByProductKey=new Map();
    for(const p of PRODUCT_PRICES)priceByProductKey.set(norm(p.productTitle),p);

    // All registered multi-identity products covering a given identity id (there can be more
    // than one -- e.g. some games ship both in a standalone 3-pack and in a bigger combo pack
    // with a different game -- so this returns every qualifying product, not just the first).
    function qualifyingProducts(x){
      const idx=typeof ensureMergedProducts==='function'?ensureMergedProducts():null;
      if(!idx)return[];
      const seen=new Set(),out=[];
      for(const g of idx.values()){
        if(seen.has(g))continue;
        seen.add(g);
        if(!g.ids.includes(x.id))continue;
        // Must genuinely be a multi-identity product (same >=2 gate collectionInfo()/
        // productCoverage() already use, left completely unchanged here) -- a "product"
        // DATA.p row covering fewer than 2 currently-INCLUDED identities isn't a compilation
        // for pricing purposes either, UNLESS it is one of a small, individually-verified set
        // of real physical products whose OTHER disc contents simply have no separate census
        // identity (e.g. DOOM: The Classics Collection also contains the 1993 DOOM and DOOM
        // II, neither of which is its own identity here). That exception never fires
        // automatically: it requires the product's own PRODUCT_PRICES entry below to carry an
        // explicit, manually-set `verifiedSingleIdentityProduct:true` flag -- an ordinary
        // standalone DATA.p row with no such flagged price entry is completely unaffected.
        const coveredCount=[...new Set(g.ids)].filter(id=>byId.get(id)?.set==='INCLUDED').length;
        const rec=priceByProductKey.get(norm(g.title))||g.titles?.map(t=>priceByProductKey.get(norm(t))).find(Boolean);
        const minCoverage=rec?.verifiedSingleIdentityProduct?1:2;
        if(coveredCount>=minCoverage)out.push(g);
      }
      return out;
    }

    const prev=priceFor;
    priceFor=function(x){
      const direct=prev(x);
      if(direct)return direct; // existing direct/public price ALWAYS wins; this is a fallback only
      const products=qualifyingProducts(x); // already filtered to genuine >=2-identity products
      if(!products.length)return direct;
      let best=null;
      for(const g of products){
        const rec=priceByProductKey.get(norm(g.title))||g.titles?.map(t=>priceByProductKey.get(norm(t))).find(Boolean);
        if(rec&&(!best||rec.m<best.rec.m))best={rec,group:g};
      }
      if(!best)return direct;
      const m=best.rec.m;
      return {
        t:x.title, m, s:+(m*.70).toFixed(2), g:+(m*.85).toFixed(2), x:+(m*1.10).toFixed(2),
        pc:best.group.title, c:best.rec.c,
        source:'PriceCharting verified — product-inherited (Model A)',
        productInherited:true, productTitle:best.group.title,
      };
    };
    window.SHELFCHECK_PRODUCT_INHERITED_PRICING={registeredProducts:PRODUCT_PRICES.length,version:1};
    if(typeof resetBrowse==='function')resetBrowse();
    if(typeof render==='function')render();
  };
  apply();
})();
