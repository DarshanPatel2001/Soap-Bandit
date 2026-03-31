"""
build_zip_water_quality.py (v4)
================================
Output columns per ZIP code:
  zip_code, city, state,
  ph_reading_1, ph_reading_2, ph_avg,
  hardness_ppm_avg  (average of up to 5 most recent readings, decimal ppm)
  sample_year
"""

import pandas as pd
import numpy as np
from pathlib import Path
from scipy.spatial import cKDTree
import pgeocode
import warnings
warnings.filterwarnings("ignore")

MIN_YEAR     = 2014
MAX_HARDNESS = 1500
MIN_HARDNESS = 0
MAX_PH       = 14
MIN_PH       = 0
TOP_N        = 5   # average of up to this many most recent hardness readings per station

PH_FILE      = Path("wqp_downloads/ph_all_states.csv")
HARD_FILE    = Path("wqp_downloads/hardness_nwis.csv")
STATION_FILE = Path("wqp_downloads/stations.csv")
OUTPUT_FILE  = Path("water_quality_by_zip.csv")

def load_results(filepath, characteristic, value_min, value_max):
    print(f"\n{'='*60}")
    print(f"Loading {characteristic} from {filepath}...")
    cols_needed = [
        "MonitoringLocationIdentifier","ActivityStartDate",
        "ResultMeasureValue","ResultStatusIdentifier",
        "StatisticalBaseCode","ActivityMediaName",
    ]
    df = pd.read_csv(filepath, low_memory=False,
                     usecols=lambda c: c in cols_needed, dtype=str)
    print(f"  Raw rows: {len(df):,}")
    df["ActivityStartDate"] = pd.to_datetime(df["ActivityStartDate"], errors="coerce")
    df["year"] = df["ActivityStartDate"].dt.year
    df = df[df["year"] >= MIN_YEAR]
    print(f"  After {MIN_YEAR}+ filter: {len(df):,}")
    if "ActivityMediaName" in df.columns:
        df = df[df["ActivityMediaName"].str.lower().isin(["water","groundwater"]) | df["ActivityMediaName"].isna()]
    if "ResultStatusIdentifier" in df.columns:
        df = df[df["ResultStatusIdentifier"].str.lower().isin(["final","accepted"]) | df["ResultStatusIdentifier"].isna()]
    if "StatisticalBaseCode" in df.columns:
        df = df[~df["StatisticalBaseCode"].str.lower().isin(["minimum","maximum","mode","median"]) | df["StatisticalBaseCode"].isna()]
    df["value"] = pd.to_numeric(df["ResultMeasureValue"], errors="coerce")
    df = df[df["value"].notna() & df["value"].between(value_min, value_max)]
    print(f"  After quality filters: {len(df):,}")
    return df[["MonitoringLocationIdentifier","ActivityStartDate","year","value"]]

def load_stations():
    print(f"\n{'='*60}")
    print(f"Loading stations from {STATION_FILE}...")
    cols = ["MonitoringLocationIdentifier","LatitudeMeasure","LongitudeMeasure"]
    df = pd.read_csv(STATION_FILE, low_memory=False,
                     usecols=lambda c: c in cols, dtype=str)
    df["lat"] = pd.to_numeric(df["LatitudeMeasure"], errors="coerce")
    df["lon"] = pd.to_numeric(df["LongitudeMeasure"], errors="coerce")
    df = df.dropna(subset=["lat","lon"]).drop_duplicates("MonitoringLocationIdentifier").reset_index(drop=True)
    print(f"  Stations loaded: {len(df):,}")
    return df

def latlon_to_zip(station_df):
    print("\nReverse geocoding lat/lon -> ZIP codes...")
    nomi   = pgeocode.Nominatim("us")
    zip_db = nomi._data[["postal_code","place_name","state_code","latitude","longitude"]].dropna().copy().reset_index(drop=True)
    zip_db["postal_code"] = zip_db["postal_code"].astype(str).str.zfill(5)
    tree = cKDTree(np.radians(zip_db[["latitude","longitude"]].values))
    mask = station_df["lat"].between(18,72) & station_df["lon"].between(-180,-65)
    us   = station_df[mask].copy().reset_index(drop=True)
    print(f"  US stations to geocode: {len(us):,}")
    _, idx = tree.query(np.radians(us[["lat","lon"]].values), k=1)
    us["zip_code"] = zip_db.loc[idx, "postal_code"].values
    us["city"]     = zip_db.loc[idx, "place_name"].values
    us["state"]    = zip_db.loc[idx, "state_code"].values
    print(f"  Unique ZIPs found: {us['zip_code'].nunique():,}")
    return us

def get_two_ph_readings(df):
    """Get 2 most recent pH readings per station."""
    df = df.sort_values(["MonitoringLocationIdentifier","ActivityStartDate"], ascending=[True,False]).copy()
    df["rank"] = df.groupby("MonitoringLocationIdentifier").cumcount() + 1
    r1 = df[df["rank"]==1][["MonitoringLocationIdentifier","value","year"]].rename(columns={"value":"ph_1","year":"year_1"})
    r2 = df[df["rank"]==2][["MonitoringLocationIdentifier","value"]].rename(columns={"value":"ph_2"})
    merged = r1.merge(r2, on="MonitoringLocationIdentifier", how="left")
    merged["ph_avg"] = merged[["ph_1","ph_2"]].mean(axis=1).round(2)
    return merged

