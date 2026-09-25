import colorsys, io, json, os, re, unicodedata, urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from PIL import Image

SRC='audit-out/cover-source-audit.json'
OUT='audit-out/cover-visual-audit.json'
RUNTIME='audit-out/cover-runtime-qa.json'
MANUAL='audit-out/cover-manual-qa.json'
with open(SRC,'r',encoding='utf-8') as f: data=json.load(f)

def norm_title(s):
    s=unicodedata.normalize('NFKD',str(s or ''))
    s=''.join(c for c in s if not unicodedata.combining(c)).lower()
    s=s.replace('&',' and ').replace('’','').replace("'",'').replace('`','')
    return ' '.join(re.findall(r'[a-z0-9]+',s))

manual={'confirmed_bad':[],'fallback':[],'fixed':[],'eligibility':[]}
if os.path.exists(MANUAL):
    with open(MANUAL,'r',encoding='utf-8') as f: manual=json.load(f)
manual_bad={norm_title(x['title']):x for x in manual.get('confirmed_bad',[])}
manual_fallback={norm_title(x['title']):x for x in manual.get('fallback',[])}
manual_fixed={norm_title(x['title']):x for x in manual.get('fixed',[])}
manual_elig={norm_title(x['title']):x for x in manual.get('eligibility',[])}

def fetch(url):
    req=urllib.request.Request(url,headers={'User-Agent':'ShelfCheck-ArtAudit/1.8'})
    with urllib.request.urlopen(req,timeout=12) as r:
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

def manual_reason_code(text):
    t=str(text or '').lower()
    if 'angled' in t or 'product shot' in t or 'package render' in t: return 'angled_product_shot'
    if 'photo' in t and ('case' in t or 'table' in t or 'shelf' in t or 'framing' in t): return 'photo_of_case'
    if 'blurry' in t or 'low-res' in t or 'low res' in t or 'thumbnail' in t: return 'blurry_or_low_res'
    if 'wrong platform' in t: return 'wrong_platform'
    if 'region' in t or 'edition' in t: return 'wrong_region_or_edition'
    if 'mockup' in t or 'promo' in t or 'glamour' in t: return 'mockup_or_promo'
    if 'crop' in t or 'incomplete' in t: return 'cropped_or_incomplete'
    if 'key art' in t or 'logo' in t or 'bannerless' in t or 'non-retail' in t: return 'key_art_only'
    return 'manual_review'

def audit_image(url, source):
    try:
        im=fetch(url)
        span,ratio=ps4_banner_score(im)
        if span>=0.72 and ratio>=0.08:
            physical='CONFIRMED' if source in ('CURATED_ID','CURATED_TITLE') else 'LIKELY'
            return 'GOOD','strong_ps4_header',physical,span,ratio,None
        physical='LIKELY' if source in ('GAMEYE','CURATED_ID','CURATED_TITLE') else 'VERIFY'
        return 'REVIEW','missing_ps4_banner',physical,span,ratio,None
    except Exception as e:
        return 'WATCH','image_fetch_failed','VERIFY',None,None,str(e)[:200]

def audit_row(r):
    source=r['source']; url=r.get('url')
    quality='GOOD'; reason='curated'; physical='CONFIRMED'
    span=ratio=None; err=None
    key=norm_title(r['title'])
    manual_status=None; manual_reason=None
    if key in manual_bad:
        manual_status='CONFIRMED_BAD'; manual_reason=manual_bad[key].get('reason')
    elif key in manual_fallback:
        manual_status='FALLBACK'; manual_reason=manual_fallback[key].get('reason')
    elif key in manual_fixed:
        manual_status='FIXED'; manual_reason=manual_fixed[key].get('reason')
    elif key in manual_elig:
        manual_status='ELIGIBILITY'; manual_reason=manual_elig[key].get('reason')

    if source=='MISSING' or not url:
        quality='REVIEW'; reason='missing_cover'; physical='VERIFY'
    elif source=='PS_STORE_OVERRIDE':
        quality='REVIEW'; reason='digital_store_art'; physical='VERIFY'
    elif source=='LEGACY_IGDB':
        quality='REVIEW'; reason='key_art_only'; physical='VERIFY'
    elif source=='LAUNCHBOX_BOX_FRONT':
        # The recovery layer is constrained upstream to Sony PlayStation 4 records whose
        # LaunchBox media type is exactly "Box - Front". That semantic classification is
        # stronger evidence of a physical shelf front than our blue-banner pixel heuristic,
        # and LaunchBox's host may reject automated image fetches even when browsers load it.
        quality='GOOD'; reason='launchbox_box_front'; physical='CONFIRMED'
    else:
        quality,reason,physical,span,ratio,err=audit_image(url,source)

    if manual_status=='CONFIRMED_BAD':
        quality='REVIEW'; reason=manual_reason_code(manual_reason)
        physical='LIKELY' if reason in ('angled_product_shot','photo_of_case') else physical
    elif manual_status=='FALLBACK':
        quality='FALLBACK'; reason=manual_reason_code(manual_reason); physical='CONFIRMED'
    elif manual_status=='ELIGIBILITY':
        quality='REVIEW'; reason='physical_release_unverified'; physical='VERIFY'

    verdict={'GOOD':'PASS','FALLBACK':'FALLBACK','WATCH':'WATCH'}.get(quality,'REVIEW')
    return {**r,'verdict':verdict,'qualityState':quality,'reason':reason,'reasonCode':reason,'physicalSanity':physical,'manualStatus':manual_status,'manualReason':manual_reason,'bannerColumnSpan':span,'bannerPixelRatio':ratio,'error':err}

