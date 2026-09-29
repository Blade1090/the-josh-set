# NES Shelf Check bootstrap

This branch starts the first non-PS4 Shelf Check system using the reusable pipeline documented in `docs/MULTI_SYSTEM_PIPELINE.md`.

## Scope of this bootstrap

1. Add `systems/nes.json` and move platform-specific constants behind system config one source at a time.
2. Keep the existing PS4 app and evidence untouched while NES support is developed in parallel.
3. Treat the GameEye export as a private local input. Do not commit the raw export to this public repository.
4. Build a canonical NES identity census before importing ownership. Ownership matching must target identities, not raw GameEye rows.
5. Reuse the existing title normalization, HLTB audit/gate, checkpoint pattern, Random/Shelf Roulette concepts, dossier model and cover regression principles.

## NES cover rule

A GOOD NES cover is a verified straight-on retail box front. NES packaging is not restricted to Nintendo's early black-box design, so the visual audit must not use a black-box requirement. Cartridge labels, angled packshots, case photos, fan art and provisional artwork are not GOOD.

## First implementation checkpoints

- Verify LaunchBox, PriceCharting, TheGamesDB and GameEye NES platform identifiers.
- Build the initial NES/Famicom ownership parser against the private GameEye export.
- Decide the census boundary explicitly: North American NES identities, Famicom identities, unlicensed/homebrew/aftermarket handling, and compilations/multicarts.
- Produce a census candidate set with aliases and physical-product relationships.
- Match the private ownership export to the census and report exact matches, duplicates and reconciliation queue.
- Only after the census/ownership layer is stable, begin cover and HLTB recovery.

## Non-negotiable carryovers from PS4

- No fuzzy same-title guesses without evidence.
- Verified mappings are protected by identity-level regression gates.
- Cover source truth and display fallback are separate concepts.
- Loose prices never substitute for CIB prices.
- Long jobs checkpoint and resume instead of restarting.
