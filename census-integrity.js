// ShelfCheck full-census integrity audit harness.
// Runs after census-cleanup.js and validates the live identity/product model without mutating source data.
(()=>{
  let tries=0;
  const run=()=>{
    tries++;
    if(typeof norm!=='function'||!Array.isArray(items)||!items.length||!DATA){if(tries<100)setTimeout(run,100);return;}

    const included=items.filter(x=>x.set==='INCLUDED');
    const excluded=items.filter(x=>x.set==='EXCLUDED');
    const byNorm=new Map();
    for(const x of included){const k=norm(x.title);if(!byNorm.has(k))byNorm.set(k,[]);byNorm.get(k).push(x);}
    const duplicateGroups=[...byNorm.values()].filter(g=>g.length>1);

    const reviewedKeeps=included.filter(x=>x.cleanupReviewed);
    const cleanupExcluded=excluded.filter(x=>x.cleanupReason);

    // Candidate-only heuristics. These NEVER change inclusion; they surface records for evidence review.
    const dlcWords=/\b(dlc|season pass|expansion|add on|add-on|episode pack|skin pack|character pack|map pack|costume pack|soundtrack)\b/i;
    const editionWords=/\b(playstation hits|greatest hits|limited edition|collector'?s edition|collectors edition|deluxe edition|steelbook|not for resale)\b/i;
    const vrWords=/\b(psvr|playstation vr|vr worlds|vr edition)\b/i;
    const sportsAnnual=/\b(fifa|madden nfl|nba 2k|nhl|mlb the show|wwe 2k|f1)\s*([12][0-9]{3}|[0-9]{2})\b/i;

    const dlcCandidates=included.filter(x=>dlcWords.test(x.title));
    const editionCandidates=included.filter(x=>editionWords.test(x.title));
    const vrCandidates=included.filter(x=>vrWords.test(x.title));
    const annualSportsCandidates=included.filter(x=>sportsAnnual.test(x.title));

    const idx=typeof ensureMergedProducts==='function'?ensureMergedProducts():null;
    const seenProducts=new Set(),multiProducts=[];
    if(idx){for(const p of idx.values()){if(seenProducts.has(p.key))continue;seenProducts.add(p.key);const ids=[...new Set(p.ids||[])].filter(id=>byId.get(id)?.set==='INCLUDED');if(ids.length>1)multiProducts.push({title:p.title,count:ids.length,ids});}}

    const result={
      sourceReported:2068,
      liveIncluded:included.length,
      liveExcluded:excluded.length,
      dataDenominator:DATA.n,
      denominatorMatches:DATA.n===included.length,
      exactNormalizedDuplicateGroups:duplicateGroups.map(g=>g.map(x=>x.title)),
      cleanupExcluded:cleanupExcluded.map(x=>({title:x.title,reason:x.cleanupReason})),
      reviewedKeeps:reviewedKeeps.map(x=>({title:x.title,reason:x.cleanupReason})),
      multiIdentityProducts:multiProducts.map(p=>({title:p.title,count:p.count})),
      reviewQueues:{
        dlcNamed:dlcCandidates.map(x=>x.title),
        editionNamed:editionCandidates.map(x=>x.title),
        vrNamed:vrCandidates.map(x=>x.title),
        annualSportsNamed:annualSportsCandidates.map(x=>x.title)
      }
    };
    window.SHELFCHECK_CENSUS_AUDIT=result;
    console.group('ShelfCheck full census audit');
    console.log('Integrity result',result);
    if(!result.denominatorMatches)console.error('DENOMINATOR MISMATCH',DATA.n,included.length);
    if(duplicateGroups.length)console.warn('Exact-normalized duplicate identity groups',result.exactNormalizedDuplicateGroups);
    console.log(`Live denominator: ${included.length} (source freeze reported 2068; post-freeze cleanup delta ${included.length-2068})`);
    console.log(`Multi-identity products modeled: ${multiProducts.length}`);
    console.log('Evidence-review candidates (not automatic verdicts)',result.reviewQueues);
    console.groupEnd();
  };
  run();
})();