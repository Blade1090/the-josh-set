#!/usr/bin/env python3
"""Evidence-linked unresolved queue and conservative, read-only candidate discovery.

Run from repository root. Discovery never changes runtime artwork or quality gates.
Uses the existing PriceCharting parser, normalization, and image gate unchanged.
"""
import argparse
import importlib.util
import json
from pathlib import Path
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import quote

ROOT = Path('audit-out/cover-remediation')


def module(name, filename):
    spec = importlib.util.spec_from_file_location(name, 'tools/' + filename)
    obj = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(obj)
    return obj


pc = module('pc', 'pricecharting-cover-recovery.py')
aliases = module('aliases', 'pricecharting-alias-cover-recovery.py')
editions = module('editions', 'pricecharting-vetted-edition-recovery.py')
compilations = module('compilations', 'compilation-pricecharting-cover-recovery.py')


def read(path):
    return json.loads(Path(path).read_text(encoding='utf-8'))


def write(path, value):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    Path(path).write_text(json.dumps(value, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')


def initialize(runtime_path):
    runtime = read(runtime_path)
    reviewed = aliases.parse_reviewed_aliases()
    vetted = {r['id']: r for r in editions.TARGETS}
    prior = {}
    for path in sorted(Path('audit-out').glob('*cover-recovery.json')):
        data = read(path)
        for bucket in ('rejected', 'noMatch', 'errors', 'noFront', 'unresolved'):
            for row in data.get(bucket, []):
                prior.setdefault(row.get('id'), []).append({'ledger': str(path), 'outcome': bucket, 'evidence': row})
    products = {}
    for product in compilations.load_data().get('p', []):
        if len(product) >= 3 and len(set(product[2])) > 1:
            for identity in product[2]:
                products.setdefault(int(identity), []).append({'title': product[1], 'coverageIds': product[2]})
    rows = []
    for bucket in ('review', 'watch'):
        for row in runtime[bucket]:
            identity = row['id']
            queries = [{'title': row['title'], 'method': 'canonical_exact'}]
            queries += [{'title': a, 'method': 'reviewed_identity_alias_exact'} for a in reviewed.get(identity, []) if pc.norm(a) != pc.norm(row['title'])]
            edition = vetted.get(identity)
            if edition and pc.norm(edition['title']) == pc.norm(row['title']):
                queries += [{'title': a, 'method': 'vetted_edition_alias_exact'} for a in edition['aliases']]
            for product in products.get(identity, []):
                for title in [product['title']] + compilations.PRODUCT_TITLE_ALIASES.get(product['title'], []):
                    queries.append({'title': title, 'method': 'explicit_compilation_exact', 'coverageIds': product['coverageIds']})
            evidence = prior.get(identity, [])
            classes = []
            if bucket == 'watch' or any(e['outcome'] == 'errors' for e in evidence):
                classes.append('source_fetch_failure')
            if any(e['outcome'] == 'rejected' for e in evidence):
                classes.append('exact_product_previously_failed_image_verification')
            if edition:
                classes.append('likely_edition_name_mismatch')
            if reviewed.get(identity):
                classes.append('reviewed_alternate_spelling')
            if products.get(identity):
                classes.append('explicit_physical_compilation')
            if not classes:
                classes.append('no_safe_match_in_previous_sources')
            rows.append({**row, 'baselineState': bucket.upper(), 'recoveryClasses': classes,
                         'queries': queries, 'priorEvidence': evidence, 'status': 'pending'})
    rows.sort(key=lambda r: (r['baselineState'] != 'WATCH', r['title'].lower()))
    for i, row in enumerate(rows):
        row['batch'] = i // 40 + 1
    result = {'baselineSummary': runtime['summary'], 'batchSize': 40, 'count': len(rows), 'rows': rows}
    write(ROOT / 'work-queue.json', result)
    write(ROOT / 'baseline-runtime.json', runtime)
    print(json.dumps({'queued': len(rows), 'classes': dict(Counter(c for r in rows for c in r['recoveryClasses']))}))


def discover(row):
    attempts, viable, seen = [], [], set()
    for query in row['queries']:
        try:
            final, raw = pc.request(pc.SEARCH + quote(query['title'] + ' Playstation 4'), timeout=15, retries=1)
            candidates = pc.parse_candidates(final, raw)
            exact = [c for c in candidates if pc.norm(c['title']) == pc.norm(query['title'])]
            match = query['method']
            if not exact:
                compact = [c for c in candidates if pc.compact(c['title']) == pc.compact(query['title'])]
                if len(compact) == 1:
                    exact = compact
                    match = query['method'].replace('_exact', '_compact_exact')
            if not exact:
                attempts.append({'query': query, 'reason': 'no_exact_product_match', 'candidateTitles': [c['title'] for c in candidates]})
            for candidate in sorted(exact, key=lambda c: (c['regionRank'], c['url'])):
                if candidate['url'] in seen:
                    continue
                seen.add(candidate['url'])
                image = candidate.get('image') or pc.image_from_product(candidate['url'])
                record = {'source': 'PriceCharting', 'matchedTitle': candidate['title'], 'region': candidate['region'],
                          'regionRank': candidate['regionRank'], 'productUrl': candidate['url'], 'imageUrl': image,
                          'matchingMethod': match, 'query': query}
                if not image:
                    attempts.append({**record, 'reason': 'no_product_image'})
                    continue
                ok, metrics = pc.validate_image(image)
                if ok:
                    viable.append({**record, 'metrics': metrics, 'status': 'requires_visual_review'})
                else:
                    attempts.append({**record, 'reason': 'image_fetch_failed' if 'error' in metrics else 'failed_existing_retail_front_gate', 'metrics': metrics})
        except Exception as exc:
            attempts.append({'query': query, 'reason': 'source_fetch_failure', 'error': str(exc)[:300]})
    viable.sort(key=lambda c: (c['regionRank'], c['matchingMethod'] != 'canonical_exact', c['productUrl']))
    return {**row, 'status': 'requires_visual_review' if viable else 'exception', 'candidates': viable, 'rejectedCandidates': attempts}


def run_batch(number):
    queue = read(ROOT / 'work-queue.json')
    targets = [r for r in queue['rows'] if r['batch'] == number]
    with ThreadPoolExecutor(max_workers=4) as pool:
        result = list(pool.map(discover, targets))
    write(ROOT / f'discovery-{number:02}.json', {'batch': number, 'attempted': len(result), 'rows': result})
    print(json.dumps({'batch': number, 'attempted': len(result), 'withCandidates': sum(bool(r['candidates']) for r in result)}, indent=2))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--initialize', metavar='RUNTIME_JSON')
    parser.add_argument('--batch', type=int)
    args = parser.parse_args()
    if args.initialize:
        initialize(args.initialize)
    elif args.batch:
        run_batch(args.batch)
    else:
        parser.error('choose --initialize or --batch')
