// ShelfCheck Wishlist v1 -- a ShelfCheck-local "I want to hunt this" list, separate from
// ownership. Follows the exact same persistence convention already used for PLAYED/BEATEN
// state (see shelf-roulette-v001.js's idsFor()/setStatus()): a plain array of ids on
// stateCache, saved through the existing saveState() pipeline -- no new persistence system,
// automatically included in Backup (which already serializes the whole stateCache) and
// Restore (state-guard-v043.js's merge already keeps whatever field an older backup omits).
//
// Wishlist is NOT ownership: nothing here touches ownedSet, productSet, census item.set,
// effectiveStatus()/status(), or GameEye's importCSV/reconciliation matching logic. The only
// ownership-aware behavior is the auto-removal below, which only ever REMOVES a wishlist
// entry after ownership is independently decided elsewhere -- it never influences that
// decision.
(()=>{
  function wishlistIds(){return new Set(Array.isArray(stateCache?.wishlist)?stateCache.wishlist:[])}
  function isWishlisted(id){return wishlistIds().has(id)}
  function setWishlist(ids){saveState({...stateCache,wishlist:[...ids]})}
  function addWishlist(id){const s=wishlistIds();if(s.has(id))return;s.add(id);setWishlist(s)}
  function removeWishlist(id){const s=wishlistIds();if(!s.has(id))return;s.delete(id);setWishlist(s)}
  function toggleWishlist(id){if(isWishlisted(id))removeWishlist(id);else addWishlist(id)}
  window.isWishlisted=isWishlisted;
  window.addWishlist=addWishlist;
  window.removeWishlist=removeWishlist;
  window.toggleWishlist=toggleWishlist;

  const style=document.createElement('style');
  style.textContent=`.badge.wishlist-badge{background:#3a2a08;color:#ffcf5c;margin-left:6px}.wishlist-toggle{display:block;width:100%;margin:10px 0 0;padding:13px;border-radius:12px;font-weight:900;background:#20232c;border:1px solid #4a4530;color:#ffcf5c}.wishlist-toggle.active{background:linear-gradient(135deg,#ffb648,#ff8a3d);color:#2a1600;border-color:#ffb648}#wishlistEntryBtn{width:100%;height:100%;margin:0;padding:14px;border:0;border-radius:14px;background:linear-gradient(135deg,#ffd76b,#ffb648);color:#2a1600;font-weight:950;font-size:1rem;letter-spacing:.02em;box-shadow:0 8px 24px #ffb64833;cursor:pointer;display:flex;align-items:center;justify-content:center;text-align:center}`;
  document.head.appendChild(style);

  // Auto-remove from Wishlist once an identity becomes OWNED -- runs on every saveState()
  // call, so it fires after GameEye import (ownership-audit-v068.js), reconciliation-on-load
  // (gameeye-reconcile-v001.js), a manual ownership edit, or a Backup restore alike, using the
  // same finalized effectiveStatus() everything else already uses. Never touches GameEye
  // matching itself -- it only ever reacts to ownership after the fact. Guarded against
  // re-entrant recursion since it calls saveState() again for the follow-up prune.
  let pruning=false;
  const _saveStateForWishlist=saveState;
  saveState=function(next){
    const result=_saveStateForWishlist(next);
    if(!pruning){
      const list=Array.isArray(stateCache.wishlist)?stateCache.wishlist:[];
      const kept=list.filter(id=>{const x=byId.get(id);return !x||effectiveStatus(x)!=='OWNED'});
      if(kept.length!==list.length){
        pruning=true;
        try{saveState({...stateCache,wishlist:kept})}
        finally{pruning=false}
      }
    }
    return result;
  };

  // Random/Dossier: a prominent wishlist toggle next to the Random Game flow's own "ANOTHER
  // RANDOM GAME" button. Deliberately does NOT edit fun-features-v103.js -- randomGame()/
  // randomDetailButton() are private to that file's closure, so this instead wraps the same
  // global detail() cover-art-v080.js already wraps, and watches for the ".another-random-
  // thumb" marker that ONLY the Random flow ever creates (a plain card click never adds it,
  // and detail()'s innerHTML replacement wipes any leftover one from a previous view). Uses
  // the exact same 0ms/650ms retry timing randomDetailButton() itself already uses to cover
  // the dossier-not-ready-yet race.
  const _detailForWishlist=detail;
  detail=function(id){
    const r=_detailForWishlist(id);
    scheduleWishlistToggle(id);
    return r;
  };
  function scheduleWishlistToggle(id){
    setTimeout(()=>injectWishlistToggle(id),0);
    setTimeout(()=>injectWishlistToggle(id),650);
  }
  function injectWishlistToggle(id){
    if(!dlg.open)return;
    const host=$('#detail');
    const anchor=host&&host.querySelector('.another-random-thumb');
    if(!anchor||host.querySelector('.wishlist-toggle'))return;
    const w=document.createElement('button');
    w.className='wishlist-toggle';
    const paint=()=>{const on=isWishlisted(id);w.textContent=on?'⭐ WISHLISTED':'☆ ADD TO WISHLIST';w.classList.toggle('active',on)};
    // Toggles state and repaints this one button only -- no render(), no detail(), no
    // randomGame() call, so the current Random dossier and game never change underneath it.
    w.onclick=()=>{toggleWishlist(id);paint()};
    paint();
    anchor.before(w);
  }

  // Normal browsing: a compact supplemental "⭐ WISHLIST" badge alongside the existing status
  // badge on every rendered card. Same post-process-the-rendered-DOM approach price-fix.js's
  // decoratePriceCards() already uses, rather than editing model-fix.js's render() card
  // template directly -- matches cards by title (the same lookup key used throughout, e.g.
  // decoratePriceCards() itself).
  function decorateWishlistBadges(){
    for(const card of document.querySelectorAll('#results article.card')){
      const title=card.querySelector('.top b')?.textContent;
      if(!title)continue;
      const x=items.find(g=>norm(g.title)===norm(title));
      if(!x||!isWishlisted(x.id))continue;
      const top=card.querySelector('.top');
      if(top&&!top.querySelector('.wishlist-badge')){
        const b=document.createElement('span');
        b.className='badge wishlist-badge';
        b.textContent='⭐ WISHLIST';
        top.appendChild(b);
      }
    }
  }

  // View My Wishlist: NOT a 4th ALL/NEEDED/OWNED status filter -- those three stay exactly the
  // collection-status trio they already are. Instead this completes the main utility area as a
  // 2x2 grid: SHELF ROULETTE | MY SHELF on row 1, SHOULD I BUY THIS? | WISHLIST on row 2 (see
  // the .shelf-actions grid rule in my-shelf-v001.js, which already owns that shared layout,
  // and fun-features-v103.js's #quickBuyBtn, which now mounts into the same container). Reuses
  // the existing `filter` variable render() already branches on -- clicking just sets
  // filter='WISHLIST' and re-renders, the same effect a nav filter click would have had, without
  // actually living in <nav>.
  function installShelfActionButton(){
    const container=document.querySelector('.shelf-actions');
    if(!container||document.querySelector('#wishlistEntryBtn'))return;
    const b=document.createElement('button');
    b.id='wishlistEntryBtn';
    b.textContent='⭐ WISHLIST';
    b.onclick=()=>{
      filter='WISHLIST';
      document.querySelectorAll('nav button').forEach(x=>x.classList.remove('active'));
      resetBrowse();
    };
    container.appendChild(b);
  }
  // Matches fun-features-v103.js's own readyState gate exactly -- both #quickBuyBtn and this
  // button must install at the SAME loading phase (either both immediate or both deferred to
  // DOMContentLoaded) for their relative <script> tag order to determine final DOM/grid order;
  // without this, calling install unconditionally here can append this button to
  // .shelf-actions BEFORE fun-features-v103.js's deferred install runs, reversing row 2.
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installShelfActionButton);else installShelfActionButton();

  function wishlistedItems(){return items.filter(x=>x.set!=='EXCLUDED'&&isWishlisted(x.id))}

  const _renderForWishlist=render;
  render=function(){
    if(filter==='WISHLIST'){
      const originalItems=items,originalFilter=filter;
      const wishlisted=wishlistedItems();
      items=wishlisted;filter='ALL';
      try{_renderForWishlist()}
      finally{items=originalItems;filter=originalFilter}
      if(!wishlisted.length&&!norm($('#q').value)){
        $('#results').innerHTML='<div class="muted" style="text-align:center;padding:22px 14px"><p style="font-weight:700;margin:0 0 8px">⭐ Your wishlist is empty</p><p style="margin:0">Save games you want to hunt for by tapping ☆ ADD TO WISHLIST from Random Game.</p></div>';
      }
      return;
    }
    _renderForWishlist();
    decorateWishlistBadges();
  };

  window.SHELFCHECK_WISHLIST={version:1,isWishlisted,addWishlist,removeWishlist,toggleWishlist,wishlistedItems,decorateWishlistBadges};
})();
