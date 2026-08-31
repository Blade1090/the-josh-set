// ShelfCheck census integrity + provenance audit.
// Non-mutating: explains exactly what is contributing to the live denominator.
(()=>{
  let tries=0;
  const run=()=>{
    tries++;
    if(typeof norm!=='function'||!Array.isArray(items)||!items.length||!DATA||typeof byId==='undefined'){
      if(tries<120)setTimeout(run,100);return;
    }

    const included=items.filter(x=>x.set==='INCLUDED');
    const excluded=items.filter(x=>x.set==='EXCLUDED');
    const byNorm=new Map();
    for(const x of included){const k=norm(x.title);if(!byNorm.has(k))byNorm.set(k,[]);byNorm.get(k).push(x);}
    const duplicateGroups=[...byNorm.values()].filter(g=>g.length>1);

    // v0.52-v0.59 are the intentionally hand-curated PriceCharting negative-space passes.
    // Their assigned IDs span 2272-2780, with two deliberately unused IDs (2432, 2445).
    const pcSweepIds=new Set();
    for(let id=2272;id<=2780;id++)if(id!==2432&&id!==2445)pcSweepIds.add(id);
    const pcIncluded=included.filter(x=>pcSweepIds.has(+x.id));
    const pcExcluded=excluded.filter(x=>pcSweepIds.has(+x.id));
    const nonPcIncluded=included.filter(x=>!pcSweepIds.has(+x.id));

    const phaseCounts={
      v052:included.filter(x=>+x.id>=2272&&+x.id<=2368).length,
      v053:included.filter(x=>+x.id>=2369&&+x.id<=2455).length,
      v054:included.filter(x=>+x.id>=2456&&+x.id<=2475).length,
      v055:included.filter(x=>+x.id>=2476&&+x.id<=2543).length,
      v056:included.filter(x=>+x.id>=2544&&+x.id<=2580).length,
      v057:included.filter(x=>+x.id>=2581&&+x.id<=2650).length,
      v058:included.filter(x=>+x.id>=2651&&+x.id<=2709).length,
      v059:included.filter(x=>+x.id>=2710&&+x.id<=2780).length
    };

    const idx=typeof ensureMergedProducts==='function'?ensureMergedProducts():null;
    const seenProducts=new Set(),multiProducts=[];
    if(idx){for(const p of idx.values()){if(seenProducts.has(p.key))continue;seenProducts.add(p.key);const ids=[...new Set(p.ids||[])].filter(id=>byId.get(id)?.set==='INCLUDED');if(ids.length>1)multiProducts.push({title:p.title,count:ids.length,ids});}}

    const result={
      liveIncluded:included.length,
      liveExcluded:excluded.length,
      dataDenominator:DATA.n,
      denominatorMatches:DATA.n===included.length,
      lineage:{
        postCurrentScrubsNonPriceCharting:nonPcIncluded.length,
        priceChartingSweepIncluded:pcIncluded.length,
        priceChartingSweepExcluded:pcExcluded.length,
        priceChartingPhaseCounts:phaseCounts,
        recomposed:nonPcIncluded.length+pcIncluded.length
      },
      exactNormalizedDuplicateGroups:duplicateGroups.map(g=>g.map(x=>x.title)),
      multiIdentityProducts:multiProducts.map(p=>({title:p.title,count:p.count}))
    };

    window.SHELFCHECK_CENSUS_AUDIT=result;
    window.SHELFCHECK_CENSUS_LINEAGE=result.lineage;
    console.group('ShelfCheck census integrity / lineage');
    console.log('Integrity result',result);
    if(!result.denominatorMatches)console.error('DENOMINATOR MISMATCH',DATA.n,included.length);
    if(duplicateGroups.length)console.warn('Exact-normalized duplicate identity groups',result.exactNormalizedDuplicateGroups);
    const p=result.lineage;
    console.log(`Live denominator ${included.length} = ${p.postCurrentScrubsNonPriceCharting} non-PriceCharting + ${p.priceChartingSweepIncluded} PriceCharting sweep identities.`);
    console.log('PriceCharting phase counts',p.priceChartingPhaseCounts);
    console.groupEnd();
  };
  run();
})();
