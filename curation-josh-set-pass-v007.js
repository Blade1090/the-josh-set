// ShelfCheck curation — Josh Set pass #15 / endgame language + Catlateral model repair (2026-09-23).
//
// Resolves the final six PRICE_PENDING identities after curator review.
// - Catlateral Damage (237) is the original digital-only PS4 release. The qualifying physical
//   product is the materially rebuilt Catlateral Damage: Remeowstered, so the original identity
//   is excluded and a distinct Remeowstered identity is added rather than silently treating the
//   physical as packaging for the old game.
// - God Eater Resurrection, the three Atelier Dusk DX titles, and Occultic;Nine have genuine
//   Japanese PS4 physical editions, but no qualifying English-text physical PS4 route. Josh's
//   language-accessibility rule therefore excludes them from the personal physical census.
(()=>{
  const REMEOWSTERED_ID=2787;
  const rebuildProduct=(title,id)=>{
    const key=norm(title);
    if(!DATA.p.some(r=>norm(r?.[0])===key||norm(r?.[1])===key))DATA.p.push([title,title,[id]]);
    const p={key,title,ids:[id]};
    productMap.set(key,p);
    if(!reverseProducts.has(id))reverseProducts.set(id,[]);
    if(!reverseProducts.get(id).includes(title))reverseProducts.get(id).push(title);
  };

  registerCensusMutation('add',()=>{
    if(!byId.has(REMEOWSTERED_ID)){
      const title='Catlateral Damage: Remeowstered';
      const x={
        id:REMEOWSTERED_ID,title,set:'INCLUDED',baseline:'NEEDED',strong:null,target:null,max:null,
        search:norm(title),
        auditSource:'Endgame model repair: distinct rebuilt game with qualifying Limited Run PS4 physical disc; replaces the original digital-only Catlateral Damage identity in the physical-only Josh Set.'
      };
      items.push(x);byId.set(x.id,x);
      rebuildProduct(title,REMEOWSTERED_ID);
    }
    window.SHELFCHECK_ENDGAME_MODEL_REPAIR_V001={added:[REMEOWSTERED_ID]};
  });

  registerCensusMutation('exclude',()=>{
    const excluded=[];
    const exclude=(id,title,reason)=>{
      const x=byId.get(id)||items.find(g=>norm(g.title)===norm(title));
      if(!x){console.warn(`ShelfCheck pass #15: expected identity not found: ${id} ${title}`);return;}
      x.set='EXCLUDED';x.cleanupReason=reason;excluded.push(x.title);
    };

    exclude(237,'Catlateral Damage','NO_QUALIFYING_PHYSICAL — original Catlateral Damage PS4 identity is digital-only. Physical PS4 release belongs to the materially rebuilt Catlateral Damage: Remeowstered, now represented separately as identity 2787.');
    exclude(1627,'God Eater Resurrection','LANGUAGE_BARRIER — qualifying PS4 physical copies are Japanese-region releases without a qualifying English-text physical route; the English PS4 release is digital. Excluded under Josh Set language-accessibility rule.');
    exclude(2224,'Atelier Ayesha: The Alchemist of Dusk DX','LANGUAGE_BARRIER — PS4 physical release is Japanese-only; English PS4 version exists digitally, not as a qualifying English physical disc. Excluded under Josh Set language-accessibility rule.');
    exclude(2225,'Atelier Escha & Logy: Alchemists of the Dusk Sky DX','LANGUAGE_BARRIER — PS4 physical release is Japanese-only; English PS4 version exists digitally, not as a qualifying English physical disc. Excluded under Josh Set language-accessibility rule.');
    exclude(2226,'Atelier Shallie: Alchemists of the Dusk Sea DX','LANGUAGE_BARRIER — PS4 physical release is Japanese-only; English PS4 version exists digitally, not as a qualifying English physical disc. Excluded under Josh Set language-accessibility rule.');
    exclude(2665,'Occultic;Nine','LANGUAGE_BARRIER — story-heavy visual novel with Japanese-only PS4 physical release and no qualifying English physical PS4 route. Excluded under Josh Set language-accessibility rule.');

    window.SHELFCHECK_CURATION_JOSH_SET_PASS_V015={excluded,addedRemeowstered:REMEOWSTERED_ID};
    console.info(`ShelfCheck Josh Set pass #15 applied: ${excluded.length} identities excluded; Catlateral Damage: Remeowstered added.`,excluded);
  });
})();
