// ShelfCheck curation — Josh Set pass #6. Applies exactly 1 identity: The Walking Dead:
// Saints & Sinners.
//
// Targeted PSVR rule review of 3 identities flagged by the prior diagnostic (Tetris Effect,
// The Persistence, The Walking Dead: Saints & Sinners). Independently researched; Josh
// adopted all 3 proposed results as-is:
//
//   KEEP (no census action -- remain INCLUDED as before this pass):
//     - Tetris Effect (1213): PSVR OPTIONAL/SUPPORTED from original 2018 launch. Sony's own
//       announcement: "...Coming Fall 2018 to PlayStation4 With Optional PlayStation VR
//       Support" -- fully playable on a standard display, VR never required.
//     - The Persistence (1283): PSVR OPTIONAL/SUPPORTED as the software stands today.
//       Originally launched PSVR-exclusive (2018), but a free "Complete Edition" update
//       (May 2019, PlayStation Blog) patched flatscreen/TV play into the same game identity
//       for all existing owners, including physical disc owners. Not a separate SKU.
//
//   CUT (excluded by this pass):
//     - The Walking Dead: Saints & Sinners (1304): PSVR REQUIRED. VR-native first-person
//       game built entirely around PS Move physics interactions (two-handed grip, melee,
//       body-worn inventory); no flatscreen/non-VR mode has ever shipped on any platform
//       (PC, PSVR, Quest, PSVR2), unlike The Persistence's later patch.
(()=>{
  registerCensusMutation('exclude',()=>{
    const find=t=>items.find(x=>norm(x.title)===norm(t));
    const excluded=[];
    const exclude=(title,id,reason)=>{
      const x=find(title);
      if(!x){console.warn(`ShelfCheck curation pass v0.06: expected identity not found, skipped: "${title}" (id ${id})`);return;}
      if(x.id!==id){console.warn(`ShelfCheck curation pass v0.06: id mismatch for "${title}" -- expected ${id}, found ${x.id}. Excluding by title match anyway.`);}
      x.set='EXCLUDED';
      x.cleanupReason=reason;
      excluded.push(x.title);
    };

    exclude('The Walking Dead: Saints & Sinners',1304,'PSVR_REQUIRED — excluded by Josh Set curation pass #6. Verified: VR-native first-person game built around PS Move physics interactions (two-handed weapon grip, melee, body-worn inventory); no flatscreen/non-VR mode has ever shipped on any platform. Curator decision by Josh following a targeted 3-identity PSVR rule review (also covering Tetris Effect and The Persistence, both confirmed PSVR optional/supported and left INCLUDED).');

    window.SHELFCHECK_CURATION_JOSH_SET_PASS_V006={excluded};
    console.info(`ShelfCheck Josh Set curation pass #6 applied: ${excluded.length} identities excluded`,excluded);
  });
})();

// ShelfCheck curation — Josh Set pass #7.
// Final dossier-era physical-format cleanup. This is appended here so it executes in the
// already-wired synchronous curation slot before census-finalize.js.
//
// KEEP after curator review: Warhammer 40,000: Space Wolf (1414) — qualifying PS4 disc exists.
// Additional no-action keeps: World End Syndrome (1448) — EU physical; World of Warships:
// Legends (1450) — Firepower Deluxe Edition is a legitimate physical PS4 SKU.
(()=>{
  registerCensusMutation('exclude',()=>{
    const find=t=>items.find(x=>norm(x.title)===norm(t));
    const excluded=[];
    const exclude=(title,id,reason)=>{
      const x=find(title);
      if(!x){console.warn(`ShelfCheck curation pass v0.07: expected identity not found, skipped: "${title}" (id ${id})`);return;}
      if(x.id!==id){console.warn(`ShelfCheck curation pass v0.07: id mismatch for "${title}" -- expected ${id}, found ${x.id}. Excluding by title match anyway.`);}
      x.set='EXCLUDED';
      x.cleanupReason=reason;
      excluded.push(x.title);
    };

    const reason='NO_QUALIFYING_PHYSICAL — excluded by Josh Set curation pass #7 after curator review of the final borderline-dossier physical-format queue. PS4 version exists, but no qualifying physical PS4 release was verified; digital-only software does not count toward the physical-only Josh Set.';
    exclude('Aces of the Luftwaffe',33,reason);
    exclude('Assault Gunners HD Edition',106,reason);
    exclude('BADLAND: Game of the Year Edition',128,reason);
    exclude('Bear With Me: The Complete Collection',151,reason);
    exclude('Construction Simulator 3: Console Edition',263,reason);
    exclude('Edna & Harvey: The Breakout - 10th Anniversary Edition',433,reason);
    exclude('The Last Remnant Remastered',1263,reason);
    exclude('The Walking Vegetables: Radical Edition',1309,reason);
    exclude('Unexplored: Unlocked Edition',1384,reason);
    exclude('Warhammer Quest',1415,reason);
    exclude('Warhammer Quest 2: The End Times',1416,reason);

    window.SHELFCHECK_CURATION_JOSH_SET_PASS_V007={excluded};
    console.info(`ShelfCheck Josh Set curation pass #7 applied: ${excluded.length} identities excluded`,excluded);
  });
})();

