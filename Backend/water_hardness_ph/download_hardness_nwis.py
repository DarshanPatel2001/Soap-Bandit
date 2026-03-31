"""
download_hardness_v2.py
=======================
Retries all states that returned 0 hardness rows.
Uses longer delays and better error handling.
Run: python download_hardness_v2.py
"""

import requests
import pandas as pd
from pathlib import Path
import time

BASE_DIR = Path("wqp_downloads")
TEMP_DIR = BASE_DIR / "hardness_nwis_states"
TEMP_DIR.mkdir(exist_ok=True)
OUT_FILE = BASE_DIR / "hardness_nwis.csv"

FIPS = {
    "AL":"01","AK":"02","AZ":"04","AR":"05","CA":"06","CO":"08","CT":"09",
    "DE":"10","FL":"12","GA":"13","HI":"15","ID":"16","IL":"17","IN":"18",
    "IA":"19","KS":"20","KY":"21","LA":"22","ME":"23","MD":"24","MA":"25",
    "MI":"26","MN":"27","MS":"28","MO":"29","MT":"30","NE":"31","NV":"32",
    "NH":"33","NJ":"34","NM":"35","NY":"36","NC":"37","ND":"38","OH":"39",
    "OK":"40","OR":"41","PA":"42","RI":"44","SC":"45","SD":"46","TN":"47",
    "TX":"48","UT":"49","VT":"50","VA":"51","WA":"53","WV":"54","WI":"55",
    "WY":"56","PR":"72"
}

HARDNESS_NAMES = [
    "Hardness, water",
    "Hardness, non-carbonate",
    "Hardness, carbonate",
    "Hardness",
    "Total hardness",
    "Hardness as CaCO3",
]

WQP_URL = "https://www.waterqualitydata.us/data/Result/search"

def download_one_characteristic(state_abbr, char_name, fips):
    """Download a single characteristic for a single state. Returns DataFrame or None."""
    params = {
        "characteristicName": char_name,
        "statecode":          f"US:{fips}",
        "startDateLo":        "01-01-2015",
        "mimeType":           "csv",
        "zip":                "no",
    }
    for attempt in range(3):
        try:
            r = requests.get(WQP_URL, params=params, timeout=180, stream=True)
            if r.status_code == 200:
                content = r.content
                if len(content) > 500:
                    # Parse directly from bytes
                    import io
                    df = pd.read_csv(io.BytesIO(content), low_memory=False, dtype=str)
                    if len(df) > 0:
                        return df
                return None
            elif r.status_code == 429:
                print(f"      Rate limited, waiting 30s...")
                time.sleep(30)
            elif r.status_code == 500:
                print(f"      Server error (500), waiting 15s...")
                time.sleep(15)
            else:
                time.sleep(5)
        except requests.exceptions.Timeout:
            print(f"      Timeout on attempt {attempt+1}, waiting 10s...")
            time.sleep(10)
        except Exception as e:
            print(f"      Error: {e}, waiting 10s...")
            time.sleep(10)
    return None

def download_state(state_abbr, force=False):
    fips    = FIPS[state_abbr]
    out     = TEMP_DIR / f"{state_abbr}_hardness.csv"

    # Skip if already has good data and not forcing
    if not force and out.exists() and out.stat().st_size > 200:
        try:
            content = out.read_text(encoding="utf-8", errors="ignore").strip()
            if content != "empty":
                rows = content.count("\n")
                if rows > 1:
                    print(f"  ✓ {state_abbr} already done ({rows:,} rows)")
                    return True
        except:
            pass

    print(f"  Downloading {state_abbr} (FIPS {fips})...")
    all_dfs = []

    for char_name in HARDNESS_NAMES:
        df = download_one_characteristic(state_abbr, char_name, fips)
        if df is not None:
            all_dfs.append(df)
            print(f"    ✓ '{char_name}': {len(df):,} rows")
        time.sleep(2)  # 2 second pause between each characteristic

    if all_dfs:
        merged = pd.concat(all_dfs, ignore_index=True)
        merged.to_csv(out, index=False)
        print(f"  → {state_abbr} total: {len(merged):,} rows")
        return True
    else:
        print(f"  - {state_abbr}: no data found")
        out.write_text("empty\n")
        return False

# ── Find which states need (re)downloading ────────────────────────────────────
all_states = sorted(FIPS.keys())
failed_states = []

for state in all_states:
    out = TEMP_DIR / f"{state}_hardness.csv"
    if not out.exists():
        failed_states.append(state)
        continue
    content = out.read_text(encoding="utf-8", errors="ignore").strip()
    if content == "empty":
        failed_states.append(state)

print(f"{'='*60}")
print(f"States needing download: {len(failed_states)}")
print(f"States: {', '.join(failed_states)}")
print(f"{'='*60}\n")

if not failed_states:
    print("All states already downloaded! Skipping to merge...")
else:
    total = len(failed_states)
    for i, state in enumerate(failed_states, 1):
        print(f"[{i:02d}/{total}]", end=" ")
        download_state(state)
        time.sleep(3)  # 3 second pause between states

# ── Merge all ──────────────────────────────────────────────────────────────────
print(f"\n{'='*60}")
print("Merging all state hardness files...")

files = [f for f in TEMP_DIR.glob("*_hardness.csv")
         if f.stat().st_size > 200]

dfs = []
state_counts = {}
for f in sorted(files):
    try:
        content = f.read_text(encoding="utf-8", errors="ignore").strip()
        if content == "empty":
            continue
        df = pd.read_csv(f, low_memory=False, dtype=str)
        if len(df) > 0:
            dfs.append(df)
            state_counts[f.stem] = len(df)
    except Exception as e:
        print(f"  Skipping {f.name}: {e}")

if dfs:
    merged = pd.concat(dfs, ignore_index=True)
    merged.to_csv(OUT_FILE, index=False)

    print(f"\nRows per state:")
    for state, count in sorted(state_counts.items()):
        print(f"  {state}: {count:,}")

    print(f"\n✅ Done!")
    print(f"   Total rows:   {len(merged):,}")
    print(f"   States with data: {len(state_counts)}/51")
    print(f"   Saved to: {OUT_FILE}")
    print(f"\nNext steps:")
    print(f"  1. Make sure HARD_FILE in build_zip_water_quality.py points to:")
    print(f'     HARD_FILE = Path("wqp_downloads/hardness_nwis.csv")')
    print(f"  2. Run: python build_zip_water_quality.py")
else:
    print("No hardness data to merge!")