# ShelfCheck — Duplicate / Alternate-Title / Compilation-Overlap Sweep

**Type:** Analysis only. No census/curation/dossier/pricing/ownership/wishlist/Reject-state/UI files were modified.
**Baseline:** `main` @ `aeb8c4f`
**Runtime-observed canonical INCLUDED baseline:** 2,464 identities (before Josh's personal Reject overlay — untouched)
**Model rule applied:** ShelfCheck counts distinct **playable identities**, not every box/edition. Same game under an alternate regional/rebranded title, or a "same game + DLC" repackaging, should generally be one identity. True remakes, radically revised editions, and separate games bundled under one product may legitimately stay distinct.

## Method

Checked all explicit special targets directly, then ran two clustering passes over the 2,464 INCLUDED titles: a suffix-stripping pass (edition/remaster/collection words removed, titles grouped by stem) and a title-prefix pass (catches subtitle variants the suffix list missed). The suffix pass mostly returned legitimate numbered sequels (`Game` / `Game 2` / `Game II`), which were filtered out as obvious non-duplicates. Every remaining candidate pair/group was checked against its own final effective dossier text — and, where the dossier itself was silent or unhelpful, independently web-researched.

A secondary discovery: **101 identities share one generic, non-specific `[b]` (physical/coverage) field** ("Count the qualifying playable PS4 physical release for this identity. Verify region, disc contents, required peripherals, downloads and compilation coverage before purchase; packaging or bonus codes never create an extra identity.") — a placeholder disclaimer rather than real per-title research, spanning roughly ids 1579–1867. This is a dossier-quality defect (previously partially surfaced in the prior physical-legitimacy sweep as a *different* 19-title broken template), not itself evidence of duplication — most of the 101 titles have no duplicate sibling at all. It is noted here because a handful of the genuine duplicate candidates below happen to fall in this range, meaning their `[b]` field couldn't be used as evidence either way.

---

## Summary numbers

| Metric | Value |
|---|---|
| Canonical INCLUDED baseline | **2,464** |
| Suspicious pairs/groups reviewed | **~30** |
| HIGH-CONFIDENCE duplicate identities | **8** |
| REVIEW WITH JOSH | **6** |
| Verified-distinct rescues (looked suspicious, confirmed legitimately separate) | **11** |
| Compilation mapping issues found | **1** |
| Projected canonical count if all 8 section-A duplicates were merged/removed | **2,456** |

No exclusions applied. No Reject-overlay state read or changed.

---

## A) HIGH-CONFIDENCE DUPLICATES / SAME IDENTITY (8)

### 1. Lapis x Labyrinth (id 690) / Lapis Re Abyss (id 2645) *(special target)*
**Why same identity:** Confirmed via independent research: "Lapis Re:Abyss" is the Japanese title; "Lapis x Labyrinth" is the official international/Western title NIS America used for the *identical* release (not a sequel or remake — literally the same 2018 game, region-titled differently). The current dossier for id 2645 already says so explicitly: *"Lapis Re:Abyss and Lapis x Labyrinth are the same underlying playable identity."*
**Canonical title:** "Lapis x Labyrinth" (id 690) — it's the Western/English title, and the one with an unambiguous, well-documented NIS America physical release.
**Product mapping:** None needed to preserve; no compilation involved.
**Confidence:** High

### 2. Another World: 20th Anniversary Edition (id 78) / Another World (id 1992)
**Why same identity:** Both are Éric Chahi's 1991 classic. Id 1992's own `[s]` field literally begins: *"This 20th Anniversary Edition remasters Eric Chahi's cinematic sci-fi classic..."* — the "base" entry's dossier is describing the same anniversary release as id 78. There is no separate non-anniversary PS4 version to distinguish them.
**Canonical title:** "Another World" (id 1992) — has the more specific, confirmed physical evidence (Limited Run Games, region-free, 2,000 copies) already documented.
**Product mapping:** None.
**Confidence:** High

### 3. Attack on Titan 2 (id 119) / Attack on Titan 2: Final Battle (id 120)
**Why same identity:** Id 120's own dossier: *"Expanded re-release of Attack on Titan 2 bundling the base game with additional story content covering later anime seasons plus extra characters."* This is the textbook "same game + more content" case the model rule says should generally not be a separate identity.
**Canonical title:** "Attack on Titan 2: Final Battle" (id 120) — it's the superset; owning it also satisfies the base game.
**Product mapping:** None needed.
**Confidence:** High

### 4. The Crew (id 1231) / The Crew: Wild Run (id 1233)
**Why same identity:** Id 1233's own dossier: *"Expansion-inclusive edition of the original always-online racing MMO The Crew, adding motorcycles, monster trucks, and drift/drag racing disciplines to the cross-country USA map."* Same base game, same (now permanently dead) servers, same shutdown caveat repeated verbatim across both dossiers.
**Canonical title:** "The Crew" (id 1231) — matches Josh's own explicit prior instruction to keep "The Crew" specifically as the preserved historical identity.
**Product mapping:** None.
**Confidence:** High

### 5. Redout (id 969) / Redout: Lightspeed Edition (id 1703)
**Why same identity:** Id 969's own `[b]` field: *"released as the 'Lightspeed Edition' August 29, 2017... for PS4."* The "base" Redout entry's own physical-release record **is** the Lightspeed Edition release — there was no separate, earlier, non-Lightspeed PS4 disc to distinguish it from.
**Canonical title:** "Redout" (id 969) — shorter, matches the franchise's primary name.
**Product mapping:** None.
**Confidence:** High

### 6. Ys: Memories of Celceta (id 1482) / Ys: Memories of Celceta - Kai (id 1483)
**Why same identity:** Id 1482's own `[b]` field: *"Physical PS4 release exists as the enhanced Kai edition."* Same situation as Redout — the "base" entry's only qualifying PS4 physical release **is** the Kai edition (Kai = "revised," NIS America's PS4 port of the Vita original, upgraded to 60fps/HD).
**Canonical title:** "Ys: Memories of Celceta" (id 1482) — matches the mainline series naming convention.
**Product mapping:** None.
**Confidence:** High

### 7. Tokyo Twilight Ghost Hunters (id 1764) / Tokyo Twilight Ghost Hunters: Daybreak Special Gigs (id 1765)
**Why same identity:** Id 1764's own `[b]` field: *"Physical PS4 coverage is the Daybreak Special Gigs edition, published by NIS America and Aksys Games in 2016."* Identical pattern to the two cases above — the base identity's only physical route is the "special gigs" release.
**Canonical title:** "Tokyo Twilight Ghost Hunters" (id 1764) — the primary series title.
**Product mapping:** None.
**Confidence:** High

### 8. Dying Light (id 420) / Dying Light: The Following (id 421)
**Why same identity:** Id 420's own `[b]` field explicitly states: *"Multiple physical PS4 editions exist; **one core identity**, with content differences tracked at product level."* Id 421 is then separately described as an *"Expansion-inclusive edition of Techland's zombie parkour game, adding a large rural map... and a new story chapter beyond the ba[se game]"* — i.e., an edition of that same one core identity, contradicting its own separate census row.
**Canonical title:** "Dying Light" (id 420) — the base game's dossier already asserts itself as the single canonical identity.
**Product mapping:** None.
**Confidence:** Medium-High (The Following's rural map addition is substantial enough that this is the closest of the eight to a genuine judgment call — flagged high-confidence primarily because the base game's *own* dossier already disclaims multi-identity treatment.)

---

## B) REVIEW WITH JOSH (6)

1. **Nobunaga's Ambition: Sphere of Influence** (id 853) **/ - Ascension** (id 854). Ascension is described as *"An expanded version of Sphere of Influence: play from the officer level upward rather than only as a daimyo, with additional systems and scenario campaigns."* A genuinely different playable perspective (officer vs. daimyo) layered on the same base game — more substantial than a typical "+DLC" edition, but not a different setting or story.

2. **Root Letter** (id 1021) **/ Root Letter: Last Answer** (id 1022). The existing dossier for id 1022 *already flags this itself*: *"Edition/identity review: determine whether base and Last Answer truly count separately or are revision variants."* Last Answer is an *"expanded remake... offering both illustrated and live-action presentation plus revised scenarios"* — enough revision to plausibly qualify as a distinct remake, but genuinely close to the line.

3. **The Swords of Ditto** (id 1761) **/ The Swords of Ditto: Mormo's Curse** (id 1299). Id 1761's dossier says *"the enhanced Mormo's Curse edition is a separate product from this base release"* — but "separate product" (a packaging/SKU claim) isn't the same test as "separate playable identity." Genuine ambiguity about which the existing dossier author meant.

4. **Monster Hunter: World** (id 791) **/ - Iceborne** (id 792). Id 792's own dossier flags this as unresolved: *"Review whether this hunt-list identity means Master Edition/base+Iceborne package versus expansion-only entitlement; verify disc/download structure."* Iceborne ships both as a standalone "Master Edition" (self-contained) and as an expansion requiring the base game — which physical SKU this identity actually represents changes the answer.

5. **Earthlock: Festival of Magic** (id 430) **/ Earthlock** (id 1610). Independently confirmed via developer's own words (Snowcastle Games blog): after criticism of the original release, they *"released an expanded version of the game, now simply titled Earthlock... the changes were so big there was no way they could keep it compatible with existing save games"* and it *"feels in many ways like a new game."* This is a real, developer-acknowledged substantial rework, not a cosmetic rebrand — genuinely sits on the "radically revised edition" exemption line.

6. **Sonic Mania** (id 1107) **/ Sonic Mania Plus** (id 1108) *(special target)*. Plus adds two new playable characters (Mighty, Ray) with unique abilities, a new final zone, and an entirely new Encore Mode with remixed stages and a different character-switching mechanic. Comparable in scope to Persona 5 → Royal (see section C) — flagged here rather than resolved outright only because there is no existing dossier commentary either way and no app-level product mapping connects them.

---

## C) VERIFIED DISTINCT — DO NOT MERGE (11)

1. **Call of Duty: Modern Warfare** (id 221) **/ ...Remastered** (id 222) — the 2019 reboot (all-new campaign, engine, multiplayer) vs. a visual remaster of the 2007 original. Completely different games sharing a confusing franchise name.
2. **Tomb Raider** (id 2194) **/ Tomb Raider: Definitive Edition** (id 1339) — the 1996 original (via the Aspyr I-III Remastered compilation) vs. the 2013 reboot. Id 2194's own dossier: *"remains distinct from the 2013 reboot sharing its name."*
3. **Persona 5** (id 902) **/ Persona 5 Royal** (id 903) — Royal adds a full new semester (~30 hours), a new playable character, a new dungeon, and a substantially altered final act. This crosses well past "same game + DLC" into a materially different playable experience by any reasonable industry standard.
4. **Samurai Warriors 4** (id 1035) **/ 4 Empires** (id 1036) **/ 4-II** (id 1037) — Empires is the franchise's standard territory-management strategy spin-off (a different genre layer, sold alongside rather than replacing the base game, per its own dossier); 4-II is described as *"restructured around individual character story chapters, a new hub, and its own Infinite Castle challenge mode."*
5. **Space Hulk** (id 1112) **/ Space Hulk Ascension** (id 1113) — Ascension adds RPG-style squad progression and additional chapters, a genuine structural layer beyond the base tactical game.
6. **Romancing SaGa 2** (id 1715) **/ Romancing SaGa 2: Revenge of the Seven** (id 1524) — a full 3D remake (2024) vs. a remaster of the 1993 original. Id 1524's own dossier: *"the remake is distinct from the original Romancing SaGa 2 identity."*
7. **Train Sim World** (id 1350) **/ Train Sim World 2020** (id 1351) — annualized entries with distinct new routes/locomotives, following the same convention as other yearly simulation franchises already in the census. Id 1350's own dossier: *"distinct from later Train Sim World sequels."*
8. **Bus Simulator** (id 2542) **/ Bus Simulator 21** (id 2543) — same annualized pattern; 21 adds entirely new fictional cities (Angel Shores, Neubrandt) rather than reusing the base game's map.
9. **Guilty Gear** (id 560) **/ the Xrd sub-series** (ids 561–563) — id 560 is the 2014 20th-anniversary port of the *original* 1998 game; Xrd titles are a much later, mechanically and visually unrelated sub-series. No real overlap.
10. **Destroy All Humans!** (id 355) **/ Destroy All Humans! (2005)** (id 356) — intentionally disambiguated: the 2020 remake vs. the preserved original PS2-era release. Already correctly modeled as distinct by design (though id 356 carries its own unresolved physical-existence flag — a separate concern, not a duplicate-identity one).

---

## D) COMPILATION COVERAGE ISSUES (1)

### OlliOlli: Epic Combo Edition — id 862
Its own dossier confirms: *"Published by Badland Games... confirmed to include both OlliOlli and OlliOlli2: Welcome to Olliwood on disc."* This means Epic Combo Edition is a **two-game compilation product**, not a third distinct playable identity — but it is currently modeled as its own standalone INCLUDED census row rather than as a product mapped to constituent identities (the way `Yakuza Remastered Collection`, `Assassin's Creed: The Ezio Collection`, and `Heavy Rain & Beyond: Two Souls Collection` are all correctly modeled — see below). Compounding the problem: "OlliOlli" (id 1686) exists as its own identity but has **zero product coverage** (`reverseProducts` is empty for it), and there is **no separate "OlliOlli2: Welcome to Olliwood" identity in the census at all**. As it stands, Josh could own the Epic Combo Edition disc and the app would have no way to credit it toward "OlliOlli," and OlliOlli2 isn't tracked as a satisfiable identity in any form.

**Verified correctly wired (no issue, checked as part of this sweep's special targets):**
- **Yakuza Remastered Collection** (id 1315, correctly EXCLUDED as a product row) → covers Yakuza 3/4/5 Remastered via `reverseProducts`.
- **Assassin's Creed: The Ezio Collection** (id 105, correctly EXCLUDED as a product row) → covers Assassin's Creed II / Brotherhood / Revelations via `reverseProducts`.
- **Heavy Rain & Beyond: Two Souls Collection** (id 578, correctly EXCLUDED as a product row) → covers Heavy Rain / Beyond: Two Souls via `reverseProducts` (Heavy Rain and Beyond: Two Souls are additionally, and correctly, also covered by a second broader "Quantic Dream Collection" product).

---

## E) TITLE / DOSSIER CONTAMINATION

None newly discovered in this sweep. The four wrong-identity dossier cases already on record (Vegas Party, Curved Space, Terra Trilogy, The Complex) were found in the prior physical-release-legitimacy sweep (`audit-out/physical-release-legitimacy-final-sweep.md`) and are not duplicate-identity problems, so they are not re-listed here.

---

## Notes

- **Process of Elimination / Tantei Bokumetsu** *(special target)*: confirmed to be the same game (NIS America's official English title for the Japanese release), but the census only has **one** entry ("Tantei Bokumetsu," id 2407) — no duplicate exists. Its dossier already correctly documents the Process of Elimination English physical release. Worth flagging that this **corrects an earlier finding**: the prior language-accessibility sweep listed this identity as a HIGH-CONFIDENCE language CUT candidate before that correction was made; the dossier has since been updated (visible in current main) to reflect the English rescue.
- **Neptunia Riders VS Dogoos / Neptunia VS Titan Dogoo** *(special target)*: no duplicate — only "Neptunia VS Titan Dogoo" exists in the census, and its dossier already documents the Western "Riders VS Dogoos" release as the same identity (consistent with the prior language sweep's finding).
- The 101-title generic-`[b]`-field dossier batch (ids ~1579–1867) described in Method is a real, separate dossier-quality defect worth a future repair pass, distinct from the 19-title broken-template batch found in the physical-legitimacy sweep. Not acted on here since dossier content is out of scope for this sweep.
