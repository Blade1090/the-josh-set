# Synthetic cover tier: resume card

- Branch , worktree , from main . Do not merge automatically.
- Progress and batches: .
- Build: {"targets": 210, "built": 115, "skipped": 0, "failed": 0, "manifest": 210}. Targets are every REVIEW/WATCH row. Sources come from IGDB art in covers-manifest.js unless  overrides them (modes: banner | asis | title).
- Audit: {
  "included": 2409,
  "counts": {
    "CURATED_ID": 4,
    "CURATED_TITLE": 146,
    "GAMEYE": 935,
    "LAUNCHBOX_BOX_FRONT": 688,
    "LEGACY_IGDB": 178,
    "PRICECHARTING_BOX_FRONT": 411,
    "PRODUCT_BOX_FRONT": 47
  }
}
audited 100/2409 with 16 workers
audited 200/2409 with 16 workers
audited 300/2409 with 16 workers
audited 400/2409 with 16 workers
audited 500/2409 with 16 workers
audited 600/2409 with 16 workers
audited 700/2409 with 16 workers
audited 800/2409 with 16 workers
audited 900/2409 with 16 workers
audited 1000/2409 with 16 workers
audited 1100/2409 with 16 workers
audited 1200/2409 with 16 workers
audited 1300/2409 with 16 workers
audited 1400/2409 with 16 workers
audited 1500/2409 with 16 workers
audited 1600/2409 with 16 workers
audited 1700/2409 with 16 workers
audited 1800/2409 with 16 workers
audited 1900/2409 with 16 workers
audited 2000/2409 with 16 workers
audited 2100/2409 with 16 workers
audited 2200/2409 with 16 workers
audited 2300/2409 with 16 workers
audited 2400/2409 with 16 workers
audited 2409/2409 with 16 workers
{
  "generatedAt": "2026-09-29T13:29:59.395Z",
  "included": 2409,
  "good": 2191,
  "fallback": 8,
  "review": 196,
  "watch": 14,
  "physicalVerify": 192,
  "physicalLikely": 1400,
  "physicalConfirmed": 817,
  "manualConfirmedBad": 0,
  "manualFallback": 8,
  "manualEligibility": 0,
  "manualFixedTracked": 91,
  "reviewByReason": {
    "key_art_only": 178,
    "missing_ps4_banner": 18
  },
  "watchByReason": {
    "image_fetch_failed": 14
  },
  "synthetic": 210,
  "displayTiers": {
    "GOOD": 2191,
    "FALLBACK": 8,
    "SYNTHETIC": 210,
    "BLANK": 0
  },
  "syntheticByRealState": {
    "REVIEW": 196,
    "WATCH": 14
  },
  "syntheticIgnoredRealCover": [],
  "syntheticMissingFile": []
}. It reports  and  separately; real counts are unchanged.
- Gate:  must print SUBSET_OK. It also fails if synthetic art ever displays over a real GOOD/FALLBACK cover.
- Runtime:  returns {url, tier}. Cards and detail are painted by applyShell; Random pre-warm, Should I Buy, Shelf Roulette and My Shelf call the resolver.
