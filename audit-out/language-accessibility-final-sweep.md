# ShelfCheck — Final Language Accessibility Sweep

**Type:** Analysis only. No census/curation/dossier/pricing/ownership/wishlist/UI files were modified.
**Baseline:** `main` @ `6e0ced7` ("Add personal Reject from Josh Set curation overlay")
**Runtime-observed INCLUDED baseline:** 2,464 identities
**Runtime-observed dossier coverage:** 2,464 good / 0 thin / 0 generic / 0 missing (complete)
**Method:** Loaded the live runtime census in a browser (same decompression/finalize pipeline the app itself uses), then scanned the *final effective dossier* (`dossierFor(x)`, last-override-wins) of every currently-INCLUDED identity for language-accessibility language, cross-referenced against prior curation passes, and independently re-verified the ambiguous/special-target cases via web research.

## Josh's clarified rule (as applied)

A CUT_CANDIDATE = qualifying physical PS4 release lacks English text/subtitles **AND** Japanese (or another unsupported language) is materially necessary for meaningful comprehension (story, objectives, menus, investigation, RPG systems, card/rules text, sim/management systems, dialogue choices). "Technically playable without understanding" is not sufficient on its own if the game has meaningful narrative Josh can't follow. Pure shmups/arcade/simple fighters/self-explanatory puzzle-action are **not** auto-cut.

---

## Summary numbers

| Metric | Value |
|---|---|
| Current INCLUDED baseline (runtime-observed) | **2,464** |
| Dossier language-hit identities examined (keyword scan + explicit special targets) | **37** |
| Already excluded by prior *language-specific* curation passes (`curation-josh-set-pass-v002` "language barrier" + `v003`/`v004` "language accessibility") | **42** (9 + 31 + 2) |
| NEW high-confidence CUT candidates from this sweep | **7** |
| REVIEW WITH JOSH candidates | **4** |
| Confirmed KEEP (resolved false positives / genuinely rescued / genre-exempt) | **26** |
| Projected INCLUDED count if all 7 HIGH-CONFIDENCE CUT candidates were rejected | **2,457** |

No exclusions were applied. This is a candidate list only, intended for Josh to action individually via the Reject-from-Josh-Set UI if he agrees.

---

## A) HIGH-CONFIDENCE CUT (7)

### 1. Ginsei Shogi: Aun Toushin Kongou Raizan — id 2381
- **Genre:** Traditional shogi (Japanese chess) simulation
- **Qualifying physical:** Japan, Silver Star Japan, catalog PLJM-80180 (May 25, 2017)
- **Supported language evidence:** Dossier: "entirely Japanese-language with no localization, so non-Japanese speakers will struggle with menus and shogi notation despite the game's universal rules."
- **Inaccessible:** Menus, difficulty-tier selection, shogi notation/move recording — core simulation systems
- **English physical exists?** No
- **Confidence:** High

### 2. Sengoku Basara: Sanada Yukimura-Den — id 2403 *(special re-review target)*
- **Genre:** Single-character narrative/drama musou spinoff
- **Qualifying physical:** Japan, Capcom, catalog PLJM-80149 (Aug 25, 2016); e-Capcom Limited Edition also Japanese-text-only
- **Supported language evidence:** Dossier: "Japanese-only release has no Western localization." Independently confirmed via web research: "Sanada Yukimura-den never received an international localization... the only language localization beyond Japanese was a Chinese PS4 edition."
- **Inaccessible:** The entire product's stated purpose — this is explicitly the series' *"first dedicated single-character drama focused entirely on Yukimura's story"* — story/narrative comprehension is the core value proposition, not a side mode
- **English physical exists?** No (confirmed no international localization anywhere; Chinese-only beyond Japanese)
- **Confidence:** High

