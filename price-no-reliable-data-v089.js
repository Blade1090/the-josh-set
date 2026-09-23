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
