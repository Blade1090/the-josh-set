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

function validate(d,title){
  if(!d||d.t!==title) throw new Error(`Title mismatch for ${title}`);
  for(const k of ['s','w','c','r','b']){
    if(typeof d[k]!=='string'||d[k].trim().split(/\s+/).length<12) throw new Error(`Thin ${k} for ${title}`);
  }
  const all=[d.s,d.w,d.c,d.r,d.b].join(' ');
  const generic=[/still needs curator review/i,/dossier establishes/i,/identity is preserved separately/i,/worth keeping visible in the set/i,/no major concern was obvious/i];
  if(generic.some(rx=>rx.test(all))) throw new Error(`Generic dossier rejected: ${title}`);
}