### 3. Tantei Bokumetsu — id 2407
- **Genre:** Detective/mystery investigation adventure
- **Qualifying physical:** Japan, Nippon Ichi Software (May 27, 2021)
- **Supported language evidence:** Dossier: "The Japanese-only release has no official English localization, so full comprehension of its mystery plotting requires Japanese fluency."
- **Inaccessible:** Investigation/mystery clues, dual murderer/detective narrative — the entire gameplay loop
- **English physical exists?** No
- **Confidence:** High

### 4. Lapis Re:Abyss — id 2645
- **Genre:** Dungeon-crawler RPG (corpse-summoning party mechanic)
- **Qualifying physical:** Japan, Nippon Ichi Software (Nov 29, 2018)
- **Supported language evidence:** Dossier: "The Japan-only original release carries no official English localization, requiring fan patches or Japanese fluency to fully understand its story." (Fan patches are unofficial/non-qualifying.)
- **Inaccessible:** RPG story, presumably itemization/skill systems typical of the genre
- **English physical exists?** No official release; only unofficial fan patches (not a qualifying rescue)
- **Confidence:** High

### 5. Sengoku Basara 4: Sumeragi — id 2726
- **Genre:** Musou/hack-and-slash (expanded rerelease)
- **Qualifying physical:** Japan, Capcom (2015)
- **Supported language evidence:** Dossier: "Its Japan-only release with no official English localization limits it to players comfortable with untranslated Japanese text **and menus**."
- **Inaccessible:** Menus (explicitly named, not just flavor text) plus the added story content that distinguishes this "definitive" rerelease from the base game
- **English physical exists?** No
- **Confidence:** High

### 6. Kamen Rider: Battride War Creation — id 2630 *(special re-review target)*
- **Genre:** Musou-style mass-battle action, built on decades of Kamen Rider TV-series lore
- **Qualifying physical:** Japan, Bandai Namco (Dec 17, 2015)
- **Supported language evidence:** Dossier: "Japan-only release built around decades of Kamen Rider lore, it's largely inaccessible to players unfamiliar with the...franchise's history." Independently confirmed via web research: region-unlocked and playable on a Western PS4, but "all of the menus will be in Japanese" with no indication of an official English localization.
- **Inaccessible:** Menus (confirmed Japanese-only) and the mission/roster/objective context that is the entire premise of a Kamen-Rider-history mass-battle game
- **English physical exists?** No
- **Confidence:** High — moved here from a softer initial read after independent confirmation that menus specifically are Japanese-only, not just narrative flavor

### 7. Quintessential Quintuplets: Fives Memories With You — id 2696
- **Genre:** Licensed romance visual novel
- **Qualifying physical:** Japan, MAGES, catalog PLJM-17023 (2022)
- **Supported language evidence:** Dossier: "Its Western release was digital-only; the confirmed physical path runs through the earlier Japan-region disc under a related localized title" — no English text confirmed on that qualifying physical disc.
- **Inaccessible:** Entire visual-novel narrative/branching romance routes (the entire game)
- **English physical exists?** Not on the qualifying physical route. A Western release exists but is **digital-only**, which per Josh's rule #8 cannot be used to infer the qualifying physical build supports English.
- **Confidence:** High

---

## B) REVIEW WITH JOSH (4)

### 1. Blade Arcus Rebellion from Shining — id 2523
### 2. Blade Arcus from Shining EX — id 2524
- **Genre:** 2D anime fighting game (Shining RPG-series crossover), with a story mode
- **Qualifying physical:** Japan-only, region-free PS4 discs (Sega; EX Nov 2015, Rebellion Mar 2019)
- **Supported language evidence:** Both dossiers: "Japanese-only release has no official English localization, so full comprehension of its story [mode/content] requires Japanese fluency." Independently confirmed: the JP PS4 releases "never received official English localizations." A Western localization exists only as a **PC Steam** release ("Blade Arcus from Shining: Battle Arena") — a different platform/product, not a rescue for the PS4 physical per rule #8.
- **Why REVIEW not CUT:** Fighting-game combat itself (character-portrait select, arcade 1v1 battles) is genuinely playable without language per Josh's fighter exemption. Only the supplementary story mode is confirmed blocked. This is exactly the "action playable, narrative questionable" borderline case Josh's rule calls out — worth his personal call on whether the story-mode loss matters enough to cut a genre he explicitly exempted.
- **English physical exists?** No (PC-only Western localization, not PS4 physical)
- **Confidence:** Medium (genre exemption vs. blocked story-mode content genuinely in tension)

