#!/usr/bin/env python3
"""Apply visually reviewed candidates transactionally and run both existing full audits.

Usage: python tools/cover-remediation-verify.py --batch 1 --node node
Decisions live in audit-out/cover-remediation/decisions-NN.json. A rejected audit
restores every runtime artifact; failed QA evidence is retained separately.
No commits, pushes, or deployments are performed by this script.
"""
import argparse
import json
import os
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path('audit-out/cover-remediation')
ARTIFACTS = ['cover-pricecharting-retail.js', 'audit-out/cover-source-audit.json',
             'audit-out/cover-visual-audit.json', 'audit-out/cover-runtime-qa.json',
             'audit-out/cover-review-queue.csv']


def read(path):
    return json.loads(Path(path).read_text(encoding='utf-8'))


def write(path, data):
    Path(path).write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')


def compare(before, after, targets):
    errors = []
    old, new = before['summary'], after['summary']
    if old['included'] != 2407 or new['included'] != 2407:
        errors.append('included_count_changed')
    if new['good'] < old['good']:
        errors.append('good_count_decreased')
    for key in ('review', 'watch', 'fallback'):
        if new[key] > old[key]:
            errors.append(key + '_count_increased')
    previous = {r['id']: r for r in before['rows']}
    current = {r['id']: r for r in after['rows']}
    if len(current) != 2407 or previous.keys() != current.keys():
        errors.append('identity_set_changed')
    for identity, row in previous.items():
        other = current.get(identity, {})
        if row['qualityState'] == 'GOOD':
            if other.get('qualityState') != 'GOOD':
                errors.append(f'previously_good_regressed:{identity}')
            if any(other.get(k) != row.get(k) for k in ('title', 'source', 'url')):
                errors.append(f'previously_good_art_changed:{identity}')
        if identity not in targets and any(other.get(k) != row.get(k) for k in ('title', 'source', 'url')):
            errors.append(f'unrelated_art_changed:{identity}')
    for identity in targets:
        if current.get(identity, {}).get('qualityState') != 'GOOD':
            errors.append(f'candidate_not_good:{identity}')
    return errors


def run(batch, node):
    before = read('audit-out/cover-visual-audit.json')
    discovery = read(ROOT / f'discovery-{batch:02}.json')
    decisions = read(ROOT / f'decisions-{batch:02}.json')
    by_id = {r['id']: r for r in discovery['rows']}
    approved = []
    for decision in decisions:
        if decision['decision'] != 'accept':
            continue
        row = by_id[decision['id']]
        candidate = next(c for c in row['candidates'] if c['imageUrl'] == decision['imageUrl'])
        current = next(r for r in before['rows'] if r['id'] == row['id'])
        if current['qualityState'] not in ('REVIEW', 'WATCH') or current['title'] != row['title']:
            raise ValueError('Target is no longer the same unresolved identity')
        if not decision.get('visualEvidence'):
            raise ValueError('Missing visual inspection evidence')
        approved.append({'id': row['id'], 'title': row['title'], **candidate, 'visualEvidence': decision['visualEvidence']})
    backups = {name: Path(name).read_bytes() if Path(name).exists() else None for name in ARTIFACTS}
    report = {'batch': batch, 'attempted': discovery['attempted'], 'approvedCandidates': approved,
              'decisions': decisions, 'before': before['summary'], 'status': 'pending'}
    try:
        # Preserve all other JS and metadata byte-for-byte; only replace map payload.
        path = Path(ARTIFACTS[0])
        text = path.read_text(encoding='utf-8')
        match = re.search(r'window\.SHELFCHECK_PRICECHARTING_COVERS=(\{.*?\});', text, re.S)
        covers = json.loads(match[1])
        import importlib.util
        spec = importlib.util.spec_from_file_location('pc', 'tools/pricecharting-cover-recovery.py')
        pc = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(pc)
        for candidate in approved:
            covers[pc.norm(candidate['title'])] = candidate['imageUrl']
        if approved:
            path.write_text(text[:match.start(1)] + json.dumps(covers, separators=(',', ':')) + text[match.end(1):], encoding='utf-8')
        subprocess.run([node, 'tools/cover-source-audit.mjs'], check=True)
        subprocess.run([sys.executable, '-u', 'tools/cover-visual-audit.py'], check=True)
        after = read('audit-out/cover-visual-audit.json')
        report['after'] = after['summary']
        report['violations'] = compare(before, after, {r['id'] for r in approved})
        report['status'] = 'rejected' if report['violations'] else 'validated'
        report['recovered'] = [] if report['violations'] else [r['id'] for r in approved]
        if report['violations']:
            write(ROOT / f'rejected-audit-{batch:02}.json', after)
    except Exception as exc:
        report['status'] = 'rejected'
        report['error'] = str(exc)
        report['recovered'] = []
    finally:
        if report['status'] != 'validated':
            for name, content in backups.items():
                if content is None:
                    Path(name).unlink(missing_ok=True)
                else:
                    Path(name).write_bytes(content)
        write(ROOT / f'verification-{batch:02}.json', report)
    print(json.dumps(report, indent=2))
    return 0 if report['status'] == 'validated' else 1


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--batch', type=int, required=True)
    parser.add_argument('--node', default='node')
    args = parser.parse_args()
    sys.exit(run(args.batch, args.node))
