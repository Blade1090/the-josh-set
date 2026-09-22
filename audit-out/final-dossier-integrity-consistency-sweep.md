# ShelfCheck — Final Dossier Integrity / Consistency Sweep

**Type:** Analysis only. No census/curation/dossier/pricing/ownership/wishlist/Reject-state/UI files were modified. No PR opened.
**Baseline:** `main` @ `c4ad7cd` ("Merge pull request #102: deduplicate identities and repair OlliOlli coverage")
**Runtime-observed canonical INCLUDED baseline:** 2,456 — matches the expected post-dedup denominator exactly. No STOP condition triggered.

---

## PHASE 1 — Full Runtime Dossier Coverage

| Metric | Value |
|---|---|
| Total INCLUDED | **2,456** |
| good | **2,456** |
| thin | **0** |
| generic | **0** |
| missing | **0** |
| badSummary | **0** |
| Duplicate effective dossier keys (two different identities sharing one dossier object) | **0** |
| Identities resolving via alias instead of canonical title | **0** (all 2,456 resolve on an exact `norm(title)` match) |

Coverage is mechanically perfect by the automated quality gate. Phase 2 exists precisely because that gate cannot detect a dossier that is complete, well-written, and *about the wrong game*.

---

## PHASE 2 — Wrong-Game / Contamination Sweep

Two detection passes were run: a broad title-token/summary-overlap check (850 raw hits — far too noisy, since many perfectly correct dossiers describe genre/mechanic/protagonist without literally repeating the title, e.g. "Bloodborne") and a precision pass that extracts only the grammatical subject of each dossier's opening sentence (`"X is a/an/the..."`) and checks whether *that specific subject* shares any relationship with the census title. The precision pass returned exactly 3 hits: the two still-open contamination cases below, plus one confirmed false positive (Tomb Raider, whose opening word "This" correctly refers back to the 1996 original via the I-III Remastered compilation — already verified distinct from the 2013 reboot in the prior duplicate-identity sweep).

Combined with the already-known cases from the prior physical-legitimacy sweep, no contamination beyond the following four was found anywhere in the 2,456 INCLUDED dossiers. All four remain **unfixed** (expected — every prior sweep was analysis-only).

### A) CONFIRMED WRONG-GAME DOSSIERS (4)
1. **Vegas Party** (id 1400) — dossier describes "Party Hard" (Pinokl Games/tinyBuild stealth game).
2. **Curved Space** (id 287) — dossier describes "Observation" (No Code/Devolver Digital). New this sweep: a dossier entry keyed exactly `"observation"` sits **orphaned** in the override data (see Phase 4) — this is very likely the literal source of the copy/paste error, since it's the same text now wrongly attached to Curved Space.
3. **Terra Trilogy** (id 1210) — dossier describes "Terranigma" (SNES-exclusive, never released on PS4).
4. **The Complex** (id 1229) — dossier describes "Shadow Complex" (Xbox 360-exclusive Metroidvania).

All four were independently verified in the prior physical-release-legitimacy sweep to have their *own* confirmed-correct identity and physical-release status; only the dossier text is wrong.

### B) HIGH-SUSPICION — NEEDS MANUAL REVIEW
None. Both detection passes converged cleanly.

### C) FALSE POSITIVES / VERIFIED CORRECT
- **Tomb Raider** (id 2194) — flagged by the precision pass on a pronoun ("This"), verified correct.

---

## PHASE 3 — Stale Model-State Language

Every explicitly named title was checked against current live dossier text and current census structure:

