# ShelfCheck — Physical Release Legitimacy / Existence Sweep

**Type:** Analysis only. No census/curation/dossier/pricing/ownership/wishlist/Reject-state/UI files were modified.
**Baseline:** `main` @ `aeb8c4f`
**Runtime-observed canonical INCLUDED baseline:** 2,464 identities (before Josh's personal Reject overlay — untouched)
**Test applied:** *"Can Josh actually own a legitimate PS4 physical product that meaningfully contains/satisfies this identity?"* Digital-only doesn't rescue a physical failure; code-in-box doesn't count as a qualifying physical game; imports and compilation coverage both count when genuine.

## Method

Scanned the final effective dossier of all 2,464 INCLUDED identities for physical-existence warning language (68 hits), fetched full dossier text for each, then individually web-researched every case where the dossier's own evidence was missing, contradictory, or itself unreliable — preferring publisher pages, Limited Run Games/Strictly Limited Games/eastasiasoft listings, retailer product pages (Amazon/GameStop/Walmart), and direct evidence of a shipped SKU over announcements or database noise. Cross-checked the app's own runtime product-mapping (`collectionInfo`) where compilation coverage was potentially relevant.

A significant discovery mid-sweep: **19 identities share one identical broken dossier template** — a raw Wikipedia-style plot summary paired with a content-free generic `"Curator Review"` boilerplate (`"The available overview offers limited evidence of historical, innovative, or representative importance."`) that carries **zero actual physical-release research** despite passing the dossier quality gate on word count alone. This is a dossier-quality defect, not evidence of a physical problem — but it meant 19 titles had to be independently researched from scratch rather than trusted at face value. Four of those 19 turned out to also be **wrong-identity** dossiers (the `[s]` field describes a completely different game).

---

## Summary numbers

| Metric | Value |
|---|---|
| Canonical INCLUDED baseline | **2,464** |
| Suspicious identities scanned (real hits, individually reviewed) | **68** |
| HIGH-CONFIDENCE no-qualifying-physical | **6** |
| REVIEW WITH JOSH / needs deeper verification | **4** |
| Verified-physical rescues (genuine uncertainty resolved to KEEP via this sweep's research) | **16** |
| Identity/title-match problems (not physical-existence failures) | **4** |
| Projected canonical count if all 6 section-A candidates were removed | **2,458** |

No exclusions applied. No Reject-overlay state read or changed.

---

## A) HIGH-CONFIDENCE NO QUALIFYING PHYSICAL (6)

### 1. Roarr! Jurassic Edition — id 1007
- **Why it's in the census:** Cartoonish dinosaur brawler, apparently added with an assumed physical SKU.
- **Physical evidence checked:** PlayStation Store (digital listing only), Limited Run Games, GameFAQs, PSPrices, general retail search.
- **Why it fails:** No physical PS4 listing found anywhere; only Nintendo Switch has a confirmed standalone retail page. The existing dossier already carried this exact CURATOR REVIEW flag; independent research confirms it.
- **Platform/region confusion:** Yes — Switch got a real physical release, PS4 did not.
- **Confidence:** High

### 2. Squareboy vs. Bullies: Arena Edition — id 1126
- **Why it's in the census:** Budget-tier pixel-art beat-'em-up, eastasiasoft-published.
- **Physical evidence checked:** eastasiasoft's own site, PlayStation Store, Play-Asia-adjacent listings, GG.deals, PSPrices.
- **Why it fails:** eastasiasoft does publish plenty of physical PS4 titles, but no listing — official or third-party — confirms one for this specific game. Only a digital PS Store page turned up.
- **Platform/region confusion:** None identified.
- **Confidence:** Medium-High

### 3. Warhammer 40,000: Space Wolf — id 1414
- **Why it's in the census:** Mobile-originated freemium tactics game ported to PS4.
- **Physical evidence checked:** Already exhaustively researched in a prior campaign (retail search + PriceCharting) with no listing or price data found on any platform.
- **Why it fails:** Confirmed digital-only; no physical SKU exists to check.
- **Platform/region confusion:** None.
- **Confidence:** High (previously established, re-confirmed)

### 4. Gunman Clive HD Collection — id 566
- **Why it's in the census:** HD compilation of the Gunman Clive duology, released across many platforms.
- **Physical evidence checked:** Push Square, GameFAQs, PlayStation Store, GG.deals, PSPrices.
- **Why it fails:** Confirmed digital-only on PS4 (May 22, 2020); other platforms (Wii U, Switch) received the collection, but no PS4 disc exists.
- **Platform/region confusion:** Yes — Switch/Wii U physical existence is what's likely causing the census pollution.
- **Confidence:** High

### 5. Project Nimbus: Complete Edition — id 935
- **Why it's in the census:** Mecha flight-combat action game, GameTomo/GameCrafter co-development.
- **Physical evidence checked:** GameFAQs, PlayStation Store (multiple sub-edition listings: Complete Edition, Rise Mirai, Code Mirai), NookGaming review, Steam.
- **Why it fails:** All PS4-side listings (including the individually-split "Rise Mirai"/"Code Mirai" editions) are digital-only. Only the Nintendo Switch version received a physical "Complete Edition." The app has no product-mapping connecting this identity to any compilation, so nothing currently rescues it.
- **Platform/region confusion:** Yes — Switch got physical, PS4 did not.
- **Confidence:** High

### 6. DOOM 64 — id 390
- **Why it's in the census:** Classic 1997 shooter, resurfaced as a 2020 DOOM Eternal pre-order bonus.
- **Physical evidence checked:** Bethesda's own pre-order bonus announcement, ScreenRant, Push Square coverage of the 2024 "DOOM Anthology" physical bundle.
- **Why it fails:** DOOM 64's only PS4 presence anywhere is (a) a free **digital** pre-order bonus for DOOM Eternal with no disc component, or (b) bundled inside the physical "DOOM Anthology," which itself is explicitly confirmed to ship as **keycodes only, no disc at all**. There is no disc-based route to this identity on PS4 in any form, standalone or compilation. The app has no product-mapping connecting this identity to anything.
- **Platform/region confusion:** None — this is a pure code-only-existence failure.
- **Confidence:** High

---

## B) REVIEW WITH JOSH / NEEDS DEEPER VERIFICATION (4)

### 1. Lichtspeer — id 716
Dossier already flagged "no confirmed physical PS4 release... treat as likely digital-only." Independent research found a "Lichtspeer: Double Speer Edition" PS Store listing and a vague reference to "a disk version available to buy on Amazon," but nothing confirming an official, first-party physical PS4 SKU for the base game. Genuinely inconclusive either way — worth a more targeted follow-up (direct Amazon listing inspection) rather than a guess.

### 2. Star Ocean: First Departure R — id 1127
A **real, credible physical release was announced** by Square Enix/Limited Run Games in September 2025 (Standard/Steelbook/Ultimate editions), with pre-orders closing October 26, 2025. Given today's date context (~September 2026), LRG's strong fulfillment track record makes it very likely this has since shipped — but every source found dates to the announcement/pre-order period, and none directly confirms shipment. Per this sweep's instruction to prefer verified-shipped evidence over announcements, this is flagged for a direct shipment check rather than assumed complete.

### 3. Sonic Mania — id 1107
The dossier explicitly states "**NO** standalone physical PS4 disc exists for base Sonic Mania... confirm coverage instead through Sonic Mania Plus." Independent research surfaced a 2019 SEGAbits headline — "Original version of Sonic Mania to receive physical release" — that appears to **contradict** this claim. Additionally, the app's own runtime product-mapping currently has **no compilation link** between "Sonic Mania" (id 1107) and "Sonic Mania Plus" (id 1108, also INCLUDED) — so even the dossier's own suggested fallback isn't actually wired up today. This needs either (a) confirmation that a genuine standalone disc exists, or (b) a product-mapping fix connecting the two identities, neither of which this analysis-only sweep can resolve.

### 4. The Complex — id 1229 *(see also section D — this identity's dossier is also wrong-identity contaminated)*
Once the dossier's mismatched "Shadow Complex" (Xbox 360 Metroidvania) content is set aside, the *actual* census-relevant game is almost certainly Wales Interactive's 2020 FMV thriller "The Complex." Research on that correct title found only PlayStation Store digital listings (including bundling into "The MEGA FMV Bundle" and "The Ultimate FMV Bundle" digital compilations) — no standalone physical PS4 release was confirmed for it either. This identity may have *two* separate problems (wrong dossier **and** genuinely no physical release for the correct game) and needs its own dedicated look.

---

## C) KEEP — VERIFIED PHYSICAL (16 rescued + 4 already-obvious)

Cases where the dossier gave no usable evidence (or, for four of them, actively wrong-identity evidence) and this sweep's independent research confirmed a real shipped physical product:

| id | title | Physical product | Region/publisher | Shipped evidence |
|---|---|---|---|---|
| 625 | Infinifactory | Standard retail disc | Alliance Digital Media, NA, Mar 2017 | Dualshockers coverage, Amazon/eBay listings |
| 819 | Narita Boy | Limited Run #436, Standard + Collector's Edition | LRG, region-free | LRG product pages, Amazon listing |
| 920 | Pocky & Rocky Reshrined | Standard (1,500 copies) + Collector's (1,000 copies) | Strictly Limited Games (EU) / Gamesrocket (NA) | SLG product page, Destructoid coverage |
| 958 | Rainbow Billy: The Curse of the Leviathan | Standard retail disc | Skybound Games | GameStop product listing |
| 468 | Fast Striker | Limited edition (2,200 copies) | eastasiasoft / Play-Asia | PlayStation Blog announcement, Play-Asia listing |
| 507 | Freedom Finger | Limited Run #378 (2,000 copies) | LRG, region-free | LRG/Twitter announcement, retailer listings |
| 734 | Lumo | Standard retail disc | Rising Star Games | Dualshockers, Amazon, Walmart listings |
| 1333 | Tokyo Chronos | Limited Run #303 (1,500 copies), PSVR | LRG, region-free | LRG product page, Amazon listing (PSVR compatible/not required for VN, though itself PSVR-focused — flagged only informationally, out of this sweep's scope) |
| 1433 | White Day: A Labyrinth Named School | Standard retail disc | PQube (NA/EU) | GameStop, Walmart listings, PQube's own release announcement |
| 1430 | We Sing | Standard retail disc / mic bundle | THQ Nordic / Wired Productions | Amazon listing |
| 714 | Lethal League | Limited Run #126 (3,000 copies) | LRG, region-free | Amazon, eBay, Best Buy listings — directly contradicts the dossier's own "unconfirmed" caveat |
| 1079 | Skelattack | Limited Run #499 + Classic Edition | LRG, region-free | Amazon listing (real ASIN, not pre-order), eBay "NEW Sealed" listings |
| 818 | Narcosis | Limited Run #179 (2,800 copies) | LRG, region-free, PSVR **not** required | LRG product page, Amazon listing |
| 921 | Polybius | Limited Run #307 (2,500 copies) | LRG, region-free, VR compatible **but not required** | LRG product page, Amazon listing |
| 287 | Curved Space *(dossier is wrong-identity — see section D)* | Standard retail disc | Maximum Games | Amazon listings (two separate product pages) |
| 1210 | Terra Trilogy *(dossier is wrong-identity — see section D)* | Standard retail disc | Funbox Media, Apr 2021 | GameStop, Amazon, Walmart listings |

Four more titles in the broken-template batch (**Cuphead [Limited Edition]** id 285, **Kena: Bridge of Spirits [Deluxe Edition]** id 656, **NieR Replicant ver.1.22...** id 841, **Stray** id 1158) needed no external verification — all four are major, extremely well-known releases with unambiguous physical editions. Their dossiers are equally content-free and should eventually be repaired, but there is no genuine physical-existence question for any of them.

---

## D) IDENTITY / TITLE-MATCH PROBLEMS (4)

These are dossier-contamination failures, **not** physical-existence failures — the census identity itself is fine (or its physical status is a separate open question tracked in section B), but the dossier text describes a different game entirely.

1. **Vegas Party** — id 1400. Dossier `[s]`/`[w]`/`[c]` describe **"Party Hard"** (a Pinokl Games/tinyBuild stealth game about a serial killer), not Vegas Party. The real Vegas Party is a Funbox Media party-minigame collection, released physically June 22, 2018 — **confirmed physical** (Walmart, Amazon, eBay, Base.com listings).
2. **Curved Space** — id 287. Dossier describes **"Observation"** (No Code/Devolver Digital's sci-fi station-AI adventure), not Curved Space. The real Curved Space (Only By Midnight/Maximum Games twin-stick shooter) is **confirmed physical** — see section C.
3. **Terra Trilogy** — id 1210. Dossier describes **"Terranigma"** (a 1995 SNES-exclusive action RPG that was never released on any PlayStation platform), not Terra Trilogy. The real Terra Trilogy (Funbox Media's Terra Lander/Terra Lander II/Terra Bomber compilation) is **confirmed physical** — see section C.
4. **The Complex** — id 1229. Dossier describes **"Shadow Complex"** (Chair Entertainment's 2009 Xbox 360-exclusive Metroidvania, never on PS4 at all), not The Complex. The real identity is almost certainly Wales Interactive's FMV thriller "The Complex" — but that title's own physical status is itself unconfirmed; see section B.

**Broader note:** all four of these came from the same 19-title broken generic-template dossier batch described in Method above. The other 15 titles in that batch have correctly-matched `[s]` fields (just useless `[w]`/`[c]`/`[r]` content) and were separately verified for physical existence in section C. This whole 19-title batch is a dossier-quality defect worth a dedicated repair pass — flagged here for awareness, not acted on, since dossier content is out of scope for this sweep.

---

## E) CODE-IN-BOX / INSTALLER / PHYSICAL-ARTIFACT EDGE CASES

1. **Apex Legends** — id 81 *(special target)*. Physical Bloodhound/Lifeline Edition bundles genuinely exist and shipped, but per the dossier's own words: "the physical disc itself contains no exclusive standalone content beyond a cosmetics/currency bundle." The base game is free regardless of the disc. Physical existence is real, but it's a pure code-redemption product — this is a *value/qualifying-artifact* judgment (already surfaced in the prior live-service sweep as a HIGH-CONFIDENCE CUT candidate there), not a "does it exist" failure, so it is not re-listed in section A here.
2. **World of Warships: Legends** — id 1450 *(special target)*. Same pattern: the Firepower Deluxe Edition physical box genuinely exists and shipped, but its own dossier is explicit that "the physical disc edition only provides an installer and bonus premium-ship unlock codes, not offline content." Real product, no unique disc-based game content — already flagged in the prior live-service sweep, not re-listed here.
3. **DOOM 64** — id 390. Cross-referenced from section A: unlike Apex/WoWS, this one has **no dedicated physical product of its own at all** — its only physical-adjacent existence is as a bundled, disc-less keycode inside a larger anthology product. This is more severe than Apex/WoWS (which at least have their own genuine boxed SKUs) and is why it was placed in section A rather than here.
4. **Penguin Wars** (id 900), **Iris.Fall** (id 632), **Steins;Gate Elite** (id 1147) — each of these has a **real, on-disc, qualifying game**, with an *additional* bonus download code/voucher for supplementary content (a soundtrack, in each case). This is normal industry practice, not a code-in-box substitute for the game itself — noted here only to confirm they were checked and do **not** qualify as edge cases.

---

## Notes

- Overwatch/Battleborn/LawBreakers and the other titles already resolved in prior sweeps (World End Syndrome's EU-only physical, Earth Defense Force 5's import-only physical, etc.) were not re-litigated here since their physical-existence status was already independently confirmed in earlier work.
- The 19-title broken generic dossier template is a real, contained defect (confirmed via exact-string search — exactly 19 hits census-wide) and is flagged for a future dossier-repair pass; this sweep did not touch dossier content.
