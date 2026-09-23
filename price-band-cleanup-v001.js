// ShelfCheck UI cleanup — pricing campaign complete (2026-09-23).
// PRICE PENDING and NO RELIABLE DATA are now empty endgame states, so keep the
// useful acquisition-price bands visible without forcing a horizontal scroll on mobile.
(()=>{
  const style=document.createElement('style');
  style.textContent='.price-bands button[data-band="PENDING"],.price-bands button[data-band="NODATA"]{display:none!important}';
  document.head.appendChild(style);
})();
