# NES Shelf Check bootstrap

This branch starts the first non-PS4 Shelf Check system using the reusable pipeline documented in `docs/MULTI_SYSTEM_PIPELINE.md`.

## Locked Matty scope

- Core completion set: North American NES physical releases.
- Annual sports and low-quality licensed games stay IN; there is no Josh-style trash exclusion layer.
- Famicom/Japanese games are tracked and displayed separately but do not change the North American completion percentage.
- Unlicensed, homebrew and aftermarket/afterlife releases are tracked separately from the core set until their census rules are finalized.
- Duplicate copies satisfy one playable identity. Condition/copy count can still be preserved as collection metadata.
- Raw GameEye exports are private input and are never committed to this public repository.

## Visual identity

The NES app should look NES-specific, not like a blue reskin of the PS4 build. The system config defines a charcoal/dark-gray/light-gray/red palette. NES games use verified NES retail box fronts; Famicom entries retain verified Famicom packaging instead of being converted into fake NES boxes.

## First Matty GameEye baseline — 2026-09-29

The private export contains 1,238 total GameEye rows. The first local baseline pass found:

- 369 `NES/Famicom` rows total.
- 363 game rows.
- 362 physical game rows after excluding one digital entry.
- 339 unique normalized physical title strings.
- 20 duplicate title groups comprising 43 physical rows.
- Game-region rows: 305 United States, 49 Japan, 6 World, 2 United Kingdom, 1 missing country.
- Game release types: 330 Official, 18 Unlicensed, 8 Homebrew, 6 Afterlife, 1 Digital.

These are ownership-input counts, not the canonical NES set size and not Matty's completion percentage. The canonical North American census must be built independently and then ownership matched into it.

## Scope of this bootstrap

1. Add `systems/nes.json` and move platform-specific constants behind system config one source at a time.
2. Keep the existing PS4 app and evidence untouched while NES support is developed in parallel.
3. Treat the GameEye export as a private local input. Do not commit the raw export to this public repository.
4. Build a canonical NES identity census before importing ownership. Ownership matching must target identities, not raw GameEye rows.
5. Reuse the existing title normalization, HLTB audit/gate, checkpoint pattern, Random/Shelf Roulette concepts, dossier model and cover regression principles.

## NES cover rule

A GOOD NES cover is a verified straight-on retail box front. NES packaging is not restricted to Nintendo's early black-box design, so the visual audit must not use a black-box requirement. Cartridge labels, angled packshots, case photos, fan art and provisional artwork are not GOOD.

## Tooling now available

Run the private GameEye baseline locally with:

`python tools/nes-gameye-baseline.py /path/to/gameeye.csv`

It writes an aggregate JSON summary plus a normalized ownership-candidate CSV under `audit-out/nes/`. The source export itself is never copied.

## Next implementation checkpoints

- Verify LaunchBox, PriceCharting, TheGamesDB and GameEye NES platform identifiers.
- Build the canonical North American NES census with explicit evidence for edge cases.
- Produce aliases and physical-product relationships for the census.
- Match the private ownership export to the census and report exact matches, duplicates and reconciliation queue.
- Keep Famicom, unlicensed, homebrew and aftermarket views separate from core completion.
- Only after the census/ownership layer is stable, begin cover and HLTB recovery.

## Non-negotiable carryovers from PS4

- No fuzzy same-title guesses without evidence.
- Verified mappings are protected by identity-level regression gates.
- Cover source truth and display fallback are separate concepts.
- Loose prices never substitute for CIB prices.
- Long jobs checkpoint and resume instead of restarting.
