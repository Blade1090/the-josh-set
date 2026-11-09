# GameStop discovery integration: status

Generated 2026-11-09 on branch `finish/gamestop-integration`. Numbers come from the committed audit files named in each section.

## Census

| | Before (main e1ab731) | After |
|---|---|---|
| INCLUDED identities (runtime) | 2,420 | 2,626 |
| Added INCLUDED from GameStop research | | 206 |
| Duplicate identities introduced | | 0 |

Source: `census-gamestop-nov-v001.js`. Only `CONFIRMED_PHYSICAL_PS4_DISC` rows from `audit-out/ALL_BATCHES_01-05_completed.csv` were added, under their reserved IDs (2803-3077). Existing titles win, EXCLUDED is never overridden, and ambiguous titles or occupied IDs are refused. 15 titles were normalised to the official name, with the research title kept as an alias.

No GameStop identity was excluded: there is no blanket horse-game rule, so the four horse titles (2894, 2971, 3016, 3041) are INCLUDED like the rest.

## Research candidates not added (curator review)

`audit-out/gamestop-discovery-review-queue.json`: 49 rows.

- **UNCERTAIN_NEEDS_REVIEW**: 42
- **COLLECTION_OR_MULTI_GAME_PACK**: 2
- **SAME_GAME_SUSPECTED**: 5

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

## Full GameStop catalog reconciliation

`audit-out/gamestop-catalog-reconciliation.json` classifies all 1,902 listings.

| Class | Listings |
|---|---|
| Exact match, census INCLUDED | 1302 |
| Exact match, census EXCLUDED | 60 |
| Exact match, multi-game product | 3 |
| Research review queue | 53 |
| Name variant of census INCLUDED | 127 |
| Name variant of census EXCLUDED | 21 |
| Name variant of multi-game product | 1 |
| Annual sports rule | 97 |
| PSVR rule | 35 |
| Unresolved: LIKELY_NAME_VARIANT_OF_EXISTING | 78 |
| Unresolved: NOT_IN_CENSUS_NEEDS_PHYSICAL_RESEARCH | 59 |
| Unresolved: COMPILATION_NEEDS_PRODUCT_MAPPING | 21 |
| Unresolved: NOT_A_STANDALONE_PS4_GAME_LISTING | 9 |
| Unresolved: ANNUAL_OR_SERIALIZED_SPORTS_RULE | 30 |
| Unresolved: PSVR_OR_HORSE_RULE_CHECK | 6 |

The 59 `NOT_IN_CENSUS_NEEDS_PHYSICAL_RESEARCH` rows are an upper bound (a few are spelling variants the matcher could not prove) and are the input for a Batch 06 research pass. None were added without physical-release evidence.

## Dossiers

Live dossier audit (`tools/dossier-coverage-audit.mjs`): 2626 usable of 2626 INCLUDED; missing 0, thin 0, generic 0.

`dossier-overrides-85.js` adds 219 dossiers (206 GameStop identities plus 13 earlier additions without one). They were written from the Batch 01-05 physical evidence instead of the OpenAI factory, which has no web search and whose model knowledge predates many 2023-2025 titles. Every entry passes the `dossier-generate.mjs` validate() rules and `dossiers.js` dossierQuality(). No OpenAI credits were used.

## Pricing

Runtime price audit (`tools/price-runtime-audit.mjs`): priced 2523 / pending 76 / no reliable data 32 (95.9%). Before: priced 2,307 / pending 288 (87.82%).

`price-batch-009-v090.js`: 216 verified PriceCharting PS4 / PAL PS4 CIB prices (fill-only).

New identities still pending (2):

- 2792 RayStorm: only PS4 physical is the RayStorm x RayCrisis HD Collection; priced through the compilation product model, not per identity.
- 2793 RayCrisis: only PS4 physical is the RayStorm x RayCrisis HD Collection; priced through the compilation product model, not per identity.

74 older pending identities predate this work.

## Covers

Runtime cover gate (`audit-out/cover-runtime-qa.json`): GOOD 2357, FALLBACK 8, REVIEW 244, WATCH 13. Review reasons: missing_cover 54, key_art_only 172, missing_ps4_banner 18. Display tiers: GOOD 2357, FALLBACK 8, SYNTHETIC 202, BLANK 55.

After census integration and before recovery: GOOD 2,183, missing 211. Recovery sources: LaunchBox box fronts, PriceCharting box fronts, PriceCharting vetted edition aliases (19 targets added from price batch 009 product names), and compilation recovery.

New identities still without a real cover (54): mostly PriceCharting images rejected by the straight-front PS4 banner gate. They need the IGDB pass (run on main after merge; see below) and then the synthetic tier.

