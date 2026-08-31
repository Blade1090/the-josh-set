import fs from 'node:fs';import {execFileSync} from 'node:child_process';
const audit=JSON.parse(fs.readFileSync('new-price-audit.json','utf8'));
const first=JSON.parse(fs.readFileSync('new-game-prices-live.json','utf8'));
const existing=new Set(first.prices.map(x=>x[0]));
const rows=audit.missing.filter(r=>!existing.has(r.id));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const slug=s=>String(s).toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const consoleSlug=r=>r.region.startsWith('PAL')?'pal-playstation-4':r.region.startsWith('JP')?'jp-playstation-4':r.region.startsWith('Asian English')?'asian-english-playstation-4':'playstation-4';
function fetch(url){return execFileSync('curl',['-LfsS','--max-time','20','-A','Mozilla/5.0 ShelfCheckPriceAudit/2.0',url],{encoding:'utf8',maxBuffer:6e6});}
function price(html){let m=html.match(/Complete Price[\s\S]{0,3000}?\$([0-9,]+(?:\.[0-9]{2})?)/i);if(!m)m=html.match(/CIB Price[\s\S]{0,3000}?\$([0-9,]+(?:\.[0-9]{2})?)/i);if(!m)m=html.match(/Complete[\s\S]{0,1200}?\$([0-9,]+(?:\.[0-9]{2})?)/i);return m?Math.round(parseFloat(m[1].replace(/,/g,''))*100):null;}
function links(html){return [...html.matchAll(/href=["']([^"']*\/game\/[^"']+)["']/gi)].map(m=>m[1].replace(/&amp;/g,'&'));}
const out=[],pending=[];
for(let i=0;i<rows.length;i++){const r=rows[i];let found=null,why='NO_VERIFIED_CANDIDATE';const base='https://www.pricecharting.com';
 const candidates=[];const direct=`${base}/game/${consoleSlug(r)}/${slug(r.product)}`;candidates.push(direct);
 try{const q=encodeURIComponent(`${r.product} ${r.region}`);const sh=fetch(`${base}/search-products?type=prices&q=${q}`);for(const l of links(sh)){const u=l.startsWith('http')?l:base+l;if(!candidates.includes(u))candidates.push(u);if(candidates.length>=12)break;}}catch{}
 for(const u of candidates){try{const h=fetch(u);const idOk=new RegExp(`PriceCharting ID:\\s*(?:<[^>]+>\\s*)*${r.pcid}`).test(h)||h.includes(`>${r.pcid}<`)||h.includes(` ${r.pcid} `);if(!idOk)continue;const cents=price(h);if(cents!=null){found=[r.id,cents,r.pcid,r.region,r.product,u];break;}why='NO_CIB_PRICE';}catch{why='FETCH_FAILED';}await sleep(80);}
 if(found)out.push(found);else pending.push({...r,reason:why});if(i%20===0)console.error(`${i}/${rows.length} recovered=${out.length}`);await sleep(120);
}
fs.writeFileSync('new-game-prices-second-pass.json',JSON.stringify({requested:rows.length,recovered:out.length,pending:pending.length,prices:out,pendingRows:pending},null,2));
const js=`// ShelfCheck second-pass verified PriceCharting CIB prices.\n(()=>{const P=${JSON.stringify(out.map(([id,cents])=>[id,cents]))};for(const [id,cents] of P){const x=byId.get(id);if(x&&x.set==='INCLUDED'){x.max=cents/100;x.priceSource='PriceCharting verified CIB (second pass)';}}window.SHELFCHECK_NEW_GAME_PRICES_PASS2={priced:P.length,pending:${pending.length}};if(typeof render==='function')render();})();\n`;fs.writeFileSync('price-new-games-v074.js',js);console.log(JSON.stringify({requested:rows.length,recovered:out.length,pending:pending.length}));