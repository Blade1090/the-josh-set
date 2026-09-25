#!/usr/bin/env python3
import io
import json
import os
import re
import tempfile
import unicodedata
import urllib.request
import zipfile
import xml.etree.ElementTree as ET
from collections import defaultdict

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
        if c.tag.rsplit('}',1)[-1]==name:
            return c.text or ''
    return ''


def clear_root(el):
    el.clear()


def download_metadata(dest):
    req=urllib.request.Request(META_URL,headers={'User-Agent':'ShelfCheck-ArtDepartment/2.0'})
    with urllib.request.urlopen(req,timeout=120) as r, open(dest,'wb') as f:
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


def main():
    with open(RUNTIME,'r',encoding='utf-8') as f:
        runtime=json.load(f)
    targets=[]
    seen=set()
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
            names=z.namelist()
            xml_name=next((n for n in names if n.lower().endswith('metadata.xml')),None)
            if not xml_name: raise RuntimeError('Metadata.xml not found in LaunchBox Metadata.zip')
            xml_path=os.path.join(td,'Metadata.xml')
            with z.open(xml_name) as src, open(xml_path,'wb') as dst:
                while True:
                    chunk=src.read(1024*1024)
                    if not chunk: break
                    dst.write(chunk)

        games={}
        exact=defaultdict(set)
        soft_idx=defaultdict(set)
        print('Indexing PS4 games...')
        for event,el in ET.iterparse(xml_path,events=('end',)):
            tag=el.tag.rsplit('}',1)[-1]
            if tag!='Game':
                continue
            platform=norm(child_text(el,'Platform'))
            if platform not in PS4_NAMES:
                clear_root(el); continue
            try: dbid=int(child_text(el,'DatabaseID'))
            except Exception:
                clear_root(el); continue
            name=child_text(el,'Name').strip()
            if not name:
                clear_root(el); continue
            games[dbid]={'name':name,'alternates':[],'images':[]}
            exact[norm(name)].add(dbid)
            soft_idx[soft(name)].add(dbid)
            clear_root(el)
        print(f'PS4 games indexed: {len(games)}')

        print('Indexing alternate names and Box - Front images...')
        for event,el in ET.iterparse(xml_path,events=('end',)):
            tag=el.tag.rsplit('}',1)[-1]
            if tag=='GameAlternateName':
                try: dbid=int(child_text(el,'DatabaseID'))
                except Exception: dbid=-1
                if dbid in games:
                    name=(child_text(el,'AlternateName') or child_text(el,'Name')).strip()
                    if name:
                        games[dbid]['alternates'].append(name)
                        exact[norm(name)].add(dbid)
                        soft_idx[soft(name)].add(dbid)
            elif tag=='GameImage':
                try: dbid=int(child_text(el,'DatabaseID'))
                except Exception: dbid=-1
                if dbid in games and child_text(el,'Type').strip()=='Box - Front':
                    fn=child_text(el,'FileName').strip()
                    if fn:
                        games[dbid]['images'].append({'file':fn,'region':child_text(el,'Region').strip()})
            clear_root(el)

    covers={}
    recovered=[]
    unresolved=[]
    ambiguous=[]
    no_front=[]

    for t in targets:
        n=norm(t['title']); s=soft(t['title'])
        ids=set(exact.get(n,()))
        method='exact'
        if len(ids)!=1:
            ids=set(soft_idx.get(s,())) if s else set()
            method='unique_soft_alias'
        if len(ids)!=1:
            item={**t,'candidateDatabaseIds':sorted(ids)[:10]}
            if ids: ambiguous.append(item)
            else: unresolved.append(item)
            continue
        dbid=next(iter(ids)); g=games[dbid]
        fronts=g['images']
        if not fronts:
            no_front.append({**t,'launchboxDatabaseId':dbid,'launchboxName':g['name']})
            continue
        best=sorted(fronts,key=lambda x:(region_rank(x['region']),x['file']))[0]
        url=IMAGE_BASE+best['file']
        if t['id'] is None:
            unresolved.append({**t,'launchboxDatabaseId':dbid,'launchboxName':g['name'],'note':'missing ShelfCheck id'})
            continue
        covers[str(t['id'])]=url
        recovered.append({**t,'launchboxDatabaseId':dbid,'launchboxName':g['name'],'matchMethod':method,'region':best['region'] or None,'fileName':best['file'],'url':url,'frontCandidateCount':len(fronts)})

    os.makedirs(os.path.dirname(OUT_JSON),exist_ok=True)
    summary={
        'targeted':len(targets),'recovered':len(recovered),'unresolvedNoMatch':len(unresolved),
        'ambiguous':len(ambiguous),'matchedButNoBoxFront':len(no_front),
        'regionCounts':{},'source':'LaunchBox Games Database Metadata.zip / Box - Front only'
    }
    for r in recovered:
        rg=r.get('region') or 'Unspecified'
        summary['regionCounts'][rg]=summary['regionCounts'].get(rg,0)+1
    report={'summary':summary,'recovered':recovered,'unresolved':unresolved,'ambiguous':ambiguous,'noFront':no_front}
    with open(OUT_JSON,'w',encoding='utf-8') as f: json.dump(report,f,indent=2,ensure_ascii=False)
    with open(OUT_JS,'w',encoding='utf-8') as f:
        f.write('// Generated by tools/launchbox-cover-recovery.py. LaunchBox Box - Front only.\n')
        f.write('window.SHELFCHECK_LAUNCHBOX_COVERS='+json.dumps(covers,separators=(',',':'))+';\n')
        f.write('window.SHELFCHECK_LAUNCHBOX_META='+json.dumps(summary,separators=(',',':'))+';\n')
    print(json.dumps(summary,indent=2))

if __name__=='__main__':
    main()
