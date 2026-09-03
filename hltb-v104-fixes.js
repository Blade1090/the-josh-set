// ShelfCheck v1.04 HLTB audit pass: new confirmed times for previously-unmatched titles.
// Conservative: only titles with an explicit HowLongToBeat-attributed figure were added.
// Uses the same merge convention as hltb-v034-fixes.js (only fills fields that are still null).
(()=>{const rows=[
["Uncharted 3: Drake's Deception Remastered",9,null,null,"WEB_OK"],
["Dragon Ball: Xenoverse 2",19.5,38,null,"WEB_OK"],
["Cuphead [Limited Edition]",10,null,22,"WEB_OK"]
];let tries=0,t=setInterval(()=>{if(typeof HLTB==='undefined'||typeof norm!=='function'||!hltbReady){if(++tries>200)clearInterval(t);return}clearInterval(t);let n=0;for(const [title,a,e,c,q] of rows){const k=norm(title),old=HLTB.get(k)||{},d={...old,t:title};if(old.a==null&&a!=null)d.a=a;if(old.e==null&&e!=null)d.e=e;if(old.c==null&&c!=null)d.c=c;if(q)d.q=q;HLTB.set(k,d);n++}console.info(`ShelfCheck HLTB v1.04 audit-pass fixes applied: ${n} records`);},50)})();
