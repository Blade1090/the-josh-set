#!/usr/bin/env python3
"""Recover unresolved ShelfCheck PS4 fronts from explicitly vetted same-game edition titles.

This is intentionally conservative. Each target is pinned to a ShelfCheck identity ID +
canonical title and one or more explicit PriceCharting product spellings. A candidate is only
accepted when its PS4 product title exactly/compact-exactly equals one of those spellings and
the image passes the existing straight-portrait + strong-blue-PS4-header physical-front gate.
No fuzzy matching is used.
"""
import importlib.util
import json
import os
import re
import time
import urllib.parse
from collections import Counter

BASE_SCRIPT = 'tools/pricecharting-cover-recovery.py'
RUNTIME = 'audit-out/cover-runtime-qa.json'
OUT_JS = 'cover-pricecharting-retail.js'
OUT_JSON = 'audit-out/pricecharting-vetted-edition-recovery.json'

# First conservative pass: spelling, subtitle, or clearly named physical edition differences.
# IDs and canonical titles are both checked against runtime before any lookup is attempted.
TARGETS = [
    {'id':2037,'title':'9th Dawn III','aliases':['9th Dawn III: Shadow of Erthil']},
    {'id':2485,'title':'Anonymous;Code','aliases':['Anonymous;Code [SteelBook Launch Edition]']},
    {'id':2497,'title':'Asterix & Obelix XXXL: The Ram from Hibernia','aliases':['Asterix & Obelix XXXL: The Ram from Hibernia [Limited Edition]','Asterix & Obelix XXXL: The Ram From Hibernia [Collector\'s Edition]']},
    {'id':1579,'title':'Back to the Future: The Game','aliases':['Back to the Future: The Game 30th Anniversary']},
    {'id':2301,'title':'Crymachina','aliases':['Crymachina [Deluxe Edition]','Crymachina [Limited Edition]']},
    {'id':1861,'title':'Demon Gaze Extra','aliases':['Demon Gaze Extra [Day One Edition]']},
    {'id':364,'title':'Diablo III: Ultimate Evil Edition','aliases':['Diablo III Reaper of Souls [Ultimate Evil Edition]']},
    {'id':429,'title':'Earthfall','aliases':['Earthfall [Deluxe Edition]','Earthfall Deluxe Edition']},
    {'id':1622,'title':'Fury Unleashed','aliases':['Fury Unleashed [Bang Edition]']},
    {'id':1824,'title':'Gearshifters','aliases':['Gear Shifters','Gear Shifters [Collector\'s Edition]']},
    {'id':2599,'title':'Harry Potter: Quidditch Champions','aliases':['Harry Potter: Quidditch Champions [Deluxe Edition]']},
    {'id':2647,'title':'Legend Of Heroes: Trails Beyond The Horizon','aliases':['Legend Of Heroes: Trails Beyond The Horizon: Deluxe Edition','The Legend Of Heroes: Trails Beyond The Horizon [Deluxe Edition]','Legend Of Heroes: Trails Beyond The Horizon [Limited Edition]']},
    {'id':2649,'title':'Legend Of Legacy HD Remastered','aliases':['Legend of Legacy HD Remastered [Deluxe Edition]','The Legend Of Legacy HD Remastered [Deluxe Edition]','Legend Of Legacy HD Remastered [Limited Edition]']},
    {'id':716,'title':'Lichtspeer','aliases':['Lichtspeer [Double Speer Edition]']},
    {'id':832,'title':'NeuroVoider','aliases':['Neuro Voider']},
    {'id':897,'title':'PAWARUMI','aliases':['Pawarumi [Limited Edition]']},
    {'id':2698,'title':'R-Type Tactics I & II Cosmos','aliases':['R-Type Tactics I & II Cosmos [Deluxe Edition]','R-Type Tactics I • II Cosmos [Deluxe Edition]']},
    {'id':2705,'title':'Raiden IV x MIKADO Remix','aliases':['Raiden IV x MIKADO Remix [Deluxe Edition]','Raiden IV X Mikado Remix [Deluxe Edition]']},
    {'id':2707,'title':'Raidou Remastered: Mystery Of The Soulless Army','aliases':['Raidou Remastered: The Mystery Of The Soulless Army']},
    {'id':1025,'title':'Runbow','aliases':['Runbow Deluxe Edition']},
    {'id':1047,'title':'Semispheres','aliases':['Semispheres [Blue]','Semispheres [Orange]']},
    {'id':1949,'title':'Smashing the Battle: Ghost Soul','aliases':['Smashing the Battle: Ghost Soul [Limited Edition]']},
    {'id':1875,'title':'Taimumari','aliases':['Taimumari: Complete Edition']},
    {'id':1228,'title':'The Coma: Recut','aliases':['The Coma: Recut [Limited Edition]']},
    {'id':2019,'title':'The King of Fighters 2000','aliases':['King of Fighters 2000','King Of Fighters 2000 [Collector\'s Edition]']},
    {'id':1258,'title':'The Last Blade 2','aliases':['Last Blade 2','Last Blade 2 [Collector\'s Edition]']},
    {'id':2049,'title':'The Legend of Heroes: Trails through Daybreak II','aliases':['Legend Of Heroes: Trails Through Daybreak II [Deluxe Edition]','The Legend Of Heroes: Trails Through Daybreak II [Deluxe Edition]','Legend Of Heroes: Trails Through Daybreak II [Limited Edition]']},
    {'id':1278,'title':'The Mummy Demastered','aliases':['The Mummy Demastered [Limited Run]','The Mummy Demastered [Collector\'s Edition]']},
    {'id':1336,'title':"Tom Clancy's Rainbow Six Siege: Advanced Edition",'aliases':['Rainbow Six Siege [Advanced Edition]']},
    {'id':1774,'title':'Umbrella Corps','aliases':['Resident Evil Umbrella Corps','Biohazard Umbrella Corps']},
]

