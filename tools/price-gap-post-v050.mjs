import fs from 'fs';
const norm=s=>String(s??'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’'`]/g,'').replaceAll('&',' and ').match(/[a-z0-9]+/g)?.join(' ')||'';
const report=JSON.parse(fs.readFileSync('audit-out/price-gap.json','utf8'));
const titles=new Set();
for(const file of ['price-direct-v050.js','price-direct-v051.js']){
  const src=fs.readFileSync(file,'utf8');
  const block=src.split('const DIRECT=[')[1]?.split('];\n  let tries=')[0]||'';
  for(const m of block.matchAll(/^\s*\[['"](.+?)['"],\s*\d/igm))titles.add(norm(m[1]));
}
const before=report.rows.length;report.rows=report.rows.filter(r=>!titles.has(norm(r.title)));
report.missing=report.rows.length;report.priced=report.canonicalRuntimeLive-report.missing;report.productOrCompilation=report.rows.filter(r=>r.classification==='PRODUCT_OR_COMPILATION_PRICE').length;report.noSafeIdentityPrice=report.rows.filter(r=>r.classification==='NO_SAFE_IDENTITY_PRICE').length;report.directRecovery=before-report.missing;
fs.writeFileSync('audit-out/price-gap.json',JSON.stringify(report,null,2));fs.writeFileSync('audit-out/price-gap.txt',report.rows.map(x=>`${x.id}\t${x.classification}\t${x.title}\t${(x.coveredBy||[]).join(' | ')}`).join('\n')+'\n');
console.log(JSON.stringify({canonicalRuntimeLive:report.canonicalRuntimeLive,priced:report.priced,missing:report.missing,productOrCompilation:report.productOrCompilation,noSafeIdentityPrice:report.noSafeIdentityPrice,directRecovery:report.directRecovery},null,2));
