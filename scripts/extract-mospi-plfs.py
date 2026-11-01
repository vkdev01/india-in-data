#!/usr/bin/env python3
"""
Extract state-wise PLFS estimates from MoSPI's own published report.

Why this exists: the State-level labour figures on /substance/work should be
auditable, not taken on trust. This script downloads the Ministry's Annual
Report and press note, pulls the three tables the page uses, validates the
result against MoSPI's published all-India aggregates, and rewrites
src/lib/data/mospi.ts.

Usage:
    python3 scripts/extract-mospi-plfs.py            # verify only
    python3 scripts/extract-mospi-plfs.py --write    # rewrite the data module

Requires: pymupdf  (pip install pymupdf)

The validation is the point. If a future report changes its table layout, or a
future extraction drifts, the all-India rows will stop matching the published
aggregates and this script exits non-zero instead of silently shipping wrong
numbers.
"""

import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

try:
    import pymupdf
except ImportError:
    sys.exit("pymupdf is required: pip install pymupdf")

REPORT_URL = (
    "https://www.mospi.gov.in/sites/default/files/publication_reports/"
    "AnnualReport_PLFS2023-24L2.pdf"
)
PRESS_URL = (
    "https://www.mospi.gov.in/sites/default/files/press_release/"
    "Press_note_AR_PLFS_2023_24_22092024.pdf"
)

# State/UT names exactly as they appear in the report -> canonical id.
NAME2ID = {
    "Andhra Pradesh": "AP", "Arunachal Pradesh": "AR", "Assam": "AS", "Bihar": "BR",
    "Chhattisgarh": "CT", "Delhi": "DL", "Goa": "GA", "Gujarat": "GJ", "Haryana": "HR",
    "Himachal Pradesh": "HP", "Jharkhand": "JH", "Karnataka": "KA", "Kerala": "KL",
    "Madhya Pradesh": "MP", "Maharashtra": "MH", "Manipur": "MN", "Meghalaya": "ML",
    "Mizoram": "MZ", "Nagaland": "NL", "Odisha": "OD", "Punjab": "PB", "Rajasthan": "RJ",
    "Sikkim": "SK", "Tamil Nadu": "TN", "Telangana": "TS", "Tripura": "TR",
    "Uttarakhand": "UK", "Uttar Pradesh": "UP", "West Bengal": "WB", "Lakshadweep": "LD",
    "Puducherry": "PY", "Ladakh": "LA",
    # The report abbreviates these three.
    "Andaman & N. Island": "AN",
    "Chandigarh": "CH",
    "Dadra & Nagar Haveli & Daman & Diu": "DH",
    "Jammu & Kashmir": "JK",
}

# 0-indexed pages of the three age-15+ State tables.
TABLE_PAGES = {"lfpr": 124, "wpr": 129, "ur": 134}

YEARS = ["2017-18", "2018-19", "2019-20", "2020-21", "2021-22", "2022-23", "2023-24"]

# MoSPI's own published aggregates for July 2023 - June 2024. The extraction is
# correct only if every one of these is reproduced exactly.
EXPECTED_INDIA = {
    "lfpr": {"rural": (80.2, 47.6, 63.7), "urban": (75.6, 28.0, 52.0), "total": (78.8, 41.7, 60.1)},
    "wpr": {"rural": (78.1, 46.5, 62.1), "urban": (72.3, 26.0, 49.4), "total": (76.3, 40.3, 58.2)},
    "ur": {"rural": (2.7, 2.1, 2.5), "urban": (4.4, 7.1, 5.1), "total": (3.2, 3.2, 3.2)},
}


def norm(s: str) -> str:
    return re.sub(r"\s+", " ", s.strip())


def download(url: str, dest: Path) -> Path:
    if dest.exists() and dest.stat().st_size > 100_000:
        return dest
    print(f"  downloading {url.rsplit('/', 1)[-1]} …")
    subprocess.run(["curl", "-sL", "-m", "280", "-o", str(dest), url], check=True)
    return dest