2842 Cabela's African Adventures; 2827 Call of Duty: Black Ops 7; 3053 Death or Treat; 2790 Diablo IV; 3062 Disco Elysium: The Final Cut; 2913 ELEX II; 2878 Exoprimal; 2850 Five Nights at Freddy's: Help Wanted; 2941 Five Nights at Freddy's: Into the Pit; 2909 Ghostbusters: Spirits Unleashed; 2964 Gloomhaven: Mercenaries Edition; 2822 Gran Turismo 7; 2835 Hitman 3; 2823 Jurassic World Evolution 2; 3019 Kukoos: Lost Pets; 2830 LEGO 2K Drive; 3077 Let's Build a Zoo; 2972 Life in Willowdale: Farm Adventures; 2960 Loop8: Summer of Gods; 3018 Maglam Lord; 2988 Matchbox Driving Adventures; 3010 MechWarrior 5: Mercenaries; 2930 Mercenaries Rebirth: Call of the Wild Lynx; 2973 Metal Tales: Overkill; 3013 Minecraft Legends; 2985 Miss Kobayashi's Dragon Maid: Burst Forth!! Choro-gon Breath; 2996 MONARK; 2994 Monster Harvest; 3004 Moving Out 2; 2840 MX vs. ATV Legends; 2987 My Little Pony: A Maretime Bay Adventure; 3012 My Little Pony: A Zephyr Heights Mystery; 2947 Nick Jr. Party Adventure; 2954 Override 2: Super Mech League; 3068 Oxenfree; 2860 Police Simulator: Patrol Officers; 2997 Reel Fishing: Road Trip Adventure; 2991 Ryan's Rescue Squad; 2983 Severed Steel; 2998 Slaycation Paradise; 2949 Smile For Me; 2901 Sniper Elite 5; 3017 Speed 3 Grand Prix; 2924 Star Ocean: The Second Story R; 2944 Star Trek Prodigy: Supernova; 3071 Star Trek: Resurgence; 2950 Story of Seasons: Pioneers of Olive Town; 2902 Stubbs the Zombie in Rebel Without a Pulse; 3037 The Eternal Cylinder; 2804 The Grinch: Christmas Adventures; 2836 The Texas Chain Saw Massacre; 3027 Tin and Kuna; 3022 Winter Games 2023; 2848 World of Outlaws: Dirt Racing

## Tooling fixes

- `tools/fetch-covers.mjs`, `tools/dossier-coverage-audit.mjs`, `tools/price-runtime-audit.mjs`: replaced stale hand-maintained census and layer lists with lists derived from index.html via `tools/lib/runtime-census.mjs`. All three were blind to every identity added since omission pass v003.
- `.github/workflows/fetch-covers.yml`: commits to the dispatching branch instead of resetting to and pushing main.
- `.github/workflows/pages.yml`: only auto-deploys after cover-manifest runs on main. Previously a branch run would publish that branch's SHA.

Not changed: `tools/dossier-factory.mjs` still builds its queue from base data only (no mutators), so it cannot see mutation-added identities. Coverage is complete, so it was not needed this pass.

## Workflow runs (branch)

| Run | Workflow | Result |
|---|---|---|
| [42663255471](https://github.com/Blade1090/the-josh-set/actions/runs/42663255471) | Price Gap Audit | success |
| [42663253967](https://github.com/Blade1090/the-josh-set/actions/runs/42663253967) | ShelfCheck Cover Visual Audit | success |
| [42664228586](https://github.com/Blade1090/the-josh-set/actions/runs/42664228586) | ShelfCheck LaunchBox Cover Recovery | success |
| [42665466914](https://github.com/Blade1090/the-josh-set/actions/runs/42665466914) | Price Gap Audit | success |
| [42665468284](https://github.com/Blade1090/the-josh-set/actions/runs/42665468284) | ShelfCheck PriceCharting Cover Recovery | success |
| [42667169269](https://github.com/Blade1090/the-josh-set/actions/runs/42667169269) | ShelfCheck PriceCharting Alias Cover Recovery | success |
| [42667243714](https://github.com/Blade1090/the-josh-set/actions/runs/42667243714) | Ownership Audit | success |
| [42669731215](https://github.com/Blade1090/the-josh-set/actions/runs/42669731215) | ShelfCheck Vetted Edition Cover Recovery | success |
| [42670238163](https://github.com/Blade1090/the-josh-set/actions/runs/42670238163) | ShelfCheck PriceCharting Cover Recovery | success |
| [42671773788](https://github.com/Blade1090/the-josh-set/actions/runs/42671773788) | ShelfCheck Compilation PriceCharting Cover Recovery | failure |
| [42672067748](https://github.com/Blade1090/the-josh-set/actions/runs/42672067748) | ShelfCheck Compilation PriceCharting Cover Recovery | failure |
| [42674132846](https://github.com/Blade1090/the-josh-set/actions/runs/42674132846) | ShelfCheck Compilation PriceCharting Cover Recovery | success |

Compilation PriceCharting Cover Recovery failed twice on workflow_dispatch with zero jobs allocated (it has only ever succeeded on push events). The same script was run locally and its output committed instead.

## Known pre-existing issues

- `tools/search-initialism-test.mjs` fails identically on untouched main (hard-coded guardrail counts).
- The PriceCharting cover workflow reports 57-68 fetch errors per CI run (PriceCharting throttling of CI). Local runs do not see this.
