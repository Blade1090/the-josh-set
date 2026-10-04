// ShelfCheck v0.74 — reconcile packaging/edition names from Josh's 2026-10-03 GameEye sync.
//
// These are not new playable identities. They are physical edition/product labels for games
// already represented by one ShelfCheck identity. Adding explicit aliases lets both fresh CSV
// imports and gameeye-reconcile-v001.js repair Josh's already-saved unresolved queue on load.
(()=>{
  registerCensusMutation('exclude',()=>{
    const find=t=>items.find(x=>norm(x.title)===norm(t));
    const addAlias=(target,alias)=>{
      const x=find(target);
      if(!x){
        console.warn(`ShelfCheck v0.74 alias target not found: ${target}`);
        return false;
      }
      const a=norm(alias);
      if(!aliasesById.has(x.id))aliasesById.set(x.id,[]);
      if(!aliasesById.get(x.id).includes(a))aliasesById.get(x.id).push(a);
      if(Array.isArray(DATA?.a)&&!DATA.a.some(r=>r?.[1]===x.id&&norm(r?.[0])===a))DATA.a.push([alias,x.id]);
      x.search=(x.search||norm(x.title))+' '+a;
      return true;
    };

    const applied=[];
    const alias=(target,value)=>{if(addAlias(target,value))applied.push([target,value]);};

    alias('Destiny 2','Destiny 2: Limited Edition');
    alias('Human: Fall Flat','Human: Fall Flat Anniversary Edition');
    alias('Minecraft: Story Mode - A Telltale Games Series','Minecraft: Story Mode - The Complete Adventure');

    window.SHELFCHECK_OWNERSHIP_RECONCILE_V074={applied};
    console.info('ShelfCheck v0.74 ownership reconciliation applied',applied);
  });
})();
