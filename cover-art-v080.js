// ShelfCheck cover-art layer. Identity covers + generated collection-product covers.
(()=>{
  const coverFor=x=>window.SHELFCHECK_COVERS?.[x.id]||null;
  const productCover=p=>{if(!p)return null;const generated=window.SHELFCHECK_PRODUCT_COVERS?.[p.key];if(generated)return generated;const exact=items.find(x=>x.set==='INCLUDED'&&norm(x.title)===norm(p.title)&&coverFor(x));if(exact)return coverFor(exact);const ids=[...new Set(p.ids||[])],covered=ids.map(id=>byId.get(id)).filter(x=>x?.set==='INCLUDED'&&coverFor(x));return covered.length===1?coverFor(covered[0]):null};
  const style=document.createElement('style');
  style.textContent=`.card{display:grid;grid-template-columns:58px minmax(0,1fr);gap:12px;align-items:center;min-height:92px}.card>.cover-shell{grid-row:1/span 2;width:58px;height:76px;border-radius:7px;overflow:hidden;background:linear-gradient(160deg,#283343,#151b25);border:1px solid #344154;box-shadow:0 4px 12px #0005;display:flex;align-items:center;justify-content:center}.card>.cover-shell img{width:100%;height:100%;object-fit:cover;display:block}.card>.cover-shell .cover-fallback{font-size:.54rem;font-weight:950;letter-spacing:.08em;color:#7790b1;text-align:center;padding:5px;line-height:1.25}.card>.top,.card>.sub{grid-column:2}.card>.sub{margin-top:-1px}.card.cover-owned>.cover-shell{box-shadow:0 0 0 1px #2d6344,0 4px 12px #0005}.detail-cover-shell{width:132px;height:188px;border-radius:10px;border:1px solid #344154;box-shadow:0 8px 24px #0007;margin:2px 0 18px;background:linear-gradient(160deg,#283343,#151b25);display:flex;align-items:center;justify-content:center;overflow:hidden}.detail-cover-shell .detail-cover{width:100%;height:100%;object-fit:contain;display:block}.detail-cover-shell .cover-fallback{font-size:.62rem;font-weight:950;letter-spacing:.07em;color:#7790b1;text-align:center;padding:6px;line-height:1.3}.detail-cover-row{display:flex;align-items:flex-start;gap:18px;margin:4px 0 18px}.detail-cover-row .detail-cover-shell{margin:0;flex:0 0 auto}.detail-cover-info{min-width:0;flex:1}@media(min-width:700px){.card{grid-template-columns:64px minmax(0,1fr)}.card>.cover-shell{width:64px;height:84px}.detail-cover-shell{width:155px;height:220px}}`;
  document.head.appendChild(style);
  const paint=()=>{
    document.querySelectorAll('#results article.card').forEach(card=>{
      if(card.querySelector('.cover-shell'))return;
      const title=card.querySelector('.top b')?.textContent||'';
      const badge=card.querySelector('.badge')?.textContent||'';
      const isProduct=/COLLECTION|BEST WAY TO BUY/.test(badge);
      const p=isProduct&&typeof findProduct==='function'?findProduct(title):null;
      const x=!isProduct?(items.find(g=>g.title===title)||items.find(g=>norm(g.title)===norm(title))):null;
      const shell=document.createElement('div');shell.className='cover-shell';
      const url=p?productCover(p):(x?coverFor(x):null);
      if(url){const img=document.createElement('img');img.loading='lazy';img.decoding='async';img.alt='';img.src=url;img.onerror=()=>{shell.innerHTML='<div class="cover-fallback">PS4<br>COVER</div>'};shell.appendChild(img)}else shell.innerHTML='<div class="cover-fallback">PS4<br>COVER</div>';
      card.prepend(shell);if((x&&effectiveStatus(x)==='OWNED')||(p&&productSet.has(p.key)))card.classList.add('cover-owned');
    });
  };
  const oldRender=render;render=function(){const r=oldRender.apply(this,arguments);paint();if(typeof decoratePriceCards==='function')decoratePriceCards();return r};
  // Random Game's "ANOTHER RANDOM GAME"/Wishlist controls sit right below this cover in the DOM
  // (fun-features-v103.js anchors them off #v, further down), so the cover box must always
  // occupy the same reserved space -- a missing cover or a broken image URL used to remove the
  // element entirely (img.onerror=()=>img.remove()), collapsing that space and shifting the
  // controls up. Now a fixed-size shell is always inserted, with a text fallback taking the
  // image's place on missing/broken covers instead of removing the shell, mirroring the same
  // shell+fallback pattern paint() and buyCoverHtml() already use for card/buy-tool thumbnails.
  const oldDetail=detail;detail=function(id){const r=oldDetail.apply(this,arguments);const box=document.querySelector('#detail');if(!box||box.querySelector('.detail-cover-shell'))return r;const h=box.querySelector('h2');if(!h)return r;const x=byId.get(id),url=x&&coverFor(x);const shell=document.createElement('div');shell.className='detail-cover-shell';const fallback=()=>{shell.innerHTML='<div class="cover-fallback">PS4<br>COVER</div>'};if(url){const img=document.createElement('img');img.className='detail-cover';img.src=url;img.alt=x.title+' cover';img.decoding='async';img.onerror=fallback;shell.appendChild(img)}else fallback();h.insertAdjacentElement('afterend',shell);return r};
  window.SHELFCHECK_COVER_ART={version:86,paint,coverFor,productCover};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',paint);else paint();
})();
