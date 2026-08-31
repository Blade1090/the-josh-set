// ShelfCheck cover-art layer. Identity covers + safe product-card cover reuse.
(()=>{
  const coverFor=x=>window.SHELFCHECK_COVERS?.[x.id]||null;
  const productCover=p=>{if(!p)return null;const exact=items.find(x=>x.set==='INCLUDED'&&norm(x.title)===norm(p.title)&&coverFor(x));if(exact)return coverFor(exact);const ids=[...new Set(p.ids||[])],covered=ids.map(id=>byId.get(id)).filter(x=>x?.set==='INCLUDED'&&coverFor(x));return covered.length===1?coverFor(covered[0]):null};
  const style=document.createElement('style');
  style.textContent=`.card{display:grid;grid-template-columns:58px minmax(0,1fr);gap:12px;align-items:center;min-height:92px}.card>.cover-shell{grid-row:1/span 2;width:58px;height:76px;border-radius:7px;overflow:hidden;background:linear-gradient(160deg,#283343,#151b25);border:1px solid #344154;box-shadow:0 4px 12px #0005;display:flex;align-items:center;justify-content:center}.card>.cover-shell img{width:100%;height:100%;object-fit:cover;display:block}.card>.cover-shell .cover-fallback{font-size:.54rem;font-weight:950;letter-spacing:.08em;color:#7790b1;text-align:center;padding:5px;line-height:1.25}.card>.top,.card>.sub{grid-column:2}.card>.sub{margin-top:-1px}.card.cover-owned>.cover-shell{box-shadow:0 0 0 1px #2d6344,0 4px 12px #0005}.detail-cover{width:132px;height:auto;max-height:188px;object-fit:cover;display:block;border-radius:10px;border:1px solid #344154;box-shadow:0 8px 24px #0007;margin:2px 0 18px}.detail-cover-row{display:flex;align-items:flex-start;gap:18px;margin:4px 0 18px}.detail-cover-row .detail-cover{margin:0;flex:0 0 auto}.detail-cover-info{min-width:0;flex:1}@media(min-width:700px){.card{grid-template-columns:64px minmax(0,1fr)}.card>.cover-shell{width:64px;height:84px}.detail-cover{width:155px;max-height:220px}}`;
  document.head.appendChild(style);
  const paint=()=>{
    document.querySelectorAll('#results article.card').forEach(card=>{
      if(card.querySelector('.cover-shell'))return;
      const title=card.querySelector('.top b')?.textContent||'';
      const x=items.find(g=>g.title===title)||items.find(g=>norm(g.title)===norm(title));
      const p=!x&&typeof findProduct==='function'?findProduct(title):null;
      const shell=document.createElement('div');shell.className='cover-shell';
      const url=x?coverFor(x):productCover(p);
      if(url){const img=document.createElement('img');img.loading='lazy';img.decoding='async';img.alt='';img.src=url;img.onerror=()=>{shell.innerHTML='<div class="cover-fallback">PS4<br>COVER</div>'};shell.appendChild(img)}else shell.innerHTML='<div class="cover-fallback">PS4<br>COVER</div>';
      card.prepend(shell);if((x&&effectiveStatus(x)==='OWNED')||(p&&productSet.has(p.key)))card.classList.add('cover-owned');
    });
  };
  const oldRender=render;render=function(){const r=oldRender.apply(this,arguments);paint();return r};
  const oldDetail=detail;detail=function(id){const r=oldDetail.apply(this,arguments);const x=byId.get(id),url=x&&coverFor(x),box=document.querySelector('#detail');if(!url||!box||box.querySelector('.detail-cover'))return r;const h=box.querySelector('h2');if(!h)return r;const img=document.createElement('img');img.className='detail-cover';img.src=url;img.alt=x.title+' cover';img.decoding='async';img.onerror=()=>img.remove();h.insertAdjacentElement('afterend',img);return r};
  window.SHELFCHECK_COVER_ART={version:82,paint,coverFor,productCover};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',paint);else paint();
})();
