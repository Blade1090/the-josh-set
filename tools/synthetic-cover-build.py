#!/usr/bin/env python3
"""Build SYNTHETIC (reconstructed) PS4 covers for identities with no usable real cover.

SYNTHETIC is a separate, clearly marked tier: it never touches the real-cover audit
(qualityState GOOD/REVIEW/WATCH/FALLBACK is computed exactly as before) and is only shown
by the runtime when an identity has no GOOD/FALLBACK real cover.

Targets: every REVIEW or WATCH row in audit-out/cover-visual-audit.json.
Source per target (first that exists):
  1. audit-out/synthetic-cover-sources.json override {id: {source, kind, crop?, skip?, note}}
  2. the IGDB cover/key art in covers-manifest.js (upscaled t_1080p variant)
  3. the row's current art URL
Output: covers/ps4-synthetic/<id>.jpg + covers/ps4-synthetic/manifest.json (provenance).

Deterministic: same inputs -> byte-identical layout (no randomness; fixed fonts/sizes).
Usage: python tools/synthetic-cover-build.py [--only id,id] [--force]
"""
import io, json, os, re, sys, urllib.request
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 480, 600
HEADER_ASSET = 'covers/_assets/ps4-header.png'   # real PS4 retail header (see covers/_assets/SOURCES.json)
OUT_DIR = 'covers/ps4-synthetic'
MANIFEST = f'{OUT_DIR}/manifest.json'
SOURCES = 'audit-out/synthetic-cover-sources.json'
UA = 'ShelfCheck-ArtAudit/1.8'
TOOL_VERSION = 2

def font(size):
    for f in ('arialbd.ttf', 'Arial Bold.ttf', 'DejaVuSans-Bold.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'):
        try: return ImageFont.truetype(f, size)
        except OSError: pass
    return ImageFont.load_default()

def fetch(url):
    if not re.match(r'https?://', url):
        return Image.open(url).convert('RGB')
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=25) as r:
        return Image.open(io.BytesIO(r.read(12_000_000))).convert('RGB')

def igdb_hi(url):
    return re.sub(r'/t_[a-z0-9_]+/', '/t_1080p/', url) if url and 'images.igdb.com' in url else url

_HEADER = None
def header():
    """The real PS4 header scaled to the cover width at its true height/width proportion."""
    global _HEADER
    if _HEADER is None:
        h = Image.open(HEADER_ASSET).convert('RGB')
        _HEADER = h.resize((W, round(W * h.height / h.width)), Image.LANCZOS)
    return _HEADER

def banner(img):
    img.paste(header(), (0, 0))

def trim(img, tol=28):
    """Remove uniform padding (same colour as the top-left pixel)."""
    from PIL import ImageChops
    bg = Image.new('RGB', img.size, img.getpixel((0, 0)))
    bb = ImageChops.difference(img, bg).convert('L').point(lambda p: 255 if p > tol else 0).getbbox()
    return img.crop(bb) if bb else img

def frac_crop(img, f):
    """Crop by fractions [left, top, right, bottom] of the image size (e.g. to cut a render's spine)."""
    w, h = img.size
    return img.crop((round(f[0] * w), round(f[1] * h), round(f[2] * w), round(f[3] * h)))

def energy_profile(img, axis):
    """Edge energy per row (axis=0) or column (axis=1): titles/logos/subjects are high-energy."""
    g = img.convert('L').filter(ImageFilter.FIND_EDGES)
    w, h = g.size; px = g.load()
    if axis == 0: return [sum(px[x, y] for x in range(0, w, 2)) for y in range(h)]
    return [sum(px[x, y] for y in range(0, h, 2)) for x in range(w)]

def best_window(profile, size):
    """Offset of the window of `size` keeping the most energy. Energy in the outer 18% at each
    end counts 3x: titles/logos sit at the top or bottom (left/right for wide art), so the crop
    comes out of whichever end carries less of them."""
    n = len(profile)
    if size >= n: return 0
    band = max(1, round(n * 0.18))
    weighted = [v * (3 if (i < band or i >= n - band) else 1) for i, v in enumerate(profile)]
    pre = [0]
    for v in weighted: pre.append(pre[-1] + v)
    mid = (n - size) / 2; best, off = None, 0
    for o in range(n - size + 1):
        score = (pre[o + size] - pre[o]) * (1 - 0.15 * abs(o - mid) / max(1, mid))
        if best is None or score > best: best, off = score, o
    return off

END_CROP = 0.06    # max share of the art that may be cropped from one end, and only from a quiet end
QUIET = 0.4        # an end is "quiet" (croppable) if its outer 10% band has < 0.4x the mean edge energy

def quiet_ends(prof):
    n = len(prof); band = max(1, round(n * 0.10)); mean = sum(prof) / n or 1
    lead = sum(prof[:band]) / band; tail = sum(prof[-band:]) / band
    return lead < QUIET * mean, tail < QUIET * mean

