#!/usr/bin/env python3
"""Recover ShelfCheck identity covers from exact physical compilation product titles.

Only multi-identity products already encoded in DATA.p are eligible. A PriceCharting PS4
product must normalize exactly to the known physical product title or to one explicitly vetted
product-title alias below (punctuation-only compact equality is also allowed), and its image
must pass the same straight portrait + strong blue PS4-header gate used by the existing retail
recovery. No fuzzy title matching is used.
"""
import base64
import gzip
import importlib.util
import json
import os
import re
import time
import urllib.parse
from collections import Counter, defaultdict

RUNTIME = 'audit-out/cover-runtime-qa.json'
OUT_JS = 'cover-product-inherit.js'
OUT_JSON = 'audit-out/compilation-pricecharting-cover-recovery.json'
BASE_SCRIPT = 'tools/pricecharting-cover-recovery.py'

# Explicitly vetted PriceCharting product-title spellings for DATA.p compilation names that
# PriceCharting catalogs differently. These are product aliases only; DATA.p still decides
# which ShelfCheck identity IDs the physical box actually covers.
PRODUCT_TITLE_ALIASES = {
    'Planescape: Torment: Enhanced Edition / Icewind Dale: Enhanced Edition': [
        'Planescape: Torment & Icewind Dale Enhanced Editions',
    ],
    "Steven Universe: Save the Light / OK K.O.! Let's Play Heroes 2 Games in 1": [
        "Steven Universe: Save The Light & OK KO Let's Play Heroes",
    ],
    'Commandos 2 / Praetorians HD Remaster Double Pack': [
        'Commandos 2 & Praetorians: HD Remastered Double Pack',
        'Commandos 2 & Praetorians HD Remaster Double Pack',
    ],
    'Robotics;Notes Double Pack': [
        'Robotics Notes Elite and Dash Double Pack',
    ],
    'Saints Row IV: Re-Elected & Gat Out of Hell': [
        'Saints Row IV: Re-Elected & Gat Out Of Hell [First Edition]',
    ],
}

spec = importlib.util.spec_from_file_location('shelfcheck_pc_base', BASE_SCRIPT)
pc = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pc)


def load_data():
    b64 = ''.join(open(n, encoding='utf-8').read() for n in ['data0.txt', 'data1.txt', 'data2.txt', 'data3a.txt', 'data3b.txt']).strip()
    return json.loads(gzip.decompress(base64.b64decode(b64)).decode('utf-8'))


def load_existing():
    if not os.path.exists(OUT_JS):
        return {}
    text = open(OUT_JS, encoding='utf-8').read()
    m = re.search(r'window\.SHELFCHECK_PRODUCT_INHERIT_COVERS=(\{.*?\});', text, re.S)
    if not m:
        return {}
    try:
        return json.loads(m.group(1))
    except Exception:
        return {}


def load_existing_meta():
    if not os.path.exists(OUT_JS):
        return {}
    text = open(OUT_JS, encoding='utf-8').read()
    m = re.search(r'window\.SHELFCHECK_PRODUCT_INHERIT_META=(\{.*?\});', text, re.S)
    if not m:
        return {}
    try:
        return json.loads(m.group(1))
    except Exception:
        return {}


def write_layer(covers, original_meta, batch_meta):
    with open(OUT_JS, 'w', encoding='utf-8') as f:
        f.write('// Generated ShelfCheck physical compilation/product cover inheritance layer.\n')
        f.write('window.SHELFCHECK_PRODUCT_INHERIT_COVERS=' + json.dumps(covers, separators=(',', ':')) + ';\n')
        f.write('window.SHELFCHECK_PRODUCT_INHERIT_META=' + json.dumps(original_meta, separators=(',', ':')) + ';\n')
        f.write('window.SHELFCHECK_COMPILATION_PRICECHARTING_META=' + json.dumps(batch_meta, separators=(',', ':')) + ';\n')
        f.write("if(typeof document!=='undefined'){(()=>{let n=0;const apply=()=>{n++;window.SHELFCHECK_TITLE_COVERS={...(window.SHELFCHECK_TITLE_COVERS||{}),...(window.SHELFCHECK_PRODUCT_INHERIT_COVERS||{})};if(window.SHELFCHECK_COVER_ART?.repaint)window.SHELFCHECK_COVER_ART.repaint();else if(n<80)setTimeout(apply,100)};if(document.readyState==='complete')apply();else window.addEventListener('load',apply,{once:true})})()}\n")