// ShelfCheck curation — Josh Set pass #8.
// Canonical identity de-duplication + OlliOlli compilation repair, based on the final
// duplicate-identity audit. ShelfCheck counts playable identities, not edition boxes.
//
// Eight duplicate rows are folded into their canonical identity. Every product reference
// and alias attached to the duplicate is migrated to the keeper so physical coverage and
// GameEye matching survive the merge. Existing local ownership is migrated as well.
//
// OlliOlli: Epic Combo Edition is a two-game physical compilation, not a third game. Its
// former product-as-identity row (862) is excluded, OlliOlli2 is added as identity 2786,
// and the physical product is remapped to OlliOlli (1686) + OlliOlli2 (2786).
(()=>{
  const merges=[
    {drop:2645,keep:690,dropTitle:'Lapis Re:Abyss',keepTitle:'Lapis x Labyrinth'},
    {drop:78,keep:1992,dropTitle:'Another World: 20th Anniversary Edition',keepTitle:'Another World'},
    {drop:119,keep:120,dropTitle:'Attack on Titan 2',keepTitle:'Attack on Titan 2: Final Battle'},
    {drop:1233,keep:1231,dropTitle:'The Crew: Wild Run',keepTitle:'The Crew'},
    {drop:1703,keep:969,dropTitle:'Redout: Lightspeed Edition',keepTitle:'Redout'},
    {drop:1483,keep:1482,dropTitle:'Ys: Memories of Celceta - Kai',keepTitle:'Ys: Memories of Celceta'},
    {drop:1765,keep:1764,dropTitle:'Tokyo Twilight Ghost Hunters: Daybreak Special Gigs',keepTitle:'Tokyo Twilight Ghost Hunters'},
    {drop:421,keep:420,dropTitle:'Dying Light: The Following',keepTitle:'Dying Light'}
  ];
  const OLLI1=1686,OLLI2=2786,EPIC=862,epicTitle='OlliOlli: Epic Combo Edition';

  const addAlias=(alias,id)=>{
    const a=norm(alias);
    if(!a)return;
    if(!aliasesById.has(id))aliasesById.set(id,[]);
    const list=aliasesById.get(id);
    if(!list.includes(a))list.push(a);
    if(Array.isArray(DATA?.a)&&!DATA.a.some(r=>r?.[1]===id&&norm(r?.[0])===a))DATA.a.push([alias,id]);
    const x=byId.get(id);
    if(x&&!x.search.includes(a))x.search+=' '+a;
  };

  const rebuildRuntimeProducts=()=>{
    productMap.clear();
    reverseProducts.clear();
    for(const [n,title,ids] of DATA.p){
      const key=norm(n),p={key,title,ids};
      productMap.set(key,p);
      const noThe=key.startsWith('the ')?key.slice(4):key;
      productMap.set(noThe,p);
      for(const id of ids){
        if(!reverseProducts.has(id))reverseProducts.set(id,[]);
        reverseProducts.get(id).push(title);
      }
    }
    if(typeof mergedProductIndex!=='undefined')mergedProductIndex=null;
  };

  registerCensusMutation('add',()=>{
    // Add the missing second game represented by the Epic Combo physical compilation.
    if(!byId.has(OLLI2)){
      const title='OlliOlli2: Welcome to Olliwood';
      const x={id:OLLI2,title,set:'INCLUDED',baseline:'NEEDED',strong:null,target:null,max:null,search:norm(title),auditSource:'Identity-model repair: OlliOlli: Epic Combo Edition is a physical PS4 compilation containing OlliOlli and OlliOlli2. Added as the second constituent playable identity; the compilation box is not itself an extra game identity.'};
      items.push(x);
      byId.set(x.id,x);
    }

    // Preserve a complete researched dossier for the newly represented constituent identity.
    if(typeof DOSSIERS!=='undefined')DOSSIERS.set(norm('OlliOlli2: Welcome to Olliwood'),{
      t:'OlliOlli2: Welcome to Olliwood',
      s:'Side-scrolling skateboarding action game from Roll7, chaining tricks, manuals, grinds and landings through compact score-attack stages while pushing for cleaner lines and increasingly demanding objectives.',
      w:'A sharper, more expressive sequel to OlliOlli, adding manuals, reverts, expanded trick options and a colorful movie-set theme while keeping the fast restart-and-improve loop that makes the series distinctive.',
      c:'Execution-heavy by design: later challenges demand precise timing and repeated runs, and there is little traditional story progression beyond unlocking stages and chasing better scores.',
      r:'KEEP as a distinct playable identity. It is the second full game contained on the physical PS4 OlliOlli: Epic Combo Edition, not bonus DLC or an edition variant of the first game.',
      b:'Qualifying PS4 physical coverage exists through OlliOlli: Epic Combo Edition, which contains both OlliOlli and OlliOlli2: Welcome to Olliwood on one physical compilation product.',
      p:'BUY through Epic Combo Edition if you want the physical route; one box satisfies both OlliOlli identities.'
    });

    // Move aliases and every product reference from duplicate IDs onto the canonical keeper.
    for(const m of merges){
      addAlias(m.dropTitle,m.keep);
      for(const a of aliasesById.get(m.drop)||[])addAlias(a,m.keep);
    }
    for(const row of DATA.p){
      if(!Array.isArray(row?.[2]))continue;
      let ids=row[2].map(id=>merges.find(m=>m.drop===id)?.keep??id);
      if(ids.includes(EPIC))ids=ids.filter(id=>id!==EPIC);
      row[2]=[...new Set(ids)];
    }

    // Epic Combo must cover the two games it actually contains.
    let epicRows=DATA.p.filter(r=>norm(r?.[0])===norm(epicTitle)||norm(r?.[1])===norm(epicTitle));
    if(!epicRows.length){
      DATA.p.push([epicTitle,epicTitle,[OLLI1,OLLI2]]);
      epicRows=[DATA.p[DATA.p.length-1]];
    }
    for(const row of epicRows)row[2]=[...new Set([...(row[2]||[]).filter(id=>id!==EPIC),OLLI1,OLLI2])];

    // Keep old edition names searchable against the surviving canonical identities.
    addAlias(epicTitle,OLLI1);
    addAlias('OlliOlli2: Welcome to Olliwood',OLLI2);
    rebuildRuntimeProducts();

    // Migrate pre-existing local ownership so a canonical merge never makes an owned game vanish.
    if(stateCache&&Array.isArray(stateCache.owned)){
      const owned=new Set(stateCache.owned);
      for(const m of merges)if(owned.has(m.drop)){owned.add(m.keep);owned.delete(m.drop);}
      if(owned.has(EPIC)){owned.delete(EPIC);owned.add(OLLI1);owned.add(OLLI2);}
      const next=[...owned];
      if(next.length!==stateCache.owned.length||next.some((id,i)=>id!==stateCache.owned[i]))saveState({...stateCache,owned:next});
    }

    window.SHELFCHECK_IDENTITY_DEDUP_V001={added:[OLLI2],merges:merges.map(m=>({drop:m.drop,keep:m.keep})),product:epicTitle};
  });

  registerCensusMutation('exclude',()=>{
    const excluded=[];
    const excludeById=(id,expected,reason)=>{
      const x=byId.get(id);
      if(!x){console.warn(`ShelfCheck identity dedup: expected id ${id} (${expected}) not found; skipped.`);return;}
      if(norm(x.title)!==norm(expected))console.warn(`ShelfCheck identity dedup: id ${id} title changed; expected "${expected}", found "${x.title}". Excluding by audited stable id.`);
      x.set='EXCLUDED';
      x.cleanupReason=reason;
      excluded.push(x.title);
    };
    for(const m of merges)excludeById(m.drop,m.dropTitle,`DUPLICATE_IDENTITY — same playable game as canonical identity ${m.keep} (${m.keepTitle}). Alternate regional/edition packaging remains represented through aliases and physical-product coverage; boxes do not create another Josh Set identity.`);
    excludeById(EPIC,epicTitle,'PRODUCT_NOT_IDENTITY — OlliOlli: Epic Combo Edition is a physical two-game compilation containing OlliOlli and OlliOlli2: Welcome to Olliwood. The box now satisfies those two constituent identities and is not counted as a third playable game.');
    if(typeof auditDossiers==='function'&&typeof dossiersReady!=='undefined'&&dossiersReady)auditDossiers();
    window.SHELFCHECK_CURATION_JOSH_SET_PASS_V008={excluded,expectedIncluded:2456};
    console.info(`ShelfCheck Josh Set curation pass #8 applied: ${excluded.length} duplicate/product identities excluded; OlliOlli2 added. Expected denominator 2456.`,excluded);
  });
})();

