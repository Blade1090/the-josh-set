// ShelfCheck cover-art layer. Identity covers + generated collection-product covers.
(()=>{
  const titleCovers={"warui ousama to rippana yuusha":"https://shop.nippon1.jp/html/upload/save_image/06241139_60d3f06b6aed5.jpg",...(window.SHELFCHECK_TITLE_COVERS||{})};
  const coverFor=x=>titleCovers[norm(x.title)]||window.SHELFCHECK_COVERS?.[x.id]||null;
  const productCover=p=>{if(!p)return null;const generated=window.SHELFCHECK_PRODUCT_COVERS?.[p.key];if(generated)return generated;const exact=items.find(x=>x.set==='INCLUDED'&&norm(x.title)===norm(p.title)&&coverFor(x));if(exact)return coverFor(exact);const ids=[...new Set(p.ids||[])],covered=ids.map(id=>byId.get(id)).filter(x=>x?.set==='INCLUDED'&&coverFor(x));return covered.length===1?coverFor(covered[0]):null};
  const fallbackHtml='<div class="cover-fallback">COVER<br>NEEDED</div>';
  const style=document.createElement('style');
  style.textContent=`.card{display:grid;grid-template-columns:66px minmax(0,1fr);gap:13px;align-items:center;min-height:102px}.card>.cover-shell{grid-row:1/span 2;width:66px;height:88px;border-radius:7px;overflow:hidden;background:linear-gradient(160deg,#283343,#151b25);border:1px solid #344154;box-shadow:0 4px 12px #0005;display:flex;align-items:center;justify-content:center}.card>.cover-shell img{width:100%;height:100%;object-fit:contain;display:block;background:#0c1118}.card>.cover-shell .cover-fallback{font-size:.52rem;font-weight:950;letter-spacing:.08em;color:#7790b1;text-align:center;padding:5px;line-height:1.3}.card>.top,.card>.sub{grid-column:2}.card>.sub{margin-top:-1px}.card.cover-owned>.cover-shell{box-shadow:0 0 0 1px #2d6344,0 4px 12px #0005}.detail-cover-shell{width:148px;height:210px;border-radius:10px;border:1px solid #344154;box-shadow:0 8px 24px #0007;margin:2px 0 18px;background:linear-gradient(160deg,#283343,#151b25);display:flex;align-items:center;justify-content:center;overflow:hidden}.detail-cover-shell.has-cover{cursor:zoom-in}.detail-cover-shell .detail-cover{width:100%;height:100%;object-fit:contain;display:block;background:#0c1118}.detail-cover-shell .cover-fallback{font-size:.62rem;font-weight:950;letter-spacing:.07em;color:#7790b1;text-align:center;padding:6px;line-height:1.3}.detail-cover-row{display:flex;align-items:flex-start;gap:18px;margin:4px 0 18px}.detail-cover-row .detail-cover-shell{margin:0;flex:0 0 auto}.detail-cover-info{min-width:0;flex:1}.cover-lightbox{position:fixed;inset:0;z-index:99999;background:#000e;display:flex;align-items:center;justify-content:center;padding:24px;cursor:zoom-out}.cover-lightbox[hidden]{display:none}.cover-lightbox img{display:block;max-width:min(92vw,760px);max-height:92vh;width:auto;height:auto;object-fit:contain;filter:drop-shadow(0 16px 36px #000)}.cover-lightbox button{position:fixed;right:max(18px,env(safe-area-inset-right));top:max(18px,env(safe-area-inset-top));width:44px;height:44px;border-radius:50%;font-size:28px;line-height:1;padding:0;background:#151a22e8;color:#fff;border:1px solid #ffffff35;cursor:pointer}@media(min-width:700px){.card{grid-template-columns:72px minmax(0,1fr);min-height:110px}.card>.cover-shell{width:72px;height:96px}.detail-cover-shell{width:172px;height:244px}}`;
  document.head.appendChild(style);

  const lightbox=document.createElement('div');
  lightbox.className='cover-lightbox';lightbox.hidden=true;lightbox.setAttribute('role','dialog');lightbox.setAttribute('aria-modal','true');lightbox.setAttribute('aria-label','Cover art preview');
  lightbox.innerHTML='<button type="button" aria-label="Close cover preview">×</button><img alt="">';document.body.appendChild(lightbox);
  const closeLightbox=()=>{lightbox.hidden=true;lightbox.querySelector('img').removeAttribute('src')};
  const openLightbox=(url,title)=>{if(!url)return;const img=lightbox.querySelector('img');img.src=url;img.alt=(title||'Game')+' cover';lightbox.hidden=false};
  lightbox.addEventListener('click',e=>{if(e.target===lightbox||e.target.tagName==='BUTTON')closeLightbox()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!lightbox.hidden)closeLightbox()});

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
      if(url){const img=document.createElement('img');img.loading='lazy';img.decoding='async';img.alt=(p?.title||x?.title||title)+' cover';img.src=url;img.onerror=()=>{shell.innerHTML=fallbackHtml};shell.appendChild(img)}else shell.innerHTML=fallbackHtml;
      card.prepend(shell);if((x&&effectiveStatus(x)==='OWNED')||(p&&productSet.has(p.key)))card.classList.add('cover-owned');
    });
  };
  const oldRender=render;render=function(){const r=oldRender.apply(this,arguments);paint();if(typeof decoratePriceCards==='function')decoratePriceCards();return r};
  // Keep a fixed-size shell even when a cover is missing/broken so Random Game controls and
  // dossier content never jump vertically. Missing art is deliberately labeled COVER NEEDED:
  // ShelfCheck should show an honest gap instead of pretending generic/key art is a retail cover.
  const oldDetail=detail;detail=function(id){const r=oldDetail.apply(this,arguments);const box=document.querySelector('#detail');if(!box||box.querySelector('.detail-cover-shell'))return r;const h=box.querySelector('h2');if(!h)return r;const x=byId.get(id),url=x&&coverFor(x);const shell=document.createElement('div');shell.className='detail-cover-shell';const fallback=()=>{shell.classList.remove('has-cover');shell.innerHTML=fallbackHtml};if(url){const img=document.createElement('img');img.className='detail-cover';img.src=url;img.alt=x.title+' cover';img.decoding='async';img.onerror=fallback;shell.classList.add('has-cover');shell.title='Tap to enlarge cover';shell.addEventListener('click',()=>openLightbox(url,x.title));shell.appendChild(img)}else fallback();h.insertAdjacentElement('afterend',shell);return r};
  window.SHELFCHECK_COVER_ART={version:89,paint,coverFor,productCover,openLightbox};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',paint);else paint();
})();
