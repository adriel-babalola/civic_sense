#!/usr/bin/env python3
"""
Normalise the research photo pack into web-ready assets.

Run after adding images to ../../research/photo-pack:
    python3 scripts/process-photo-pack.py

WHAT THIS FIXES IN THE PACK AS DELIVERED
-------------------------------------
The pack was assembled by image search and saved by hand, so it has three
problems that all break a bundler:

  1. EXTENSIONS LIE. Six files named `.png` are actually WebP
     (`Rauf-Aregbesola.png`, `seyi makinde.png`, `abbas.png`, `umo.png`,
     `mala buni.png`, `Femi-Gbajabiamila.png`), and one is `.jpeg` not `.jpg`.
     A `*.jpg` glob picks up none of them.

  2. ONE FILE IS NOT AN IMAGE. `cliboy.png` is a saved Bing results page:
     804KB of HTML with the filename of a portrait. Served as a photo it is a
     broken image at best. It is reported and skipped, not converted.

  3. THE FILES ARE ENORMOUS FOR WHAT THEY DISPLAY. A profile avatar renders at
     44-64px. Three of these are 2-3MB, which is ~8MB of photographs on a site
     whose own reasoning about assets is that a Nigerian reader is often on a
     poor connection. Everything is re-encoded to a 512px square JPEG, which is
     roughly 40KB and still sharp at 2x for the largest size rendered.

All three are handled by trusting the file's actual content over its name.

THE VERTICAL CROP IS BIASED UPWARD ON PURPOSE
---------------------------------------------
Every one of these is a head-and-shoulders portrait, and a plain centre crop of
a portrait reliably slices the top of the head off. The vertical window is
anchored a third of the way down the excess rather than in the middle, which
keeps the face in frame for this framing while still producing a square.

It is a heuristic, not a face detector. It is good enough because the input set
is uniform: official portraits, all roughly waist-or-shoulders up.

OUTPUT
------
  src/assets/politicians/pack-<slug>.jpg   normalised,512x512, progressive
  research/photo-pack/manifest.json          what was found, and what failed

Assets are prefixed `pack-` on purpose. The eight hand-curated photographs in
that directory came from Wikimedia Commons with their licences verified; the
pack ones did not. Keeping the prefixes apart means a glance at the assets
folder says which is which, and it stops a pack image from quietly shadowing a
properly licensed original that already exists for the same person.
"""

import json
import re
import sys
from pathlib import Path

from PIL import Image, UnidentifiedImageError

ROOT = Path(__file__).resolve().parents[2]
PACK_DIR = ROOT / "research" / "photo-pack"
OUT_DIR = ROOT / "website" / "src" / "assets" / "politicians"
MANIFEST = PACK_DIR / "manifest.json"

SIZE = 512
# Below this a "portrait" is an image-search thumbnail rather than a usable
# photograph. Not rejected, because they render fine at avatar size; downgraded.
MIN_EDGE = 200


def slugify(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def square_crop(img: Image.Image, target: int) -> Image.Image:
    """Centre horizontally, biased upward vertically, then resize to `target`."""
    w, h = img.size
    edge = min(w, h)

    x = (w - edge) // 2
    # Anchor 35% into the vertical slack. Centre-cropping a portrait cuts the
    # head off; this keeps it.
    y = int((h - edge) * 0.35)
    return img.crop((x, y, x + edge, y + edge)).resize(
        (target, target), Image.LANCZOS
    )


def process(person_dir: Path) -> dict:
    """Normalise one folder. Returns a manifest record."""
    folder = person_dir.name
    pack_name = re.sub(r"^\d+\s*-\s*", "", folder)

    images = [p for p in person_dir.iterdir() if p.name != "SOURCE_AND_RIGHTS.txt"]
    if len(images) != 1:
        return {
            "folder": folder,
            "packName": pack_name,
            "ok": False,
            "reason": f"expected 1 image, found {len(images)}",
        }

    src = images[0]
    out_name = f"pack-{slugify(pack_name)}.jpg"

    try:
        img = Image.open(src)
        img.load()
    except (UnidentifiedImageError, OSError) as exc:
        # This is the cliboy.png case: PIL refuses it because it is HTML, which
        # is the correct outcome. Recorded so the gap is visible rather than
        # being a missing file someone notices in six months.
        head = src.read_bytes()[:120].decode("utf-8", "replace").lstrip()
        return {
            "folder": folder,
            "packName": pack_name,
            "sourceImage": src.name,
            "ok": False,
            "reason": "not an image file",
            "detail": f"{type(exc).__name__}; leading bytes: {head[:60]!r}",
        }

    original = img.size
    fmt = img.format

    # Three of these are 132x180 image-search thumbnails. Upscaling them to 512
    # would invent detail that is not there and produce a soft, smeared face, so
    # they are emitted at native square size instead and flagged. They still
    # render correctly at the 44-64px the avatar and credits thumbnails use; they
    # would look soft full-width, which is why `lowResolution` is recorded rather
    # than left for someone to discover.
    low_res = min(original) < MIN_EDGE
    target = min(SIZE, min(original))

    # Flatten transparency onto the navy the site sits on. Several of these are
    # RGBA PNGs; compositing on white would leave a white box on a dark page.
    if img.mode in ("RGBA", "LA", "P"):
        img = img.convert("RGBA")
        backdrop = Image.new("RGB", img.size, (13, 20, 38))
        backdrop.paste(img, mask=img.split()[-1])
        img = backdrop
    else:
        img = img.convert("RGB")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = OUT_DIR / out_name
    square_crop(img, target).save(
        out_path, "JPEG", quality=82, optimize=True, progressive=True
    )

    return {
        "folder": folder,
        "packName": pack_name,
        "sourceImage": src.name,
        "ok": True,
        "output": f"pack-{slugify(pack_name)}",
        "originalFormat": fmt,
        "originalSize": f"{original[0]}x{original[1]}",
        "sourceBytes": src.stat().st_size,
        "outputBytes": out_path.stat().st_size,
        "outputSize": f"{target}x{target}",
        "modified": original != (target, target) or fmt != "JPEG",
        "lowResolution": low_res,
    }


def main() -> int:
    if not PACK_DIR.is_dir():
        print(f"no pack at {PACK_DIR}", file=sys.stderr)
        return 1

    records = [process(d) for d in sorted(PACK_DIR.iterdir()) if d.is_dir()]
    records.sort(key=lambda r: int(r["folder"][:2]))

    MANIFEST.write_text(json.dumps(records, indent=2) + "\n")

    ok = [r for r in records if r["ok"]]
    bad = [r for r in records if not r["ok"]]

    before = sum(r.get("sourceBytes", 0) for r in ok)
    after = sum(r.get("outputBytes", 0) for r in ok)

    print(f"processed {len(records)} folders")
    print(f"  written: {len(ok)}")
    print(f"  skipped: {len(bad)}")
    for r in bad:
        print(f"    - {r['packName']}: {r['reason']}")
        if r.get("detail"):
            print(f"      {r['detail']}")
    low = [r for r in ok if r.get("lowResolution")]
    if low:
        print(f"  low resolution (kept at native size): {len(low)}")
        for r in low:
            print(f"    - {r['packName']}: {r['originalSize']} -> {r['outputSize']}")
    print(f"  {before/1024/1024:.1f} MB -> {after/1024/1024:.1f} MB")
    print(f"  manifest: {MANIFEST}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())