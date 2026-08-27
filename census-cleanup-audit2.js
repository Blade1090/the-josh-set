// ShelfCheck final census audit — evidence-backed verdicts discovered after v42.
(()=>{
 const EXCLUDE=new Map([
  ['light tracer','PSVR required for the PS4 release; PlayStation Store confirms VR/Camera required to experience the game.']
 ]);
 const KEEP=new Map([
  ['here they lie','Originally PSVR-focused, but Sony added standard non-VR PS4/PS4 Pro play in the February 2017 update; keep as playable without headset after update.'],
  ['last labyrinth','Originally PSVR-required, but the official March 2023 Lucidity Lost update added PS4 monitor mode playable without a VR headset; keep with patch-dependency warning.']
 ]);
 let tries=0;
 const apply=()=>{
  tries++;
  if(typeof norm!=='function'||!Array.isArray(items)||!items.length||!DATA){if(tries<100)setTimeout(apply,100);return;}
  const changed=[],kept=[];
  for(const x of items){const key=norm(x.title),reason=EXCLUDE.get(key),keep=KEEP.get(key);if(reason&&x.set==='INCLUDED'){x.set='EXCLUDED';x.cleanupReason=reason;changed.push(x.title);}else if(keep&&x.set==='INCLUDED'){x.cleanupReviewed=true;x.cleanupReason=keep;kept.push(x.title);}}
  DATA.n=items.filter(x=>x.set==='INCLUDED').length;
  if(typeof progress==='function')progress();if(typeof resetBrowse==='function')resetBrowse();
  console.log(`ShelfCheck audit2: ${changed.length} newly excluded; ${kept.length} reviewed/kept; denominator ${DATA.n}`,{excluded:changed,kept});
 };
 apply();
})();