#!/usr/bin/env python3
import json, os, re, tempfile, unicodedata, urllib.request, zipfile
import xml.etree.ElementTree as ET
from collections import defaultdict, Counter
RUNTIME='audit-out/cover-runtime-qa.json'; OUT_JS='cover-launchbox-retail.js'; OUT_JSON='audit-out/launchbox-cover-recovery.json'; META_URL='https://gamesdb.launchbox-app.com/Metadata.zip'; IMAGE_BASE='https://gamesdb.launchbox-app.com/games/images/'; PS4_NAMES={'sony playstation 4','sony playstation4','playstation 4'}
def norm(s):
 s=unicodedata.normalize('NFKD',str(s or '')); s=''.join(c for c in s if not unicodedata.combining(c)).lower(); s=s.replace('&',' and ').replace('’','').replace("'",'').replace('`',''); return ' '.join(re.findall(r'[a-z0-9]+',s))
def soft(s):
 n=norm(s); n=re.sub(r'\b(the|a|an|edition|remastered|collection|complete|game|games|series|playstation|ps4|trilogy|bundle|special|limited|deluxe|definitive)\b',' ',n); return re.sub(r'\s+',' ',n).strip()
def child_text(el,name):
 for c in el:
  if c.tag.rsplit('}',1)[-1].lower()==name.lower(): return c.text or ''
 return ''
def download_metadata(dest):
 req=urllib.request.Request(META_URL,headers={'User-Agent':'ShelfCheck-ArtDepartment/2.3'}); r=urllib.request.urlopen(req,timeout=180)
 with r, open(dest,'wb') as f:
  while True:
   chunk=r.read(1024*1024)
   if not chunk: break
   f.write(chunk)
def region_rank(region):
 r=norm(region)
 return 0 if r=='north america' else 1 if r=='world' else 2 if not r else 3 if r=='europe' else 4 if r in {'united kingdom','uk'} else 5 if r in {'australia','oceania'} else 6
