// ShelfCheck physical-omission pass v0.04 — two verified PS4 physical releases missing from the census.
//
// Both titles were surfaced by Josh's live GameEye reconciliation queue on 2026-09-26 and were
// verified absent from the current INCLUDED census before this pass (including the finalized
// cover-source audit). These are playable game identities, not packaging variants.
//
// Double Dragon Gaiden: Rise of the Dragons — physical PS4 release verified by PlayStation's
// official PS4/PS5 trailer copy advertising physical pre-orders and by the retail PS4 SKU
// (CUSA-42935 / UPC 814290019037). Released July 27, 2023.
//
// Marvel's Guardians of the Galaxy — the 2021 Eidos-Montreal/Square-Enix action-adventure,
// distinct from "Marvel's Guardians of the Galaxy: The Telltale Series" already in the census.
// Sony's PlayStation Store explicitly documents PS4-disc owners inserting the disc for the PS5
// upgrade; the North-American PS4 physical SKU is independently catalogued as a Square Enix
// release. Josh's 2026-09-19 GameEye row for this title is a known wrong-item selection for his
// Telltale pickup; ownership-reconcile-v073.js handles that one historical row without merging
// these two genuinely distinct game identities.
(()=>{
  registerCensusMutation('add',()=>{
    const added=[];
    const ensureIdentity=(id,title,auditSource)=>{
      const existing=items.find(x=>norm(x.title)===norm(title));
      if(existing)return existing;
      if(byId.has(id)){
        console.error(`ShelfCheck physical omission v0.04: id ${id} already exists; refusing to add ${title}.`);
        return null;
      }
      const x={id,title,set:'INCLUDED',baseline:'NEEDED',strong:null,target:null,max:null,search:norm(title),auditSource};
      items.push(x);byId.set(id,x);added.push(title);return x;
    };

    // id 2789 (not 2787): 2787 is reserved for Catlateral Damage: Remeowstered by census-finalize.js,
    // curation v007 and price-nrd-cleanup-v091. Curator-approved re-id 2026-09-28.
    ensureIdentity(2789,'Double Dragon Gaiden: Rise of the Dragons','Confirmed qualifying physical PS4 release: Modus Games / Secret Base, July 27 2023. PlayStation official trailer advertised physical pre-orders for PS4; retail PS4 SKU CUSA-42935 / UPC 814290019037. Surfaced by Josh\'s 2026-09-26 GameEye unresolved queue and verified absent from the current census before adding.');
    ensureIdentity(2788,"Marvel's Guardians of the Galaxy",'Confirmed qualifying physical PS4 release: Eidos-Montreal / Square Enix, October 26 2021. Sony PlayStation Store explicitly documents PS4-disc owners inserting the disc to use the PS5 digital upgrade; distinct playable identity from the 2017 Telltale Series game already represented in the census. Verified absent from the current census before adding.');

    window.SHELFCHECK_PHYSICAL_OMISSION_PASS_V004={added};
    console.info(`ShelfCheck physical omission pass v0.04 applied: ${added.length} identities added`,added);
  });
})();
