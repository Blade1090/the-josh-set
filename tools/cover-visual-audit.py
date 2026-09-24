import colorsys, io, json, os, sys, urllib.request
from PIL import Image

SRC='audit-out/cover-source-audit.json'
OUT='audit-out/cover-visual-audit.json'
with open(SRC,'r',encoding='utf-8') as f: data=json.load(f)

def fetch(url):
    req=urllib.request.Request(url,headers={'User-Agent':'ShelfCheck-ArtAudit/1.0'})
    with urllib.request.urlopen(req,timeout=20) as r:
        raw=r.read(8_000_000)
    return Image.open(io.BytesIO(raw)).convert('RGB')

def ps4_banner_score(im):
    w,h=im.size
    if w<40 or h<60: return 0.0,0.0
    top=im.crop((0,0,w,max(1,int(h*0.20)))).resize((min(w,360),max(20,min(int(h*0.20),120))))
    tw,th=top.size
    blue_cols=0; blue_px=0; total=tw*th
    for x in range(tw):
        col=False
        for y in range(th):
            r,g,b=top.getpixel((x,y)); hh,s,v=colorsys.rgb_to_hsv(r/255,g/255,b/255)
            deg=hh*360
            is_blue=(185<=deg<=225 and s>=0.45 and v>=0.35 and b>g*0.95 and b>r*1.2)
            if is_blue:
                blue_px+=1; col=True
        if col: blue_cols+=1
    return blue_cols/tw, blue_px/total

rows=[]
for i,r in enumerate(data['rows'],1):
    source=r['source']; url=r.get('url'); verdict='PASS'; reason='curated'
    span=ratio=None; err=None
    if source=='MISSING' or not url:
        verdict='REVIEW'; reason='missing_cover'
    elif source=='PS_STORE_OVERRIDE':
        verdict='REVIEW'; reason='playstation_store_art'
    elif source in ('GAMEYE','LEGACY_IGDB'):
        try:
            im=fetch(url)
            span,ratio=ps4_banner_score(im)
            # Full front scans usually carry a blue PS4 header spanning most of the width.
            # Conservative threshold: anything less stays in REVIEW.
            if span>=0.72 and ratio>=0.08:
                verdict='PASS'; reason='strong_ps4_header'
            else:
                verdict='REVIEW'; reason='weak_or_missing_ps4_header'
        except Exception as e:
            verdict='REVIEW'; reason='image_fetch_or_decode_failed'; err=str(e)[:200]
    elif source=='CURATED_ID':
        verdict='PASS'; reason='curated_id_override'
    elif source=='CURATED_TITLE':
        verdict='PASS'; reason='curated_title_override'
    rows.append({**r,'verdict':verdict,'reason':reason,'bannerColumnSpan':span,'bannerPixelRatio':ratio,'error':err})
    if i%100==0: print(f'audited {i}/{len(data["rows"])}')

review=[r for r in rows if r['verdict']=='REVIEW']
review.sort(key=lambda r:(0 if r['source']=='MISSING' else 1 if r['source']=='PS_STORE_OVERRIDE' else 2, r.get('bannerColumnSpan') or 0, r['title'].lower()))
summary={
    'generatedAt':data['generatedAt'],
    'included':len(rows),
    'pass':sum(r['verdict']=='PASS' for r in rows),
    'review':len(review),
    'reviewByReason':{}
}
for r in review: summary['reviewByReason'][r['reason']]=summary['reviewByReason'].get(r['reason'],0)+1
os.makedirs('audit-out',exist_ok=True)
with open(OUT,'w',encoding='utf-8') as f: json.dump({'summary':summary,'review':review,'rows':rows},f,indent=2)
with open('audit-out/cover-review-queue.csv','w',encoding='utf-8') as f:
    f.write('id,title,source,reason,bannerColumnSpan,bannerPixelRatio,url\n')
    import csv
    w=csv.writer(f)
    for r in review: w.writerow([r['id'],r['title'],r['source'],r['reason'],r.get('bannerColumnSpan'),r.get('bannerPixelRatio'),r.get('url')])
print(json.dumps(summary,indent=2))
