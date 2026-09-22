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