spec = importlib.util.spec_from_file_location('shelfcheck_pc_base', BASE_SCRIPT)
pc = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pc)


def load_existing_meta():
    if not os.path.exists(OUT_JS): return {}
    text = open(OUT_JS, encoding='utf-8').read()
    m = re.search(r'window\.SHELFCHECK_PRICECHARTING_META=(\{.*?\});', text, re.S)
    if not m: return {}
    try: return json.loads(m.group(1))
    except Exception: return {}


def write_cover_layer(covers, original_meta, batch_meta):
    with open(OUT_JS, 'w', encoding='utf-8') as f:
        f.write('// Generated by ShelfCheck PriceCharting physical-cover recovery. Accepted PS4 front covers only.\n')
        f.write('window.SHELFCHECK_PRICECHARTING_COVERS=' + json.dumps(covers, separators=(',', ':')) + ';\n')
        f.write('window.SHELFCHECK_PRICECHARTING_META=' + json.dumps(original_meta, separators=(',', ':')) + ';\n')
        f.write('window.SHELFCHECK_PRICECHARTING_VETTED_EDITION_META=' + json.dumps(batch_meta, separators=(',', ':')) + ';\n')
        f.write("if(typeof document!=='undefined'){(()=>{let n=0;const apply=()=>{n++;window.SHELFCHECK_TITLE_COVERS={...(window.SHELFCHECK_TITLE_COVERS||{}),...(window.SHELFCHECK_PRICECHARTING_COVERS||{})};if(window.SHELFCHECK_COVER_ART?.repaint)window.SHELFCHECK_COVER_ART.repaint();else if(n<80)setTimeout(apply,100)};if(document.readyState==='complete')apply();else window.addEventListener('load',apply,{once:true})})()}\n")


def current_unresolved(runtime):
    out = {}
    for bucket in ('review','watch','fallback'):
        for row in runtime.get(bucket, []):
            if isinstance(row.get('id'), int):
                out[row['id']] = {**row, 'bucket': bucket}
    return out


