# Shelf Check Cover Art Standard

## Goal
Shelf Check should show the image Josh would expect to see when hunting a real physical PS4 game on a shelf. Having *an* image is not enough; the default should be the cleanest believable representation of the actual physical release.

## Approval order
1. **GOOD — clean shelf cover**
   - Straight-on front of the actual PS4 physical case/cover.
   - Correct PS4 banner/platform presentation.
   - Correct game, region, and edition when known.
   - Readable, uncropped, and free of distracting backgrounds, watermarks, or promo framing.
2. **FALLBACK — usable but not final**
   - Clearly the correct physical PS4 product, but only a product shot/mockup/slightly imperfect image is available.
   - May be used temporarily while a clean front is hunted down.
3. **REVIEW — do not present as approved shelf art**
   - Key art, poster art, digital-store tile, logo-only art, blurry thumbnail, angled glamour shot, photographed case on a table/shelf, wrong platform, wrong edition, severe crop, fan/custom art, or missing cover.
   - In production, known REVIEW art should fall back to `COVER NEEDED` rather than knowingly displaying bad art.

## Physical-release sanity check
Cover QA doubles as a physical-release check. If we cannot find convincing physical-package evidence, the identity must be reviewed rather than silently accepted as physical.

### Strong physical evidence
- Clean front-facing PS4 package art exists.
- Multiple reputable sources show the same physical package.
- Publisher/retailer/collector database explicitly documents the physical release.

### Warning signs
- Only PlayStation Store/key art exists.
- Only generic promotional art exists.
- Only mockups are discoverable.
- No believable PS4 package image can be found.
- Region/edition cannot be reconciled to the identity.

A warning sign does **not** automatically prove a game is digital-only. It means Shelf Check must verify the physical release before treating the identity as settled.

## Machine-readable review reasons
Use these reason codes in audit output where possible:

- `missing_cover`
- `digital_store_art`
- `key_art_only`
- `missing_ps4_banner`
- `angled_product_shot`
- `photo_of_case`
- `blurry_or_low_res`
- `cropped_or_incomplete`
- `wrong_platform`
- `wrong_region_or_edition`
- `mockup_or_promo`
- `physical_release_unverified`
- `image_fetch_failed`
- `manual_review`

## Shelf test
A cover is final when the answer to all of these is yes:

1. Would this look normal in a GameStop bin or collector's shelf?
2. Does it clearly represent a PS4 physical release?
3. Is it front-facing and recognizable at a glance?
4. Does it match the identity/edition being tracked?
5. Would Josh trust this image while hunting?

If not, it remains FALLBACK or REVIEW.
