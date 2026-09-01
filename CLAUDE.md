# ShelfCheck / The Josh Set — Working Notes

## PROJECT
- ShelfCheck / The Josh Set is a curated physical PS4 census and companion app.
- Census identities and physical products are separate concepts.
- Completion is based on distinct playable identities.
- Compilations may satisfy multiple identities.

## CORE ELIGIBILITY
- Physical PS4 release required.
- Digital-only does not qualify.
- Download/code entitlements do not independently satisfy an identity.
- PSVR-REQUIRED games are excluded.
- PSVR-supported/optional games are allowed if genuinely playable without PSVR.
- Annual/serialized sports and curated shovelware are excluded.
- Never silently change INCLUDED/EXCLUDED decisions.
- Ambiguous physical editions/products require curator review rather than assumptions.

## DOSSIERS
- Existing dossier overrides are authoritative.
- Never regenerate or overwrite an existing dossier unless explicitly instructed.
- Preserve exact census identity titles.
- Dossiers must be game-specific and useful, not generic filler.
- Factual accuracy matters more than merely passing automated validation.
- Use the existing dossier schema and existing quality/audit rules.
- Batches 1-22 use object-literal format.
- Batch 23 uses array-literal format.
- Factory dedupe must recognize both formats.
- Research only the specific titles being generated; never re-research the whole census unless explicitly requested.
- Final ShelfCheck dossiers should read like useful game-specific curator notes, not research reports. Avoid phrases such as "research found," "research did not turn up," or repeated appeals to "reviewers" when the underlying game fact can be stated directly. Research is evidence used to produce the dossier; it should not normally become the voice of the dossier.

## WORKING STYLE
- Read only files necessary for the current task.
- Reuse knowledge already available in CLAUDE.md and repository files.
- Do not spawn subagents unless explicitly requested or truly necessary.
- Avoid broad repository scans when a targeted read/search will answer the question.
- Avoid temporary helper files when standard commands can do the job.
- If temporary files are necessary, delete them before finishing.
- Do not refactor unrelated code.
- Do not commit or push unless explicitly instructed.
- Before any destructive/shared action, ask.
- Keep reports concise.

## KNOWN CURRENT STATE
- 2,068 INCLUDED census identities were observed in the current factory run.
- Fixed factory dedupe detects both old object-format and newer array-format dossier overrides.
- Current corrected factory queue reported 456 identities without dossier coverage.
- tools/dossier-generate.mjs validation has been strengthened to better match the live audit.
- dossier-overrides-24-test.js is a TEST file and is not production/wired into ShelfCheck.
- After The Fall and Project LUX require curator review because they appear PSVR-required.
- Prototype requires curator review because its qualifying physical PS4 path may be through the Biohazard Bundle.
- Pressure Overdrive and R-Type Dimensions EX test dossiers contain factual inaccuracies discovered after validation and must not be promoted unchanged.

## IMPORTANT
CLAUDE.md is guidance, not authority over actual repository data. If CLAUDE.md conflicts with explicit instructions from Josh or with verified repository state, stop and report the conflict rather than silently changing data.
