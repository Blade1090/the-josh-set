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
    if(!rejected&&(!x||x.set!=='INCLUDED'))return'';
    const status=rejected?'<p class="reject-status">🚫 Excluded from Josh Set by Josh</p>':'';
    const btn=rejected
      ?`<button type="button" class="reject-toggle-btn restore-btn" onclick="restoreGame(${id})">↩ Restore to Josh Set</button>`
      :`<button type="button" class="reject-toggle-btn reject-btn" onclick="rejectGame(${id})">❌ Reject from Josh Set</button>`;
    return status+btn;
  }

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

  if(typeof detail==='function'){
    const oldDetail=detail;
    detail=function(id){
      const r=oldDetail.apply(this,arguments);
      paintRejectControls(id);
      if(typeof dossiersReady!=='undefined'&&(!dossiersReady||!hltbReady))setTimeout(()=>{if(typeof dlg!=='undefined'&&dlg.open)paintRejectControls(id)},520);
      return r;
    };
  }

  (async()=>{
    await dataReady;
    reconcileOverlay();
    if(typeof progress==='function')progress();
    if(typeof render==='function')render();
  })();

  window.SHELFCHECK_REJECT={version:1,isRejected,rejectGame,restoreGame,rejectedIds:()=>[...rejectedIds()],reconcileOverlay};
})();

// Browser/runtime pricing reconcile (2026-09-23).
(()=>{
  const FIX=new Map([
    ['double switch 25th anniversary edition',{m:29.23,product:'Double Switch',region:'US',source:'PriceCharting exact PS4 product'}],
    ['mighty switch force collection',{m:35.79,product:'Mighty Switch Force Collection',region:'US',source:'PriceCharting exact PS4 product'}],
    ['bud spencer and terence hill slaps and beans 2',{m:28.98,product:'Slaps and Beans 2',region:'US',source:'PriceCharting exact PS4 product'}],
  ]);
  let tries=0;
  const apply=()=>{
    tries++;
    if(typeof priceFor!=='function'||typeof norm!=='function'){
      if(tries<100)setTimeout(apply,100);
      return;
    }
    if(window.__SHELFCHECK_BROWSER_PRICE_RECONCILED)return;
    window.__SHELFCHECK_BROWSER_PRICE_RECONCILED=true;
    const prev=priceFor;
    priceFor=function(x){
      const p=prev(x);
      if(p)return p;
      const rec=FIX.get(norm(x.title));
      if(!rec)return null;
      const m=rec.m;
      return {t:x.title,m,s:+(m*.70).toFixed(2),g:+(m*.85).toFixed(2),x:+(m*1.10).toFixed(2),pc:rec.product,c:rec.region,source:rec.source,browserRuntimeReconcile:true};
    };
    window.SHELFCHECK_BROWSER_PRICE_RECONCILE={count:FIX.size,version:2};
    if(typeof resetBrowse==='function')resetBrowse();
    if(typeof render==='function')render();
  };
  apply();
})();
