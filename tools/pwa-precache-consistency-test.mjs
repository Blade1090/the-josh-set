// ShelfCheck PWA precache/index.html consistency check.
//
// Verifies two distinct requirements for reliable offline startup:
//
//  A) Every versioned (?v=) precache entry in sw.js matches index.html's actual URL
//     character-for-character. A precached entry missing its query string (or carrying the
//     wrong one) looks fine online (the fetch handler is network-first) but fails an
//     offline reload immediately after a version bump, since the Cache API keys entries by
//     the full request URL including the query string.
//
//  B) Every local runtime asset index.html actually loads (every <script src>, every
//     stylesheet <link href>, the manifest, and the icon) is present in the precache list.
//     A script/stylesheet index.html requires but sw.js never precaches is a real offline
//     app-shell hole: a clean install that goes offline before ever fetching that file
//     online will fail to load it at all. This check does NOT require caching anything
//     beyond what index.html's app shell actually references -- external URLs, dev-only
//     tooling, and audit/report files are never in scope.
//
// A failure in either direction exits non-zero.
//
// Usage:
//   node tools/pwa-precache-consistency-test.mjs   (exits 1 on any mismatch or gap)
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
  const precachedList = [...parseList(arrMatch[1]), ...(pushMatch ? parseList(pushMatch[1]) : [])];
  const precachedSet = new Set(precachedList);

  const html = readRepoFile('index.html');
  const scriptSrcs = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
  const linkHrefs = [...html.matchAll(/<link[^>]+href="([^"]+)"/g)].map((m) => m[1]);
  const allRuntimeUrls = [...new Set([...scriptSrcs, ...linkHrefs])];
  const allRuntimeUrlSet = new Set(allRuntimeUrls);

  let failed = false;

  // A) Every versioned precache entry must match index.html exactly.
  const mismatches = [];
  let verifiedExact = 0;
  for (const p of precachedList) {
    if (p === './' || p === 'index.html' || p === 'manifest.webmanifest') continue;
    if (!p.includes('?v=')) {
      const versionedCounterpart = allRuntimeUrls.find((u) => u.startsWith(p + '?'));
      if (versionedCounterpart) {
        mismatches.push({ precached: p, expected: versionedCounterpart, issue: 'precached WITHOUT a version query string, but index.html requests a versioned URL for this file' });
      }
      continue;
    }
    if (!allRuntimeUrlSet.has(p)) {
      mismatches.push({ precached: p, issue: 'this exact versioned URL does not appear anywhere in index.html -- likely a stale/forgotten version bump in sw.js, or a typo' });
    } else {
      verifiedExact++;
    }
  }
  console.log(`[A] Checked ${precachedList.length} precache entries: ${verifiedExact} verified exact matches, ${mismatches.length} mismatches.`);
  if (mismatches.length) {
    failed = true;
    console.error('[A] FAIL:');
    for (const m of mismatches) console.error(' -', JSON.stringify(m));
  } else {
    console.log('[A] PASS: every versioned precache entry matches index.html exactly.');
  }

  // B) Every local runtime asset index.html references must be precached.
  const missingFromPrecache = allRuntimeUrls.filter((u) => !precachedSet.has(u));
  console.log(`[B] Checked ${allRuntimeUrls.length} runtime URLs referenced by index.html: ${allRuntimeUrls.length - missingFromPrecache.length} precached, ${missingFromPrecache.length} missing.`);
  if (missingFromPrecache.length) {
    failed = true;
    console.error('[B] FAIL -- required runtime asset(s) missing from precache:');
    for (const u of missingFromPrecache) console.error(' -', u);
  } else {
    console.log('[B] PASS: every runtime asset index.html references is precached.');
  }

  if (failed) process.exit(1);
  console.log('\nPASS: precache list is exact-match consistent with index.html AND covers every local runtime asset it references.');
}

main();
