// ShelfCheck cover-art layer. Uses a generated, identity-keyed manifest and safe placeholders.
(()=>{
  const coverFor=x=>window.SHELFCHECK_COVERS?.[x.id]||null;
  const style=document.createElement('style');
  style.textContent=`.card{display:grid;grid-template-columns:58px minmax(0,1fr);gap:12px;align-items:center;min-height:92px}.card>.cover-shell{grid-row:1/span 2;width:58px;height:76px;border-radius:7px;overflow:hidden;background:linear-gradient(160deg,#283343,#151b25);border:1px solid #344154;box-shadow:0 4px 12px #0005;display:flex;align-items:center;justify-content:center}.card>.cover-shell img{width:100%;height:100%;object-fit:cover;display:block}.card>.cover-shell .cover-fallback{font-size:.54rem;font-weight:950;letter-spacing:.08em;color:#7790b1;text-align:center;padding:5px;line-height:1.25}.card>.top,.card>.sub{grid-column:2}.card>.sub{margin-top:-1px}.card.cover-owned>.cover-shell{box-shadow:0 0 0 1px #2d6344,0 4px 12px #0005}@media(min-width:700px){.card{grid-template-columns:64px minmax(0,1fr)}.card>.cover-shell{width:64px;height:84px}}`;
  document.head.appendChild(style);
  const paint=()=>{
    document.querySelectorAll('#results article.card').forEach(card=>{
      if(card.querySelector('.cover-shell'))return;
      const title=card.querySelector('.top b')?.textContent||'';
      const x=items.find(g=>g.title===title)||items.find(g=>norm(g.title)===norm(title));
      const shell=document.createElement('div');shell.className='cover-shell';
      const url=x&&coverFor(x);
      if(url){const img=document.createElement('img');img.loading='lazy';img.decoding='async';img.alt='';img.src=url;img.onerror=()=>{shell.innerHTML='<div class="cover-fallback">PS4<br>COVER</div>'};shell.appendChild(img)}else shell.innerHTML='<div class="cover-fallback">PS4<br>COVER</div>';
      card.prepend(shell);if(x&&effectiveStatus(x)==='OWNED')card.classList.add('cover-owned');
    });
  };
  const oldRender=render;render=function(){const r=oldRender.apply(this,arguments);paint();return r};
  window.SHELFCHECK_COVER_ART={version:80,paint,coverFor};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',paint);else paint();
})();
