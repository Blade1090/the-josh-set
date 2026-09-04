// ShelfCheck census finalization -- the single deterministic point where every
// census-mutating script's queued change is applied, in a fixed two-phase order
// (every addition/reinstatement first, then every eligibility/dedup exclusion rule),
// exactly once per load.
//
// This tag is placed after every census-mutating <script> tag above it, so by the time
// it runs, all of them have already synchronously registered into censusQueue (see
// app.js) regardless of how far the census data fetch has progressed. The only real
// wait left is for that fetch/decompress to finish, which this awaits directly via
// dataReady instead of polling -- so the result no longer depends on script or network
// timing: the exclude phase always sees the complete candidate set the add phase built,
// so a later script can never leave a should-be-excluded identity INCLUDED just because
// it happened to be added after cleanup already ran.
(async()=>{
  await dataReady;
  for(const fn of censusQueue.add)fn();
  for(const fn of censusQueue.exclude)fn();
  censusQueue.add.length=0;
  censusQueue.exclude.length=0;
  DATA.n=items.filter(x=>x.set==="INCLUDED").length;
  censusFinalized=true;
  if(typeof mergedProductIndex!=="undefined")mergedProductIndex=null;
  if(typeof progress==="function")progress();
  if(typeof resetBrowse==="function")resetBrowse();
  window.SHELFCHECK_CENSUS_FINALIZED={included:DATA.n,at:Date.now()};
  console.info(`ShelfCheck census finalized deterministically; denominator ${DATA.n}`);
})();
