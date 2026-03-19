"""
download_wqp_v2.py
Downloads pH AND Hardness for all US states.
Shows clear progress. Resumes where it left off.
Run: python download_wqp_v2.py
"""

import requests
import time
import pandas as pd
from pathlib import Path

BASE_DIR  = Path("wqp_downloads")
PH_DIR    = BASE_DIR / "ph_states"
HARD_DIR  = BASE_DIR / "hardness_states"
for d in [PH_DIR, HARD_DIR]:
    d.mkdir(parents=True, exist_ok=True)

STATES = {
    "01":"Alabama","02":"Alaska","04":"Arizona","05":"Arkansas","06":"California",
    "08":"Colorado","09":"Connecticut","10":"Delaware","12":"Florida","13":"Georgia",
    "15":"Hawaii","16":"Idaho","17":"Illinois","18":"Indiana","19":"Iowa",
    "20":"Kansas","21":"Kentucky","22":"Louisiana","23":"Maine","24":"Maryland",
    "25":"Massachusetts","26":"Michigan","27":"Minnesota","28":"Mississippi",
    "29":"Missouri","30":"Montana","31":"Nebraska","32":"Nevada","33":"New Hampshire",
    "34":"New Jersey","35":"New Mexico","36":"New York","37":"North Carolina",
    "38":"North Dakota","39":"Ohio","40":"Oklahoma","41":"Oregon","42":"Pennsylvania",
    "44":"Rhode Island","45":"South Carolina","46":"South Dakota","47":"Tennessee",
    "48":"Texas","49":"Utah","50":"Vermont","51":"Virginia","53":"Washington",
    "54":"West Virginia","55":"Wisconsin","56":"Wyoming","72":"Puerto Rico"
}

BASE_URL = "https://www.waterqualitydata.us/data/Result/search"

def download_one(characteristic, fips, state_name, out_dir):
    safe_name = state_name.replace(" ", "_")
    out_file  = out_dir / f"{fips}_{safe_name}.csv"

    if out_file.exists() and out_file.stat().st_size > 200:
        rows = sum(1 for _ in open(out_file)) - 1
        print(f"  ✓ {state_name} already done ({rows:,} rows)")
        return True

    params = {
        "characteristicName": characteristic,
        "statecode": f"US:{fips}",
        "mimeType":  "csv",
        "zip":       "no",
        "startDateLo": "01-01-2020",   # request only 2020+ from server
    }

    for attempt in range(4):
        try:
            print(f"  Downloading {state_name}...", end=" ", flush=True)
            r = requests.get(BASE_URL, params=params, timeout=300, stream=True)

            if r.status_code == 200:
                with open(out_file, "wb") as f:
                    for chunk in r.iter_content(65536):
                        f.write(chunk)
                size_kb = out_file.stat().st_size // 1024
                rows    = sum(1 for _ in open(out_file, errors="ignore")) - 1
                print(f"✓  {rows:,} rows  ({size_kb:,} KB)")
                time.sleep(1.0)
                return True

            elif r.status_code == 204:
                print(f"✓  No data")
                out_file.write_text("empty\n")
                return True

            else:
                print(f"✗ HTTP {r.status_code} (attempt {attempt+1}/4)")
                time.sleep(6)

        except Exception as e:
            print(f"✗ {e} (attempt {attempt+1}/4)")
            time.sleep(10)

    print(f"  ✗ FAILED — skipping {state_name}")
    return False


def merge_all(src_dir, out_csv):
    files = [f for f in src_dir.glob("*.csv")
             if f.stat().st_size > 200 and f.read_text(errors="ignore")[:5] != "empty"]
    if not files:
        print(f"  No files to merge in {src_dir}")
        return
    dfs = []
    for f in files:
        try:
            dfs.append(pd.read_csv(f, low_memory=False, dtype=str))
        except Exception as e:
            print(f"  Skipping {f.name}: {e}")
    merged = pd.concat(dfs, ignore_index=True)
    merged.to_csv(out_csv, index=False)
    print(f"  ✅ Merged {len(merged):,} rows → {out_csv}")


total  = len(STATES)

# ── pH ────────────────────────────────────────────────────────────────────────
print(f"\n{'='*60}")
print(f"DOWNLOADING pH  (50 states, 2020+)")
print(f"{'='*60}")
for i, (fips, name) in enumerate(STATES.items(), 1):
    print(f"[{i:02d}/{total}]", end=" ")
    download_one("pH", fips, name, PH_DIR)

# ── Hardness ──────────────────────────────────────────────────────────────────
print(f"\n{'='*60}")
print(f"DOWNLOADING Hardness  (50 states, 2020+)")
print(f"{'='*60}")
for i, (fips, name) in enumerate(STATES.items(), 1):
    print(f"[{i:02d}/{total}]", end=" ")
    download_one("Hardness", fips, name, HARD_DIR)

# ── Merge ─────────────────────────────────────────────────────────────────────
print(f"\n{'='*60}")
print("MERGING")
print(f"{'='*60}")
merge_all(PH_DIR,   BASE_DIR / "ph_all_states.csv")
merge_all(HARD_DIR, BASE_DIR / "hardness_all_states.csv")

print("\n✅ All done! Now run: python build_zip_water_quality.py")