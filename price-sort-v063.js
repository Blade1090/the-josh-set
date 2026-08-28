// ShelfCheck v0.66 — alphabetical + price sorting.
// Sort the source item array before the renderer slices visible results, so Z-A works across the full census.
(()=>{
  let sortMode='AZ';
  const baseOrder=new Map();
  const remember=()=>items.forEach((x,i)=>{if(!baseOrder.has(x.id))baseOrder.set(x.id,i)});
  const titleCmp=(a,b)=>a.title.localeCompare(b.title,undefined,{sensitivity:'base',numeric:true});
  const priceValue=x=>{
    const p=typeof priceFor==='function'?priceFor(x):null;
    const vals=[p?.m,p?.g,p?.s].map(Number).filter(v=>Number.isFinite(v)&&v>0);
    return vals.length?vals[0]:null;
  };
  const oldRender=render;
  render=function(){
    remember();
    if(sortMode==='ZA')items.sort((a,b)=>titleCmp(b,a));
    else if(sortMode==='AZ')items.sort((a,b)=>(baseOrder.get(a.id)??0)-(baseOrder.get(b.id)??0));
    else items.sort((a,b)=>{
      const av=priceValue(a),bv=priceValue(b);
      if(av==null&&bv==null)return titleCmp(a,b);
      if(av==null)return 1;if(bv==null)return-1;
      return sortMode==='HIGH'?(bv-av||titleCmp(a,b)):(av-bv||titleCmp(a,b));
    });
    oldRender();
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