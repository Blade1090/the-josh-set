# Curator questions: GameStop discovery work

Open decisions for Josh. Nothing listed here has been added to or removed from the census; each item needs a curator call. Generated 2026-11-09 from `audit-out/gamestop-discovery-review-queue.json`, `audit-out/BATCH_06_research.json` and `audit-out/gamestop-catalog-reconciliation.json`.

## 1. Horse-game rule consistency

Curation pass #1 (`curation-josh-set-pass-v001.js`) excludes horse-focused games under a documented HORSE_GAME personal-preference rule: Windstorm (2440), Windstorm: An Unexpected Arrival (2441), Bibi & Tina at the horse farm (160), Barbie: Horse Trails (2512) and others. These stay EXCLUDED as instructed.

The four GameStop horse titles were kept INCLUDED as instructed: Horse Tales Emerald Valley Ranch (2894), Horse Club Adventures (2971), Horse Club Adventures 2: Hazelwood (3016), DreamWorks Spirit Lucky's Big Adventure (3041).

**Question:** should the pass #1 HORSE_GAME exclusions stand while these four are INCLUDED, or should one rule apply to both groups? GameStop also lists Windstorm: Start of a Great Friendship, which maps to the excluded 2440.

## 2. Compilations: identity or product?

CLAUDE.md requires a curator decision for compilation modeling. Each row has a recommendation; none were added.

| GameStop listing | Recommendation |
|---|---|
| Minecraft Starter Collection | Product of existing 782 Minecraft: PlayStation 4 Edition plus content packs; no new identity. |
| Star Wars Jedi Knight Collection | Product covering existing 1133 Jedi Outcast + 1134 Jedi Academy; add a DATA.p product row. |
| Dishonored and Prey: The Arkane Collection | Product covering existing 374 Dishonored 2 + 929 Prey; add a DATA.p product row. |
| Wolfenstein Collection | Product covering existing Wolfenstein identities (1440/1442/1443); confirm contents before mapping. |
| Disney Classic Games Collection | Expanded re-release of existing 376 Disney Classic Games: Aladdin and the Lion King (adds The Jungle Book); curator: same identity or product. |
| Persona: Endless Night Collection | Product covering 901 Persona 3: Dancing in Moonlight, 2916 Persona 5: Dancing in Starlight and Persona 4: Dancing All Night (not in census). |
| Overcooked! All You Can Eat | Remastered compilation of existing 2227 Overcooked! + 885 Overcooked! 2 (1688 product is EXCLUDED); curator: product row or new identity. |
| Nexomon Plus Nexomon Extinction Complete Collection | Covers existing 836 Nexomon: Extinction plus Nexomon (not in census; no standalone PS4 disc found). |
| Hasbro Family Fun Pack | Multi-game Hasbro pack (with a Conquest Edition variant); distinct from 789 Monopoly: Family Fun Pack; curator: identity modeling. |
| Mass Effect Legendary Edition | Only physical PS4 path for the remastered trilogy; curator: one identity (precedent: collection identities such as Kingdom Hearts HD I.5 + II.5 Remix) or three. |
| Grand Theft Auto: Trilogy - The Definitive Edition | Only physical PS4 path for GTA III / Vice City / San Andreas DE; curator: one identity or three. |
| Teenage Mutant Ninja Turtles: The Cowabunga Collection | Single-disc retro collection; precedent Mega Man Legacy Collection (753) suggests one identity. |
| Mega Man Battle Network Legacy Collection | Single-disc collection; precedent Mega Man Legacy Collection (753) suggests one identity. |
| Sonic Origins Plus | Single-disc retro collection; one identity likely. |
| Capcom Fighting Collection | Single-disc fighting collection; one identity likely. |
| Capcom Fighting Collection 2 | Single-disc fighting collection; one identity likely. |
| Marvel vs. Capcom Fighting Collection: Arcade Classics | Single-disc fighting collection; one identity likely. |
| FINAL FANTASY I-VI COLLECTION ANNIVERSARY EDITION | Six Pixel Remasters on one physical release; curator: one identity or six. |
| Crysis Remastered Trilogy | Only physical PS4 path for the three remasters; curator: one identity or three. |
| Halloween and Ash vs Evil Dead RetroRealms Double Feature | Two distinct games on one disc; curator: two identities plus a product row. |
| Dark Thrones and Witch Hunter Double Pack | Two distinct games on one disc; curator: two identities plus a product row. |
| Atari Flashback Classics Volume 2 | Precedent 111 Atari Flashback Classics: Volume 1 suggests one identity. |
| Atari Flashback Classics Vol 3 | Precedent 111 Volume 1 suggests one identity. |
| Marvel Pinball: Epic Collection Volume 1 | Single-disc pinball table collection; one identity likely. |
| Psikyo Shooting Library Vol. 1 | Multi-shooter collection; one identity likely. |
| Psikyo Shooting Library Vol. 2 | Multi-shooter collection; one identity likely. |
| KEMCO RPG Selection Vol. 2 | Multi-RPG collection; curator: identity modeling. |
| Train Valley Collection | Train Valley 1 + 2 collection; curator: identity modeling. |
| The Sims 4 Plus Eco Lifestyle Bundle | Base game plus DLC bundle; maps to The Sims 4 base identity, not a new one. |
| Fishing Sim World | Same game as research 2914 Fishing Sim World: Pro Tour (already in the curator review queue). |

