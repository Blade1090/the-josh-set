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
  // RANDOM GAME" button. fun-features-v103.js's randomDetailButton() now calls this directly,
  // synchronously, right after building/finding its own button (see fun-features-v103.js) --
  // no polling, no setTimeout retry, no separate wrap of detail() needed. This previously
  // wrapped the global detail() and polled for the ".another-random-thumb" marker on a 0ms/
  // 650ms timer, independent of fun-features-v103.js's own identical-purpose retry for that
  // same button; the two independent timers raced each other, which is exactly what made the
  // toggle visibly flash on every "ANOTHER RANDOM GAME" press. Exposed on window rather than
  // called via a hard import, so this stays the same kind of optional, removable add-on the
  // rest of Wishlist is (fun-features-v103.js feature-detects it).
  function renderRandomWishlistToggle(id,host,anchorEl){
    let w=host.querySelector('.wishlist-toggle');
    if(!w){
      w=document.createElement('button');
      w.className='wishlist-toggle';
      anchorEl.before(w);
    }
    const paint=()=>{const on=isWishlisted(id);w.textContent=on?'⭐ WISHLISTED':'☆ ADD TO WISHLIST';w.classList.toggle('active',on)};
    // Toggles state and repaints this one button only -- no render(), no detail(), no
    // randomGame() call, so the current Random dossier and game never change underneath it.
    w.onclick=()=>{toggleWishlist(id);paint()};
    paint();
  }
  window.renderRandomWishlistToggle=renderRandomWishlistToggle;

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

  // Random Wishlist Game: same shuffle-bag/no-repeat pattern as fun-features-v103.js's own
  // drawRandomId() for NEEDED/OWNED Random Game (shuffle the pool, pop one at a time, reshuffle
  // -- swapping away an immediate repeat at the boundary -- once the pool's own identity changes
  // or the bag empties), but with its OWN independent cycle state so drawing from the Wishlist
  // never shares or disturbs Random Game's bag. drawRandomId() itself is private to fun-features-
  // v103.js's IIFE and not reachable from here, so this is a small, deliberately separate copy of
  // the same algorithm rather than a shared one -- scoped exactly like Shelf Roulette's own
  // independent session bag already is.
  let wishlistRandomCycle={universe:null,remaining:[],lastId:null};
  let lastWishlistRandomId=null;
  function shuffle(arr){for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}return arr}
  function drawWishlistRandomId(pool){
    const ids=pool.map(x=>x.id),universe=wishlistRandomCycle.universe,sameUniverse=!!universe&&universe.size===ids.length&&ids.every(id=>universe.has(id));
    if(!sameUniverse||!wishlistRandomCycle.remaining.length){
      const shuffled=shuffle(ids.slice()),last=shuffled.length-1;
      if(last>0&&shuffled[last]===wishlistRandomCycle.lastId){const j=Math.floor(Math.random()*last);[shuffled[last],shuffled[j]]=[shuffled[j],shuffled[last]]}
      wishlistRandomCycle={universe:new Set(ids),remaining:shuffled,lastId:wishlistRandomCycle.lastId};
    }
    const id=wishlistRandomCycle.remaining.pop();
    wishlistRandomCycle.lastId=id;
    return id;
  }
  // Same current-search-respecting shape as fun-features-v103.js's neededPool()/ownedPool() --
  // drawing while a search filter is active in the Wishlist view only draws from what's actually
  // shown, and removing the currently-displayed game from the Wishlist (or it becoming OWNED,
  // handled by the auto-removal above) simply makes it disappear from this live pool on the very
  // next draw -- no separate bookkeeping needed.
  function wishlistRandomPool(){const q=norm($('#q').value);return wishlistedItems().filter(x=>!q||x.search.includes(q))}
  function resetDialogScroll(){if(dlg)dlg.scrollTop=0}
  function randomWishlistGame(){
    const pool=wishlistRandomPool();
    if(!pool.length){$('#syncmsg').textContent='Your wishlist is empty.';return}
    lastWishlistRandomId=drawWishlistRandomId(pool);
    detail(lastWishlistRandomId);
    resetDialogScroll();
    randomWishlistDetailButton();
    if(!dossiersReady||!hltbReady)setTimeout(randomWishlistDetailButton,520);
  }
  // Mirrors fun-features-v103.js's randomDetailButton() exactly -- same anchor-off-#v-or-before-
  // .dossier placement, same synchronous call right after detail() so the reroll control and the
  // Wishlist toggle beside it render as part of one paint, never a delayed injection. Opens the
  // real, normal detail()/dossier view -- there is no separate "Wishlist detail screen".
  function randomWishlistDetailButton(){
    resetDialogScroll();
    if(!dlg.open)return;
    const host=$('#detail');
    if(!host)return;
    let b=host.querySelector('.another-wishlist-thumb');
    if(!b){
      b=document.createElement('button');
      b.className='another-random another-wishlist-thumb';
      b.textContent='🎲 ANOTHER WISHLIST GAME';
      b.onclick=randomWishlistGame;
      const verdict=host.querySelector('#v');
      if(verdict)verdict.after(b);
      else{const dossier=host.querySelector('.dossier');if(dossier)dossier.before(b);else host.appendChild(b)}
    }
    if(lastWishlistRandomId!=null)renderRandomWishlistToggle(lastWishlistRandomId,host,b);
  }
  // Entry point, shown only in the Wishlist view itself -- same "info blurb + button" .hunt-
  // tools/.hunt-random box fun-features-v103.js's ownedTools() already uses for its own Random
  // entry point, so this needs no new CSS. fun-features-v103.js's cleanTools() already wipes
  // every .hunt-tools section on every render before the current filter's own tools (including
  // this one) get re-added, so no separate duplicate-guard is needed here.
  function wishlistTools(){
    const results=$('#results');
    if(!results)return;
    const pool=wishlistRandomPool();
    const box=document.createElement('section');
    box.className='hunt-tools wishlist-random-tools';
    box.innerHTML=`<div class="hunt-random"><div><small>WANT TO REDISCOVER SOMETHING?</small><b>${pool.length} wishlisted ${pool.length===1?'game':'games'}</b></div><button id="randomWishlist">🎲 RANDOM WISHLIST GAME</button></div>`;
    results.before(box);
    box.querySelector('#randomWishlist').onclick=randomWishlistGame;
  }

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
      wishlistTools();
      return;
    }
    _renderForWishlist();
    decorateWishlistBadges();
  };

  window.SHELFCHECK_WISHLIST={version:2,isWishlisted,addWishlist,removeWishlist,toggleWishlist,wishlistedItems,decorateWishlistBadges,renderRandomWishlistToggle,randomWishlistGame,wishlistRandomPool,get lastWishlistRandomId(){return lastWishlistRandomId}};
})();
