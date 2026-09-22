// ShelfCheck "Reject from Josh Set" v1 -- Josh's personal curation overlay.
// This is a personal-curation feature, not a census/data cleanup pass: it never edits the
// census or curation JS files. It layers a locally-persisted set of Josh-rejected identity
// ids on top of the already-finalized runtime census. A rejected identity's in-memory
// x.set flips from INCLUDED to EXCLUDED -- the same value the real census/curation
// pipeline already uses for "not in the Josh Set" -- so every existing consumer that
// already gates on x.set==='INCLUDED'/'EXCLUDED' (NEEDED/OWNED/ALL, Shelf Roulette's
// eligible pool, My Shelf's owned pool, Wishlist, fun-features' Random Game/length bands,
// Store Mode's SKIP check) automatically respects the rejection with no changes to any of
// those files. The one exception is the EXCLUDED tab: since a canonical census exclusion
// (curation-josh-set-pass-*, census-cleanup.js, etc.) also sets x.set to the same
// 'EXCLUDED' value, model-fix.js's render() is patched (a single line) to check
// isRejected(x.id) there instead of raw x.set, so EXCLUDED only ever surfaces Josh's own
// rejections for review/restore, never the ~300 built-in census exclusions. Only the id
// list ever persists (stateCache.rejected, part of the existing BACKUP/RESTORE JSON) --
// never a mutation to the census data files themselves, and never a permanent change to
// the in-memory identity object beyond this runtime overlay.
(()=>{
  const style=document.createElement('style');
  style.textContent=`.reject-controls{margin:10px 0}.reject-status{margin:0 0 8px;padding:9px 11px;border-radius:10px;background:#2a1414;color:#ffaaaa;font-weight:850;font-size:.85rem}.reject-toggle-btn{display:block;width:100%;padding:12px;border-radius:11px;font-weight:900;cursor:pointer}.reject-toggle-btn.reject-btn{background:#3a1414;color:#ff9d9d;border:1px solid #6b2b2b}.reject-toggle-btn.restore-btn{background:#123324;color:#87efaa;border:1px solid #285b3f}`;
  document.head.appendChild(style);

  function rejectedIds(){return new Set(Array.isArray(stateCache?.rejected)?stateCache.rejected:[])}
  function isRejected(id){return rejectedIds().has(id)}

  // Tracks which ids THIS overlay has flipped to EXCLUDED, independent of stateCache, so a
  // later reconcile (e.g. after a BACKUP restore swaps in a different rejected list) can
  // correctly revert exactly the ones no longer wanted without touching a genuinely
  // census-excluded identity that this overlay never touched.
  const appliedIds=new Set();
  function applyOverlayId(id){const x=byId.get(id);if(x&&x.set==='INCLUDED'){x.set='EXCLUDED';appliedIds.add(id)}}
  function revertOverlayId(id){const x=byId.get(id);if(x&&x.set==='EXCLUDED')x.set='INCLUDED';appliedIds.delete(id)}
  function recomputeIncluded(){if(typeof DATA!=='undefined'&&DATA)DATA.n=items.filter(x=>x.set==='INCLUDED').length}

  function reconcileOverlay(){
    const wanted=rejectedIds();
    for(const id of[...appliedIds])if(!wanted.has(id))revertOverlayId(id);
    for(const id of wanted)if(!appliedIds.has(id))applyOverlayId(id);
    recomputeIncluded();
  }

  // Wraps whatever saveState currently resolves to (already wrapped once by
  // state-guard-v043.js and again by wishlist-v001.js) so every save -- GameEye import,
  // price import, BACKUP restore, roulette played/beaten marks, and this feature's own
  // reject/restore -- re-syncs the overlay and repaints the active-set views, the same
  // "wrap the current global" pattern those two scripts already use.
  const rawSaveState=saveState;
  saveState=function(next){
    const r=rawSaveState(next);
    reconcileOverlay();
    if(typeof progress==='function')progress();
    if(typeof render==='function')render();
    return r;
  };

  function rejectGame(id){
    const x=byId.get(id);
    if(!x||x.set!=='INCLUDED')return;
    if(!window.confirm('Reject this game from the Josh Set?'))return;
    const ids=rejectedIds();ids.add(id);
    saveState({...stateCache,rejected:[...ids]});
    paintRejectControls(id);
  }
  function restoreGame(id){
    const ids=rejectedIds();
    if(!ids.has(id))return;
    ids.delete(id);
    saveState({...stateCache,rejected:[...ids]});
    paintRejectControls(id);
  }
  window.rejectGame=rejectGame;
  window.restoreGame=restoreGame;

  function controlHtml(id){
    const x=byId.get(id),rejected=isRejected(id);
    // No button at all for a genuinely census-excluded identity this overlay never touched --
    // reject/restore only applies to something currently active or Josh-rejected.
    if(!rejected&&(!x||x.set!=='INCLUDED'))return'';
    const status=rejected?'<p class="reject-status">🚫 Excluded from Josh Set by Josh</p>':'';
    const btn=rejected
      ?`<button type="button" class="reject-toggle-btn restore-btn" onclick="restoreGame(${id})">↩ Restore to Josh Set</button>`
      :`<button type="button" class="reject-toggle-btn reject-btn" onclick="rejectGame(${id})">❌ Reject from Josh Set</button>`;
    return status+btn;
  }

  // The top status badge (".badge", first one in the detail markup) was painted once by the
  // original detail() call and never repainted by it again -- calling detail() a second time
  // to refresh it isn't safe here, since dossiers.js's detail() unconditionally calls
  // dlg.showModal() at the end, which throws on a <dialog> that's already open (exactly the
  // case every time this button is clicked). So this patches that badge's class/text in place
  // instead, using the same effectiveStatus()/collectionInfo() logic detail() itself used.
  function badgeInfo(x){
    const c=typeof collectionInfo==='function'?collectionInfo(x):null;
    if(c)return{cls:c.owned?'OWNED':'NEEDED',text:c.owned?'OWNED · COLLECTION':'NEEDED · COLLECTION'};
    const st=effectiveStatus(x);
    return{cls:st,text:st};
  }

  function paintRejectControls(id){
    const host=document.querySelector('#detail');
    if(!host)return;
    const x=byId.get(id);
    const old=host.querySelector('.reject-controls');
    if(old)old.remove();
    const badge=host.querySelector('.badge');
    if(badge&&x){const info=badgeInfo(x);badge.className='badge '+info.cls;badge.textContent=info.text}
    const html=controlHtml(id);
    if(!html)return;
    const wrap=document.createElement('div');
    wrap.className='reject-controls';
    wrap.innerHTML=html;
    if(badge)badge.insertAdjacentElement('afterend',wrap);else host.prepend(wrap);
  }

  // Wraps whatever `detail` currently resolves to -- by loading last, this is always the
  // fully-assembled version (dossiers.js's richer detail, further wrapped by
  // product-smart-v036.js and cover-art-v080.js) -- purely additive, the same pattern
  // those two already use. The second, delayed repaint mirrors dossiers.js's own 500ms
  // dossier/HLTB retry so this control survives that later repaint instead of being wiped
  // by it.
  if(typeof detail==='function'){
    const oldDetail=detail;
    detail=function(id){
      const r=oldDetail.apply(this,arguments);
      paintRejectControls(id);
      if(typeof dossiersReady!=='undefined'&&(!dossiersReady||!hltbReady))setTimeout(()=>{if(typeof dlg!=='undefined'&&dlg.open)paintRejectControls(id)},520);
      return r;
    };
  }

  // Applies the overlay once at load (a returning device with rejections already in
  // localStorage). Registered last, after census-finalize.js's own `await dataReady`
  // continuation, so by the time this resumes the add/exclude phases have already run and
  // DATA.n already reflects the finalized census -- this only adjusts it further for
  // Josh's own rejections.
  (async()=>{
    await dataReady;
    reconcileOverlay();
    if(typeof progress==='function')progress();
    if(typeof render==='function')render();
  })();

  window.SHELFCHECK_REJECT={version:1,isRejected,rejectGame,restoreGame,rejectedIds:()=>[...rejectedIds()],reconcileOverlay};
})();