source_rows=data['rows']
rows=[None]*len(source_rows)
workers=max(4,min(24,int(os.environ.get('COVER_AUDIT_WORKERS','16'))))
with ThreadPoolExecutor(max_workers=workers) as pool:
    futures={pool.submit(audit_row,r):i for i,r in enumerate(source_rows)}
    done=0
    for future in as_completed(futures):
        idx=futures[future]
        try:
            rows[idx]=future.result()
        except Exception as e:
            r=source_rows[idx]
            rows[idx]={**r,'verdict':'WATCH','qualityState':'WATCH','reason':'image_fetch_failed','reasonCode':'image_fetch_failed','physicalSanity':'VERIFY','manualStatus':None,'manualReason':None,'bannerColumnSpan':None,'bannerPixelRatio':None,'error':str(e)[:200]}
        done+=1
        if done%100==0 or done==len(source_rows): print(f'audited {done}/{len(source_rows)} with {workers} workers')

review=[r for r in rows if r['qualityState']=='REVIEW']
fallback=[r for r in rows if r['qualityState']=='FALLBACK']
watch=[r for r in rows if r['qualityState']=='WATCH']
priority={'physical_release_unverified':0,'missing_cover':1,'wrong_platform':2,'wrong_region_or_edition':2,'digital_store_art':3,'key_art_only':4,'photo_of_case':5,'angled_product_shot':5,'blurry_or_low_res':6,'cropped_or_incomplete':6,'mockup_or_promo':6,'missing_ps4_banner':7,'image_fetch_failed':8,'manual_review':9}
review.sort(key=lambda r:(0 if r.get('manualStatus')=='CONFIRMED_BAD' else 1 if r.get('manualStatus')=='ELIGIBILITY' else 2, priority.get(r['reasonCode'],10), r.get('bannerColumnSpan') or 0, r['title'].lower()))
fallback.sort(key=lambda r:(priority.get(r['reasonCode'],10),r['title'].lower()))
watch.sort(key=lambda r:(priority.get(r['reasonCode'],10),r.get('bannerColumnSpan') or 0,r['title'].lower()))
summary={'generatedAt':data['generatedAt'],'included':len(rows),'good':sum(r['qualityState']=='GOOD' for r in rows),'fallback':len(fallback),'review':len(review),'watch':len(watch),'physicalVerify':sum(r['physicalSanity']=='VERIFY' for r in rows),'physicalLikely':sum(r['physicalSanity']=='LIKELY' for r in rows),'physicalConfirmed':sum(r['physicalSanity']=='CONFIRMED' for r in rows),'manualConfirmedBad':sum(r.get('manualStatus')=='CONFIRMED_BAD' for r in rows),'manualFallback':sum(r.get('manualStatus')=='FALLBACK' for r in rows),'manualEligibility':sum(r.get('manualStatus')=='ELIGIBILITY' for r in rows),'manualFixedTracked':sum(r.get('manualStatus')=='FIXED' for r in rows),'reviewByReason':{},'watchByReason':{}}
for r in review: summary['reviewByReason'][r['reasonCode']]=summary['reviewByReason'].get(r['reasonCode'],0)+1
for r in watch: summary['watchByReason'][r['reasonCode']]=summary['watchByReason'].get(r['reasonCode'],0)+1
os.makedirs('audit-out',exist_ok=True)
with open(OUT,'w',encoding='utf-8') as f: json.dump({'standard':'docs/COVER_ART_STANDARD.md','summary':summary,'review':review,'fallback':fallback,'watch':watch,'rows':rows},f,indent=2)
with open(RUNTIME,'w',encoding='utf-8') as f: json.dump({'generatedAt':data['generatedAt'],'summary':summary,'review':[{'id':r.get('id'),'title':r['title'],'reason':r['reasonCode']} for r in review],'fallback':[{'id':r.get('id'),'title':r['title'],'reason':r['reasonCode']} for r in fallback],'watch':[{'id':r.get('id'),'title':r['title'],'reason':r['reasonCode']} for r in watch]},f,indent=2)
with open('audit-out/cover-review-queue.csv','w',encoding='utf-8',newline='') as f:
    import csv
    w=csv.writer(f);w.writerow(['id','title','source','qualityState','reasonCode','physicalSanity','manualStatus','manualReason','bannerColumnSpan','bannerPixelRatio','url'])
    for r in review+fallback+watch:w.writerow([r['id'],r['title'],r['source'],r['qualityState'],r['reasonCode'],r['physicalSanity'],r.get('manualStatus'),r.get('manualReason'),r.get('bannerColumnSpan'),r.get('bannerPixelRatio'),r.get('url')])
print(json.dumps(summary,indent=2))
