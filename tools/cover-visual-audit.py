import colorsys, io, json, os, re, unicodedata, urllib.request
from PIL import Image

SRC='audit-out/cover-source-audit.json'
OUT='audit-out/cover-visual-audit.json'
MANUAL='audit-out/cover-manual-qa.json'
with open(SRC,'r',encoding='utf-8') as f: data=json.load(f)

def norm_title(s):
    s=unicodedata.normalize('NFKD',str(s or ''))
    s=''.join(c for c in s if not unicodedata.combining(c)).lower()
    s=s.replace('&',' and ').replace('’','').replace("'",'').replace('`','')
    return ' '.join(re.findall(r'[a-z0-9]+',s))

manual={'confirmed_bad':[],'fixed':[],'eligibility':[]}
if os.path.exists(MANUAL):
    with open(MANUAL,'r',encoding='utf-8') as f: manual=json.load(f)
manual_bad={norm_title(x['title']):x for x in manual.get('confirmed_bad',[])}
manual_fixed={norm_title(x['title']):x for x in manual.get('fixed',[])}
manual_elig={norm_title(x['title']):x for x in manual.get('eligibility',[])}

def fetch(url):
    req=urllib.request.Request(url,headers={'User-Agent':'ShelfCheck-ArtAudit/1.1'})
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
    key=norm_title(r['title'])
    manual_status=None; manual_reason=None
    if key in manual_bad:
        manual_status='CONFIRMED_BAD'; manual_reason=manual_bad[key].get('reason')
    elif key in manual_fixed:
        manual_status='FIXED'; manual_reason=manual_fixed[key].get('reason')
    elif key in manual_elig:
        manual_status='ELIGIBILITY'; manual_reason=manual_elig[key].get('reason')

    if source=='MISSING' or not url:
        verdict='REVIEW'; reason='missing_cover'
    elif source=='PS_STORE_OVERRIDE':
        verdict='REVIEW'; reason='playstation_store_art'
    elif source in ('GAMEYE','LEGACY_IGDB'):
        try:
            im=fetch(url)
            span,ratio=ps4_banner_score(im)
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

    # Human QA always wins over heuristics until the title is explicitly moved to FIXED.
    if manual_status=='CONFIRMED_BAD':
        verdict='REVIEW'; reason='manual_confirmed_bad'
    elif manual_status=='ELIGIBILITY':
        verdict='REVIEW'; reason='eligibility_review'

    rows.append({**r,'verdict':verdict,'reason':reason,'manualStatus':manual_status,'manualReason':manual_reason,'bannerColumnSpan':span,'bannerPixelRatio':ratio,'error':err})
    if i%100==0: print(f'audited {i}/{len(data["rows"])}')

review=[r for r in rows if r['verdict']=='REVIEW']
review.sort(key=lambda r:(0 if r.get('manualStatus')=='CONFIRMED_BAD' else 1 if r.get('manualStatus')=='ELIGIBILITY' else 2 if r['source']=='MISSING' else 3 if r['source']=='PS_STORE_OVERRIDE' else 4, r.get('bannerColumnSpan') or 0, r['title'].lower()))
summary={
    'generatedAt':data['generatedAt'],
    'included':len(rows),
    'pass':sum(r['verdict']=='PASS' for r in rows),
    'review':len(review),
    'manualConfirmedBad':sum(r.get('manualStatus')=='CONFIRMED_BAD' for r in rows),
    'manualEligibility':sum(r.get('manualStatus')=='ELIGIBILITY' for r in rows),
    'manualFixedTracked':sum(r.get('manualStatus')=='FIXED' for r in rows),
    'reviewByReason':{}
}
for r in review: summary['reviewByReason'][r['reason']]=summary['reviewByReason'].get(r['reason'],0)+1
os.makedirs('audit-out',exist_ok=True)
with open(OUT,'w',encoding='utf-8') as f: json.dump({'summary':summary,'review':review,'rows':rows},f,indent=2)
with open('audit-out/cover-review-queue.csv','w',encoding='utf-8',newline='') as f:
    import csv
    w=csv.writer(f)
    w.writerow(['id','title','source','reason','manualStatus','manualReason','bannerColumnSpan','bannerPixelRatio','url'])
    for r in review: w.writerow([r['id'],r['title'],r['source'],r['reason'],r.get('manualStatus'),r.get('manualReason'),r.get('bannerColumnSpan'),r.get('bannerPixelRatio'),r.get('url')])
print(json.dumps(summary,indent=2))