## 3. Batch 06 candidates needing review

| Listing | Decision | Reason |
|---|---|---|
| Super Mega Baseball 4 | CURATOR_REVIEW | Physical PS4 disc confirmed (PriceCharting UPC 014633383638, EA Sports, 2023-06-02), but Super Mega Baseball is a numbered sports series; the annual/serialized sports rule needs a curator call. |
| World of Simulators | CURATOR_REVIEW | Physical PS4 disc exists (UIG Entertainment, UPC 819759021675), but it appears to be a multi-simulator compilation; identities covered need product mapping. |
| Doctor Who: The Edge of Reality and The Lonely Assassins | CURATOR_REVIEW | Physical PAL PS4 Doctor Who: Duo Bundle exists. Whether The Edge of Reality (flat rework of the PSVR-only The Edge of Time, census 382 EXCLUDED) is a separate identity, and how The Lonely Assassins maps, is a curator decision. |
| Touhou Double Focus | UNCERTAIN_NEEDS_REVIEW | No PS4 product found on PriceCharting; physical PS4 release unverified. |
| Prince of Persia: The Sands of Time Remake | UNCERTAIN_NEEDS_REVIEW | No PS4 product on PriceCharting; the GameStop listing may be a placeholder. Physical PS4 release unverified. |

## 4. Batch 01-05 candidates not added

49 rows: UNCERTAIN_NEEDS_REVIEW 42, COLLECTION_OR_MULTI_GAME_PACK 2, SAME_GAME_SUSPECTED 5.

| ID | Title | Decision | Same game as |
|---|---|---|---|
| 2803 | God of Rock | UNCERTAIN_NEEDS_REVIEW |  |
| 2805 | The Elf on the Shelf: Christmas Heroes | UNCERTAIN_NEEDS_REVIEW |  |
| 2809 | The Karate Kid: Street Rumble | UNCERTAIN_NEEDS_REVIEW |  |
| 2831 | The Walking Dead: Destinies | UNCERTAIN_NEEDS_REVIEW |  |
| 2838 | Hunting Simulator 2 | UNCERTAIN_NEEDS_REVIEW |  |
| 2839 | DiRT Rally 2.0 | UNCERTAIN_NEEDS_REVIEW |  |
| 2841 | Monster Jam: Steel Titans | UNCERTAIN_NEEDS_REVIEW |  |
| 2851 | Hot Wheels Unleashed 2: Turbocharged | UNCERTAIN_NEEDS_REVIEW |  |
| 2855 | MX vs. ATV All Out | UNCERTAIN_NEEDS_REVIEW |  |
| 2861 | Subnautica: Below Zero | UNCERTAIN_NEEDS_REVIEW |  |
| 2862 | The Addams Family: Mansion Mayhem | UNCERTAIN_NEEDS_REVIEW |  |
| 2863 | DiRT Rally | UNCERTAIN_NEEDS_REVIEW |  |
| 2864 | Farming Simulator 19 | UNCERTAIN_NEEDS_REVIEW |  |
| 2867 | Evil Dead: The Game | UNCERTAIN_NEEDS_REVIEW |  |
| 2868 | Crash Team Rumble | UNCERTAIN_NEEDS_REVIEW |  |
| 2870 | Pac-Man Museum Plus | COLLECTION_OR_MULTI_GAME_PACK |  |
| 2873 | Nickelodeon Kart Racers 3: Slime Speedway | UNCERTAIN_NEEDS_REVIEW |  |
| 2875 | Hot Wheels Monster Trucks: Stunt Mayhem | UNCERTAIN_NEEDS_REVIEW |  |
| 2879 | Dungeons and Dragons Dark Alliance | UNCERTAIN_NEEDS_REVIEW |  |
| 2882 | Duck Dynasty | UNCERTAIN_NEEDS_REVIEW |  |
| 2883 | Destroy All Humans! 2: Reprobed | SAME_GAME_SUSPECTED | Destroy All Humans! 2 (census ID 357) |
| 2889 | Super Bomberman R 2 | UNCERTAIN_NEEDS_REVIEW |  |
| 2890 | Grid Legends | UNCERTAIN_NEEDS_REVIEW |  |
| 2892 | TMNT Arcade: Wrath of the Mutants | SAME_GAME_SUSPECTED | Teenage Mutant Ninja Turtles Arcade: Wrath Of The Mutants (census ID 2739) |
| 2893 | Professional Farmer American Dream | UNCERTAIN_NEEDS_REVIEW |  |
| 2899 | PowerWash Simulator | UNCERTAIN_NEEDS_REVIEW |  |
| 2908 | Tony Stewart's All American Racing | COLLECTION_OR_MULTI_GAME_PACK |  |
| 2910 | Blood Bowl 3: Brutal Edition | UNCERTAIN_NEEDS_REVIEW |  |
| 2912 | MudRunner | SAME_GAME_SUSPECTED | Spintires: Mudrunner - American Wilds Edition (census ID 1119) |
| 2914 | Fishing Sim World: Pro Tour | UNCERTAIN_NEEDS_REVIEW |  |
| 2918 | Monster High Skulltimate Secrets | UNCERTAIN_NEEDS_REVIEW |  |
| 2951 | Blue Reflection: Second Light | UNCERTAIN_NEEDS_REVIEW |  |
| 2956 | My Riding Stables: Life with Horses | UNCERTAIN_NEEDS_REVIEW |  |
| 2957 | Cobra Kai 2 Dojos Rising | UNCERTAIN_NEEDS_REVIEW |  |
| 2958 | Fishing Sim World: Bass Pro Shops Edition | UNCERTAIN_NEEDS_REVIEW | Fishing Sim World: Pro Tour (batch 03 ID 2914, not yet in census) |
| 2962 | Observer: System Redux | SAME_GAME_SUSPECTED | Observer (census ID 858) |
| 2970 | Fast and Furious: Spy Racers Rise of SH1FT3R | UNCERTAIN_NEEDS_REVIEW |  |
| 2974 | Train Life: A Railway Simulator The Orient-Express Edition | UNCERTAIN_NEEDS_REVIEW |  |
| 2976 | Rapala Fishing Pro Series | UNCERTAIN_NEEDS_REVIEW |  |
| 2984 | Little Witch Nobeta | UNCERTAIN_NEEDS_REVIEW |  |
| 3005 | void tRrLM2(); //Void Terrarium 2 | SAME_GAME_SUSPECTED | Void Terrarium 2 (census ID 2757) |
| 3009 | Zengeon | UNCERTAIN_NEEDS_REVIEW |  |
| 3014 | Transport Fever 2 | UNCERTAIN_NEEDS_REVIEW |  |
| 3033 | Crisis Core: Final Fantasy VII Reunion | UNCERTAIN_NEEDS_REVIEW |  |
| 3040 | Pure Hold 'Em World Poker Championship | UNCERTAIN_NEEDS_REVIEW | World Poker Championship (census ID 1451) |
| 3045 | Farm Together | UNCERTAIN_NEEDS_REVIEW |  |
| 3054 | Shadow Warrior 3 | UNCERTAIN_NEEDS_REVIEW |  |
| 3070 | Flashback 2 | UNCERTAIN_NEEDS_REVIEW |  |
| 3074 | Starsand | UNCERTAIN_NEEDS_REVIEW |  |

