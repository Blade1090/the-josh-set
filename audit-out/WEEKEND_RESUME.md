# Art Department weekend — resume card

- Branch: `art-department-weekend-final` (worktree: `C:\Users\josh\Documents\tjs-art-weekend`; the main checkout's own branch is untouched)
- Base: main `f513842` (baseline GOOD 2049 / REVIEW 330 / WATCH 20 / FALLBACK 8)
- Latest verified QA: GOOD 2176 / REVIEW 207 / WATCH 16 / FALLBACK 8 (0 baseline GOOD regressions)
- Last completed batch: 7 (PriceCharting vetted aliases). Batches 1-7 all committed and pushed.
- Next: Monday. Open the draft PR manually (not created: no gh, browsers not signed in): https://github.com/Blade1090/the-josh-set/compare/main...art-department-weekend-final?expand=1 . Then review blockers/curatorReview in the checkpoint JSON.
- Working tree: clean after final commit; pushed to origin.

## Gotchas
- The blue-banner heuristic passes blue-sky key art. Inspect every candidate visually before mapping it.
- Pushing a change to `cover-title-overrides.js` triggers the CI visual audit, which commits its own runtime QA to this branch. Before the next push, merge it (don't rebase) and keep the local verified `cover-runtime-qa.json`.
- GameFAQs images 403 to the audit. LaunchBox layer entries are auto-GOOD, so vet them by eye.

## First commands after restart
```
cd C:/Users/josh/Documents/tjs-art-weekend
git status && git branch --show-current && git log --oneline -10
node tools/cover-source-audit.mjs && COVER_AUDIT_WORKERS=24 python tools/cover-visual-audit.py
```
Compare GOOD id sets (previous commit's `audit-out/cover-visual-audit.json` vs new). Previous GOOD must be a subset of new. Re-run once if a single unrelated row flips to WATCH on a network error.

## Files
- Mappings: `cover-launchbox-retail.js`, `cover-pricecharting-retail.js`, `cover-title-overrides.js`
- Checkpoint: `audit-out/weekend-cover-remediation.json` (per-batch accepted/rejected with evidence)
- Private inputs (never commit): `~/Downloads/pricecharting_ps4_offline_index_2026-09-25.json`, `pricecharting_ps4_snapshot_2026-09-25.csv`