// ShelfCheck curation — Josh Set pass #9.
// Physical-legitimacy adjudication: 10 identities confirmed to have no qualifying physical
// PS4 release anywhere (NA, PAL, JP/Asian-English import, or compilation/bundle), after
// multi-source research (official storefronts, publisher pages, delisting coverage, and —
// for the multi-source cases — independent live web verification against the existing
// dossier claims). See the pricing-campaign chat report (physical-legitimacy adjudication,
// 2026-09-23) for full per-identity source citations.
//
// Destroy All Humans! (2005) (356): the census identity is explicitly the 2005 original,
// which never received any PS4 SKU of its own -- the "Destroy All Humans PS4" boxed copies
// found everywhere belong to the unrelated 2020 remake, which already exists as its own
// separate INCLUDED identity (355, "Destroy All Humans!"). Confirmed before excluding: this
// is a mistaken/non-PS4 row, not a rename/reuse candidate.
//
// Held out of this pass, NOT excluded here:
// - Warhammer 40,000: Space Wolf (1414): CONFLICT with pass #7's explicit prior curator
//   ruling ("KEEP after curator review... qualifying PS4 disc exists"), which contradicts
//   fresh multi-source research (PS Store, Wikipedia, a WorthPlaying delisting article) all
//   describing it as digital-storefront-only. Flagged for Josh; not resolved silently.
// - Super Blackjack Battle II Turbo Edition: The Card Warriors (1173): held for one final
//   focused verification pass per Josh's explicit instruction before any exclusion.
(()=>{
  registerCensusMutation('exclude',()=>{
    const find=t=>items.find(x=>norm(x.title)===norm(t));
    const excluded=[];
    const exclude=(title,id,reason)=>{
      const x=find(title);
      if(!x){console.warn(`ShelfCheck curation pass v0.09: expected identity not found, skipped: "${title}" (id ${id})`);return;}
      if(x.id!==id){console.warn(`ShelfCheck curation pass v0.09: id mismatch for "${title}" -- expected ${id}, found ${x.id}. Excluding by title match anyway.`);}
      x.set='EXCLUDED';
      x.cleanupReason=reason;
      excluded.push(x.title);
    };

    const reason='NO_QUALIFYING_PHYSICAL_PS4 — excluded by Josh Set curation pass #9 after physical-legitimacy adjudication. No genuine qualifying physical PS4 release was found in any region (NA/PAL retail, JP/Asian-English import, limited-print, or compilation/bundle); digital-only software does not count toward the physical-only Josh Set.';
    exclude('Abyss Odyssey: Extended Dream Edition',28,reason);
    exclude('Amnesia Collection',71,reason);
    exclude('Candleman: The Complete Journey',225,reason);
    exclude('Construction Simulator 2: Console Edition',262,reason);
    exclude('Deep Sky Derelicts: Definitive Edition',345,reason);
    exclude('Destroy All Humans! (2005)',356,'NO_QUALIFYING_PHYSICAL_PS4 — excluded by Josh Set curation pass #9. This identity is explicitly the 2005 original, which never received any PS4 SKU of its own; the boxed "Destroy All Humans PS4" copies found in every source belong to the unrelated 2020 remake, already represented by its own separate INCLUDED identity (355, "Destroy All Humans!"). Confirmed not a rename/reuse case before excluding.');
    exclude('Sunless Sea: Zubmariner Edition',1172,reason);
    exclude('Worms Anniversary Edition',1454,reason);
    exclude("A Winter's Daydream",1561,'NO_QUALIFYING_PHYSICAL_PS4 — excluded by Josh Set curation pass #9. Only a PS Vita physical limited edition was found (1,200-copy run); the PS4 version is confirmed digital-only across every source checked. The existing dossier claim appears to conflate the Vita physical release with PS4.');
    exclude('Euro Fishing: Urban Edition',1612,'NO_QUALIFYING_PHYSICAL_PS4 — excluded by Josh Set curation pass #9. This specific Urban Edition SKU (base game + Foundry Dock DLC) is confirmed digital-only across every source checked; a physical "Euro Fishing Collector\'s Edition" exists but is a different product/content set for the base game, not this identity.');

    window.SHELFCHECK_CURATION_JOSH_SET_PASS_V009={excluded,expectedIncluded:2446};
    console.info(`ShelfCheck Josh Set curation pass #9 applied: ${excluded.length} identities excluded (physical-legitimacy adjudication). Expected denominator 2446.`,excluded);
  });
})();

