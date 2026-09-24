// ShelfCheck cover-art layer. Identity covers + generated collection-product covers.
(()=>{
  const titleCovers={
    "warui ousama to rippana yuusha":"https://shop.nippon1.jp/html/upload/save_image/06241139_60d3f06b6aed5.jpg",
    "kingdom hearts hd i 5 ii 5 remix":"https://cdn.awsli.com.br/2500x2500/138/138431/produto/19545804/d5c25058c1.jpg",
    "xiii remake":"https://i5.walmartimages.com/seo/XIII-Maximum-Games-PlayStation-4-Physical-Edition_09ac38f7-4bc1-4d35-aaee-fd8bc05ea01c.f946eda0af556a904899b0e6d900e983.jpeg",
    "grip combat racing":"https://myshopville.com/cdn/shop/products/gripcombatracingsonyplaystation4ps4videogamecasecover.jpg",
    "tales from the borderlands a telltale game series":"https://toyorgame.com.sg/cdn/shop/products/CoverPS4_8701fee5-b1b6-40d8-9955-22ef05776940.jpg?v=1653366523",
    "little dragons cafe":"https://i5.walmartimages.com/seo/Little-Dragons-Cafe-Playstation-4-PS4-Raise-your-very-own-Dragon-Run-your-own-cafe_5e492cc0-9fff-49e1-b1fc-a8728b7c0b7f.6bcab4de1f6728bb7edd47d89b7fffc0.jpeg",
    "another world":"https://images.static-bluray.com/products/29/5593_1_large.jpg",
    "oddworld abes oddysee new n tasty":"https://now.estarland.com/images/products/23/60023/PS4-Oddworld-New-and-Tasty-Limited-RUn-large-image.jpg",
    "shenmue i":"https://a.allegroimg.com/original/119330/e3958dea4b6f80ca15f1a2afcb98/SHENMUE-I-II-PS4-PS5-GRA-NA-PLYCIE-W-PUDELKU",
    "q u b e":"https://images.launchbox-app.com/74c337ed-3f9c-4b95-81ba-e10ec181755e.jpg",
    "below":"https://videogamesplus.ca/cdn/shop/products/VGP0016556_700x700.png?v=1668522862",
    "stranded sails explorers of the cursed islands":"https://img-va.myshopline.com/image/store/1692612216760/38b99324-a472-439a-844f-b5915343324d.jpg?h=1000&w=787",
    "malnazidos":"https://selecta-play.com/9458/malnazidos-ps4.jpg",
    "ufo robot grendizer":"https://www.estore.iq/web/image/product.template/16349/image_1024?unique=5a0acd5",
    ...(window.SHELFCHECK_TITLE_COVERS||{})
  };
  const coverFor=x=>titleCovers[norm(x.title)]||window.SHELFCHECK_GAMEYE_RETAIL?.[x.id]||window.SHELFCHECK_COVERS?.[x.id]||null;
  const productCover=p=>{if(!p)return null;const generated=window.SHELFCHECK_PRODUCT_COVERS?.[p.key];if(generated)return generated;const exact=items.find(x=>x.set==='INCLUDED'&&norm(x.title)===norm(p.title)&&coverFor(x));if(exact)return coverFor(exact);const ids=[...new Set(p.ids||[])],covered=ids.map(id=>byId.get(id)).filter(x=>x?.set==='INCLUDED'&&coverFor(x));return covered.length===1?coverFor(covered[0]):null};
  const fallbackHtml='<div class="cover-fallback">COVER<br>NEEDED</div>';
  const style=document.createElement('style');
  style.textContent=`.card{display:grid;grid-template-columns:76px minmax(0,1fr);gap:14px;align-items:center;min-height:112px}.card>.cover-shell{grid-row:1/span 2;width:76px;height:104px;border-radius:8px;overflow:hidden;background:linear-gradient(160deg,#283343,#151b25);border:1px solid #344154;box-shadow:0 4px 12px #0005;display:flex;align-items:center;justify-content:center}.card>.cover-shell img{width:100%;height:100%;object-fit:contain;display:block;background:#0c1118}.card>.cover-shell .cover-fallback{font-size:.54rem;font-weight:950;letter-spacing:.08em;color:#7790b1;text-align:center;padding:5px;line-height:1.3}.card>.top,.card>.sub{grid-column:2}.card>.sub{margin-top:-1px}.card.cover-owned>.cover-shell{box-shadow:0 0 0 1px #2d6344,0 4px 12px #0005}.detail-cover-shell{width:160px;height:228px;border-radius:10px;border:1px solid #344154;box-shadow:0 8px 24px #0007;margin:2px 0 18px;background:linear-gradient(160deg,#283343,#151b25);display:flex;align-items:center;justify-content:center;overflow:hidden}.detail-cover-shell.has-cover{cursor:zoom-in}.detail-cover-shell .detail-cover{width:100%;height:100%;object-fit:contain;display:block;background:#0c1118}.detail-cover-shell .cover-fallback{font-size:.62rem;font-weight:950;letter-spacing:.07em;color:#7790b1;text-align:center;padding:6px;line-height:1.3}.detail-cover-row{display:flex;align-items:flex-start;gap:18px;margin:4px 0 18px}.detail-cover-row .detail-cover-shell{margin:0;flex:0 0 auto}.detail-cover-info{min-width:0;flex:1}.cover-lightbox{position:fixed;inset:0;z-index:99999;background:#000e;display:flex;align-items:center;justify-content:center;padding:24px;cursor:zoom-out}.cover-lightbox[hidden]{display:none}.cover-lightbox img{display:block;max-width:min(92vw,760px);max-height:92vh;width:auto;height:auto;object-fit:contain;filter:drop-shadow(0 16px 36px #000)}.cover-lightbox button{position:fixed;right:max(18px,env(safe-area-inset-right));top:max(18px,env(safe-area-inset-top));width:44px;height:44px;border-radius:50%;font-size:28px;line-height:1;padding:0;background:#151a22e8;color:#fff;border:1px solid #ffffff35;cursor:pointer}@media(min-width:700px){.card{grid-template-columns:84px minmax(0,1fr);min-height:122px}.card>.cover-shell{width:84px;height:114px}.detail-cover-shell{width:184px;height:262px}}`;
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
  const repaint=()=>{document.querySelectorAll('#results .cover-shell').forEach(x=>x.remove());paint()};
  const oldRender=render;render=function(){const r=oldRender.apply(this,arguments);paint();if(typeof decoratePriceCards==='function')decoratePriceCards();return r};
  const oldDetail=detail;detail=function(id){const r=oldDetail.apply(this,arguments);const box=document.querySelector('#detail');if(!box||box.querySelector('.detail-cover-shell'))return r;const h=box.querySelector('h2');if(!h)return r;const x=byId.get(id),url=x&&coverFor(x);const shell=document.createElement('div');shell.className='detail-cover-shell';const fallback=()=>{shell.classList.remove('has-cover');shell.innerHTML=fallbackHtml};if(url){const img=document.createElement('img');img.className='detail-cover';img.src=url;img.alt=x.title+' cover';img.decoding='async';img.onerror=fallback;shell.classList.add('has-cover');shell.title='Tap to enlarge cover';shell.addEventListener('click',()=>openLightbox(url,x.title));shell.appendChild(img)}else fallback();h.insertAdjacentElement('afterend',shell);return r};
  window.SHELFCHECK_COVER_ART={version:95,paint,repaint,coverFor,productCover,openLightbox};

  const retailScript=document.createElement('script');
  retailScript.src=`cover-gameye-retail.js?v=${Date.now()}`;
  retailScript.onload=repaint;
  retailScript.onerror=()=>console.warn('ShelfCheck: generated GameEye retail cover layer unavailable; using curated/legacy covers.');
  document.head.appendChild(retailScript);

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',paint);else paint();
})();