def main():
 runtime=json.load(open(RUNTIME,encoding='utf-8')); targets=[]; seen=set()
 for bucket in ('review','watch','fallback'):
  for row in runtime.get(bucket,[]):
   title=row.get('title'); k=norm(title)
   if not title or not k or k in seen: continue
   seen.add(k); targets.append({'id':row.get('id'),'title':title,'bucket':bucket,'reason':row.get('reason')})
 print('Targets:',len(targets))
 with tempfile.TemporaryDirectory() as td:
  zpath=os.path.join(td,'Metadata.zip'); download_metadata(zpath)
  with zipfile.ZipFile(zpath) as z:
   xml_name=next(n for n in z.namelist() if n.lower().endswith('metadata.xml')); xml_path=os.path.join(td,'Metadata.xml')
   with z.open(xml_name) as src, open(xml_path,'wb') as dst:
    while True:
     chunk=src.read(1024*1024)
     if not chunk: break
     dst.write(chunk)
  games={}; exact=defaultdict(set); soft_idx=defaultdict(set)
  for _,el in ET.iterparse(xml_path,events=('end',)):
   if el.tag.rsplit('}',1)[-1].lower()!='game': continue
   if norm(child_text(el,'Platform')) not in PS4_NAMES: el.clear(); continue
   try: dbid=int(child_text(el,'DatabaseID'))
   except: el.clear(); continue
   name=(child_text(el,'Name') or child_text(el,'Title')).strip()
   if name:
    games[dbid]={'name':name,'images':[]}; exact[norm(name)].add(dbid)
    if soft(name): soft_idx[soft(name)].add(dbid)
   el.clear()
  ps4_ids=set(games); print('PS4 games indexed:',len(games))
  ps4_types=Counter(); image_records=0; image_ps4=0; ps4_fronts=0
  for _,el in ET.iterparse(xml_path,events=('end',)):
   low=el.tag.rsplit('}',1)[-1].lower()
   if low in {'gamealternatename','alternate_name','alternatename'}:
    try: dbid=int(child_text(el,'DatabaseID'))
    except: dbid=-1
    if dbid in games:
     name=(child_text(el,'AlternateName') or child_text(el,'Name') or child_text(el,'Title')).strip()
     if name:
      exact[norm(name)].add(dbid)
      if soft(name): soft_idx[soft(name)].add(dbid)
    el.clear()
   elif low in {'gameimage','image'}:
    image_records+=1; typ=(child_text(el,'Type') or child_text(el,'ImageType')).strip()
    try: dbid=int(child_text(el,'DatabaseID'))
    except: dbid=-1
    if dbid in ps4_ids:
     image_ps4+=1; ps4_types[typ]+=1
     if norm(typ) in {'box front','boxfront'}:
      fn=(child_text(el,'FileName') or child_text(el,'Filename') or child_text(el,'URL')).strip()
      if fn:
       ps4_fronts+=1; url=fn if fn.startswith(('http://','https://')) else IMAGE_BASE+fn; games[dbid]['images'].append({'file':fn.rsplit('/',1)[-1],'url':url,'region':child_text(el,'Region').strip()})
    el.clear()
 print('PS4 image records:',image_ps4,'PS4 Box - Front records:',ps4_fronts,'PS4 image types:',ps4_types.most_common(15))
 covers={}; title_covers={}; recovered=[]; no_match=[]; ambiguous=[]; no_front=[]
 for t in targets:
  n=norm(t['title']); s=soft(t['title']); ids=set(exact.get(n,())); method='exact'
  if len(ids)!=1: ids=set(soft_idx.get(s,())) if s else set(); method='unique_soft_alias'
  if len(ids)!=1:
   (ambiguous if ids else no_match).append({**t,'candidateDatabaseIds':sorted(ids)[:10]}); continue
  dbid=next(iter(ids)); g=games[dbid]
  if not g['images']:
   no_front.append({**t,'launchboxDatabaseId':dbid,'launchboxName':g['name']}); continue
  best=sorted(g['images'],key=lambda x:(region_rank(x['region']),x['file']))[0]; url=best['url']; title_covers[n]=url
  if t.get('id') is not None: covers[str(t['id'])]=url
  recovered.append({**t,'launchboxDatabaseId':dbid,'launchboxName':g['name'],'matchMethod':method,'region':best['region'] or None,'fileName':best['file'],'url':url,'frontCandidateCount':len(g['images'])})
 summary={'targeted':len(targets),'recovered':len(recovered),'unresolvedNoMatch':len(no_match),'ambiguous':len(ambiguous),'matchedButNoBoxFront':len(no_front),'regionCounts':{},'metadataDiagnostics':{'gameImageRecords':image_records,'gameImagePs4Intersections':image_ps4,'ps4BoxFrontRecords':ps4_fronts,'topPs4ImageTypes':ps4_types.most_common(15)},'source':'LaunchBox Games Database Metadata.zip / Box - Front only'}
 for r in recovered:
  rg=r.get('region') or 'Unspecified'; summary['regionCounts'][rg]=summary['regionCounts'].get(rg,0)+1
 os.makedirs(os.path.dirname(OUT_JSON),exist_ok=True); json.dump({'summary':summary,'recovered':recovered,'unresolved':no_match,'ambiguous':ambiguous,'noFront':no_front},open(OUT_JSON,'w',encoding='utf-8'),indent=2,ensure_ascii=False)
 with open(OUT_JS,'w',encoding='utf-8') as f:
  f.write('// Generated by tools/launchbox-cover-recovery.py. LaunchBox Box - Front only.\n'); f.write('window.SHELFCHECK_LAUNCHBOX_COVERS='+json.dumps(covers,separators=(',',':'))+';\n'); f.write('window.SHELFCHECK_LAUNCHBOX_TITLES='+json.dumps(title_covers,separators=(',',':'))+';\n'); f.write('window.SHELFCHECK_LAUNCHBOX_META='+json.dumps(summary,separators=(',',':'))+';\n'); f.write("if(typeof document!=='undefined'){(()=>{let n=0;const apply=()=>{n++;window.SHELFCHECK_TITLE_COVERS={...(window.SHELFCHECK_TITLE_COVERS||{}),...(window.SHELFCHECK_LAUNCHBOX_TITLES||{})};if(window.SHELFCHECK_COVER_ART?.repaint)window.SHELFCHECK_COVER_ART.repaint();else if(n<80)setTimeout(apply,100)};if(document.readyState==='complete')apply();else window.addEventListener('load',apply,{once:true})})()}\n")
 print(json.dumps(summary,indent=2))
if __name__=='__main__': main()
