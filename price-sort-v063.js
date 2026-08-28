// ShelfCheck v0.67 — alphabetical + price sorting.
// model-fix owns the renderer; wrap it and sort the finished visible cards.
(()=>{
  let sortMode='AZ';
  const titleOf=card=>(card.querySelector('.top b')?.textContent||'').trim();
  const priceFromCard=card=>{const m=(card.textContent||'').match(/CIB\s*\$([\d,.]+)/i);return m?Number(m[1].replace(/,/g,'')):null};
  const oldRender=render;
  render=function(){
    const oldLimit=visibleLimit;
    // Alphabetical reverse must render the full filtered set first; otherwise we'd only reverse the A-page.
    if(sortMode==='ZA')visibleLimit=Math.max(visibleLimit,items.length+100);
    oldRender();
    visibleLimit=oldLimit;
    const root=document.querySelector('#results');if(!root||sortMode==='AZ')return;
    const cards=[...root.querySelectorAll(':scope > article.card')];
    const anchor=root.querySelector('#loadMore, p.muted');
    if(sortMode==='ZA')cards.sort((a,b)=>titleOf(b).localeCompare(titleOf(a),undefined,{sensitivity:'base',numeric:true}));
    else cards.sort((a,b)=>{const av=priceFromCard(a),bv=priceFromCard(b);if(av==null&&bv==null)return titleOf(a).localeCompare(titleOf(b));if(av==null)return 1;if(bv==null)return-1;return sortMode==='HIGH'?(bv-av):(av-bv)});
    for(const card of cards)root.insertBefore(card,anchor||null);
  };
  function install(){
    const nav=document.querySelector('nav');if(!nav||document.querySelector('#priceSort'))return;
    const sel=document.createElement('select');sel.id='priceSort';sel.setAttribute('aria-label','Sort games');
    sel.innerHTML='<option value="AZ">SORT: A–Z</option><option value="ZA">SORT: Z–A</option><option value="LOW">PRICE: LOW → HIGH</option><option value="HIGH">PRICE: HIGH → LOW</option>';
    sel.style.cssText='margin-left:auto;padding:10px 8px;border-radius:8px;background:#151a22;color:inherit;border:1px solid #303744;font-weight:700;max-width:190px';
    sel.onchange=()=>{sortMode=sel.value;visibleLimit=70;render()};nav.appendChild(sel);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();