#!/usr/bin/env python3
"""Build a private-input NES/Famicom ownership baseline from a GameEye CSV.

Usage:
  python tools/nes-gameye-baseline.py /path/to/gameeye.csv [output_dir]

The raw export is never copied into the repository. Outputs contain only the
NES/Famicom game rows needed for local reconciliation plus an aggregate summary.
"""

from __future__ import annotations

import csv
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path


def norm(value: str) -> str:
    value = (value or "").strip().lower()
    value = value.replace("’", "'").replace("‘", "'").replace("&", "and")
    value = re.sub(r"[^a-z0-9]+", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def main() -> int:
    if len(sys.argv) < 2:
        print("usage: nes-gameye-baseline.py GAMEYE.csv [output_dir]", file=sys.stderr)
        return 2

    source = Path(sys.argv[1])
    out_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("audit-out/nes")
    out_dir.mkdir(parents=True, exist_ok=True)

    with source.open("r", encoding="utf-8-sig", newline="") as fh:
        rows = list(csv.DictReader(fh))

    nes_rows = [r for r in rows if (r.get("Platform") or "").strip() == "NES/Famicom"]
    game_rows = [r for r in nes_rows if (r.get("Category") or "").strip() == "Games"]
    physical = [r for r in game_rows if (r.get("ReleaseType") or "").strip() != "Digital"]

    grouped = defaultdict(list)
    for row in physical:
        grouped[norm(row.get("Title", ""))].append(row)

    countries = Counter((r.get("Country") or "Missing").strip() or "Missing" for r in game_rows)
    release_types = Counter((r.get("ReleaseType") or "Missing").strip() or "Missing" for r in game_rows)
    duplicate_groups = {k: v for k, v in grouped.items() if len(v) > 1}

    summary = {
        "sourceRows": len(rows),
        "nesFamicomRows": len(nes_rows),
        "gameRows": len(game_rows),
        "physicalGameRows": len(physical),
        "uniqueNormalizedPhysicalTitles": len(grouped),
        "duplicatePhysicalRows": sum(len(v) for v in duplicate_groups.values()),
        "duplicateTitleGroups": len(duplicate_groups),
        "countries": dict(countries),
        "releaseTypes": dict(release_types),
        "scopeNote": "Ownership baseline only. This is not the canonical North American NES census or completion denominator.",
    }

    (out_dir / "gameye-baseline-summary.json").write_text(
        json.dumps(summary, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )

    fields = ["normalizedTitle", "Title", "Country", "ReleaseType", "Ownership", "copies"]
    with (out_dir / "gameye-ownership-candidates.csv").open("w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=fields)
        writer.writeheader()
        for key in sorted(grouped):
            entries = grouped[key]
            representative = entries[0]
            writer.writerow({
                "normalizedTitle": key,
                "Title": representative.get("Title", ""),
                "Country": representative.get("Country", ""),
                "ReleaseType": representative.get("ReleaseType", ""),
                "Ownership": " | ".join(sorted({(x.get("Ownership") or "").strip() for x in entries if x.get("Ownership")})),
                "copies": len(entries),
            })

    print(json.dumps(summary, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