def exact_product_front(product_title, cache):
    key = pc.norm(product_title)
    if key in cache:
        return cache[key]

    search_titles = [product_title] + PRODUCT_TITLE_ALIASES.get(product_title, [])
    result = {'status': 'no_exact_product', 'productTitle': product_title, 'searchedTitles': search_titles}
    all_rejected = []
    all_errors = []

    for alias_index, search_title in enumerate(search_titles):
        try:
            query = urllib.parse.quote(search_title + ' Playstation 4')
            final, raw = pc.request(pc.SEARCH + query)
            candidates = pc.parse_candidates(final, raw)
            exact = []
            for candidate in candidates:
                method = None
                if pc.norm(candidate.get('title')) == pc.norm(search_title):
                    method = 'product_title_exact' if alias_index == 0 else 'vetted_product_alias_exact'
                elif pc.compact(candidate.get('title')) == pc.compact(search_title):
                    method = 'product_title_compact_exact' if alias_index == 0 else 'vetted_product_alias_compact_exact'
                if method:
                    exact.append((candidate, method))
            exact.sort(key=lambda pair: (pair[0].get('regionRank', 99), 0 if pair[1].endswith('_exact') else 1, pair[0].get('url', '')))

            rejected = []
            for candidate, method in exact:
                image = candidate.get('image') or pc.image_from_product(candidate['url'])
                if not image:
                    rejected.append({'searchTitle': search_title, 'matchedTitle': candidate.get('title'), 'region': candidate.get('region'), 'productUrl': candidate.get('url'), 'reason': 'no_product_image'})
                    continue
                ok, metrics = pc.validate_image(image)
                if not ok:
                    rejected.append({'searchTitle': search_title, 'matchedTitle': candidate.get('title'), 'region': candidate.get('region'), 'productUrl': candidate.get('url'), 'image': image, 'reason': 'failed_retail_front_gate', 'metrics': metrics})
                    continue
                result = {
                    'status': 'accepted',
                    'productTitle': product_title,
                    'searchTitle': search_title,
                    'matchedTitle': candidate.get('title'),
                    'matchMethod': method,
                    'region': candidate.get('region'),
                    'productUrl': candidate.get('url'),
                    'image': image,
                    'metrics': metrics,
                }
                cache[key] = result
                time.sleep(0.12)
                return result
            all_rejected.extend(rejected)
        except Exception as exc:
            all_errors.append({'searchTitle': search_title, 'error': str(exc)[:220]})
        time.sleep(0.12)

    if all_rejected:
        result = {'status': 'rejected', 'productTitle': product_title, 'searchedTitles': search_titles, 'attempts': all_rejected}
    elif all_errors and len(all_errors) == len(search_titles):
        result = {'status': 'error', 'productTitle': product_title, 'searchedTitles': search_titles, 'attempts': all_errors}
    elif all_errors:
        result['sourceErrors'] = all_errors

    cache[key] = result
    return result