// ShelfCheck curation — Josh Set pass #10.
// Two focused physical-release adjudications, each requiring affirmative evidence before
// any exclusion (per Josh's explicit instruction), reported to Josh in full before this pass
// was approved and applied.
//
// Warhammer 40,000: Space Wolf (1414) -- REVERSES pass #7's KEEP ruling above ("KEEP after
// curator review: Warhammer 40,000: Space Wolf (1414) -- qualifying PS4 disc exists."). That
// prior note is left untouched above, on purpose, as the historical audit trail -- this pass
// documents the newer ruling and its evidence basis rather than overwriting it. A dedicated
// re-adjudication (2026-09-23) found: HeroCraft's own October 2023 delisting announcement
// (covered by WorthPlaying, NicheGamer, GameSpace, TheGamer, and a PSNProfiles thread) frames
// the removal purely as leaving "digital stores"/"all console and PC platforms" as digital
// purchases, with no carve-out for existing physical inventory anywhere; no UPC/barcode entry
// exists in barcode databases; no eBay/Amazon boxed-disc listing was found in any region; and
// PriceCharting -- which tracks nearly every manufactured physical release -- has no page for
// this title at all, not even an untracked/no-price entry. Originated as a mobile freemium
// card game, a common profile for PS4 ports that never leave digital storefronts. No
// manufactured PS4 physical SKU was found in any qualifying region.
//
// Super Blackjack Battle II Turbo Edition: The Card Warriors (1173) -- final verification
// distinguished genuine boxed evidence from storefront listings. GameStop confirms a real
// physical Nintendo Switch release (both physical and digital purchase options on its Switch
// product page) -- but no GameStop, Amazon, eBay, or PriceCharting listing exists for a PS4
// disc despite the game being cross-platform (PC/Xbox One/PS4/Switch/mobile, per Headup
// Games' own site). PriceCharting has no page at all for this title on PS4. Physical releases
// exist on other platforms; no qualifying PS4 physical release was found.
(()=>{
  registerCensusMutation('exclude',()=>{
    const find=t=>items.find(x=>norm(x.title)===norm(t));
    const excluded=[];
    const exclude=(title,id,reason)=>{
      const x=find(title);
      if(!x){console.warn(`ShelfCheck curation pass v0.10: expected identity not found, skipped: "${title}" (id ${id})`);return;}
      if(x.id!==id){console.warn(`ShelfCheck curation pass v0.10: id mismatch for "${title}" -- expected ${id}, found ${x.id}. Excluding by title match anyway.`);}
      x.set='EXCLUDED';
      x.cleanupReason=reason;
      excluded.push(x.title);
    };

    exclude('Warhammer 40,000: Space Wolf',1414,'NO_QUALIFYING_PHYSICAL_PS4 — excluded by Josh Set curation pass #10, REVERSING pass #7\'s prior KEEP ruling ("qualifying PS4 disc exists") after a dedicated re-adjudication. Evidence: HeroCraft\'s Oct 2023 delisting announcement frames removal purely as leaving digital storefronts across all platforms with no mention of existing physical inventory; no UPC/barcode found; no boxed-disc listing found on eBay/Amazon in any region; no PriceCharting page exists for this title at all. Originated as a mobile freemium card game. No manufactured PS4 physical SKU found in any qualifying region. Pass #7\'s original note is preserved above as the historical record, not overwritten.');
    exclude('Super Blackjack Battle II Turbo Edition: The Card Warriors',1173,'NO_QUALIFYING_PHYSICAL_PS4 — excluded by Josh Set curation pass #10 after final verification. A genuine physical release exists for Nintendo Switch (confirmed via GameStop\'s Switch product page offering both physical and digital purchase), but no GameStop/Amazon/eBay/PriceCharting listing exists for a PS4 disc despite this being a cross-platform title (PC/Xbox One/PS4/Switch/mobile). PriceCharting has no page at all for this title on PS4. Physical releases exist on other platforms; no qualifying PS4 physical release was found.');

    window.SHELFCHECK_CURATION_JOSH_SET_PASS_V010={excluded,expectedIncluded:2444};
    console.info(`ShelfCheck Josh Set curation pass #10 applied: ${excluded.length} identities excluded (focused physical-release adjudication). Expected denominator 2444.`,excluded);
  });
})();

