# ShelfCheck — Live-Service / Dead-Disc / Preservation-Risk Sweep

**Type:** Analysis only. No census/curation/dossier/pricing/ownership/wishlist/Reject-state/UI files were modified.
**Baseline:** `main` @ `aeb8c4f`
**Runtime-observed canonical INCLUDED baseline:** 2,464 identities (before Josh's personal Reject overlay — this sweep did not read or alter it)
**Rule applied:** This is not an automatic dead-disc exclusion sweep. Per Josh's explicit instruction, *The Crew* stays despite being fully unplayable, because it's a major, notable release and the failure itself has museum value. The real test throughout: *"Is this dead/online-dependent physical release still interesting enough to deserve a place in Josh's curated PS4 set?"*

## Method

Scanned the final effective dossier of all 2,464 INCLUDED identities for online/server-dependency language (an initial broad pass produced 252 hits, almost all false positives from harmless "delisted digitally, physical unaffected" boilerplate used across the census; a narrowed regex targeting genuine always-online/server-shutdown/installer-disc language produced 54 real hits, individually reviewed below). Cross-checked the explicit special-target list, confirmed Overwatch/Battleborn/LawBreakers are already canonically EXCLUDED (out of scope, not re-litigated), and verified current server status for the two most date-sensitive cases (Anthem, Marvel's Avengers) via web research.

---

## Summary numbers

| Metric | Value |
|---|---|
| Current INCLUDED baseline | **2,464** |
| Total flagged (real hits, false positives excluded) | **54** |
| (a) Dead / nonfunctional today | **5** |
| (b) Still active but always-online | **~20** |
| (c) Code/installer-heavy physical | **2** (Apex Legends, World of Warships: Legends) |
| (d) Online-focused but real offline value remains | **~25** |
| HIGH-CONFIDENCE CUT | **4** |
| REVIEW WITH JOSH | **6** |
| KEEP — historically/collector significant | **19** |
| KEEP — functionally fine (false positives / real offline value) | **25** |
| Projected canonical count if all 4 HIGH-CONFIDENCE CUTs were removed | **2,460** |

No exclusions applied. No Reject-overlay state read or changed.

---

## A) HIGH-CONFIDENCE CUT (4)

### 1. Apex Legends — id 81
- **Physical edition:** Retail Bloodhound Edition / Lifeline Edition bundles (EA, Oct 18, 2019), each including 1,000 Apex Coins and character cosmetics.
- **Functional status:** (b) still active, free-to-play.
- **What the disc contains:** Per its own dossier: "the physical disc itself contains no exclusive standalone content beyond a cosmetics/currency bundle." The base game is free regardless of owning any disc.
- **What requires servers/codes:** The entire game — the disc is purely a code-redemption vehicle for a free download.
- **Why it lacks museum value:** The disc never contained a unique playable artifact to preserve; it's not a game that died, it's a retail shell that was always just packaging for digital entitlements. Apex Legends the *game* is culturally significant, but that significance lives entirely outside this physical product.
- **Confidence:** High

### 2. World of Warships: Legends — id 1450 *(special target)*
- **Physical edition:** Firepower Deluxe Edition (Wargaming/Gearbox), includes bonus premium-ship unlock codes.
- **Functional status:** (b)/(c) still active, always-online, free-to-play.
- **What the disc contains:** Per its own dossier, explicitly flagged CRITICAL: "the physical disc edition only provides an installer and bonus premium-ship unlock codes, not offline content."
- **What requires servers/codes:** The entire playable game; there is no offline or single-player mode of any kind.
- **Why it lacks museum value:** Identical structural problem to Apex Legends — a retail shell for a free live-service game, no unique disc-based content ever existed.
- **Confidence:** High

### 3. Dead Alliance — id 322
- **Physical edition:** Standard release (Maximum Games, 2018).
- **Functional status:** (a) dead today — "All online servers were shut down December 16, 2022... it is no longer playable as designed."
- **What the disc contains:** A multiplayer-only zombie-baiting PvP shooter with no substantial offline mode.
- **What requires servers/codes:** The entire core gameplay loop.
- **Why it lacks museum value:** Small, obscure title with no notable studio pedigree, franchise fame, or documented industry story — nothing distinguishes this as a preservation-worthy failure the way The Crew or Anthem are.
- **Confidence:** Medium-High

### 4. ArmaGallant: Decks of Destiny — id 92
- **Physical edition:** Standard PS4 release.
- **Functional status:** Uncertain/likely (a) — "there isn't a substantial single-player mode to fall back on," own dossier recommends "WAIT/SKIP... verify the servers/player base are still alive before buying."
- **What the disc contains:** An online-only 1v1/2v2 deckbuilding arena game with no meaningful solo content.
- **What requires servers/codes:** The entire playable game.
- **Why it lacks museum value:** Extremely obscure real-time-arena card game with no notable pedigree, coverage, or industry story to speak of.
- **Confidence:** Medium

---

## B) REVIEW WITH JOSH (6)

1. **Arcadegeddon** (id 88) — (b)/uncertain. Own dossier: "preservation and offline functionality deserve explicit verification before treating a copy as self-contained." Colorful roguelite shooter, genuinely uncertain current offline status — worth a direct check rather than a guess either way.
2. **Black Desert** (id 168) — (a) dead specifically on PS4: "Pearl Abyss ended all PS4 server support on June 26, 2025; the game can no longer be downloaded or played on PS4 in any form." A real, well-known MMORPG franchise, but this specific console port's death has less documented "industry story" weight than, say, The Crew or Anthem — borderline whether that's enough pedigree to justify a shelf-artifact-only keep.
3. **Hunt: Showdown** (id 608) — (b) still active, well-regarded extraction-shooter genre pioneer ("Cool as hell" per its own dossier), but online-only by design with genuinely weak physical-preservation value per its own caution. Real critical standing vs. thin offline substance — a judgment call.
4. **Predator: Hunting Grounds** (id 928) — (b) still active into 2026 with new DLC. Strong movie license fit, but modest reception and "solo offline value limited by design" — not obviously must-keep, not obviously disposable.
5. **Harry Potter: Quidditch Champions** (id 2599) — (b) still active, but a very recent (Nov 2024) multiplayer-only sports title with no offline mode and no track record yet either way. Too new to confidently call historically notable or disposable.
6. **Dragon Ball: The Breakers** (id 2781) — (b) still active, "single-player support is limited to a Tutorial Mode only, with no substantive offline campaign." A distinctive asymmetrical concept with real Dragon Ball license appeal, but the complete lack of offline fallback is a genuine concern worth Josh's own call.

---

## C) KEEP — HISTORICALLY / COLLECTOR SIGNIFICANT (19)

| id | title | Functional status | Why it stays |
|---|---|---|---|
| 1231 | The Crew *(special target)* | (a) dead — servers permanently shut down Mar 31, 2024, completely unplayable | Explicit Josh mandate: major, notable release; the dead-disc failure itself has museum value |
| 1233 | The Crew: Wild Run *(special target)* | (a) dead — shares The Crew's shutdown | Same franchise/mandate as above |
| 1232 | The Crew 2 | (b) still active, always-online by the same design that killed the original | Same franchise Josh has already decided to preserve; still currently playable |
| 79 | Anthem | (a) **now dead** — servers shut down January 12, 2026 (confirmed via research) | One of the most widely documented AAA live-service failures in gaming history; a genuine "infamous/important preservation case" |
| 1667 | Marvel's Avengers | (b)/(d) — support ended, offline campaign confirmed playable | One of the most notable, extensively covered live-service flops ever (reported ~$200M+ write-down); campaign remains playable |
| 450 | Evolve | (b)/(d) — servers are "the central preservation problem" | Famous, heavily marketed 2015 launch that became a widely cited industry cautionary tale about DLC/monetization backlash |
| 825 | Need for Speed (2015) *(special target)* | (b) still active, always-online including single-player, guaranteed eventual death per EA's own pattern (sibling title Rivals already lost servers Oct 2025) | Its own dossier frames it precisely right: "a fun artifact of a specific mid-2010s EA design mistake" |
| 460 | Fallout 76 | (b) still active, always-online | Major Bethesda franchise entry with one of the most infamous broken launches in AAA history, since substantially redeemed |
| 484 | Final Fantasy XIV Online: A Realm Reborn | (b) still active, subscription-required | One of the most successful MMOs ever made, with one of gaming's most famous turnaround stories (1.0 failure → 2.0 relaunch) |
| 1240 | The Elder Scrolls Online: Tamriel Unlimited | (b) still active | Massively successful, long-running MMO entry in a major franchise |
| 919 | PlayerUnknown's Battlegrounds | (b) still active, zero offline content at all | Genre-founding title — literally created the battle royale genre that now dominates gaming (Fortnite, Apex, etc. all descend from it); historical significance clearly outweighs the lack of offline value |
| 352 | Destiny | (b) still active (though largely superseded) | Major Bungie shooter-MMO hybrid, genre-defining |
| 353 | Destiny 2 | (b) still very active | Same franchise, ongoing major live game |
| 500 | For Honor | (b) always-online even for its own single-player campaign | Genuinely innovative melee combat system (directional-blocking "Art of Battle"), notable Ubisoft design experiment |
| 323 | Dead by Daylight | (b) still very active | One of the defining/most influential asymmetrical multiplayer horror games ever made |
| 1336 | Tom Clancy's Rainbow Six Siege: Advanced Edition | (b) still very active | Own dossier: "a genre-defining online shooter with real strategic depth" |
| 876 | ONRUSH | (a)/(d) — online services shut down, some features lost | Own dossier: "STRONG MUSEUM BUY. Weird mechanical experiment and ambitious commercial failure — exactly our shit" |
| 1621 | Friday the 13th: The Game | (a) dead — servers shut down Dec 31, 2024 after the underlying film license expired | Beloved cult horror license, and the story of the *license lawsuit that killed its updates and eventually its servers* is itself notable, well-documented industry history |
| 413 | Driveclub | (a)/(d) — online servers gone, single-player remains playable | Notable PS4-era racer; also the swan song of Evolution Studios before Sony closed the studio — a real industry story, and still has offline value |

---

## D) KEEP — FUNCTIONALLY FINE (25)

All of these were caught by the keyword scan but have real, substantial offline/standalone value and no meaningful preservation concern:

- **Fictional in-story "MMO" framing only (not actually online-dependent at all):** `.hack//G.U. Last Recode` (id 1), CrossCode (id 280), Cyberdimension Neptunia: 4 Goddesses Online (id 288), Sword Art Online Re: Hollow Fragment (id 1190), Sword Art Online: Fatal Bullet (id 1192), Sword Art Online: Hollow Realization (id 1193), Final Fantasy XII: The Zodiac Age (id 483, "MMO-influenced pacing" is a style note only), Kingdoms of Amalur: Re-Reckoning (id 672, "MMO-like quest volume" is a style note only), Noob: Les Sans-Factions (id 2429), Hitman 2 (id 590, legacy online-progression note doesn't affect current single-player play), Metro Redux (id 774), Samurai Shodown (id 1032, explicitly praised for having "none of the online-only baggage some fighters carry"), Pressure Overdrive (id 1695), Resident Evil: Revelations 2 (id 1704), Shadow of Loot Box (id 1723, a single-player satire *about* live-service trends, not one itself), 3D Billiards & Snooker (id 2069), Ghost Recon: Breakpoint (id 2592, "a substantial, content-rich open-world" single-player-capable shooter).
- **Online component degraded/dead but core single-player content explicitly confirmed intact:** Everybody's Golf (id 448, single-player rounds "remain fully playable offline"), Grand Kingdom (id 546, "offline single-player story and skirmish battles remain fully playable"), Killzone: Shadow Fall (id 662, campaign "remains fully playable offline"), Plants vs Zombies: Garden Warfare (id 916, "confirmed still fully active and playable on PS4 as of 2026"), Plants vs. Zombies: Battle for Neighborville (id 918, "split-screen couch co-op remains playable offline"), Dogfighter WW2 (id 2370, "offline modes playable" after its 2024 server shutdown), Battlefield V (id 146, full offline War Stories campaign), Tom Clancy's The Division 2 (id 1338, substantial solo-playable PvE campaign).

---

## Notes

- Overwatch, Battleborn, and LawBreakers (all named in the special-targets list) are already canonically **EXCLUDED** via `census-cleanup.js` and were confirmed as such rather than re-flagged.
- Babylon's Fall does not exist in the census (never added) — nothing to flag.
- Anthem's server shutdown (January 12, 2026) happened after the prior campaigns' dossier text was written, but the existing dossier's framing ("no meaningful live content left and never will be") already anticipated this outcome; no dossier correction is proposed here since this sweep is analysis-only.
- The `Apex Legends`/`World of Warships: Legends` pattern (physical edition = installer + codes, zero unique disc content, base game free regardless) is structurally distinct from `The Crew`/`Anthem`-style dead games (which *were* real standalone paid products with genuine single-player/campaign content that has since become inaccessible) — this distinction is why the former two are cut candidates despite real underlying game significance, while the latter are explicit keeps.
