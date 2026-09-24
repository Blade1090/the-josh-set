const file='art_front/46/71da47ec-71cd-4b9e-8e29-d500cdb20a3c.webp';
const candidates=[
  `https://www.gameye.app/${file}`,
  `https://gameye.app/${file}`,
  `https://cdn.gameye.app/${file}`,
  `https://images.gameye.app/${file}`,
  `https://img.gameye.app/${file}`,
  `https://api.gameye.app/${file}`,
  `https://www.gameye.app/api/${file}`,
  `https://www.gameye.app/images/${file}`,
  `https://www.gameye.app/image/${file}`,
  `https://www.gameye.app/static/${file}`,
  `https://gameye.app/static/${file}`
];

async function probe(url){
  try{
    const r=await fetch(url,{redirect:'follow',headers:{'User-Agent':'ShelfCheck-ArtDepartment/1.0','Accept':'image/*,*/*;q=0.8'}});
    const type=r.headers.get('content-type')||'';
    const len=r.headers.get('content-length')||'';
    const buf=await r.arrayBuffer();
    return {url,status:r.status,finalUrl:r.url,type,len,bytes:buf.byteLength,ok:r.ok&&type.startsWith('image/')};
  }catch(e){return{url,status:0,error:String(e),ok:false}}
}

const results=[];
for(const url of candidates){const x=await probe(url);results.push(x);console.log(JSON.stringify(x));}

// Also inspect the public web app for image-host hints.
const pages=['https://www.gameye.app/','https://gameye.app/'];
for(const page of pages){
  try{
    const r=await fetch(page,{headers:{'User-Agent':'ShelfCheck-ArtDepartment/1.0'}});
    const html=await r.text();
    console.log('PAGE',page,r.status,r.url,'bytes',html.length);
    const urls=[...html.matchAll(/https?:\/\/[^"'<>\s]+/g)].map(m=>m[0]).filter(u=>/gameye|cdn|image|asset/i.test(u));
    console.log('URL_HINTS',JSON.stringify([...new Set(urls)].slice(0,100)));
    const scripts=[...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map(m=>new URL(m[1],r.url).href);
    console.log('SCRIPTS',JSON.stringify(scripts.slice(0,40)));
    for(const src of scripts.slice(0,20)){
      try{
        const sr=await fetch(src,{headers:{'User-Agent':'ShelfCheck-ArtDepartment/1.0'}});const text=await sr.text();
        if(/art_front|imagecdn|cdn\.gameye|storage|amazonaws|cloudfront/i.test(text)){
          const snippets=[];for(const term of ['art_front','cloudfront','amazonaws','cdn.gameye','imagecdn']){let i=text.toLowerCase().indexOf(term);if(i>=0)snippets.push(text.slice(Math.max(0,i-300),i+500));}
          console.log('SCRIPT_HINT',src,JSON.stringify(snippets.slice(0,8)));
        }
      }catch{}
    }
  }catch(e){console.log('PAGE_ERR',page,String(e))}
}

const hit=results.find(x=>x.ok);
if(hit){console.log('GAMEYE_IMAGE_BASE_FOUND',hit.finalUrl.replace(file,''));process.exit(0)}
console.log('GAMEYE_IMAGE_BASE_NOT_FOUND');