def try_alias(alias):
    query = urllib.parse.quote(alias + ' Playstation 4')
    final, raw = pc.request(pc.SEARCH + query)
    candidates = pc.parse_candidates(final, raw)
    exact = []
    for candidate in candidates:
        method = None
        if pc.norm(candidate.get('title')) == pc.norm(alias):
            method = 'vetted_edition_alias_exact'
        elif pc.compact(candidate.get('title')) == pc.compact(alias):
            method = 'vetted_edition_alias_compact_exact'
        if method:
            exact.append((candidate, method))
    exact.sort(key=lambda pair: (pair[0].get('regionRank', 99), 0 if pair[1].endswith('_exact') else 1, pair[0].get('url','')))
    rejected = []
    for candidate, method in exact:
        image = candidate.get('image') or pc.image_from_product(candidate['url'])
        if not image:
            rejected.append({'alias':alias,'matchedTitle':candidate.get('title'),'region':candidate.get('region'),'productUrl':candidate.get('url'),'reason':'no_product_image'})
            continue
        ok, metrics = pc.validate_image(image)
        if not ok:
            rejected.append({'alias':alias,'matchedTitle':candidate.get('title'),'region':candidate.get('region'),'productUrl':candidate.get('url'),'image':image,'reason':'failed_retail_front_gate','metrics':metrics})
            continue
        return {'status':'accepted','alias':alias,'matchedTitle':candidate.get('title'),'matchMethod':method,'region':candidate.get('region'),'productUrl':candidate.get('url'),'image':image,'metrics':metrics}
    return {'status':'rejected' if rejected else 'no_exact_alias','alias':alias,'attempts':rejected,'candidateTitles':[c.get('title') for c in candidates[:12]]}


def main():
    runtime = json.load(open(RUNTIME, encoding='utf-8'))
    unresolved = current_unresolved(runtime)
    existing = pc.load_existing()
    original_meta = load_existing_meta()
    covers = dict(existing)

    active = []
    stale_or_mismatch = []
    for target in TARGETS:
        row = unresolved.get(target['id'])
        if not row:
            stale_or_mismatch.append({**target,'skipReason':'not_currently_unresolved'})
            continue
        if pc.norm(row.get('title')) != pc.norm(target['title']):
            stale_or_mismatch.append({**target,'runtimeTitle':row.get('title'),'skipReason':'identity_title_mismatch'})
            continue
        if pc.norm(target['title']) in existing:
            stale_or_mismatch.append({**target,'skipReason':'already_has_pricecharting_cover'})
            continue
        active.append({**target,'bucket':row.get('bucket'),'reason':row.get('reason')})

    accepted=[]; no_match=[]; rejected=[]; errors=[]
    region_counts=Counter(); match_counts=Counter()
    for i,target in enumerate(active,1):
        failures=[]; choice=None
        for alias in target['aliases']:
            try:
                result=try_alias(alias)
            except Exception as exc:
                result={'status':'error','alias':alias,'error':str(exc)[:220]}
            if result['status']=='accepted':
                choice=result; break
            failures.append(result)
            time.sleep(0.12)
        if choice:
            covers[pc.norm(target['title'])]=choice['image']
            accepted.append({**target,**choice})
            region_counts[choice['region']]+=1
            match_counts[choice['matchMethod']]+=1
        else:
            statuses={x.get('status') for x in failures}
            row={**target,'attempts':failures}
            if 'rejected' in statuses: rejected.append(row)
            elif 'error' in statuses: errors.append(row)
            else: no_match.append(row)
        if i%10==0 or i==len(active):
            print(f'processed {i}/{len(active)} accepted={len(accepted)} no_match={len(no_match)} rejected={len(rejected)} errors={len(errors)}')

    summary={
        'configuredTargets':len(TARGETS),
        'activeUnresolvedTargets':len(active),
        'skippedStaleOrMismatch':len(stale_or_mismatch),
        'preserved':len(existing),
        'acceptedThisRun':len(accepted),
        'totalPriceChartingCovers':len(covers),
        'noExactAliasMatch':len(no_match),
        'rejectedByImageGate':len(rejected),
        'errors':len(errors),
        'regionCounts':dict(region_counts),
        'matchMethods':dict(match_counts),
        'standard':'explicit ShelfCheck identity ID + canonical title + vetted same-game PriceCharting edition/spelling alias + exact/compact-exact PS4 product title + straight portrait + strong blue PS4 header; no fuzzy matching',
    }
    os.makedirs('audit-out',exist_ok=True)
    with open(OUT_JSON,'w',encoding='utf-8') as f:
        json.dump({'summary':summary,'accepted':accepted,'noMatch':no_match,'rejected':rejected,'errors':errors,'skipped':stale_or_mismatch},f,indent=2,ensure_ascii=False)
    write_cover_layer(covers,original_meta,summary)
    print(json.dumps(summary,indent=2))

if __name__=='__main__':
    main()
