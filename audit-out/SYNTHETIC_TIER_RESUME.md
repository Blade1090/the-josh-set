# Synthetic cover tier: resume card

- Branch `synthetic-cover-tier`, worktree `C:\Users\josh\Documents\tjs-synth`, from main `9ce26ba`. Do not merge automatically.
- Progress and batches: `audit-out/synthetic-tier-progress.json`.
- Build: `python tools/synthetic-cover-build.py [--only ids] [--force]`. Targets are every REVIEW/WATCH row. Sources come from IGDB art in covers-manifest.js unless `audit-out/synthetic-cover-sources.json` overrides them (modes: banner | asis | title).
- Audit: `node tools/cover-source-audit.mjs && python tools/cover-visual-audit.py`. It reports `synthetic` and `displayTiers` separately; real counts are unchanged.
- Gate: `python tools/cover-regression-gate.py PREVIOUS_AUDIT.json` must print SUBSET_OK. It also fails if synthetic art ever displays over a real GOOD/FALLBACK cover.
- Runtime: `SHELFCHECK_COVER_POLICY.displayCoverFor(x)` returns {url, tier}. Cards and detail are painted by applyShell; Random pre-warm, Should I Buy, Shelf Roulette and My Shelf call the resolver.
- Gotcha: quote heredocs (`<<'EOF'`) when the text contains backticks.

## Visual pass (branch `synthetic-cover-visual-pass`)
- Header: `covers/_assets/ps4-header.png` (real PS4 retail header from the verified GOOD Inspector Waffles scan; provenance in `covers/_assets/SOURCES.json`).
- Per-cover review classes: `audit-out/synthetic-cover-review.json` (204 GOOD_SYNTHETIC, 6 NEEDS_MANUAL_ART_DIRECTION, 0 NEEDS_COMPOSITION_FIX).