## 5. Catalog rows reconciled by rule (no action unless the rules change)

- Annual or serialized sports: 97 + 30 listings (Madden, FIFA, NBA 2K, MLB The Show, NHL, WWE 2K, F1, MXGP, RBI Baseball, PES, Tour de France ...).
- PSVR-required: 35 listings plus Job Simulator, Rick and Morty: Virtual Rick-ality, Ghost Giant, Golem, The Walking Dead: Saints & Sinners Ch. 2, The Walking Dead Onslaught, The Wizards: Enhanced Edition, Pixel Gear, Accounting+.
- Not standalone PS4 game listings: 9 (controller, Switch listings, Chapter One season-pass discs, Disney Infinity game-only).
- Editions / reprints of existing identities: 127 plus the remaining hand-checked LIKELY_NAME_VARIANT rows (Limited Run reprints, Director's Cut, GOTY and similar).

## 6. Covers

- Lone Survivor: The Director's Cut (1662): the curated retroplace.com cover has an expired SSL certificate; it now shows a synthetic fallback. A replacement real front is needed.
- 268 identities display SYNTHETIC covers. Ten of them use reviewed `asis` overrides of real PriceCharting box renders that failed the straight-front gate on framing only (`audit-out/synthetic-cover-sources.json`).

## 7. Punch list (paused, not started)

- Run the IGDB cover fetch on main for the 35 Batch 06 identities, then retry PriceCharting cover recovery to upgrade synthetic covers to real GOOD fronts (both paused at Josh's request).
- `dossier-factory.mjs` still builds its queue from base data only; switch it to `tools/lib/runtime-census.mjs` before its next use.
- Compilation Cover Recovery workflow fails on `workflow_dispatch` with zero jobs (push events work); investigate.
- `search-initialism-test.mjs` has stale hard-coded guardrail counts (fails identically on main).
- 74 older identities still have pending prices (pre-dates this work), plus RayStorm and RayCrisis (priced through their compilation product).
- Batch 01-05 review queue (49) and Batch 06 review (5) need curator decisions (sections 3-4).