def get_top5_hardness_avg(df):
    """Average of up to 5 most recent hardness readings per station."""
    df = df.sort_values(["MonitoringLocationIdentifier","ActivityStartDate"], ascending=[True,False]).copy()
    # Keep only the TOP_N most recent per station
    df["rank"] = df.groupby("MonitoringLocationIdentifier").cumcount() + 1
    df = df[df["rank"] <= TOP_N]
    # Average them
    avg = (df.groupby("MonitoringLocationIdentifier")
             .agg(hardness_ppm_avg=("value","mean"), year_1=("year","max"))
             .reset_index())
    avg["hardness_ppm_avg"] = avg["hardness_ppm_avg"].round(2)
    return avg

def aggregate_ph_to_zip(per_station_df):
    agg = per_station_df.groupby("zip_code").agg(
        ph_reading_1=("ph_1","first"),
        ph_reading_2=("ph_2","first"),
        ph_avg=("ph_avg","mean"),
        sample_year=("year_1","max"),
        city=("city","first"),
        state=("state","first"),
    ).reset_index()
    agg["ph_avg"] = agg["ph_avg"].round(2)
    return agg

def aggregate_hardness_to_zip(per_station_df):
    agg = per_station_df.groupby("zip_code").agg(
        hardness_ppm_avg=("hardness_ppm_avg","mean"),
        sample_year=("year_1","max"),
        city=("city","first"),
        state=("state","first"),
    ).reset_index()
    agg["hardness_ppm_avg"] = agg["hardness_ppm_avg"].round(2)
    return agg

def main():
    ph_df    = load_results(PH_FILE,   "pH",       MIN_PH,       MAX_PH)
    hard_df  = load_results(HARD_FILE, "Hardness", MIN_HARDNESS, MAX_HARDNESS)
    stations = load_stations()

    stations_zip = latlon_to_zip(stations)
    zip_cols     = ["MonitoringLocationIdentifier","zip_code","city","state"]

    ph_with_zip   = ph_df.merge(stations_zip[zip_cols+["lat","lon"]], on="MonitoringLocationIdentifier", how="inner")
    hard_with_zip = hard_df.merge(stations_zip[zip_cols+["lat","lon"]], on="MonitoringLocationIdentifier", how="inner")
    print(f"\n  pH readings matched to ZIP:       {len(ph_with_zip):,}")
    print(f"  Hardness readings matched to ZIP: {len(hard_with_zip):,}")

    # pH: 2 most recent per station
    ph_per_station = get_two_ph_readings(ph_with_zip)
    ph_per_station = ph_per_station.merge(stations_zip[zip_cols], on="MonitoringLocationIdentifier", how="left")

    # Hardness: average of up to 5 most recent per station
    hard_per_station = get_top5_hardness_avg(hard_with_zip)
    hard_per_station = hard_per_station.merge(stations_zip[zip_cols], on="MonitoringLocationIdentifier", how="left")

    print("\nAggregating to ZIP code level...")
    ph_zip   = aggregate_ph_to_zip(ph_per_station)
    hard_zip = aggregate_hardness_to_zip(hard_per_station)

    print(f"\n  Preview before merge:")
    print(f"    ZIP codes with pH data:       {len(ph_zip):,}")
    print(f"    ZIP codes with hardness data: {len(hard_zip):,}")
    print(f"    ZIP codes with BOTH:          {len(ph_zip.merge(hard_zip, on='zip_code')):,}")
    print(f"    ZIP codes with EITHER:        {len(set(ph_zip['zip_code']) | set(hard_zip['zip_code'])):,}")

    # Merge
    final = ph_zip.merge(hard_zip, on="zip_code", how="outer", suffixes=("_ph","_hard"))
    final["city"]        = final["city_ph"].combine_first(final["city_hard"])
    final["state"]       = final["state_ph"].combine_first(final["state_hard"])
    final["sample_year"] = final[["sample_year_ph","sample_year_hard"]].max(axis=1)

    for col in ["ph_reading_1","ph_reading_2","ph_avg"]:
        if col in final.columns:
            final[col] = pd.to_numeric(final[col], errors="coerce").round(2)

    out_cols = [
        "zip_code","city","state",
        "ph_reading_1","ph_reading_2","ph_avg",
        "hardness_ppm_avg",
        "sample_year"
    ]
    out_cols = [c for c in out_cols if c in final.columns]
    final = final[out_cols].sort_values("zip_code").reset_index(drop=True)
    final = final[final[["ph_avg","hardness_ppm_avg"]].notna().any(axis=1)]

    final.to_csv(OUTPUT_FILE, index=False)

    print(f"\n{'='*60}")
    print(f"DONE!")
    print(f"   Total ZIP codes in output:      {len(final):,}")
    print(f"   ZIP codes with pH:              {final['ph_avg'].notna().sum():,}")
    print(f"   ZIP codes with hardness (ppm):  {final['hardness_ppm_avg'].notna().sum():,}")
    print(f"   ZIP codes with BOTH:            {final[['ph_avg','hardness_ppm_avg']].notna().all(axis=1).sum():,}")
    print(f"   Output -> {OUTPUT_FILE}")
    print(f"\nSample:")
    print(final.head(10).to_string(index=False))

if __name__ == "__main__":
    main()