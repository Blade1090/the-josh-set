// ShelfCheck v0.63 — price sorting for store/collection browsing.
(()=>{
  let sortMode='AZ';
  const priceValue=x=>{
    const p=typeof priceFor==='function'?priceFor(x):null;
    const vals=[p?.m,p?.g,p?.s].map(Number).filter(v=>Number.isFinite(v)&&v>0);
    return vals.length?vals[0]:null;
  };
  const oldRender=render;
  render=function(){
    oldRender();
    const root=document.querySelector('#results');
    if(!root)return;
    const cards=[...root.querySelectorAll(':scope > article.card')];
    if(sortMode==='AZ')return;
    const priced=[],pending=[];
    for(const card of cards){
      const title=card.querySelector('.top b')?.textContent||'';
      const x=items.find(g=>g.title===title);
      const v=x?priceValue(x):null;
      (v==null?pending:priced).push({card,v,title});
    }
    priced.sort((a,b)=>sortMode==='HIGH'?(b.v-a.v||a.title.localeCompare(b.title)):(a.v-b.v||a.title.localeCompare(b.title)));
    pending.sort((a,b)=>a.title.localeCompare(b.title));
    const anchor=root.querySelector('#loadMore, p.muted');
    for(const o of [...priced,...pending])root.insertBefore(o.card,anchor||null);
  };
  function install(){
    const nav=document.querySelector('nav');if(!nav||document.querySelector('#priceSort'))return;
    const sel=document.createElement('select');sel.id='priceSort';sel.setAttribute('aria-label','Sort games');
    sel.innerHTML='<option value="AZ">SORT: A–Z</option><option value="LOW">PRICE: LOW → HIGH</option><option value="HIGH">PRICE: HIGH → LOW</option>';
    sel.style.cssText='margin-left:auto;padding:10px 8px;border-radius:8px;background:#151a22;color:inherit;border:1px solid #303744;font-weight:700;max-width:190px';
    sel.onchange=()=>{sortMode=sel.value;visibleLimit=70;render()};nav.appendChild(sel);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();