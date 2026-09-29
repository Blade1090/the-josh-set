#!/usr/bin/env python3
"""Cover GOOD-set regression gate.

Usage: python tools/cover-regression-gate.py <previous cover-visual-audit.json> [current, default audit-out/cover-visual-audit.json]
       (use `git show <rev>:audit-out/cover-visual-audit.json > prev.json` to get a previous audit)

Rule: every identity GOOD in the previous audit must still be GOOD (compared by identity id).
The only tolerated exception is an identity whose URL is unchanged and whose image host is
known to block automated fetches intermittently (BLOCKED_HOSTS); these are printed explicitly
so they are never silently hidden. Exit 1 on any other lost GOOD identity.
"""
import json, sys

BLOCKED_HOSTS = ('gamefaqs.gamespot.com',)

def load(p):
    d = json.load(open(p, encoding='utf-8'))
    return {r['id']: r for r in d['rows']}, d['summary']

def main():
    prev = sys.argv[1]
    cur = sys.argv[2] if len(sys.argv) > 2 else 'audit-out/cover-visual-audit.json'
    a, sa = load(prev); b, sb = load(cur)
    good = lambda rows: {i for i, r in rows.items() if r['qualityState'] == 'GOOD'}
    ga, gb = good(a), good(b)
    lost, gained = sorted(ga - gb), sorted(gb - ga)
    flakes = [i for i in lost if i in b and a[i]['url'] == b[i]['url'] and b[i]['qualityState'] == 'WATCH'
              and any(h in (b[i]['url'] or '') for h in BLOCKED_HOSTS)]
    real = [i for i in lost if i not in flakes]
    keys = ('good', 'review', 'watch', 'fallback')
    print('previous', {k: sa[k] for k in keys}, 'current', {k: sb[k] for k in keys})
    print('GOOD gained', len(gained), 'GOOD lost', len(lost))
    for i in flakes: print('  blocked-host fetch flake (URL unchanged):', i, b[i]['title'], b[i].get('error'))
    for i in real: print('  LOST', i, b.get(i, {}).get('title'), b.get(i, {}).get('qualityState'), b.get(i, {}).get('reasonCode'))
    changed_bad = [i for i in b if i in a and a[i]['url'] != b[i]['url'] and b[i]['qualityState'] != 'GOOD']
    for i in changed_bad: print('  changed URL but not GOOD:', i, b[i]['title'], b[i]['reasonCode'])
    print('SUBSET_OK' if not real else 'REGRESSION')
    sys.exit(1 if real else 0)

if __name__ == '__main__':
    main()