def main():
    runtime = json.load(open(RUNTIME, encoding='utf-8'))
    data = load_data()
    existing = load_existing()
    original_meta = load_existing_meta()

    products_by_identity = defaultdict(list)
    unique_products = {}
    for row in data.get('p', []):
        if len(row) < 3:
            continue
        product_key, product_title, raw_ids = row[0], row[1], row[2]
        try:
            ids = sorted({int(x) for x in raw_ids})
        except Exception:
            continue
        # This pass is intentionally compilation/multi-pack only.
        if len(ids) < 2 or not product_title:
            continue
        product = {
            'productKey': pc.norm(product_key),
            'productTitle': str(product_title),
            'coverageIds': ids,
            'coverageCount': len(ids),
        }
        unique_products[(product['productKey'], tuple(ids))] = product
        for identity_id in ids:
            products_by_identity[identity_id].append(product)

    targets = []
    seen_ids = set()
    for bucket in ('review', 'watch', 'fallback'):
        for row in runtime.get(bucket, []):
            identity_id = row.get('id')
            title = row.get('title')
            if not isinstance(identity_id, int) or not title or identity_id in seen_ids:
                continue
            seen_ids.add(identity_id)
            if pc.norm(title) in existing:
                continue
            candidates = products_by_identity.get(identity_id, [])
            if not candidates:
                continue
            targets.append({
                'id': identity_id,
                'title': title,
                'bucket': bucket,
                'reason': row.get('reason'),
                'products': sorted(candidates, key=lambda p: (p['coverageCount'], p['productTitle'])),
            })

    print('Unresolved identities covered by known multi-game physical products:', len(targets))
    print('Unique eligible multi-game products:', len(unique_products))
    print('Existing product-inherited covers preserved:', len(existing))
    print('Vetted product-title aliases:', sum(len(v) for v in PRODUCT_TITLE_ALIASES.values()))

    covers = dict(existing)
    product_cache = {}
    accepted = []
    no_exact = []
    rejected = []
    errors = []
    product_counts = Counter()
    region_counts = Counter()
    match_counts = Counter()

    for i, target in enumerate(targets, 1):
        target_failures = []
        choice = None
        for product in target['products']:
            result = exact_product_front(product['productTitle'], product_cache)
            if result['status'] == 'accepted':
                choice = (product, result)
                break
            target_failures.append({**product, **result})
        if choice:
            product, result = choice
            covers[pc.norm(target['title'])] = result['image']
            accepted.append({
                'id': target['id'],
                'title': target['title'],
                'bucket': target['bucket'],
                'reason': target['reason'],
                'productKey': product['productKey'],
                'productTitle': product['productTitle'],
                'coverageCount': product['coverageCount'],
                'coverageIds': product['coverageIds'],
                'searchTitle': result.get('searchTitle'),
                'matchedTitle': result['matchedTitle'],
                'matchMethod': result['matchMethod'],
                'region': result['region'],
                'productUrl': result['productUrl'],
                'image': result['image'],
                'metrics': result['metrics'],
            })
            product_counts[product['productTitle']] += 1
            region_counts[result['region']] += 1
            match_counts[result['matchMethod']] += 1
        else:
            statuses = {f.get('status') for f in target_failures}
            if 'rejected' in statuses:
                rejected.append({**target, 'failures': target_failures})
            elif 'error' in statuses:
                errors.append({**target, 'failures': target_failures})
            else:
                no_exact.append({**target, 'failures': target_failures})
        if i % 10 == 0 or i == len(targets):
            print(f"processed {i}/{len(targets)} accepted={len(accepted)} no_exact={len(no_exact)} rejected={len(rejected)} errors={len(errors)}")

    summary = {
        'eligibleMultiGameProducts': len(unique_products),
        'targetsWithKnownCompilation': len(targets),
        'preserved': len(existing),
        'acceptedThisRun': len(accepted),
        'totalInheritedCovers': len(covers),
        'noExactProductMatch': len(no_exact),
        'rejectedByImageGate': len(rejected),
        'errors': len(errors),
        'queriedUniqueProducts': len(product_cache),
        'vettedProductAliasCount': sum(len(v) for v in PRODUCT_TITLE_ALIASES.values()),
        'productCounts': dict(product_counts),
        'regionCounts': dict(region_counts),
        'matchMethods': dict(match_counts),
        'standard': 'identity explicitly covered by DATA.p multi-game physical product + exact known title or explicit vetted product alias + straight portrait + strong blue PS4 header; no fuzzy matching',
    }

    os.makedirs('audit-out', exist_ok=True)
    with open(OUT_JSON, 'w', encoding='utf-8') as f:
        json.dump({'summary': summary, 'accepted': accepted, 'noExact': no_exact, 'rejected': rejected, 'errors': errors}, f, indent=2, ensure_ascii=False)
    write_layer(covers, original_meta, summary)
    print(json.dumps(summary, indent=2))


if __name__ == '__main__':
    main()
