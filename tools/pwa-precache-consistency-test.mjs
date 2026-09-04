// ShelfCheck PWA precache/index.html consistency check.
//
// Verifies the exact bug class this pass fixed can't silently reappear: every versioned
// (?v=) <script src>/<link href> URL that sw.js precaches must match index.html's actual
// URL character-for-character. A precached entry that's missing its query string (or has
// the wrong one) would look fine online (the fetch handler is network-first) but fail an
// offline reload immediately after a version bump, since the Cache API keys entries by the
// full request URL including the query string.
//
// This does NOT require every versioned file to be precached (some pre-existing files are
// intentionally/incidentally left out of the precache list -- that's a separate offline-
// coverage question, not a freshness-mismatch bug) -- it only requires that whatever IS
// precached matches index.html exactly.
//
// Usage:
//   node tools/pwa-precache-consistency-test.mjs   (exits 1 on any mismatch)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function readRepoFile(name) {
  return fs.readFileSync(path.join(REPO, name), 'utf8');
}

function main() {
  const swSrc = readRepoFile('sw.js');
  const arrMatch = swSrc.match(/A=\[(.*?)\];/s);
  const pushMatch = swSrc.match(/A\.push\((.*?)\);/s);
  if (!arrMatch) throw new Error('Could not find precache array A in sw.js');
  const parseList = (s) => JSON.parse('[' + s + ']');
  const precached = [...parseList(arrMatch[1]), ...(pushMatch ? parseList(pushMatch[1]) : [])];

  const html = readRepoFile('index.html');
  const scriptSrcs = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
  const linkHrefs = [...html.matchAll(/<link[^>]+href="([^"]+)"/g)].map((m) => m[1]);
  const allHtmlUrls = new Set([...scriptSrcs, ...linkHrefs]);

  const mismatches = [];
  let verifiedExact = 0;
  for (const p of precached) {
    if (p === './' || p === 'index.html' || p === 'manifest.webmanifest') continue;
    if (!p.includes('?v=')) {
      const versionedCounterpart = [...allHtmlUrls].find((u) => u.startsWith(p + '?'));
      if (versionedCounterpart) {
        mismatches.push({ precached: p, expected: versionedCounterpart, issue: 'precached WITHOUT a version query string, but index.html requests a versioned URL for this file -- this is exactly the freshness bug this tool exists to catch' });
      }
      continue;
    }
    if (!allHtmlUrls.has(p)) {
      mismatches.push({ precached: p, issue: 'this exact versioned URL does not appear anywhere in index.html -- likely a stale/forgotten version bump in sw.js, or a typo' });
    } else {
      verifiedExact++;
    }
  }

  console.log(`Checked ${precached.length} precache entries: ${verifiedExact} verified exact matches, ${mismatches.length} mismatches.`);
  if (mismatches.length) {
    console.error('FAIL:');
    for (const m of mismatches) console.error(' -', JSON.stringify(m));
    process.exit(1);
  }
  console.log('PASS: every versioned precache entry matches index.html exactly.');
}

main();
