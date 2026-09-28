# Monday finish line — resume card

- Branch `shelfcheck-monday-finish-line`, worktree `C:\Users\josh\Documents\tjs-monday`, based on main `7b636de`.
- Save file: `audit-out/monday-finish.json` (baseline, per-phase status, batches, next task).
- Census: runtime 2409 INCLUDED (after the approved Double Dragon Gaiden 2787->2789 re-id).
- Status: ALL PHASES DONE. PR #118 open (not merged). Covers 2190/196/15/8; HLTB 2150/2409 timed (0 verified regressions); 13/13 tests pass.

## Restart
```
cd C:/Users/josh/Documents/tjs-monday
git status && git log --oneline -10
node tools/cover-source-audit.mjs && COVER_AUDIT_WORKERS=24 python tools/cover-visual-audit.py
node tools/hltb-runtime-audit.mjs
```
Cover gate: previous GOOD ids must be a subset of new GOOD ids. HLTB gate: `node tools/hltb-regression-gate.mjs <old> <new>` (added in Phase 3).

## Notes
- Census for every Node audit comes from `tools/lib/runtime-census.mjs` (mutators derived from index.html + real census-finalize.js).
- In Git Bash, `timeout` is Windows timeout.exe. Don't wrap node in it.
- Tests failing on untouched main: pwa-precache-consistency, random-cover-stability, search-initialism.