| Title | Current state | Stale? |
|---|---|---|
| Lapis x Labyrinth / Lapis Re:Abyss | Merged; only id 690 "Lapis x Labyrinth" remains | Clean, but see Phase 3 note below on content thinning |
| Process of Elimination / Tantei Bokumetsu | Single entry (id 2407), dossier correctly documents the English rescue | Clean |
| Neptunia Riders VS Dogoos / Neptunia VS Titan Dogoo | Single entry (id 2661), dossier correctly documents the Western rescue | Clean |
| Sonic Mania / Sonic Mania Plus | Both remain distinct (per prior duplicate sweep's C) verdict — substantial added content) | Clean |
| Star Ocean: First Departure R | Still flags "confirm the PS4 physical release's region" — appropriately cautious language, not stale (shipment still hadn't been independently reconfirmed as of the last sweep) | Clean/appropriate |
| Lichtspeer | No change since last sweep | Clean |
| Lethal League | No change; correctly documents the LRG #126 physical rescue found in the physical-legitimacy sweep | Clean |
| Warhammer 40,000: Space Wolf | **Not in census at all** (see Phase 4 — flagged as a likely model defect, not a dossier issue) | N/A |
| World of Warships: Legends | No change | Clean |
| Apex Legends | No change | Clean |
| The Crew / Wild Run | Merged; only "The Crew" (id 1231) remains, dossier consistent with the dead-server/historical-keep status | Clean |
| Dying Light / The Following | Merged; only "Dying Light" (id 420) remains | Clean |
| Redout / Lightspeed Edition | Merged; only "Redout" (id 969) remains | Clean |
| Ys: Memories of Celceta / Kai | Merged; only the base title (id 1482) remains, dossier correctly says it's the Kai edition | Clean |
| Tokyo Twilight Ghost Hunters / Daybreak Special Gigs | Merged; only the base title (id 1764) remains, dossier correctly documents the Daybreak edition | Clean |
| Another World / 20th Anniversary Edition | Merged; only "Another World" (id 1992) remains | Clean |
| Attack on Titan 2 / Final Battle | Merged; only "...: Final Battle" (id 120) remains, dossier correctly frames itself as the expanded release | Clean |
| OlliOlli / OlliOlli2 / Epic Combo Edition | OlliOlli2 (id 2786) is now a real identity with a complete, accurate dossier; Epic Combo Edition is no longer its own identity | **Stale** — see below |

### Stale items requiring correction (cosmetic, not runtime-breaking)
1. **OlliOlli (id 1686)** — its `[b]` field still reads the generic pre-merge placeholder ("Count the qualifying playable PS4 physical release for this identity...") rather than describing the Epic Combo Edition relationship, even though OlliOlli2's dossier was correctly updated to say exactly that. **Runtime is unaffected** — `reverseProducts` confirms both "OlliOlli" and "OlliOlli2: Welcome to Olliwood" are correctly mapped to the "OlliOlli: Epic Combo Edition" product regardless of dossier text.
2. **Lapis x Labyrinth (id 690)** — the surviving dossier is the original *pre-merge* "Lapis x Labyrinth" text (short: one line per field, no publisher/date detail), not the richer "Lapis Re:Abyss" text that had been independently researched in the language-accessibility sweep (which explained the corpse-summoning/tower mechanic in more depth and cited NIS America 2019 specifically). It still passes the quality gate (`good`, score 100) and is factually accurate — just thinner than what existed before the merge discarded the other row's content.

---

## PHASE 4 — Post-Dedup / Orphan Dossier Audit

Built the complete set of valid resolution keys (every current item's own title plus every registered alias) and checked every key in the live `DOSSIERS` map against it. **18 orphaned dossier keys** found — entries that no census identity (INCLUDED or EXCLUDED) can currently reach. None of them cause runtime confusion: `dossierFor()` can never resolve to an orphaned key, since by definition nothing points to it.

| Group | Keys | Classification | Recommended action |
|---|---|---|---|
| Contamination source | `observation` | The likely literal source of the Curved Space wrong-game copy — genuinely useful forensic evidence, harmless on its own | Leave; delete only if/when the Curved Space fix is applied |
| Superseded by edition-suffixed rename | `kena bridge of spirits`, `nier automata game of the yorha edition`, `marvels guardians of the galaxy`, `cities skylines` | Old dossier rows from before the census title gained an edition/subtitle suffix (e.g. now "Kena: Bridge of Spirits [Deluxe Edition]"); the correct, currently-used entry is a separate, correctly-keyed row | Harmless dead weight; safe to leave |
| No corresponding census row at all | `f1 2015`, `f1 2016`, `f1 2017`, `f1 2018`, `f1 2019`, `f1 2020`, `f1 race stars`, `farming simulator 17`, `farming simulator 19`, `fe`, `ghost giant`, `dungreed`, `everybodys gone to the rapture` | These titles have **no item in the census at all** — not INCLUDED, not EXCLUDED, fully absent. This is outside pure dossier scope (it's a base-census-data question, not a dossier-text one) but is flagged here because it raises the same shape of question as the Warhammer 40,000: Space Wolf case below | Harmless as dossier artifacts; worth a separate look at whether these titles were ever supposed to be loadable census rows |

No override entries were found with multiple last-writer conflicts for the same key beyond the intentional last-writer-wins design already in place, and no stale dossier entries were found still describing genuinely canonical **EXCLUDED** identities in a way that would confuse a future audit.

### Related census-model observation (not a dossier defect, flagged per the task's "truly new model defect" carve-out)
**Warhammer 40,000: Space Wolf** — previously flagged HIGH-CONFIDENCE CUT in the language-accessibility sweep for having no confirmed physical release — is now **completely absent from the census `items` array**, not marked EXCLUDED. This is inconsistent with every one of its sibling titles from the exact same curation batch: Warhammer Quest, Warhammer Quest 2: The End Times, Aces of the Luftwaffe, and Assault Gunners HD Edition were all correctly converted to `set: "EXCLUDED"` and remain visible/auditable in the census. Space Wolf appears to have been fully deleted rather than excluded — a likely data-integrity inconsistency worth Josh's attention, not something this dossier-focused sweep can or should resolve on its own.

---

## PHASE 5 — Fact-Consistency Spot Check

Between the four prior sweeps this session (language accessibility, shovelware/low-value, live-service/preservation, duplicate-identity), roughly 60 INCLUDED identities across imports, limited-print releases, region-exclusive physicals, compilations, visual novels, live-service titles, PSVR-adjacent titles, rebrands, and enhanced editions were already directly fact-checked against external sources (publisher pages, Limited Run/Strictly Limited/eastasiasoft listings, retailer evidence). None of that prior verification work has been contradicted by anything found in this sweep.

To reach the minimum-50 bar with fresh sampling, 20 additional INCLUDED identities were randomly sampled this session and checked for title/genre/publisher consistency and physical-release plausibility (Steel Rats, Dreamfall Chapters, Risen, Steins;Gate 0, Rogue Stormers, Lemon Cake, Minoria, Guilty Gear Xrd -REVELATOR-, Atelier Lulua, Sega Genesis Classics, The Witch and the Hundred Knight 2, Star Wars Jedi: Fallen Order, VA-11 Hall-A, The Legend of Nayuta: Boundless Trails, Slain: Back from Hell, GunLord X, Xuan-Yuan Sword: The Gate of Firmament, Neverending Nightmares, Hand of Fate 2, Berserk and the Band of the Hawk). All 20 read as accurate and internally consistent — correct genre, correct developer/publisher, plausible and appropriately-hedged physical-release notes where region/edition specifics were genuinely uncertain (which is honest caveat language, not contamination).

Combined sample size across this session: **~80 identities** directly checked.

---

## FINAL OUTPUT

### A) FINAL COVERAGE STATUS
- Canonical INCLUDED: **2,456**
- good: **2,456** / thin: **0** / generic: **0** / missing: **0** / badSummary: **0**
- Alias-resolved count: **0**

### B) CONFIRMED DOSSIER ERRORS
See Phase 2 section A — 4 confirmed wrong-game dossiers (Vegas Party, Curved Space, Terra Trilogy, The Complex), all previously identified, all still unfixed, all high confidence with independently-verified correct identities on record from the prior physical-legitimacy sweep.

### C) STALE / OBSOLETE DOSSIER CLAIMS
See Phase 3 — 2 newly identified cosmetic issues (OlliOlli's stale `[b]` field; Lapis x Labyrinth's post-merge content thinning), both non-runtime-breaking. Plus two known pre-existing generic-template batches carried forward from the physical-legitimacy sweep: 19 identities with a fully generic Wikipedia-lead-sentence template (4 of which are the confirmed wrong-game cases above; the other 15 remain factually correct but low-value/generic), and 99 identities (down from 101 pre-dedup) with a generic `[b]`-field-only placeholder whose `[s]`/`[w]`/`[c]` fields generally contain real research.

### D) ORPHAN / DUPLICATE DOSSIER ARTIFACTS
18 orphaned dossier keys found, none causing runtime confusion — see Phase 4 table for full classification.

### E) VERIFIED CLEAN HIGH-RISK CASES
Every special-target case from the prompt resolves cleanly at the census/dossier level **except** Warhammer 40,000: Space Wolf (absent from census entirely — a model question, not a dossier one) and the two cosmetic staleness items above. All eight post-dedup merges (Lapis x Labyrinth, The Crew, Dying Light, Redout, Ys: Memories of Celceta, Tokyo Twilight Ghost Hunters, Another World, Attack on Titan 2) produced exactly one surviving, non-contaminated, quality-gate-passing dossier apiece, and OlliOlli/OlliOlli2/Epic Combo Edition's product-mapping is fully correct at runtime.

### F) FINAL VERDICT

> **DOSSIERS NOT DONE — material factual/runtime problems remain**

Reasoning: 4 currently-INCLUDED identities display dossier text describing a **different game entirely** — this is a material correctness problem regardless of how small the count is, since it directly misinforms Josh's curation decisions for those specific titles. Additionally, one likely census-model defect was discovered (Warhammer 40,000: Space Wolf's inconsistent full removal vs. its siblings' correct EXCLUDED status) that falls outside this sweep's mandate to fix but is material enough to block a clean "done" call.

- **Material corrections required:** 4 (wrong-game dossiers) + 1 census-model defect discovered (not a dossier text issue, but material and newly surfaced)
- **Cosmetic/stale corrections:** 2 directly identified this sweep (OlliOlli `[b]` field, Lapis x Labyrinth content thinning), plus the pre-existing 15-title generic-template and 99-title generic-`[b]`-field batches carried forward as known quality debt (not newly broken, not blocking correctness)
- **Harmless orphan artifacts:** 18
- **Census/model defect discovered:** Yes — Warhammer 40,000: Space Wolf fully absent rather than EXCLUDED; additionally 13 dossier-orphaned titles (F1 2015–2020, F1 Race Stars, Farming Simulator 17/19, Fe, Ghost Giant, Dungreed, Everybody's Gone to the Rapture) have no corresponding census row at all, raising the same shape of question

### Proposed minimal correction patch plan (NOT applied — reporting only, per instructions)
If Josh wants to proceed with fixes in a future pass, the minimal, highest-confidence patch would be:
1. Rewrite the `[s]`/`[w]`/`[c]`/`[r]`/`[b]`/`[p]` fields for the 4 confirmed wrong-game identities (Vegas Party, Curved Space, Terra Trilogy, The Complex) with genuine research about the correct game — the physical-legitimacy sweep already did this research for Vegas Party, Curved Space, and Terra Trilogy (confirmed physical releases for all three); The Complex's own physical status was left as a B) REVIEW item in that same sweep and would need one more verification pass first.
2. Optionally refresh OlliOlli's `[b]` field to mention the Epic Combo Edition relationship (cosmetic, zero runtime impact either way).
3. Optionally restore the richer pre-merge research into Lapis x Labyrinth's dossier (cosmetic content upgrade, current text is accurate just terse).
4. Separately, raise the Warhammer 40,000: Space Wolf census-status inconsistency with Josh directly — that's a census-membership question, not a dossier-content one, and outside what this sweep should resolve unilaterally.

No corrections were applied. Stopping here as instructed.
