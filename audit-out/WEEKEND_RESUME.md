# Art Department weekend — resume card

- Branch: `art-department-weekend-final` (worktree: `C:\Users\josh\Documents\tjs-art-weekend`; main checkout stays on its own branch, untouched)
- Base: main `f513842` (baseline GOOD 2049 / REVIEW 330 / WATCH 20 / FALLBACK 8)
- Latest verified commit: see `git log -1`; QA in `audit-out/cover-runtime-qa.json`
- Last completed batch: 6 (recover PriceCharting fronts; QA 2169/212/18/8)
- Next batch: 7 — residual-queue triage: WATCH alternates, PC gate-failed portraits, LRG/Strictly Limited shop images
- Blocker: GameFAQs box images 403 to automated fetches (all 20 WATCH) — need alternate hosts
- Lesson: blue-sky key art passes the banner heuristic; every candidate must be visually inspected before mapping

## First commands after restart
```
cd C:/Users/josh/Documents/tjs-art-weekend
git status && git branch --show-current && git log --oneline -10
node tools/cover-source-audit.mjs && COVER_AUDIT_WORKERS=24 python tools/cover-visual-audit.py
```
Then compare GOOD sets (previous commit's `audit-out/cover-visual-audit.json` vs new) — previous GOOD ids must be a subset of new GOOD ids.

## Files
- Mappings: `cover-pricecharting-retail.js` (PriceCharting fronts), `cover-launchbox-retail.js` (LaunchBox Box - Front, auto-GOOD in audit), `cover-title-overrides.js` (other curated hosts; editing it triggers the cover-visual-audit workflow on push)
- Checkpoint: `audit-out/weekend-cover-remediation.json`
- Private inputs (never commit): `~/Downloads/pricecharting_ps4_offline_index_2026-09-25.json`, `pricecharting_ps4_snapshot_2026-09-25.csv`
