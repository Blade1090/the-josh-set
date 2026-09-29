# Reusing the ShelfCheck pipeline for another system

This is a practical guide to starting NES, PS3, Switch or another console without starting over. It covers what already works on PS4, what Josh provides, what to run, and which parts are specific to one system. It is not a plan to rewrite the PS4 code; the PS4 tools stay as they are and serve as the working reference.

## What is reusable today

| Piece | File | Reusable as-is? |
|---|---|---|
| Runtime census loader | `tools/lib/runtime-census.mjs` | **Yes.** It finds census scripts from `index.html` and runs the real `census-finalize.js`, so every audit sees exactly what the app shows. A new system needs its own `index.html`, data files and finalize script. |
| Title normalization | `norm()` in `tools/lib/runtime-census.mjs` (same rule as `app.js`) | **Yes.** It handles accents, apostrophes and `&`→`and`. Every match starts from it. |
| Cover audit | `tools/cover-source-audit.mjs` → `tools/cover-visual-audit.py` → `audit-out/cover-runtime-qa.json` | The pipeline shape is reusable. The **banner check is PS4-specific** (it looks for the blue PS4 header). Other systems need their own packaging rule (see config below). |
| Cover GOOD-set gate | `tools/cover-regression-gate.py` | **Yes.** It compares identity IDs, not counts. Hosts known to block automated downloads are listed separately and never hidden. |
| Repo-hosted covers | `covers/<system>/<id>.jpg` + `covers/<system>/SOURCES.json` | **Yes.** Only for verified flat fronts that just needed padding trimmed. The audit reads them from disk with the same checks. |
| Cover sources | LaunchBox Metadata.zip (`tools/launchbox-cover-recovery.py`), PriceCharting (`tools/pricecharting-*.py`), TheGamesDB, vgdb.uk, Shopify stores (VideoGamesPlus, Limited Run) | Each is a **platform parameter** away from reuse. LaunchBox uses a platform name, PriceCharting a console slug, TheGamesDB `platform_id[]`. |
| HLTB runtime audit | `tools/hltb-runtime-audit.mjs` → `audit-out/hltb-runtime-qa.json` | **Yes.** It resolves every INCLUDED identity through the app's own `hltbFor()` after all `hltb-*.js` layers. |
| HLTB verified gate | `tools/hltb-regression-gate.mjs` + `audit-out/hltb-research-decisions.json` | **Yes.** A verified mapping can only change with a recorded, evidenced decision. |
| GameEye HLTB bridge | `tools/gameye-hltb-title-fetch.mjs` | Reusable with a different GameEye `platform_id` (PS4 = 46). HLTB values arrive in **seconds**. |
| Checkpoint files | `audit-out/*-finish.json` + `*_RESUME.md` | **Yes.** The same save-game pattern works for any long run. |

## What Josh provides for a new system

1. **The census**: the list of playable identities with IN/EXCLUDED decisions, in the same `DATA` format (`i` identities, `a` aliases, `p` physical products and compilations). Eligibility rules (physical release required, exclusions) are curator decisions, never inferred by the tools.
2. **The system config** (write it as `systems/<system>.json` when the second system starts; PS4 values are shown):
   - `platform`: display name ("PlayStation 4")
   - `aliases`: platform names used by sources ("Sony PlayStation 4", "PS4")
   - `sources.launchbox.platform`: "Sony Playstation 4"
   - `sources.pricecharting.consoles`: `playstation-4`, `pal-playstation-4`, `jp-playstation-4`, `asian-english-playstation-4`
   - `sources.thegamesdb.platformId`: 4919
   - `sources.gameye.platformId`: 46
   - `regionPreference`: US → World → PAL → Asian English → JP → other
   - `packaging`: the rule a front must pass (PS4: blue header across the top 20%; NES: black box with the Nintendo seal; Switch: red header). **This is the one piece that needs new code per system.**
3. **Private reference exports** if any (e.g. the PriceCharting offline index). Kept outside the repo, used only for name/ID discovery, never committed.

## What runs, in order

1. `node tools/cover-source-audit.mjs`: works out each identity's cover URL across all layers, in runtime order.
2. `python tools/cover-visual-audit.py`: downloads and checks each image, writes GOOD/REVIEW/WATCH/FALLBACK plus `cover-runtime-qa.json` (the production quality gate).
3. Recovery passes, each producing candidates only: LaunchBox → PriceCharting (all regions and vetted aliases) → TheGamesDB/vgdb → retail shops. **A person looks at every candidate before it is mapped.** On PS4, blue-sky key art passed the pixel check, so the automated check alone isn't trusted.
4. `python tools/cover-regression-gate.py <previous audit>`: must print `SUBSET_OK` before any cover commit.
5. `node tools/hltb-runtime-audit.mjs`, then the HLTB source fetch (GameEye bridge, HLTB pages), then `node tools/hltb-regression-gate.mjs <previous>`.
6. What's left becomes an explicit exception list (`audit-out/synthetic-cover-candidates.json`; HLTB `EXCEPTION`/`NO_VERIFIED_MATCH` with reasons). No silent gaps.

## Outputs you get for a new system

- `audit-out/cover-runtime-qa.json`, `cover-visual-audit.json`, `cover-review-queue.csv`: coverage and the unresolved queue
- `audit-out/hltb-runtime-qa.json`, `hltb-research-decisions.json`: per-identity timing with source, rule and confidence
- per-batch accept/reject evidence in the checkpoint JSON
- the regression-gate output, which proves nothing previously verified was lost

## Rules that carry over unchanged

- Existing verified covers and HLTB mappings are protected by ID-level gates.
- Loose prices are never CIB prices.
- No fuzzy title matching. Aliases, editions and regional names are accepted only when they're the same playable identity.
- A compilation's total runtime is never copied onto its individual games.
- Pre-release art ("NOT FINAL", rating-pending, provisional), 3D renders, case photos and fan art are never GOOD.
- Sites that block automated downloads are not worked around. Such items are flagged instead.

## Deliberately not done yet

- No shared engine was extracted from the PS4 recovery scripts; they work and are PS4-evidenced. When the second system starts, pull platform constants into `systems/<system>.json` one source at a time, running the gates after each change.
- No synthetic "reconstructed cover" tier exists. The PS4 candidate list is in `audit-out/synthetic-cover-candidates.json` for Josh's decision.
- PS4 evidence (`audit-out/`, `covers/ps4/`) stays separate. A new system gets its own `covers/<system>/` and its own audit files.
