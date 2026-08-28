// ShelfCheck v0.62 — generated collection search cards are products, not identities.
// model-fix renders those cards without an identity onclick; route taps by product title.
(()=>{
  const results=document.querySelector('#results');
  if(!results)return;
  results.addEventListener('click',e=>{
    const card=e.target.closest('article.card');
    if(!card||card.hasAttribute('onclick'))return;
    const title=card.querySelector('.top b')?.textContent?.trim();
    if(!title||typeof findProduct!=='function'||typeof detailProduct!=='function')return;
    const p=findProduct(title);
    if(!p)return;
    e.preventDefault();
    e.stopPropagation();
    detailProduct(p.key);
  });
  console.info('ShelfCheck v0.62 collection click router active');
})();