#!/usr/bin/env python3
import json
import os
import re
import tempfile
import unicodedata
import urllib.request
import zipfile
import xml.etree.ElementTree as ET
from collections import defaultdict, Counter

RUNTIME='audit-out/cover-runtime-qa.json'
OUT_JS='cover-launchbox-retail.js'
OUT_JSON='audit-out/launchbox-cover-recovery.json'
META_URL='https://gamesdb.launchbox-app.com/Metadata.zip'
IMAGE_BASE='https://gamesdb.launchbox-app.com/games/images/'
PS4_NAMES={'sony playstation 4','sony playstation4','playstation 4'}


def norm(s):
    s=unicodedata.normalize('NFKD',str(s or ''))
    s=''.join(c for c in s if not unicodedata.combining(c)).lower()
    s=s.replace('&',' and ').replace('’','').replace("'",'').replace('`','')
    return ' '.join(re.findall(r'[a-z0-9]+',s))


def soft(s):
    n=norm(s)
    n=re.sub(r'\b(the|a|an|edition|remastered|collection|complete|game|games|series|playstation|ps4|trilogy|bundle|special|limited|deluxe|definitive)\b',' ',n)
    return re.sub(r'\s+',' ',n).strip()


def child_text(el,name):
    for c in el:
        if c.tag.rsplit('}',1)[-1].lower()==name.lower():
            return c.text or ''
    return ''


def download_metadata(dest):
    req=urllib.request.Request(META_URL,headers={'User-Agent':'ShelfCheck-ArtDepartment/2.2'})
    with urllib.request.urlopen(req,timeout=180) as r, open(dest,'wb') as f:
        while True:
            chunk=r.read(1024*1024)
            if not chunk: break
            f.write(chunk)


def region_rank(region):
    r=norm(region)
    if r=='north america': return 0
    if r=='world': return 1
    if not r: return 2
    if r=='europe': return 3
    if r in {'united kingdom','uk'}: return 4
    if r in {'australia','oceania'}: return 5
    return 6


def record_dict(el):
    return {c.tag.rsplit('}',1)[-1]:(c.text or '') for c in el}


