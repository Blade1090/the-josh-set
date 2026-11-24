// ShelfCheck v0.78 — reconcile GameEye's Little Hope title with the existing PS4 identity.
// GameEye: "Dark Pictures Anthology: Little Hope"
// Census identity 1235: "The Dark Pictures - Little Hope".
// These are one game, not two identities. Add aliases; never change the census denominator.
(()=>{
  registerCensusMutation('exclude',()=>{
    const target=byId.get(1235);
    if(!target||target.set!=='INCLUDED'||norm(target.title)!=='the dark pictures little hope'){
      console.warn('ShelfCheck v0.78: Little Hope identity 1235 missing, excluded, or renamed; refusing alias repair.',target);
      return;
    }
    const names=[
      'Dark Pictures Anthology: Little Hope',
      'The Dark Pictures Anthology: Little Hope',
      'Dark Pictures: Little Hope',
      'The Dark Pictures: Little Hope'
    ];
    const aliases=aliasesById.get(target.id)||[];
    const added=[];
    for(const name of names){
      const key=norm(name);
      const conflict=items.find(x=>x.id!==target.id&&x.set==='INCLUDED'&&
        (norm(x.title)===key||(aliasesById.get(x.id)||[]).includes(key)));
      if(conflict){
        console.warn('ShelfCheck v0.78: Little Hope alias collision; skipped',name,conflict);
        continue;
      }
      if(!aliases.includes(key))aliases.push(key);
      if(!DATA.a.some(row=>row?.[1]===target.id&&norm(row?.[0])===key))DATA.a.push([name,target.id]);
      if(!(target.search||'').includes(key))target.search=(target.search||norm(target.title))+' '+key;
      added.push(name);
    }
    aliasesById.set(target.id,aliases);
    window.SHELFCHECK_OWNERSHIP_RECONCILE_V078={id:target.id,title:target.title,aliases:added};
    console.info('ShelfCheck v0.78 GameEye Little Hope aliases active',window.SHELFCHECK_OWNERSHIP_RECONCILE_V078);
  });
})();


// Street Fighter V: Champion Edition is a physical edition of identity 1159,
// not an additional playable identity. Match the exact GameEye label only.
(()=>{
  registerCensusMutation('exclude',()=>{
    const target=byId.get(1159), name='Street Fighter V: Champion Edition', key=norm(name);
    if(!target||target.set!=='INCLUDED'||norm(target.title)!=='street fighter v')return;
    if(items.some(x=>x.id!==target.id&&x.set==='INCLUDED'&&
      (norm(x.title)===key||(aliasesById.get(x.id)||[]).includes(key))))return;
    const aliases=aliasesById.get(target.id)||[];
    if(!aliases.includes(key))aliases.push(key);
    aliasesById.set(target.id,aliases);
    if(!DATA.a.some(row=>row?.[1]===target.id&&norm(row?.[0])===key))DATA.a.push([name,target.id]);
    if(!(target.search||'').includes(key))target.search=(target.search||norm(target.title))+' '+key;
  });
})();