### 3. Tetsudou Nippon! Rosen Tabi: Eizan Densha-Hen — id 2408 *(special re-review target)*
- **Genre:** Real-world train-line driving simulation
- **Qualifying physical:** Japan, Sonic Powered, catalog PLJM-16754, region-free
- **Supported language evidence:** Dossier: "The disc is entirely in Japanese with no English localization, though the driving simulation itself requires little text comprehension to enjoy."
- **Why REVIEW not KEEP:** The dossier's own claim that "little text comprehension" is needed is plausible for the core driving loop (a single fixed real-world line), but menu/stop-selection/settings navigation is unverified — this is precisely the "simulation... menu comprehension questionable" case Josh's rule flags for explicit re-review rather than a blanket LANGUAGE_LIGHT pass.
- **English physical exists?** No
- **Confidence:** Medium — recommend Josh (or a follow-up research pass) verify the menu structure specifically before deciding

### 4. Neptunia VS Titan Dogoo — id 2661 *(special re-review target)*
- **Genre:** Vehicle-combat arcade spinoff of the Neptunia franchise
- **Qualifying physical (as currently dossiered):** Japan-exclusive Compile Heart Special Limited Edition disc
- **Supported language evidence:** Dossier itself flags: "The Japanese-only original release has no official English localization... a differently-named Western version followed later." Independent research confirms that Western version: **"Neptunia Riders VS Dogoos"** (Idea Factory International), released West Jan 28, 2025 for PS4/PS5/Switch, **with a physical Deluxe Edition**. No separate census identity for "Neptunia Riders VS Dogoos" currently exists — the census only has this one entry.
- **Why REVIEW not auto-KEEP:** The game content is clearly the same title under a Western name with a confirmed English physical release, which by rule #7 would normally rescue it outright. But the dossier's `b` (physical/coverage) field currently documents only the JP SKU, not the Western one — this looks like a dossier-accuracy gap rather than a genuine language-accessibility problem, and re-pointing which physical SKU "qualifies" this identity is a data-correction decision, not something this analysis-only sweep should resolve unilaterally.
- **English physical exists?** Yes — Idea Factory International's Western "Neptunia Riders VS Dogoos," physical Deluxe Edition confirmed.
- **Confidence:** Medium-High that this should ultimately be KEEP; flagged to Josh mainly so the dossier's physical-SKU reference gets corrected in a future pass rather than silently left pointing at the wrong (JP-only) release.

---

## C) KEEP (26) — resolved false positives, genuinely rescued, or genre-exempt

