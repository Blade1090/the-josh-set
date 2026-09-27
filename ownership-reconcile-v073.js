// ShelfCheck v0.73 — 2026-09-26 GameEye reconciliation pass.
//
// Resolves three packaging/edition title variants against their existing playable identities,
// and records one narrowly-scoped correction for Josh's known 2026-09-19 GameEye mis-selection:
// he physically bought the 2017 Telltale Guardians game, but selected GameEye's 2021 Eidos /
// Square Enix entry. The 2021 game remains a separate census identity (added by physical
// omission pass v0.04); this correction must never merge the two games globally.
(()=>{
  registerCensusMutation('exclude',()=>{
    const find=t=>items.find(x=>norm(x.title)===norm(t));
    const addAlias=(target,alias)=>{
      const x=find(target);if(!x)return false;
      const a=norm(alias);if(!aliasesById.has(x.id))aliasesById.set(x.id,[]);
      if(!aliasesById.get(x.id).includes(a))aliasesById.get(x.id).push(a);
      if(Array.isArray(DATA?.a)&&!DATA.a.some(r=>r?.[1]===x.id&&norm(r?.[0])===a))DATA.a.push([alias,x.id]);
      x.search=(x.search||norm(x.title))+' '+a;
      return true;
    };

    addAlias('Streets of Rage 4','Streets of Rage 4: Anniversary Edition');
    addAlias('Streets of Red',"Streets of Red: Devil's Dare Deluxe");
    addAlias('Tearaway Unfolded','Tearaway Unfolded: Crafted Edition');

    window.SHELFCHECK_GAMEEYE_ROW_CORRECTION=(sourceTitle,row,ix)=>{
      const title=String(sourceTitle||'');
      const publisher=String(row?.[ix?.Publisher]||'').trim();
      const developer=String(row?.[ix?.Developer]||'').trim();
      const createdAt=String(row?.[ix?.CreatedAt]||'').trim();
      if(norm(title)===norm("Marvel's Guardians of the Galaxy")&&
         norm(publisher)==='square enix'&&norm(developer)==='eidos montreal'&&createdAt==='Sep 19, 2026'){
        return {title:"Marvel's Guardians of the Galaxy: The Telltale Series",reason:'Known Josh GameEye mis-selection on 2026-09-19: physical pickup was the Telltale Series disc, while the GameEye row selected the separate 2021 Eidos/Square Enix game.'};
      }
      return {title,reason:null};
    };

    // Existing browser state only persisted unresolved title text, not the original row metadata.
    // This migration applies solely to stale unresolved rows created before v0.73 shipped. Future
    // fresh imports use the metadata-qualified correction above, so a real future ownership row for
    // the 2021 Eidos game will resolve to its own distinct identity normally.
    window.SHELFCHECK_GAMEEYE_STALE_TITLE_CORRECTIONS={
      [norm("Marvel's Guardians of the Galaxy")]:{title:"Marvel's Guardians of the Galaxy: The Telltale Series",reason:'2026-09-19 known GameEye wrong-item selection migration'}
    };

    window.SHELFCHECK_OWNERSHIP_RECONCILE_V073=true;
    console.info('ShelfCheck v0.73 ownership reconciliation applied');
  });
})();
