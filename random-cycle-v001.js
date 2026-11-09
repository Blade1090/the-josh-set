// ShelfCheck Random Game no-repeat cycle (v001).
//
// "RANDOM GAME" / "ANOTHER RANDOM GAME" draw from a shuffled, no-repeat cycle over the currently
// eligible pool (NEEDED or OWNED, after the active search, price/length band and Josh Set
// exclusions). Every eligible game is shown once before any game repeats.
//
// The previous in-memory bag (fun-features-v103.js drawRandomId) threw the whole cycle away
// whenever the eligible pool changed at all -- a search edit, a band change, a Wishlist/Reject
// toggle, ownership or price state settling -- and on every page reload. Each reset reshuffled
// the full pool, so recently shown games came straight back. This cycle instead remembers what it
// has already shown: when eligibility changes it rebuilds from (new eligible pool - already shown),
// and repeats are only allowed once the current pool is exhausted (never the same game twice in a
// row). NEEDED and OWNED keep separate cycles. The shown set is a per-viewer convenience kept in
// localStorage (wrapped in try/catch, so private windows simply fall back to in-memory).
(()=>{
  const KEY='shelfcheck.randomCycle.v1';
  function shuffle(a,rnd){for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
  function create({storage=null,random=Math.random}={}){
    const modes={};
    let saved={};
    try{saved=JSON.parse(storage?.getItem(KEY)||'{}')||{}}catch{saved={}}
    const persist=()=>{
      if(!storage)return;
      try{const o={};for(const [m,c] of Object.entries(modes))o[m]={seen:[...c.seen],lastId:c.lastId};storage.setItem(KEY,JSON.stringify(o))}catch{}
    };
    function cycleFor(mode){
      if(!modes[mode]){const s=saved[mode]||{};modes[mode]={universe:null,remaining:[],seen:new Set(Array.isArray(s.seen)?s.seen:[]),lastId:s.lastId??null}}
      return modes[mode];
    }
    // ids: the eligible identity ids right now. Returns the id to show, or null for an empty pool.
    function draw(ids,mode='DEFAULT'){
      ids=[...new Set(ids)];
      if(!ids.length)return null;
      const c=cycleFor(mode),set=new Set(ids);
      const same=!!c.universe&&c.universe.size===set.size&&ids.every(id=>c.universe.has(id));
      if(!same){
        // Eligibility changed (or first draw): keep the memory of every game already shown, including
        // ones outside the new pool, so narrowing and then widening a filter cannot bring them back.
        c.universe=set;
        c.remaining=shuffle(ids.filter(id=>!c.seen.has(id)),random);
      }
      if(!c.remaining.length){
        // Current pool exhausted: start a new cycle for these games only, never repeating the game
        // just shown. Games outside the current pool keep their shown state.
        for(const id of ids)c.seen.delete(id);
        const sh=shuffle(ids.slice(),random),last=sh.length-1;
        if(last>0&&sh[last]===c.lastId){const j=Math.floor(random()*last);[sh[last],sh[j]]=[sh[j],sh[last]]}
        c.remaining=sh;
      }
      const id=c.remaining.pop();
      c.seen.add(id);c.lastId=id;persist();
      return id;
    }
    // Read-only look at the next id draw() would return for an unchanged pool (cover pre-warm).
    function peek(mode='DEFAULT'){const c=modes[mode];return c&&c.remaining.length?c.remaining[c.remaining.length-1]:null}
    return {draw,peek,state:m=>modes[m]};
  }
  const g=typeof window!=='undefined'?window:globalThis;
  let storage=null;
  try{storage=g.localStorage||null}catch{storage=null}
  g.SHELFCHECK_RANDOM_CYCLE={create,shared:create({storage})};
})();
