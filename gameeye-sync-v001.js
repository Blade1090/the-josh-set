// ShelfCheck "Last GameEye Sync" indicator -- compact, main-screen-visible confidence check
// for whether ownership data is current. Reuses ownership-audit-v068.js's existing
// stateCache.ownershipAudit.at (already set once per successful GameEye import, at the same
// point owned/products are persisted) rather than adding a new state field or touching the
// import/matching logic at all -- a failed/invalid import throws before that point and never
// reaches saveState, so it naturally never advances this timestamp either. Backup/restore
// already round-trips the whole stateCache, so this comes along for free.
(()=>{
  const DAY_MS=86400000;
  function gameEyeSyncInfo(){
    const at=stateCache?.ownershipAudit?.at;
    const d=at?new Date(at):null;
    if(!d||isNaN(d.getTime()))return{text:'GameEye: No sync recorded',cls:''};
    const now=new Date();
    const sameDay=d.getFullYear()===now.getFullYear()&&d.getMonth()===now.getMonth()&&d.getDate()===now.getDate();
    const dateLabel=sameDay
      ?`Today, ${d.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'})}`
      :d.toLocaleDateString(undefined,{month:'short',day:'numeric',year:d.getFullYear()===now.getFullYear()?undefined:'numeric'});
    const days=Math.floor((now-d)/DAY_MS);
    const cls=days>=31?'stale-hard':days>=8?'stale-mild':'';
    return{text:`GameEye synced: ${dateLabel}`,cls};
  }
  function renderGameEyeSync(){
    const el=document.getElementById('gameEyeSync');
    if(!el)return;
    const{text,cls}=gameEyeSyncInfo();
    el.textContent=text;
    el.className='muted gameeye-sync'+(cls?' '+cls:'');
  }
  const _renderForSync=render;
  render=function(){_renderForSync();renderGameEyeSync()};
  window.SHELFCHECK_GAMEEYE_SYNC_V001={gameEyeSyncInfo};
})();
