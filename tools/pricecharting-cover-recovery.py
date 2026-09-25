#!/usr/bin/env python3
import colorsys
import io
import json
import os
import re
import time
import unicodedata
import urllib.parse
import urllib.request
from collections import Counter
from PIL import Image
from bs4 import BeautifulSoup

RUNTIME='audit-out/cover-runtime-qa.json'
OUT_JS='cover-pricecharting-retail.js'
OUT_JSON='audit-out/pricecharting-cover-recovery.json'
SEARCH='https://www.pricecharting.com/search-products?type=prices&q='
UA='Mozilla/5.0 ShelfCheck Art Department PriceCharting cover recovery'
PLATFORMS={
    'playstation-4':('US/NTSC',0),
    'pal-playstation-4':('PAL',1),
    'asian-english-playstation-4':('Asian English',2),
    'jp-playstation-4':('JP',3),
}

def norm(s):
    s=unicodedata.normalize('NFKD',str(s or ''))
    s=''.join(c for c in s if not unicodedata.combining(c)).lower()
    s=s.replace('&',' and ').replace('’','').replace("'",'').replace('`','')
    return ' '.join(re.findall(r'[a-z0-9]+',s))

def compact(s): return norm(s).replace(' ','')

def platform_info(url):
    try: path=urllib.parse.urlparse(url).path
    except Exception: return None
    m=re.search(r'/game/([a-z0-9-]+)/',path)
    if not m or m.group(1) not in PLATFORMS: return None
    region,rank=PLATFORMS[m.group(1)]
    return {'platformSlug':m.group(1),'region':region,'regionRank':rank}

def request(url,timeout=25,retries=3):
    last=None
    for attempt in range(retries):
        try:
            req=urllib.request.Request(url,headers={'User-Agent':UA,'Accept-Language':'en-US,en;q=0.9'})
            with urllib.request.urlopen(req,timeout=timeout) as r:
                return r.geturl(),r.read(8_000_000)
        except Exception as e:
            last=e
            time.sleep(0.45*(attempt+1))
    raise last

def hi_res(url):
    if not url: return None
    url=urllib.parse.urljoin('https://www.pricecharting.com',url)
    return re.sub(r'/(?:60|120|240|400|800)\.jpg(?:\?.*)?$', '/1600.jpg', url)

def title_from_product_page(soup):
    t=soup.title.get_text(' ',strip=True) if soup.title else ''
    t=re.sub(r'\s+Prices\b[\s\S]*$','',t,flags=re.I).strip()
    return t

def image_from_container(node):
    for parent in [node.find_parent('div',class_='item'),node.find_parent('tr'),node.parent]:
        if not parent: continue
        img=parent.find('img')
        if img:
            u=img.get('src') or img.get('data-src') or img.get('data-original')
            if u: return hi_res(u)
    return None

def parse_candidates(final_url,raw):
    text=raw.decode('utf-8','ignore')
    soup=BeautifulSoup(text,'html.parser')
    direct=platform_info(final_url)
    if direct and re.search(r'/game/[a-z0-9-]+/[^/?#]+$',urllib.parse.urlparse(final_url).path):
        title=title_from_product_page(soup)
        img=None
        tag=soup.find('img',attrs={'itemprop':'image'})
        if tag: img=tag.get('src') or tag.get('data-src')
        if not img:
            for tag in soup.find_all('img'):
                src=tag.get('src') or ''
                if 'storage.googleapis.com/images.pricecharting.com/' in src:
                    img=src; break
        return [{**direct,'title':title,'url':final_url,'image':hi_res(img)}]

    out=[]; seen=set()
    for a in soup.find_all('a',href=True):
        url=urllib.parse.urljoin('https://www.pricecharting.com',a['href'])
        p=platform_info(url)
        if not p: continue
        title=a.get_text(' ',strip=True)
        if not title: continue
        key=(url,norm(title))
        if key in seen: continue
        seen.add(key)
        out.append({**p,'title':title,'url':url,'image':image_from_container(a)})
    return out

def image_from_product(url):
    final,raw=request(url)
    soup=BeautifulSoup(raw.decode('utf-8','ignore'),'html.parser')
    tag=soup.find('img',attrs={'itemprop':'image'})
    if tag:
        return hi_res(tag.get('src') or tag.get('data-src'))
    for tag in soup.find_all('img'):
        src=tag.get('src') or ''
        if 'storage.googleapis.com/images.pricecharting.com/' in src:
            return hi_res(src)
    return None

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
        _,raw=request(url,timeout=20,retries=2)
        im=Image.open(io.BytesIO(raw)).convert('RGB'); w,h=im.size; aspect=w/h if h else 0
        span,ratio=ps4_banner_score(im)
        ok=(w>=220 and h>=320 and 0.54<=aspect<=0.82 and span>=0.72 and ratio>=0.08)
        return ok,{'width':w,'height':h,'aspect':round(aspect,4),'bannerColumnSpan':round(span,4),'bannerPixelRatio':round(ratio,4)}
    except Exception as e:
        return False,{'error':str(e)[:180]}

