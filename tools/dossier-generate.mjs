import fs from 'node:fs';

const key=process.env.OPENAI_API_KEY;
if(!key) throw new Error('OPENAI_API_KEY repository secret is required');
const model=process.env.OPENAI_MODEL||'gpt-5-mini';
const queue=JSON.parse(fs.readFileSync('audit-out/dossier-factory-queue.json','utf8'));
const out=[];
for(const batch of queue.batches||[]){
  const rows=[];
  for(const game of batch.games){
    const prompt=`Research the PS4 game titled "${game.title}" and return ONLY JSON with keys t,s,w,c,r,b,p. t must exactly equal the supplied title. s=quick summary; w=why it belongs in a physical PS4 collector census; c=real gameplay/technical caveats; r=concise curator take emphasizing movement, immediacy, creativity, charm, pacing and respect for time where relevant; b=physical/coverage note without inventing edition facts; p=short recommendation. Be game-specific, factual, no filler. Each of s,w,c,r,b must be at least 12 words. If a physical fact is uncertain, say it needs verification rather than inventing it.`;
    const res=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'content-type':'application/json','authorization':`Bearer ${key}`},body:JSON.stringify({model,input:prompt})});
    if(!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
    const data=await res.json();
    const text=(data.output||[]).flatMap(x=>x.content||[]).find(x=>x.type==='output_text')?.text;
    if(!text) throw new Error(`No output for ${game.title}`);
    const d=JSON.parse(text.replace(/^```json\s*|\s*```$/g,''));
    validate(d,game.title);
    rows.push(d);
    console.log(`Generated: ${game.title}`);
  }
  out.push({batch:batch.batch,rows});
}
fs.writeFileSync('audit-out/dossier-generated.json',JSON.stringify({model,batches:out},null,2));

// Mirrors dossiers.js GENERIC_DOSSIER_PATTERNS exactly, so generation-time rejection
// matches what the live ShelfCheck audit would flag as generic.
const GENERIC_DOSSIER_PATTERNS=[/strongest constitutional role/i,/still needs curator review/i,/dossier establishes what the game is/i,/identity is preserved separately/i,/keep this identity in the census/i,/physical path should remain explicit/i,/collector relevance comes from/i,/this entry matters because it represents/i,/treat this as a distinct playable identity/i,/worth keeping visible in the set/i,/contributes to an established series or franchise/i,/no major concern was obvious from the introductory source/i,/redundancy and shelf representation still need review/i];
// Mirrors dossiers.js BAD_SUMMARY_PATTERNS exactly.
const BAD_SUMMARY_PATTERNS=[/\bis an (english|american|japanese|canadian|australian|british) (actor|actress|singer|writer|politician|footballer|athlete|musician)\b/i,/\bbest known for (playing|portraying|his|her)\b/i,/\bis the (son|daughter|wife|husband) of\b/i,/\bborn \d{1,2} [a-z]+ \d{4}\b/i];

function norm(s){
  return String(s||'')
    .normalize('NFKD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase().replace(/[’'`]/g,'').replaceAll('&',' and ')
    .match(/[a-z0-9]+/g)?.join(' ')||'';
}
function titleTokens(title){return norm(title).split(/\s+/).filter(w=>w.length>2&&!['the','and','for','with','from','edition','complete','remastered','game'].includes(w))}
// Mirrors dossiers.js summaryLooksWrong: catches a bad-summary phrase, or a summary that
// shares no title tokens while reading like an unrelated person's biography/TV credit.
function summaryLooksWrong(s,title){
  if(!s)return false;
  if(BAD_SUMMARY_PATTERNS.some(rx=>rx.test(s)))return true;
  const toks=titleTokens(title);
  if(toks.length>=2&&!toks.some(t=>norm(s).includes(t))&&/\b(actor|actress|singer|politician|footballer|television|tv series)\b/i.test(s))return true;
  return false;
}

function validate(d,title){
  if(!d||d.t!==title) throw new Error(`Title mismatch for ${title}`);
  for(const k of ['s','w','c','r','b']){
    if(typeof d[k]!=='string'||d[k].trim().split(/\s+/).length<12) throw new Error(`Thin ${k} for ${title}`);
  }
  if(typeof d.p!=='string'||d.p.trim().split(/\s+/).filter(Boolean).length<2) throw new Error(`Missing/thin p for ${title}`);
  const all=[d.s,d.w,d.c,d.r,d.b,d.p].join(' ');
  if(GENERIC_DOSSIER_PATTERNS.some(rx=>rx.test(all))) throw new Error(`Generic dossier rejected: ${title}`);
  if(summaryLooksWrong(d.s,title)) throw new Error(`Bad/mismatched summary for ${title}`);
}