| id | title | Why KEEP |
|---|---|---|
| 314 | Date-A-Live: Rio Reincarnation | Dossier confirms English text/subtitles are present (Japanese audio only, no English dub — not a comprehension blocker) |
| 393 | Double Dragon & Kunio-kun Retro Brawler Bundle | Dossier states "localized versions of previously Japan-only titles"; also arcade-brawler genre exemption |
| 478 | Final Fantasy Type-0 HD | Global Square Enix day-one English release; "Japan-only" refers to the original PSP game, not this remaster |
| 510 | Fu'un Super Combo | Fighting-game genre exemption; no confirmed language-blocking caveat; Limited Run Games release |
| 714 | Lethal League | Western (Belgian) developer, English by default; "Japan-only" phrase describes an unrelated sequel/product, not this game (separately flagged for an unconfirmed-physical-release issue, not language) |
| 974 | Remothered: Tormented Fathers | Western (Italian) developer, English by default; "Japan-only" phrase describes a different bundle product |
| 1073 | Shining Resonance Refrain | Dossier confirms this is "an enhanced Western localization" — the English version |
| 1342 | Touhou Genso Rondo: Bullet Ballet | Dossier confirms NIS America localized North America/Europe release |
| 1359 | Trials of Mana | Global Square Enix day-one English release; "Japan-only" describes the 1995 SNES original |
| 1399 | Vasara Collection | Shmup genre exemption |
| 1517 | Like a Dragon: Ishin! | Global SEGA day-one English release (2023); "Japanese-only" phrase refers to the older, distinct PS3/PS4 original product |
| 1718 | SaGa: Scarlet Grace - Ambitions | Dossier confirms this is the "enhanced Western release" with English voice acting |
| 1978 | Rainbow Cotton | Confirmed Western release via Strictly Limited Games ("the game's first release outside Japan"); rail-shooter genre exemption |
| 2371 | Gintama Rumble | Dossier confirms a Southeast Asian **English-subtitled physical** edition exists for import (rule #7 rescue) |
| 2378 | Everyone Spelunker | Dossier confirms the disc "carries English, Japanese, Chinese, and Korean text support" |
| 2397 | Obduction | Dossier confirms the Japan-exclusive physical disc "plays in English" |
| 2399 | Puyo Puyo eSports | Puzzle genre exemption — competitive/tournament-focused, no story mode per its own dossier |
| 2452 | Rendering Ranger R2 Rewind | Western re-release (Ziggurat Games/Limited Run Games, 2025); shmup/run-and-gun genre exemption; no language caveat in dossier at all |
| 2471 | Get Star / Guardian *(special re-review target)* | 1986 arcade beat-'em-up bundled inside another disc; genre exemption, no meaningful narrative, no language caveat in dossier |
| 2538 | Bullet Girls Phantasia | Dossier + independent confirmation: Japan/Asia physical release has **selectable English subtitles** |
| 2607 | Hishou Same! Same! Same | Shmup genre exemption; own dossier frames untranslated menus as navigable via "shmup genre familiarity" |
| 2658 | Nayuta no Kiseki: Kai | Dossier confirms NIS America published this "as part of its ongoing Falcom localization program," bringing it "into the West" |
| 2703 | Radirgy 2 | Shmup genre exemption; own dossier states gameplay "requires little text comprehension" |
| 2754 | Venus Vacation Prism: Dead Or Alive Xtreme | Independently confirmed: Koei Tecmo's Asia PS4/PS5 release has a selectable **English text option** (import) |
| 2778 | Zero Fire: Toaplan Arcade Garage | Shmup genre exemption |
| 2785 | Made in Abyss: Binary Star Falling into Darkness | Dossier confirms full English dub and subtitle support; original keyword match was on a negated sentence ("no language barrier") |

---

## Notes / things Josh may want to separately consider (not part of this sweep's mandate)

- **id 2661 (Neptunia VS Titan Dogoo) / id 2403-style dossier-SKU accuracy:** Neptunia VS Titan Dogoo's dossier documents the wrong (Japan-only) physical SKU as "the" qualifying release when a Western physical release under a different title now exists. Worth a small dossier-correction pass later — out of scope here.
- **id 714 (Lethal League):** flagged in its own dossier as possibly digital-only (no confirmed physical PS4 release found) — a *physical-existence* curator-review item, unrelated to language. Not acted on here since it's outside this sweep's scope.
- Two prior curation passes (`v002` "language barrier": 9 titles, `v003`/`v004` "language accessibility": 31 + 2 titles = 42 total) already removed the bulk of Japanese-only text-dependent games under the *original*, looser rule. This sweep re-examined only what's left among currently-INCLUDED identities under the *clarified*, stricter rule — it does not re-litigate those 42 already-excluded titles.