// ShelfCheck curation — Josh Set pass #11.
// Product-mapping repair only -- registers 5 verified physical products in DATA.p that were
// missing from the product registry (confirmed by direct inspection: zero matches for any of
// these titles before this pass). No identity is added, excluded, or re-included by this pass;
// it only restores the product<->identity relationship so Model A's product-inherited pricing
// tier (price-product-inherited-v086.js) can see these already-verified physical products.
// See the pricing-campaign chat report (COMPILATION_ONLY salvage, 2026-09-23) for full sourcing.
//
//   - GALAK-Z: The Void & Skulls of the Shogun: Bone-A-Fide (Maximum Games, US) -- covers
//     Galak-Z: The Void (1625) and Skulls of the Shogun: Bone-a-Fide Edition (1731).
//   - The Journey Down Trilogy (Strictly Limited Games, PAL) -- covers all 3 Journey Down
//     chapters (1754, 1755, 1756) on one disc.
//   - Epics of Hammerwatch: Heroes' Edition (Strictly Limited Games, PAL) -- covers Hammerwatch
//     (2256) and Heroes of Hammerwatch - Ultimate Edition (2257).
//   - Toaplan Arcade Garage: Kyukyoku Tiger-Heli (PriceCharting product 8576642, US) -- covers
//     Kyukyoku Tiger / Twin Cobra (2469), Tiger-Heli (2470), Get Star / Guardian (2471), and
//     Teki-Paki (2472). Teki-Paki is INTENTIONALLY included in the product's ids array (it is
//     genuinely on this disc), but it is already EXCLUDED for an unrelated reason -- registering
//     this product does not and must not change its set status, since productCoverage()/
//     collectionInfo() only ever count ids with set==='INCLUDED'.
//   - DOOM: The Classics Collection (Limited Run #395, US) -- covers only DOOM 3 (389). The
//     collection also contains the 1993 DOOM and DOOM II, but neither has its own census
//     identity, so this product genuinely covers just 1 currently-INCLUDED identity. It is
//     still registered here as a real physical product (not invented); see
//     price-product-inherited-v086.js for the explicit, individually-flagged exception that
//     lets a verified single-identity product like this one provide product-inherited pricing.
(()=>{
  const PRODUCTS_TO_REGISTER=[
    ['GALAK-Z: The Void & Skulls of the Shogun: Bone-A-Fide','GALAK-Z: The Void & Skulls of the Shogun: Bone-A-Fide',[1625,1731]],
    ['The Journey Down Trilogy','The Journey Down Trilogy',[1754,1755,1756]],
    ["Epics of Hammerwatch: Heroes' Edition","Epics of Hammerwatch: Heroes' Edition",[2256,2257]],
    ['Toaplan Arcade Garage: Kyukyoku Tiger-Heli','Toaplan Arcade Garage: Kyukyoku Tiger-Heli',[2469,2470,2471,2472]],
    ['DOOM: The Classics Collection','DOOM: The Classics Collection',[389]],
  ];

  registerCensusMutation('add',()=>{
    const registered=[];
    for(const [raw,title,ids] of PRODUCTS_TO_REGISTER){
      const already=DATA.p.some(r=>norm(r?.[1])===norm(title));
      if(already){console.warn(`ShelfCheck curation pass v0.11: product already registered, skipped: "${title}"`);continue;}
      DATA.p.push([raw,title,[...ids]]);
      registered.push(title);
    }
    // Reset the cached product index so Model A (and any other consumer of
    // ensureMergedProducts()) picks up these rows on its next call, and rebuild the simpler
    // productMap/reverseProducts index the same way pass #8's OlliOlli repair did, so search
    // and collection UI stay consistent with the same DATA.p change.
    if(typeof mergedProductIndex!=='undefined')mergedProductIndex=null;
    if(typeof productMap!=='undefined'&&typeof reverseProducts!=='undefined'){
      productMap.clear();
      reverseProducts.clear();
      for(const [n,title,ids] of DATA.p){
        const key=norm(n),p={key,title,ids};
        productMap.set(key,p);
        const noThe=key.startsWith('the ')?key.slice(4):key;
        productMap.set(noThe,p);
        for(const id of ids){
          if(!reverseProducts.has(id))reverseProducts.set(id,[]);
          reverseProducts.get(id).push(title);
        }
      }
    }
    window.SHELFCHECK_CURATION_JOSH_SET_PASS_V011={registered};
    console.info(`ShelfCheck Josh Set curation pass #11 applied: ${registered.length} physical products registered in DATA.p (product-mapping repair only, no identity changes).`,registered);
  });
})();