def fill(art, area_w, area_h):
    """Full-bleed art for the printable front area, title-safe.
    The art is never cropped at an end that carries detail (titles/logos/subjects touch the
    edges of most key art). Excess is cropped only from quiet ends, at most END_CROP each;
    whatever gap remains is covered by the same art, zoomed and blurred full-bleed behind, with
    the sharp art feathered into it so there are no dead bands or hard poster edges."""
    ratio = art.width / art.height; tall = ratio < area_w / area_h
    long_ = art.height if tall else art.width
    prof = energy_profile(art, 0 if tall else 1)
    q_lead, q_tail = quiet_ends(prof)
    # How much of the art's long axis would a full cover-crop remove?
    need = (1 - (area_h / area_w) * ratio) if tall else (1 - (area_w / area_h) / ratio)
    cut_lead = min(END_CROP if q_lead else 0, need / 2 if q_tail else need)
    cut_tail = min(END_CROP if q_tail else 0, need - cut_lead)
    keep0, keep1 = round(long_ * cut_lead), round(long_ * (1 - cut_tail))
    fg = art.crop((0, keep0, art.width, keep1)) if tall else art.crop((keep0, 0, keep1, art.height))
    # Scale the kept art to fill the long axis of the area exactly.
    s = (area_h / fg.height) if tall else (area_w / fg.width)
    fg = fg.resize((max(1, round(fg.width * s)), max(1, round(fg.height * s))), Image.LANCZOS)
    if (tall and fg.width >= area_w) or (not tall and fg.height >= area_h):
        x, y = (fg.width - area_w) // 2, (fg.height - area_h) // 2
        return fg.crop((x, y, x + area_w, y + area_h))
    # Background: same art, cover-scaled, blurred; then sharp art feathered in.
    sb = max(area_w / art.width, area_h / art.height) * 1.08
    bg = art.resize((max(1, round(art.width * sb)), max(1, round(art.height * sb))), Image.LANCZOS)
    bx, by = (bg.width - area_w) // 2, (bg.height - area_h) // 2
    # Wide art zooms a lot to fill a tall area; blur harder so zoomed-in text never reads as a stray fragment.
    out = bg.crop((bx, by, bx + area_w, by + area_h)).filter(ImageFilter.GaussianBlur(10 if tall else 22))
    out = Image.blend(out, Image.new('RGB', out.size, (0, 0, 0)), 0.12)
    mask = Image.new('L', fg.size, 255); md = ImageDraw.Draw(mask)
    gap = (area_w - fg.width) // 2 if tall else (area_h - fg.height) // 2
    f = max(10, min(round(gap * 1.4), round((fg.width if tall else fg.height) * 0.12)))
    for i in range(f):
        a = round(255 * (i / f) ** 1.5)
        if tall: md.line([(i, 0), (i, fg.height)], fill=a); md.line([(fg.width - 1 - i, 0), (fg.width - 1 - i, fg.height)], fill=a)
        else: md.line([(0, i), (fg.width, i)], fill=a); md.line([(0, fg.height - 1 - i), (fg.width, fg.height - 1 - i)], fill=a)
    out.paste(fg, ((area_w - fg.width) // 2, (area_h - fg.height) // 2), mask)
    return out

def own_header_rows(img):
    """Height of an existing blue PS4 header band at the top of a cover image (0 if none).
    Measured like the header asset: first run of rows >=50% PS4-blue, ended by a row <30%."""
    import colorsys
    w, h = img.size; step = max(1, w // 120); xs = range(0, w, step)
    def blue(p):
        r, g, b = p; hh, ss, vv = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255); d = hh * 360
        return 185 <= d <= 225 and ss >= 0.45 and vv >= 0.30 and b > g * 0.95 and b > r * 1.2
    px = img.load(); start = None
    for y in range(int(h * 0.22)):
        cov = sum(blue(px[x, y]) for x in xs) / len(xs)
        if start is None and cov >= 0.5: start = y
        elif start is not None and cov < 0.3: return y + max(2, round(h * 0.004))
    return 0

def cover_crop(img, w, h):
    """Exact-ratio centre cover crop (for art that is already a whole cover)."""
    s = max(w / img.width, h / img.height)
    r = img.resize((max(1, round(img.width * s)), max(1, round(img.height * s))), Image.LANCZOS)
    x, y = (r.width - w) // 2, (r.height - h) // 2
    return r.crop((x, y, x + w, y + h))

def title_card(title):
    """Typographic cover for identities with no safe art at all."""
    HB = header().height
    canvas = Image.new('RGB', (W, H), (16, 22, 34)); d = ImageDraw.Draw(canvas)
    for y in range(HB, H):
        t = (y - HB) / (H - HB); d.line([(0, y), (W, y)], fill=(round(16 + 20 * t), round(22 + 26 * t), round(34 + 44 * t)))
    words, lines, cur = title.split(), [], ''
    f = font(40)
    for w in words:
        test = (cur + ' ' + w).strip()
        if d.textlength(test, font=f) > W - 70 and cur: lines.append(cur); cur = w
        else: cur = test
    lines.append(cur)
    y0 = HB + (H - HB) // 2 - len(lines) * 26
    for k, ln in enumerate(lines): d.text((W // 2, y0 + k * 52), ln, font=f, fill=(235, 240, 248), anchor='mm')
    banner(canvas)
    return canvas

def compose(art, crop=None, mode='banner', title=''):
    if mode == 'title': return title_card(title)
    if mode == 'asis':
        # Image already is a whole PS4 cover with its own header (render/packshot/flat front):
        # trim padding, optional spine crop, then cut off its own header band so every
        # synthetic cover carries the same real header asset, composed like the rest.
        art = trim(art)
        if crop: art = frac_crop(art, crop)
        art = art.crop((0, own_header_rows(art), art.width, art.height))
        crop = None
    if crop: art = frac_crop(trim(art), crop)
    hb = header().height
    canvas = Image.new('RGB', (W, H))
    canvas.paste(fill(art, W, H - hb), (0, hb))
    banner(canvas)
    return canvas

def main():
    only = set()
    if '--only' in sys.argv: only = {int(x) for x in sys.argv[sys.argv.index('--only') + 1].split(',')}
    force = '--force' in sys.argv
    audit = json.load(open('audit-out/cover-visual-audit.json', encoding='utf-8'))
    manifest_js = open('covers-manifest.js', encoding='utf-8').read()
    base = json.loads(re.search(r'window\.SHELFCHECK_COVERS=(\{.*?\});', manifest_js, re.S).group(1))
    overrides = json.load(open(SOURCES, encoding='utf-8')).get('overrides', {}) if os.path.exists(SOURCES) else {}
    cands = {}
    if os.path.exists('audit-out/synthetic-cover-candidates.json'):
        cands = {c['id']: c for c in json.load(open('audit-out/synthetic-cover-candidates.json', encoding='utf-8'))['candidates']}
    os.makedirs(OUT_DIR, exist_ok=True)
    man = json.load(open(MANIFEST, encoding='utf-8')) if os.path.exists(MANIFEST) else {'covers': {}}
    targets = [r for r in audit['rows'] if r['qualityState'] in ('REVIEW', 'WATCH')]
    built = skipped = failed = 0
    for r in targets:
        i = r['id']
        if only and i not in only: continue
        ov = overrides.get(str(i), {})
        if ov.get('skip'):
            man['covers'].pop(str(i), None); skipped += 1; continue
        if str(i) in man['covers'] and not force and not only and os.path.exists(f'{OUT_DIR}/{i}.jpg'): continue
        if ov.get('mode') == 'title': src, kind = None, 'typographic_title'
        elif ov.get('source'): src, kind = ov['source'], ov.get('kind', 'curated')
        elif base.get(str(i)): src, kind = igdb_hi(base[str(i)]), 'igdb_cover_art'
        elif r.get('url'): src, kind = r['url'], 'current_art'
        else:
            print('no source', i, r['title']); failed += 1; continue
        try:
            img = compose(fetch(src) if ov.get('mode') != 'title' else None, ov.get('crop'), ov.get('mode', 'banner'), r['title'])
        except Exception as e:
            if kind == 'igdb_cover_art' and r.get('url') and r['url'] != src:
                try: src, kind = r['url'], 'current_art'; img = compose(fetch(src), ov.get('crop'))
                except Exception as e2: print('fail', i, r['title'], e2); failed += 1; continue
            else: print('fail', i, r['title'], e); failed += 1; continue
        img.save(f'{OUT_DIR}/{i}.jpg', quality=86, optimize=True)
        c = cands.get(i, {})
        man['covers'][str(i)] = {'title': r['title'], 'url': f'{OUT_DIR}/{i}.jpg', 'source': src, 'sourceKind': kind,
                                 'mode': ov.get('mode', 'banner'), 'realCoverState': r['qualityState'], 'realCoverReason': r['reasonCode'],
                                 'holdoutCategory': c.get('category'), 'why': c.get('whyNoRealCover'),
                                 'note': ov.get('note'), 'toolVersion': TOOL_VERSION}
        built += 1
    # An identity that gained a GOOD/FALLBACK real cover no longer gets a synthetic one.
    live = {str(r['id']) for r in targets}
    for k in [k for k in man['covers'] if k not in live]:
        man['covers'].pop(k)
        if os.path.exists(f'{OUT_DIR}/{k}.jpg'): os.remove(f'{OUT_DIR}/{k}.jpg')
        print('pruned', k)
    man.update({'tier': 'SYNTHETIC', 'note': 'Reconstructed PS4-style covers for identities with no verified real physical front. Never counted as GOOD; shown only when no GOOD/FALLBACK real cover exists.', 'count': len(man['covers'])})
    man['covers'] = dict(sorted(man['covers'].items(), key=lambda kv: int(kv[0])))
    json.dump(man, open(MANIFEST, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    print(json.dumps({'targets': len(targets), 'built': built, 'skipped': skipped, 'failed': failed, 'manifest': man['count']}))

if __name__ == '__main__':
    main()
