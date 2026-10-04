// ShelfCheck v0.77 — exact GameEye product alias for Minecraft Story Mode Complete Adventure.
//
// The underlying playable identity already exists (id 783) and the shorter physical product
// "Minecraft: Story Mode Complete Adventure" is already registered. GameEye exports Josh's
// owned copy with the longer packaging title below, which previously fell through to an old
// EXCLUDED duplicate/wrapper census row. Register the long string as an alias of the EXISTING
// physical product so product matching wins first and correctly satisfies identity 783.
(()=>{registerCensusMutation('exclude',()=>{
  const source='Minecraft: Story Mode - A Telltale Games Series - The Complete Adventure';
  const canonical='Minecraft: Story Mode Complete Adventure';
  const target=items.find(x=>x.id===783)||items.find(x=>norm(x.title)===norm('Minecraft: Story Mode - A Telltale Games Series'));
  if(!target||target.set!=='INCLUDED'){
    console.warn('ShelfCheck v0.77: Minecraft Story Mode target identity not found/included.');
    return;
  }

  let row=DATA.p.find(p=>norm(p?.[0])===norm(source));
  if(row){
    row[1]=canonical;
    row[2]=[...new Set([...(row[2]||[]),target.id])];
  }else{
    DATA.p.push([source,canonical,[target.id]]);
  }

  const p={key:norm(source),title:canonical,ids:[target.id]};
  productMap.set(norm(source),p);
  if(typeof mergedProductIndex!=='undefined')mergedProductIndex=null;

  window.SHELFCHECK_OWNERSHIP_RECONCILE_V077={source,canonical,identity:target.title,id:target.id};
  console.info('ShelfCheck v0.77 Minecraft product alias applied',window.SHELFCHECK_OWNERSHIP_RECONCILE_V077);
});})();