// ShelfCheck curation — Josh Set pass #12.
// Product-mapping repair only (same pattern as pass #11) -- registers 2 more verified physical
// products, both single-identity cases (their other disc contents have no separate census
// identity, same reasoning as DOOM: The Classics Collection in pass #11). No identity is
// added, excluded, or re-included by this pass. See price-product-inherited-v086.js for the
// matching PRODUCT_PRICES entries and the verifiedSingleIdentityProduct flag each needs.
//
//   - Ara Fell & Rise of the Third Power (Limited Run #496, US) -- covers Ara Fell: Enhanced
//     Edition (82) only; "Rise of the Third Power" is not a separate census identity.
//   - Minecraft: Story Mode Complete Adventure (US) -- covers Minecraft: Story Mode - A
//     Telltale Games Series (783) only; Season Two is not a separate census identity. (Note:
//     a different row, "Minecraft: Story Mode - A Telltale Games Series - The Complete
//     Adventure", was already excluded as a duplicate/wrapper by census-cleanup.js long
//     before this pass -- this registration is for the underlying physical product, not that
//     excluded row.)
//
// Bayonetta & Vanquish needed NO mapping fix -- it was already correctly registered in
// DATA.p (covering Bayonetta/149 and Vanquish/1779, both currently INCLUDED); it only needed
// a PRODUCT_PRICES entry, added directly in price-product-inherited-v086.js.
(()=>{
  const PRODUCTS_TO_REGISTER=[
    ['Ara Fell & Rise of the Third Power','Ara Fell & Rise of the Third Power',[82]],
    ['Minecraft: Story Mode Complete Adventure','Minecraft: Story Mode Complete Adventure',[783]],
  ];

  registerCensusMutation('add',()=>{
    const registered=[];
    for(const [raw,title,ids] of PRODUCTS_TO_REGISTER){
      const already=DATA.p.some(r=>norm(r?.[1])===norm(title));
      if(already){console.warn(`ShelfCheck curation pass v0.12: product already registered, skipped: "${title}"`);continue;}
      DATA.p.push([raw,title,[...ids]]);
      registered.push(title);
    }
    if(typeof mergedProductIndex!=='undefined')mergedProductIndex=null;
    if(typeof productMap!=='undefined'&&typeof reverseProducts!=='undefined'){
      productMap.clear();
      reverseProducts.clear();
      for(const [n,title,ids] of DATA.p){
        const key=norm(n),p={key,title,ids};
        productMap.set(key,p);
        const noThe=key.startsWith('the ')?key.slice(4):key;
        productMap.set(noThe,p);
        for(const id of ids){
          if(!reverseProducts.has(id))reverseProducts.set(id,[]);
          reverseProducts.get(id).push(title);
        }
      }
    }
    window.SHELFCHECK_CURATION_JOSH_SET_PASS_V012={registered};
    console.info(`ShelfCheck Josh Set curation pass #12 applied: ${registered.length} physical products registered in DATA.p (product-mapping repair only, no identity changes).`,registered);
  });
})();
