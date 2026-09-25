#!/usr/bin/env python3
import base64
import colorsys
import gzip
import io
import json
import os
import re
import unicodedata
import urllib.request
from collections import Counter, defaultdict
from PIL import Image

RUNTIME='audit-out/cover-runtime-qa.json'
MANIFEST='covers-manifest.js'
OUT_JS='cover-product-inherit.js'
OUT_JSON='audit-out/product-cover-inherit-recovery.json'
UA='Mozilla/5.0 ShelfCheck Art Department product-cover inheritance'

def norm(s):
    s=unicodedata.normalize('NFKD',str(s or ''))
    s=''.join(c for c in s if not unicodedata.combining(c)).lower()
    s=s.replace('&',' and ').replace('’','').replace("'",'').replace('`','')
    return ' '.join(re.findall(r'[a-z0-9]+',s))

def request(url,timeout=25,retries=3):
    last=None
    for attempt in range(retries):
        try:
            req=urllib.request.Request(url,headers={'User-Agent':UA,'Accept-Language':'en-US,en;q=0.9'})
            with urllib.request.urlopen(req,timeout=timeout) as r:
                return r.read(8_000_000)
        except Exception as e:
            last=e
    raise last

def ps4_banner_score(im):
    w,h=im.size
    if w<40 or h<60: return 0.0,0.0
    top=im.crop((0,0,w,max(1,int(h*0.20)))).resize((min(w,360),max(20,min(int(h*0.20),120))))
    tw,th=top.size; blue_cols=0; blue_px=0; total=tw*th
    for x in range(tw):
        col=False
        for y in range(th):
            r,g,b=top.getpixel((x,y)); hh,s,v=colorsys.rgb_to_hsv(r/255,g/255,b/255); deg=hh*360
            is_blue=(185<=deg<=225 and s>=0.45 and v>=0.35 and b>g*0.95 and b>r*1.2)
            if is_blue: blue_px+=1; col=True
        if col: blue_cols+=1
    return blue_cols/tw,blue_px/total

def validate_image(url):
    try:
        raw=request(url,timeout=20,retries=2)
        im=Image.open(io.BytesIO(raw)).convert('RGB'); w,h=im.size; aspect=w/h if h else 0
        span,ratio=ps4_banner_score(im)
        ok=(w>=220 and h>=320 and 0.54<=aspect<=0.82 and span>=0.72 and ratio>=0.08)
        return ok,{'width':w,'height':h,'aspect':round(aspect,4),'bannerColumnSpan':round(span,4),'bannerPixelRatio':round(ratio,4)}
    except Exception as e:
        return False,{'error':str(e)[:180]}

def load_data():
    b64=''.join(open(n,encoding='utf-8').read() for n in ['data0.txt','data1.txt','data2.txt','data3a.txt','data3b.txt']).strip()
    return json.loads(gzip.decompress(base64.b64decode(b64)).decode('utf-8'))

def load_product_covers():
    text=open(MANIFEST,encoding='utf-8').read()
    m=re.search(r'window\.SHELFCHECK_PRODUCT_COVERS=(\{.*?\});',text,re.S)
    if not m: raise RuntimeError('SHELFCHECK_PRODUCT_COVERS not found')
    return json.loads(m.group(1))

def load_existing():
    if not os.path.exists(OUT_JS): return {}
    text=open(OUT_JS,encoding='utf-8').read()
    m=re.search(r'window\.SHELFCHECK_PRODUCT_INHERIT_COVERS=(\{.*?\});',text,re.S)
    if not m: return {}
    try: return json.loads(m.group(1))
    except Exception: return {}

def main():
    runtime=json.load(open(RUNTIME,encoding='utf-8'))
    data=load_data(); product_covers=load_product_covers(); existing=load_existing()
    reverse=defaultdict(list)
    for row in data.get('p',[]):
        if len(row)<3: continue
        key,title,ids=row[0],row[1],row[2]
        nk=norm(key)
        url=product_covers.get(nk)
        if not url: continue
        for identity_id in ids:
            reverse[int(identity_id)].append({'productKey':nk,'productTitle':title,'url':url,'coverageCount':len(set(ids))})

    targets=[]; seen=set()
    for bucket in ('review','watch','fallback'):
        for row in runtime.get(bucket,[]):
            identity_id=row.get('id'); title=row.get('title'); key=norm(title)
            if identity_id is None or not title or key in seen or key in existing: continue
            seen.add(key)
            targets.append({'id':int(identity_id),'title':title,'bucket':bucket,'reason':row.get('reason')})

    covers=dict(existing); accepted=[]; no_product=[]; rejected=[]; validation_cache={}; product_counts=Counter()
    for t in targets:
        candidates=sorted(reverse.get(t['id'],[]),key=lambda c:(c['coverageCount'],c['productTitle']))
        if not candidates:
            no_product.append(t); continue
        choice=None; rejected_candidates=[]
        for c in candidates:
            if c['url'] not in validation_cache:
                validation_cache[c['url']]=validate_image(c['url'])
            ok,metrics=validation_cache[c['url']]
            if ok:
                choice=(c,metrics); break
            rejected_candidates.append({**c,'metrics':metrics})
        if not choice:
            rejected.append({**t,'candidates':rejected_candidates}); continue
        c,metrics=choice; covers[norm(t['title'])]=c['url']; product_counts[c['productTitle']]+=1
        accepted.append({**t,**c,'metrics':metrics})

    summary={
        'targeted':len(targets),'preserved':len(existing),'acceptedThisRun':len(accepted),
        'totalInheritedCovers':len(covers),'noKnownProductCover':len(no_product),
        'rejectedProductCover':len(rejected),'validatedUniqueProductImages':len(validation_cache),
        'productCounts':dict(product_counts),
        'standard':'identity is explicitly covered by DATA.p physical product + manifest product cover passes straight portrait + strong blue PS4-header gate'
    }
    os.makedirs('audit-out',exist_ok=True)
    json.dump({'summary':summary,'accepted':accepted,'noProduct':no_product,'rejected':rejected},open(OUT_JSON,'w',encoding='utf-8'),indent=2,ensure_ascii=False)
    with open(OUT_JS,'w',encoding='utf-8') as f:
        f.write('// Generated by tools/product-cover-inherit-recovery.py. Validated physical PS4 compilation/product covers inherited only by identities explicitly covered by DATA.p.\n')
        f.write('window.SHELFCHECK_PRODUCT_INHERIT_COVERS='+json.dumps(covers,separators=(',',':'))+';\n')
        f.write('window.SHELFCHECK_PRODUCT_INHERIT_META='+json.dumps(summary,separators=(',',':'))+';\n')
        f.write("if(typeof document!=='undefined'){(()=>{let n=0;const apply=()=>{n++;window.SHELFCHECK_TITLE_COVERS={...(window.SHELFCHECK_TITLE_COVERS||{}),...(window.SHELFCHECK_PRODUCT_INHERIT_COVERS||{})};if(window.SHELFCHECK_COVER_ART?.repaint)window.SHELFCHECK_COVER_ART.repaint();else if(n<80)setTimeout(apply,100)};if(document.readyState==='complete')apply();else window.addEventListener('load',apply,{once:true})})()}\n")
    print(json.dumps(summary,indent=2))

if __name__=='__main__': main()
