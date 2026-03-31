import pandas as pd
import numpy as np
import pgeocode
from scipy.spatial import cKDTree
from pathlib import Path
import warnings

warnings.filterwarnings("ignore")

INPUT_FILE = Path(__file__).resolve().parent.parent / "water_hardness_ph" / "water_quality_by_zip.csv"
DISTANCE_THRESHOLD = 50.0 

def load_data():
    if not Path(INPUT_FILE).exists():
        print(f"Error: {INPUT_FILE} not found.")
        return None
    df = pd.read_csv(INPUT_FILE, dtype={"zip_code": str})
    df["zip_code"] = df["zip_code"].str.zfill(5)
    return df

def get_water_report():
    df = load_data()
    if df is None: return

    # Search pool: ONLY ZIPs with both pH and Hardness
    search_pool = df.dropna(subset=["ph_avg", "hardness_ppm_avg"], how='any').copy()
    
    if search_pool.empty:
        print("Error: No ZIP codes found with complete (pH + Hardness) data.")
        return

    print("Initializing proximity engine...")
    nomi = pgeocode.Nominatim('us')
    zip_info = nomi._data[['postal_code', 'latitude', 'longitude']].dropna()
    zip_info['postal_code'] = zip_info['postal_code'].astype(str).str.zfill(5)
    
    search_df = search_pool.merge(zip_info, left_on="zip_code", right_on="postal_code")
    tree = cKDTree(np.radians(search_df[['latitude', 'longitude']].values))

    print(f"\n{'='*50}")
    print("         SOAP BANDIT: SMART WATER LOOKUP")
    print(f"{'='*50}")
    # Fixed the space error here:
    print(f"Index loaded: {len(search_df):,} ZIP codes with complete data.")

    while True:
        target_zip = input("\nEnter a 5-digit ZIP code (or 'q' to quit): ").strip()
        if target_zip.lower() == 'q': break
        if len(target_zip) != 5 or not target_zip.isdigit():
            print("Invalid input. Please enter 5 digits.")
            continue

        exact_match = search_df[search_df["zip_code"] == target_zip]

        if not exact_match.empty:
            print_report(exact_match.iloc[0], is_exact=True)
        else:
            target_geo = nomi.query_postal_code(target_zip)
            if pd.isna(target_geo.latitude):
                print(f"ZIP code {target_zip} not found in US database.")
                continue
            
            dist, idx = tree.query(np.radians([target_geo.latitude, target_geo.longitude]), k=1)
            closest_match = search_df.iloc[idx]
            miles = dist * 3958.8 

            print(f"\n[!] No complete local data for {target_zip}.")
            print(f"[i] Using nearest complete profile: {closest_match['zip_code']} ({miles:.1f} miles away).")
            
            if miles > DISTANCE_THRESHOLD:
                print(f"⚠️  WARNING: Data is {miles:.1f} miles away. Accuracy may vary.")
            
            print_report(closest_match, is_exact=False)

def print_report(row, is_exact):
    label = "LOCAL DATA" if is_exact else f"PROXIMITY DATA ({row['zip_code']})"
    ppm = row['hardness_ppm_avg']
    gpg = ppm / 17.1  # Standard conversion to Grains per Gallon
    
    print(f"\n--- WATER REPORT: {row['city']}, {row['state']} ---")
    print(f"Match Type:  {label}")
    print(f"pH Level:    {row['ph_avg']:.2f}")
    print(f"Hardness:    {ppm:.1f} ppm ({gpg:.1f} gpg)")
    
    if gpg < 3.5:
        cat = "Soft"
    elif gpg < 7.0:
        cat= "Moderately Hard"
    elif gpg < 10.5:
        cat = "Hard"
    else:
        cat = "Very Hard"

    print(f"Category:    {cat}")
    print(f"Sample Year: {int(row['sample_year'])}")
    print("-" * 45)

if __name__ == "__main__":
    get_water_report()
    