def load_existing():
    if not os.path.exists(OUT_JS): return {}
    text=open(OUT_JS,encoding='utf-8').read()
    m=re.search(r'window\.SHELFCHECK_PRICECHARTING_COVERS=(\{.*?\});',text,re.S)
    if not m: return {}
    try: return json.loads(m.group(1))
    except Exception: return {}

def main():
    runtime=json.load(open(RUNTIME,encoding='utf-8'))
    existing=load_existing(); targets=[]; seen=set()
    for bucket in ('review','watch','fallback'):
        for row in runtime.get(bucket,[]):
            title=row.get('title'); k=norm(title)
            if not title or not k or k in seen or k in existing: continue
            seen.add(k); targets.append({'id':row.get('id'),'title':title,'bucket':bucket,'reason':row.get('reason')})
    print('PriceCharting targets:',len(targets),'preserved:',len(existing))
    accepted=[]; no_match=[]; rejected=[]; errors=[]; region_counts=Counter(); match_counts=Counter()
    covers=dict(existing)
    for i,t in enumerate(targets,1):
        try:
            q=urllib.parse.quote(t['title']+' Playstation 4')
            final,raw=request(SEARCH+q)
            candidates=parse_candidates(final,raw)
            exact=[c for c in candidates if norm(c['title'])==norm(t['title'])]
            method='normalized_exact'
            if not exact:
                compact_matches=[c for c in candidates if compact(c['title'])==compact(t['title'])]
                if len(compact_matches)==1:
                    exact=compact_matches; method='compact_exact'
            if not exact:
                no_match.append({**t,'candidateCount':len(candidates),'candidateTitles':[c['title'] for c in candidates[:8]]})
                continue
            exact.sort(key=lambda c:(c['regionRank'],c['url']))
            chosen=exact[0]
            image=chosen.get('image')
            if not image:
                image=image_from_product(chosen['url'])
            if not image:
                rejected.append({**t,'matchedTitle':chosen['title'],'region':chosen['region'],'productUrl':chosen['url'],'reason':'no_product_image'})
                continue
            ok,metrics=validate_image(image)
            if not ok:
                rejected.append({**t,'matchedTitle':chosen['title'],'region':chosen['region'],'productUrl':chosen['url'],'image':image,'reason':'failed_retail_front_gate','metrics':metrics})
                continue
            covers[norm(t['title'])]=image
            accepted.append({**t,'matchedTitle':chosen['title'],'matchMethod':method,'region':chosen['region'],'productUrl':chosen['url'],'image':image,'metrics':metrics})
            region_counts[chosen['region']]+=1; match_counts[method]+=1
        except Exception as e:
            errors.append({**t,'error':str(e)[:220]})
        if i%25==0 or i==len(targets): print(f'processed {i}/{len(targets)} accepted={len(accepted)} no_match={len(no_match)} rejected={len(rejected)} errors={len(errors)}')
        time.sleep(0.12)

    summary={'targeted':len(targets),'preserved':len(existing),'acceptedThisRun':len(accepted),'totalPriceChartingCovers':len(covers),'noExactMatch':len(no_match),'rejectedByImageGate':len(rejected),'errors':len(errors),'regionCounts':dict(region_counts),'matchMethods':dict(match_counts),'standard':'exact/compact exact PS4 product + straight portrait image + strong blue PS4 header'}
    os.makedirs('audit-out',exist_ok=True)
    json.dump({'summary':summary,'accepted':accepted,'noMatch':no_match,'rejected':rejected,'errors':errors},open(OUT_JSON,'w',encoding='utf-8'),indent=2,ensure_ascii=False)
    with open(OUT_JS,'w',encoding='utf-8') as f:
        f.write('// Generated by tools/pricecharting-cover-recovery.py. Accepted physical PS4 front covers only.\n')
        f.write('window.SHELFCHECK_PRICECHARTING_COVERS='+json.dumps(covers,separators=(',',':'))+';\n')
        f.write('window.SHELFCHECK_PRICECHARTING_META='+json.dumps(summary,separators=(',',':'))+';\n')
        f.write("if(typeof document!=='undefined'){(()=>{let n=0;const apply=()=>{n++;window.SHELFCHECK_TITLE_COVERS={...(window.SHELFCHECK_TITLE_COVERS||{}),...(window.SHELFCHECK_PRICECHARTING_COVERS||{})};if(window.SHELFCHECK_COVER_ART?.repaint)window.SHELFCHECK_COVER_ART.repaint();else if(n<80)setTimeout(apply,100)};if(document.readyState==='complete')apply();else window.addEventListener('load',apply,{once:true})})()}\n")
    print(json.dumps(summary,indent=2))

if __name__=='__main__': main()
