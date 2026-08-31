// ShelfCheck v0.72 — sort the DATA before pagination, not the rendered 70 cards.
(()=>{
  let sortMode='AZ';
  const oldRender=render;
  const market=x=>{const p=priceFor(x);const v=p?.m??p?.x??x.max;return v==null||!Number.isFinite(Number(v))?null:Number(v)};
  const compare=(a,b)=>{
    if(sortMode==='AZ')return a.title.localeCompare(b.title);
    if(sortMode==='ZA')return b.title.localeCompare(a.title);
    const av=market(a),bv=market(b);
    if(av==null&&bv==null)return a.title.localeCompare(b.title);
    if(av==null)return 1;if(bv==null)return-1;
    const d=sortMode==='HIGH'?bv-av:av-bv;
    return d||a.title.localeCompare(b.title);
  };
  render=function(){
    window.SHELFCHECK_SORT=sortMode;
    if(sortMode==='AZ'){oldRender();return;}
    // app.js builds its result set from `items` and then slices to visibleLimit.
    // Temporarily present that function a sorted copy so LOW/HIGH/ZA work across
    // the entire matching census, including results beyond the first 70 cards.
    const original=items;
    try{items=[...items].sort(compare);oldRender();}
    finally{items=original;}
  };
  function install(){
    const nav=document.querySelector('nav');if(!nav||document.querySelector('#priceSort'))return;
    const sel=document.createElement('select');sel.id='priceSort';sel.setAttribute('aria-label','Sort games');
    sel.innerHTML='<option value="AZ">SORT: A–Z</option><option value="ZA">SORT: Z–A</option><option value="LOW">PRICE: LOW → HIGH</option><option value="HIGH">PRICE: HIGH → LOW</option>';
    sel.style.cssText='margin-left:auto;padding:10px 8px;border-radius:8px;background:#151a22;color:inherit;border:1px solid #303744;font-weight:700;max-width:190px';
    sel.onchange=()=>{sortMode=sel.value;window.SHELFCHECK_SORT=sortMode;visibleLimit=70;render()};nav.appendChild(sel);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();