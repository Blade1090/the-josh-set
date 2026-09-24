// ShelfCheck Art Department runtime quality gate.
// Known REVIEW art is deliberately hidden; FALLBACK art remains visible until a cleaner shelf front is found.
(()=>{
  const norm=s=>String(s??'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’'`]/g,'').replaceAll('&',' and ').match(/[a-z0-9]+/g)?.join(' ')||'';
  const state={ready:false,bad:new Map(),fallback:new Map(),fixed:new Set(),eligibility:new Map()};
  const fallbackMarkup=label=>`<div class="cover-fallback">${label}</div>`;

  function qualityForTitle(title){
    const k=norm(title);
    if(state.eligibility.has(k))return {quality:'REVIEW',physical:'VERIFY',label:'PHYSICAL<br>CHECK',reason:state.eligibility.get(k)};
    if(state.bad.has(k))return {quality:'REVIEW',physical:'UNKNOWN',label:'COVER<br>NEEDED',reason:state.bad.get(k)};
    if(state.fallback.has(k))return {quality:'FALLBACK',physical:'CONFIRMED',label:null,reason:state.fallback.get(k)};
    if(state.fixed.has(k))return {quality:'GOOD',physical:'CONFIRMED',label:null,reason:null};
    return {quality:'UNREVIEWED',physical:'UNKNOWN',label:null,reason:null};
  }

  function applyShell(shell,title,detail=false){
    if(!shell||!state.ready)return;
    const q=qualityForTitle(title);
    const token=`${q.quality}:${q.physical}`;
    if(shell.dataset.coverQuality===token)return;
    shell.dataset.coverQuality=token;
    shell.dataset.physicalSanity=q.physical;
    if(q.reason)shell.dataset.coverReason=q.reason;else delete shell.dataset.coverReason;

    if(q.quality==='REVIEW'){
      shell.classList.remove('has-cover');
      shell.innerHTML=fallbackMarkup(q.label||'COVER<br>NEEDED');
      shell.title=q.physical==='VERIFY'?'Physical release needs verification':'Cover art needs replacement';
      if(detail)shell.style.pointerEvents='none';
      return;
    }
    if(q.quality==='FALLBACK'){
      shell.title='ShelfCheck fallback art — cleaner straight-on physical front wanted';
      shell.dataset.coverFallback='true';
      return;
    }
    delete shell.dataset.coverFallback;
  }

  function apply(){
    if(!state.ready)return;
    document.querySelectorAll('#results article.card').forEach(card=>{
      const title=card.querySelector('.top b')?.textContent||'';
      applyShell(card.querySelector('.cover-shell'),title,false);
    });
    const box=document.querySelector('#detail');
    const title=box?.querySelector('h2')?.textContent||'';
    if(title)applyShell(box.querySelector('.detail-cover-shell'),title,true);
  }

  function ingest(data){
    state.bad=new Map((data.confirmed_bad||[]).map(x=>[norm(x.title),x.reason||'manual review']));
    state.fallback=new Map((data.fallback||[]).map(x=>[norm(x.title),x.reason||'fallback cover']));
    state.fixed=new Set((data.fixed||[]).map(x=>norm(x.title)));
    state.eligibility=new Map((data.eligibility||[]).map(x=>[norm(x.title),x.reason||'physical release unverified']));
    state.ready=true;
    apply();
  }

  fetch('audit-out/cover-manual-qa.json?v=4',{cache:'no-store'})
    .then(r=>{if(!r.ok)throw new Error(`QA ${r.status}`);return r.json()})
    .then(ingest)
    .catch(e=>console.warn('ShelfCheck: cover quality gate unavailable.',e));

  const observer=new MutationObserver(()=>requestAnimationFrame(apply));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>observer.observe(document.body,{childList:true,subtree:true}));
  else observer.observe(document.body,{childList:true,subtree:true});

  window.SHELFCHECK_COVER_POLICY={version:1,state,qualityForTitle,apply};
})();
