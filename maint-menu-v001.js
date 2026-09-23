// ShelfCheck maintenance menu -- relocates GameEye/price import, backup, and restore behind
// a hamburger toggle so the main screen stays focused on browsing + Should I Buy This?.
// This is pure show/hide wiring: #csv, #priceBtn, #prices, #backup, #restoreBtn, #restore
// are the SAME elements app.js already wires up by id in init() -- moving them into
// #maintMenu in index.html does not touch their ids or event handlers, so nothing here
// re-implements import/backup/restore behavior.
(()=>{
  function install(){
    const btn=document.getElementById('menuBtn'),menu=document.getElementById('maintMenu');
    if(!btn||!menu)return;
    const isOpen=()=>!menu.hidden;
    const open=()=>{menu.hidden=false;btn.setAttribute('aria-expanded','true')};
    const close=()=>{menu.hidden=true;btn.setAttribute('aria-expanded','false')};
    btn.addEventListener('click',e=>{e.stopPropagation();isOpen()?close():open()});
    // Close once an action inside the menu is actually chosen (file-picker labels/buttons),
    // but not for a stray click on the menu's own background/padding.
    menu.addEventListener('click',e=>{if(e.target.closest('button,label'))close()});
    document.addEventListener('click',e=>{if(isOpen()&&!menu.contains(e.target)&&e.target!==btn)close()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&isOpen())close()});

    // Price maintenance is intentionally lazy-loaded from the maintenance menu layer rather
    // than adding another always-visible control to the main app. Its script waits for the
    // pricing pipeline before computing coverage, so loading it here is safe even though this
    // file appears early in index.html.
    if(!document.querySelector('script[data-shelfcheck-price-maintenance]')){
      const s=document.createElement('script');
      s.src='price-maintenance-v001.js?v=1';
      s.dataset.shelfcheckPriceMaintenance='1';
      document.body.appendChild(s);
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