def main():
    with open(RUNTIME,'r',encoding='utf-8') as f:
        runtime=json.load(f)
    targets=[]; seen=set()
    for bucket in ('review','watch','fallback'):
        for row in runtime.get(bucket,[]):
            title=row.get('title')
            if not title: continue
            k=(row.get('id'),norm(title))
            if k in seen: continue
            seen.add(k)
            targets.append({'id':row.get('id'),'title':title,'bucket':bucket,'reason':row.get('reason')})
    print(f'Targets: {len(targets)}')

    with tempfile.TemporaryDirectory() as td:
        zpath=os.path.join(td,'Metadata.zip')
        print('Downloading LaunchBox Metadata.zip...')
        download_metadata(zpath)
        with zipfile.ZipFile(zpath) as z:
            znames=z.namelist()
            print('ZIP MEMBERS:',znames[:30])
            xml_candidates=[n for n in znames if n.lower().endswith('.xml')]
            print('XML MEMBERS:',xml_candidates[:30])
            xml_name=next((n for n in xml_candidates if n.lower().endswith('metadata.xml')),None)
            if not xml_name: raise RuntimeError('Metadata.xml not found in LaunchBox Metadata.zip')
            print('USING XML:',xml_name)
            xml_path=os.path.join(td,'Metadata.xml')
            with z.open(xml_name) as src, open(xml_path,'wb') as dst:
                while True:
                    chunk=src.read(1024*1024)
                    if not chunk: break
                    dst.write(chunk)

        games={}; exact=defaultdict(set); soft_idx=defaultdict(set)
        print('Indexing PS4 games...')
        for _,el in ET.iterparse(xml_path,events=('end',)):
            if el.tag.rsplit('}',1)[-1].lower()!='game': continue
            platform=norm(child_text(el,'Platform'))
            if platform not in PS4_NAMES:
                el.clear(); continue
            try: dbid=int(child_text(el,'DatabaseID'))
            except Exception:
                el.clear(); continue
            name=(child_text(el,'Name') or child_text(el,'Title')).strip()
            if not name:
                el.clear(); continue
            games[dbid]={'name':name,'alternates':[],'images':[]}
            exact[norm(name)].add(dbid)
            if soft(name): soft_idx[soft(name)].add(dbid)
            el.clear()
        print(f'PS4 games indexed: {len(games)}')
        ps4_ids=set(games)

        print('Indexing alternate names and box-front images...')
        tag_counts=Counter(); image_type_counts=Counter(); image_records=0; image_ps4_intersections=0; image_samples=[]; alt_samples=[]
        for _,el in ET.iterparse(xml_path,events=('end',)):
            tag=el.tag.rsplit('}',1)[-1]
            tag_counts[tag]+=1
            low=tag.lower()
            if low in {'gamealternatename','alternate_name','alternatename'}:
                d=record_dict(el)
                if len(alt_samples)<3: alt_samples.append(d)
                try: dbid=int(child_text(el,'DatabaseID'))
                except Exception: dbid=-1
                if dbid in games:
                    name=(child_text(el,'AlternateName') or child_text(el,'Name') or child_text(el,'Title')).strip()
                    if name:
                        games[dbid]['alternates'].append(name)
                        exact[norm(name)].add(dbid)
                        if soft(name): soft_idx[soft(name)].add(dbid)
            elif low in {'gameimage','image'}:
                d=record_dict(el)
                image_records+=1
                if len(image_samples)<5: image_samples.append(d)
                typ=(child_text(el,'Type') or child_text(el,'ImageType')).strip()
                image_type_counts[typ]+=1
                try: dbid=int(child_text(el,'DatabaseID'))
                except Exception: dbid=-1
                if dbid in ps4_ids:
                    image_ps4_intersections+=1
                    type_norm=norm(typ)
                    if type_norm in {'box front','boxfront'}:
                        fn=(child_text(el,'FileName') or child_text(el,'Filename') or child_text(el,'URL')).strip()
                        if fn:
                            if fn.startswith('http://') or fn.startswith('https://'):
                                url=fn; file_name=fn.rsplit('/',1)[-1]
                            else:
                                url=IMAGE_BASE+fn; file_name=fn
                            games[dbid]['images'].append({'file':file_name,'url':url,'region':child_text(el,'Region').strip()})
            if low in {'gamealternatename','alternate_name','alternatename','gameimage','image'}:
                el.clear()
        print('GAMEIMAGE RECORDS:',image_records)
        print('GAMEIMAGE->PS4 INTERSECTIONS:',image_ps4_intersections)
        print('TOP IMAGE TYPES:',image_type_counts.most_common(30))
        print('GAMEIMAGE SAMPLES:',json.dumps(image_samples,ensure_ascii=False)[:5000])
        print('ALT NAME SAMPLES:',json.dumps(alt_samples,ensure_ascii=False)[:3000])
        print('TOP XML TAGS:',tag_counts.most_common(30))

    covers={}; title_covers={}; recovered=[]; unresolved=[]; ambiguous=[]; no_front=[]
    for t in targets:
        n=norm(t['title']); s=soft(t['title'])
        ids=set(exact.get(n,())); method='exact'
        if len(ids)!=1:
            ids=set(soft_idx.get(s,())) if s else set(); method='unique_soft_alias'
        if len(ids)!=1:
            item={**t,'candidateDatabaseIds':sorted(ids)[:10]}
            (ambiguous if ids else unresolved).append(item)
            continue
        dbid=next(iter(ids)); g=games[dbid]; fronts=g['images']
        if not fronts:
            no_front.append({**t,'launchboxDatabaseId':dbid,'launchboxName':g['name']}); continue
        best=sorted(fronts,key=lambda x:(region_rank(x['region']),x['file']))[0]
        url=best['url']
        if t['id'] is None:
            unresolved.append({**t,'launchboxDatabaseId':dbid,'launchboxName':g['name'],'note':'missing ShelfCheck id'}); continue
        covers[str(t['id'])]=url
        title_covers[n]=url
        recovered.append({**t,'launchboxDatabaseId':dbid,'launchboxName':g['name'],'matchMethod':method,'region':best['region'] or None,'fileName':best['file'],'url':url,'frontCandidateCount':len(fronts)})

    os.makedirs(os.path.dirname(OUT_JSON),exist_ok=True)
    summary={'targeted':len(targets),'recovered':len(recovered),'unresolvedNoMatch':len(unresolved),'ambiguous':len(ambiguous),'matchedButNoBoxFront':len(no_front),'regionCounts':{},'metadataDiagnostics':{'gameImageRecords':image_records,'gameImagePs4Intersections':image_ps4_intersections,'topImageTypes':image_type_counts.most_common(20)},'source':'LaunchBox Games Database Metadata.zip / Box - Front only'}
    for r in recovered:
        rg=r.get('region') or 'Unspecified'; summary['regionCounts'][rg]=summary['regionCounts'].get(rg,0)+1
    report={'summary':summary,'recovered':recovered,'unresolved':unresolved,'ambiguous':ambiguous,'noFront':no_front}
    with open(OUT_JSON,'w',encoding='utf-8') as f: json.dump(report,f,indent=2,ensure_ascii=False)
    with open(OUT_JS,'w',encoding='utf-8') as f:
        f.write('// Generated by tools/launchbox-cover-recovery.py. LaunchBox Box - Front only.\n')
        f.write('window.SHELFCHECK_LAUNCHBOX_COVERS='+json.dumps(covers,separators=(',',':'))+';\n')
        f.write('window.SHELFCHECK_LAUNCHBOX_TITLES='+json.dumps(title_covers,separators=(',',':'))+';\n')
        f.write('window.SHELFCHECK_LAUNCHBOX_META='+json.dumps(summary,separators=(',',':'))+';\n')
        f.write("if(typeof document!=='undefined'){(()=>{let n=0;const apply=()=>{n++;window.SHELFCHECK_TITLE_COVERS={...(window.SHELFCHECK_TITLE_COVERS||{}),...(window.SHELFCHECK_LAUNCHBOX_TITLES||{})};if(window.SHELFCHECK_COVER_ART?.repaint)window.SHELFCHECK_COVER_ART.repaint();else if(n<80)setTimeout(apply,100)};if(document.readyState==='complete')apply();else window.addEventListener('load',apply,{once:true})})()}\n")
    print(json.dumps(summary,indent=2))

if __name__=='__main__': main()
