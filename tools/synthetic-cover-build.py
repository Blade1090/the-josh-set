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

W, H, BANNER = 480, 600, 56
OUT_DIR = 'covers/ps4-synthetic'
MANIFEST = f'{OUT_DIR}/manifest.json'
SOURCES = 'audit-out/synthetic-cover-sources.json'
UA = 'ShelfCheck-ArtAudit/1.8'
TOOL_VERSION = 1

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

def banner(img):
    d = ImageDraw.Draw(img)
    top, bot = (0, 55, 145), (0, 112, 209)            # PS4-style blue header gradient
    for y in range(BANNER):
        t = y / (BANNER - 1)
        d.line([(0, y), (W, y)], fill=tuple(round(top[i] + (bot[i] - top[i]) * t) for i in range(3)))
    d.line([(0, BANNER), (W, BANNER)], fill=(0, 30, 80), width=2)
    d.text((18, BANNER // 2), 'PS4', font=font(30), fill='white', anchor='lm')

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

def fill(art, area_w, area_h):
    """Art contained (uncropped) over a blurred, dimmed cover-fill of itself."""
    out = Image.new('RGB', (area_w, area_h), (12, 17, 24))
    s = max(area_w / art.width, area_h / art.height)
    bg = art.resize((max(1, round(art.width * s)), max(1, round(art.height * s))), Image.LANCZOS)
    bx, by = (bg.width - area_w) // 2, (bg.height - area_h) // 2
    bg = bg.crop((bx, by, bx + area_w, by + area_h)).filter(ImageFilter.GaussianBlur(18))
    out.paste(Image.blend(bg, Image.new('RGB', bg.size, (0, 0, 0)), 0.35), (0, 0))
    s = min(area_w / art.width, area_h / art.height)
    fg = art.resize((max(1, round(art.width * s)), max(1, round(art.height * s))), Image.LANCZOS)
    out.paste(fg, ((area_w - fg.width) // 2, (area_h - fg.height) // 2))
    return out

def title_card(title):
    """Typographic cover for identities with no safe art at all."""
    canvas = Image.new('RGB', (W, H), (16, 22, 34)); d = ImageDraw.Draw(canvas)
    for y in range(BANNER, H):
        t = (y - BANNER) / (H - BANNER); d.line([(0, y), (W, y)], fill=(round(16 + 20 * t), round(22 + 26 * t), round(34 + 44 * t)))
    words, lines, cur = title.split(), [], ''
    f = font(40)
    for w in words:
        test = (cur + ' ' + w).strip()
        if d.textlength(test, font=f) > W - 70 and cur: lines.append(cur); cur = w
        else: cur = test
    lines.append(cur)
    y0 = BANNER + (H - BANNER) // 2 - len(lines) * 26
    for k, ln in enumerate(lines): d.text((W // 2, y0 + k * 52), ln, font=f, fill=(235, 240, 248), anchor='mm')
    banner(canvas)
    return canvas

def compose(art, crop=None, mode='banner', title=''):
    if mode == 'title': return title_card(title)
    if mode == 'asis':
        art = trim(art)
        if crop: art = frac_crop(art, crop)
        return fill(art, W, H)
    if crop: art = frac_crop(trim(art), crop)
    area_w, area_h = W, H - BANNER
    canvas = Image.new('RGB', (W, H), (12, 17, 24))
    # Background: the same art scaled to cover the area, heavily blurred and dimmed.
    s = max(area_w / art.width, area_h / art.height)
    bg = art.resize((max(1, round(art.width * s)), max(1, round(art.height * s))), Image.LANCZOS)
    bx, by = (bg.width - area_w) // 2, (bg.height - area_h) // 2
    bg = bg.crop((bx, by, bx + area_w, by + area_h)).filter(ImageFilter.GaussianBlur(18))
    bg = Image.blend(bg, Image.new('RGB', bg.size, (0, 0, 0)), 0.35)
    canvas.paste(bg, (0, BANNER))
    # Foreground: the whole art, uncropped, contained in the area.
    s = min(area_w / art.width, area_h / art.height)
    fg = art.resize((max(1, round(art.width * s)), max(1, round(art.height * s))), Image.LANCZOS)
    canvas.paste(fg, ((area_w - fg.width) // 2, BANNER + (area_h - fg.height) // 2))
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
