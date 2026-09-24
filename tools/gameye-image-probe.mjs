// Art Department one-shot probe: verify GameEye's public item-image host.
const file='art_front/46/71da47ec-71cd-4b9e-8e29-d500cdb20a3c.webp';
const candidates=[
  `https://dt.gameye.app/data/streaming/images/items/v1/${file}`,
  `https://dt.gameye.app/data/streaming/images/items_moderated/v1/${file}`,
  `https://dt.gameye.app/data/streaming/images/items/v1/46/71da47ec-71cd-4b9e-8e29-d500cdb20a3c.webp`,
  `https://dt.gameye.app/data/streaming/images/items/v1/71da47ec-71cd-4b9e-8e29-d500cdb20a3c.webp`
];
async function probe(url){try{const r=await fetch(url,{redirect:'follow',headers:{'User-Agent':'ShelfCheck-ArtDepartment/1.0','Accept':'image/*,*/*;q=0.8'}});const type=r.headers.get('content-type')||'',len=r.headers.get('content-length')||'',buf=await r.arrayBuffer();return{url,status:r.status,finalUrl:r.url,type,len,bytes:buf.byteLength,ok:r.ok&&type.startsWith('image/')}}catch(e){return{url,status:0,error:String(e),ok:false}}}
const results=[];for(const url of candidates){const x=await probe(url);results.push(x);console.log(JSON.stringify(x));}
const hit=results.find(x=>x.ok);if(hit){console.log('GAMEYE_IMAGE_BASE_FOUND',hit.finalUrl.replace(file,''));process.exit(0)}console.log('GAMEYE_IMAGE_BASE_NOT_FOUND');
