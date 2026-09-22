# ShelfCheck — Final Shovelware / Low-Value Curation Sweep

**Type:** Analysis only. No census/curation/dossier/pricing/ownership/wishlist/Reject-state/UI files were modified.
**Baseline:** `main` @ `aeb8c4f` ("Merge pull request #101 from Blade1090/fix/language-dossier-rescues")
**Runtime-observed canonical INCLUDED baseline:** 2,464 identities (before Josh's personal Reject overlay — this sweep did not read or alter the Reject overlay)
**Bar applied:** "Would Josh reasonably be glad this exists in his curated physical PS4 set?" — not a review-score sweep. Niche/short/cheap/amateurish/simple/small-dev/import/janky are explicitly **not** cut reasons on their own.

## Method

Loaded the live runtime census (same decompression/finalize pipeline the app itself uses), scanned the *final effective dossier* (`dossierFor(x)`, last-override-wins) of all 2,464 currently-INCLUDED identities across three keyword passes (shovelware/trophy-bait/asset-flip language; broken/rushed/hollow/disposable language; a physical-existence "curator review" marker pass used only to separate out non-quality issues), then individually judged every hit against Josh's stated philosophy, with targeted web research where the dossier's tone seemed suspiciously at odds with a title's real-world reputation.

---

## Summary numbers

| Metric | Value |
|---|---|
| Canonical INCLUDED baseline observed | **2,464** |
| Identities scanned | **2,464** (all INCLUDED) |
| Raw suspicious keyword hits (deduplicated across passes) | **84** |
| HIGH-CONFIDENCE CUT candidates | **4** |
| REVIEW WITH JOSH candidates | **14** |
| Separate eligibility flags (not shovelware judgments) | **6** |
| Resolved KEEP (false positives / genuinely worthwhile despite rough edges) | **60** |
| Projected canonical count if all 4 HIGH-CONFIDENCE CUT were removed | **2,460** |

No exclusions applied. No Reject-overlay state read or changed. This is a candidate list only, for Josh's own Reject-from-Josh-Set decisions.

---

## A) HIGH-CONFIDENCE CUT (4)

### 1. Are You Smarter Than A 5th Grader — id 2487
- **Genre:** Couch co-op TV-game-show trivia (up to 8 players, 6,800+ questions)
- **What makes it low-value:** A pure licensed question-bank with no art style, mechanic, humor, or presentation hook of its own — just the show's quiz format reskinned.
- **Dossier evidence:** "Its shallow, question-and-answer gameplay loop offers little beyond party trivia sessions and has minimal long-term replay depth." Recommendation: "A fine party trivia pickup for family game nights, **nothing more**." No charm, uniqueness, or discovery value is claimed anywhere in the dossier.
- **External verification:** Not needed — dossier is internally conclusive and uncontested.
- **Redeeming hook:** None identified.
- **Confidence:** High

### 2. Carnival Games — id 2548
- **Genre:** Family minigame/midway-attraction compilation (basketball, ring toss, drone racing, bowling)
- **What makes it low-value:** Long-running, mass-produced, generic minigame-compilation template (this franchise has iterated near-identically across many prior console generations); no distinguishing mechanic, art direction, or personality cited.
- **Dossier evidence:** "Its shallow, repetitive minigame structure is designed for short casual sessions rather than sustained single-player engagement." Recommendation: "A decent pickup for family game nights, less compelling for solo players" — no unique hook stated.
- **External verification:** Not needed.
- **Redeeming hook:** None identified beyond generic "family game night" filler.
- **Confidence:** Medium-High

### 3. JoJo Siwa: Worldwide Party — id 2621
- **Genre:** Licensed influencer-brand Mario-Party-style board/minigame collection
- **What makes it low-value:** A YouTube-personality brand tie-in with a fully generic minigame-board structure and explicitly acknowledged narrow appeal.
- **Dossier evidence:** "Its shallow minigame variety and young-audience focus offer **little appeal or challenge for players outside its target kids demographic**." This is the strongest "genuinely disposable" language found in the whole scan for a licensed/kids title.
- **External verification:** Not needed.
- **Redeeming hook:** None identified — no nostalgia value (recent release), no distinct mechanic, no adult-collector discovery angle.
- **Confidence:** High

### 4. Rainbow High: Runway Rush — id 2708
- **Genre:** Toy-brand fashion/dress-up sim
- **What makes it low-value:** Pure toy-line tie-in built around a narrow dress-up loop with no gameplay depth or distinguishing hook.
- **Dossier evidence:** "Its shallow design mechanics and narrow fashion-focused gameplay loop are built **specifically for young fans of the franchise rather than general audiences**." No charm/uniqueness claim anywhere.
- **External verification:** Not needed.
- **Redeeming hook:** None identified.
- **Confidence:** High

---

## B) REVIEW WITH JOSH (14)

Borderline titles with a plausible reason to keep despite real low-value/shovelware concerns — final call left to Josh.

1. **Fast & Furious Crossroads** (id 467) — Licensed action-driving game, "widely panned... weak driving physics, poor level design, shallow overall production." A genuinely bad mid-budget game, but a real production (not shovelware) with a notable film license; only stated appeal is brand completionism.
2. **Ghostbusters (2016 tie-in)** (id 529) — Four-player co-op, "one of the more poorly reviewed licensed games of its era," but a real co-op production, not shovelware; only stated appeal is franchise/co-op completionism.
3. **New Gundam Breaker** (id 835) — Mixed-negative Gunpla-building arena action; "the series' own later entries were built specifically to fix this game's problems" — a real, if disappointing, execution of a genuinely appealing concept.
4. **Street Power Soccer** (id 1163) — Arcade street-football, "shallow overall content and a poor critical reception, with an ongoing soccer-curation question that remains unresolved" — dossier itself flags unresolved sports-curation ambiguity alongside the quality concern.
5. **Transformers Battlegrounds** (id 1352) — Kids-oriented tactics game; own dossier: "a cheap licensed-curiosity target, not one to prioritize" — thin value proposition but not explicitly broken.
6. **Is It Wrong To Try To Pick Up Girls In A Dungeon? – Infinite Combate** (id 1646) — Licensed anime dungeon-crawler; "shallow combat, repeated floors" and explicitly "anime shelf representation more than a gameplay recommendation" — narrow appeal tied entirely to prior franchise investment.
7. **Yum Yum Cookstar** (id 2442) — Cooking minigame collection; legally-distinct replacement for the notorious "Cooking Mama: Cookstar" controversy (confirmed via external research this is a different, non-malware-flagged product). Reviews call it "a bit of a hollow doughnut... something was missing," competent but shallow — not the infamous title it's easily confused with, but also no strong hook of its own.
8. **Bunny Park** (id 2540) — Original-IP rabbit-themed park builder for kids; "shallow management systems and repetitive objectives" — thin but at least an original (non-licensed) concept rather than derivative cash-in.
9. **Chicken Range** (id 2552) — Budget arcade shooting gallery; own dossier calls it "disposable" but also cites a "distinct premise and genuine physical release" as a mitigating factor.
10. **Inspector Gadget: Mad Time Party** (id 2614) — Licensed Mario-Party-style board game; generic structure, but built on a genuinely nostalgic 1980s cartoon property (more pedigree than the era-specific influencer/toy brands below).
11. **Gigantosaurus: Dino Kart** (id 2594) — Licensed kids kart racer; "simplified rubber-band AI and shallow mechanics... offering little challenge" — generic mascot-kart-racer template, but kart racers retain some inherent skill/replay value even at this tier.
12. **PAW Patrol Rescue Wheels: Championship** (id 2679) — Same category/reasoning as Gigantosaurus: Dino Kart.
13. **Rabbids: Party of Legends** (id 2701) — Minigame collection; generic structure, but the Rabbids brand carries real, established slapstick-comedy personality (Ubisoft's own IP since 2006) that partially satisfies Josh's "charm/humor" carve-out.
14. **3D MiniGolf** (id 10) — Budget mini-golf; "perfectly functional... nothing here stands out as a must-play over any other casual golf game" — the single clearest case of pure genericness with zero stated distinguishing feature, but "functional and harmless" isn't quite the same failure mode as the section-A titles.

---

## C) KEEP — false positives / weird but worthwhile (60)

Representative highlights (full scan list available on request — every title below was individually checked against its dossier text):

- **Explicitly framed by their own dossier as exactly Josh's taste despite roughness:** Corpse Killer: 25th Anniversary Edition (id 269, "exactly the kind of unbelievable physical release the Josh Set exists to preserve"), Deeeer Simulator (id 1599, "perfect one-evening weird-game energy"), Past Cure (id 894, "the exact ambitious-disaster rule in action"), Disaster Report 4 (id 370, "exactly the kind of flawed, unforgettable weird game the Josh Set should surface"), Bloodroots (id 188, "about as Josh-coded as a game gets"), Slide Stars (id 1090, "cultural-trash museum evidence of a very specific era of internet fame"), LEGO The Hobbit (id 711, "weird historical incompleteness... a genuine curiosity"), Balan Wonderworld (id 2283, notable misstep from Sonic/Nights co-creators), Jumanji: The Video Game (id 648, "ambitious-failure/licensed-weirdness"), Hentai Vs. Evil (id 2604, niche mature-content physical curiosity).
- **Major/acclaimed titles caught by generic "shallow"/"forgettable" phrasing about one sub-element (campaign, side content) rather than the whole game:** Battlefield 4, It Takes Two, Rain World, Patapon, RAGE 2, Trine 3, Mass Effect: Andromeda, LittleBigPlanet 3, Just Cause 3/4, Pathfinder: Kingmaker, Eiyuden Chronicle: Hundred Heroes, Cannon Dancer, Stealth Inc Ultimate Edition, Lost Sphear.
- **Licensed anime/mascot games with real production value, consistent with similarly-tiered titles already accepted elsewhere in the census:** My Hero One's Justice, One Piece: Burning Blood, Jujutsu Kaisen: Cursed Clash, Infinity Strash: Dragon Quest, Samurai Jack: Battle Through Time, Asterix & Obelix XXL 3, Fat Princess Adventures, Garfield Kart: Furious Racing, Crayola Scoot, Kung Fu Panda: Showdown of Legendary Legends, Harvest Moon: Mad Dash, Cartoon Network: Battle Crashers, Steven Universe: Save the Light, The Dark Crystal: Age of Resistance Tactics, Tokyo Ghoul: re Call to Exist.
- **Genuinely niche but not junk (real genre entries, no evidence of shovelware quality):** Anima: Gate of Memories, Dark Rose Valkyrie, Murdered: Soul Suspect, Star Ocean: Integrity and Faithlessness, Super Street: The Game, Ghost Blade HD, Rym 9000, Blade Runner: Enhanced Edition, Zero Tolerance Collection, Atari Mania, Jak X: Combat Racing, Mozart Requiem, Demetrios the Big Cynical Adventure, Lifeless Planet: Premier Edition, Hero Defense, Penguin Wars, Riverbond, Circuit Breakers.

---

## D) SEPARATE ELIGIBILITY FLAGS (6) — not shovelware judgments, do not belong in A

1. **Need for Speed (2015)** — id 825. Always-online-required (including single-player), no offline mode ever existed. Not yet shut down, but EA's documented pattern with sibling titles (Rivals lost servers Oct 2025) makes this a live-service **preservation risk**, not a quality judgment.
2. **The Crew** — id 1231. Servers **permanently shut down by Ubisoft March 31, 2024**; the game (including single-player) is now unplayable on any platform regardless of owning the disc. This is a dead-game eligibility question, not a shovelware one.
3. **The Crew: Wild Run** — id 1233. Same base game, same permanent server shutdown as above.
4. **Vegas Party** — id 1400. The dossier's `s`/`c`/`r` fields describe an entirely different game ("Party Hard," a stealth serial-killer game) rather than Vegas Party. This is a **wrong-identity / dossier-contamination** issue — the actual quality of "Vegas Party" cannot be assessed from this dossier at all, so no shovelware judgment can responsibly be made here.
5. **Roarr! Jurassic Edition** — id 1007. Dossier explicitly flags: "No confirmed physical PS4 retail SKU was found in targeted research despite the title's presence on this census; verify before treating as a physical pickup." A **NO_QUALIFYING_PHYSICAL**-style concern, separate from (and prior to) any quality judgment.
6. **Squareboy vs. Bullies: Arena Edition** — id 1126. Same pattern: "No confirmed physical PS4 retail SKU or Limited Run Games listing was found... only a digital eastasiasoft PlayStation Store listing turned up." Physical-existence question, not a quality one.

---

## Notes

- This sweep did not re-examine anything already canonically EXCLUDED, and did not touch or read Josh's personal Reject overlay state.
- Consistent with the brief's "prefer false negatives over false positives" instruction, the HIGH-CONFIDENCE list was kept intentionally small (4) — every title with *any* stated charm, hook, historical note, or explicit "this is Josh's taste" framing in its own dossier was kept out of section A, even when the dossier is also candid about real flaws.
- The 14 REVIEW WITH JOSH titles cluster into two recognizable groups worth deciding on as a batch if useful: (a) legitimately disappointing/mixed-reception mid-budget or licensed games with no charm hook stated (Fast & Furious Crossroads, Ghostbusters, New Gundam Breaker, Street Power Soccer, Transformers Battlegrounds, Is It Wrong To Pick Up Girls – Infinite Combate, Yum Yum Cookstar), and (b) generic mass-market kids/party-game templates with only marginal brand pedigree (Bunny Park, Chicken Range, Inspector Gadget: Mad Time Party, Gigantosaurus: Dino Kart, PAW Patrol Rescue Wheels: Championship, Rabbids: Party of Legends, 3D MiniGolf).
