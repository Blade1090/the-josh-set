import fs from 'node:fs';
import zlib from 'node:zlib';
import vm from 'node:vm';

const norm=s=>String(s??'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’'`]/g,'').replaceAll('&',' and ').match(/[a-z0-9]+/g)?.join(' ')||'';
const b64=['data0.txt','data1.txt','data2.txt','data3a.txt','data3b.txt'].map(x=>fs.readFileSync(x,'utf8')).join('').trim();
const DATA=JSON.parse(zlib.gunzipSync(Buffer.from(b64,'base64')).toString('utf8'));
let items=DATA.i.map(r=>({id:r[0],title:r[1],set:r[2],baseline:r[3],strong:r[4],target:r[5],max:r[6],search:norm(r[1])}));
let byId=new Map(items.map(x=>[x.id,x]));
const aliasesById=new Map();for(const [a,id] of DATA.a||[]){if(!aliasesById.has(id))aliasesById.set(id,[]);aliasesById.get(id).push(a)}
const productMap=new Map(),reverseProducts=new Map();
const fakeEl={textContent:'',dataset:{},querySelectorAll:()=>[],querySelector:()=>null,addEventListener:()=>{},appendChild:()=>{},style:{}};
const document={querySelector:()=>fakeEl,querySelectorAll:()=>[],createElement:()=>({...fakeEl}),addEventListener:()=>{},readyState:'complete',head:{appendChild:()=>{}},body:{appendChild:()=>{}}};
const ctx={DATA,items,byId,norm,aliasesById,productMap,reverseProducts,window:{},console,document,ownedSet:new Set(),productSet:new Set(),stateCache:{owned:[],products:[],prices:[]},filter:'ALL',$:()=>fakeEl,progress:()=>{},resetBrowse:()=>{},saveState:s=>{ctx.stateCache=s},loadState:()=>ctx.stateCache,setTimeout,clearTimeout,setInterval,clearInterval,censusFinalized:false,censusQueue:{add:[],exclude:[]}};
ctx.registerCensusMutation=(phase,fn)=>{if(ctx.censusFinalized)throw new Error(`late census mutation ${phase}`);ctx.censusQueue[phase].push(fn)};
ctx.dataReady=Promise.resolve();vm.createContext(ctx);
const mutators=['census-cleanup.js','census-v034.js','census-collapse-v035.js','census-v035-final.js','census-v040-pricing-audit.js','census-v052-pricecharting-negative-space.js','census-v053-pricecharting-regional-sweep.js','census-v054-pricecharting-collection-gap.js','census-v055-pricecharting-ab-sweep.js','census-v056-pricecharting-cf-sweep.js','census-v057-pricecharting-gl-sweep.js','census-v058-pricecharting-mr-sweep.js','census-v059-pricecharting-sz-sweep.js','census-physical-omission-pass-v001.js','census-physical-omission-pass-v002.js','census-physical-omission-pass-v003.js','census-v060-integrity-scrub.js','census-integrity-pass-v001.js','census-integrity-pass-v002.js','ownership-reconcile-v071.js','ownership-reconcile-v072.js','curation-josh-set-pass-v001.js','curation-josh-set-pass-v002.js','curation-josh-set-pass-v003.js','curation-josh-set-pass-v004.js','curation-josh-set-pass-v005.js','curation-josh-set-pass-v006.js'];
for(const f of mutators){if(fs.existsSync(f))vm.runInContext(fs.readFileSync(f,'utf8'),ctx,{filename:f});}
for(const fn of ctx.censusQueue.add)fn();for(const fn of ctx.censusQueue.exclude)fn();ctx.censusQueue.add.length=0;ctx.censusQueue.exclude.length=0;
for(const t of ['God Eater Resurrection','Atelier Ayesha: The Alchemist of Dusk DX','Atelier Escha & Logy: Alchemists of the Dusk Sky DX','Atelier Shallie: Alchemists of the Dusk Sea DX','Occultic;Nine']){const x=ctx.items.find(v=>norm(v.title)===norm(t));if(x)x.set='EXCLUDED'}
const oldCat=ctx.byId.get(237)||ctx.items.find(v=>norm(v.title)===norm('Catlateral Damage'));if(oldCat)oldCat.set='EXCLUDED';
if(!ctx.byId.get(2787)){const cat={id:2787,title:'Catlateral Damage: Remeowstered',set:'INCLUDED',baseline:'NEEDED',strong:null,target:null,max:24.99,search:norm('Catlateral Damage: Remeowstered')};ctx.items.push(cat);ctx.byId.set(cat.id,cat)}
items=ctx.items;byId=ctx.byId;
function evalText(text,file,seed={}){const c={window:{...seed},console};vm.createContext(c);vm.runInContext(text,c,{filename:file});return c.window}
function evalFile(file,seed={}){return evalText(fs.readFileSync(file,'utf8'),file,seed)}
const manifest=evalFile('covers-manifest.js');
const afterOverrides=evalFile('cover-overrides.js',{SHELFCHECK_COVERS:manifest.SHELFCHECK_COVERS||{},SHELFCHECK_PRODUCT_COVERS:manifest.SHELFCHECK_PRODUCT_COVERS||{}});
let gameye={};
if(fs.existsSync('cover-gameye-retail.js')) gameye=evalFile('cover-gameye-retail.js').SHELFCHECK_GAMEYE_RETAIL||{};
else {const retailUrl='https://raw.githubusercontent.com/Blade1090/the-josh-set/e8d33ecbe32f8ad22ad8431a6c14491e91d6dabe/cover-gameye-retail.js';const res=await fetch(retailUrl);if(!res.ok)throw new Error(`Unable to fetch production GameEye retail layer: ${res.status}`);gameye=evalText(await res.text(),'cover-gameye-retail.remote.js').SHELFCHECK_GAMEYE_RETAIL||{}}
let launchbox={},launchboxTitles={};
if(fs.existsSync('cover-launchbox-retail.js')){const lb=evalFile('cover-launchbox-retail.js');launchbox=lb.SHELFCHECK_LAUNCHBOX_COVERS||{};launchboxTitles=lb.SHELFCHECK_LAUNCHBOX_TITLES||{}}
let pricecharting={};
if(fs.existsSync('cover-pricecharting-retail.js')) pricecharting=evalFile('cover-pricecharting-retail.js').SHELFCHECK_PRICECHARTING_COVERS||{};
let productInherit={};
if(fs.existsSync('cover-product-inherit.js')) productInherit=evalFile('cover-product-inherit.js').SHELFCHECK_PRODUCT_INHERIT_COVERS||{};
const titleMap=fs.existsSync('cover-title-overrides.js')?evalFile('cover-title-overrides.js').SHELFCHECK_TITLE_COVERS||{}:{};
const base=manifest.SHELFCHECK_COVERS||{},final=afterOverrides.SHELFCHECK_COVERS||base;
const rows=[];
for(const x of items.filter(v=>v.set==='INCLUDED').sort((a,b)=>a.title.localeCompare(b.title))){
  const key=norm(x.title);let source,url;
  if(launchbox[x.id]||launchboxTitles[key]){source='LAUNCHBOX_BOX_FRONT';url=launchbox[x.id]||launchboxTitles[key]}
  else if(pricecharting[key]){source='PRICECHARTING_BOX_FRONT';url=pricecharting[key]}
  else if(productInherit[key]){source='PRODUCT_BOX_FRONT';url=productInherit[key]}
  else if(titleMap[key]){source='CURATED_TITLE';url=titleMap[key]}
  else if(gameye[x.id]){source='GAMEYE';url=gameye[x.id]}
  else if(final[x.id]&&final[x.id]!==base[x.id]){source=/image\.api\.playstation\.com/.test(final[x.id])?'PS_STORE_OVERRIDE':'CURATED_ID';url=final[x.id]}
  else if(base[x.id]){source='LEGACY_IGDB';url=base[x.id]}
  else{source='MISSING';url=null}
  rows.push({id:x.id,title:x.title,source,url});
}
const counts=Object.fromEntries([...new Set(rows.map(r=>r.source))].sort().map(s=>[s,rows.filter(r=>r.source===s).length]));
const out={generatedAt:new Date().toISOString(),included:rows.length,counts,rows};
fs.mkdirSync('audit-out',{recursive:true});fs.writeFileSync('audit-out/cover-source-audit.json',JSON.stringify(out,null,2));
console.log(JSON.stringify({included:out.included,counts},null,2));