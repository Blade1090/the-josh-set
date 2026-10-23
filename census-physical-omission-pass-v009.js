// ShelfCheck physical GameEye reconciliation — October 23, 2026.
// "Hole New World" is GameEye's name for the already-included "A Hole New World"
// (identity 21). Do NOT create a duplicate identity for a dropped leading article.
// "Gungrave G.O.R.E." is a separate qualifying North-American physical PS4 release,
// missing from the source census. The import and saved-unresolved-on-load passes then
// use these ordinary identity/alias records: no special ownership state manipulation.
(()=>{
  registerCensusMutation('add',()=>{
    const results=[];
    const addAlias=(x,source)=>{
      const key=norm(source);
      if(!aliasesById.has(x.id))aliasesById.set(x.id,[]);
      const bucket=aliasesById.get(x.id);
      if(!bucket.includes(key))bucket.push(key);
      if(!DATA.a.some(r=>r[1]===x.id&&norm(r[0])===key))DATA.a.push([source,x.id]);
      if(!(x.search||'').includes(key))x.search=(x.search||norm(x.title))+' '+key;
    };

    const hole=items.filter(x=>norm(x.title)===norm('A Hole New World')&&x.set==='INCLUDED');
    if(hole.length===1){
      addAlias(hole[0],'Hole New World');
      results.push({source:'Hole New World',status:'ALIASED',id:hole[0].id,identity:hole[0].title});
    }else{
      console.warn('ShelfCheck Oct 23: A Hole New World identity missing/ambiguous; review before repairing',hole);
      results.push({source:'Hole New World',status:'REVIEW'});
    }

    const gungraveCandidates=items.filter(x=>norm(x.title).replace(/\s/g,'')==='gungravegore');
    const included=gungraveCandidates.filter(x=>x.set==='INCLUDED');
    let gungrave=null;
    if(included.length===1){
      gungrave=included[0];
    }else if(gungraveCandidates.length){
      // Deliberately excluded or ambiguous existing identities are curator decisions.
      console.warn('ShelfCheck Oct 23: Gungrave identity excluded/ambiguous; review',gungraveCandidates);
      results.push({source:'Gungrave G.O.R.E.',status:'REVIEW'});
    }else if(byId.has(2798)){
      console.error('ShelfCheck Oct 23: reserved identity ID 2798 already occupied; refusing to overwrite');
      results.push({source:'Gungrave G.O.R.E.',status:'ID_COLLISION'});
    }else{
      gungrave={
        id:2798,title:'Gungrave G.O.R.E.',set:'INCLUDED',baseline:'NEEDED',
        strong:null,target:null,max:null,search:norm('Gungrave G.O.R.E.'),
        auditSource:'2026-10-23 GameEye owned PS4 copy exposed a missing identity. Prime Matter physical PS4 release is documented in Embracer Group 2022 announced-release report (PS4, Digital & Physical); title and PS4 rating confirmed by ESRB.'
      };
      items.push(gungrave);
      byId.set(gungrave.id,gungrave);
    }

    if(gungrave){
      addAlias(gungrave,'Gungrave G.O.R.E.');
      // Some catalogs collapse the title's dotted acronym into the word GORE.
      addAlias(gungrave,'Gungrave GORE');
      results.push({source:'Gungrave G.O.R.E.',status:gungraveCandidates.length?'ALIASED':'ADDED',id:gungrave.id,identity:gungrave.title});
    }
    window.SHELFCHECK_GAMEEYE_OCT23_REPAIR=results;
    console.info('ShelfCheck Oct 23 GameEye title reconciliation',results);
  });
})();