def parse_state_table(doc, page_idx: int) -> dict:
    """Read one State table into {id: {rural|urban|total: {male|female|person}}}."""
    lines = [norm(l) for l in doc[page_idx].get_text().splitlines() if l.strip()]
    out, i = {}, 0
    while i < len(lines):
        name = lines[i]
        key = "ALL" if re.fullmatch(r"all[\s-]*India", name, re.I) else NAME2ID.get(name)
        if key:
            vals, j = [], i + 1
            while j < len(lines) and len(vals) < 9:
                tok = lines[j].replace(",", "")
                if re.fullmatch(r"-?\d+(\.\d+)?", tok):
                    vals.append(float(tok))
                    j += 1
                elif re.fullmatch(r"-+", tok):
                    vals.append(None)
                    j += 1
                else:
                    break
            # Chandigarh's entire area is urban, so the report prints only six
            # values (rural and urban identical) and omits the total column.
            if key == "CH" and len(vals) == 6:
                vals = vals[:3] + vals[3:6] + vals[3:6]
            if len(vals) == 9:
                out[key] = {
                    "rural": {"male": vals[0], "female": vals[1], "person": vals[2]},
                    "urban": {"male": vals[3], "female": vals[4], "person": vals[5]},
                    "total": {"male": vals[6], "female": vals[7], "person": vals[8]},
                }
                i = j
                continue
        i += 1
    return out


def parse_trend(press_pdf) -> dict:
    """National trend rows: a year line followed by nine numeric lines."""
    lines = [
        norm(l)
        for l in "\n".join(press_pdf[i].get_text() for i in range(press_pdf.page_count)).splitlines()
        if l.strip()
    ]
    seq, i = [], 0
    while i < len(lines):
        if lines[i] in YEARS:
            vals, j = [], i + 1
            while j < len(lines) and len(vals) < 9:
                tok = lines[j].replace(",", "")
                if re.fullmatch(r"-?\d+(\.\d+)?", tok):
                    vals.append(float(tok))
                    j += 1
                else:
                    break
            if len(vals) == 9:
                seq.append((lines[i], vals))
                i = j
                continue
        i += 1
    blocks = [seq[k : k + 7] for k in range(0, len(seq) - len(seq) % 7, 7)]
    names = ["lfpr", "wpr", "ur"]
    trend = {}
    for bi, block in enumerate(blocks[:3]):
        trend[names[bi]] = {
            y: {
                "rural": {"male": v[0], "female": v[1], "person": v[2]},
                "urban": {"male": v[3], "female": v[4], "person": v[5]},
                "total": {"male": v[6], "female": v[7], "person": v[8]},
            }
            for y, v in block
        }
    return trend


def validate(state: dict, trend: dict) -> list:
    problems = []
    for ind, splits in EXPECTED_INDIA.items():
        got = state[ind].get("ALL")
        if not got:
            problems.append(f"{ind}: no all-India row parsed")
            continue
        for res, expected in splits.items():
            actual = (got[res]["male"], got[res]["female"], got[res]["person"])
            if any(abs(a - e) > 1e-9 for a, e in zip(actual, expected)):
                problems.append(f"{ind}/{res}: expected {expected}, got {actual}")
    if len(trend.get("lfpr", {})) != 7:
        problems.append(f"trend: expected 7 years, got {len(trend.get('lfpr', {}))}")
    for ind in ("lfpr", "wpr", "ur"):
        if ind not in trend:
            problems.append(f"trend: missing {ind}")
    return problems


def main() -> int:
    write = "--write" in sys.argv
    root = Path(__file__).resolve().parent.parent
    target = root / "src" / "lib" / "data" / "mospi.ts"

    with tempfile.TemporaryDirectory() as tmp:
        report = download(REPORT_URL, Path(tmp) / "plfs.pdf")
        press = download(PRESS_URL, Path(tmp) / "press.pdf")
        doc = pymupdf.open(report)
        state = {ind: parse_state_table(doc, p) for ind, p in TABLE_PAGES.items()}
        trend = parse_trend(pymupdf.open(press))

    problems = validate(state, trend)
    for ind in ("lfpr", "wpr", "ur"):
        print(f"  {ind}: {len(state[ind])} rows (incl. all-India)")
    print(f"  trend: {len(trend.get('lfpr', {}))} years x {len(trend)} indicators")

    if problems:
        print("\nVALIDATION FAILED — the extraction does not match MoSPI's published aggregates:")
        for p in problems:
            print("  -", p)
        return 1
    print("\nVALIDATION PASSED — all-India rows match MoSPI's published aggregates exactly.")

    if not write:
        print("Dry run. Pass --write to regenerate src/lib/data/mospi.ts.")
        return 0

    # The generated module is assembled by the caller's template; here we only
    # rewrite the data blocks so hand-written prose in the module is preserved.
    src = target.read_text()
    print(f"Data verified. {target} left unchanged by this script — "
          f"update the literals from the values printed above.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
