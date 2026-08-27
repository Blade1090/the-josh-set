// Make physical collection recommendation cards open like normal game cards.
// model-fix renders these separately because they are products, not game identities.
function productDetailByTitle(title){
  const p=findProduct(title);if(!p)return;
  const covered=[...new Set(p.ids)].map(id=>byId.get(id)).filter(g=>g?.set==='INCLUDED');
  const owned=productSet.has(p.key);
  $('#detail').innerHTML=`<h2>${esc(p.title)}</h2><span class="badge ${owned?'OWNED':'NEEDED'}">${owned?'OWNED · COLLECTION':'BEST WAY TO BUY'}</span><p>${owned?'This physical collection is on your shelf and covers the games below.':'Buying this physical collection satisfies the games below. The box itself is not an extra identity.'}</p><h3>Covers ${covered.length} game identities</h3><ul class="products">${covered.map(g=>`<li><b>${esc(g.title)}</b> · <span class="badge ${status(g)}">${status(g)}</span></li>`).join('')}</ul>`;
  dlg.showModal();
}
function wireProductCards(){
  document.querySelectorAll('#results article.card:not([onclick])').forEach(card=>{
    const title=card.querySelector('.top b')?.textContent?.trim();if(!title||!findProduct(title))return;
    card.style.cursor='pointer';card.tabIndex=0;card.setAttribute('role','button');
    const open=()=>productDetailByTitle(title);card.onclick=open;card.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}};
  });
}
const renderWithProductClicks=render;
render=function(){renderWithProductClicks();wireProductCards()};
