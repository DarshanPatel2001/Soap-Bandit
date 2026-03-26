"""
download_stations.py (v3 - combined, working)
Downloads stations one characteristic at a time per state, merges all.
Run: python download_stations.py
"""

import requests
import pandas as pd
from pathlib import Path
import time

BASE_DIR    = Path("wqp_downloads")
BASE_DIR.mkdir(exist_ok=True)
OUTPUT_FILE = BASE_DIR / "stations.csv"
SAVE_DIR    = BASE_DIR / "station_states"
SAVE_DIR.mkdir(exist_ok=True)

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

# Download each characteristic separately (API rejects lists)
CHARACTERISTICS = [
    "pH",
    "Hardness",
    "Hardness, water",
    "Hardness, non-carbonate",
    "Hardness, carbonate",
    "Total hardness",
]

BASE_URL = "https://www.waterqualitydata.us/data/Station/search"

def download_one(fips, state_name, char_name):
    """Download stations for one state + one characteristic. Returns DataFrame or None."""
    safe_char = char_name.replace(" ", "_").replace(",", "")
    safe_state = state_name.replace(" ", "_")
    out = SAVE_DIR / f"{fips}_{safe_state}_{safe_char}.csv"

    if out.exists() and out.stat().st_size > 100:
        content = out.read_text(encoding="utf-8", errors="ignore").strip()
        if content == "empty":
            return None
        try:
            return pd.read_csv(out, low_memory=False, dtype=str)
        except:
            pass

    params = {
        "characteristicName": char_name,
        "statecode": f"US:{fips}",
        "mimeType": "csv",
        "zip": "no",
    }

    for attempt in range(3):
        try:
            r = requests.get(BASE_URL, params=params, timeout=180, stream=True)
            if r.status_code == 200:
                with open(out, "wb") as f:
                    for chunk in r.iter_content(65536):
                        f.write(chunk)
                try:
                    df = pd.read_csv(out, low_memory=False, dtype=str)
                    if len(df) > 0:
                        return df
                except:
                    pass
                out.write_text("empty\n")
                return None
            elif r.status_code == 204:
                out.write_text("empty\n")
                return None
            else:
                time.sleep(5)
        except Exception as e:
            time.sleep(8)
    return None

def download_state(fips, name):
    """Download all characteristics for one state, merge, save as single state file."""
    safe = name.replace(" ", "_")
    state_out = SAVE_DIR / f"{fips}_{safe}.csv"

    # Skip if already has merged state file
    if state_out.exists() and state_out.stat().st_size > 200:
        content = state_out.read_text(encoding="utf-8", errors="ignore").strip()
        if content != "empty":
            rows = content.count("\n")
            print(f"  ✓ {name} already done ({rows:,} stations)")
            return

    print(f"  {name}:", end=" ", flush=True)
    all_dfs = []
    for char in CHARACTERISTICS:
        df = download_one(fips, name, char)
        if df is not None:
            all_dfs.append(df)
            print(f"{len(df):,}", end=" ", flush=True)
        time.sleep(1.0)

    if all_dfs:
        merged = pd.concat(all_dfs, ignore_index=True).drop_duplicates("MonitoringLocationIdentifier")
        merged.to_csv(state_out, index=False)
        print(f"→ {len(merged):,} unique stations")
    else:
        state_out.write_text("empty\n")
        print("→ no data")

# ── Download all states ───────────────────────────────────────────────────────
total = len(STATES)
print(f"{'='*60}")
print(f"Downloading stations for {total} states (one characteristic at a time)...")
print(f"{'='*60}")

for i, (fips, name) in enumerate(STATES.items(), 1):
    print(f"[{i:02d}/{total}]", end=" ")
    download_state(fips, name)

# ── Final merge ───────────────────────────────────────────────────────────────
print(f"\n{'='*60}")
print("Merging all state files into stations.csv...")

files = [f for f in SAVE_DIR.glob("[0-9][0-9]_*.csv")
         if f.stat().st_size > 200
         and f.read_text(encoding="utf-8", errors="ignore").strip() != "empty"]

dfs = []
for f in sorted(files):
    try:
        df = pd.read_csv(f, low_memory=False, dtype=str)
        if len(df) > 0:
            dfs.append(df)
            print(f"  {f.name}: {len(df):,}")
    except Exception as e:
        print(f"  Skipping {f.name}: {e}")

merged = pd.concat(dfs, ignore_index=True).drop_duplicates("MonitoringLocationIdentifier")
merged.to_csv(OUTPUT_FILE, index=False)

print(f"\n✅ Done!")
print(f"   Total unique stations: {len(merged):,}")
print(f"   Saved to: {OUTPUT_FILE}")
print(f"\nNow run: python build_zip_water_quality.py")