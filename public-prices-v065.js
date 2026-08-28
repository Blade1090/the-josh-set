// ShelfCheck v0.65 — public price fallback independent of browser-local imports.
// price-online-v041 seeds stateCache.prices on fresh browsers. price-fix intentionally
// keeps the editable/imported profile in separate local storage, so read the shipped
// snapshot directly as a fallback instead of trying to copy it into local state.
(()=>{
  let tries=0,shipped=new Map(),last=0;
  const apply=()=>{
    tries++;
    if(typeof norm!=='function'||typeof priceFor!=='function'){
      if(tries<200)setTimeout(apply,100);return;
    }
    const rows=Array.isArray(stateCache?.prices)?stateCache.prices:[];
    if(rows.length&&rows.length!==last){
      last=rows.length;
      shipped=new Map();
      for(const p of rows)if(p?.t)shipped.set(norm(p.t),p);
    }
    if(!window.__SHELFCHECK_PUBLIC_PRICE_WRAPPED){
      window.__SHELFCHECK_PUBLIC_PRICE_WRAPPED=true;
      const localPriceFor=priceFor;
      priceFor=function(x){
        let p=localPriceFor(x);if(p)return p;
        p=shipped.get(norm(x.title));if(p)return p;
        for(const a of aliasesById.get(x.id)||[]){p=shipped.get(a);if(p)return p}
        return null;
      };
    }
    window.SHELFCHECK_PUBLIC_PRICES={shipped:shipped.size,local:priceMap?.size||0};
    if(shipped.size&&typeof resetBrowse==='function')resetBrowse();
    if(tries<200)setTimeout(apply,100);
  };
  apply();
})();
